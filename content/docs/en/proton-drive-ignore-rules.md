---
title: "Proton Drive: keeping files out of sync"
description: "A fork of the Proton Drive client for Windows that understands ignore rules. A .protonignore in the sync folder, plus .gitignore per directory, in full gitignore syntax."
date: 2026-08-20
order: 20
tags: ["proton", "windows", "open-source", "sync"]
---

<Callout type="note">
A personal project, not something Proton offers. This project is not affiliated
with, endorsed by, or connected to Proton AG. For anything you need to rely on,
use the official client.
</Callout>

Proton Drive syncs everything inside the sync folder. For documents that is
exactly right. The moment a code project lives there, the client starts
uploading `node_modules`, build folders and log files, which is precisely what
every version control system deliberately leaves out.

Proton published the source of the Windows client under the GPLv3. My fork adds
an ignore system to it, modelled on `.gitignore`.

The repository is `Musiker15/windows-drive`, on
[GitHub](https://github.com/Musiker15/windows-drive).

## What the rules look like

A `.protonignore` on the root of a sync folder applies to that whole folder:

```
# extension, applies at any depth
*.log
# an exception to that
!important.log
# directory only, applies at any depth
node_modules/
# anchored, applies to the sync folder itself only
/build
```

On top of that, a `.gitignore` in any directory is honoured exactly where Git
would honour it. A repository inside your Drive stops uploading its own build
output without you writing a second rule for it. This can be turned off.

The syntax is gitignore's, with Windows conventions where the two disagree:

| Pattern            | Meaning                                        |
| ------------------ | ---------------------------------------------- |
| `build`            | any file or folder named `build`, at any depth |
| `/build`           | only `build` directly in the sync folder       |
| `build/`           | only directories named `build`                 |
| `*.log`            | anything ending in `.log`                      |
| `!important.log`   | takes back what an earlier rule excludes       |
| `docs/*.pdf`       | contains a slash, so it is anchored            |
| `docs/**/draft.md` | `draft.md` anywhere below `docs`               |
| `temp?`            | `?` matches exactly one character              |

## Precedence

From weakest to strongest: a shallower `.gitignore`, a deeper `.gitignore`, and
`.protonignore` last.

`.protonignore` wins last so that a negation there can bring back what a
repository excludes. An example: the project ignores `dist/`, but you want that
folder in the cloud anyway. Put `!dist/` into `.protonignore` and it is settled.

## What the rules do not do

Rules only apply to items that are not yet indexed. Anything already in sync
stays in sync, even if a new rule would match it.

That is the most important decision in the whole feature. An ignore system that
worked retroactively would have an unpleasant property: one carelessly typed
line would remove files from the cloud. A typo in a text file must not cause
data loss.

## Building it

```powershell
.\build.ps1
```

That is all of it. The script locates the .NET 10 SDK, builds the packages it
needs from the installed application, and puts the result in `artifacts`.

The prerequisites are the .NET 10 SDK and the official Proton Drive client in
the same version. If either is missing, the script tells you and names the
command to install it.

## Why there is no download

<Callout type="warning">
There is no ready made `.exe` here or on GitHub, and there will not be one.
</Callout>

The client needs three libraries from Proton that are published neither as
source nor under a licence that would let anyone else pass them on. They exist
only inside the official application and end up in every build. Offering a
binary would mean redistributing them.

There is a second point that holds regardless of licences: an unsigned
application carrying Proton's name and asking for Proton credentials looks
exactly like an attack from the outside. Building it yourself means knowing what
you are starting.

## Upstream

The feature is proposed as PR #2 in Proton's original repository. If it is
picked up there, it will eventually arrive through the official signed
installer and this fork becomes unnecessary. That would be the best outcome.

This guide is also available
[in German](/de/docs/proton-drive-ignore-rules).
