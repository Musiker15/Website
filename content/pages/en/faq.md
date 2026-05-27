---
title: "FAQ"
description: "Frequently asked questions about the tutorials, server stack and Musiker15 itself."
order: 3
---

## General

### What is musiker15.de?

A personal collection of tutorials on Linux/Debian servers, Apache setups,
databases and self-hosting. The site also serves as a profile and links
to my commercial projects at [MSK Scripts](https://www.msk-scripts.de).

### Are the tutorials maintained?

Yes — whenever something important changes (new Debian release, new MariaDB,
security topics), I update the corresponding guides. The "Last updated"
date on each page reflects the current state.

### Which systems do the tutorials work on?

Primarily **Debian 11 / 12** and **Ubuntu LTS**. Most commands also run
on other Debian derivatives. For RHEL / Rocky / Alma, `apt` commands need
to be translated to `dnf`.

## Tutorials

### Why are you still using Apache instead of Nginx?

Personal preference and a setup that has grown over the years. All my
servers run Apache2 with `mod_proxy`, which is fully sufficient for my
projects (Next.js reverse proxies, PHP applications, static sites).

### What hardware requirements do the server tutorials have?

Most tutorials run on any current Debian VPS or mini PC. Rule of thumb:

| Use case | Recommendation |
|---|---|
| Pure static site | 1 vCPU, 1 GB RAM |
| LAMP stack with phpMyAdmin | 2 vCPUs, 2 GB RAM |
| TeamSpeak + Sinusbot | 2 vCPUs, 4 GB RAM |
| Multiple FiveM bots at once | 4 vCPUs, 8 GB RAM |

### I get "Permission denied" when running a command

The tutorials often assume you're logged in as root. If you work as a
regular user, prefix the command with `sudo`:

```bash
sudo apt update && sudo apt full-upgrade -y
```

### Does this also work on Ubuntu?

Yes — Ubuntu is based on Debian, so the `apt` commands are identical.
Some package names or paths may differ slightly.

## Sinusbot / TeamSpeak

### Which TeamSpeak client version does Sinusbot support?

Currently up to **3.5.3** maximum. Newer client versions are not
compatible (as of the date of the tutorial).

### My Sinusbot doesn't start — what now?

Common causes:

1. Wrong user permissions → `chown -R sinusbot:sinusbot /opt/sinusbot/`
2. TeamSpeak client plugin missing → copy `libsoundbot_plugin.so` into
   `TeamSpeak3-Client-linux_amd64/plugins/`
3. Terms of service not accepted after update → start client manually
   once and accept

## MSK Scripts

### What's the difference between Musiker15 and MSK Scripts?

**Musiker15** = my personal online profile (this site).
**MSK Scripts** = my business area for FiveM scripts and Discord bots
([msk-scripts.de](https://www.msk-scripts.de)).

### Where can I find documentation for MSK scripts?

Full documentation at [docu.msk-scripts.de](https://docu.msk-scripts.de).

## Contact

### How can I reach you fastest?

Discord is the fastest way: [discord.gg/5hHSBRHvJE](https://discord.gg/5hHSBRHvJE).
For legal or business topics, please email `info@musiker15.de`.
