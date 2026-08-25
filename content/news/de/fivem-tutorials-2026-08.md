---
title: "Neuer Bereich: FiveM-Server, in drei Schritten"
description: "Eine dreiteilige Reihe vom leeren Debian bis zum Server, der sich selbst aktuell hält: Installation, txAdmin hinter HTTPS und automatische Artefakt-Updates. Die Skripte gibt es zum Herunterladen."
date: 2026-08-25
author: "Moritz Kohm"
tags: ["tutorials", "fivem", "debian", "apache"]
---

Es gibt einen neuen Bereich in den Guides: [FiveM-Server](/de/docs/fivem). Die
Debian-Tutorials waren bisher eine flache Liste, und für etwas, das
aufeinander aufbaut, passt das nicht. Die drei Teile hängen zusammen und lassen
sich der Reihe nach durcharbeiten.

Entstanden ist die Reihe aus dem Setup auf meinem eigenen Server, samt der
Fehler, die dabei aufgefallen sind.

## Schritt 1: FiveM-Server installieren

[Zum Tutorial](/de/docs/fivem/installation)

Vom leeren Debian bis zum laufenden Dienst: eigener Systembenutzer, das
FXServer-Artefakt, die Trennung von Artefakt und Serverdaten, eine systemd-Unit
und der erste Start mit txAdmin.

Der Punkt, an dem sich dieses Tutorial von den üblichen unterscheidet: txAdmin
hört von Anfang an nur auf `127.0.0.1`. Für das Erstsetup läuft ein SSH-Tunnel
statt eines offenen Ports. Das kostet zwanzig Sekunden und erspart das
Zeitfenster, in dem ein frisches Verwaltungspanel offen im Netz steht.

## Schritt 2: txAdmin hinter einem Reverse Proxy

[Zum Tutorial](/de/docs/fivem/txadmin-reverse-proxy)

Apache 2.4 davor, HTTPS auf einer eigenen Subdomain, und eine WebSocket-Weiche,
damit die Live-Konsole wirklich live ist. Dazu drei Dinge, die in fast jeder
kopierten Konfiguration stecken und still Schaden anrichten:

- **Ohne WebSocket-Upgrade** fällt socket.io auf HTTP-Polling zurück. Das Panel
  läuft weiter, nur träge, und deshalb fällt es monatelang nicht auf.
- **`X-Forwarded-For` von Hand zu setzen** verdoppelt die Client-IP, weil
  `mod_proxy_http` den Header selbst schon anhängt. In der Ban-Ansicht steht
  danach Unsinn.
- **Ein `connect-src` aus einer alten Konfiguration** blockiert die
  WebSocket-Verbindung, und die Live-Konsole bleibt einfach leer.

## Schritt 3: Artefakte automatisch aktualisieren

[Zum Tutorial](/de/docs/fivem/auto-update)

Ein Script, das die aktuelle Version über die Cfx-Changelog-API holt, das
Artefakt austauscht und den Dienst neu startet. Zwei Eigenschaften sind mir
dabei wichtig gewesen: es lädt und entpackt alles, **bevor** der Server
gestoppt wird, und das alte Artefakt wird beiseitegeschoben statt gelöscht.
Kommt der Dienst nach dem Update nicht innerhalb von 15 Sekunden hoch, holt das
Script den alten Stand zurück und startet ihn.

## Die Skripte zum Herunterladen

Alle vier Dateien liegen unter `uploads.musiker15.de/fivem/`:

| Datei                                                                           | Zweck                                             |
| ------------------------------------------------------------------------------- | ------------------------------------------------- |
| [`install-fxserver.sh`](https://uploads.musiker15.de/fivem/install-fxserver.sh) | interaktiver Installer für Unit, Updater und Cron |
| [`update-fxserver.sh`](https://uploads.musiker15.de/fivem/update-fxserver.sh)   | der Updater allein                                |
| [`fivem.service`](https://uploads.musiker15.de/fivem/fivem.service)             | systemd-Unit als kommentierte Vorlage             |
| [`txadmin-vhost.conf`](https://uploads.musiker15.de/fivem/txadmin-vhost.conf)   | Apache-vHost für das Panel                        |

Bewusst steht in keinem der Tutorials ein `curl … | sudo bash`. Ein Script, das
als root läuft und den halben Server umbaut, gehört vorher gelesen. Deshalb sind
Herunterladen und Ausführen überall zwei getrennte Schritte.
