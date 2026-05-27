import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Dynamisches OpenGraph-Image — 900×360 PNG.
 *
 * Wird von Next.js automatisch unter `/opengraph-image` ausgeliefert und in
 * die HTML-Metadata jeder Seite eingebunden, sofern nicht eine speziellere
 * `opengraph-image.tsx` in einer Sub-Route diese überschreibt.
 *
 * Hintergrund: SVG ist als OG-Image-Format unzuverlässig — Crawler wie
 * Discord, Facebook, WhatsApp und Twitter verlangen PNG/JPG. Diese Route
 * generiert das PNG zur Build-Zeit via `next/og` (Satori).
 *
 * Schriftart: **Geist** (Regular + Bold als echte TTF aus dem `geist`-Paket
 * von Vercel). Wichtig: WEDER Geist-Regular ALLEINE registrieren NOCH Bold
 * "synthesizen" lassen — sonst rendert Satori den 700er-Weight als künstlich
 * verfetteten Regular, was breit/verzerrt wirkt.
 *
 * Format: 900×360 (≈ 2.5:1) — kompakt, der Block (Logo + Text) ist horizontal
 * zentriert (`justifyContent: center`), sodass der Freiraum links und rechts
 * vom Inhalt symmetrisch ist.
 */

export const size = { width: 900, height: 360 };
export const contentType = "image/png";
export const alt = "Musiker15 — Tutorials & Guides";

export default async function Image() {
  // Logo lokal als data-URL einbetten
  const logoBuffer = await readFile(
    path.join(process.cwd(), "public/logo.png"),
  );
  const logoDataUrl = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  // Echtes Geist (Regular + Bold) — aus dem `geist`-Paket
  const geistRegular = await readFile(
    path.join(
      process.cwd(),
      "node_modules/geist/dist/fonts/geist-sans/Geist-Regular.ttf",
    ),
  );
  const geistBold = await readFile(
    path.join(
      process.cwd(),
      "node_modules/geist/dist/fonts/geist-sans/Geist-Bold.ttf",
    ),
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          // Block (Logo + Text) horizontal zentrieren → Freiraum links und
          // rechts symmetrisch.
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #0a1638 0%, #1a3a8a 100%)",
          color: "#ffffff",
          fontFamily: "Geist",
        }}
      >
        {/* Logo-Spalte (mit subtilem Glow direkt am Logo dahinter) */}
        <div
          style={{
            display: "flex",
            position: "relative",
            width: 280,
            height: 280,
            marginRight: 36,
            flexShrink: 0,
          }}
        >
          {/* Glow */}
          <div
            style={{
              position: "absolute",
              top: -40,
              left: -40,
              width: 360,
              height: 360,
              background:
                "radial-gradient(circle, rgba(59,130,246,0.32) 0%, rgba(59,130,246,0) 70%)",
              display: "flex",
            }}
          />
          {/* M-Logo */}
          <img
            src={logoDataUrl}
            alt=""
            width={280}
            height={280}
            style={{ objectFit: "contain", position: "relative" }}
          />
        </div>

        {/* Text-Spalte — alle Children am linken Rand (alignItems: flex-start) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 104,
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            Musiker15
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 38,
              marginTop: 12,
              color: "#cbd5e1",
              fontWeight: 400,
            }}
          >
            Tutorials &amp; Guides
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 24,
              marginTop: 32,
              color: "#94a3b8",
              fontWeight: 400,
            }}
          >
            www.musiker15.de
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 19,
              marginTop: 4,
              color: "#64748b",
              fontWeight: 400,
            }}
          >
            Linux · Debian · Self-Hosting
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Geist",
          data: geistRegular,
          weight: 400,
          style: "normal",
        },
        {
          name: "Geist",
          data: geistBold,
          weight: 700,
          style: "normal",
        },
      ],
    },
  );
}
