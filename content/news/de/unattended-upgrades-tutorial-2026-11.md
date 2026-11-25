---
title: "Neues Tutorial: automatische Updates mit unattended-upgrades"
description: "Wie Debian und Ubuntu Sicherheitsupdates selbst einspielen, warum PHP von Sury dabei im Default leer ausgeht und welche drei stillen Fallen ich auf meinem eigenen Server gefunden habe."
metaDescription: "Wie Debian und Ubuntu Sicherheitsupdates selbst einspielen, warum PHP von Sury im Default leer ausgeht und welche drei stillen Fallen es gibt."
date: 2026-11-19
author: "Moritz Kohm"
tags: ["tutorials", "debian", "ubuntu", "security", "php"]
---

In den [Debian-Guides](/de/docs/debian-tutorials) gibt es ein neues Tutorial:
[unattended-upgrades: automatische Updates für Debian und Ubuntu](/de/docs/debian-tutorials/unattended-upgrades).

Auf meinem Server lief unattended-upgrades schon lange. Beide Timer waren
aktiv, der letzte Lauf sauber, nichts war kaputt. Als ich im September genauer
hingeschaut habe, deckte der Debian-Default trotzdem deutlich weniger ab, als
es aussah, und genau daraus ist das Tutorial entstanden.

## Was drinsteht

Der Weg von der Installation bis zum Nachweis, dass es funktioniert:

- Einschalten und eine eigene Konfigurationsdatei, damit die Datei des Pakets
  unangetastet bleibt (warum das wichtig ist, steht im Tutorial).
- Fremdquellen einbinden, ausführlich am Beispiel von Surys PHP-Repository
  für Debian und der PPA `ondrej/php` für Ubuntu. Dazu die passenden Muster für
  MariaDB, PostgreSQL, Docker, NodeSource und pgAdmin, alle auf meinem Server
  geprüft.
- needrestart, damit Dienste die neuen Bibliotheken auch laden.
- Automatischer Neustart nach Kernel-Updates, Mail bei Änderungen und
  Aufräumen von `/boot`.
- Eine Tabelle mit den typischen Fehlerbildern.

## Drei Fallen, die nicht als Fehler auffallen

Gemeinsam ist allen dreien, dass das System Erfolg meldet, während etwas
Wichtiges nicht passiert.

Die erste: Im Default bekommen nur Pakete von Debian bzw. Ubuntu Updates. PHP
von Sury, MariaDB aus dem Herstellerrepo, Node, Docker, all das bleibt auf dem
Stand, den es hatte, und im Log steht jeden Tag "Erfolg".

Die zweite: needrestart fragt im Default nach, bevor es Dienste neu startet.
Unbeaufsichtigt fragt es ins Leere. Die neue Bibliothek liegt dann auf der
Platte, Apache und PHP-FPM arbeiten aber mit der alten weiter.

Die dritte hat mich selbst erwischt. unattended-upgrades legt den Neustart per
`shutdown -r` auf eine feste Uhrzeit. Liegt die vor dem Upgrade-Lauf (bei mir
05:30, der Lauf startete zwischen 06:00 und 07:00), landet der Neustart auf dem
nächsten Tag, und der neue Kernel bleibt rund 22 Stunden ungenutzt liegen.

Wie man jede dieser Stellen am Trockenlauf erkennt und nicht nur an der
Konfiguration, zeigt das Tutorial. Es gibt auch eine
[englische Fassung](/en/docs/debian-tutorials/unattended-upgrades).
