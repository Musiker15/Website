---
title: "php2shell: two critical PHP flaws and what my server has to say"
description: "On 21 October 2026 PHP closed two flaws that allow code execution without a login. What is behind them, how to check your server, and what the check turned up on mine."
date: 2026-10-22
author: "Moritz Kohm"
tags: ["php", "security", "debian", "apache", "nextcloud"]
---

On 21 October 2026 the PHP project released versions 8.5.12, 8.4.27, 8.3.36
and 8.2.35. They close two flaws that go by the name **php2shell**:
CVE-2026-109618 and CVE-2026-109619. Both let an attacker run code on the
server without logging in. The PHP team rates both at CVSS 4.0 9.2, the NVD at
CVSS 3.1 9.8.

I looked at what is behind them, checked my own server, and went through
everything on it that uses PHP. Here are both: the commands to follow along
and what came out on my side.

## What the two flaws do

- **CVE-2026-109618, corruption on out of memory**: when PHP runs out of memory
  while a request's internal data is only half set up, the cleanup that follows
  treats that data as valid. That can be turned into code execution.
- **CVE-2026-109619, stale state between requests**: state that belongs to a
  request survives after its memory has been freed. The next request in the
  same worker can use it before it is reset. Besides code execution, reading
  memory is a confirmed impact here, which potentially means passwords, tokens
  and keys.

According to php.net, every PHP installation that serves web requests is
affected: PHP-FPM, Apache with `mod_php`, php-cgi, FrankenPHP and LiteSpeed.
The PHP team considers the risk highest for `mod_php`. There is an exploit
where a request without a login triggers the attack **before any application
code runs**. At that point it does not matter which application sits on the
server.

The details leaked on 20 October, before the patch. Amazon reports a first
attempt against a honeypot as early as 17 October, Cloudflare and watchTowr
see exploitation attempts. Whether any of them have succeeded is still open at
the time of writing.

## Which version you need

| Branch | Fixed in | Debian 12 and 13 |
|---|---|---|
| 8.5 | 8.5.12 | not in the archive, third-party sources only |
| 8.4 | 8.4.27 | Trixie: `8.4.27-1~deb13u1` (DSA-6574-1) |
| 8.3 | 8.3.36 | not in the archive, `8.3.36` from Sury |
| 8.2 | 8.2.35 | Bookworm: `8.2.35-1~deb12u1` (DLA-4848-1) |
| 8.1 and older | no official release | move to a supported branch |

<Callout type="warning" title="If you followed my Apache tutorial">
The guide [Apache 2, PHP 8, MariaDB and phpMyAdmin](/en/docs/debian-tutorials/apache2-php-mariadb-phpmyadmin)
set PHP up as an Apache module (`a2enmod php8.3`) until 22 October 2026. That is
`mod_php`, the variant with the highest risk. Update PHP and restart Apache
afterwards, because with `mod_php` PHP runs inside the Apache processes
themselves. The guide now uses PHP-FPM and also covers
[switching from the Apache module](/en/docs/debian-tutorials/apache2-php-mariadb-phpmyadmin#switching-from-the-apache-module-to-php-fpm).
</Callout>

## How to check your server

`php -v` on its own is not enough. It shows the version on the command line,
which is not necessarily the one serving your websites. So check every
installed version and every program that serves requests.

**1. Which PHP versions are installed and what is running:**

```bash
dpkg -l 'php*-common' | grep ^ii
for b in /usr/sbin/php-fpm*; do $b -v | head -1; done
apt list --upgradable 2>/dev/null | grep php
```

**2. How Apache runs PHP:**

```bash
apache2ctl -M | grep -E 'php|proxy_fcgi|mpm'
```

If `php_module` shows up, you are using `mod_php`. If `proxy_fcgi_module` shows
up and `php_module` does not, PHP runs through FPM.

**3. Whether the processes restarted after the update.** An installed package
changes nothing about a process that still holds the old file in memory.

```bash
grep ' upgrade php8.4-fpm' /var/log/dpkg.log | tail -1
systemctl show -p ActiveEnterTimestamp php8.4-fpm
needrestart -b
```

The service must have started after the update. With `mod_php` the same goes
for `apache2`. Long-running workers (FrankenPHP, RoadRunner, Swoole, queue
workers) need a restart as well.

**4. Whether containers bring their own PHP.** The update on the host does not
reach them.

```bash
docker ps --format '{{.Names}}' | while read n; do
  echo "$n: $(docker exec "$n" sh -c 'command -v php >/dev/null && php -v | head -1' 2>/dev/null)"
done
```

If a container has PHP, it needs a new image with the fixed version.

## What the check turned up on my server

- **PHP 8.4.27** serves all PHP sites through FPM. **8.3.36** sits next to it as
  a way back, also up to date, with its FPM service switched off.
- The update went in on 21 October at 16:33, by hand with `apt upgrade`. FPM
  restarted a minute later, and all workers run the new binary.
- **The automatic updates would only have picked it up the next morning.**
  Their run on 21 October finished at 04:42, and the packages from Sury only
  arrived later that day. For a flaw of this class, half a day of waiting is too
  long.
- The package for `mod_php` was still installed, a leftover from before FPM.
  The module was not loaded, Apache runs with `mpm_event` and FPM. I removed it
  anyway, so nobody switches it back on by accident.
- None of the containers brings its own PHP.
- The FPM logs since 15 October show no crashes (`SIGSEGV`) and no cluster of
  memory errors. That does not prove nobody tried, but the traces an attack
  through memory corruption typically leaves behind are missing.

## The applications on top

A patched PHP closes the hole in the interpreter, not the ones in the
applications running on it. So I went through everything on the server that
uses PHP: Nextcloud and its apps, phpMyAdmin, PHPMailer in contact forms, and
old projects still sitting on disk. Plus pgAdmin. It runs on Python rather than
PHP, but it belongs to the same kind of publicly reachable admin interface.

The Nextcloud core was up to date, six apps had updates waiting, and I applied
those. The integrity check (`occ integrity:check-core` and `occ
integrity:check-app`) reports no modified or foreign files. phpMyAdmin and
pgAdmin each run their latest version. I locked phpMyAdmin's setup wizard under
`/setup/`, nobody needs it once the setup is done. An older copy of PHPMailer
in a contact form is now on 7.1.1 and can no longer be fetched directly from
outside.

The more interesting find in the logs had nothing to do with php2shell.

### Attacks on an app that was no longer there

The Nextcloud app "Collabora Online: Built-in CODE Server" has had a flaw since
September, **CVE-2026-110447**: command injection in `proxy.php`, without a
login, also CVSS 9.2. According to reports it has been exploited since
10 September 2026 to drop PHP web shells. It is fixed in version 26.4.303.

On my server the app had already been removed. The logs still show attempts on
14, 16 and 20 October. One request looked like this:

```plaintext
GET /x$(echo${IFS}KGlkO3VuYW1lIC1hKSA+IG5jNjU0Y2Q0ODUudHh0IDI+JjE=|base64${IFS}-d|sh)x/%2e%2e/apps/richdocumentscode/proxy.php?status
```

The Base64 part decodes to `(id;uname -a) > nc654cd485.txt 2>&1`. So the
scanner writes the user and the system into a file, fetches it right away and
deletes it again with a second request. On 16 October a longer variant arrived,
carrying a PHP upload form meant to end up on the server.

None of these requests got anywhere: all of them received 403, a redirect to
HTTPS that the scanner did not follow, or 404. None of the files exist on disk.
All that was left were the app's entries in the database, and I deleted those
today.

I take two things from this. The scanners do not ask whether an app is
installed, they try every server. And a disabled app is not the same as a
removed one: according to the notes on CVE-2026-110447, switching it off is not
enough, the files have to go.

You can check this on your side like so:

```bash
zgrep -h 'richdocumentscode' /var/log/apache2/*access.log* | awk '{print $4, $9}' | sort | uniq -c
ls /var/www/html/nextcloud/apps/richdocumentscode/shx*.php 2>/dev/null
```

Adjust the path to Nextcloud and the log format to your server. A status 200
on one of the requests containing `$(...)` is a reason to take a closer look.

## What you should do now

1. **Update PHP**, every installed version, including the one that only sits
   there as a way back.
2. **Restart**: FPM, Apache if you use `mod_php`, and every long-running
   worker. Then check with `needrestart -b` whether anything still holds the old
   files.
3. **Check containers** and redeploy them with a new image once it contains the
   fixed version.
4. **Check your automatic updates.** By default `unattended-upgrades` only
   takes Debian's own sources. If you get PHP from Sury, you have to add that
   source to `Origins-Pattern` yourself. Even then the update only arrives with
   the next run.
5. **Only if an update is not possible right now**: php.net lists interim
   measures such as `session.upload_progress.enabled = 0`, a low
   `post_max_size`, and `memory_limit = -1` set so the application cannot
   override it. They close individual attack paths, but they do not make an
   installation safe. They do not replace the update.

## Sources

- [php.net: announcement of the security releases](https://www.php.net/)
- [GHSA-w8hw-w9fx-j79w (CVE-2026-109618)](https://github.com/php/php-src/security/advisories/GHSA-w8hw-w9fx-j79w)
- [GHSA-6wmf-4rv5-p3rp (CVE-2026-109619)](https://github.com/php/php-src/security/advisories/GHSA-6wmf-4rv5-p3rp)
- [Debian Security Tracker: CVE-2026-109618](https://security-tracker.debian.org/tracker/CVE-2026-109618)
- [Tenable: php2shell FAQ](https://www.tenable.com/blog/php2shell-cve-2026-109618-cve-2026-109619-frequently-asked-questions-about-critical-php-remote)
- [OSV: CVE-2026-110447](https://osv.dev/vulnerability/CVE-2026-110447)
