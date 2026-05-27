# Musiker15 Website

> Persönliche Website von **Moritz Kohm (Musiker15)** mit Tutorials, Guides
> und Hintergrund-Infos rund um Server-Administration, Linux/Debian und
> Selbst-Hosting.
> Production: [www.musiker15.de](https://www.musiker15.de)

[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind v4](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)

> Diese Seite ersetzt die bisherige Docusaurus-basierte Version. Die alten
> Tutorials sind nahezu unverändert übernommen, das Framework wurde auf
> **Next.js 16 + Tailwind v4 + MDX** umgestellt — analog zum Schwesterprojekt
> [komascript.musiker15.de](https://komascript.musiker15.de).

---

## ✨ Features

- **Next.js 16 + Turbopack** mit App-Router & Server Components
- **TypeScript** strikt typisiert
- **Tailwind CSS v4** (CSS-First-Config) inkl. Typography-Plugin
- **Markdown / MDX-Content** — neue Tutorials/Seiten werden als `.md`-Dateien angelegt
- **Mehrsprachig** (Deutsch primär, Englisch sekundär) via `next-intl`
- **Light / Dark / System-Theme** via `next-themes`
- **Volltextsuche** (Cmd/Ctrl+K) auf Basis eines Build-Time-Index
- **Voll konfigurierbar** über `config/*.ts` — Navbar, Footer, Site-Metadaten
- **SEO-stark** — OpenGraph, JSON-LD, Sitemap, hreflang, robots
- **Strikt datenschutzkonform** — keine externen Fonts/Skripte, Nonce-basierte CSP mit `'strict-dynamic'` (Mozilla Observatory: **A+**)
- **Apache2 + systemd** ready (Debian, Reverse-Proxy auf Loopback :3101)

---

## 🚀 Quick Start

```bash
# Installation
pnpm install

# Dev-Server (Turbopack, http://localhost:3000)
pnpm dev

# Production-Build
pnpm build && pnpm start

# Content validieren
pnpm validate:content

# Such-Index neu bauen
pnpm build:search
```

Voraussetzungen: **Node ≥ 22**, **pnpm ≥ 11** (Versions-Pin in `package.json`
via `packageManager`-Feld).

---

## 📁 Projektstruktur

```
musiker15-website/
├── config/                # Site-, Navigation- & Footer-Config
├── content/               # ⭐ Alle Inhalte (Markdown / MDX)
│   ├── pages/{de,en}/     # Statische Seiten (About, FAQ, Impressum, …)
│   ├── docs/{de,en}/      # Tutorials (Sidebar auto, verschachtelt)
│   │   └── debian-tutorials/  # Server-Tutorials (Apache, Certbot, …)
│   └── news/{de,en}/      # News / Updates
├── deploy/                # Server-Konfiguration
│   ├── apache2/*.conf     # vHost mit Reverse-Proxy zu :3101
│   └── systemd/*.service  # Run-User musiker15, Port 3101
├── public/                # Statische Assets (Favicon, logo.png, og-Image)
├── scripts/               # Validate-Content, Search-Index-Builder
├── src/
│   ├── app/[locale]/      # Next-App-Router (de / en)
│   │   ├── docs/[...slug] # Catch-All für Tutorials
│   │   ├── news           # News-Liste + Detail
│   │   └── [slug]         # Catch-All für Pages
│   ├── components/        # React-Komponenten
│   ├── lib/               # MDX, Content-Loader, SEO-Helper
│   ├── messages/          # UI-Übersetzungen (de.json, en.json)
│   ├── styles/            # globals.css (Tailwind v4)
│   ├── types/             # TypeScript-Typen + Zod-Schemas
│   └── proxy.ts           # Middleware: next-intl + Nonce-CSP + Cookie-Hardening
├── CLAUDE.md              # Architektur-Plan + Kontext für Claude
├── AUTHORING.md           # Anleitung zum Inhalte-Pflegen
└── README.md
```

---

## 📝 Inhalte pflegen (ohne Code-Kenntnisse)

Komplette Anleitung in **[AUTHORING.md](./AUTHORING.md)**. Kurz:

### Neues Tutorial anlegen

```
content/docs/de/<thema>/<slug>.md
content/docs/en/<thema>/<slug>.md
```

```markdown
---
title: "Mein neues Tutorial"
description: "Kurze Beschreibung für SEO und Social Media."
order: 10
tags: ["debian", "apache"]
---

# Mein neues Tutorial

Inhalt in Markdown …
```

→ Verfügbar unter `/de/docs/<thema>/<slug>` und `/en/docs/<thema>/<slug>`.

### Neue statische Seite

```
content/pages/de/<slug>.md
content/pages/en/<slug>.md
```

→ Verfügbar unter `/de/<slug>` und `/en/<slug>`.

### Navbar erweitern

`config/navigation.config.ts` öffnen, Eintrag zum `primary`-Array hinzufügen,
speichern. Fertig.

### Footer-Spalten ändern

`config/footer.config.ts` — Spalten und Links pflegen.

---

## 🚢 Deployment

### Voraussetzungen auf dem Server (einmalig)

```bash
# Dedizierter Run-User (system, no-login)
sudo useradd -r -m -s /usr/sbin/nologin musiker15

# Verzeichnis
sudo mkdir -p /opt/musiker15
sudo chown musiker15:musiker15 /opt/musiker15

# Node 22 (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash -
sudo apt install nodejs

# pnpm global
sudo npm install -g pnpm

# systemd-Service registrieren
sudo cp deploy/systemd/musiker15.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable musiker15.service

# Apache vHost
sudo cp deploy/apache2/musiker15.de.conf \
  /etc/apache2/sites-available/musiker15.de.conf
sudo a2enmod proxy proxy_http proxy_wstunnel rewrite headers ssl http2 deflate expires
sudo a2ensite musiker15.de.conf
sudo apache2ctl configtest
sudo systemctl reload apache2
```

> SSL-Zertifikat: **eigenes Wildcard-Zertifikat** für `*.musiker15.de`, **kein**
> Let's Encrypt. Die Pfade sind im vHost konfiguriert
> (`/etc/apache2/ssl/fullchain.cer` + `_.musiker15.de_private_key.key`).

### GitHub-Actions

Setze folgende Secrets im Repo:

| Secret | Inhalt |
|---|---|
| `DEPLOY_HOST` | Server-IP oder Hostname |
| `DEPLOY_USER` | SSH-User (mit `sudo` für `chown` & `systemctl restart musiker15`) |
| `DEPLOY_KEY` | Privater SSH-Key (key-only Auth, kein Passwort) |
| `DEPLOY_PORT` | (optional) SSH-Port, default 22 |

Push auf `main` triggert automatisch das Deployment. Der Workflow validiert
Content, baut Type-Check / Lint / Build / Search-Index, packt ein Release-
Tarball und führt auf dem Server einen atomischen Symlink-Swap aus mit
Fallback auf die letzten 5 Releases unter `/opt/musiker15/releases/`.

---

## 🌐 URL-Struktur

| URL | Quelle |
|---|---|
| `/` → `/de` | `src/app/[locale]/page.tsx` |
| `/de/docs` | Übersicht aus `content/docs/de/**/*.md` (Sidebar auto) |
| `/de/docs/pc-hardware` | `content/docs/de/pc-hardware.md` |
| `/de/docs/debian-tutorials/certbot` | `content/docs/de/debian-tutorials/certbot.md` |
| `/de/news` | Liste sortiert nach `frontmatter.date` |
| `/de/<slug>` | Catch-All: `content/pages/de/<slug>.md` |
| `/sitemap.xml` | auto-generiert (`src/app/sitemap.ts`) |
| `/robots.txt` | auto-generiert (`src/app/robots.ts`) |

---

## 🔒 Datenschutz & Sicherheit

**Mozilla Observatory: A+**

- **Nonce-basierte CSP**: pro Request wird in [src/proxy.ts](./src/proxy.ts)
  ein kryptographisch sicherer Nonce erzeugt und in `script-src 'self'
  'nonce-XXX' 'strict-dynamic'` eingebettet. Kein `'unsafe-inline'` für
  Scripts. `default-src 'none'`, `object-src 'none'`, `img-src 'self' data:
  blob:`, `connect-src 'self'`, `font-src 'self' data:`.
- **Single Source of Truth** für alle übrigen Security-Header in
  [next.config.ts](./next.config.ts) — Apache vHost setzt keine eigenen,
  sondern entfernt nur die von `security.conf` global gesetzten
  (verhindert Doppelungen). `X-XSS-Protection` (veraltet) wird aktiv
  entfernt — CSP übernimmt die Schutzfunktion.
- **HSTS preload** (`max-age=63072000; includeSubDomains; preload`),
  Referrer-Policy `strict-origin-when-cross-origin`, Permissions-Policy,
  COOP / CORP / COEP `credentialless`.
- **NEXT_LOCALE Cookie**: `Secure`, `HttpOnly`, `SameSite=Lax`, `Path=/`.
- **Lokale Fonts** via `@fontsource-variable/*` (kein Google Fonts).
- **Keine Analytics, kein Tracking, keine Cookies** im rechtlichen Sinn.

**Trade-off:** Alle App-Routes werden dynamisch gerendert (kein SSG) —
notwendig, damit jeder Request einen frischen Nonce erhält. Statisch
bleiben nur `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`.

Details: Abschnitt „Datenschutz-Audit" in [CLAUDE.md](./CLAUDE.md).

---

## 📚 Weiterführende Doku

- [CLAUDE.md](./CLAUDE.md) — vollständige Architektur, Status & Roadmap
- [AUTHORING.md](./AUTHORING.md) — Markdown-Anleitung für Content-Pflege
- [deploy/](./deploy/) — Apache2 vHost & systemd-Service
- [SECURITY.md](./SECURITY.md) — Verantwortlicher Umgang mit Sicherheits­meldungen

---

## 📄 Lizenz

- **Code:** MIT
- **Inhalte unter `content/`**: CC-BY 4.0

Verantwortlich nach § 5 DDG: Moritz Kohm. Volle Details in
[Impressum](content/pages/de/impressum.md) und
[Datenschutz](content/pages/de/datenschutz.md).
