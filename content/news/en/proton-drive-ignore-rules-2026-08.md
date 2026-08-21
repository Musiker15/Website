---
title: "Proton Drive with ignore rules: a fork of the Windows client"
description: "A .protonignore in the sync folder and .gitignore per directory, so node_modules and build folders stop ending up in the cloud. Open source, built by you."
date: 2026-08-20
author: "Moritz Kohm"
tags: ["proton", "windows", "open-source", "sync"]
---

There is a new page in the [guides](/en/docs):
[Proton Drive: keeping files out of sync](/en/docs/proton-drive-ignore-rules).

Behind it is a fork of the Proton Drive client for Windows, whose source Proton
published under the GPLv3. It understands ignore rules, the kind you know from
`.gitignore`.

<Callout type="note">
A personal project, not something Proton offers. This project is not affiliated
with, endorsed by, or connected to Proton AG.
</Callout>

## Why

A code project inside the sync folder uploads everything: `node_modules`, the
build folder, log files. Precisely what every repository deliberately leaves
out. The client offered no switch for it.

The hook was already there. The sync adapter excludes temporary files with
hardcoded rules. A full ignore system now sits in the same place.

## What the fork does

- **`.protonignore`** on the root of a sync folder, applying to that whole
  folder.
- **`.gitignore` per directory**, evaluated exactly where Git would evaluate it.
  A repository inside your Drive stops uploading its artefacts on its own.
- **Full gitignore syntax**: anchors, directory only patterns, negation, `*`,
  `?`, `**` and character classes.
- **A clear precedence order**, so that `.protonignore` can bring back what a
  repository excludes.

The most important point sits further down in the guide but belongs up here:
rules only apply to items that are not yet indexed. Nothing that is already in
sync disappears because you added a rule afterwards. A mistyped line must not
cause data loss.

## There is no download

The client needs three libraries from Proton that are published neither as
source nor under a licence that permits redistribution. They exist only inside
the official application and end up in every build. So what you get here is
build instructions rather than a file. One command, `.\build.ps1`, with the
.NET 10 SDK and the official client as prerequisites.

The feature is also proposed as PR #2 in the original repository. If it is
picked up there, it will arrive through the official signed installer and the
fork becomes unnecessary. That is the outcome I would prefer.

Like all the others, the guide is also available
[in German](/de/docs/proton-drive-ignore-rules).
