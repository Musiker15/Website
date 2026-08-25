---
title: "Schritt 3: FXServer-Artefakte automatisch aktualisieren"
description: "Ein Update-Script, das die aktuelle Version über die Cfx-Changelog-API holt, nur die Artefakt-Dateien tauscht und bei einem Fehlstart den alten Stand zurückholt. Dazu der passende Cron-Eintrag."
date: 2026-08-25
order: 4
tags: ["fivem", "fxserver", "cron", "systemd", "automation", "bash", "debian"]
---

Das hier ist der dritte Teil der [FiveM-Reihe](/de/docs/fivem). Nach den
Schritten [1](/de/docs/fivem/installation) und
[2](/de/docs/fivem/txadmin-reverse-proxy) läuft der Server und das Panel ist
sicher erreichbar. Bleibt die Frage, wer die Artefakte aktuell hält.

FiveM-Artefakte veralten schnell. Alle paar Wochen verlangt der Client einen
neueren Build, und dann steht dasselbe Ritual an: Buildnummer heraussuchen,
Tarball herunterladen, Dienst stoppen, Dateien tauschen, Besitzer richten,
Dienst starten. Das macht man dreimal gern und beim vierten Mal nachlässig.

## Die fertigen Dateien

| Datei                                                                           | Zweck                                                                            |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| [`update-fxserver.sh`](https://uploads.musiker15.de/fivem/update-fxserver.sh)   | der Updater, den dieses Tutorial erklärt                                         |
| [`install-fxserver.sh`](https://uploads.musiker15.de/fivem/install-fxserver.sh) | interaktiver Installer, der Unit, Updater und Cron in einem Durchlauf einrichtet |
| [`fivem.service`](https://uploads.musiker15.de/fivem/fivem.service)             | die systemd-Unit aus Schritt 1 als kommentierte Vorlage                          |
| [`txadmin-vhost.conf`](https://uploads.musiker15.de/fivem/txadmin-vhost.conf)   | der Apache-vHost aus Schritt 2                                                   |

<Callout type="warning">
**Kein `curl … | sudo bash`.** Ein Script, das als root läuft und den halben
Server umbaut, gehört vorher gelesen. Herunterladen und ausführen sind deshalb
in dieser Anleitung immer zwei Schritte, und das ist Absicht.
</Callout>

## Voraussetzungen

- ein laufender FXServer als systemd-Dienst, siehe
  [Schritt 1](/de/docs/fivem/installation)
- die Trennung von Artefakt und Serverdaten in zwei Verzeichnisse

```
/opt/fivem/
├── server/          ← das Artefakt. run.sh + alpine/. Wird bei jedem Update ersetzt
└── server-data/     ← Deine resources/, server.cfg, cache/. Bleibt unangetastet
```

<Callout type="danger">
**Das Update-Script darf ausschließlich in `server/` schreiben.** Liegt beides
im selben Verzeichnis, verlierst Du beim ersten Update Ressourcen und
Konfiguration. Wer das bisher zusammen hat, zieht es vor dem ersten Lauf
auseinander.
</Callout>

```bash
apt update
apt install -y curl tar xz-utils jq cron
```

`jq` ist nicht zwingend, das Script hat einen `grep`-Rückfallweg. Der braucht
aber `grep -P`, und das fehlt auf abgespeckten Systemen mit BusyBox. Wer `jq`
installiert, umgeht die Frage.

## Schritt 3.1: Die Changelog-API verstehen

Der ganze Automatismus hängt an einer einzigen Adresse:

```bash
curl -fsSL https://changelogs-live.fivem.net/api/changelog/versions/linux/server | jq
```

Interessant sind vier Felder:

| Feld                   | Inhalt                                |
| ---------------------- | ------------------------------------- |
| `recommended`          | Buildnummer des empfohlenen Builds    |
| `recommended_download` | direkte URL zum passenden `fx.tar.xz` |
| `latest`               | Buildnummer des neuesten Builds       |
| `latest_download`      | direkte URL dazu                      |

Damit entfällt das Heraussuchen der Buildnummer von Hand. Das Script setzt den
gewünschten Kanal in eine Variable und liest das passende `_download`-Feld aus.

<Callout type="warning">
**Auf einem Produktivserver gehört `recommended` in die Konfiguration, nicht
`latest`.** Der neueste Build ist der neueste, nicht der geprüfte. Ein
nächtlicher Cron, der ungefragt auf `latest` zieht, holt sich irgendwann eine
Inkompatibilität, die erst am nächsten Abend auffällt, wenn Spieler auf dem
Server sind. `recommended` hinkt ein paar Tage hinterher und ist genau deshalb
die richtige Wahl.
</Callout>

## Schritt 3.2: Update-Script installieren

```bash
curl -fsSL https://uploads.musiker15.de/fivem/update-fxserver.sh \
  -o /usr/local/bin/update-fxserver.sh

# Erst lesen, dann ausfuehrbar machen
less /usr/local/bin/update-fxserver.sh
chmod 0755 /usr/local/bin/update-fxserver.sh
```

Angepasst werden müssen nur die fünf Werte im Kopf:

```bash
FX_DIR="/opt/fivem/server"       # Artefakt-Ordner (run.sh + alpine/)
FX_USER="fivem"                  # Besitzer der Dateien
FX_GROUP="fivem"                 # Gruppe
SERVICE="fivem"                  # Name der systemd-Unit ohne .service
CHANNEL="recommended"            # "recommended" oder "latest"
```

### Wie es abläuft

1. Version über die API ermitteln. Steht dieselbe Nummer schon in
   `.installed-version`, endet der Lauf hier, ohne den Server anzufassen.
2. Artefakt nach `/tmp` herunterladen und entpacken. **Der Server läuft dabei
   weiter.**
3. Dienst stoppen. Altes `alpine/` und `run.sh` nach `.previous` verschieben.
4. Neues Artefakt einspielen, `chmod +x`, `chown` auf den Dienstbenutzer.
5. Dienst starten und 15 Sekunden warten. Läuft er, wird `.previous` gelöscht.
   Läuft er nicht, kommt der alte Stand zurück und wird gestartet.

### Vier Entscheidungen darin, die den Unterschied machen

**Erst herunterladen, dann stoppen.** Download und Entpacken passieren
vollständig in `/tmp`, bevor der Dienst angefasst wird. Ist die API nicht
erreichbar oder das Archiv kaputt, bricht das Script ab und der Server läuft
einfach weiter. Ein Script, das zuerst stoppt und dann feststellt, dass es
keinen Download gibt, hinterlässt einen toten Server.

**Verschieben statt löschen.** Das alte `alpine/` wandert nach `.previous`,
nicht in den Papierkorb. Geht der Tausch schief, oder startet der Dienst danach
nicht, holt die `restore`-Funktion den alten Stand zurück und fährt ihn hoch.

<Callout type="tip">
Die 15 Sekunden Wartezeit sind bewusst großzügig. Ein FXServer, der an einer
kaputten Ressource scheitert, braucht ein paar Sekunden bis dorthin. Wer nur
zwei Sekunden wartet, bekommt ein zufriedenes "läuft" und findet die Leiche am
nächsten Morgen.
</Callout>

**`run.sh` über `find` suchen, nicht raten.** Die Archivstruktur hat sich in der
Vergangenheit geändert, mal mit Wrapper-Ordner, mal ohne. `find -maxdepth 2`
findet beides, und das Script bricht sauber ab, wenn es gar nichts findet.

**`chown -R` nach jedem Tausch.** Das Script läuft als root, `cp -a` erhält die
Besitzer aus dem Archiv. Ohne das `chown` gehören die neuen Dateien root, und
der Dienst startet als `fivem` nicht mehr.

## Schritt 3.3: Cron-Eintrag

```bash
crontab -e
```

```cron
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

# managed-by: fxserver
0 5 * * 1 /usr/local/bin/update-fxserver.sh >> /var/log/fxserver-update.log 2>&1
```

```bash
touch /var/log/fxserver-update.log
crontab -l
```

Die `PATH`-Zeile ist nötig, weil cron mit einem sehr kurzen `PATH` startet.
`systemctl` liegt unter `/usr/bin`, `jq` je nach System woanders, und ein
Script, das im Terminal läuft und im Cron nicht, hat fast immer diese Ursache.

<Callout type="warning">
**Ein Update ist ein Serverneustart, und Cron kündigt nichts an.** Das Script
stoppt den Dienst ohne Vorwarnung, laufende Spieler fliegen. Deshalb gehört der
Eintrag in eine Uhrzeit, zu der niemand da ist.

Mit txAdmin wird es unangenehmer: txAdmin kündigt seine eigenen geplanten
Neustarts im Spiel an, von einem Cron, der `systemctl stop` ruft, weiß es
nichts. Lege den Cron dann auf eine Zeit **direkt nach** einem
txAdmin-Neustart, dann treffen sich die beiden nicht.
</Callout>

Ein Wochenrhythmus reicht in der Praxis. Täglich zu aktualisieren bringt bei
`recommended` nichts, weil sich der Wert ohnehin nur alle paar Wochen bewegt,
erhöht aber die Zahl der Neustarts.

## Schritt 3.4: Testen, bevor der Cron das erste Mal läuft

Einmal von Hand aufrufen und zusehen:

```bash
sudo /usr/local/bin/update-fxserver.sh
```

Und danach den Cron-Weg selbst prüfen, denn der läuft in einer anderen
Umgebung:

```bash
sudo env -i /bin/bash --noprofile --norc -c \
  'PATH=/usr/bin:/bin /usr/local/bin/update-fxserver.sh'
```

`env -i` wirft die komplette Umgebung weg. Läuft das Script auch so durch, wird
es im Cron nicht an einer fehlenden Variablen scheitern.

```bash
# Was hat der Cron zuletzt getan
tail -n 40 /var/log/fxserver-update.log

# Welche Version liegt gerade
cat /opt/fivem/server/.installed-version

# Laeuft der Server, und seit wann
systemctl status fivem
```

## Alles auf einmal: der Installer

Wer bei null anfängt oder einen zweiten Server aufsetzt, tippt die
Konfiguration sonst mehrfach ab. Der Installer fragt alles einmal ab und
schreibt Unit, Update-Script und Cron-Eintrag daraus.

```bash
curl -fsSL https://uploads.musiker15.de/fivem/install-fxserver.sh -o install-fxserver.sh
less install-fxserver.sh          # bitte wirklich lesen
bash -n install-fxserver.sh       # Syntaxpruefung, fuehrt nichts aus
chmod +x install-fxserver.sh
sudo ./install-fxserver.sh
```

Er fragt der Reihe nach: Artefakt- und Datenverzeichnis, Benutzer und Gruppe,
Name der Unit, Startmodus (txAdmin oder direkt), Zielpfad und Kanal des
Updaters, Zeitplan des Crons. **Geschrieben wird erst nach einer
Zusammenfassung**, die alles noch einmal zeigt, und die Bestätigung steht auf
"Nein" als Vorgabe.

<Callout type="note">
Der Installer bricht ab, wenn Artefakt- und Datenverzeichnis identisch sind.
Das ist keine Schikane, sondern der Fehler, an dem man beim ersten Update seine
`resources/` verliert.
</Callout>

Drei Dinge, die ein selbstgebauter Installer leicht falsch macht und die dieser
deshalb bewusst anders löst:

- **Erst fragen, dann zusammenfassen, dann schreiben.** Ein Installer, der nach
  jeder Frage sofort etwas anlegt, hinterlässt bei einem Abbruch in der Mitte
  einen halben Zustand.
- **Beim Erzeugen des Update-Scripts zwei getrennte Heredocs.** Der Kopf mit den
  Werten wird expandiert (`<< CONF`), der Logikteil darf es nicht sein
  (`<< 'LOGIC'`). Sonst ersetzt die Installationsshell jedes `$FX_DIR` und `$0`
  im erzeugten Script durch ihren eigenen, meist leeren Wert. Danach prüft der
  Installer das Ergebnis mit `bash -n`.
- **Beim Cron-Eintrag die eigenen alten Zeilen herausfiltern**, und zwar
  einschließlich der `PATH=`-Zeile. Sonst sammelt sich bei jedem weiteren Lauf
  eine zusätzliche davon an.

## Häufige Fehler

| Meldung oder Symptom                          | Ursache                                         | Lösung                                          |
| --------------------------------------------- | ----------------------------------------------- | ----------------------------------------------- |
| `/usr/bin/env^M: bad interpreter`             | Datei hat CRLF statt LF                         | `sed -i 's/\r$//' update-fxserver.sh`           |
| `Download-URL konnte nicht ermittelt werden.` | `jq` fehlt und `grep -P` wird nicht unterstützt | `apt install jq`                                |
| Script läuft im Terminal, im Cron nicht       | cron startet mit minimalem `PATH`               | `PATH=`-Zeile in die crontab, siehe Schritt 3.3 |
| Dienst startet nach dem Update nicht          | Besitzer der neuen Dateien ist root             | `chown -R fivem:fivem` prüfen                   |
| Port 30120 beim Start belegt                  | `KillMode=process`, Kindprozesse überleben      | auf `KillMode=mixed` umstellen                  |
| Ressourcen nach dem Update verschwunden       | `FX_DIR` zeigt auf das Datenverzeichnis         | `FX_DIR` korrigieren, nur `server/` eintragen   |
| Server läuft in Inkompatibilitäten            | Kanal steht auf `latest`                        | `CHANNEL="recommended"` setzen                  |
| Spieler fliegen mitten am Abend raus          | Cron-Zeit liegt in der Hauptzeit                | Zeitfenster verschieben                         |
| Update läuft, ändert aber nie etwas           | Version ist bereits aktuell                     | kein Fehler, `.installed-version` prüfen        |

## Was das hier bewusst nicht tut

**Es prüft keine Signatur.** Der Download kommt über HTTPS von einer
Cfx-Adresse, aber es gibt keine Prüfsumme, gegen die sich das Archiv
verifizieren ließe. Wer das braucht, bleibt beim manuellen Weg und prüft die
Artefakte selbst.

**Es sichert `server-data/` nicht.** Das Script fasst das Verzeichnis nicht an,
aber ein Update ist trotzdem ein guter Zeitpunkt für ein Backup der Ressourcen
und der Datenbank. Das gehört in einen eigenen Cron, nicht in diesen.

**Es rollt keine Datenbankmigrationen zurück.** Der Rückweg stellt die
Artefakt-Dateien wieder her, mehr nicht. Alles, was Ressourcen beim ersten Start
in die Datenbank schreiben, bleibt.
