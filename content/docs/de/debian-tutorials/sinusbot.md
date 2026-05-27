---
title: "Sinusbot"
description: "Musik-Bot für TeamSpeak: Sinusbot installieren, konfigurieren und updaten."
order: 6
tags: ["debian", "sinusbot", "teamspeak"]
---

## Downloads

- [Sinusbot v1.0.1](https://www.sinusbot.com/pre/sinusbot-1.0.1-amd64.tar.bz2) — Mirror: [Sinusbot v1.0.1](https://cloud.musiker15.de/index.php/s/wRgebXoXYXTYHGS)
- [Sinusbot v1.0.2](https://www.sinusbot.com/pre/sinusbot-1.0.2-amd64.tar.bz2) — Mirror: [Sinusbot v1.0.2](https://cloud.musiker15.de/index.php/s/tbGpCQCZFexELis)
- [TeamSpeak Client 3.5.3](https://files.teamspeak-services.com/releases/client/3.5.3/TeamSpeak3-Client-linux_amd64-3.5.3.run) — Mirror: [TeamSpeak Client 3.5.3](https://cloud.musiker15.de/index.php/s/WdHZWPJkAFAQ75L)

---

## Installation

```bash
apt-get update
apt-get install -y x11vnc xvfb libxcursor1 ca-certificates curl bzip2 \
  libnss3 libegl1-mesa x11-xkb-utils libasound2 libpci3 libxslt1.1 \
  libxkbcommon0 libxss1 libxcomposite1 libglib2.0-0 nano screen
update-ca-certificates
```

Der nächste Schritt ist optional und muss nur installiert werden, wenn die
YouTube-Funktion genutzt werden möchte:

```bash
apt-get install python -y
wget https://yt-dl.org/downloads/latest/youtube-dl -O /usr/local/bin/youtube-dl
chmod a+rx /usr/local/bin/youtube-dl
chown sinusbot:sinusbot /usr/local/bin/youtube-dl
```

Nach dem erstmaligen Start des Sinusbot muss in der `config.ini` dann
folgendes ersetzt werden. Der Sinusbot muss danach neugestartet werden:

```ini
YoutubeDLPath = "/usr/local/bin/youtube-dl"
```

Nun kann mit der Installation fortgefahren werden:

```bash
adduser --disabled-login sinusbot
mkdir -p /opt/sinusbot
cd /opt/sinusbot/

wget https://www.sinusbot.com/pre/sinusbot-1.0.2-amd64.tar.bz2
tar -xjf sinusbot-1.0.2-amd64.tar.bz2

cp config.ini.dist config.ini

wget https://files.teamspeak-services.com/releases/client/3.5.3/TeamSpeak3-Client-linux_amd64-3.5.3.run
chmod +x TeamSpeak3-Client-linux_amd64-3.5.3.run
./TeamSpeak3-Client-linux_amd64-3.5.3.run
rm TeamSpeak3-Client-linux_amd64/xcbglintegrations/libqxcb-glx-integration.so
mkdir TeamSpeak3-Client-linux_amd64/plugins
cp plugin/libsoundbot_plugin.so TeamSpeak3-Client-linux_amd64/plugins/

chmod 755 sinusbot
chown -R sinusbot:sinusbot /opt/sinusbot/
screen -S sinusbot
su sinusbot && cd /opt/sinusbot/sinusbot
```

Mit dem Befehl `su sinusbot` loggen wir uns in den `sinusbot`-Benutzer ein,
da wir nicht mit dem `root`-Benutzer starten wollen.

Zum Verlassen des Screens einfach `Strg+A+D` drücken und man ist wieder in
der normalen Server-Konsole.

Um wieder in den Screen zu kommen und den Bot zu stoppen:

```bash
screen -r sinusbot   # Betritt den Screen
# Strg+C (2x drücken stoppt den Sinusbot)
```

Um das Webinterface des Sinusbots aufzurufen, einfach folgendes im Browser
eingeben:

```
http://www.deine-domain.de:8087
```

---

## Updates

### Sinusbot Update

```bash
cd /opt/sinusbot
wget https://www.sinusbot.com/pre/sinusbot-1.0.2-amd64.tar.bz2
tar -xjvf sinusbot-1.0.2-amd64.tar.bz2
cp plugin/libsoundbot_plugin.so TeamSpeak3-Client-linux_amd64/plugins/
chown -R sinusbot:sinusbot /opt/sinusbot
```

### TeamSpeak Client Update

<Callout type="info">
Aktuell wird leider nur bis maximal Client-Version 3.5.3 unterstützt.
</Callout>

```bash
cd /opt/sinusbot
wget https://files.teamspeak-services.com/releases/client/3.5.3/TeamSpeak3-Client-linux_amd64-3.5.3.run
chmod +x TeamSpeak3-Client-linux_amd64-3.5.3.run
./TeamSpeak3-Client-linux_amd64-3.5.3.run
```

Jetzt müssen die neuen Nutzungsbedingungen akzeptiert werden. Als nächstes
müssen ein Ordner und eine Datei gelöscht werden:

```bash
rm -rf data/ts3
rm TeamSpeak3-Client-linux_amd64/xcbglintegrations/libqxcb-glx-integration.so
```

Jetzt müssen wir das TeamSpeak-Client-Plugin wieder kopieren, damit Sinusbot
sich mit dem TeamSpeak-Client verbindet, und wieder passende Rechte vergeben:

```bash
cp plugin/libsoundbot_plugin.so TeamSpeak3-Client-linux_amd64/plugins/
chown -R sinusbot:sinusbot /opt/sinusbot
```

Jetzt kann Sinusbot wieder ganz normal gestartet werden.
