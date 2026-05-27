# public/

Dateien in diesem Ordner werden **unverändert** unter `/` ausgeliefert.

## Aktuell vorhandene Assets

| Datei | Beschreibung |
|---|---|
| `favicon.ico` | Klassisches Browser-Favicon (aus Docusaurus übernommen) |
| `logo.png` | Musiker15-M-Logo (auch als `apple-touch-icon` referenziert) |
| `og-default.svg` | **Backup** — statisches OG-Bild mit eingebettetem Logo (base64). Wird nicht im Layout referenziert (siehe Hinweis unten). |
| `robots.txt` | Fallback (wird durch `src/app/robots.ts` überschrieben) |
| `search-index.json` | wird zur Build-Zeit über `pnpm run build:search` generiert (gitignored) |

## OpenGraph-Image

Das OG-Bild (`/opengraph-image`) wird **dynamisch** über
`src/app/opengraph-image.tsx` mit `next/og` (Satori) generiert. Output:
1200×630 PNG mit M-Logo, Titel und Tagline.

Das ältere `og-default.svg` bleibt als **Backup** im Verzeichnis erhalten
(z. B. für manuelle Nutzung oder Print). Es wird aber **nicht** vom Layout
referenziert, weil SVG für OG-Embeds (Discord, Facebook, WhatsApp, Twitter)
unzuverlässig ist und Social-Media-Crawler oft PNG/JPG erwarten.

## Optional ergänzbar

| Datei | Größe | Zweck |
|---|---|---|
| `apple-touch-icon.png` | 180×180 | iOS-Startbildschirm (aktuell auf `logo.png` gemappt) |
| `android-chrome-192x192.png` | 192×192 | PWA-Icon klein |
| `android-chrome-512x512.png` | 512×512 | PWA-Icon groß |
