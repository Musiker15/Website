---
title: "Schritt 1: FiveM-Server auf Debian installieren"
description: "FXServer-Artefakt einrichten, eigenen Systembenutzer anlegen, systemd-Unit schreiben und txAdmin über einen SSH-Tunnel einrichten, ohne dabei Port 40120 zu öffnen."
date: 2026-08-25
order: 1
tags: ["fivem", "fxserver", "txadmin", "debian", "systemd", "ssh"]
---

Das hier ist der erste Teil der [FiveM-Reihe](/de/docs/fivem). Am Ende läuft ein
FXServer als eigener Systemdienst, txAdmin ist eingerichtet, und der Server
startet nach einem Neustart der Maschine von allein wieder.

Ein Punkt zieht sich durch die ganze Anleitung: **txAdmin hört von der ersten
Minute an nur auf `127.0.0.1`.** Für das Erstsetup brauchst Du deshalb einen
SSH-Tunnel statt eines offenen Ports. Das sind zwanzig Sekunden mehr Aufwand und
erspart das Zeitfenster, in dem ein frisch installiertes Verwaltungspanel offen
im Netz steht. Genau dieses Fenster wird zuverlässig gescannt.

## Voraussetzungen

- Debian 11 oder neuer mit root-Zugang
- einen Server-Key aus dem [Cfx.re Keymaster](https://portal.cfx.re/)
- einen SSH-Zugang zur Maschine, von dem aus Du weiterleiten kannst

```bash
apt update
apt install -y curl xz-utils git ca-certificates
```

## Schritt 1.1: Benutzer und Verzeichnisse

FXServer läuft nicht als root. Der Prozess lädt Ressourcen von Dritten und führt
deren Code aus, dafür braucht er keine Systemrechte.

```bash
adduser --system --group --home /opt/fivem --shell /usr/sbin/nologin fivem
mkdir -p /opt/fivem/server /opt/fivem/server-data
chown -R fivem:fivem /opt/fivem
```

Die Trennung der beiden Verzeichnisse ist keine Kosmetik, sondern die
Voraussetzung für [Schritt 3](/de/docs/fivem/auto-update):

```
/opt/fivem/
├── server/          ← das Artefakt. run.sh + alpine/. Wird bei jedem Update ersetzt
└── server-data/     ← Deine resources/, server.cfg, cache/. Bleibt unangetastet
```

<Callout type="danger">
**Niemals das Artefakt in dasselbe Verzeichnis wie die Serverdaten entpacken.**
Solange beides getrennt liegt, ist ein Update ein Austausch von zwei
Verzeichniseinträgen. Liegt es zusammen, ist jedes Update ein Risiko für
Ressourcen und Konfiguration, und irgendwann geht dabei etwas verloren.
</Callout>

## Schritt 1.2: FXServer-Artefakt installieren

Die Linux-Builds liegen unter
[runtime.fivem.net/artifacts/fivem/build_proot_linux/master/](https://runtime.fivem.net/artifacts/fivem/build_proot_linux/master/).
Jeder Eintrag ist ein Ordner aus Buildnummer und Hash. Nimm einen aus der
Recommended-Zeile, nicht blind den obersten.

```bash
cd /opt/fivem/server
curl -fsSL -o fx.tar.xz \
  "https://runtime.fivem.net/artifacts/fivem/build_proot_linux/master/<NUMMER>-<HASH>/fx.tar.xz"
tar -xf fx.tar.xz
rm fx.tar.xz
chmod +x run.sh
chown -R fivem:fivem /opt/fivem/server
```

Danach liegen dort genau zwei Dinge: `run.sh` und `alpine/`. Die eigentliche
Server-Binary steckt darin unter `alpine/opt/cfx-server/FXServer`.

<Callout type="warning">
**Der Linux-Build läuft in einem proot-Container.** `run.sh` ist nur ein
Startskript, das eine Alpine-Umgebung aufspannt und den Server darin ausführt.
proot arbeitet mit `ptrace`, und das hat Folgen für die systemd-Unit weiter
unten: die üblichen Hardening-Optionen (`SystemCallFilter=@system-service`,
`RestrictNamespaces=true`, `NoNewPrivileges=true`) sperren genau diesen
Mechanismus aus. Der Dienst startet dann nicht, mit einer Fehlermeldung, die
nach allem Möglichen aussieht, nur nicht nach systemd.
</Callout>

## Schritt 1.3: Server-Daten holen

```bash
sudo -u fivem git clone https://github.com/citizenfx/cfx-server-data.git \
  /opt/fivem/server-data
```

Eine `server.cfg` brauchst Du an dieser Stelle noch nicht. Die legt der
Setup-Assistent von txAdmin gleich selbst an, samt Lizenzschlüssel und
Ressourcenliste.

## Schritt 1.4: txAdmin an localhost binden

Das ist der Schritt, um den es hier vor allem geht. Ohne ihn hört txAdmin auf
`0.0.0.0:40120`, also auf jeder Netzwerkschnittstelle, unverschlüsselt.

```
+set txAdminInterface 127.0.0.1
+set txAdminPort 40120
```

<Callout type="danger">
**Diese beiden Convars gehören an `run.sh`, nicht in die `server.cfg`.** Die
`server.cfg` liest der Spielserver, und den startet txAdmin. Zu dem Zeitpunkt,
an dem die Datei gelesen wird, läuft txAdmin längst und hat seinen Port
gebunden. Ein `set txAdminPort` in der `server.cfg` wird schlicht ignoriert,
ohne Fehlermeldung, und man sucht den Fehler an der falschen Stelle.
</Callout>

## Schritt 1.5: systemd-Unit

Die Unit gibt es als kommentierte Vorlage zum Herunterladen:

```bash
curl -fsSL https://uploads.musiker15.de/fivem/fivem.service \
  -o /etc/systemd/system/fivem.service
```

Oder von Hand anlegen:

```bash
nano /etc/systemd/system/fivem.service
```

```ini
[Unit]
Description=FiveM FXServer mit txAdmin
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=fivem
Group=fivem
WorkingDirectory=/opt/fivem/server-data
ExecStart=/opt/fivem/server/run.sh \
    +set serverProfile default \
    +set txAdminInterface 127.0.0.1 \
    +set txAdminPort 40120
Restart=always
RestartSec=15
TimeoutStartSec=120
TimeoutStopSec=30
KillMode=mixed
KillSignal=SIGINT
StandardOutput=journal
StandardError=journal
SyslogIdentifier=fivem
LimitNOFILE=65535

# Zurueckhaltendes Hardening. Alles, was ptrace oder Namespaces einschraenkt,
# bricht den proot-Build, siehe oben.
PrivateTmp=true
ProtectKernelTunables=true
ProtectControlGroups=true

[Install]
WantedBy=multi-user.target
```

```bash
systemctl daemon-reload
systemctl enable --now fivem
systemctl status fivem
```

Vier Zeilen darin sind keine Geschmacksfrage:

**`KillMode=mixed` statt `process`.** `run.sh` ist nur ein Wrapper. Bei
`KillMode=process` bekommt nur er das Signal, die Kindprozesse laufen weiter.
systemd hält den Dienst dann für gestoppt, während der Server noch am Spielport
hängt, und der nächste Start scheitert an einem belegten Port.

**`KillSignal=SIGINT`.** FXServer behandelt `SIGINT` als geordnetes
Herunterfahren. Mit dem Standardsignal `SIGTERM` fällt er härter um.

**`After=network-online.target` plus `Wants=`.** `network.target` allein heißt
nur, dass das Netzwerk-Subsystem gestartet wurde, nicht dass eine Adresse
konfiguriert ist. Der Server versucht dann beim Booten eine Verbindung zu Cfx,
bekommt keine Route und läuft ohne Eintrag in der Serverliste weiter.

**Kein `ProtectHome=`, wenn die Serverdaten unter `/home` liegen.** Im Beispiel
liegt alles unter `/opt`, deshalb ist die Zeile hier gar nicht nötig. Wer den
Server unter `/home/fivem/` betreibt, darf `ProtectHome=true` nicht setzen, der
Dienst sieht sein eigenes Verzeichnis sonst nicht mehr.

## Schritt 1.6: Prüfen, dass der Port wirklich zu ist

```bash
ss -tlnp | grep 40120
```

Erwartet wird `127.0.0.1:40120`. Steht dort `0.0.0.0:40120` oder `*:40120`, hat
die Convar nicht gegriffen, etwa weil das Artefakt zu alt ist. Dann muss die
Firewall einspringen:

```bash
ufw allow 30120/tcp
ufw allow 30120/udp
ufw deny  40120/tcp
ufw status verbose
```

Der Spielport 30120 muss offen sein, sonst findet niemand den Server. Der
Panel-Port wird ausdrücklich verboten, auch wenn Schritt 1.4 sauber gegriffen
hat. Zwei Schlösser an der Tür, die den kompletten Server steuert, sind
angemessen.

## Schritt 1.7: Erstsetup über einen SSH-Tunnel

txAdmin schreibt beim ersten Start eine PIN ins Log. Sie gilt nur wenige
Minuten.

```bash
journalctl -u fivem -n 50 | grep -i pin
```

Weil der Port nicht nach außen offen ist, holst Du ihn Dir per SSH auf den
eigenen Rechner. Der folgende Befehl läuft **auf Deinem PC**, nicht auf dem
Server:

```bash
ssh -N -L 40120:127.0.0.1:40120 root@<server-ip>
```

Solange dieses Fenster offen bleibt, erreichst Du das Panel unter
`http://127.0.0.1:40120/` im Browser. Dort die PIN eingeben und den
Master-Account anlegen. Danach führt der Assistent durch Lizenzschlüssel,
Serververzeichnis (`/opt/fivem/server-data`) und die erste `server.cfg`.

<Callout type="tip">
`-N` sagt SSH, dass keine Shell geöffnet werden soll, es wird also wirklich nur
weitergeleitet. Das Fenster sieht aus, als hinge es, und genau das ist richtig.
Beendet wird der Tunnel mit `Strg+C`.
</Callout>

<Callout type="warning">
**Die PIN ist kurzlebig, und beim Warten auf den Tunnel läuft sie gern ab.**
Wenn das passiert, einfach `systemctl restart fivem` und sofort erneut ins Log
sehen. Der Tunnel darf dabei offen bleiben.
</Callout>

## Schritt 1.8: Läuft es?

```bash
systemctl status fivem
journalctl -u fivem -n 40

# Antwortet der Spielport
ss -ulnp | grep 30120
```

Nach einem Neustart der Maschine muss der Dienst von allein wiederkommen, dafür
sorgt das `enable`. Einmal ausprobieren lohnt sich, bevor Spieler darauf
angewiesen sind:

```bash
reboot
# nach dem Hochfahren
systemctl is-active fivem
```

## Häufige Fehler

| Meldung oder Symptom                                 | Ursache                                                          | Lösung                                                                   |
| ---------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Dienst startet nicht, kein brauchbarer Fehler im Log | systemd-Hardening blockiert proot                                | `SystemCallFilter`, `RestrictNamespaces` und `NoNewPrivileges` entfernen |
| `Permission denied` beim Start                       | `run.sh` nicht ausführbar oder falscher Besitzer                 | `chmod +x run.sh`, `chown -R fivem:fivem`                                |
| Port 30120 beim Start belegt                         | `KillMode=process`, Kindprozesse überleben                       | auf `KillMode=mixed` umstellen                                           |
| Dienst startet, aber findet sein Verzeichnis nicht   | `ProtectHome=true` bei Pfad unter `/home`                        | Zeile entfernen oder Server nach `/opt` legen                            |
| `ss` zeigt `0.0.0.0:40120`                           | Convar nicht übernommen                                          | Artefakt aktualisieren, `ufw deny 40120/tcp`                             |
| Browser erreicht `127.0.0.1:40120` nicht             | SSH-Tunnel nicht offen oder auf dem Server statt lokal gestartet | Befehl aus Schritt 1.7 auf dem eigenen PC ausführen                      |
| PIN im Log abgelaufen                                | die PIN gilt nur wenige Minuten                                  | `systemctl restart fivem`, Log sofort lesen                              |
| Server taucht nicht in der Serverliste auf           | Lizenzschlüssel fehlt oder Netzwerk beim Boot noch nicht bereit  | `sv_licenseKey` prüfen, `network-online.target` in der Unit              |

## Alles auf einmal

Wer die Schritte 1.1 bis 1.5 nicht von Hand gehen will, kann den Installer
nehmen. Er legt Unit, Update-Script und Cron-Eintrag in einem Durchlauf an und
fragt vorher alle Pfade ab. Beschrieben ist er in
[Schritt 3](/de/docs/fivem/auto-update#alles-auf-einmal-der-installer).

## Weiter mit Schritt 2

Der SSH-Tunnel ist auf Dauer unbequem, und für mehr als eine Person taugt er
nicht. Der nächste Teil setzt Apache davor, sodass das Panel unter einer eigenen
Subdomain per HTTPS erreichbar ist, mit funktionierender Live-Konsole:

**[Schritt 2: txAdmin hinter einem Reverse Proxy](/de/docs/fivem/txadmin-reverse-proxy)**
