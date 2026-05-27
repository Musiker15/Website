# public/

Dateien in diesem Ordner werden **unverändert** unter `/` ausgeliefert.

## Aktuell vorhandene Assets

| Datei | Beschreibung |
|---|---|
| `favicon.ico` | Klassisches Browser-Favicon (aus Docusaurus übernommen) |
| `logo.png` | Musiker15-M-Logo (auch als `apple-touch-icon` referenziert) |
| `robots.txt` | Fallback (wird durch `src/app/robots.ts` überschrieben) |
| `search-index.json` | wird zur Build-Zeit über `pnpm run build:search` generiert (gitignored) |

## OpenGraph-Image

Das OG-Bild (`/opengraph-image`) wird **dynamisch** über
`src/app/opengraph-image.tsx` mit `next/og` (Satori) generiert. Output:
1200×630 PNG mit M-Logo, Titel und Tagline.

Das ältere `og-default.svg` (statisches Backup mit eingebettetem M-Logo) liegt
**nicht mehr** in diesem Verzeichnis, sondern unter [`/assets/og-default.svg`](../assets/og-default.svg).
So wird es weder unter `/` ausgeliefert noch zum Server deployed. Es bleibt
nur als manuelles Repo-Backup erhalten, weil SVG für OG-Embeds (Discord,
Facebook, WhatsApp, Twitter) unzuverlässig ist und Social-Media-Crawler
PNG/JPG erwarten.

## Optional ergänzbar

| Datei | Größe | Zweck |
|---|---|---|
| `apple-touch-icon.png` | 180×180 | iOS-Startbildschirm (aktuell auf `logo.png` gemappt) |
| `android-chrome-192x192.png` | 192×192 | PWA-Icon klein |
| `android-chrome-512x512.png` | 512×512 | PWA-Icon groß |
