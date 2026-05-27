---
title: "Update von Debian 10 auf Debian 11"
description: "Schritt-für-Schritt-Anleitung für das Major-Release-Upgrade von Debian Buster auf Bullseye."
order: 1
tags: ["debian", "upgrade"]
---

In diesem Tutorial erkläre ich Schritt für Schritt wie man von Debian 10
auf Debian 11 updaten kann. Es werden natürlich keine Daten verloren gehen
und man kann das System ganz normal wie vorher weiter verwenden.

Als erstes prüfen wir nochmal unsere Version:

```bash
hostnamectl
```

Als nächstes aktualisieren wir alles:

```bash
apt update && apt full-upgrade -y
```

Als nächstes muss der Paketcache gelöscht werden:

```bash
apt clean
```

Nachdem wir das nun gemacht haben, müssen wir natürlich die Repository ändern.
Das geht entweder per Befehl:

```bash
sed -i 's/buster/bullseye/g' /etc/apt/sources.list
```

oder manuell in `/etc/apt/sources.list`:

```
deb http://deb.debian.org/debian bullseye main contrib non-free
deb http://deb.debian.org/debian bullseye-updates main contrib non-free
deb http://security.debian.org/debian-security bullseye-security main
deb http://ftp.debian.org/debian bullseye-backports main contrib non-free
```

<Callout type="warning">
**Wichtig:** Die `php.list` nicht vergessen! Diese ist meistens in
`/etc/apt/sources.list.d/` zu finden.
</Callout>

Nachdem wir alles geändert haben, können wir nun alle Pakete aktualisieren:

```bash
apt update && apt full-upgrade -y
```

Das kann nun eine Zeit in Anspruch nehmen. Sobald das ganze durchgelaufen
ist, können wir den Server neustarten:

```bash
reboot
```

Wenn der Server wieder hochgefahren ist, überprüfen wir die Debian-Version:

```bash
hostnamectl
```

Wenn hier nun Debian 11 steht, hat alles korrekt funktioniert. Wir entfernen
noch die unnötigen Pakete und starten danach noch einmal den Server neu:

```bash
apt-get autoremove -y
reboot
```

Sobald der Server jetzt wieder hochgefahren ist, machen wir nochmals Updates
der Pakete:

```bash
apt update && apt full-upgrade -y
```

Nun ist das Update von Debian 10 auf Debian 11 erfolgreich abgeschlossen.
