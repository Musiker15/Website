---
title: "Proton Drive mit Ignore-Regeln: ein Fork des Windows-Clients"
description: "Eine .protonignore im Sync-Ordner und .gitignore pro Verzeichnis, damit node_modules und Build-Ordner nicht mehr in der Cloud landen. Quelloffen, selbst zu bauen."
date: 2026-08-20
author: "Moritz Kohm"
tags: ["proton", "windows", "open-source", "sync"]
---

Es gibt eine neue Seite in den [Guides](/de/docs):
[Proton Drive: Dateien vom Sync ausschließen](/de/docs/proton-drive-ignore-rules).

Dahinter steckt ein Fork des Proton-Drive-Clients für Windows, dessen Quellcode
Proton unter der GPLv3 veröffentlicht hat. Er kennt Ignore-Regeln, wie man sie
von `.gitignore` kennt.

<Callout type="note">
Ein privates Projekt, kein Angebot von Proton. This project is not affiliated
with, endorsed by, or connected to Proton AG.
</Callout>

## Der Anlass

Ein Code-Projekt im Sync-Ordner lädt alles mit hoch: `node_modules`, den
Build-Ordner, Logdateien. Also genau das, was jedes Repository bewusst draußen
lässt. Der Client bot dafür bisher keinen Schalter.

Der Aufhänger war schon da. Der Sync-Adapter schließt bereits hartcodiert
Temp-Dateien aus. An derselben Stelle sitzt jetzt ein vollständiges Ignore-System.

## Was der Fork kann

- **`.protonignore`** im Wurzelverzeichnis eines Sync-Ordners, gilt für den
  ganzen Ordner.
- **`.gitignore` pro Verzeichnis**, ausgewertet genau dort, wo Git es auch täte.
  Ein Repository im Drive hört damit von selbst auf, seine Artefakte
  hochzuladen.
- **Vollständige gitignore-Syntax**: Anker, Nur-Ordner-Muster, Negation, `*`,
  `?`, `**` und Zeichenklassen.
- **Klare Rangfolge**, damit `.protonignore` zurückholen kann, was ein
  Repository ausschließt.

Der wichtigste Punkt steht in der Anleitung etwas weiter unten, gehört aber
nach vorne: Regeln greifen nur für Elemente, die noch nicht indiziert sind.
Nichts, was bereits synchronisiert ist, verschwindet, weil Du eine Regel
nachträgst. Eine falsch getippte Zeile darf keinen Datenverlust auslösen.

## Es gibt keinen Download

Der Client braucht drei Bibliotheken von Proton, die weder als Quellcode noch
unter einer Lizenz veröffentlicht sind, die eine Weitergabe erlaubt. Sie stecken
nur in der offiziellen Anwendung und landen in jedem Build. Deshalb liegt hier
keine fertige Datei, sondern eine Bauanleitung. Ein Befehl, `.\build.ps1`,
Voraussetzung sind das .NET 10 SDK und der offizielle Client.

Das Feature ist außerdem als PR #2 im Original-Repository vorgeschlagen. Wird es
dort übernommen, kommt es aus dem offiziellen, signierten Installer, und der
Fork erübrigt sich. Das wäre mir am liebsten.

Die Anleitung gibt es wie alle anderen auch
[auf Englisch](/en/docs/proton-drive-ignore-rules).
