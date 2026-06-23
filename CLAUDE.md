# CLAUDE.md — Musiker15 Website

> **Projekt-Kontext für Claude.** Persönliche Website von Moritz Kohm
> (Musiker15) mit Tutorials, Guides und Hintergrund-Infos. Ersetzt die
> bisherige Docusaurus-basierte Variante.

> **Maintenance rule:** This file must be kept in sync with the actual codebase.
> Whenever architecture, file layout, env-variable names, command patterns, or
> runtime behavior change, update this file in the same commit.

## 🌐 Sprache & Commit-Konventionen (WICHTIG)

- **GitHub-Inhalte auf Englisch** (Code-Kommentare, Commit-Messages, PR-Titel/-Body, README, Issues, Workflows). Damit jeder alles versteht.
- **Interne Doku auf Deutsch erlaubt:** `CLAUDE.md` (alle gitignored).
- **Commits AUSSCHLIESSLICH OHNE `Co-Authored-By`-Trailer.** Niemals einen Co-Author-Trailer anhängen.

---

## 1. Projekt-Übersicht

**Projektname:** Musiker15 Website
**Domain (Production):** `www.musiker15.de`
**Lokaler Pfad:** `C:\Users\morit\OneDrive\GitHub Repositories\Docusaurus\musiker15-website`
**Server-Pfad:** `/opt/musiker15/`
**Run-User:** `musiker15:musiker15` (eigener systemd-User, kein PM2)
**Service:** `musiker15.service` (systemd)
**Port (Production):** `3101` (loopback hinter Apache2)
**Port (Dev):** `3000`
**GitHub-Repo:** [Musiker15/Website](https://github.com/Musiker15/Website)

**Rechtliche Rollen:**
- **Anbieter nach § 5 DDG / Verantwortlicher nach DSGVO:** Moritz Kohm
  (c/o Impressumservice Dein-Impressum, Stettiner Str. 41, 35410 Hungen)
- **Inhaltlich Verantwortlicher nach § 18 Abs. 2 MStV:** Moritz Kohm

**Charakter der Site:** Persönliche Webseite mit Tutorials, eigenem Profil,
Hardware-Liste und Hintergrund-Infos. Verlinkt eng auf [MSK Scripts](https://www.msk-scripts.de)
(Geschäftsbereich Softwareentwicklung).

**Vorgänger:** Docusaurus-basierte Site unter `Docusaurus/musiker15-website.archive`
mit demselben Tutorial-Inhalt. Migration auf Next.js + MDX wegen
Konsistenz mit der KOMA-Script-Schwesterseite und Vereinheitlichung des
Security-Setups (Nonce-CSP, Mozilla Observatory A+).

---

## 2. Tech-Stack

| Bereich | Technologie | Version | Begründung |
|---|---|---|---|
| **Framework** | Next.js | 16.x | App Router, Server Components |
| **Bundler** | Turbopack | (Next 16 default) | Hot-Reload |
| **Sprache** | TypeScript | ^5.6 | Typsicherheit |
| **Styling** | Tailwind CSS | ^4.0 | CSS-First-Config |
| **UI-Primitives** | Radix UI | latest | Accessibility |
| **Icons** | Lucide React | latest | konsistente Icon-Library |
| **Markdown** | `next-mdx-remote` + `gray-matter` | latest | MDX mit Frontmatter |
| **Markdown-Plugins** | `remark-gfm`, `rehype-slug`, `rehype-autolink-headings`, `rehype-pretty-code` | latest | GFM, Heading-Links, Shiki |
| **Schema-Validierung** | Zod | ^3 | Config & Frontmatter |
| **Suche** | FlexSearch | latest | clientseitige Volltextsuche |
| **i18n** | `next-intl` | latest | App-Router-Unterstützung |
| **Fonts** | `@fontsource-variable/inter` + `@fontsource-variable/jetbrains-mono` | latest | lokal, kein Google |
| **Server** | Node.js | 22 LTS | Next 16 baseline |
| **Process Manager** | systemd (`musiker15.service`) | — | kein PM2 |
| **Webserver** | Apache2 (Reverse Proxy → :3101) | 2.4+ | konsistent mit bestehender Infra |
| **CI/CD** | GitHub Actions → SSH Deploy | — | analog komascript |

---

## 3. Projektstruktur

```
musiker15-website/
├── .github/workflows/
│   ├── deploy.yml          ← SSH-Deploy auf Debian
│   └── ci.yml              ← Lint + Type-Check + Tests + Build
├── public/
│   ├── favicon.ico, logo.png
│   ├── robots.txt
│   └── search-index.json   ← Build-Output (gitignored)
├── assets/                  ← Repo-Backups, nicht deployed
│   └── og-default.svg       ← statisches OG-Backup mit eingebettetem M-Logo
├── content/
│   ├── pages/{de,en}/
│   │   ├── about.md, faq.md, community.md
│   │   ├── impressum.md, datenschutz.md  (DE)
│   │   └── imprint.md, privacy.md        (EN)
│   ├── docs/{de,en}/
│   │   ├── index.md                       ← Tutorials-Startseite
│   │   ├── pc-hardware.md
│   │   └── debian-tutorials/
│   │       ├── index.md
│   │       ├── apache2-php-mariadb-phpmyadmin.md
│   │       ├── certbot.md
│   │       ├── debian-10-zu-11.md
│   │       ├── mariadb-upgrade.md
│   │       ├── sinusbot.md
│   │       └── teamspeak3.md
│   └── news/{de,en}/        ← Releases / Updates (anfangs leer)
├── config/
│   ├── site.config.ts       ← Site-Metadaten (Name, URL, Author, Repos, Discord)
│   ├── navigation.config.ts ← Navbar (Start, Tutorials, News, FAQ, Community)
│   └── footer.config.ts     ← Footer-Spalten + Social-Links
├── deploy/
│   ├── apache2/musiker15.de.conf
│   └── systemd/musiker15.service
├── src/
│   ├── app/[locale]/
│   │   ├── layout.tsx, page.tsx, not-found.tsx, error.tsx, loading.tsx
│   │   ├── docs/{page.tsx,[...slug]/page.tsx}
│   │   ├── news/{page.tsx,[slug]/page.tsx}
│   │   ├── search/{page.tsx,search-client.tsx}
│   │   └── [slug]/page.tsx  ← Catch-All für /about, /faq, /community, /impressum, /datenschutz
│   ├── app/sitemap.ts, robots.ts, manifest.ts, not-found.tsx
│   ├── app/opengraph-image.tsx ← 1200×630 PNG via next/og (Satori)
│   ├── components/
│   │   ├── layout/{Header,Navbar,MobileMenu,Footer,LocaleSwitcher,Breadcrumbs}.tsx
│   │   ├── content/{Callout,CodeBlock,DocSidebar,MDXComponents,TableOfContents}.tsx
│   │   ├── home/{Hero,LatestNews,CTASection}.tsx
│   │   ├── search/{SearchDialog,SearchTrigger}.tsx
│   │   ├── theme/{ThemeProvider,ThemeToggle}.tsx
│   │   └── ui/{Button,Card,Badge}.tsx
│   ├── lib/{content,frontmatter,mdx,seo,utils}.ts
│   ├── messages/{de,en}.json
│   ├── styles/globals.css
│   ├── types/{config,content}.ts
│   └── proxy.ts             ← next-intl + Nonce-CSP + Cookie-Hardening
├── scripts/
│   ├── build-search-index.ts
│   └── validate-content.ts
├── .env.example, .nvmrc, .gitignore, .gitattributes
├── eslint.config.mjs, postcss.config.mjs, tsconfig.json
├── next.config.ts, package.json, pnpm-workspace.yaml
├── README.md, AUTHORING.md, SECURITY.md, CLAUDE.md
```

---

## 4. Routing & Seiten

Alle Routen unter `/[locale]/…` mit `locale ∈ { "de", "en" }`. Default `de`.

| URL | Quelle |
|---|---|
| `/` → `/de` | `app/[locale]/page.tsx` |
| `/de/docs` | Übersicht aus `content/docs/de/**/*.md` |
| `/de/docs/pc-hardware` | `content/docs/de/pc-hardware.md` |
| `/de/docs/debian-tutorials` | `content/docs/de/debian-tutorials/index.md` |
| `/de/docs/debian-tutorials/certbot` | `content/docs/de/debian-tutorials/certbot.md` |
| `/de/news` | News-Liste (`frontmatter.date` absteigend) |
| `/de/about` | `content/pages/de/about.md` |
| `/de/community` | `content/pages/de/community.md` (Discord, GitHub, MSK Scripts) |
| `/de/faq` | `content/pages/de/faq.md` |
| `/de/impressum`, `/de/datenschutz` | analoge `.md`-Files |
| `/en/imprint`, `/en/privacy` | EN-Pendant |
| `/de/search` | `app/[locale]/search/page.tsx` |
| `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest` | auto-generiert |

### Entfernt (ggü. KOMA-Vorlage)

`/download`, `/features`, `/examples`, `/friends`, `/license` — gibt es hier
nicht, weil persönliche Seite ohne Distribution / Pakete.

---

## 5. Konfigurationssystem

Alle Configs sind TypeScript + Zod-validiert. Klare Struktur, Nicht-Entwickler-
freundlich.

### `config/site.config.ts`

```ts
{
  name: "Musiker15",
  tagline: { de: "Tutorials & Guides", en: "Tutorials & Guides" },
  description: { de: "…", en: "…" },
  url: "https://www.musiker15.de",
  ogImage: "/og-default.svg",
  locales: ["de", "en"],
  defaultLocale: "de",
  author: { name: "Moritz Kohm", email: "info@musiker15.de" },
  repositories: {
    github: "https://github.com/musiker15",
    mskScripts: "https://github.com/MSK-Scripts",
  },
  discord: "https://discord.gg/5hHSBRHvJE",
}
```

### `config/navigation.config.ts`

Primary: `Start · Tutorials · News · FAQ · Community`
Actions: `Search · Locale · Theme · GitHub`

### `config/footer.config.ts`

Spalten: `Tutorials · Socials · Rechtliches`
Social: Discord, GitHub (Musiker15), GitHub (MSK Scripts)
Copyright: `© {year} Moritz Kohm`

---

## 6. Content-Migration aus Docusaurus

Quelle: `C:\Users\morit\OneDrive\GitHub Repositories\Docusaurus\musiker15-website.archive`

| Quelle (Docusaurus) | Ziel (Next.js MDX) |
|---|---|
| `docs/intro.md` | `content/docs/de/index.md` (Tutorials-Startseite) |
| `docs/pc-hardware.md` | `content/docs/de/pc-hardware.md` |
| `docs/debian-tutorials/mariadb-upgrade-auf-debian-ubuntu-systemen.md` | `content/docs/de/debian-tutorials/mariadb-upgrade.md` |
| `docs/debian-tutorials/update-von-debian-10-auf-debian-11.md` | `content/docs/de/debian-tutorials/debian-10-zu-11.md` |
| `docs/debian-tutorials/apache2-php-8-mariadb-und-phpmyadmin.md` | `content/docs/de/debian-tutorials/apache2-php-mariadb-phpmyadmin.md` |
| `docs/debian-tutorials/certbot-lets-encrypt.md` | `content/docs/de/debian-tutorials/certbot.md` |
| `docs/debian-tutorials/teamspeak-3-server.md` | `content/docs/de/debian-tutorials/teamspeak3.md` |
| `docs/debian-tutorials/sinusbot.md` | `content/docs/de/debian-tutorials/sinusbot.md` |
| `src/pages/impressum.tsx` | `content/pages/de/impressum.md` + `en/imprint.md` |
| `src/pages/datenschutz.tsx` | `content/pages/de/datenschutz.md` + `en/privacy.md` |
| `static/img/logo.png` | `public/logo.png` |

Konvertierungen:
- Docusaurus-Frontmatter (`sidebar_position`, `slug`) → KOMA-Frontmatter (`order`, automatischer Slug aus Pfad)
- Admonitions (`:::tip`, `:::warning`) → `<Callout type="tip">`
- Path-aware Image-References (`/img/...`) → `/images/...`

---

## 7. Layout, Metadata & Viewport

Standardanforderungen wie bei komascript:

- Vollständige Metadata pro Locale (title-template, description, canonical, alternates, OG, Twitter)
- `metadataBase: new URL(siteConfig.url)`
- JSON-LD: `Organization` + `WebSite` mit SearchAction
- Referrer-Policy `strict-origin-when-cross-origin` (Meta + HTTP-Header synchron)
- Viewport mit theme-color light/dark

---

## 8. Sicherheit (Single Source of Truth: next.config.ts + proxy.ts)

### Header in [next.config.ts](next.config.ts)

- HSTS: `max-age=63072000; includeSubDomains; preload`
- X-Frame-Options: `DENY`
- X-Content-Type-Options: `nosniff`
- Referrer-Policy: `strict-origin-when-cross-origin`
- Permissions-Policy: voll deaktiviert (Kamera, Geo, Mikrofon, …)
- COOP: `same-origin`
- CORP: `same-origin`
- COEP: `credentialless`
- X-Permitted-Cross-Domain-Policies: `none`
- X-DNS-Prefetch-Control: `off`

### CSP (Nonce-basiert, in [src/proxy.ts](src/proxy.ts))

```
default-src 'none';
script-src  'self' 'nonce-<random>' 'strict-dynamic';
style-src   'self' 'nonce-<random>';
style-src-elem 'self' 'nonce-<random>';
style-src-attr 'unsafe-inline';
img-src     'self' data: blob:;
font-src    'self' data:;
connect-src 'self';
media-src   'self';
manifest-src 'self';
worker-src  'self' blob:;
object-src  'none';
frame-src   'none';
frame-ancestors 'self';
base-uri    'self';
form-action 'self';
upgrade-insecure-requests
```

### Apache vHost ([deploy/apache2/musiker15.de.conf](deploy/apache2/musiker15.de.conf))

- **Setzt keine eigenen Security-Header.** Entfernt mit `Header always unset`
  alle, die von `/etc/apache2/conf-enabled/security.conf` global gesetzt werden
- `X-XSS-Protection` aktiv aus beiden mod_headers-Tabellen entfernt (veraltet,
  durch CSP abgelöst)
- Reverse Proxy zu `http://127.0.0.1:3101`
- Wildcard-Zertifikat `*.musiker15.de` (kein Let's Encrypt)
- HTTP/2 + OCSP-Stapling
- Static-Asset-Cache für `/_next/static/*` direkt aus Filesystem
  (`/opt/musiker15/.next/static/`)

### Cookies

- `NEXT_LOCALE`: `Secure`, `HttpOnly`, `SameSite=Lax`, `Path=/`, `MaxAge=1y`
- Sonst keine Cookies

---

## 9. Performance & Caching

| Metrik | Ziel |
|---|---|
| LCP | ≤ 1.5 s |
| INP | ≤ 200 ms |
| CLS | ≤ 0.05 |
| Lighthouse Performance | ≥ 95 |

- **Dynamic Rendering** für alle App-Routes (Trade-off für Nonce-CSP)
- **Static-Asset-Cache** über Apache: `Cache-Control: public, max-age=31536000, immutable` für `/_next/static/*`
- **Fonts** lokal via `@fontsource-variable/*`, `display: swap`
- **Code-Splitting** automatisch pro Route
- **Prefetching** über `next/link prefetch="hover"`

---

## 10. Deployment

### GitHub-Actions Workflow ([.github/workflows/deploy.yml](.github/workflows/deploy.yml))

1. Lint + Type-Check + Validate-Content + Build + Build-Search-Index
2. tar-Bundle erstellen
3. SCP nach `/opt/musiker15/releases/<commit-sha>/`
4. Atomischer Symlink-Swap: `/opt/musiker15/current → releases/<sha>`
5. `sudo systemctl restart musiker15.service`
6. Cleanup: alte Releases > 5 entfernen

### systemd-Service ([deploy/systemd/musiker15.service](deploy/systemd/musiker15.service))

```
[Service]
Type=simple
User=musiker15
Group=musiker15
WorkingDirectory=/opt/musiker15
ExecStart=/usr/bin/env node_modules/.bin/next start -p 3101 -H 127.0.0.1
EnvironmentFile=-/opt/musiker15/.env.production
Environment=NODE_ENV=production
Environment=PORT=3101
Environment=HOSTNAME=127.0.0.1
Environment=NEXT_TELEMETRY_DISABLED=1
Restart=always
RestartSec=5s
KillSignal=SIGTERM
TimeoutStopSec=30s
LimitNOFILE=65535

# Security-Hardening
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=read-only
ReadWritePaths=/opt/musiker15
ProtectKernelTunables=true
ProtectKernelModules=true
ProtectKernelLogs=true
ProtectControlGroups=true
RestrictNamespaces=true
RestrictRealtime=true
RestrictSUIDSGID=true
LockPersonality=true
SystemCallArchitectures=native
SystemCallFilter=@system-service
SystemCallFilter=~@privileged @resources @mount
```

---

## 11. Datenschutz-Audit

**Ziel:** keine Kommunikation vom Client-Browser zu externen Hosts.

| Quelle | Status |
|---|---|
| Google Fonts | ✅ nicht genutzt (`@fontsource-variable/*` lokal) |
| Analytics / Tracking | ✅ nicht vorhanden |
| Social-Media-Embeds | ✅ nicht vorhanden |
| CDN-Skripte | ✅ nicht vorhanden |
| Externe Bild-URLs | ✅ `img-src 'self' data: blob:` blockiert |
| Cookies | ✅ nur `NEXT_LOCALE` (HttpOnly+Secure) |
| Tracking-Pixel | ✅ nicht vorhanden |

Externe Links (GitHub, Discord, MSK Scripts) sind **user-initiated** — erst
beim Anklicken wird ein externer Host kontaktiert. Erwartetes Web-Verhalten,
kein Tracking.

---

## 12. Verifikations-Checkliste

```bash
# Nach Build: prüfe, dass keine externen URLs im Output stehen
grep -rE "fonts\.googleapis|fonts\.gstatic|googletagmanager|google-analytics|use\.typekit|cdnjs|jsdelivr" \
  .next/ public/ || echo "✓ Keine externen URLs gefunden"

# Browser-Test
# DevTools → Network → kein Request außer zu www.musiker15.de

# CSP-Validator
# https://csp-evaluator.withgoogle.com/
```

---

## 📌 Wichtige Notizen für Claude

- **Sprache der Antworten:** immer Deutsch (siehe `~/CLAUDE.md`)
- **Commit-Messages auf Englisch.** Auch wenn die Konversation deutsch ist.
- **Dateipfade-Listing:** Nach jeder Änderung **alle geänderten Dateien mit vollem Pfad** auflisten, soweit relevant (außer bei GitHub-Actions-Deploy).
- **Apache2, kein Nginx**
- **Tailwind v4 Syntax** beachten (CSS-First, kein `tailwind.config.ts` zwingend)
- **Next.js 16 + Turbopack** — async `params` / `searchParams` in dynamischen Routen
- **Server-Pfad:** `/opt/musiker15/`
- **Run-User:** `musiker15:musiker15` (system, no-login), gestartet als `musiker15.service` (systemd) — **kein PM2**.
- **Anbieter / DSGVO-Verantwortlicher:** Moritz Kohm
- **Security-Header Single Source of Truth:** Alle Security-Header in [next.config.ts](next.config.ts), CSP separat mit Nonce in [src/proxy.ts](src/proxy.ts). Apache vHost setzt **keine** eigenen.
- **App-Routes sind dynamisch** (`ƒ Dynamic` im Build-Output), nicht SSG — bewusster Trade-off für Nonce-CSP.
- **Inline-`<script>`-Tags** im Layout/in Komponenten brauchen das `nonce`-Prop aus `(await headers()).get("x-nonce")`, sonst blockiert CSP.
- **Apache vHost-Reihenfolge:** Beim Aktivieren des neuen vHosts darauf achten,
  dass kein alter vHost (z.B. vom Docusaurus-Setup) dieselbe `ServerName www.musiker15.de`
  beansprucht. Apache nimmt bei Konflikten den alphabetisch ersten vHost — der
  alte würde dann mit leerem `DocumentRoot /var/www/html/musiker15/` einen 403
  zurückgeben. Mit `sudo apache2ctl -S` prüfen, welche Datei für die Domain
  zuständig ist; ggf. alten vHost via `sudo a2dissite <name>.conf` deaktivieren.

---

## Status

✅ **Live unter [www.musiker15.de](https://www.musiker15.de)** seit 2026-05-27.
GitHub-Repo: [Musiker15/Website](https://github.com/Musiker15/Website).
Apache Reverse-Proxy + systemd-Service laufen, GitHub-Actions-Deploy ist
betriebsbereit.

---

*Erstellt: 2026-05-27 — Migration von Docusaurus auf Next.js 16 + MDX,
basierend auf der KOMA-Script-Homepage als Vorlage. Site nach Aktivierung
des neuen Apache-vHosts (und Deaktivierung des alten Docusaurus-vHosts) live.*
