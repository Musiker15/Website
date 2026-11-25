---
title: "SSHCraft: mein eigener SSH-Client mit selbst betriebenem Sync"
description: "SSHCraft ist ein quelloffener SSH-Client in Rust, der Hosts und Schlüssel über einen eigenen Server zwischen Geräten synchronisiert, kostenlos und Ende-zu-Ende verschlüsselt. Was er kann, wie er entstanden ist und was als Nächstes kommt."
metaTitle: "SSHCraft: mein SSH-Client mit eigenem Sync-Server"
metaDescription: "SSHCraft ist ein quelloffener SSH-Client in Rust, der Hosts und Schlüssel über einen eigenen Server Ende-zu-Ende verschlüsselt synchronisiert."
date: 2026-11-16
author: "Moritz Kohm"
tags: ["sshcraft", "ssh", "rust", "open-source", "self-hosting"]
---

Seit heute gibt es die erste Version von **SSHCraft**, einem SSH-Client, den
ich in den letzten Tagen gebaut habe. Er läuft unter Windows, Linux und FreeBSD,
macOS baut schon, Android und iOS kommen später. Der Quellcode liegt offen auf
[GitHub](https://github.com/Musiker15/sshcraft), Lizenz MIT oder Apache-2.0.

## Warum noch ein SSH-Client

Ich will auf jedem Gerät dieselben Hosts und Schlüssel haben. Bei vielen
SSH-Clients gibt es dafür gar keinen Sync zwischen Geräten. Termius hat einen,
der kostet aber ein Abo, und die Daten laufen über die Cloud des Anbieters.
Dazu kommt, dass meine SSH-Schlüssel schon länger in Proton Pass stehen
und nicht mehr als Datei auf der Platte. Der Client sollte sie dort abholen
können.

Also habe ich mir aufgeschrieben, was ich brauche: alles, was ich an Termius
schätze, dazu einen kostenlosen Sync über meinen eigenen Server, der die Daten
nie lesen kann. Daraus ist SSHCraft geworden.

## Was SSHCraft heute kann

Die Grundlage ist das, was man von einem SSH-Client erwartet: Hosts in Gruppen
mit Tags und Icons, Import und Export, Terminal-Tabs mit geteilten Bereichen und
Broadcast (eine Eingabe geht an mehrere Server gleichzeitig), gespeicherte
Arbeitsbereiche, Portweiterleitung lokal, entfernt und als SOCKS-Proxy,
Snippets mit Verlauf und Vervollständigung, Sitzungsprotokolle. Ein lokales
Terminal und serielle Verbindungen sind auch dabei.

Bei den Verbindungen geht es etwas weiter als bei Termius. SSHCraft kennt
Jump-Hosts, Proxys und `ProxyCommand`, baut eine abgerissene Verbindung nach
Standby oder Netzwechsel selbst wieder auf und richtet dabei auch die Tunnel neu
ein. Die `~/.ssh/config` wird laufend gelesen, samt `Include`, und auf Wunsch
zurückgeschrieben. Termius importiert sie nur einmal.

Zu den Schlüsseln: SSHCraft erzeugt und importiert sie, kann Passphrasen,
Zertifikate und `authorized_keys`, unter Windows auch FIDO2 und an das Gerät
gebundene Schlüssel. Auf dem Desktop kommen sie auf Wunsch direkt aus dem
SSH-Agent von Proton Pass, dann liegt kein privater Schlüssel auf der Platte.
Passwörter lassen sich als Verweis auf einen Passwortmanager speichern (Proton
Pass, 1Password, Bitwarden und KeePassXC), TOTP-Codes für Server mit zweitem
Faktor auch.

Falls etwas schiefgeht: Gelöschte Hosts landen im Papierkorb, frühere
Fassungen bleiben erhalten, und es gibt eine verschlüsselte Sicherungsdatei.
Unter Windows sperrt sich die App auf Wunsch mit Windows Hello.

### Sync über den eigenen Server

Der Sync-Server `sshcraft-server` ist ein einzelnes Programm oder ein
Docker-Image, mit SQLite oder PostgreSQL, hinter dem eigenen Reverse Proxy.
Verschlüsselt wird auf dem Gerät. Der Server speichert nur Chiffrat und kann
auch dann nichts lesen, wenn jemand ihn übernimmt.

Den Kontoschlüssel erzeugt der Client, nicht der Server, und er liegt in Proton
Pass. Jedes Gerät hat einen eigenen Schlüssel und lässt sich einzeln sperren.
Die Datensätze sind signiert, und ein Gerät merkt, wenn der Server ihm einen
älteren Stand unterschieben will. Hosts und Gruppen lassen sich mit anderen
Leuten auf demselben Server teilen, ohne Team-Abo.

Einrichten ist kurz: Server starten, den API-Key mit
`sshcraft-server api-key show` auslesen und in der App eintragen.

```bash
sshcraft-server serve --public-origin https://sync.example.org
```

Meine eigene Instanz läuft seit heute auf meinem Server, als Docker-Container
mit PostgreSQL hinter Apache. Wie das geht, steht in der
[Anleitung zum Server](https://github.com/Musiker15/sshcraft/blob/main/docs/server.md).

### KI-Agents mit festen Regeln

Claude Code, Codex und andere Agents können SSHCraft über MCP oder die
Kommandozeile `sshcraft-cli` steuern: Hosts auflisten, Befehle ausführen, eine
Shell offen halten, Hosts anlegen oder Schlüssel erzeugen. Für jede Aktion lege
ich fest, ob sie erlaubt ist, nachgefragt wird oder gesperrt bleibt. Die
Nachfrage erscheint nur im SSHCraft-Fenster, nicht im Chat des Agents, und einen
privaten Schlüssel bekommt ein Agent nie zu sehen. Die Verbindung baut SSHCraft
selbst auf.

```bash
claude mcp add sshcraft -- sshcraft-cli mcp
```

Ab Werk ist die Steuerung durch Agents ausgeschaltet. Einschalten lässt sie sich
unter Einstellungen › KI-Agents.

### Was unter der Haube steckt

Private Schlüssel liegen nur verschlüsselt (XChaCha20-Poly1305) in einer
SQLite-Datenbank. Der Hauptschlüssel dazu steht unter Windows in der
Anmeldeinformationsverwaltung. Ändert sich der Fingerprint eines Servers, bricht
SSHCraft die Verbindung ab, auch beim automatischen Wiederverbinden. Weiter geht
es erst, wenn ich den alten Fingerprint im Host bewusst vergesse.

## Wie es entstanden ist

Angefangen hat es am 11.11.2026 mit einem Entwurf und einer ersten Fassung in
Tauri und React, damals noch unter dem Namen "Stollen". Bis zum 14.11. waren
alle fünfzehn Teilpläne umgesetzt. Am selben Tag habe ich entschieden, sie komplett neu in
Rust und egui zu schreiben, nach den Konventionen der Craft-Apps: eine Engine, in
der jede Aktion ein Befehl ist, eine Oberfläche ohne Webview und ein
Steuerkanal, über den auch die Agents laufen. Die Tauri-Fassung ist unter dem
Tag `tauri-final` erhalten.

Seit dem Neuaufbau laufen die Tests in der CI unter Windows, Linux und macOS und
in einer VM unter FreeBSD, und für jede dieser Plattformen entsteht ein Paket.

## Version 0.1

Version 0.1.1 ist das aktuelle Release. Es gibt ein MSI für Windows, deb, rpm,
AppImage und Flatpak für Linux, ein Paket für FreeBSD und den Sync-Server, dazu
`SHA256SUMS.txt` und eine SBOM. Alles liegt unter
[Releases](https://github.com/Musiker15/sshcraft/releases).

<Callout type="warning" title="Unsigniert und noch ohne macOS">
Für Windows und macOS bräuchte es kostenpflichtige Zertifikate, auf die ich
vorerst verzichte. Windows zeigt beim ersten Start deshalb eine Warnung von
SmartScreen. Prüfe den Download vorher gegen `SHA256SUMS.txt`. Für macOS gibt es
noch kein Paket, dort lässt sich SSHCraft aus dem Quellcode bauen.
</Callout>

Ein paar Dinge sind noch offen und in der
[Liste der Lücken](https://github.com/Musiker15/sshcraft/blob/main/docs/gaps.md)
festgehalten. Die App-Sperre gibt es bisher nur mit Windows Hello, und die
Linux-Pakete habe ich noch nicht alle von Hand ausprobiert. Wer etwas findet,
meldet es gern über die
[Issues](https://github.com/Musiker15/sshcraft/issues).

## Was als Nächstes kommt

Als Nächstes ist **SFTP** dran, die größte Lücke gegenüber Termius. Danach geht
es in mehreren Schritten weiter:

- mehr Komfort im Terminal und weitere Extras dort
- mehr Möglichkeiten bei Verbindungen und beim Ordnen der Hosts
- Sitzungen, die einen Verbindungsabbruch überleben, mit tmux, Mosh und Eternal
  Terminal, dazu Telnet
- Ziele und Automatisierung

Android, iOS und iPadOS folgen danach. Touch ID für die App-Sperre unter macOS
steht auch auf der Liste, dafür brauche ich aber erst einen Mac zum Testen. Für
winget ist das Paket eingereicht und wartet auf die Prüfung.

Und eine Idee, die nicht in SSHCraft selbst landet: ein Datenbank-Client als
eigene App. Der soll Datenbanken auf dem Server über einen Tunnel erreichen, den
SSHCraft für ihn öffnet.

Den aktuellen Stand findest Du jederzeit in der
[Roadmap](https://github.com/Musiker15/sshcraft/blob/main/ROADMAP.md). Diesen
Beitrag gibt es auch auf [Englisch](/en/news/sshcraft-2026-11).
