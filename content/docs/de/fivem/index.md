---
title: "FiveM-Server"
description: "Einen FiveM-Server auf Debian aufsetzen, txAdmin sicher hinter Apache betreiben und die Artefakte automatisch aktuell halten. Drei Schritte, aufeinander aufbauend."
date: 2026-08-25
order: 2
tags: ["fivem", "fxserver", "txadmin", "debian", "linux"]
---

Diese Reihe setzt einen FiveM-Server von Grund auf auf, und zwar so, dass er
danach nicht als offenes Verwaltungspanel im Netz steht und nicht bei jedem
Artefakt-Wechsel Handarbeit verlangt.

Die drei Teile bauen aufeinander auf. Wer bei null anfängt, arbeitet sie der
Reihe nach durch.

## Die Reihe

- **[Schritt 1: FiveM-Server installieren](/de/docs/fivem/installation)**
  FXServer-Artefakt, eigener Systembenutzer, systemd-Unit und der erste Start
  mit txAdmin. Port 40120 ist dabei von Anfang an per Firewall gesperrt,
  erreicht wird das Panel fürs Erstsetup über einen SSH-Tunnel.

- **[Schritt 2: txAdmin hinter einem Reverse Proxy](/de/docs/fivem/txadmin-reverse-proxy)**
  Apache 2.4 davor, HTTPS auf einer eigenen Subdomain, WebSockets für die
  Live-Konsole. Danach ist der SSH-Tunnel überflüssig und Port 40120 endgültig
  dicht.

- **[Schritt 3: Artefakte automatisch aktualisieren](/de/docs/fivem/auto-update)**
  Ein Update-Script, das die aktuelle Version über die Cfx-Changelog-API holt,
  nur die Artefakt-Dateien tauscht und bei einem Fehlstart den alten Stand
  zurückholt. Dazu der passende Cron-Eintrag.

## Was Du vorher brauchst

- einen Debian-Server (11 oder neuer) mit root-Zugang
- einen Server-Key aus dem [Cfx.re Keymaster](https://portal.cfx.re/)
- für Schritt 2 zusätzlich Apache 2.4 mit gültigem Zertifikat, entweder über
  [Certbot](/de/docs/debian-tutorials/certbot) oder über ein
  [Wildcard-Zertifikat](/de/docs/debian-tutorials/acme-sh-wildcard-ionos)

<Callout type="warning">
Ein FiveM-Server lädt Ressourcen von Dritten und führt deren Code aus. Er
gehört deshalb unter einen eigenen Systembenutzer und nicht unter root. Schritt
1 legt diesen Benutzer an, und die späteren Schritte setzen ihn voraus.
</Callout>

## Wenn Du nur einen Teil brauchst

Die Schritte 2 und 3 lassen sich auch auf einen bereits laufenden Server
anwenden. Beide nennen am Anfang, was sie voraussetzen, und wo Deine
Verzeichnisstruktur anders heißen darf als in den Beispielen.
