# Content Authoring Guide — Musiker15 Website

> **Für Moritz & Co-Autoren:** So pflegst Du Inhalte auf der Musiker15-Website,
> **ohne irgendwelchen Code anfassen zu müssen.**

---

## Inhalte = Markdown-Dateien

Alle Inhalte der Seite stehen in **Markdown-Dateien** unterhalb des Ordners `content/`.
Wenn Du eine neue Markdown-Datei anlegst, taucht sie automatisch als Seite auf.

### Wo welche Inhalte hingehören

| Ordner | Was kommt hier rein | URL-Beispiel |
|---|---|---|
| `content/pages/de/` | Statische Seiten (About, FAQ, Impressum, …) | `/de/about` |
| `content/docs/de/` | Tutorials & Guides (Sidebar auto) | `/de/docs/pc-hardware` |
| `content/news/de/` | News & Updates (sortiert nach Datum) | `/de/news/<slug>` |

Für die englische Variante: `de` → `en`.

### Sektion-Index-Seiten

Verschachtelte Ordner unter `content/docs/` können eine eigene Übersichtsseite
bekommen, indem dort eine `index.md` abgelegt wird:

```
content/docs/de/debian-tutorials/index.md  → /de/docs/debian-tutorials
```

Die `index.md` wird automatisch erkannt — sie ist nicht klickbar in der
Sidebar, sondern dient als Landing-Seite des jeweiligen Ordners.

---

## Ein neues Tutorial anlegen

### Schritt 1 — Datei erstellen

```
content/docs/de/debian-tutorials/mein-tutorial.md
content/docs/en/debian-tutorials/my-tutorial.md   ← englisch (optional)
```

Der **Dateiname** wird zur **URL**:
- `mein-tutorial.md` → `/de/docs/debian-tutorials/mein-tutorial`
- `pc-hardware.md` → `/de/docs/pc-hardware`

### Schritt 2 — Frontmatter ausfüllen

```markdown
---
title: "Mein Tutorial-Titel"
description: "Kurze Beschreibung für Google und Social Media (max. 320 Zeichen)."
order: 10
tags: ["debian", "apache"]
---

Hier kommt der Inhalt …
```

### Schritt 3 — Markdown schreiben

```markdown
## Eine Überschrift

Ein Absatz mit **fett** und *kursiv* und `Inline-Code`.

- Liste-Punkt 1
- Liste-Punkt 2

[Ein Link](https://example.com)

![Ein Bild](/images/screenshot.png)
```

### Schritt 4 — Lokale Vorschau

```bash
pnpm dev
```

→ Öffne `http://localhost:3000/de/docs/debian-tutorials/mein-tutorial`

### Schritt 5 — Veröffentlichen

```bash
git add content/docs/de/debian-tutorials/mein-tutorial.md
git commit -m "content(docs): add tutorial <title>"
git push
```

Das Deployment läuft automatisch via GitHub Actions.

> **Commit-Messages auf Englisch.** Auch wenn der Inhalt deutsch ist.

---

## Frontmatter-Felder

Vollständige Liste aller Felder, die im Frontmatter möglich sind:

| Feld | Pflicht | Typ | Beispiel |
|---|---|---|---|
| `title` | ✓ | string (max 160) | `"Apache2, PHP 8, MariaDB"` |
| `description` | – | string (max 320) | `"Wie installiere ich den LAMP-Stack?"` |
| `date` | – | YYYY-MM-DD | `2026-05-09` |
| `updated` | – | YYYY-MM-DD | `2026-05-14` |
| `author` | – | string | `"Moritz Kohm"` |
| `order` | – | Zahl ≥ 0 (default 999) | `10` |
| `category` | – | string | `"debian"`, … |
| `tags` | – | Array von Strings | `["debian", "apache"]` |
| `draft` | – | true/false (default false) | `true` |
| `toc` | – | true/false (default true) | `false` |
| `hideTitle` | – | true/false (default false) | `true` |
| `image` | – | Pfad | `/images/hero.png` |
| `imageAlt` | – | string | `"Screenshot"` |

### Spezialfelder erklärt

- **`order`** — kleinere Werte erscheinen weiter oben in Listen und Sidebars
- **`draft: true`** — Seite ist nur in `pnpm dev` sichtbar, nicht in Production
- **`toc: false`** — kein „Auf dieser Seite"-Widget rechts
- **`hideTitle: true`** — unterdrückt die automatische `<h1>` aus dem Frontmatter

---

## Erweiterte Markdown-Features (MDX)

Diese **Spezialkomponenten** kannst Du in jedem Markdown-Dokument nutzen:

### Hinweis-Boxen (`<Callout>`)

```mdx
<Callout type="info">
Dies ist ein Informations-Hinweis.
</Callout>

<Callout type="tip">
Dies ist ein nützlicher Tipp.
</Callout>

<Callout type="warning">
Achtung: hier ist etwas wichtig!
</Callout>

<Callout type="danger">
Gefahr! Vorsichtig sein.
</Callout>

<Callout type="note">
Eine neutrale Anmerkung — auch ideal für Zitate aus externen Quellen.
</Callout>
```

### Code-Blöcke mit Syntax-Highlighting

````markdown
```bash
sudo apt update && sudo apt upgrade -y
```

```apache
<VirtualHost *:443>
    ServerName www.musiker15.de
    DocumentRoot /var/www/html/musiker15
</VirtualHost>
```
````

Unterstützte Sprachen: `bash`, `apache`, `nginx`, `ini`, `sql`, `json`,
`typescript`, `javascript`, `yaml`, `php`, `python`, `lua`, …

### Tabellen

```markdown
| Spalte 1 | Spalte 2 | Spalte 3 |
|---|---|---|
| Wert | Wert | Wert |
```

### Heading-Anchors

Alle `##` und `###` Überschriften bekommen automatisch eine ID und einen Link.

### ⚠ Links: KEINE `<https://...>`-Autolinks verwenden

MDX 3 (das wir nutzen) interpretiert `<` als Beginn eines JSX-Tags. Das klassische
Markdown-Autolink-Syntax bricht den Build:

```markdown
❌ <https://example.com>          ← bricht den Build

✅ [example.com](https://example.com)   ← Markdown-Link
✅ https://example.com                   ← einfache URL (kein Anchor-Element)
```

### Aufgaben-Listen

```markdown
- [x] Erledigt
- [ ] Offen
```

---

## Bilder einbinden

1. Bild ablegen unter `public/images/<thema>/<name>.png`
2. In Markdown referenzieren:

```markdown
![Beschreibung](/images/tutorials/apache-setup.png)
```

Empfohlen: **WebP** oder **AVIF** für kleinere Dateigrößen.

<Callout type="warning">
**Keine externen Bild-URLs!** Die Seite ist datenschutz-strikt konfiguriert
(CSP `img-src 'self' data: blob:`). Bilder wie `![](https://example.com/foo.png)`
werden vom Browser **blockiert**. Lade externe Grafiken erst herunter und lege sie
unter `public/images/` ab. Damit garantieren wir, dass beim Besuch der Seite
**keine Daten an externe Server** (Google, CDNs, Tracker) fließen.
</Callout>

---

## Navbar und Footer pflegen

### Eintrag in der Navbar hinzufügen

Öffne `config/navigation.config.ts` und füge im `primary`-Array einen Eintrag hinzu:

```ts
{
  label: { de: "Meine Sektion", en: "My Section" },
  href: "/meine-sektion",
}
```

Mit Untermenü:

```ts
{
  label: { de: "Tutorials", en: "Tutorials" },
  href: "/docs",
  children: [
    {
      label: { de: "Debian-Tutorials", en: "Debian Tutorials" },
      href: "/docs/debian-tutorials",
      description: { de: "Server-Setup", en: "Server setup" },
    },
  ],
}
```

### Footer-Spalte ergänzen

`config/footer.config.ts` → `columns`-Array bearbeiten. Identische Syntax.

---

## Checks vor dem Commit

```bash
pnpm validate:content    # prüft Frontmatter aller .md-Files
pnpm lint                # ESLint
pnpm type-check          # TypeScript
pnpm build               # Production-Build (für Sicherheit)
pnpm build:search        # Such-Index neu bauen (bei größeren Inhaltsänderungen)
```

Wenn `validate:content` schief geht: Fehlermeldung lesen — sie zeigt **genau**,
welche Datei und welches Feld das Problem hat.

---

## Häufige Fragen

### Warum erscheint meine Seite nicht?

Mögliche Ursachen:

1. `draft: true` im Frontmatter → ändere zu `false`
2. Datei in der falschen Sprache → `de/` vs. `en/`
3. Tippfehler im Dateinamen
4. `pnpm validate:content` aufrufen — meldet Fehler

### Wie sortiere ich Tutorials in der Sidebar?

Über `order:` im Frontmatter. Niedrige Werte zuerst.

### Welche Sprache wird angezeigt, wenn die englische Datei fehlt?

Aktuell: 404 auf der englischen Route. Lege einfach `content/pages/en/<slug>.md`
bzw. `content/docs/en/<thema>/<slug>.md` an.

### Wo finde ich alle bestehenden Slugs?

```bash
ls content/pages/de/
ls content/docs/de/
ls content/docs/de/debian-tutorials/
ls content/news/de/
```

---

## Glossar

- **Frontmatter** — der YAML-Block am Anfang einer Markdown-Datei (zwischen `---`)
- **Slug** — der URL-Teil (Dateiname ohne `.md`)
- **MDX** — Markdown + JSX-Komponenten (z. B. `<Callout>`)
- **i18n** — Internationalisierung (DE/EN)
