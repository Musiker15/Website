---
title: "New section: FiveM server, in three steps"
description: "A three-part series from a bare Debian box to a server that keeps itself current: installation, txAdmin behind HTTPS and automatic artifact updates. The scripts are available for download."
date: 2026-08-25
author: "Moritz Kohm"
tags: ["tutorials", "fivem", "debian", "apache"]
---

There is a new section in the guides: [FiveM server](/en/docs/fivem). The Debian
tutorials have been a flat list so far, and that does not fit something where
each part builds on the last. These three belong together and are meant to be
worked through in order.

The series came out of the setup on my own server, including the mistakes that
turned up along the way.

## Step 1: install the FiveM server

[Go to the tutorial](/en/docs/fivem/installation)

From a bare Debian box to a running service: a dedicated system user, the
FXServer artifact, separating artifact from server data, a systemd unit and the
first start with txAdmin.

The point where this guide differs from the usual ones: txAdmin listens on
`127.0.0.1` from the very beginning. The initial setup runs through an SSH
tunnel instead of an open port. That costs twenty seconds and removes the window
in which a fresh management panel sits open on the internet.

## Step 2: txAdmin behind a reverse proxy

[Go to the tutorial](/en/docs/fivem/txadmin-reverse-proxy)

Apache 2.4 in front, HTTPS on its own subdomain, and a WebSocket switch so the
live console is actually live. Plus three things that sit in almost every copied
configuration and quietly cause damage:

- **Without the WebSocket upgrade** socket.io falls back to HTTP polling. The
  panel keeps working, just sluggishly, which is why it goes unnoticed for
  months.
- **Setting `X-Forwarded-For` by hand** duplicates the client IP, because
  `mod_proxy_http` already appends the header itself. The ban view then shows
  nonsense.
- **A `connect-src` left over from an older configuration** blocks the WebSocket
  connection and the live console simply stays empty.

## Step 3: update artifacts automatically

[Go to the tutorial](/en/docs/fivem/auto-update)

A script that fetches the current version from the Cfx changelog API, swaps the
artifact and restarts the service. Two properties mattered to me: it downloads
and extracts everything **before** the server is stopped, and the old artifact
is moved aside rather than deleted. If the service does not come back within 15
seconds, the script restores the previous state and starts it.

## The scripts

All four files live under `uploads.musiker15.de/fivem/`:

| File                                                                            | Purpose                                          |
| ------------------------------------------------------------------------------- | ------------------------------------------------ |
| [`install-fxserver.sh`](https://uploads.musiker15.de/fivem/install-fxserver.sh) | interactive installer for unit, updater and cron |
| [`update-fxserver.sh`](https://uploads.musiker15.de/fivem/update-fxserver.sh)   | the updater on its own                           |
| [`fivem.service`](https://uploads.musiker15.de/fivem/fivem.service)             | systemd unit as a commented template             |
| [`txadmin-vhost.conf`](https://uploads.musiker15.de/fivem/txadmin-vhost.conf)   | Apache vHost for the panel                       |

Deliberately, none of the tutorials contains a `curl … | sudo bash`. A script
that runs as root and rebuilds half your server deserves to be read first. So
downloading and running are two separate steps everywhere.
