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
apt install certbot python-certbot-apache -y
certbot --authenticator webroot --installer apache \
  -w /var/www/html/{verzeichnis} \
  -d deine-domain.de -d www.deine-domain.de
```

Beim ersten Start muss eine E-Mail-Adresse angegeben werden und man muss
mit `A` die Lizenzbedingungen akzeptieren.

<Callout type="tip">
Die Zertifikate halten nur 90 Tage lang, im Normalfall sollten diese aber
automatisch erneuert werden. Falls dies nicht der Fall ist, folgendes
ausführen:

```bash
certbot renew
```
</Callout>
