---
title: "Upgrade from Debian 10 to Debian 11"
description: "Step-by-step guide for the major release upgrade from Debian Buster to Bullseye."
order: 1
tags: ["debian", "upgrade"]
---

In this tutorial I'll explain step by step how to upgrade from Debian 10 to
Debian 11. No data will be lost, of course, and you can keep using the system
exactly as before.

<Callout type="info">
Debian 11 (Bullseye) is now *oldstable*. The current releases are Debian 12
(Bookworm) and Debian 13 (Trixie). The principle of a major upgrade stays the
same — you simply repeat the steps for each version (10 → 11 → 12 → 13), only
one version jump at a time and with the matching repository names.
</Callout>

First, let's check our version again:

```bash
hostnamectl
```

Next we update everything:

```bash
apt update && apt full-upgrade -y
```

Next, the package cache has to be cleared:

```bash
apt clean
```

After that, we of course need to change the repository. This can be done
either via command:

```bash
sed -i 's/buster/bullseye/g' /etc/apt/sources.list
```

or manually in `/etc/apt/sources.list`:

```
deb http://deb.debian.org/debian bullseye main contrib non-free
deb http://deb.debian.org/debian bullseye-updates main contrib non-free
deb http://security.debian.org/debian-security bullseye-security main
deb http://ftp.debian.org/debian bullseye-backports main contrib non-free
```

<Callout type="warning">
**Important:** Don't forget the `php.list`! It's usually found in
`/etc/apt/sources.list.d/`.
</Callout>

Once everything is changed, we can update all packages. For a major upgrade
the Debian release notes recommend a two-step process: first a "minimal"
upgrade (without new packages), then the full upgrade. This reduces the risk
of conflicts:

```bash
apt update
apt upgrade --without-new-pkgs -y
apt full-upgrade -y
```

This can take a while. Once it has finished, we can reboot the server:

```bash
reboot
```

Once the server is back up, we check the Debian version:

```bash
hostnamectl
```

If it now says Debian 11, everything worked correctly. We remove the no longer
needed packages and reboot the server once more afterwards:

```bash
apt-get autoremove -y
reboot
```

Once the server is back up again, we update the packages one more time:

```bash
apt update && apt full-upgrade -y
```

The upgrade from Debian 10 to Debian 11 is now successfully completed.
