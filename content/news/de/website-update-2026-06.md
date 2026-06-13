---
title: "Englische Tutorials, überarbeitete Guides & Copy-Buttons"
description: "Alle Tutorials sind jetzt auch auf Englisch verfügbar, wurden technisch überarbeitet und Code-Blöcke haben einen Kopieren-Button."
date: 2026-06-13
author: "Moritz Kohm"
tags: ["website", "tutorials"]
---

Es hat sich einiges getan auf der Seite. Hier ein Überblick über die
wichtigsten Neuerungen.

## 🇬🇧 Tutorials jetzt auch auf Englisch

Alle Debian-Tutorials und die Hardware-Seite sind ab sofort auch auf
**Englisch** verfügbar. Über den Sprachumschalter in der Navigationsleiste
lässt sich jederzeit zwischen Deutsch und Englisch wechseln — die Inhalte
liegen unter `/en/docs`.

## 🔧 Tutorials technisch überarbeitet

Ich habe alle Guides einmal durchgesehen und auf den aktuellen Stand
gebracht. Unter anderem:

- **Certbot:** korrektes Paket `python3-certbot-apache` und vereinfachter
  `certbot --apache`-Aufruf.
- **Sinusbot:** Umstieg von `youtube-dl` (offline) auf das aktiv gepflegte
  **`yt-dlp`** sowie `python3` statt des entfernten `python`-Pakets.
- **MariaDB-Upgrade:** der wichtige Schritt `mariadb-upgrade` nach einem
  Versionssprung wurde ergänzt.
- **LAMP-Stack (Apache/PHP/MariaDB/phpMyAdmin):** sauberere Reihenfolge,
  Sicherheitshinweise und ein zusätzlicher Konfigurationsschritt für
  phpMyAdmin.
- **Debian-Upgrade:** Hinweis auf die neueren Releases (Debian 12 & 13) und
  der von Debian empfohlene zweistufige Upgrade-Ablauf.

## 📋 Kopieren-Button für Code-Blöcke

Jeder Code-Block hat jetzt oben rechts einen **Copy-Button** — ein Klick
kopiert den kompletten Befehl in die Zwischenablage. Kein mühsames Markieren
mehr.

## ✨ Überarbeitete Tutorials-Startseite

Die [Tutorials-Übersicht](/de/docs) zeigt jetzt eine richtige Startseite mit
Einleitung und Bereichs-Karten, und der Menüpunkt „Tutorials" führt direkt
dorthin.

---

Im Hintergrund wurden außerdem alle Abhängigkeiten der Website aktualisiert
und eine kleine Sicherheitslücke im Build-Tooling geschlossen. Viel Spaß mit
den Guides!
