---
title: "Sinusbot"
description: "Music bot for TeamSpeak: install, configure and update Sinusbot."
order: 6
tags: ["debian", "sinusbot", "teamspeak"]
---

## Downloads

- [Sinusbot v1.0.1](https://www.sinusbot.com/pre/sinusbot-1.0.1-amd64.tar.bz2) — Mirror: [Sinusbot v1.0.1](https://cloud.musiker15.de/index.php/s/wRgebXoXYXTYHGS)
- [Sinusbot v1.0.2](https://www.sinusbot.com/pre/sinusbot-1.0.2-amd64.tar.bz2) — Mirror: [Sinusbot v1.0.2](https://cloud.musiker15.de/index.php/s/tbGpCQCZFexELis)
- [TeamSpeak Client 3.5.3](https://files.teamspeak-services.com/releases/client/3.5.3/TeamSpeak3-Client-linux_amd64-3.5.3.run) — Mirror: [TeamSpeak Client 3.5.3](https://cloud.musiker15.de/index.php/s/WdHZWPJkAFAQ75L)

---

<Callout type="info">
Sinusbot hasn't been actively maintained for years. This guide is therefore
intended mainly for existing systems or for archival purposes.
</Callout>

## Installation

```bash
apt-get update
apt-get install -y x11vnc xvfb libxcursor1 ca-certificates curl bzip2 \
  libnss3 libegl1-mesa x11-xkb-utils libasound2 libpci3 libxslt1.1 \
  libxkbcommon0 libxss1 libxcomposite1 libglib2.0-0 nano screen
update-ca-certificates
```

The next step is optional and only needs to be installed if you want to use
the YouTube feature. Instead of the deprecated `youtube-dl` (the domain
`yt-dl.org` is offline) we use the actively maintained successor **`yt-dlp`**:

```bash
apt-get install -y python3
wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp
chmod a+rx /usr/local/bin/yt-dlp
```

<Callout type="info">
No `chown` to the `sinusbot` user needed — thanks to `chmod a+rx` any user
(including `sinusbot`) may execute the file. We create the user itself in the
next step.
</Callout>

After the first start of Sinusbot, the following has to be replaced in the
`config.ini`. Sinusbot then has to be restarted:

```ini
YoutubeDLPath = "/usr/local/bin/yt-dlp"
```

Now we can continue with the installation:

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

With the command `su sinusbot` we log in to the `sinusbot` user, since we
don't want to start as the `root` user.

To leave the screen, simply press `Ctrl+A+D` and you're back in the normal
server console.

To get back into the screen and stop the bot:

```bash
screen -r sinusbot   # Enters the screen
# Ctrl+C (press twice to stop Sinusbot)
```

To open the Sinusbot web interface, simply enter the following in the browser:

```
http://www.your-domain.com:8087
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
Unfortunately only up to client version 3.5.3 is currently supported.
</Callout>

```bash
cd /opt/sinusbot
wget https://files.teamspeak-services.com/releases/client/3.5.3/TeamSpeak3-Client-linux_amd64-3.5.3.run
chmod +x TeamSpeak3-Client-linux_amd64-3.5.3.run
./TeamSpeak3-Client-linux_amd64-3.5.3.run
```

Now the new terms of use have to be accepted. Next, a folder and a file have to
be deleted:

```bash
rm -rf data/ts3
rm TeamSpeak3-Client-linux_amd64/xcbglintegrations/libqxcb-glx-integration.so
```

Now we have to copy the TeamSpeak client plugin again so that Sinusbot
connects to the TeamSpeak client, and set the appropriate permissions again:

```bash
cp plugin/libsoundbot_plugin.so TeamSpeak3-Client-linux_amd64/plugins/
chown -R sinusbot:sinusbot /opt/sinusbot
```

Now Sinusbot can be started again as usual.
