---
title: "Step 3: update FXServer artifacts automatically"
description: "An update script that fetches the current version from the Cfx changelog API, swaps only the artifact files and restores the previous state if the server fails to come back. Plus the matching cron entry."
date: 2026-08-25
order: 4
tags: ["fivem", "fxserver", "cron", "systemd", "automation", "bash", "debian"]
---

This is the third part of the [FiveM series](/en/docs/fivem). After steps
[1](/en/docs/fivem/installation) and
[2](/en/docs/fivem/txadmin-reverse-proxy) the server runs and the panel is
safely reachable. That leaves the question of who keeps the artifacts current.

FiveM artifacts go stale quickly. Every few weeks the client demands a newer
build, and the same ritual starts: look up the build number, download the
tarball, stop the service, swap the files, fix ownership, start the service. You
do that three times happily and get sloppy on the fourth.

## The finished files

| File                                                                            | Purpose                                                              |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| [`update-fxserver.sh`](https://uploads.musiker15.de/fivem/update-fxserver.sh)   | the updater this tutorial explains                                   |
| [`install-fxserver.sh`](https://uploads.musiker15.de/fivem/install-fxserver.sh) | interactive installer that sets up unit, updater and cron in one run |
| [`fivem.service`](https://uploads.musiker15.de/fivem/fivem.service)             | the systemd unit from step 1 as a commented template                 |
| [`txadmin-vhost.conf`](https://uploads.musiker15.de/fivem/txadmin-vhost.conf)   | the Apache vHost from step 2                                         |

<Callout type="warning">
**No `curl … | sudo bash`.** A script that runs as root and rebuilds half your
server deserves to be read first. Downloading and running are two separate steps
throughout this guide, and that is deliberate.
</Callout>

## Requirements

- a running FXServer as a systemd service, see
  [step 1](/en/docs/fivem/installation)
- artifact and server data separated into two directories

```
/opt/fivem/
├── server/          ← the artifact. run.sh + alpine/. Replaced on every update
└── server-data/     ← your resources/, server.cfg, cache/. Left alone
```

<Callout type="danger">
**The update script may only ever write inside `server/`.** With both in the
same directory you lose resources and configuration on the very first update.
If yours are currently together, pull them apart before the first run.
</Callout>

```bash
apt update
apt install -y curl tar xz-utils jq cron
```

`jq` is not strictly required, the script has a `grep` fallback. But that
fallback needs `grep -P`, which is missing on trimmed-down systems using
BusyBox. Installing `jq` sidesteps the question.

## Step 3.1: understanding the changelog API

The whole automation hangs off a single address:

```bash
curl -fsSL https://changelogs-live.fivem.net/api/changelog/versions/linux/server | jq
```

Four fields matter:

| Field                  | Contents                               |
| ---------------------- | -------------------------------------- |
| `recommended`          | build number of the recommended build  |
| `recommended_download` | direct URL to the matching `fx.tar.xz` |
| `latest`               | build number of the newest build       |
| `latest_download`      | direct URL to that one                 |

That removes the manual lookup of build numbers. The script puts the desired
channel into a variable and reads the matching `_download` field.

<Callout type="warning">
**On a production server the configuration belongs on `recommended`, not
`latest`.** The newest build is the newest one, not the tested one. A nightly
cron that pulls `latest` unattended eventually picks up an incompatibility that
only shows the next evening, with players on the server. `recommended` lags a
few days behind and that is exactly why it is the right choice.
</Callout>

## Step 3.2: install the update script

```bash
curl -fsSL https://uploads.musiker15.de/fivem/update-fxserver.sh \
  -o /usr/local/bin/update-fxserver.sh

# Read it first, then make it executable
less /usr/local/bin/update-fxserver.sh
chmod 0755 /usr/local/bin/update-fxserver.sh
```

Only the five values in the header need adjusting:

```bash
FX_DIR="/opt/fivem/server"       # artifact folder (run.sh + alpine/)
FX_USER="fivem"                  # owner of the files
FX_GROUP="fivem"                 # group
SERVICE="fivem"                  # systemd unit name without .service
CHANNEL="recommended"            # "recommended" or "latest"
```

### How a run goes

1. Determine the version through the API. If that number is already in
   `.installed-version`, the run ends here without touching the server.
2. Download and extract the artifact into `/tmp`. **The server keeps running.**
3. Stop the service. Move the old `alpine/` and `run.sh` to `.previous`.
4. Put the new artifact in place, `chmod +x`, `chown` to the service user.
5. Start the service and wait 15 seconds. If it is up, `.previous` is removed.
   If it is not, the previous state is restored and started.

### Four decisions that make the difference

**Download first, stop second.** Downloading and extracting happen entirely in
`/tmp` before the service is touched. If the API is unreachable or the archive
is broken, the script aborts and the server just keeps running. A script that
stops first and then finds out there is no download leaves a dead server behind.

**Move instead of delete.** The old `alpine/` goes to `.previous`, not to the
bin. If the swap goes wrong, or the service does not come back up, the `restore`
function puts the previous state back and starts it.

<Callout type="tip">
The 15 second wait is deliberately generous. An FXServer failing on a broken
resource takes a few seconds to get there. Wait only two seconds and you get a
cheerful "running" and find the corpse the next morning.
</Callout>

**Locate `run.sh` with `find` rather than guessing.** The archive layout has
changed in the past, sometimes with a wrapper folder, sometimes without.
`find -maxdepth 2` catches both, and the script aborts cleanly if it finds
nothing at all.

**`chown -R` after every swap.** The script runs as root and `cp -a` preserves
ownership from the archive. Without the `chown` the new files belong to root and
the service, running as `fivem`, no longer starts.

## Step 3.3: cron entry

```bash
crontab -e
```

```cron
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

# managed-by: fxserver
0 5 * * 1 /usr/local/bin/update-fxserver.sh >> /var/log/fxserver-update.log 2>&1
```

```bash
touch /var/log/fxserver-update.log
crontab -l
```

The `PATH` line is needed because cron starts with a very short `PATH`.
`systemctl` lives in `/usr/bin`, `jq` somewhere else depending on the system,
and a script that runs in the terminal but not under cron almost always has this
cause.

<Callout type="warning">
**An update is a server restart, and cron announces nothing.** The script stops
the service without warning and players get dropped. So the entry belongs at a
time when nobody is around.

With txAdmin it gets worse: txAdmin announces its own scheduled restarts in game
and knows nothing about a cron calling `systemctl stop`. Put the cron **right
after** a txAdmin restart so the two do not collide.
</Callout>

A weekly rhythm is plenty in practice. Updating daily buys nothing on
`recommended`, since that value only moves every few weeks, but it does multiply
the number of restarts.

## Step 3.4: test before the cron runs for the first time

Call it by hand once and watch:

```bash
sudo /usr/local/bin/update-fxserver.sh
```

Then test the cron path itself, because that runs in a different environment:

```bash
sudo env -i /bin/bash --noprofile --norc -c \
  'PATH=/usr/bin:/bin /usr/local/bin/update-fxserver.sh'
```

`env -i` throws away the entire environment. If the script survives that, it
will not fail under cron on a missing variable.

```bash
# What the cron run last did
tail -n 40 /var/log/fxserver-update.log

# Which version is in place
cat /opt/fivem/server/.installed-version

# Is the server up, and since when
systemctl status fivem
```

## All at once: the installer

Starting from zero, or setting up a second server, means typing the
configuration more than once. The installer asks everything a single time and
writes the unit, the update script and the cron entry from the answers.

```bash
curl -fsSL https://uploads.musiker15.de/fivem/install-fxserver.sh -o install-fxserver.sh
less install-fxserver.sh          # please actually read it
bash -n install-fxserver.sh       # syntax check, executes nothing
chmod +x install-fxserver.sh
sudo ./install-fxserver.sh
```

It asks, in order: artifact and data directory, user and group, unit name, start
mode (txAdmin or direct), destination path and channel for the updater, cron
schedule. **Nothing is written before a summary** that shows everything again,
and the confirmation defaults to no.

<Callout type="note">
The installer aborts if the artifact and data directories are identical. That is
not pedantry, it is the mistake that costs you your `resources/` on the first
update.
</Callout>

Three things a homegrown installer easily gets wrong, and which this one
deliberately handles differently:

- **Ask, then summarize, then write.** An installer that creates something after
  every question leaves half a state behind when it is aborted in the middle.
- **Two separate heredocs when generating the update script.** The header with
  the values gets expanded (`<< CONF`), the logic part must not be
  (`<< 'LOGIC'`). Otherwise the installing shell replaces every `$FX_DIR` and
  `$0` in the generated script with its own, usually empty, value. The installer
  then checks the result with `bash -n`.
- **Filter out your own previous cron lines**, including the `PATH=` line.
  Otherwise one more of those piles up on every further run.

## Common problems

| Message or symptom                           | Cause                                  | Fix                                      |
| -------------------------------------------- | -------------------------------------- | ---------------------------------------- |
| `/usr/bin/env^M: bad interpreter`            | file has CRLF instead of LF            | `sed -i 's/\r$//' update-fxserver.sh`    |
| `Could not determine the download URL.`      | `jq` missing and `grep -P` unsupported | `apt install jq`                         |
| Works in the terminal, not under cron        | cron starts with a minimal `PATH`      | add the `PATH=` line, see step 3.3       |
| Service will not start after the update      | the new files are owned by root        | check `chown -R fivem:fivem`             |
| Port 30120 already in use on start           | `KillMode=process`, children survive   | switch to `KillMode=mixed`               |
| Resources gone after an update               | `FX_DIR` points at the data directory  | fix `FX_DIR`, point it at `server/` only |
| Server hits incompatibilities                | channel is set to `latest`             | set `CHANNEL="recommended"`              |
| Players dropped in the middle of the evening | cron time falls into prime time        | move the window                          |
| Update runs but never changes anything       | the version is already current         | not an error, check `.installed-version` |

## What this deliberately does not do

**It does not verify a signature.** The download comes over HTTPS from a Cfx
address, but there is no checksum to verify the archive against. If you need
that, stay on the manual path and check the artifacts yourself.

**It does not back up `server-data/`.** The script never touches that directory,
but an update is still a good moment for a backup of the resources and the
database. That belongs in its own cron, not in this one.

**It does not roll back database migrations.** The restore path puts the
artifact files back, nothing more. Anything resources write into the database on
first start stays there.
