---
title: "Step 2: txAdmin behind an Apache reverse proxy"
description: "Make the txAdmin panel reachable over HTTPS on its own subdomain through Apache 2.4, including the WebSocket switch for the live console and the traps nobody notices."
date: 2026-08-25
order: 2
tags: ["fivem", "txadmin", "apache", "reverse-proxy", "websocket", "debian", "ssl"]
---

This is the second part of the [FiveM series](/en/docs/fivem). After
[step 1](/en/docs/fivem/installation) txAdmin runs on `127.0.0.1:40120` and is
only reachable through an SSH tunnel. That is safe but inconvenient, and it does
not work for more than one person.

By the end of this part Apache accepts the requests on its own subdomain over
HTTPS, the live console gets a real WebSocket connection, and the tunnel is
obsolete. Port 40120 stays closed throughout, that is the whole point.

<Callout type="note">
The game port (30120, TCP **and** UDP) is not affected. It does not go through
Apache, it is not HTTP. Only the web panel moves behind the proxy.
</Callout>

## Requirements

- a running FXServer from [step 1](/en/docs/fivem/installation), with txAdmin
  listening on `127.0.0.1:40120`
- Apache 2.4 with working HTTPS, either via
  [Certbot](/en/docs/debian-tutorials/certbot) or via a
  [wildcard certificate](/en/docs/debian-tutorials/acme-sh-wildcard-ionos)
- a subdomain pointing at the server, `tx.example.com` in this guide

The Apache version matters more than it looks. From 2.4.47 onwards `ProxyPass`
accepts the `upgrade=websocket` option, which turns the WebSocket switch into a
single line. Below that version it takes a detour through `mod_rewrite`, both
variants are below.

```bash
apache2 -v
```

## Step 2.1: enable the Apache modules

```bash
a2enmod ssl proxy proxy_http proxy_wstunnel headers rewrite
systemctl restart apache2
```

`proxy_wstunnel` is required even with the `upgrade=websocket` variant. The
option on `ProxyPass` only throws the switch, the tunneling itself is still done
by that module.

## Step 2.2: create the vHost

The configuration below is available as a commented template:

```bash
curl -fsSL https://uploads.musiker15.de/fivem/txadmin-vhost.conf \
  -o /etc/apache2/sites-available/tx.example.com.conf
```

```apache
<VirtualHost *:80>
    ServerName tx.example.com
    Redirect permanent / https://tx.example.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName   tx.example.com
    ServerAdmin  info@example.com

    SSLEngine on
    SSLCertificateFile    /etc/apache2/ssl/example.com/fullchain.cer
    SSLCertificateKeyFile /etc/apache2/ssl/example.com/example.com.key

    # Security headers
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set X-Content-Type-Options       "nosniff"
    Header always set X-Frame-Options              "SAMEORIGIN"
    Header always set Referrer-Policy              "strict-origin-when-cross-origin"
    Header always set Cross-Origin-Opener-Policy   "same-origin"
    Header always set Cross-Origin-Resource-Policy "same-origin"

    # Reverse proxy including WebSocket upgrade
    ProxyPreserveHost On
    ProxyTimeout      600

    ProxyPass        / http://127.0.0.1:40120/ upgrade=websocket
    ProxyPassReverse / http://127.0.0.1:40120/

    RequestHeader set X-Forwarded-Proto "https"
</VirtualHost>
```

```bash
a2ensite tx.example.com.conf
apachectl -t && systemctl reload apache2
```

### If Apache is older than 2.4.47

Then `ProxyPass` does not know the `upgrade=websocket` option and answers with
`Unknown parameter`. `mod_rewrite` takes over the switch instead, and it has to
sit **before** the `ProxyPass`:

```apache
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule ^/?(.*) ws://127.0.0.1:40120/$1 [P,L]

    ProxyPass        / http://127.0.0.1:40120/
    ProxyPassReverse / http://127.0.0.1:40120/
```

<Callout type="warning">
**Do not map `/socket.io/` wholesale to `ws://`.** It looks like the obvious
thing to do and reliably breaks the connection. Socket.io starts every session
with an ordinary HTTP handshake on exactly that path and only upgrades to
WebSocket afterwards. Mapping the whole path to `ws://` kills the handshake and
produces an endless loop of aborted connections.

The distinction has to be made on the `Upgrade` header, not on the path.
</Callout>

### What else breaks the live console

`ProxyTimeout 600` is not decoration. Without that line the global `Timeout`
applies, so 60 seconds. A live console with a quiet minute counts as a dead
connection and gets cut. You see it as a panel that reconnects every few minutes
and loses its console buffer doing so.

## Step 2.3: two traps in typical configurations

Both are common, both appear to work, and both are wrong.

### Do not set `X-Forwarded-For` by hand

```apache
# Not like this:
RequestHeader set X-Forwarded-For "%{REMOTE_ADDR}s"
```

`mod_proxy_http` sets `X-Forwarded-For`, `X-Forwarded-Host` and
`X-Forwarded-Server` on its own. The `RequestHeader` line runs first, then the
module appends the client IP to the existing value. The backend receives
`1.2.3.4, 1.2.3.4`. For txAdmin that means the IP in the logs and in the ban
view is useless, and rate limiting applies to the wrong thing.

`X-Forwarded-Proto` is **not** set by the module, so that line stays.

### The CSP has to match your own domain

`connect-src` decides where the browser is allowed to open the WebSocket
connection. If it names a domain left over from an older configuration, the
browser blocks the connection and the live console stays empty.

```apache
# Copied from another install, does not fit here:
connect-src 'self' wss://some-other-domain.com;
```

<Callout type="tip">
The simplest option is to set **no** CSP in the proxy at all. txAdmin sends its
own security headers, and two policies for the same document are not merged,
they are both enforced. Whichever rule is stricter wins, and the outcome is hard
to predict.

Look at what actually arrives:

```bash
curl -sI https://tx.example.com/ | grep -i -E 'content-security|x-frame|strict-transport'
```

If a header shows up twice, Apache and txAdmin are both setting it. Remove the
Apache entry, or neutralize it with `Header always unset` before setting your
own.
</Callout>

If you do want your own CSP, `connect-src` has to name your subdomain:

```apache
Header always set Content-Security-Policy "connect-src 'self' wss://tx.example.com; frame-ancestors 'self';"
```

<Callout type="note">
`X-XSS-Protection` does not belong in any new configuration. The header is inert
in every current browser, and in older Chrome versions it could open additional
holes. It was superseded by the CSP.
</Callout>

## Step 2.4: tell txAdmin its own address

Set the txAdmin URL to `https://tx.example.com` under **Settings → General**.
txAdmin builds the links it sends to Discord and in invitations from that
address. Without it those links point at `http://<server-ip>:40120`, which is
not reachable from outside.

From here the SSH tunnel from [step 1](/en/docs/fivem/installation) is obsolete.
The `ufw` rule `deny 40120/tcp` stays, of course.

## Verify

```bash
# Is txAdmin still listening locally only
ss -tlnp | grep 40120

# Is the port closed from outside (run this from another machine)
curl -m 5 http://<server-ip>:40120/ ; echo "exit: $?"

# Does the proxy answer
curl -sI https://tx.example.com/ | head -1

# Does the WebSocket upgrade get through
curl -si "https://tx.example.com/socket.io/?EIO=4&transport=websocket" \
  -H "Connection: Upgrade" -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Version: 13" \
  -H "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==" | head -1
```

The last line has to return `HTTP/1.1 101 Switching Protocols`. If it says `200`
or `400` instead, the switch from step 2.2 is not taking effect and socket.io
falls back to HTTP polling. The interface still works, just sluggishly, and the
live console lags behind. That is exactly why this failure often goes unnoticed
for months.

## Common problems

| Message or symptom                          | Cause                                    | Fix                                          |
| ------------------------------------------- | ---------------------------------------- | -------------------------------------------- |
| `503 Service Unavailable`                   | FXServer is not running                  | `systemctl status fivem`, `ss -tlnp`         |
| Panel loads, live console stays empty       | WebSocket upgrade is not getting through | check the switch from step 2.2, expect `101` |
| Panel reconnects every few minutes          | `ProxyTimeout` too short                 | set `ProxyTimeout 600`                       |
| CSP violation about `wss://` in the console | wrong domain in `connect-src`            | name your own subdomain, or drop the CSP     |
| Every request arrives with the same IP      | `X-Forwarded-For` set twice              | remove the manual `RequestHeader` line       |
| `Unknown parameter: upgrade=websocket`      | Apache older than 2.4.47                 | use the rewrite variant from step 2.2        |
| Certificate warning naming a foreign domain | no matching `:443` vHost, SNI fallback   | check `ServerName`, run `apache2ctl -S`      |
| Discord links point at `:40120`             | txAdmin URL not set                      | see step 2.4                                 |

## On to step 3

The server runs and the panel is safely reachable. That leaves the question of
who keeps the artifacts current. The last part automates it:

**[Step 3: update artifacts automatically](/en/docs/fivem/auto-update)**
