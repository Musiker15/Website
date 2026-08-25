---
title: "Wildcard SSL with acme.sh and IONOS DNS"
description: "Issue and auto-renew wildcard certificates: acme.sh, DNS-01 via the IONOS API, ZeroSSL and an Apache deploy that will not take itself down."
date: 2026-08-05
order: 9
tags: ["debian", "apache", "ssl", "acme", "wildcard", "ionos", "zerossl"]
---

A wildcard certificate covers every subdomain of a domain at once. Instead of
issuing a separate certificate for each new subdomain, you get `*.example.com`
once and you are done. The price: validation has to run over DNS rather than a
file on the web server, and that needs a client which can talk to your DNS
provider's API.

This guide sets the whole thing up: issue the certificate, deploy it to
`/etc/apache2/ssl`, renew it automatically. At the end a systemd timer takes
care of everything, and the deploy step will refuse to reload Apache rather
than reload it into a broken state.

<Callout type="note">
If you do not need a wildcard but only a handful of fixed domains,
[Certbot](/en/docs/debian-tutorials/certbot) is the shorter path. It can use
HTTP-01 and needs no DNS API at all.
</Callout>

## Requirements

- Debian with Apache 2.4 and root access
- a domain whose **DNS zone** is hosted at IONOS, not just the registration
- `curl`, `tar` and `openssl` (all present on a stock Debian)

The difference between registration and DNS zone matters: DNS-01 sets a TXT
record through the DNS provider's API. If the domain's nameservers point at
Cloudflare, you need the Cloudflare plugin rather than the IONOS one, even if
the domain was bought at IONOS.

## Why DNS-01 and why acme.sh

There are two common ways to prove domain ownership to a certificate authority:

| Method  | How                                               | Wildcard possible |
| ------- | ------------------------------------------------- | ----------------- |
| HTTP-01 | place a file under `/.well-known/acme-challenge/` | no                |
| DNS-01  | set a TXT record `_acme-challenge.example.com`    | yes               |

For a wildcard there is no choice, it has to be DNS-01. That rules out Certbot
as the convenient option: it ships no official plugin for IONOS DNS, so you end
up with third-party plugins installed through pip.

[acme.sh](https://github.com/acmesh-official/acme.sh) has `dns_ionos` built in,
is a plain shell script with no Python environment, and writes `fullchain.cer`
natively. That suits Apache, which has been reading intermediates straight from
the fullchain since 2.4.

## Which certificate authority

acme.sh speaks to any ACME server. Three are candidates for an IONOS domain:

| CA            | EAB required                  | Lifetime     | Root                    |
| ------------- | ----------------------------- | ------------ | ----------------------- |
| ZeroSSL       | no, acme.sh fetches it itself | 90 days      | USERTrust (via Sectigo) |
| Let's Encrypt | no                            | 90 days      | ISRG                    |
| IONOS ACME    | yes, entered manually         | as purchased | Sectigo                 |

<Callout type="warning">
**The IONOS ACME server does not issue freely.** It binds every order to an
*available* certificate in your account. A certificate that has already been
issued and downloaded counts as consumed. The "SSL Starter Wildcard" product is
validated by IONOS itself, signed by Sectigo and then sits in your account as a
file to download. It does not feed the ACME side in **any** state.

The failure arrives late and reads harmlessly:

```
Verifying: example.com
Success
Let's finalize the order.
Signing failed. Finalize code was not 200.
{"detail":"No available certificate found for the requested domain(s).",
 "type":"urn:ietf:params:acme:error:unauthorized"}
```

Order created, domain validated, finalize rejected. That exact point in the
flow is the tell: if it fails earlier it is a client, DNS or validation
problem, if it only fails at finalize it is the account side.
</Callout>

This guide therefore uses **ZeroSSL**. Not arbitrarily: if you are coming from
a purchased IONOS certificate, this keeps the Sectigo chain of trust.

```
example.com
  └─ ZeroSSL RSA DV SSL CA 2
      └─ Sectigo Public Server Authentication Root R46
          └─ USERTrust RSA Certification Authority
```

IONOS certificates run through `Sectigo Public Server Authentication CA DV R36`
and therefore through the same root R46. Above the intermediate the chains are
identical, only the issuer line changes.

If you do not care about that, use Let's Encrypt. Everything else is the same,
only the `--server` URL differs.

## Step 1: create a DNS API key at IONOS

Create an API key at
[developer.hosting.ionos.de](https://developer.hosting.ionos.de/). It is shown
as one long string of the form `prefix.secret`. The **first dot** separates the
two parts:

```bash
export IONOS_PREFIX="<part before the first dot>"
export IONOS_SECRET="<remainder after it>"
```

One key covers every zone in the account, so further domains in the same
account do not need a second one.

## Step 2: install acme.sh

<Callout type="warning">
**Do not install through `https://get.acme.sh` if you want to pass your own
flags.** That wrapper treats its first argument as an `email=...` pair and
builds

```sh
_email="--$(echo "$1" | tr '=' ' ')"
```

from it. A leading `--home` becomes `----home`, and acme.sh aborts with
`Unknown parameter: ----home`. The tarball is the documented offline installer
and accepts normal flags.
</Callout>

```bash
cd /tmp
curl -fsSL https://github.com/acmesh-official/acme.sh/archive/master.tar.gz -o acme.tar.gz
tar -xzf acme.tar.gz
cd acme.sh-master

sh ./acme.sh --install \
    --home /root/.acme.sh \
    --nocron \
    --noprofile
```

`--nocron` suppresses its own cron job, we use a systemd timer later.
`--noprofile` skips the shell aliases, we call acme.sh by full path.

```bash
/root/.acme.sh/acme.sh --home /root/.acme.sh --version
```

## Step 3: register the ACME account

```bash
/root/.acme.sh/acme.sh --home /root/.acme.sh \
    --register-account \
    --server https://acme.zerossl.com/v2/DV90 \
    -m info@example.com
```

<Callout type="danger">
**The ZeroSSL URL has to be written exactly like this.** acme.sh decides via a
string comparison `[ "$ACME_DIRECTORY" = "$CA_ZEROSSL" ]` whether to fetch the
EAB credentials from `api.zerossl.com` automatically. A missing `/DV90` alone
turns that off, and registration then fails without a usable error message. The
email address is mandatory, the EAB retrieval depends on it.
</Callout>

acme.sh keeps **exactly one account per CA**, stored under
`/root/.acme.sh/ca/acme.zerossl.com/v2/DV90/`. When you add further domains
later, use the same address, otherwise the account key gets replaced.

## Step 4: issue the certificate

```bash
export IONOS_PREFIX="..."
export IONOS_SECRET="..."

/root/.acme.sh/acme.sh --home /root/.acme.sh \
    --issue \
    --server https://acme.zerossl.com/v2/DV90 \
    --dns dns_ionos \
    --keylength 2048 \
    -d example.com \
    -d '*.example.com'
```

Two details that are easy to miss:

**The wildcard does not cover the apex.** `*.example.com` matches
`www.example.com` and `shop.example.com`, but not `example.com` itself. That is
why both are on the list.

**A wildcard covers exactly one label.** `*.example.com` also matches
`b.example.com`, but not `a.b.example.com`. For deeper names either add the
name individually or add a second wildcard level:

```bash
-d example.com -d '*.example.com' -d '*.b.example.com'
```

<Callout type="tip">
`--keylength 2048` forces RSA. Without it acme.sh 3.x picks an ECDSA key pair
(`ec-256`) and stores the certificate in a directory with an `_ecc` suffix.
That is perfectly fine, only every later command then needs an additional
`--ecc` or it will find nothing.
</Callout>

If validation fails with a timeout, DNS propagation is usually too slow. Append
`--dnssleep 180` and run it again.

## Step 5: check the target directory before installing

The next step wires acme.sh permanently to paths under `/etc/apache2/ssl`.
Before that happens, take a look at what is already there.

<Callout type="danger">
**`--install-cert` overwrites its target paths without asking.** The danger
comes from partial overlap: only the names the new scheme assigns get
overwritten. A vhost combining the **new** `fullchain.cer` with an **old** file
that was not overwritten no longer matches:

```
AH02565: Certificate and private key example.com:443:0 from
/etc/apache2/ssl/fullchain.cer and /etc/apache2/ssl/old-key.key do not match
AH00020: Configuration Failed, exiting
```

And `apachectl -t` reports **Syntax OK** throughout. The config test checks
grammar, not whether certificate and key belong together. That only surfaces on
load, so at startup or reload, and then it hits the running process.
</Callout>

So look first at which files are taken and who references them:

```bash
ls -la /etc/apache2/ssl/
grep -RnE 'SSLCertificate(File|KeyFile|ChainFile)' \
     /etc/apache2/sites-available/ /etc/apache2/conf-available/
```

<Callout type="warning">
**`grep -r` does not follow symlinks.** On Debian, `sites-enabled`,
`conf-enabled` and `mods-enabled` consist purely of symlinks into `*-available`.
A search with `-r` in `sites-enabled` therefore comes back empty even though two
dozen vhosts live there. An empty result reads like an answer, and then you
delete or overwrite a file that is very much in use. Use `-R`, or search
`*-available` directly.
</Callout>

The cleanest layout is a separate subdirectory per domain. Nothing can then
collide, not even with the second domain later on:

```bash
mkdir -p /etc/apache2/ssl/example.com
chmod 0710 /etc/apache2/ssl/example.com
```

## Step 6: write the deploy script

acme.sh can call a command after every renewal. That is exactly where the check
belongs which `apachectl -t` cannot provide: whether key and certificate really
belong together.

```bash
nano /usr/local/sbin/ssl-deploy.sh
```

```bash
#!/usr/bin/env bash
set -euo pipefail

SSL_DIR="/etc/apache2/ssl/example.com"
KEY="$SSL_DIR/example.com.key"
CERT="$SSL_DIR/example.com.cer"
FULLCHAIN="$SSL_DIR/fullchain.cer"

for f in "$KEY" "$CERT" "$FULLCHAIN"; do
    [[ -s "$f" ]] || { echo "missing or empty: $f" >&2; exit 1; }
done

# Do key and certificate match? Compare the public keys, because
# apachectl -t does not check this.
a="$(openssl pkey  -in "$KEY"  -pubout        | openssl sha256)"
b="$(openssl x509  -in "$CERT" -noout -pubkey | openssl sha256)"
if [[ "$a" != "$b" ]]; then
    echo "Private key does not match the certificate. No reload." >&2
    exit 1
fi

chmod 0710 "$SSL_DIR"
chmod 0600 "$KEY"
chmod 0644 "$CERT" "$FULLCHAIN"

if ! apachectl -t; then
    echo "Apache configuration is broken. No reload." >&2
    exit 1
fi

systemctl reload apache2
echo "Active until: $(openssl x509 -in "$FULLCHAIN" -noout -enddate | cut -d= -f2)"
```

```bash
chmod 0755 /usr/local/sbin/ssl-deploy.sh
```

If the script aborts, nothing is reloaded and the timer reports the unit as
failed. The server then keeps running on the old certificate, which is far
better than an Apache that no longer starts.

## Step 7: wire up target paths and the reload hook

```bash
/root/.acme.sh/acme.sh --home /root/.acme.sh \
    --install-cert -d example.com \
    --key-file       /etc/apache2/ssl/example.com/example.com.key \
    --cert-file      /etc/apache2/ssl/example.com/example.com.cer \
    --ca-file        /etc/apache2/ssl/example.com/ca.cer \
    --fullchain-file /etc/apache2/ssl/example.com/fullchain.cer \
    --reloadcmd      "/usr/local/sbin/ssl-deploy.sh"
```

This is a one-off step. acme.sh remembers the paths and the `reloadcmd` per
certificate and applies them on every future renewal by itself.

<Callout type="tip">
`--install-cert` runs the `reloadcmd` immediately. The command is therefore
also a test of the whole chain, without having to issue a new certificate. If
it completes cleanly, automatic renewal will work too.
</Callout>

## Step 8: switch Apache over

```apache
<VirtualHost *:443>
    ServerName  example.com
    ServerAlias www.example.com

    SSLEngine on
    SSLCertificateFile    /etc/apache2/ssl/example.com/fullchain.cer
    SSLCertificateKeyFile /etc/apache2/ssl/example.com/example.com.key

    # ...
</VirtualHost>
```

`SSLCertificateChainFile` is no longer needed, Apache 2.4 reads the
intermediates straight from the fullchain.

<Callout type="warning">
**The `:443` vhost needs both apex and www as `ServerName` or `ServerAlias`.**
If one of the names is missing, the SNI fallback kicks in: for unknown
hostnames Apache serves the certificate of the **first loaded** `:443` vhost,
and Debian includes `conf-enabled` before `sites-enabled`. Visitors then get a
name mismatch warning showing a completely unrelated domain.
</Callout>

```bash
apachectl -t && systemctl reload apache2
```

## Step 9: automatic renewal with a systemd timer

acme.sh ships its own cron job, which we suppressed with `--nocron`. A systemd
timer is easier to survey, logs into the journal and can be queried with
`systemctl`.

```bash
nano /etc/systemd/system/acme-renew.service
```

```ini
[Unit]
Description=Renew ACME certificates
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
Environment=IONOS_PREFIX=...
Environment=IONOS_SECRET=...
ExecStart=/root/.acme.sh/acme.sh --home /root/.acme.sh --cron
```

```bash
nano /etc/systemd/system/acme-renew.timer
```

```ini
[Unit]
Description=Daily ACME certificate check

[Timer]
OnCalendar=*-*-* 03:17:00
RandomizedDelaySec=45m
Persistent=true

[Install]
WantedBy=timers.target
```

```bash
chmod 0600 /etc/systemd/system/acme-renew.service
systemctl daemon-reload
systemctl enable --now acme-renew.timer
systemctl list-timers acme-renew.timer
```

<Callout type="note">
The randomised delay is not decoration. If every server on the planet knocked
on the same CA at 03:17 sharp, that would be a self-built load spike generator.
`Persistent=true` catches up a run that was missed because the machine was off.

The API credentials sit in the unit file, hence `0600`. acme.sh also stores
them per certificate in its own configuration, but relying on that is
needlessly fragile.
</Callout>

acme.sh only renews what is old enough. A run with nothing to do ends with
`Skipping. Next renewal time is: ...` and that is the normal case.

```bash
# Dry run, renews nothing
/root/.acme.sh/acme.sh --home /root/.acme.sh --cron

journalctl -u acme-renew -n 50
```

<Callout type="warning">
**No `--server` on `--cron`.** The CA is stored per certificate in the acme.sh
configuration. A global value here could force the wrong one during automatic
renewal, and that only surfaces months later.
</Callout>

## Several domains on one server

Two properties of acme.sh together dictate how this has to look:

- **`--cron` always renews every certificate** in the `--home`. There is no way
  to restrict a run to one domain. Two timers therefore mean two full runs
  getting in each other's way.
- **The `reloadcmd` is stored per certificate** in
  `<home>/<domain>/<domain>.conf` as `Le_ReloadCmd`. Every domain can run a
  different command after its renewal.

Which gives: **one timer, one `--cron`, but a separate `reloadcmd` per domain.**
So for the second domain simply repeat steps 4, 6 and 7 with its own paths and
its own deploy script:

```bash
/root/.acme.sh/acme.sh --home /root/.acme.sh \
    --issue --server https://acme.zerossl.com/v2/DV90 \
    --dns dns_ionos --keylength 2048 \
    -d second-domain.com -d '*.second-domain.com'

/root/.acme.sh/acme.sh --home /root/.acme.sh \
    --install-cert -d second-domain.com \
    --key-file       /etc/apache2/ssl/second-domain.com/second-domain.com.key \
    --cert-file      /etc/apache2/ssl/second-domain.com/second-domain.com.cer \
    --ca-file        /etc/apache2/ssl/second-domain.com/ca.cer \
    --fullchain-file /etc/apache2/ssl/second-domain.com/fullchain.cer \
    --reloadcmd      "/usr/local/sbin/ssl-deploy-second-domain.sh"
```

The timer stays untouched, it covers the new domain automatically.

<Callout type="danger">
**Two domains must never point at the same file.** The names `ca.cer` and
`fullchain.cer` are generic. If you put both certificates directly into
`/etc/apache2/ssl/`, the second `--install-cert` overwrites the files of the
first, and the next reload combines a foreign fullchain with the old key. Hence
one subdirectory per domain.
</Callout>

To check what is actually stored: the value is base64 encoded in the
configuration, so a plain `grep` will not show it in clear text.

```bash
grep -i reloadcmd /root/.acme.sh/*/*.conf \
  | grep -o '__ACME_BASE64__START_[^_]*' | sed 's/.*START_//' | base64 -d
```

## Verify

```bash
# What is on disk
openssl x509 -in /etc/apache2/ssl/example.com/fullchain.cer \
        -noout -subject -issuer -dates -ext subjectAltName

# How many certificates are in the chain (leaf plus intermediates)
grep -c 'BEGIN CERTIFICATE' /etc/apache2/ssl/example.com/fullchain.cer

# What the server actually serves
for h in example.com www.example.com shop.example.com; do
  echo "== $h"
  echo | openssl s_client -servername "$h" -connect "$h":443 2>/dev/null \
    | openssl x509 -noout -subject -issuer
done

# What acme.sh knows about
/root/.acme.sh/acme.sh --home /root/.acme.sh --list
```

The `s_client` test with `-servername` is the most important one. Only it shows
what a browser really gets, including whether the right vhost is answering.

## Common errors

| Message                                                       | Cause                                         | Fix                                            |
| ------------------------------------------------------------- | --------------------------------------------- | ---------------------------------------------- |
| `Unknown parameter: ----home`                                 | installed via `get.acme.sh` with custom flags | use the tarball, see step 2                    |
| `No available certificate found for the requested domain(s).` | IONOS ACME, no free quota in the account      | use ZeroSSL or Let's Encrypt                   |
| ZeroSSL registration fails without a clear message            | server URL not exact                          | use exactly `https://acme.zerossl.com/v2/DV90` |
| `AH02565: ... do not match`                                   | new fullchain combined with an old key        | check vhost paths, see step 5                  |
| `is already verified, skipping dns-01`                        | IONOS pre-authorises its own domains          | not an error, just information                 |
| validation runs into a timeout                                | DNS propagation too slow                      | append `--dnssleep 180`                        |
| `AH02218: no OCSP URI in certificate`                         | Let's Encrypt dropped OCSP URLs in 2025       | `SSLUseStapling off` or switch CA              |
| `--install-cert` finds nothing                                | ECDSA certificate addressed without `--ecc`   | add `--ecc`                                    |

## Why this pays off anyway

Manual certificate handling is being phased out industry wide. With ballot
SC-081v3 the CA/Browser Forum agreed on a staged plan for all public CAs:

| from       | maximum lifetime |
| ---------- | ---------------- |
| 2026-03-15 | 200 days         |
| 2027-03-15 | 100 days         |
| 2029-03-15 | 47 days          |

A certificate that has to be swapped by hand every 47 days will eventually not
be swapped in time by anyone. Against that backdrop the 90 days of ZeroSSL and
Let's Encrypt are not a drawback, just the state everything is heading towards.

## Uninstall

```bash
systemctl disable --now acme-renew.timer
rm /etc/systemd/system/acme-renew.{timer,service}
systemctl daemon-reload

/root/.acme.sh/acme.sh --home /root/.acme.sh --remove -d example.com
/root/.acme.sh/acme.sh --home /root/.acme.sh --uninstall
```

The files under `/etc/apache2/ssl/` stay in place, `--remove` only takes the
certificate off the renewal list. Switch the vhost over first, then delete.
