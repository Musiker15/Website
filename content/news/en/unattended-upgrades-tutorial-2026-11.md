---
title: "New tutorial: automatic updates with unattended-upgrades"
description: "How Debian and Ubuntu install security updates on their own, why PHP from Sury is left out by default, and three silent pitfalls I found on my own server."
date: 2026-11-19
author: "Moritz Kohm"
tags: ["tutorials", "debian", "ubuntu", "security", "php"]
---

There is a new tutorial in the [Debian guides](/en/docs/debian-tutorials):
[unattended-upgrades: automatic updates for Debian and Ubuntu](/en/docs/debian-tutorials/unattended-upgrades).

unattended-upgrades had been running on my server for a long time. Both timers
were active, the last run was clean, nothing was broken. When I took a closer
look in September, the Debian default still covered a lot less than it seemed
to, and that is where the tutorial came from.

## What it covers

Everything from installing the package to proving that it works:

- Enabling it, with a configuration file of your own so the package's file
  stays untouched (the tutorial explains why that matters).
- Adding third-party sources, in detail for Sury's PHP repository on Debian
  and the `ondrej/php` PPA on Ubuntu. On top of that, the matching patterns for
  MariaDB, PostgreSQL, Docker, NodeSource and pgAdmin, all checked on my server.
- needrestart, so services actually load the new libraries.
- Automatic reboots after kernel updates, mail on changes and keeping `/boot`
  from filling up.
- A table of the usual error patterns.

## Three pitfalls that don't look like errors

All three have one thing in common: the system reports success while something
important doesn't happen.

First, by default only packages from Debian or Ubuntu get updates. PHP from
Sury, MariaDB from the vendor repository, Node and Docker stay at whatever
version they had, and the log says "success" every day.

Second, needrestart asks before it restarts services. When nobody is there to
answer, the new library sits on disk while Apache and PHP-FPM keep using the
old one.

The third one caught me myself. unattended-upgrades schedules the reboot with
`shutdown -r` at a fixed time. If that time is earlier than the upgrade run
(05:30 for me, with the run starting between 06:00 and 07:00), the reboot moves
to the next day, and the new kernel sits unused for about 22 hours.

The tutorial shows how to spot each of these in the dry run, which tells you
more than the configuration does. There is also a
[German version](/de/docs/debian-tutorials/unattended-upgrades).
