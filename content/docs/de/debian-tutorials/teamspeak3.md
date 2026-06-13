---
title: "TeamSpeak 3 Server"
description: "TS3-Server auf Debian manuell aufsetzen, updaten und Fehler beheben."
order: 5
tags: ["debian", "teamspeak"]
---

## Installation

Wir installieren nun einen TeamSpeak 3 Server manuell, ohne irgendwelche
Installer-Scripte.

<Callout type="info">
Die hier verwendete Version `3.13.7` war zum Zeitpunkt der Anleitung aktuell.
Die jeweils neueste Version findest Du unter
[files.teamspeak-services.com/releases/server](https://files.teamspeak-services.com/releases/server/)
— Versionsnummer in den Befehlen entsprechend anpassen.
</Callout>

```bash
adduser --disabled-login ts3
cd /home/ts3/
wget https://files.teamspeak-services.com/releases/server/3.13.7/teamspeak3-server_linux_amd64-3.13.7.tar.bz2
tar -xjvf teamspeak3-server_linux_amd64-3.13.7.tar.bz2
cd teamspeak3-server_linux_amd64
chmod +x ts3server_startscript.sh
touch .ts3server_license_accepted
chown -R ts3:ts3 /home/ts3/
su ts3
./ts3server_startscript.sh start
```

Mit dem Befehl `su ts3` loggen wir uns in den `ts3`-Benutzer ein, da wir
nicht mit dem `root`-Benutzer einen Server starten wollen.

Ich empfehle außerdem, den Query-Port unseres TeamSpeak-Servers zu ändern.
Dazu kann man ihn entweder beim Start als Parameter `query_port=PORT`
mitgeben — oder, dauerhaft und ohne ihn jedes Mal angeben zu müssen, fest in
einer `ts3server.ini` hinterlegen.

**Variante 1 — pro Start (temporär):**

```bash
/home/ts3/teamspeak3-server_linux_amd64/ts3server_startscript.sh start query_port=12345
```

**Variante 2 — dauerhaft über die `ts3server.ini`** (im Server-Verzeichnis
anlegen, der Startscript liest sie automatisch):

```ini
query_port=12345
```

<Callout type="warning">
**Wichtig:** Admin Server Query Login und den Token kopieren!
</Callout>

**Kompletter Pfad:** `/home/ts3/teamspeak3-server_linux_amd64/ts3server_startscript.sh {start/stop/restart}`

<Callout type="tip">
Für den dauerhaften Betrieb (Autostart beim Booten, sauberes Start/Stop)
empfiehlt sich ein **systemd-Service** statt des manuellen Starts. Eine Unit
unter `/etc/systemd/system/ts3server.service` mit `User=ts3` und
`ExecStart=/home/ts3/teamspeak3-server_linux_amd64/ts3server_startscript.sh start`
(Type `forking`) erledigt das zuverlässig.
</Callout>

---

## Updaten

```bash
cd /home/ts3/
wget https://files.teamspeak-services.com/releases/server/3.13.7/teamspeak3-server_linux_amd64-3.13.7.tar.bz2
tar -xjvf teamspeak3-server_linux_amd64-3.13.7.tar.bz2
chown -R ts3:ts3 /home/ts3/
cd teamspeak3-server_linux_amd64
su ts3
./ts3server_startscript.sh start
```

Beim Update einfach den Server mit der neuen Version neu runterladen und
entpacken. Die erforderlichen Dateien überschreiben sich dann automatisch.
Der Rest (Configs etc.) bleibt erhalten.

---

## Fehler

Sollte der Server mal nicht starten bzw. nach dem Start direkt wieder
stoppen, am besten mal in den Logs nach dem Fehler suchen. Alternativ kann
auch `ts3server_minimal_runscript.sh` ausgeführt werden.

Falls hier folgender Fehler zu sehen ist, müssen zwei Befehle ausgeführt
werden. Dies kann z.B. der Fall sein, wenn man den TeamSpeak-Server aus
Versehen als root-Benutzer gestartet hat:

```
ERROR | Accounting | could not register the local accounting service: The file already exists
```

Nun einmal diesen Befehl als root ausführen:

```bash
ls -al /dev/shm/
```

Jetzt sollte sowas wie das hier angezeigt werden:

```
-rw-r--r-- 1 root root 128 Dez 5 11:41 7gbhujb54g8z9hu43jre8
```

Wenn dies der Fall ist, muss diese Datei gelöscht werden:

```bash
rm /dev/shm/7gbhujb54g8z9hu43jre8
```

Jetzt kann man den TeamSpeak-Server wieder ganz normal mit dem
`ts3`-Benutzer starten.
