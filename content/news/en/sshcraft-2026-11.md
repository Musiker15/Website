---
title: "SSHCraft: my own SSH client with self-hosted sync"
description: "SSHCraft is an open source SSH client written in Rust. It syncs hosts and keys between devices through your own server, free and end-to-end encrypted. What it does, how it came about and what comes next."
date: 2026-11-16
author: "Moritz Kohm"
tags: ["sshcraft", "ssh", "rust", "open-source", "self-hosting"]
---

The first version of **SSHCraft** is out today. It is an SSH client I have been
building over the last few days. It runs on Windows, Linux and FreeBSD, macOS
already builds, and Android and iOS will come later. The source is on
[GitHub](https://github.com/Musiker15/sshcraft) under MIT or Apache-2.0.

## Why another SSH client

I want the same hosts and keys on every device. Many SSH clients have no sync
between devices at all. Termius has one, but it costs a subscription and the
data goes through the vendor's cloud. My SSH keys have also
lived in Proton Pass for a while now instead of in files on disk, and the client
had to be able to fetch them from there.

So I wrote down what I needed: everything I like about Termius, plus free sync
through my own server, which can never read the data. That became
SSHCraft.

## What SSHCraft can do today

The base is what you would expect from an SSH client. Hosts live in groups with
tags and icons and can be imported and exported. Terminal tabs split into panes,
and broadcast sends one input to several servers at once. There are saved
workspaces, port forwarding (local, remote and as a SOCKS proxy), snippets with
history and completion, and session logs. A local terminal and serial
connections are included too.

Connections go a bit further than in Termius. SSHCraft handles jump hosts,
proxies and `ProxyCommand`. When a connection drops after sleep or a network
change, it reconnects on its own and sets the tunnels up again. It reads
`~/.ssh/config` continuously, including `Include`, and writes it back if you ask
it to. Termius imports it once.

On keys: SSHCraft generates and imports them and handles passphrases,
certificates and `authorized_keys`, and on Windows also FIDO2 and device-bound
keys. On the desktop the keys can come straight from the Proton Pass SSH agent,
so no private key is stored on disk. Passwords can be stored as a reference to a
password manager (Proton Pass, 1Password, Bitwarden or KeePassXC), and so can
TOTP codes for servers with a second factor.

In case something goes wrong, deleted hosts go to a trash, earlier versions are
kept, and there is an encrypted backup file. On Windows the app can lock itself
with Windows Hello.

### Sync through your own server

The sync server `sshcraft-server` is a single program or a Docker image, with
SQLite or PostgreSQL, behind your own reverse proxy. Encryption happens on the
device. The server only stores ciphertext and cannot read anything even if
someone takes it over.

The client creates the account key, and that key lives in Proton Pass. Every
device has its own key and can be locked out on its own. Records are signed, and
a device notices when the server tries to hand it an older state. Hosts and
groups can be shared with other people on the same server, without a team plan.

Setup is short: start the server, read the API key with
`sshcraft-server api-key show` and enter it in the app.

```bash
sshcraft-server serve --public-origin https://sync.example.org
```

My own instance has been running on my server since today, as a Docker
container with PostgreSQL behind Apache. The
[server guide](https://github.com/Musiker15/sshcraft/blob/main/docs/server.md)
explains how to set one up.

### AI agents with fixed rules

Claude Code, Codex and other agents can control SSHCraft through MCP or the
`sshcraft-cli` command line. They can list hosts, run commands, keep a shell
open, add hosts or generate keys. For each action I decide whether it is
allowed, needs my confirmation or stays blocked. The confirmation only appears
in the SSHCraft window, never in the agent's chat, and an agent never sees a
private key because SSHCraft opens the connection itself.

```bash
claude mcp add sshcraft -- sshcraft-cli mcp
```

Agent control is off on a fresh install. You turn it on under Settings › AI
agents.

### Under the hood

Private keys are only stored encrypted (XChaCha20-Poly1305) in an SQLite
database. On Windows the master key for them sits in the Credential Manager. If
a server's fingerprint changes, SSHCraft aborts the connection, also when it
reconnects automatically. It only goes on once I deliberately forget the old
fingerprint in the host settings.

## How it came about

It started on 11 November 2026 with a design and a first version in Tauri and
React, still called "Stollen" back then. By 14 November all fifteen sub-plans
were done. On the same day I decided to rewrite it completely in Rust and egui,
following the conventions of the Craft apps: an engine where every action is a
command, an interface without a webview, and a control channel that the agents
use as well. The Tauri version is kept under the tag `tauri-final`.

Since the rebuild the tests run in CI on Windows, Linux and macOS and in a
FreeBSD VM, and every one of these platforms gets a package.

## Version 0.1

The current release is 0.1.1. It has an MSI for Windows, deb, rpm, AppImage and
Flatpak for Linux, a FreeBSD package and the sync server, plus `SHA256SUMS.txt`
and an SBOM. Everything is on the
[releases page](https://github.com/Musiker15/sshcraft/releases).

<Callout type="warning" title="Unsigned and no macOS yet">
Windows and macOS would need paid certificates, which I am skipping for now. On
first start Windows will show a SmartScreen warning, so check the download
against `SHA256SUMS.txt` first. There is no macOS package yet; you can build
SSHCraft from source there.
</Callout>

A few things are still open and tracked in the
[list of gaps](https://github.com/Musiker15/sshcraft/blob/main/docs/gaps.md).
The app lock only works with Windows Hello so far, and I have not tried all of
the Linux packages by hand yet. If you find something, please open an
[issue](https://github.com/Musiker15/sshcraft/issues).

## What comes next

**SFTP** is next, since it is the biggest gap compared to Termius. After that the
work continues in several steps:

- more comfort in the terminal, and more extras there
- more options for connections and for organising hosts
- sessions that survive a dropped connection, with tmux, Mosh and Eternal
  Terminal, plus Telnet
- targets and automation

Android, iOS and iPadOS follow after that. Touch ID for the app lock on macOS is
on the list as well, but I need a Mac to test it first. The winget package has
been submitted and is waiting for review.

One idea will not end up in SSHCraft itself: a database client as a separate
app. It will reach databases on a server through a tunnel that SSHCraft opens
for it.

The [roadmap](https://github.com/Musiker15/sshcraft/blob/main/ROADMAP.md) always
has the current state. This post is also available in
[German](/de/news/sshcraft-2026-11).
