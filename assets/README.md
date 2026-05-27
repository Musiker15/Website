# assets/

Verzeichnis für **Repo-interne Backup-Assets**, die **nicht** unter `/`
ausgeliefert werden und auch nicht zum Server deployed werden (das
`deploy.yml`-Tarball packt explizit nur `.next`, `public`, `content`,
`config`, `node_modules`, `package.json`, `pnpm-lock.yaml`, `next.config.ts`
und `tsconfig.json`).

## Inhalt

| Datei | Beschreibung |
|---|---|
| `og-default.svg` | Statisches Backup-OG-Bild mit eingebettetem M-Logo (base64). 1200×630 SVG. Wird **nicht** als OG-Image referenziert — das aktuelle OG-Bild kommt aus [src/app/opengraph-image.tsx](../src/app/opengraph-image.tsx) (dynamisches PNG via `next/og`). Diese SVG dient nur als manueller Export, z. B. für Print oder externe Tools. |
