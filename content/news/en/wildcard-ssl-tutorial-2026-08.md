---
title: "New tutorial: wildcard SSL with acme.sh and IONOS DNS"
description: "One certificate for every subdomain, issued over DNS-01 and renewed automatically by a systemd timer. Including the pitfalls that cost me time."
date: 2026-08-06
author: "Moritz Kohm"
tags: ["tutorials", "ssl", "apache", "debian"]
---

There is a new tutorial in the [Debian guides](/en/docs/debian-tutorials):
[Wildcard SSL with acme.sh and IONOS DNS](/en/docs/debian-tutorials/acme-sh-wildcard-ionos).

It came out of a migration on my own server. Instead of issuing a separate
certificate for every new subdomain, a single `*.example.com` now covers
everything, and it renews without me touching it.

## What it covers

A wildcard certificate cannot be validated through the usual file on the web
server. DNS is the only option, which means the ACME client needs access to the
DNS provider's API. The tutorial sets up the whole chain:

- **DNS-01 through the IONOS API**, including how to create the API key.
- **Installing acme.sh** from the tarball rather than the install script,
  because the latter has a bug when setting the home directory.
- **Issuing and deploying** to `/etc/apache2/ssl`, with a check of the target
  directory beforehand.
- **Automatic renewal** via a systemd timer instead of the cron job acme.sh
  creates on its own.
- **Several domains** on the same server, each with its own reload hook.

## The pitfalls are the actual content

The plain sequence of commands is in every other blog post. What I put in
instead are the points where I got stuck myself:

- **IONOS's ACME server** behaves differently than expected during the finalize
  step. The tutorial shows how to recognise that, and why ZeroSSL is the calmer
  choice here.
- **`apachectl -t` does not check** whether the key and the certificate belong
  together. The configuration is syntactically fine and Apache still refuses to
  start. That is why the deploy script compares the public keys itself and
  would rather not reload at all than reload something broken.
- **`grep -r` does not follow symlinks.** If you use it to find which vhosts
  still point at the old certificate path, you miss exactly the files in
  `sites-enabled`.

On top of that there is an error table for the common messages and a section on
uninstalling, in case you want to go back.

## Why the effort pays off

The CA/Browser Forum passed ballot SC-081v3, a staged plan for maximum
certificate lifetimes: 200 days from March 2026, 100 days from March 2027, and
47 days from March 2029. Maintaining certificates by hand becomes impractical
sooner or later. Automate the renewal once and those dates stop being your
problem.

Like all the others, the tutorial is also available
[in German](/de/docs/debian-tutorials/acme-sh-wildcard-ionos).
