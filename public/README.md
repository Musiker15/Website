# public/

Dateien in diesem Ordner werden **unverändert** unter `/` ausgeliefert.

## Pflicht-Dateien

| Datei | Status | Hinweis |
|---|---|---|
| `favicon.svg` | ✓ vorhanden | KOMA-K Logo |
| `favicon.ico` | ⚠ fehlt | klassisches 32×32 Favicon — von `favicon.svg` ableiten |
| `apple-touch-icon.png` | ⚠ fehlt | 180×180 PNG für iOS-Startbildschirm |
| `android-chrome-192x192.png` | ⚠ fehlt | PWA-Icon klein |
| `android-chrome-512x512.png` | ⚠ fehlt | PWA-Icon groß |
| `og-default.png` | ⚠ fehlt (`og-default.svg` vorhanden) | 1200×630 PNG für OpenGraph |
| `robots.txt` | ✓ vorhanden | Fallback (überschrieben von `app/robots.ts`) |
| `search-index.json` | wird generiert | via `pnpm run build:search` |

## Bild-Generation (Vorschlag)

```bash
# SVG → PNG (benötigt ImageMagick oder Inkscape)
inkscape favicon.svg -o apple-touch-icon.png -w 180 -h 180
inkscape favicon.svg -o android-chrome-192x192.png -w 192 -h 192
inkscape favicon.svg -o android-chrome-512x512.png -w 512 -h 512
inkscape og-default.svg -o og-default.png -w 1200 -h 630
magick favicon.svg -resize 32x32 favicon.ico
```

Oder Online-Tool: <https://realfavicongenerator.net/>
