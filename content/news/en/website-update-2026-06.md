---
title: "English tutorials, revised guides & copy buttons"
description: "All tutorials are now available in English, have been technically revised, and code blocks now have a copy button."
date: 2026-06-13
author: "Moritz Kohm"
tags: ["website", "tutorials"]
---

A lot has happened on the site. Here's an overview of the most important
changes.

## 🇬🇧 Tutorials now available in English

All Debian tutorials and the hardware page are now also available in
**English**. You can switch between German and English at any time via the
language switcher in the navigation bar — the content lives under `/en/docs`.

## 🔧 Tutorials technically revised

I went through all the guides and brought them up to date. Among other things:

- **Certbot:** correct package `python3-certbot-apache` and a simplified
  `certbot --apache` invocation.
- **Sinusbot:** switched from `youtube-dl` (offline) to the actively
  maintained **`yt-dlp`**, and `python3` instead of the removed `python`
  package.
- **MariaDB upgrade:** added the important `mariadb-upgrade` step after a
  version jump.
- **LAMP stack (Apache/PHP/MariaDB/phpMyAdmin):** cleaner ordering, security
  notes and an additional configuration step for phpMyAdmin.
- **Debian upgrade:** a note about the newer releases (Debian 12 & 13) and the
  two-step upgrade process recommended by Debian.

## 📋 Copy button for code blocks

Every code block now has a **copy button** in the top right — one click copies
the entire command to the clipboard. No more tedious selecting.

## ✨ Revised tutorials landing page

The [tutorials overview](/en/docs) now shows a proper landing page with an
intro and section cards, and the "Tutorials" menu item leads straight there.

---

Behind the scenes, all of the website's dependencies were updated as well and
a small security issue in the build tooling was fixed. Enjoy the guides!
