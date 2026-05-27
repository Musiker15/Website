import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Dynamisches OpenGraph-Image — 1200×600 PNG.
 *
 * Wird von Next.js automatisch unter `/opengraph-image` ausgeliefert und in
 * die HTML-Metadata jeder Seite eingebunden, sofern nicht eine speziellere
 * `opengraph-image.tsx` in einer Sub-Route diese überschreibt.
 *
 * Hintergrund: SVG ist als OG-Image-Format unzuverlässig — Crawler wie
 * Discord, Facebook, WhatsApp und Twitter verlangen PNG/JPG. Diese Route
 * generiert das PNG zur Build-Zeit via `next/og` (Satori).
 *
 * Schriftart: **Geist**. Wird von `next/og` mit ausgeliefert
 * (`node_modules/next/dist/compiled/@vercel/og/Geist-Regular.ttf`). Wir
 * registrieren sie explizit für Regular UND Bold (Satori synthesiert Bold
 * aus Regular) — sonst greift Satori auf eine generische System-Font zurück,
 * die "AI-generiert" wirkt.
 *
 * Format: 1200×480 (2.5:1 — bewusst kompakter als der 1200×630-OG-Standard,
 * damit der Embed nicht leer-räumig wirkt. Twitter, Facebook und Discord
 * crop OG-Images sowieso flexibel; ein bisschen kleiner als der Standard
 * ist unproblematisch.)
 */

export const size = { width: 1200, height: 480 };
export const contentType = "image/png";
export const alt = "Musiker15 — Tutorials & Guides";

export default async function Image() {
  // Logo + Geist-Font lokal als Buffer laden
  const logoBuffer = await readFile(
    path.join(process.cwd(), "public/logo.png"),
  );
  const logoDataUrl = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  const geistRegular = await readFile(
    path.join(
      process.cwd(),
      "node_modules/next/dist/compiled/@vercel/og/Geist-Regular.ttf",
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
          justifyContent: "flex-start",
          padding: "0 90px",
          background:
            "linear-gradient(135deg, #0a1638 0%, #1a3a8a 100%)",
          color: "#ffffff",
          fontFamily: "Geist",
        }}
      >
        {/* Subtiler Glow hinter dem Logo */}
        <div
          style={{
            position: "absolute",
            top: 100,
            left: 60,
            width: 280,
            height: 280,
            background:
              "radial-gradient(circle, rgba(59,130,246,0.32) 0%, rgba(59,130,246,0) 70%)",
            display: "flex",
          }}
        />

        {/* Logo-Spalte */}
        <div
          style={{
            display: "flex",
            width: 220,
            height: 220,
            marginRight: 56,
            flexShrink: 0,
            zIndex: 1,
          }}
        >
          <img
            src={logoDataUrl}
            alt=""
            width={220}
            height={220}
            style={{ objectFit: "contain" }}
          />
        </div>

        {/* Text-Spalte */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: 96,
              fontWeight: 700,
              letterSpacing: "-3px",
              lineHeight: 1,
            }}
          >
            Musiker15
          </div>
          <div
            style={{
              fontSize: 36,
              marginTop: 14,
              color: "#cbd5e1",
              letterSpacing: "-0.5px",
            }}
          >
            Tutorials &amp; Guides
          </div>
          <div
            style={{
              fontSize: 22,
              marginTop: 36,
              color: "#94a3b8",
              display: "flex",
            }}
          >
            www.musiker15.de
          </div>
          <div
            style={{
              fontSize: 18,
              marginTop: 6,
              color: "#64748b",
              display: "flex",
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
          data: geistRegular,
          weight: 700,
          style: "normal",
        },
      ],
    },
  );
}
