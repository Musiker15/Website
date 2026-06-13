---
title: "TeamSpeak 3 Server"
description: "Manually set up, update and troubleshoot a TS3 server on Debian."
order: 5
tags: ["debian", "teamspeak"]
---

## Installation

We'll now install a TeamSpeak 3 server manually, without any installer
scripts.

<Callout type="info">
The version `3.13.7` used here was the latest at the time of writing. You can
find the most recent version at
[files.teamspeak-services.com/releases/server](https://files.teamspeak-services.com/releases/server/)
— adjust the version number in the commands accordingly.
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

With the command `su ts3` we log in to the `ts3` user, since we don't want to
start a server as the `root` user.

I also recommend changing the query port of our TeamSpeak server. You can
either pass it at startup as the parameter `query_port=PORT` — or, permanently
and without having to specify it every time, set it in a `ts3server.ini`.

**Option 1 — per start (temporary):**

```bash
/home/ts3/teamspeak3-server_linux_amd64/ts3server_startscript.sh start query_port=12345
```

**Option 2 — permanently via the `ts3server.ini`** (create it in the server
directory, the start script reads it automatically):

```ini
query_port=12345
```

<Callout type="warning">
**Important:** Copy the admin server query login and the token!
</Callout>

**Full path:** `/home/ts3/teamspeak3-server_linux_amd64/ts3server_startscript.sh {start/stop/restart}`

<Callout type="tip">
For permanent operation (autostart on boot, clean start/stop) a **systemd
service** is recommended instead of the manual start. A unit at
`/etc/systemd/system/ts3server.service` with `User=ts3` and
`ExecStart=/home/ts3/teamspeak3-server_linux_amd64/ts3server_startscript.sh start`
(type `forking`) handles this reliably.
</Callout>

---

## Updating

```bash
cd /home/ts3/
wget https://files.teamspeak-services.com/releases/server/3.13.7/teamspeak3-server_linux_amd64-3.13.7.tar.bz2
tar -xjvf teamspeak3-server_linux_amd64-3.13.7.tar.bz2
chown -R ts3:ts3 /home/ts3/
cd teamspeak3-server_linux_amd64
su ts3
./ts3server_startscript.sh start
```

To update, simply download and extract the server with the new version again.
The required files then overwrite themselves automatically. The rest (configs
etc.) is preserved.

---

## Errors

If the server doesn't start, or stops again right after starting, it's best to
look through the logs for the error. Alternatively you can run
`ts3server_minimal_runscript.sh`.

If the following error appears, two commands have to be run. This can happen,
for example, if you accidentally started the TeamSpeak server as the root user:

```
ERROR | Accounting | could not register the local accounting service: The file already exists
```

Now run this command as root:

```bash
ls -al /dev/shm/
```

Now something like this should be shown:

```
-rw-r--r-- 1 root root 128 Dec 5 11:41 7gbhujb54g8z9hu43jre8
```

If that's the case, this file has to be deleted:

```bash
rm /dev/shm/7gbhujb54g8z9hu43jre8
```

Now you can start the TeamSpeak server again as usual with the `ts3` user.
