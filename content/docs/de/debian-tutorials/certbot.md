---
title: "Certbot — Let's Encrypt (kostenlose SSL-Zertifikate)"
description: "Certbot installieren und SSL-Zertifikate über Let's Encrypt automatisch erneuern lassen."
order: 4
tags: ["debian", "apache", "ssl", "letsencrypt", "certbot"]
---

Es ist eigentlich ziemlich einfach gehalten. Man muss nur Certbot
installieren und schon kann man sich SSL-Zertifikate kostenlos über
Let's Encrypt holen.

```bash
apt install certbot python3-certbot-apache -y
certbot --apache -d deine-domain.de -d www.deine-domain.de
```

<Callout type="warning">
Das Paket heißt seit Debian 11 `python3-certbot-apache` (nicht mehr
`python-certbot-apache` — das war das alte Python-2-Paket und existiert in
aktuellen Debian-Versionen nicht mehr).
</Callout>

Das Apache-Plugin (`--apache`) übernimmt sowohl die Domain-Validierung als
auch das Einrichten der SSL-vHost-Konfiguration in einem Schritt. Beim
ersten Start muss eine E-Mail-Adresse angegeben werden und man muss mit `A`
die Lizenzbedingungen akzeptieren.

<Callout type="tip">
Die Zertifikate halten nur 90 Tage lang. Certbot richtet bei der Installation
automatisch einen systemd-Timer (`certbot.timer`) für die Erneuerung ein —
prüfen lässt sich das so:

```bash
systemctl list-timers certbot.timer
certbot renew --dry-run
```

Eine manuelle Erneuerung ist nur im Notfall nötig:

```bash
certbot renew
```
</Callout>
