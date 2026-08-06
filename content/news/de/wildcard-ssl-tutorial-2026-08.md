---
title: "Neues Tutorial: Wildcard-SSL mit acme.sh und IONOS-DNS"
description: "Ein Zertifikat für alle Subdomains, ausgestellt über DNS-01 und automatisch erneuert per systemd-Timer. Inklusive der Stolpersteine, die mich selbst Zeit gekostet haben."
date: 2026-08-06
author: "Moritz Kohm"
tags: ["tutorials", "ssl", "apache", "debian"]
---

Es gibt ein neues Tutorial in den [Debian-Guides](/de/docs/debian-tutorials):
[Wildcard-SSL mit acme.sh und IONOS-DNS](/de/docs/debian-tutorials/acme-sh-wildcard-ionos).

Entstanden ist es aus einer Umstellung auf meinem eigenen Server. Statt für
jede neue Subdomain ein eigenes Zertifikat auszustellen, deckt jetzt ein
einzelnes `*.example.de` alles ab, und erneuert wird es ohne mein Zutun.

## Worum es geht

Ein Wildcard-Zertifikat lässt sich nicht über die übliche Datei im Webserver
validieren. Es geht nur über DNS, und dafür braucht der ACME-Client Zugriff auf
die API des DNS-Providers. Das Tutorial richtet die komplette Kette ein:

- **DNS-01 über die IONOS-API**, inklusive Erzeugung des API-Keys.
- **Installation von acme.sh** über den Tarball statt über das
  Installationsskript, weil letzteres beim Setzen des Home-Verzeichnisses
  einen Bug hat.
- **Ausstellung und Deploy** nach `/etc/apache2/ssl`, mit einer Prüfung des
  Zielverzeichnisses vorher.
- **Automatische Erneuerung** über einen systemd-Timer statt über den Cron-Job,
  den acme.sh selbst anlegt.
- **Mehrere Domains** auf demselben Server, jede mit eigenem Reload-Hook.

## Die Fallen sind der eigentliche Inhalt

Den reinen Ablauf findet man in jedem zweiten Blog. Aufgenommen habe ich
deshalb vor allem die Punkte, an denen ich selbst hängen geblieben bin:

- Der **ACME-Server von IONOS** verhält sich beim Finalize-Schritt anders als
  erwartet. Das Tutorial zeigt, woran man das erkennt, und warum ZeroSSL hier
  die ruhigere Wahl ist.
- **`apachectl -t` sieht nicht**, ob Schlüssel und Zertifikat zusammengehören.
  Die Konfiguration ist syntaktisch in Ordnung, Apache startet trotzdem nicht.
  Das Deploy-Script im Tutorial vergleicht deshalb selbst die öffentlichen
  Schlüssel und lädt im Zweifel lieber gar nicht neu.
- **`grep -r` folgt keinen Symlinks.** Wer damit prüft, welche vHosts noch auf
  den alten Zertifikatspfad zeigen, übersieht genau die Dateien in
  `sites-enabled`.

Dazu kommen eine Fehlertabelle für die typischen Meldungen und ein Abschnitt
zur Deinstallation, falls Du wieder zurück willst.

## Warum sich der Umbau lohnt

Das CA/Browser Forum hat mit Ballot SC-081v3 einen Stufenplan beschlossen: Ab
März 2026 dürfen Zertifikate höchstens 200 Tage laufen, ab März 2027 noch 100,
ab März 2029 nur noch 47. Manuelle Zertifikatspflege wird damit über kurz oder
lang unpraktikabel. Wer die Erneuerung einmal automatisiert, muss sich um diese
Termine gar nicht erst kümmern.

Das Tutorial gibt es wie alle anderen auch
[auf Englisch](/en/docs/debian-tutorials/acme-sh-wildcard-ionos).
