---
title: "unattended-upgrades: automatic updates for Debian and Ubuntu"
description: "Install security updates automatically, add third-party sources such as Sury (PHP), MariaDB or Docker, restart services and the server properly, and prove at the end that it actually works."
date: 2026-11-19
order: 10
tags: ["debian", "ubuntu", "apt", "unattended-upgrades", "security", "php", "sury"]
---

`unattended-upgrades` installs updates on Debian and Ubuntu without anyone
watching. Once a day it checks whether anything new is available for the
installed packages and installs it, provided the package source is on its
allow list. If you run a server and don't want to type `apt upgrade` every
morning, you will end up with it sooner or later.

Turning it on takes five minutes. The catch is the default, which only allows
the distribution's own sources. PHP from Sury, MariaDB from the vendor
repository, Node from NodeSource and Docker all get no automatic updates.
There is no warning and no error, and the daily run reports success. Those are
usually the packages that face the network.

In this tutorial you set up unattended-upgrades completely, add the
third-party sources and check at the end that everything is actually covered.
The configuration comes from my own server (Debian 13), and I ran into every
one of the pitfalls further down myself.

<Callout type="note">
unattended-upgrades only updates within a release. Moving from Debian 12 to 13
or from Ubuntu 22.04 to 24.04 is still manual work; see
the [Debian 10 to 11 upgrade guide](/en/docs/debian-tutorials/debian-10-zu-11)
for the procedure.
</Callout>

## Requirements

- Debian 12 or 13, or Ubuntu 22.04 or 24.04
- root access or a user with `sudo`
- for mail reports, working outgoing mail (exim4 or Postfix with a smarthost,
  for example); everything else works without it

## How the pieces fit together

The schedule and the actual configuration live in different places, and one of
the pitfalls later comes from exactly that. Here is the overview first:

| Part                      | Where                  | Job                                                               |
| ------------------------- | ---------------------- | ----------------------------------------------------------------- |
| `apt-daily.timer`         | systemd                | refreshes the package lists twice a day, with a random delay      |
| `apt-daily-upgrade.timer` | systemd                | starts the upgrade run, by default at 06:00 plus up to 60 minutes |
| `20auto-upgrades`         | `/etc/apt/apt.conf.d/` | switches both on                                                  |
| `50unattended-upgrades`   | `/etc/apt/apt.conf.d/` | the package's configuration, including the allowed sources        |
| `needrestart`             | separate package       | restarts services that have an updated library loaded             |

Whether a package gets updated has nothing to do with its name. What counts is
the origin of its package source. Every source writes fields such as `Origin`,
`Label` and `Codename` into its `Release` file. unattended-upgrades compares
them with its `Origins-Pattern` list and skips the package if no entry matches.

## Install and enable

On Ubuntu Server the package is usually installed and active already. On
Debian it depends on whether "install security updates automatically" was
selected during installation. To be safe:

```bash
sudo apt update
sudo apt install unattended-upgrades apt-listchanges
sudo dpkg-reconfigure -plow unattended-upgrades
```

Answer "Yes" in the dialog. Afterwards `/etc/apt/apt.conf.d/20auto-upgrades`
contains:

```ini
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
```

The `1` means every day. To see whether both timers are running:

```bash
systemctl list-timers 'apt-daily*'
```

## What the default covers

On Debian 13, `/etc/apt/apt.conf.d/50unattended-upgrades` contains (comments
removed):

```ini
Unattended-Upgrade::Origins-Pattern {
        "origin=Debian,codename=${distro_codename},label=Debian";
        "origin=Debian,codename=${distro_codename},label=Debian-Security";
        "origin=Debian,codename=${distro_codename}-security,label=Debian-Security";
};
```

That is the main archive plus security updates. The point updates from
`trixie-updates` (or `bookworm-updates`) are only there as a comment. Ubuntu
uses `Allowed-Origins` with `${distro_id}:${distro_codename}-security` and the
ESM sources, and `-updates` is commented out there as well.

unattended-upgrades fills in `${distro_codename}` itself, with `trixie`,
`bookworm`, `noble` and so on. A nice side effect: after a distribution
upgrade the patterns point at the new release on their own.

## Create a file of your own

The obvious idea is to edit `50unattended-upgrades` directly. Leave it alone.
The file belongs to the package. Once you change it, dpkg asks on the next
update of unattended-upgrades whether you want to keep your version. Nobody
answers that question during an unattended run, so the package is skipped and
the updater itself stays out of date.

Put your settings into a separate file that is read after the 50 instead:

```bash
sudo nano /etc/apt/apt.conf.d/52unattended-upgrades-local
```

apt reads `apt.conf.d` in alphabetical order. For single values the later file
wins; lists such as `Origins-Pattern` get appended. The Debian entries from the
50 stay valid and yours are added to them.

All of the following sections write into this one file. You will find it in
full further down.

## Third-party sources, using Sury as the example

Ondřej Surý maintains the PHP packages in Debian and also runs his own
repository with current PHP versions (and Apache2, if you want it). On Debian
it is `packages.sury.org`, on Ubuntu it is the PPA `ondrej/php`. A lot of
servers get their PHP from there, and without extra configuration that PHP
gets no security updates.

### Add the repository (Debian)

These are the steps from the official instructions on packages.sury.org,
written in the deb822 format that Debian 13 now uses itself:

```bash
sudo apt install -y ca-certificates curl
curl -fsSLo /tmp/debsuryorg-archive-keyring.deb https://packages.sury.org/debsuryorg-archive-keyring.deb
sudo dpkg -i /tmp/debsuryorg-archive-keyring.deb

. /etc/os-release
sudo tee /etc/apt/sources.list.d/php.sources > /dev/null <<EOF
Types: deb
URIs: https://packages.sury.org/php/
Suites: ${VERSION_CODENAME}
Components: main
Signed-By: /usr/share/keyrings/debsuryorg-archive-keyring.gpg
EOF

sudo apt update
```

Debian 12 works the same way. If you prefer the old one-line format:

```bash
echo "deb [signed-by=/usr/share/keyrings/debsuryorg-archive-keyring.gpg] https://packages.sury.org/php/ $(. /etc/os-release && echo $VERSION_CODENAME) main" \
  | sudo tee /etc/apt/sources.list.d/php.list
sudo apt update
```

### Add the repository (Ubuntu)

```bash
sudo apt install -y software-properties-common
sudo add-apt-repository ppa:ondrej/php
sudo apt update
```

### Install PHP with a version number

```bash
sudo apt install php8.5-fpm php8.5-cli php8.5-mysql php8.5-curl
```

Use the packages with a version number (`php8.5-fpm`) and skip the ones
without (`php-fpm`). The unversioned packages are metapackages that always
point to the newest PHP version in Sury's repository. If you installed them, a
later update may pull in a new major version of PHP, and that is not a
decision a nightly run should make. With the version number you only get
security and bug fixes within 8.5.

### Find the origin

`apt-cache policy` shows the fields of every source, as long as you run it
without a package name. With a package name, the lines you need here are
missing.

```bash
LC_ALL=C apt-cache policy | grep -A1 sury
```

On my server that looks like this:

```text
 500 https://packages.sury.org/php trixie/main amd64 Packages
     release o=deb.sury.org,a=trixie,n=trixie,c=main,b=amd64
```

`o=` is the origin, `n=` the codename, `a=` the suite and `l=` the label (Sury
doesn't set one). You can also read the Release files directly:

```bash
grep -h -E "^(Origin|Label|Suite|Codename):" /var/lib/apt/lists/*Release
```

On Debian, Sury's origin is `deb.sury.org` for both the PHP and the Apache2
repository. On Ubuntu it is `LP-PPA-ondrej-php` and `LP-PPA-ondrej-apache2`.

### Add the pattern

In `52unattended-upgrades-local` (Debian):

```ini
Unattended-Upgrade::Origins-Pattern {
        // Debian point updates, commented out in the default
        "origin=Debian,codename=${distro_codename}-updates,label=Debian";

        // PHP (and Apache2, if used) from Sury
        "origin=deb.sury.org,codename=${distro_codename}";
};
```

On Ubuntu:

```ini
Unattended-Upgrade::Origins-Pattern {
        "origin=LP-PPA-ondrej-php,codename=${distro_codename}";
        // only if the Apache2 PPA is added
        "origin=LP-PPA-ondrej-apache2,codename=${distro_codename}";
};
```

A pattern can use the keys `origin`, `label`, `codename`, `archive` (the
suite), `component` and `site` (the host name of the source). If an entry has
several keys, all of them have to match.

### Other common sources

These values come from my Debian server. Check them with `apt-cache policy`
before you copy them anyway, since vendors can change their Release files at
any time.

| Source                          | Pattern                                                         |
| ------------------------------- | --------------------------------------------------------------- |
| MariaDB (dlm.mariadb.com)       | `"origin=MariaDB,codename=${distro_codename}";`                 |
| PostgreSQL (apt.postgresql.org) | `"origin=apt.postgresql.org,codename=${distro_codename}-pgdg";` |
| Docker CE                       | `"origin=Docker,label=Docker CE";`                              |
| Node.js (NodeSource)            | `"site=deb.nodesource.com";`                                    |
| pgAdmin 4                       | `"origin=pgAdmin Development Team";`                            |

Two of them are odd. NodeSource literally writes `. nodistro` as its origin
(with a dot and a space) and `nodistro` as its codename. If you use
`${distro_codename}` there out of habit, the pattern never matches anything;
`site=` avoids the problem. Docker has no codename at all, hence the label.

<Callout type="warning">
Whatever you add here also gets restarted. A MariaDB or PostgreSQL update
restarts the database, a Docker update restarts the daemon and with it every
container. That usually takes a few seconds, but it happens at night without
you. For MariaDB the repository you added matters too: `11.rolling` also
delivers jumps such as 11.8 to 11.9, while a fixed `11.8` only delivers patches
within that version. You set this in the source under
`/etc/apt/sources.list.d/`; unattended-upgrades has no setting for it.
</Callout>

## Exclude individual packages

If a source should be included in general but one package from it should not,
use the blacklist. The entries are regular expressions matched against the
start of the package name:

```ini
Unattended-Upgrade::Package-Blacklist {
        "mariadb-server";
        // everything starting with docker-ce
        "docker-ce";
};
```

## Restart services with needrestart

An update replaces the file on disk. A running service still has the old
library in memory, so a patched `libssl3` only protects Apache once Apache
restarts. `needrestart` takes care of that if it is configured correctly.

```bash
sudo apt install needrestart
```

This is where the next silent pitfall waits. By default `$nrconf{restart}` is
`'i'`, interactive, and needrestart asks which services to restart. During an
unattended run there is nobody to answer, so nothing happens: the package is
updated, the run reports success, and Apache keeps using the old library. The
default may differ between versions and distributions. Don't rely on it and set
the value yourself:

```bash
sudo tee /etc/needrestart/conf.d/99-local-restart.conf > /dev/null <<'EOF'
# Restart affected services automatically
$nrconf{restart} = 'a';

# No kernel hints from needrestart, Automatic-Reboot handles that
$nrconf{kernelhints} = 0;

1;
EOF
sudo perl -c /etc/needrestart/conf.d/99-local-restart.conf
```

The file is Perl, which is why it is checked with `perl -c`. Keep the `1;` at
the end.

## Reboot after kernel updates

No service restart loads a new kernel; that takes a reboot. After kernel and
libc updates, apt creates `/var/run/reboot-required`, and unattended-upgrades
can then reboot the server by itself:

```ini
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-WithUsers "true";
Unattended-Upgrade::Automatic-Reboot-Time "05:30";
```

Without these lines the patched kernel sits unused on disk for as long as it
takes, while every check says the system is up to date.
`Automatic-Reboot-WithUsers` is set to `true` so that a forgotten SSH session
doesn't block the reboot.

### The reboot time has to come after the upgrade run

This one caught me. unattended-upgrades doesn't reboot the server itself; it
calls `/sbin/shutdown -r 05:30`, and to systemd that always means the next
05:30. By default the upgrade run starts at 06:00 with a random delay of up to
60 minutes. By then 05:30 has passed, so the reboot moves to the following
day. The kernel runs unpatched for almost a whole day even though a reboot
window is configured.

You can either move the reboot time behind the window (`07:30`, for example) or
start the upgrade run earlier. For the second option:

```bash
sudo systemctl edit apt-daily-upgrade.timer
```

Add:

```ini
[Timer]
OnCalendar=
OnCalendar=*-*-* 04:30
RandomizedDelaySec=15m
```

The empty `OnCalendar=` line is required. `OnCalendar` is a list, and without
the reset 04:30 would be added on top of 06:00. Then:

```bash
sudo systemctl daemon-reload
sudo systemctl restart apt-daily-upgrade.timer
systemctl list-timers apt-daily-upgrade.timer
```

If anything else runs at night, a backup for example, pick a reboot time that
doesn't hit it halfway through.

## Mail reports

```ini
Unattended-Upgrade::Mail "root";
Unattended-Upgrade::MailReport "on-change";
```

An email address works instead of `root`. `MailReport` takes three values:
`always` sends a mail every day, `only-on-error` only on errors, and
`on-change` whenever something was actually installed or went wrong. I use
`on-change`. Quiet days stay quiet, and when the system has changed, I want to
know.

Mail goes out through `/usr/sbin/sendmail`, which every mail server provides,
or `/usr/bin/mail` as a fallback. Before you rely on it, send a test mail:

```bash
printf "Subject: Test mail from the server\n\nTest\n" | sudo /usr/sbin/sendmail root
```

If that one doesn't arrive, the report from unattended-upgrades won't either.

## Clean up

```ini
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-New-Unused-Dependencies "true";
Unattended-Upgrade::Remove-Unused-Dependencies "false";
```

Removing old kernels matters most when `/boot` is a small separate partition.
If it fills up, the next kernel update fails, and it fails while nobody is
watching. `Remove-Unused-Dependencies` stays off because it also removes
packages you installed by hand that just happen to have nothing depending on
them right now.

## The complete file

This is `/etc/apt/apt.conf.d/52unattended-upgrades-local` for a Debian server
with PHP from Sury and MariaDB:

```ini
// Additions to 50unattended-upgrades. Lists are appended,
// the Debian entries from the 50 stay valid.

Unattended-Upgrade::Origins-Pattern {
        "origin=Debian,codename=${distro_codename}-updates,label=Debian";
        "origin=deb.sury.org,codename=${distro_codename}";
        "origin=MariaDB,codename=${distro_codename}";
};

// Report only when something changed or went wrong
Unattended-Upgrade::Mail "root";
Unattended-Upgrade::MailReport "on-change";

// Reboot only if /var/run/reboot-required exists.
// The upgrade run is moved to 04:30 with a timer override.
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-WithUsers "true";
Unattended-Upgrade::Automatic-Reboot-Time "05:30";

// Clean up
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-New-Unused-Dependencies "true";
Unattended-Upgrade::Remove-Unused-Dependencies "false";

// Small steps, so an interruption doesn't leave a half-upgraded system
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::SyslogEnable "true";
Acquire::Retries "3";

// Download packages in advance, clean the package cache weekly
APT::Periodic::Download-Upgradeable-Packages "1";
APT::Periodic::AutocleanInterval "7";
```

### Check the syntax before the file goes live

A typo in a file under `apt.conf.d` breaks every apt command, including the
one you would use to fix it. Write the file to `/tmp` first and check it there:

```bash
apt-config dump -c /tmp/52unattended-upgrades-local > /dev/null && echo "Syntax ok"
sudo install -m 644 /tmp/52unattended-upgrades-local /etc/apt/apt.conf.d/
```

To check that the lists were merged correctly:

```bash
apt-config dump | grep "Origins-Pattern::"
```

## Check that it actually works

Reading the configuration proves nothing, because a wrong pattern looks exactly
like a right one. The dry run is what tells you:

```bash
sudo unattended-upgrade --dry-run --debug
```

On a system with a non-English locale, parts of the output are translated (in
German it says "Erlaubte Ursprünge sind" instead of "Allowed origins are"). Put
`LC_ALL=C` in front of the two filters below:

```bash
# Which patterns were read?
sudo LC_ALL=C unattended-upgrade --dry-run --debug 2>&1 | grep "Allowed origins"

# Which sources are excluded?
sudo LC_ALL=C unattended-upgrade --dry-run --debug 2>&1 | grep "Marking not allowed"
```

The first line only shows that your file was read. The second one is the
honest answer: every source listed there with the pin `-32768` will not be
updated. If Sury no longer shows up, the pattern works. If a source you wanted
is still listed, one field in its pattern is wrong. If the second command
prints nothing at all, every source is covered.

After the first real run, have a look at the logs:

```bash
sudo less /var/log/unattended-upgrades/unattended-upgrades.log
sudo less /var/log/unattended-upgrades/unattended-upgrades-dpkg.log
journalctl -u apt-daily-upgrade.service --since today
```

## Common problems

| Symptom                                                                  | Cause                                                   | Fix                                                                                       |
| ------------------------------------------------------------------------ | ------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Packages from third-party sources stay old while the log reports success | source missing from `Origins-Pattern`                   | find the origin with `apt-cache policy`, add a pattern, dry run                           |
| Pattern added, source still listed under `Marking not allowed`           | one field doesn't match, often the codename             | read the Release file, e.g. `nodistro` for NodeSource                                     |
| Log: `Package … has conffile prompt and needs to be upgraded manually`   | a configuration file of the package was changed locally | run `sudo apt upgrade` once by hand, put your own changes into separate files from now on |
| Reboot happens a day late                                                | reboot time is before the upgrade run                   | start the timer earlier or move the reboot time later                                     |
| Services keep running with old libraries after updates                   | needrestart is set to interactive                       | set `$nrconf{restart} = 'a';`                                                             |
| No mail                                                                  | no working outgoing mail                                | send a test mail, set up a mail server                                                    |
| Kernel update fails                                                      | `/boot` is full                                         | `Remove-Unused-Kernel-Packages`, once `sudo apt autoremove --purge`                       |

## After a distribution upgrade

Patterns using `${distro_codename}` follow the upgrade on their own. A
hard-coded name such as `bookworm` stops matching afterwards. On top of that,
not every third-party source carries the new release from day one; MariaDB's
tools repository, for example, has no trixie suite (as of November 2026). So
after every upgrade, repeat the dry run and check `Marking not allowed`.
