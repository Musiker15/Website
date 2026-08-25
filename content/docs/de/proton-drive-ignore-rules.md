---
title: "Proton Drive: Dateien vom Sync ausschließen"
description: "Ein Fork des Proton-Drive-Clients für Windows, der Ignore-Regeln kennt. Eine .protonignore im Sync-Ordner, dazu .gitignore pro Verzeichnis, in vollständiger gitignore-Syntax."
date: 2026-08-20
order: 2
tags: ["proton", "windows", "open-source", "sync"]
---

<Callout type="note">
Ein privates Projekt, kein Angebot von Proton. This project is not affiliated
with, endorsed by, or connected to Proton AG. Für alles, worauf Du Dich
verlassen musst, nimm den offiziellen Client.
</Callout>

Proton Drive synchronisiert alles, was im Sync-Ordner liegt. Bei Dokumenten ist
das genau richtig. Sobald dort ein Code-Projekt liegt, lädt der Client
`node_modules`, Build-Ordner und Logdateien mit hoch, also genau das, was jedes
Versionskontrollsystem bewusst draußen lässt.

Proton hat den Quellcode des Windows-Clients unter der GPLv3 veröffentlicht.
Mein Fork ergänzt dort ein Ignore-System, das sich an `.gitignore` orientiert.

Das Repository heißt `Musiker15/windows-drive` und liegt auf
[GitHub](https://github.com/Musiker15/windows-drive).

## Wie die Regeln aussehen

Eine Datei `.protonignore` im Wurzelverzeichnis eines Sync-Ordners gilt für
diesen ganzen Ordner:

```
# Endung, greift auf jeder Ebene
*.log
# Ausnahme davon
!wichtig.log
# Nur Ordner, greift auf jeder Ebene
node_modules/
# Verankert, greift nur direkt im Sync-Ordner
/build
```

Zusätzlich wird eine `.gitignore` in jedem beliebigen Verzeichnis
berücksichtigt, genau dort, wo Git sie auch anwenden würde. Ein Repository im
Drive hört damit von selbst auf, seine eigenen Build-Artefakte hochzuladen, ohne
dass Du eine zweite Regel schreibst. Abschalten lässt sich das.

Die Syntax ist die von gitignore, mit Windows-Konventionen dort, wo beide
auseinandergehen:

| Muster               | Bedeutung                                         |
| -------------------- | ------------------------------------------------- |
| `build`              | Datei oder Ordner namens `build`, auf jeder Ebene |
| `/build`             | nur `build` direkt im Sync-Ordner                 |
| `build/`             | nur Verzeichnisse namens `build`                  |
| `*.log`              | alles, was auf `.log` endet                       |
| `!wichtig.log`       | holt zurück, was eine frühere Regel ausschließt   |
| `docs/*.pdf`         | enthält einen Schrägstrich, also verankert        |
| `docs/**/entwurf.md` | `entwurf.md` irgendwo unterhalb von `docs`        |
| `temp?`              | `?` steht für genau ein Zeichen                   |

## Die Rangfolge

Von schwach nach stark: eine flachere `.gitignore`, eine tiefere `.gitignore`,
zuletzt `.protonignore`.

`.protonignore` gewinnt zum Schluss, damit eine Negation dort zurückholen kann,
was ein Repository ausschließt. Ein Beispiel: das Projekt ignoriert `dist/`, Du
willst den Ordner aber trotzdem in der Cloud haben. Dann kommt `!dist/` in die
`.protonignore`, und der Fall ist erledigt.

## Was die Regeln nicht tun

Regeln greifen nur für Elemente, die noch nicht indiziert sind. Was bereits
synchronisiert ist, bleibt synchronisiert, auch wenn eine neue Regel darauf
passen würde.

Das ist die wichtigste Entscheidung am ganzen Feature. Ein Ignore-System, das
rückwirkend arbeitet, hätte eine unangenehme Eigenschaft: eine unbedacht
getippte Zeile würde Dateien aus der Cloud entfernen. Ein Tippfehler in einer
Textdatei darf keinen Datenverlust auslösen.

## Selbst bauen

```powershell
.\build.ps1
```

Mehr ist es nicht. Das Skript sucht das .NET-10-SDK, baut die benötigten Pakete
aus der installierten Anwendung und legt das Ergebnis in `artifacts` ab.

Voraussetzungen sind das .NET 10 SDK und der offizielle Proton-Drive-Client in
derselben Version. Fehlt eines von beidem, sagt das Skript es Dir und nennt den
Befehl zum Nachinstallieren.

## Warum es keinen Download gibt

<Callout type="warning">
Es gibt hier und auf GitHub keine fertige `.exe`, und es wird auch keine geben.
</Callout>

Der Client braucht drei Bibliotheken von Proton, die weder als Quellcode noch
unter einer Lizenz veröffentlicht sind, die eine Weitergabe durch Dritte
erlaubt. Sie stecken ausschließlich in der offiziellen Anwendung und landen in
jedem Build. Eine Binary anzubieten hieße, sie weiterzuverbreiten.

Dazu kommt ein zweiter Punkt, der unabhängig von Lizenzen gilt: eine
unsignierte Anwendung, die Protons Namen trägt und nach Proton-Zugangsdaten
fragt, sieht von außen genauso aus wie ein Angriff. Wer selbst baut, weiß, was
er startet.

## Upstream

Das Feature ist als PR #2 im Original-Repository von Proton vorgeschlagen. Wenn
es dort übernommen wird, kommt es irgendwann aus dem offiziellen, signierten
Installer, und dieser Fork erübrigt sich. Das wäre der beste Ausgang.

Die Anleitung gibt es auch
[auf Englisch](/en/docs/proton-drive-ignore-rules).
