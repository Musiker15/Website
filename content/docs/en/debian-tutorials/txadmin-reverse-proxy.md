---
title: "txAdmin behind an Apache reverse proxy"
description: "Set up FXServer with txAdmin on Debian and expose the web panel through Apache 2.4 with HTTPS, WebSockets and a port that is not open to the world."
date: 2026-08-25
order: 9
tags: ["debian", "apache", "fivem", "txadmin", "reverse-proxy", "websocket", "systemd"]
---

txAdmin is the web interface used to manage a FiveM server: start, stop, live
console, player list, bans, scheduled restarts. It has shipped inside FXServer
since 2021 and listens on port 40120 by default, unencrypted and on every
network interface.

That is exactly the problem this tutorial solves. A panel that controls an
entire server has no business sitting on an open HTTP port. By the end of this
guide txAdmin only listens on `127.0.0.1`, Apache accepts the requests on its
own subdomain over HTTPS, the live console gets a real WebSocket connection, and
port 40120 is dead from the outside.

<Callout type="note">
The game port (30120 by default, TCP **and** UDP) is not affected. It does not
go through Apache, it is not HTTP. Only the web panel moves behind the proxy.
</Callout>

## Requirements

- Debian 11 or newer with root access
- Apache 2.4 with working HTTPS, either via
  [Certbot](/en/docs/debian-tutorials/certbot) or via a
  [wildcard certificate](/en/docs/debian-tutorials/acme-sh-wildcard-ionos)
- a subdomain pointing at the server, `tx.example.com` in this guide
- a server key from the [Cfx.re keymaster](https://portal.cfx.re/)

The Apache version matters more than it looks. From 2.4.47 onwards `ProxyPass`
accepts the `upgrade=websocket` option, which turns the WebSocket switch into a
single line. Below that version it takes a detour through `mod_rewrite`, both
variants are in step 7.

```bash
apache2 -v
```

## Step 1: user and directories

FXServer does not run as root. The process loads third-party scripts and has no
need for system privileges.

```bash
adduser --system --group --home /opt/fivem --shell /usr/sbin/nologin fivem
mkdir -p /opt/fivem/server /opt/fivem/server-data
chown -R fivem:fivem /opt/fivem
```

```bash
apt update
apt install -y curl xz-utils git ca-certificates
```

## Step 2: install the FXServer artifact

The Linux builds live at
[runtime.fivem.net/artifacts/fivem/build_proot_linux/master/](https://runtime.fivem.net/artifacts/fivem/build_proot_linux/master/).
Every entry is a folder made of build number and hash. Take one from the
recommended line, not blindly the topmost one.

```bash
cd /opt/fivem/server
curl -fsSL -o fx.tar.xz \
  "https://runtime.fivem.net/artifacts/fivem/build_proot_linux/master/<NUMBER>-<HASH>/fx.tar.xz"
tar -xf fx.tar.xz
rm fx.tar.xz
chown -R fivem:fivem /opt/fivem/server
```

Afterwards you have `run.sh`, `alpine/` and `opt/` in there.

<Callout type="warning">
**The Linux build runs inside a proot container.** `run.sh` is only a launcher
that sets up an Alpine environment and runs the actual server inside it. proot
works through `ptrace`, and that has consequences for the systemd unit in step
5: the usual hardening options (`SystemCallFilter=@system-service`,
`RestrictNamespaces=true`, `NoNewPrivileges=true`) block exactly that mechanism.
The service then refuses to start with an error that looks like anything except
a systemd problem.
</Callout>

## Step 3: get the server data

```bash
sudo -u fivem git clone https://github.com/citizenfx/cfx-server-data.git \
  /opt/fivem/server-data
```

You do not need a `server.cfg` at this point. txAdmin's setup wizard writes one
later, including the license key and the resource list.

## Step 4: bind txAdmin to localhost

This is the core of the whole thing. Without this step txAdmin keeps listening
on `0.0.0.0:40120`, and the reverse proxy is just a second door next to an open
first one.

```
+set txAdminInterface 127.0.0.1
+set txAdminPort 40120
```

<Callout type="danger">
**These two convars belong on `run.sh`, not in `server.cfg`.** The game server
reads `server.cfg`, and txAdmin is what starts the game server. By the time that
file is read, txAdmin is long running and has bound its port. A `set
txAdminPort` in `server.cfg` is simply ignored, without an error message, and
you end up looking for the problem in the wrong place.
</Callout>

A first manual start to see whether it takes effect:

```bash
sudo -u fivem /opt/fivem/server/run.sh \
  +set serverProfile default \
  +set txAdminInterface 127.0.0.1 \
  +set txAdminPort 40120
```

Verify from a second session:

```bash
ss -tlnp | grep 40120
```

You want `127.0.0.1:40120`. If it says `0.0.0.0:40120` or `*:40120`, the convar
did not take. That can happen with an older artifact that does not know the name
yet. The firewall from step 9 is the fallback in that case. Do not just assume
the convar worked, look at it.

Stop the test run with `Ctrl+C`.

## Step 5: systemd unit

```bash
nano /etc/systemd/system/fivem.service
```

```ini
[Unit]
Description=FXServer with txAdmin
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=fivem
Group=fivem
WorkingDirectory=/opt/fivem
ExecStart=/opt/fivem/server/run.sh \
    +set serverProfile default \
    +set txAdminInterface 127.0.0.1 \
    +set txAdminPort 40120
Restart=always
RestartSec=10s
KillSignal=SIGTERM
TimeoutStopSec=30s
LimitNOFILE=65535

# Restrained hardening. Anything restricting ptrace or namespaces breaks the
# proot build, see step 2.
PrivateTmp=true
ProtectHome=true
ProtectKernelTunables=true
ProtectControlGroups=true

[Install]
WantedBy=multi-user.target
```

```bash
systemctl daemon-reload
systemctl enable --now fivem
systemctl status fivem
journalctl -u fivem -f
```

<Callout type="tip">
`Restart=always` is not just convenience here. txAdmin restarts the game server
itself when it crashes. But if txAdmin goes down, everything is down. This way
the service comes back on its own, and scheduled restarts stay txAdmin's job.
</Callout>

## Step 6: enable the Apache modules

```bash
a2enmod ssl proxy proxy_http proxy_wstunnel headers rewrite
systemctl restart apache2
```

`proxy_wstunnel` is required even with the `upgrade=websocket` variant. The
option on `ProxyPass` only throws the switch, the tunneling itself is still done
by that module.

## Step 7: create the vHost

```bash
nano /etc/apache2/sites-available/tx.example.com.conf
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

## Step 8: two traps in typical configurations

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

## Step 9: firewall

```bash
ufw allow 30120/tcp
ufw allow 30120/udp
ufw allow 443/tcp
ufw deny  40120/tcp
ufw status verbose
```

The game port has to be open or nobody finds the server. The panel port is
explicitly denied. If step 4 worked, nothing listens there externally anyway,
but two locks on the door that controls an entire server are appropriate.

## Step 10: first-run setup over HTTPS

On its first start txAdmin writes a PIN to the log. It is only valid for a few
minutes.

```bash
journalctl -u fivem -n 50 | grep -i pin
```

Then open `https://tx.example.com/` in the browser, enter the PIN, create the
master account. The wizard then walks through license key, server data directory
(`/opt/fivem/server-data`) and the first `server.cfg`.

Right afterwards, set the txAdmin URL to `https://tx.example.com` under
**Settings → General**. txAdmin builds the links it sends to Discord and in
invitations from that address. Without it those links point at
`http://<server-ip>:40120`, which is no longer reachable from outside.

## Verify

```bash
# Is txAdmin really listening locally only
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
or `400` instead, the switch from step 7 is not taking effect and socket.io
falls back to HTTP polling. The interface still works, just sluggishly, and the
live console lags behind. That is exactly why this failure often goes unnoticed
for months.

## Common problems

| Message or symptom                             | Cause                                    | Fix                                                 |
| ---------------------------------------------- | ---------------------------------------- | --------------------------------------------------- |
| `503 Service Unavailable`                      | FXServer is down or listening elsewhere  | `systemctl status fivem`, `ss -tlnp`                |
| Panel loads, live console stays empty          | WebSocket upgrade is not getting through | check the switch from step 7, expect `101`          |
| Panel reconnects every few minutes             | `ProxyTimeout` too short                 | set `ProxyTimeout 600`                              |
| CSP violation about `wss://` in the console    | wrong domain in `connect-src`            | name your own subdomain, or drop the CSP            |
| Every request arrives with the same IP         | `X-Forwarded-For` set twice              | remove the manual `RequestHeader` line              |
| `Unknown parameter: upgrade=websocket`         | Apache older than 2.4.47                 | use the rewrite variant from step 7                 |
| Service will not start, no useful error in log | systemd hardening blocks proot           | drop `SystemCallFilter` and `RestrictNamespaces`    |
| Port 40120 still reachable from outside        | convar in `server.cfg` instead of run.sh | see step 4                                          |
| PIN in the log has expired                     | the PIN is only valid for a few minutes  | `systemctl restart fivem`, read the log immediately |

## Updating the artifact

FiveM requires newer builds on a regular basis, otherwise current clients refuse
to connect.

```bash
systemctl stop fivem
mv /opt/fivem/server /opt/fivem/server.old

mkdir -p /opt/fivem/server
cd /opt/fivem/server
curl -fsSL -o fx.tar.xz \
  "https://runtime.fivem.net/artifacts/fivem/build_proot_linux/master/<NEW-NUMBER>-<HASH>/fx.tar.xz"
tar -xf fx.tar.xz && rm fx.tar.xz
chown -R fivem:fivem /opt/fivem/server

systemctl start fivem
journalctl -u fivem -n 30
```

Leave the old directory in place until the new build has run cleanly for a few
days. Rolling back is then two `mv` calls and a restart.

The server data, the `server.cfg` and the txAdmin profile live in
`/opt/fivem/server-data` and in the profile directory respectively and are not
touched. Nothing changes on the Apache vHost.
