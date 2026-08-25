---
title: "Step 1: install a FiveM server on Debian"
description: "Set up the FXServer artifact, create a dedicated system user, write a systemd unit and run the txAdmin setup through an SSH tunnel without ever opening port 40120."
date: 2026-08-25
order: 2
tags: ["fivem", "fxserver", "txadmin", "debian", "systemd", "ssh"]
---

This is the first part of the [FiveM series](/en/docs/fivem). By the end an
FXServer runs as its own system service, txAdmin is set up, and the server comes
back on its own after the machine reboots.

One point runs through the whole guide: **port 40120 is closed from the first
minute.** The initial setup therefore goes through an SSH tunnel instead of an
open port. That is twenty seconds of extra effort and it removes the window in
which a freshly installed management panel sits open on the internet. That
window gets scanned, reliably.

## Requirements

- Debian 11 or newer with root access
- a server key from the [Cfx.re keymaster](https://portal.cfx.re/)
- SSH access to the machine that allows port forwarding

```bash
apt update
apt install -y curl xz-utils git ca-certificates
```

## Step 1.1: user and directories

FXServer does not run as root. The process loads third-party resources and
executes their code, and it needs no system privileges for that.

```bash
adduser --system --group --home /opt/fivem --shell /usr/sbin/nologin fivem
mkdir -p /opt/fivem/server /opt/fivem/server-data
chown -R fivem:fivem /opt/fivem
```

Separating the two directories is not cosmetic, it is the precondition for
[step 3](/en/docs/fivem/auto-update):

```
/opt/fivem/
├── server/          ← the artifact. run.sh + alpine/. Replaced on every update
└── server-data/     ← your resources/, server.cfg, cache/. Left alone
```

<Callout type="danger">
**Never extract the artifact into the same directory as the server data.** As
long as the two are separate, an update is a swap of two directory entries. Put
them together and every update is a risk to resources and configuration, and
sooner or later something is lost.
</Callout>

## Step 1.2: install the FXServer artifact

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
chmod +x run.sh
chown -R fivem:fivem /opt/fivem/server
```

Afterwards there are exactly two things in there: `run.sh` and `alpine/`. The
actual server binary sits inside at `alpine/opt/cfx-server/FXServer`.

<Callout type="warning">
**The Linux build runs inside a proot container.** `run.sh` is only a launcher
that sets up an Alpine environment and runs the server inside it. proot works
through `ptrace`, and that has consequences for the systemd unit below: the
usual hardening options (`SystemCallFilter=@system-service`,
`RestrictNamespaces=true`, `NoNewPrivileges=true`) block exactly that mechanism.
The service then refuses to start with an error that looks like anything except
a systemd problem.
</Callout>

## Step 1.3: get the server data

```bash
sudo -u fivem git clone https://github.com/citizenfx/cfx-server-data.git \
  /opt/fivem/server-data
```

You do not need a `server.cfg` at this point. txAdmin's setup wizard writes one
in a moment, including the license key and the resource list.

## Step 1.4: close the panel port

txAdmin listens on `0.0.0.0:40120`, so on every network interface and
unencrypted. That has to go before the server first faces the internet.

<Callout type="danger">
**The obvious approach does not work.** There is a setting for the interface,
`TXHOST_INTERFACE` or the convar `txAdminInterface` depending on the txAdmin
version. Per the documentation it does not only bind txAdmin, it **also forces
FXServer onto the same interface**. There is no separate setting for the panel
alone.

Set to `127.0.0.1` that puts the **game server** on loopback, where nobody can
reach it. The mistake is nasty because the panel afterwards looks exactly the
way you wanted it, only the players are missing.
</Callout>

The port is therefore closed in the firewall, not in the server configuration:

```bash
ufw allow 30120/tcp
ufw allow 30120/udp
ufw allow 22/tcp
ufw deny  40120/tcp
ufw enable
ufw status verbose
```

Game port 30120 has to be open or nobody finds the server. The panel port is
explicitly denied. The reverse proxy from
[step 2](/en/docs/fivem/txadmin-reverse-proxy) and the SSH tunnel from step 1.7
still reach txAdmin, because both arrive over `127.0.0.1` and never pass the
firewall in the first place.

<Callout type="warning">
**Do not forget `ufw allow 22/tcp`** before running `ufw enable`, or you lock
yourself out. If SSH runs on a different port, that is the one to allow.
</Callout>

The panel port itself is set on `run.sh`, not in `server.cfg`:

```
+set txAdminPort 40120
```

<Callout type="note">
**This convar belongs on `run.sh`.** The game server reads `server.cfg`, and
txAdmin is what starts the game server. By the time that file is read, txAdmin
is long running and has bound its port. A `set txAdminPort` in `server.cfg` is
simply ignored, without an error message, and you end up looking for the problem
in the wrong place.
</Callout>

## Step 1.5: systemd unit

The unit is available as a commented template:

```bash
curl -fsSL https://uploads.musiker15.de/fivem/fivem.service \
  -o /etc/systemd/system/fivem.service
```

Or write it by hand:

```bash
nano /etc/systemd/system/fivem.service
```

```ini
[Unit]
Description=FiveM FXServer with txAdmin
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=fivem
Group=fivem
WorkingDirectory=/opt/fivem/server-data
ExecStart=/opt/fivem/server/run.sh \
    +set serverProfile default \
    +set txAdminPort 40120
Restart=always
RestartSec=15
TimeoutStartSec=120
TimeoutStopSec=30
KillMode=mixed
KillSignal=SIGINT
StandardOutput=journal
StandardError=journal
SyslogIdentifier=fivem
LimitNOFILE=65535

# Restrained hardening. Anything restricting ptrace or namespaces breaks the
# proot build, see above.
PrivateTmp=true
ProtectKernelTunables=true
ProtectControlGroups=true

[Install]
WantedBy=multi-user.target
```

```bash
systemctl daemon-reload
systemctl enable --now fivem
systemctl status fivem
```

Four lines in there are not a matter of taste:

**`KillMode=mixed` instead of `process`.** `run.sh` is only a wrapper. With
`KillMode=process` only the wrapper receives the signal and the child processes
keep running. systemd then considers the service stopped while the server is
still holding the game port, and the next start fails on a port in use.

**`KillSignal=SIGINT`.** FXServer treats `SIGINT` as an orderly shutdown. With
the default `SIGTERM` it falls over harder.

**`After=network-online.target` plus `Wants=`.** `network.target` alone only
means the networking subsystem was started, not that an address is configured.
The server then tries to reach Cfx during boot, gets no route, and keeps running
without an entry in the server list.

**No `ProtectHome=` if the server data lives under `/home`.** In this example
everything is under `/opt`, so the line is not needed at all. If you run the
server from `/home/fivem/`, do not set `ProtectHome=true` or the service can no
longer see its own directory.

## Step 1.6: verify the port is really closed

Locally txAdmin listens on every interface, as expected. That is fine:

```bash
ss -tlnp | grep 40120
```

What matters is the check **from outside**, from a different machine. On the
server itself you only measure the loopback route and always get an answer:

```bash
# On another machine, not on the server
curl -m 5 http://<server-ip>:40120/ ; echo "exit: $?"
```

Expect a timeout, so exit code 28. If the panel answers there, the `ufw` rule
from step 1.4 is not taking effect. Most common cause: Docker or another service
has put its own iptables rules ahead of ufw.

```bash
ufw status verbose
iptables -L INPUT -n --line-numbers | head -20
```

Counter-check for the game port, which **has** to be open:

```bash
ss -ulnp | grep 30120
```

## Step 1.7: initial setup through an SSH tunnel

On its first start txAdmin writes a PIN to the log. It is only valid for a few
minutes.

```bash
journalctl -u fivem -n 50 | grep -i pin
```

Since the port is not exposed, you forward it to your own machine over SSH. The
following command runs **on your PC**, not on the server:

```bash
ssh -N -L 40120:127.0.0.1:40120 root@<server-ip>
```

While that window stays open, the panel is reachable at
`http://127.0.0.1:40120/` in your browser. Enter the PIN there and create the
master account. The wizard then walks through license key, server data directory
(`/opt/fivem/server-data`) and the first `server.cfg`.

<Callout type="tip">
`-N` tells SSH not to open a shell, so it really only forwards. The window looks
like it has hung, and that is exactly right. Close the tunnel with `Ctrl+C`.
</Callout>

<Callout type="warning">
**The PIN is short-lived and tends to expire while you set up the tunnel.** When
that happens, run `systemctl restart fivem` and read the log again immediately.
The tunnel can stay open throughout.
</Callout>

## Step 1.8: is it running?

```bash
systemctl status fivem
journalctl -u fivem -n 40

# Is the game port answering
ss -ulnp | grep 30120
```

After a reboot the service has to come back on its own, which is what the
`enable` is for. Trying it once is worth it before players depend on it:

```bash
reboot
# after it comes up
systemctl is-active fivem
```

## Common problems

| Message or symptom                                 | Cause                                                        | Fix                                                                 |
| -------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------- |
| Service will not start, no useful error in the log | systemd hardening blocks proot                               | drop `SystemCallFilter`, `RestrictNamespaces` and `NoNewPrivileges` |
| `Permission denied` on start                       | `run.sh` not executable or wrong owner                       | `chmod +x run.sh`, `chown -R fivem:fivem`                           |
| Port 30120 already in use on start                 | `KillMode=process`, children survive                         | switch to `KillMode=mixed`                                          |
| Service starts but cannot find its directory       | `ProtectHome=true` with a path under `/home`                 | remove the line or move the server to `/opt`                        |
| Panel reachable from outside on `:40120`           | `ufw` rule not taking effect, often Docker iptables          | `ufw status verbose`, `iptables -L INPUT -n`                        |
| Game server suddenly unreachable for everyone      | interface convar set, it binds FXServer too                  | remove the convar, close the port in the firewall                   |
| Browser cannot reach `127.0.0.1:40120`             | tunnel not open, or started on the server instead of locally | run the command from step 1.7 on your own PC                        |
| PIN in the log has expired                         | the PIN is only valid for a few minutes                      | `systemctl restart fivem`, read the log immediately                 |
| Server does not appear in the server list          | license key missing, or no network at boot                   | check `sv_licenseKey` and `network-online.target` in the unit       |

## All at once

If you would rather not walk through steps 1.1 to 1.5 by hand, use the
installer. It creates the unit, the update script and the cron entry in one
run and asks for every path up front. It is described in
[step 3](/en/docs/fivem/auto-update#all-at-once-the-installer).

## On to step 2

The SSH tunnel gets old quickly, and it does not work for more than one person.
The next part puts Apache in front so the panel is reachable on its own
subdomain over HTTPS, with a working live console:

**[Step 2: txAdmin behind a reverse proxy](/en/docs/fivem/txadmin-reverse-proxy)**
