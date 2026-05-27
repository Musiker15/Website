---
title: "FAQ"
description: "Häufige Fragen rund um die Tutorials, den Server-Stack und Musiker15 selbst."
order: 3
---

## Allgemein

### Was ist musiker15.de?

Eine persönliche Tutorial-Sammlung rund um Linux/Debian-Server,
Apache-Setups, Datenbanken und Selbst-Hosting. Daneben dient die Seite
als Steckbrief und Verlinkung auf meine kommerziellen Projekte unter
[MSK Scripts](https://www.msk-scripts.de).

### Werden die Tutorials gepflegt?

Ja — wenn sich etwas Wichtiges ändert (neue Debian-Version, neue MariaDB,
Sicherheitsthemen), aktualisiere ich die jeweiligen Anleitungen. Das
Datum unter „Zuletzt aktualisiert" auf jeder Seite zeigt den letzten
Stand.

### Auf welchen Systemen funktionieren die Tutorials?

Primär **Debian 11 / 12** und **Ubuntu LTS**. Die meisten Befehle laufen
auch auf anderen Debian-Derivaten. Für RHEL / Rocky / Alma müssen
`apt`-Befehle zu `dnf` umgesetzt werden.

## Tutorials

### Warum nutzt Du immer noch Apache statt Nginx?

Persönliche Präferenz und über Jahre gewachsenes Setup. Auf meinen Servern
läuft alles über Apache2 mit `mod_proxy`, was für meine Projekte
(Next.js-Reverse-Proxies, PHP-Anwendungen, statische Sites) völlig
ausreicht.

### Welche Hardware-Anforderungen haben die Server-Tutorials?

Die meisten Tutorials laufen auf jedem aktuellen Debian-VPS oder Mini-PC.
Faustregel:

| Use Case | Empfehlung |
|---|---|
| Reine statische Site | 1 vCPU, 1 GB RAM |
| LAMP-Stack mit phpMyAdmin | 2 vCPUs, 2 GB RAM |
| TeamSpeak + Sinusbot | 2 vCPUs, 4 GB RAM |
| Mehrere FiveM-Bots gleichzeitig | 4 vCPUs, 8 GB RAM |

### Ich bekomme den Fehler „Permission denied" beim Ausführen eines Befehls

Die Tutorials gehen oft davon aus, dass Du als root angemeldet bist. Wenn
Du als normaler Benutzer arbeitest, setze ein `sudo` vor den Befehl:

```bash
sudo apt update && sudo apt full-upgrade -y
```

### Funktioniert das auch auf Ubuntu?

Ja — Ubuntu basiert auf Debian, daher sind die `apt`-Befehle identisch.
Einzelne Paketnamen oder Pfade können sich minimal unterscheiden.

## Sinusbot / TeamSpeak

### Welche TeamSpeak-Client-Version unterstützt Sinusbot?

Aktuell maximal **3.5.3**. Neuere Client-Versionen sind nicht kompatibel
(Stand: siehe Tutorial).

### Mein Sinusbot startet nicht — was tun?

Häufige Ursachen:

1. Falsche Benutzer-Rechte → `chown -R sinusbot:sinusbot /opt/sinusbot/`
2. TeamSpeak-Client-Plugin fehlt → `libsoundbot_plugin.so` in
   `TeamSpeak3-Client-linux_amd64/plugins/` kopieren
3. Nutzungsbedingungen nach Update nicht akzeptiert → Client einmal manuell
   starten und akzeptieren

## MSK Scripts

### Was ist der Unterschied zwischen Musiker15 und MSK Scripts?

**Musiker15** = mein persönliches Online-Profil (diese Seite).
**MSK Scripts** = mein Geschäftsbereich für FiveM-Scripts und Discord-Bots
([msk-scripts.de](https://www.msk-scripts.de)).

### Wo finde ich die Dokumentation für MSK-Skripte?

Komplette Doku unter [docu.msk-scripts.de](https://docu.msk-scripts.de).

## Kontakt

### Wie erreiche ich Dich am schnellsten?

Discord ist der schnellste Weg: [discord.gg/5hHSBRHvJE](https://discord.gg/5hHSBRHvJE).
Für rechtliche oder geschäftliche Themen bitte per E-Mail an
`info@musiker15.de`.
