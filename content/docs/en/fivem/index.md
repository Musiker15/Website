---
title: "FiveM server"
description: "Set up a FiveM server on Debian, run txAdmin safely behind Apache and keep the artifacts up to date automatically. Three steps, each building on the last."
date: 2026-08-25
order: 4
tags: ["fivem", "fxserver", "txadmin", "debian", "linux"]
---

This series sets up a FiveM server from scratch, in a way that does not leave an
open management panel on the internet and does not demand manual work on every
artifact change.

The three parts build on each other. Starting from zero means working through
them in order.

## The series

- **[Step 1: install the FiveM server](/en/docs/fivem/installation)**
  FXServer artifact, a dedicated system user, a systemd unit and the first start
  with txAdmin. Port 40120 is blocked in the firewall from the very beginning,
  and the initial setup goes through an SSH tunnel.

- **[Step 2: txAdmin behind a reverse proxy](/en/docs/fivem/txadmin-reverse-proxy)**
  Apache 2.4 in front, HTTPS on its own subdomain, WebSockets for the live
  console. After that the SSH tunnel is obsolete and port 40120 is closed for
  good.

- **[Step 3: update artifacts automatically](/en/docs/fivem/auto-update)**
  An update script that fetches the current version from the Cfx changelog API,
  swaps only the artifact files and restores the previous state if the server
  fails to come back. Plus the matching cron entry.

## What you need up front

- a Debian server (11 or newer) with root access
- a server key from the [Cfx.re keymaster](https://portal.cfx.re/)
- for step 2, Apache 2.4 with a valid certificate, either via
  [Certbot](/en/docs/debian-tutorials/certbot) or via a
  [wildcard certificate](/en/docs/debian-tutorials/acme-sh-wildcard-ionos)

<Callout type="warning">
A FiveM server loads third-party resources and executes their code. It belongs
under a dedicated system user, not under root. Step 1 creates that user and the
later steps assume it exists.
</Callout>

## If you only need one part

Steps 2 and 3 can be applied to an already running server. Both state their
assumptions up front, and where your directory layout is allowed to differ from
the examples.
