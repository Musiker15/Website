---
title: "pgAdmin 4 — Setup Runbook"
description: "Installing pgAdmin 4 (web) behind Apache with HTTPS on Debian."
order: 7
tags: ["debian", "pgadmin", "postgres"]
---

# pgAdmin 4 — Setup Runbook

## DNS
Create an A record: `pgadmin.your-domain.com` → server IP.
Only after that does certificate issuance (Let's Encrypt) work.

## Install pgAdmin 4 (official APT repo)
```bash
curl -fsSL https://www.pgadmin.org/static/packages_pgadmin_org.pub | sudo gpg --dearmor -o /usr/share/keyrings/packages-pgadmin-org.gpg
sudo sh -c 'echo "deb [signed-by=/usr/share/keyrings/packages-pgadmin-org.gpg] https://ftp.postgresql.org/pub/pgadmin/pgadmin4/apt/$(lsb_release -cs) pgadmin4 main" > /etc/apt/sources.list.d/pgadmin4.list'

sudo apt update
sudo apt install -y pgadmin4-web        # web variant (mod_wsgi), NOT the desktop package
```

## Create the pgAdmin login + configure WSGI
```bash
sudo /usr/pgadmin4/bin/setup-web.sh
```
- Asks for **email + password** → pgAdmin login (choose a strong password).
- "Configure Apache? (y/n)" → **y**.

Disable the default mount `/pgadmin4` (on all vhosts) and use a dedicated subdomain instead:
```bash
sudo a2disconf pgadmin4
sudo a2enmod wsgi headers ssl rewrite
```

## Find the SSL certificate path
If a (wildcard) certificate for your domain already exists, you can reuse it —
otherwise issue one first via [Certbot](/en/docs/debian-tutorials/certbot). The easiest
way to find the paths in use is from an existing vhost:
```bash
sudo grep -Rns "SSLCertificate" /etc/apache2/sites-available/   # shows the .pem paths in use
# or:
sudo certbot certificates                                        # lists existing certs + paths
```
Typically: `/etc/letsencrypt/live/your-domain.com/fullchain.pem` + `…/privkey.pem`
(take the exact name from the output above).

## Apache vhost (HTTP→HTTPS redirect + HTTPS)
Upstream basic auth (defense in depth, in addition to pgAdmin's own login):
```bash
sudo htpasswd -c /etc/apache2/.pgadmin_htpasswd yourname
```

`/etc/apache2/sites-available/pgadmin.your-domain.com.conf`:
```apache
# HTTP → HTTPS
<VirtualHost *:80>
    ServerName pgadmin.your-domain.com
    Redirect permanent / https://pgadmin.your-domain.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName pgadmin.your-domain.com

    SSLEngine on
    # Take the paths from the "Find the SSL certificate path" section:
    SSLCertificateFile    /etc/letsencrypt/live/your-domain.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/your-domain.com/privkey.pem

    WSGIDaemonProcess pgadmin_db processes=1 threads=25 python-home=/usr/pgadmin4/venv
    WSGIScriptAlias / /usr/pgadmin4/web/pgAdmin4.wsgi
    WSGIPassAuthorization On

    <Directory /usr/pgadmin4/web/>
        WSGIProcessGroup pgadmin_db
        WSGIApplicationGroup %{GLOBAL}

        AuthType Basic
        AuthName "DB Admin"
        AuthUserFile /etc/apache2/.pgadmin_htpasswd
        Require valid-user
        # Optional, strongly recommended with a static IP:
        # Require ip 203.0.113.10
    </Directory>

    # Security headers — pgAdmin-compatible!
    # IMPORTANT: do NOT set Referrer-Policy to "no-referrer" — pgAdmin needs the
    # same-origin Referer for its CSRF/security check, otherwise the page stays blank.
    # nosniff + X-Frame-Options SAMEORIGIN, by contrast, are unproblematic.
    Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"

    ErrorLog  ${APACHE_LOG_DIR}/pgadmin_error.log
    CustomLog ${APACHE_LOG_DIR}/pgadmin_access.log combined
</VirtualHost>
```
```bash
sudo a2ensite pgadmin.your-domain.com
sudo apache2ctl configtest && sudo systemctl reload apache2
```

<Callout type="note">
Auto-renewal of the certificate keeps running through your existing mechanism
unchanged. On renewal Apache has to be reloaded — if that doesn't already happen
via a `deploy-hook`, make sure your renewal hook runs `systemctl reload apache2`.
</Callout>

## Create a dedicated DB admin role
A dedicated superuser for pgAdmin — do **not** use the application DB user.
```bash
sudo -u postgres psql
```
```sql
-- Case is only preserved with quotes → the role is named exactly "DbAdmin".
CREATE ROLE "DbAdmin" WITH LOGIN SUPERUSER PASSWORD 'YOUR_SECURE_PASSWORD';
\q
```

<Callout type="danger">
Set your own strong password here and **never publish it** (not in Git, not in
screenshots). Because this role has `SUPERUSER` privileges, a leaked password grants
full access to all databases.
</Callout>

- `SUPERUSER` = all privileges (view/edit all DBs, create roles/DBs, bypass all checks).
- **Important:** because the name was created in quotes it is **case-sensitive** —
  enter it in pgAdmin exactly as `DbAdmin`. (Alternatively, without quotes,
  `CREATE ROLE dbadmin …` → then always lowercase `dbadmin`.)
- Change the password later: `ALTER ROLE "DbAdmin" WITH PASSWORD 'new';`
- Less privileged (no full access): `… WITH LOGIN CREATEDB CREATEROLE PASSWORD '…';`
  (sees other DBs' **contents** only as owner/member → for "see everything" SUPERUSER is required).

## Connect the local Postgres server in pgAdmin
Log in at `https://pgadmin.your-domain.com` → **Add New Server**:
- **Host:** `127.0.0.1` · **Port:** `5432`
- **Username:** `DbAdmin` · **Password:** (from "Create a dedicated DB admin role")
- "Save password" only if you trust the pgAdmin master password (encrypted in pgAdmin's SQLite).

<Callout type="note">
pg_hba.conf: login via `127.0.0.1` with a password should work by default. On an
auth error: `sudo -u postgres psql -c "SHOW hba_file;"` → check that a line
`host … 127.0.0.1/32 scram-sha-256` exists, then `sudo systemctl reload postgresql`.
</Callout>

## Hardening
```bash
sudo tee /etc/fail2ban/jail.d/pgadmin.conf >/dev/null <<'EOF'
[apache-auth]
enabled  = true
port     = http,https
logpath  = /var/log/apache2/pgadmin_error.log
maxretry = 5
bantime  = 1h
EOF
sudo systemctl restart fail2ban
```
- Enable the **IP whitelist** (`Require ip …`) if you have a static IP → biggest security gain.
- Updates: `sudo apt update && sudo apt upgrade pgadmin4-web`.
- Postgres stays loopback-only — **never** open 5432 in UFW.

---

## Alternative: pgAdmin as its own service behind an Apache proxy
If the mod_wsgi integration gets in the way, pgAdmin can run as a **gunicorn service
on `127.0.0.1:5050`** with Apache in front via `ProxyPass`.

## Alternative: Adminer (lightweight, phpMyAdmin clone)
A single PHP file under the existing Apache+PHP — set up in ~2 minutes, in case
pgAdmin is too heavyweight.

---

*Created: 2026-06-21 — Tool: pgAdmin 4 (mod_wsgi), access: subdomain + HTTPS + auth.*
