---
title: "MariaDB-Upgrade auf Debian / Ubuntu"
description: "Major-Release-Upgrade von MariaDB 10 auf 11 ohne Datenverlust."
order: 3
tags: ["debian", "mariadb"]
---

Bei einem MariaDB-Upgrade von z.B. Version 10 auf Version 11 bleiben alle
aktuellen Datenbanken bestehen. Es gibt also keinen Datenverlust, alles
läuft nach dem Upgrade genauso wie vorher.

<Callout type="warning">
Ich empfehle dennoch ein vollständiges Backup zu erstellen! Ich übernehme
keine Haftung, falls etwas schief läuft.
</Callout>

Zunächst einmal prüfen wir, welche MariaDB-Version wir aktuell installiert
haben:

```bash
mysql
status
exit
```

Hier sehen wir bei `Server Version`, welche MariaDB-Version wir aktuell
installiert haben. In diesem Fall gehen wir von Version 10.X aus, also
müsste hier sowas wie `Server Version: 10.5.21-MariaDB-XXXXX` stehen.

Um das Upgrade durchführen zu können, müssen wir den MariaDB-Server erst
einmal stoppen und danach sicherheitshalber Backups erstellen:

```bash
service mysql stop
cp -R /etc/mysql/ /etc/mysql-backup
cp -R /var/lib/mysql /var/lib/mysql-backup
```

Nun haben wir den MariaDB-Server gestoppt und Backups der Dateien erstellt.
Als nächstes müssen wir das neue Repository zu `sources.list` hinzufügen:

```bash
curl -LsS https://r.mariadb.com/downloads/mariadb_repo_setup | sudo bash
```

Als nächstes müssen wir den alten MariaDB-Server löschen, damit wir die
neue Version herunterladen können:

```bash
apt remove mariadb-*
apt install mariadb-server
```

Im Anschluss sollten wir prüfen, ob der MariaDB-Server gestartet wurde:

```bash
mysql
```

Falls wir hier einen Fehler erhalten, starten wir den MariaDB-Server manuell
und überprüfen, ob die neue Version installiert wurde:

```bash
service mysql start
status
exit
```

In seltenen Fällen gibt es nach der Installation ein paar kleinere Probleme,
wenn man sich z.B. mit phpMyAdmin versucht anzumelden. Dieser Fehler könnte
z.B. wie folgt aussehen:

```
error #1231 – Variable 'lc_messages' can't be set to the value of de_DE
```

In diesem Fall könnte es sein, dass noch ein veralteter Pfad in der
Konfiguration hinterlegt ist. Dazu gehen wir einfach in die
`/etc/mysql/mariadb.conf.d/50-server.cnf` und ändern den Pfad:

```ini
lc-messages-dir = /usr/share/mariadb/german
lc-messages     = de_DE
```

Nun starten wir einfach den MySQL-Server neu und es sollte alles wieder
einwandfrei funktionieren. Wenn wir getestet haben, ob wirklich alles
korrekt funktioniert und alle vorher erstellten Datenbanken noch
funktionieren, können wir die vorhin erstellten Backups löschen:

```bash
rm -r /etc/mysql-backup
rm -r /var/lib/mysql-backup
```

**FERTIG**
