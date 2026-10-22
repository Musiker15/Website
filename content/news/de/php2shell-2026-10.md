---
title: "php2shell: zwei kritische PHP-Lücken und was mein Server dazu sagt"
description: "Am 21.10.2026 hat PHP zwei Lücken geschlossen, über die sich ohne Anmeldung Code ausführen lässt. Was dahintersteckt, wie Du Deinen Server prüfst und was die Prüfung bei mir ergeben hat."
date: 2026-10-22
author: "Moritz Kohm"
tags: ["php", "security", "debian", "apache", "nextcloud"]
---

Am 21.10.2026 hat das PHP-Projekt die Versionen 8.5.12, 8.4.27, 8.3.36 und
8.2.35 veröffentlicht. Sie schließen zwei Lücken, die unter dem Namen
**php2shell** laufen: CVE-2026-109618 und CVE-2026-109619. Beide erlauben einem
Angreifer ohne Anmeldung, Code auf dem Server auszuführen. Das PHP-Team bewertet
beide mit CVSS 4.0 9.2, die NVD mit CVSS 3.1 9.8.

Ich habe mir angesehen, was dahintersteckt, meinen eigenen Server durchgeprüft
und dabei auch alles betrachtet, was auf ihm PHP nutzt. Hier ist beides: die
Befehle zum Nachmachen und was bei mir herauskam.

## Was die beiden Lücken tun

- **CVE-2026-109618, Speicherfehler beim Out-of-Memory**: Läuft PHP der
  Speicher aus, während interne Daten einer Anfrage erst halb angelegt sind,
  behandelt das Aufräumen danach diese Daten als gültig. Daraus lässt sich
  Codeausführung bauen.
- **CVE-2026-109619, veralteter Zustand zwischen Anfragen**: Zustand, der zu
  einer Anfrage gehört, überlebt die Freigabe seines Speichers. Die nächste
  Anfrage im selben Worker kann ihn benutzen, bevor er zurückgesetzt wird. Neben
  Codeausführung ist hier auch das Auslesen von Speicher bestätigt, also
  potenziell Passwörter, Tokens und Schlüssel.

Betroffen ist laut php.net jede PHP-Installation, die Webanfragen bedient:
PHP-FPM, Apache mit `mod_php`, php-cgi, FrankenPHP und LiteSpeed. Am höchsten
schätzt das PHP-Team das Risiko bei `mod_php` ein. Dort gibt es einen Exploit,
bei dem eine Anfrage ohne Anmeldung den Angriff auslöst, **bevor überhaupt Code
der Anwendung läuft**. Welche Anwendung auf dem Server liegt, spielt dann keine
Rolle.

Die Details sind am 20.10. vor dem Patch an die Öffentlichkeit gelangt. Amazon
meldet einen ersten Versuch gegen einen Honeypot schon am 17.10., Cloudflare
und watchTowr sehen Angriffsversuche. Ob davon schon welche erfolgreich waren,
ist zum Zeitpunkt dieses Beitrags offen.

## Welche Version Du brauchst

| Zweig | Gefixt ab | Debian 12 und 13 |
|---|---|---|
| 8.5 | 8.5.12 | nicht im Archiv, nur über Fremdquellen |
| 8.4 | 8.4.27 | Trixie: `8.4.27-1~deb13u1` (DSA-6574-1) |
| 8.3 | 8.3.36 | nicht im Archiv, bei Sury als `8.3.36` |
| 8.2 | 8.2.35 | Bookworm: `8.2.35-1~deb12u1` (DLA-4848-1) |
| 8.1 und älter | kein offizielles Release | auf einen unterstützten Zweig wechseln |

<Callout type="warning" title="Wer meinem Apache-Tutorial gefolgt ist">
Die Anleitung [Apache2, PHP 8, MariaDB und phpMyAdmin](/de/docs/debian-tutorials/apache2-php-mariadb-phpmyadmin)
hat PHP bis zum 22.10.2026 als Apache-Modul eingerichtet (`a2enmod php8.3`). Das
ist `mod_php`, also genau die Variante mit dem höchsten Risiko. Aktualisiere PHP
und starte danach Apache neu, denn bei `mod_php` läuft PHP in den
Apache-Prozessen selbst. Die Anleitung nutzt inzwischen PHP-FPM und beschreibt
auch den
[Umstieg vom Apache-Modul](/de/docs/debian-tutorials/apache2-php-mariadb-phpmyadmin#umstieg-vom-apache-modul-auf-php-fpm).
</Callout>

## So prüfst Du Deinen Server

`php -v` allein reicht nicht. Es zeigt die Version auf der Kommandozeile, nicht
unbedingt die, die Deine Webseiten ausliefert. Prüfe deshalb jede installierte
Version und jedes Programm, das Anfragen bedient.

**1. Welche PHP-Versionen installiert sind und was gerade läuft:**

```bash
dpkg -l 'php*-common' | grep ^ii
for b in /usr/sbin/php-fpm*; do $b -v | head -1; done
apt list --upgradable 2>/dev/null | grep php
```

**2. Wie Apache PHP ausführt:**

```bash
apache2ctl -M | grep -E 'php|proxy_fcgi|mpm'
```

Steht dort `php_module`, nutzt Du `mod_php`. Steht dort `proxy_fcgi_module` und
kein `php_module`, läuft PHP über FPM.

**3. Ob die Prozesse nach dem Update neu gestartet sind.** Ein installiertes
Paket ändert nichts an einem Prozess, der die alte Datei noch im Speicher hat.

```bash
grep ' upgrade php8.4-fpm' /var/log/dpkg.log | tail -1
systemctl show -p ActiveEnterTimestamp php8.4-fpm
needrestart -b
```

Der Startzeitpunkt des Dienstes muss nach dem Update liegen. Bei `mod_php` gilt
dasselbe für `apache2`. Lang laufende Worker (FrankenPHP, RoadRunner, Swoole,
Queue-Worker) brauchen ebenfalls einen Neustart.

**4. Ob Container ihr eigenes PHP mitbringen.** Das Update auf dem Host erreicht
sie nicht.

```bash
docker ps --format '{{.Names}}' | while read n; do
  echo "$n: $(docker exec "$n" sh -c 'command -v php >/dev/null && php -v | head -1' 2>/dev/null)"
done
```

Hat ein Container PHP, braucht er ein neues Image mit der gefixten Version.

## Was die Prüfung bei mir ergeben hat

- **PHP 8.4.27** liefert alle PHP-Seiten über FPM aus. **8.3.36** liegt als
  Rückweg daneben, ebenfalls aktuell, der FPM-Dienst ist abgeschaltet.
- Eingespielt wurde das Update am 21.10. um 16:33 von Hand mit `apt upgrade`.
  FPM lief eine Minute später neu an, alle Worker laufen mit dem neuen Programm.
- **Die automatischen Updates hätten es erst am nächsten Morgen geholt.** Ihr
  Lauf am 21.10. war um 04:42 durch, die Pakete von Sury kamen erst im Laufe des
  Tages. Bei einer Lücke dieser Klasse ist ein halber Tag Wartezeit zu viel.
- Das Paket für `mod_php` war noch installiert, ein Überbleibsel aus der Zeit vor
  FPM. Geladen war das Modul nicht, Apache läuft mit `mpm_event` und FPM. Ich
  habe es trotzdem entfernt, damit es niemand versehentlich wieder einschaltet.
- Keiner der Container bringt ein eigenes PHP mit.
- In den FPM-Logs seit dem 15.10. gibt es keine Abstürze (`SIGSEGV`) und keine
  Häufung von Speicherfehlern. Das ist kein Beweis, dass niemand es versucht hat,
  aber es fehlen die Spuren, die ein Angriff über Speicherfehler typischerweise
  hinterlässt.

## Die Anwendungen obendrauf

Ein gepatchtes PHP schließt die Lücke im Interpreter, nicht die in den
Anwendungen, die darauf laufen. Deshalb habe ich alles durchgesehen, was auf dem
Server PHP nutzt: Nextcloud samt Apps, phpMyAdmin, PHPMailer in Kontaktformularen
und alte Projekte, die noch auf der Platte liegen. Dazu pgAdmin. Das läuft mit
Python statt PHP, gehört aber zur selben Sorte öffentlich erreichbarer
Verwaltungsoberflächen.

Der Kern von Nextcloud war aktuell, für sechs Apps lagen Updates bereit, die
habe ich nachgezogen. Die Integritätsprüfung (`occ integrity:check-core` und
`occ integrity:check-app`) meldet keine veränderten oder fremden Dateien.
phpMyAdmin und pgAdmin laufen jeweils in der neuesten Version. Den
Einrichtungsassistenten von phpMyAdmin unter `/setup/` habe ich gesperrt, nach
der Einrichtung braucht ihn niemand mehr. Eine ältere Kopie von PHPMailer in
einem Kontaktformular steht jetzt auf 7.1.1 und ist von außen nicht mehr direkt
abrufbar.

Interessanter war ein Fund in den Logs, der mit php2shell nichts zu tun hat.

### Angriffe auf eine App, die gar nicht mehr da war

Für die Nextcloud-App "Collabora Online: Built-in CODE Server" gibt es seit
September die Lücke **CVE-2026-110447**: eine Befehlseinschleusung in
`proxy.php`, ohne Anmeldung, ebenfalls CVSS 9.2. Laut Berichten wird sie seit
dem 10.09.2026 ausgenutzt, um PHP-Web-Shells abzulegen. Gefixt ist sie in
Version 26.4.303.

Bei mir war die App schon entfernt. Die Logs zeigen trotzdem Versuche am 14.10.,
16.10. und 20.10. Eine Anfrage sah so aus:

```plaintext
GET /x$(echo${IFS}KGlkO3VuYW1lIC1hKSA+IG5jNjU0Y2Q0ODUudHh0IDI+JjE=|base64${IFS}-d|sh)x/%2e%2e/apps/richdocumentscode/proxy.php?status
```

Der Base64-Teil ergibt `(id;uname -a) > nc654cd485.txt 2>&1`. Der Scanner
schreibt also Benutzer und System in eine Datei, ruft sie gleich danach ab und
löscht sie mit einer zweiten Anfrage wieder. Am 16.10. kam eine längere
Variante mit einem Upload-Formular in PHP, das auf dem Server landen sollte.

Keine dieser Anfragen hat etwas erreicht: Alle bekamen 403, eine Umleitung auf
HTTPS, der der Scanner nicht gefolgt ist, oder 404. Auf der Platte gibt es keine
der Dateien. Übrig waren nur noch die Einträge der App in der Datenbank, die habe
ich heute gelöscht.

Zwei Dinge nehme ich daraus mit. Die Scanner fragen nicht, ob eine App
installiert ist, sie probieren jeden Server durch. Und eine deaktivierte App ist
nicht dasselbe wie eine entfernte: Laut den Hinweisen zu CVE-2026-110447 reicht
das Abschalten nicht, die Dateien müssen weg.

Prüfen kannst Du das bei Dir so:

```bash
zgrep -h 'richdocumentscode' /var/log/apache2/*access.log* | awk '{print $4, $9}' | sort | uniq -c
ls /var/www/html/nextcloud/apps/richdocumentscode/shx*.php 2>/dev/null
```

Den Pfad zu Nextcloud und das Logformat musst Du an Deinen Server anpassen. Eine
Antwort mit Status 200 auf eine der Anfragen mit `$(...)` ist ein Grund, genauer
hinzusehen.

## Was Du jetzt tun solltest

1. **PHP aktualisieren**, und zwar jede installierte Version, auch die, die nur
   als Rückweg daliegt.
2. **Neu starten**: FPM, bei `mod_php` Apache, dazu alle lang laufenden Worker.
   Danach mit `needrestart -b` nachsehen, ob noch etwas die alten Dateien hält.
3. **Container prüfen** und mit neuem Image neu ausrollen, sobald es die gefixte
   Version enthält.
4. **Automatische Updates prüfen.** `unattended-upgrades` nimmt in der
   Grundeinstellung nur die Quellen von Debian. Wer PHP von Sury bezieht, muss die
   Quelle selbst in die `Origins-Pattern` aufnehmen. Und selbst dann kommt das
   Update erst mit dem nächsten Lauf.
5. **Nur wenn ein Update gerade nicht möglich ist**: php.net nennt
   Zwischenmaßnahmen, etwa `session.upload_progress.enabled = 0`, ein niedriges
   `post_max_size` und `memory_limit = -1`, das sich von der Anwendung nicht
   überschreiben lässt. Sie schließen einzelne Angriffswege, machen eine
   Installation aber nicht sicher. Das Update ersetzen sie nicht.

## Quellen

- [php.net: Ankündigung der Sicherheitsreleases](https://www.php.net/)
- [GHSA-w8hw-w9fx-j79w (CVE-2026-109618)](https://github.com/php/php-src/security/advisories/GHSA-w8hw-w9fx-j79w)
- [GHSA-6wmf-4rv5-p3rp (CVE-2026-109619)](https://github.com/php/php-src/security/advisories/GHSA-6wmf-4rv5-p3rp)
- [Debian Security Tracker: CVE-2026-109618](https://security-tracker.debian.org/tracker/CVE-2026-109618)
- [Tenable: FAQ zu php2shell](https://www.tenable.com/blog/php2shell-cve-2026-109618-cve-2026-109619-frequently-asked-questions-about-critical-php-remote)
- [OSV: CVE-2026-110447](https://osv.dev/vulnerability/CVE-2026-110447)
