---
title: "Step 2: txAdmin behind an Apache reverse proxy"
description: "Make the txAdmin panel reachable over HTTPS on its own subdomain through Apache 2.4, including the WebSocket switch for the live console and the traps nobody notices."
date: 2026-08-25
order: 3
tags: ["fivem", "txadmin", "apache", "reverse-proxy", "websocket", "debian", "ssl"]
---

This is the second part of the [FiveM series](/en/docs/fivem). After
[step 1](/en/docs/fivem/installation) port 40120 is blocked from outside and the
panel is only reachable through an SSH tunnel. That is safe but inconvenient,
and it does not work for more than one person.

By the end of this part Apache accepts the requests on its own subdomain over
HTTPS, the live console gets a real WebSocket connection, and the tunnel is
obsolete. Port 40120 stays closed throughout, that is the whole point.

<Callout type="note">
The game port (30120, TCP **and** UDP) is not affected. It does not go through
Apache, it is not HTTP. Only the web panel moves behind the proxy.
</Callout>

## Requirements

- a running FXServer from [step 1](/en/docs/fivem/installation), with the panel
  reachable locally on `127.0.0.1:40120` and blocked from outside
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
# Is the port closed from outside (run this from another machine)
curl -m 5 http://<server-ip>:40120/ ; echo "exit: $?"

# Does the proxy answer
curl -sI https://tx.example.com/ | head -1
```

### Measure the WebSocket upgrade in a browser, not with curl

<Callout type="danger">
**A hand-built handshake with `curl` is not a valid test.** engine.io rejects it
with `400`, including when you measure the backend directly and hold a valid
session. You end up measuring your own test tool and declaring a working proxy
broken.
</Callout>

The real browser is the right instrument. Open the panel, developer tools,
network, filter **WS**. There has to be a connection with status **101**. Or in
the console:

```js
new WebSocket("wss://tx.example.com/socket.io/?EIO=4&transport=websocket").onopen = () =>
  console.log("upgrade is up");
```

If it stays on polling you instead see fresh `transport=polling` requests every
few seconds in the network tab.

### When the upgrade does not get through

`upgrade=websocket` is the standard answer and it does not always suffice. On
one of my servers it stayed at status `400` through `upgrade=websocket`,
`upgrade=ANY`, `mod_proxy_wstunnel` with a rewrite switch, and `h2c` turned off.

The measurement that helped there is comparing the **response size**. The backend
answers the same handshake with 34 bytes, through the proxy 1414 arrived. So the
`400` came from Apache itself, not from txAdmin:

```bash
# Straight at the backend, on the server
curl -s -o /dev/null -w '%{size_download}\n' \
  "http://127.0.0.1:40120/socket.io/?EIO=4&transport=websocket"

# Through the proxy
curl -s -o /dev/null -w '%{size_download}\n' \
  "https://tx.example.com/socket.io/?EIO=4&transport=websocket"
```

**The rule: if proxy and backend return the same status code, the status code
proves nothing.** Only size or body says who answered. To keep digging, start at
`LogLevel alert proxy:trace3`.

<Callout type="note">
**None of this is urgent.** socket.io starts every connection with HTTP
long-polling and only then attempts the upgrade. If that fails it quietly stays
on polling. The panel works, live console and log stream keep running, just with
more requests and a little lag. Nothing about it shows up in the log, which is
why it often goes unnoticed for months, and why the network tab is worth one
look after setup.
</Callout>

## Common problems

| Message or symptom                                | Cause                                    | Fix                                          |
| ------------------------------------------------- | ---------------------------------------- | -------------------------------------------- |
| `503 Service Unavailable`                         | FXServer is not running                  | `systemctl status fivem`, `ss -tlnp`         |
| Panel loads, live console only sluggish (polling) | WebSocket upgrade is not getting through | check the switch from step 2.2, expect `101` |
| Panel reconnects every few minutes                | `ProxyTimeout` too short                 | set `ProxyTimeout 600`                       |
| CSP violation about `wss://` in the console       | wrong domain in `connect-src`            | name your own subdomain, or drop the CSP     |
| Every request arrives with the same IP            | `X-Forwarded-For` set twice              | remove the manual `RequestHeader` line       |
| `Unknown parameter: upgrade=websocket`            | Apache older than 2.4.47                 | use the rewrite variant from step 2.2        |
| Certificate warning naming a foreign domain       | no matching `:443` vHost, SNI fallback   | check `ServerName`, run `apache2ctl -S`      |
| Discord links point at `:40120`                   | txAdmin URL not set                      | see step 2.4                                 |

## On to step 3

The server runs and the panel is safely reachable. That leaves the question of
who keeps the artifacts current. The last part automates it:

**[Step 3: update artifacts automatically](/en/docs/fivem/auto-update)**
