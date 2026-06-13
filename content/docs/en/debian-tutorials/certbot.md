---
title: "Certbot — Let's Encrypt (free SSL certificates)"
description: "Install Certbot and have SSL certificates from Let's Encrypt renewed automatically."
order: 4
tags: ["debian", "apache", "ssl", "letsencrypt", "certbot"]
---

It's really quite simple. You just install Certbot and you can get free SSL
certificates from Let's Encrypt.

```bash
apt install certbot python3-certbot-apache -y
certbot --apache -d your-domain.com -d www.your-domain.com
```

<Callout type="warning">
Since Debian 11 the package is called `python3-certbot-apache` (no longer
`python-certbot-apache` — that was the old Python 2 package and no longer
exists in current Debian versions).
</Callout>

The Apache plugin (`--apache`) handles both domain validation and setting up
the SSL vHost configuration in one step. On the first run you have to enter an
email address and accept the license terms with `A`.

<Callout type="tip">
The certificates are only valid for 90 days. Certbot automatically sets up a
systemd timer (`certbot.timer`) for renewal during installation — you can
verify it like this:

```bash
systemctl list-timers certbot.timer
certbot renew --dry-run
```

A manual renewal is only needed in an emergency:

```bash
certbot renew
```
</Callout>
