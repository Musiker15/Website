---
title: "pgAdmin 4 — Setup-Runbook"
description: "pgAdmin 4 (Web) hinter Apache mit HTTPS auf Debian installieren."
order: 7
tags: ["debian", "pgadmin", "postgres"]
---

# pgAdmin 4 — Setup-Runbook

## DNS
A-Record anlegen: `pgadmin.your-domain.com` → Server-IP.
Erst danach funktioniert die Zertifikatsausstellung (Let's Encrypt).

## pgAdmin 4 installieren (offizielles APT-Repo)
```bash
curl -fsSL https://www.pgadmin.org/static/packages_pgadmin_org.pub | sudo gpg --dearmor -o /usr/share/keyrings/packages-pgadmin-org.gpg
sudo sh -c 'echo "deb [signed-by=/usr/share/keyrings/packages-pgadmin-org.gpg] https://ftp.postgresql.org/pub/pgadmin/pgadmin4/apt/$(lsb_release -cs) pgadmin4 main" > /etc/apt/sources.list.d/pgadmin4.list'

sudo apt update
sudo apt install -y pgadmin4-web        # Web-Variante (mod_wsgi), NICHT das Desktop-Paket
```

## pgAdmin-Login anlegen + WSGI konfigurieren
```bash
sudo /usr/pgadmin4/bin/setup-web.sh
```
- Fragt nach **E-Mail + Passwort** → pgAdmin-Login (starkes Passwort wählen).
- „Configure Apache? (y/n)" → **y**.

Default-Mount `/pgadmin4` (auf allen vhosts) deaktivieren, eigene Subdomain nutzen:
```bash
sudo a2disconf pgadmin4
sudo a2enmod wsgi headers ssl rewrite
```

## SSL-Zertifikat-Pfad ermitteln
Wenn bereits ein (Wildcard-)Zertifikat für deine Domain vorhanden ist, kannst du es
mitnutzen — andernfalls vorab per [Certbot](/de/docs/debian-tutorials/certbot) eines
ausstellen. Die genutzten Pfade findest du am einfachsten aus einem bestehenden vhost:
```bash
sudo grep -Rns "SSLCertificate" /etc/apache2/sites-available/   # zeigt die genutzten .pem-Pfade
# oder:
sudo certbot certificates                                        # listet vorhandene Certs + Pfade
```
Typischerweise: `/etc/letsencrypt/live/your-domain.com/fullchain.pem` + `…/privkey.pem`
(genauen Namen aus obiger Ausgabe übernehmen).

## Apache-vhost (HTTP→HTTPS-Redirect + HTTPS)
Vorgelagerte Basic-Auth (Defense-in-Depth, zusätzlich zu pgAdmins Login):
```bash
sudo htpasswd -c /etc/apache2/.pgadmin_htpasswd deinname
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
    # Pfade aus dem Abschnitt „SSL-Zertifikat-Pfad ermitteln" übernehmen:
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
        # Optional, stark empfohlen bei fester IP:
        # Require ip 203.0.113.10
    </Directory>

    # Security-Header — pgAdmin-verträglich!
    # WICHTIG: Referrer-Policy NICHT auf "no-referrer" setzen — pgAdmin braucht den
    # same-origin Referer für seine CSRF-/Sicherheitsprüfung, sonst bleibt die Seite leer.
    # nosniff + X-Frame-Options SAMEORIGIN sind dagegen unproblematisch.
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
Das Auto-Renewal des Zertifikats läuft unverändert über deinen bestehenden
Mechanismus. Beim Erneuern muss Apache neu geladen werden — falls das nicht
ohnehin per `deploy-hook` passiert, sorge dafür, dass dein Renewal-Hook
`systemctl reload apache2` ausführt.
</Callout>

## Dedizierte DB-Admin-Rolle anlegen
Eigener Superuser für pgAdmin — **nicht** den Applikations-DB-User verwenden.
```bash
sudo -u postgres psql
```
```sql
-- Gross-/Kleinschreibung wird nur mit Anführungszeichen erhalten → Rolle heisst exakt "DbAdmin".
CREATE ROLE "DbAdmin" WITH LOGIN SUPERUSER PASSWORD 'DEIN_SICHERES_PASSWORT';
\q
```

<Callout type="danger">
Trage hier ein eigenes, starkes Passwort ein und **veröffentliche es niemals**
(nicht in Git, nicht in Screenshots). Da diese Rolle `SUPERUSER`-Rechte hat,
verschafft ein geleaktes Passwort vollen Zugriff auf alle Datenbanken.
</Callout>

- `SUPERUSER` = alle Rechte (alle DBs sehen/bearbeiten, Rollen/DBs anlegen, Bypass aller Checks).
- **Wichtig:** Weil der Name in Anführungszeichen angelegt ist, ist er **case-sensitive** —
  in pgAdmin exakt `DbAdmin` als Username eintragen. (Alternativ ohne Quotes
  `CREATE ROLE dbadmin …` → dann immer klein `dbadmin`.)
- Passwort später ändern: `ALTER ROLE "DbAdmin" WITH PASSWORD 'neu';`
- Weniger privilegiert (kein Vollzugriff): `… WITH LOGIN CREATEDB CREATEROLE PASSWORD '…';`
  (sieht fremde DB-**Inhalte** aber nur als Owner/Member → für „alles sehen" ist SUPERUSER nötig).

## Lokalen Postgres-Server in pgAdmin verbinden
Login auf `https://pgadmin.your-domain.com` → **Add New Server**:
- **Host:** `127.0.0.1` · **Port:** `5432`
- **Username:** `DbAdmin` · **Password:** (aus dem Abschnitt „Dedizierte DB-Admin-Rolle anlegen")
- „Save password" nur bei Vertrauen ins pgAdmin-Master-Passwort (verschlüsselt in pgAdmin-SQLite).

<Callout type="note">
pg_hba.conf: Login über `127.0.0.1` mit Passwort sollte standardmäßig funktionieren.
Bei Auth-Fehler: `sudo -u postgres psql -c "SHOW hba_file;"` → prüfen, dass eine
Zeile `host … 127.0.0.1/32 scram-sha-256` existiert, dann
`sudo systemctl reload postgresql`.
</Callout>

## Härtung
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
- **IP-Whitelist** (`Require ip …`) aktivieren, falls feste IP → größter Sicherheitsgewinn.
- Updates: `sudo apt update && sudo apt upgrade pgadmin4-web`.
- Postgres bleibt loopback-only — **niemals** 5432 in UFW öffnen.

---

## Alternative: pgAdmin als eigener Dienst hinter Apache-Proxy
Wenn die mod_wsgi-Integration stört, kann pgAdmin als **gunicorn-Dienst auf
`127.0.0.1:5050`** laufen und Apache per `ProxyPass` davorhängen.

## Alternative: Adminer (schlank, phpMyAdmin-Klon)
Eine einzige PHP-Datei unter dem bestehenden Apache+PHP — in ~2 Minuten aufgesetzt,
falls pgAdmin zu schwergewichtig ist.

---

*Erstellt: 2026-06-21 — Tool: pgAdmin 4 (mod_wsgi), Zugriff: Subdomain + HTTPS + Auth.*
