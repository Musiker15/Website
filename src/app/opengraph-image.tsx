import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Dynamisches OpenGraph-Image — 1200×630 PNG.
 *
 * Wird von Next.js automatisch unter `/opengraph-image` ausgeliefert und in
 * die HTML-Metadata jeder Seite eingebunden, sofern nicht eine speziellere
 * `opengraph-image.tsx` in einer Sub-Route diese überschreibt.
 *
 * Hintergrund: SVG ist als OG-Image-Format unzuverlässig — Crawler wie
 * Discord, Facebook, WhatsApp und Twitter verlangen PNG/JPG. Diese Route
 * generiert das PNG zur Build-Zeit via `next/og` (Satori).
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Musiker15 — Tutorials & Guides";

export default async function Image() {
  // Logo lokal lesen und als data-URL einbetten, damit Satori es ohne
  // Netzwerk-Roundtrip rendert.
  const logoBuffer = await readFile(path.join(process.cwd(), "public/logo.png"));
  const logoDataUrl = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          padding: "0 80px",
          background:
            "linear-gradient(180deg, #0a1638 0%, #1a3a8a 100%)",
          color: "#ffffff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Subtiler Glow hinter dem Logo (radial-gradient via SVG-Background) */}
        <div
          style={{
            position: "absolute",
            top: 130,
            left: 50,
            width: 380,
            height: 380,
            background:
              "radial-gradient(circle, rgba(59,130,246,0.35) 0%, rgba(59,130,246,0) 70%)",
            display: "flex",
          }}
        />

        {/* Logo-Spalte */}
        <div
          style={{
            display: "flex",
            width: 300,
            height: 300,
            marginRight: 70,
            flexShrink: 0,
            zIndex: 1,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoDataUrl}
            alt=""
            width={300}
            height={300}
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
              fontSize: 104,
              fontWeight: 700,
              letterSpacing: "-2px",
              lineHeight: 1,
            }}
          >
            Musiker15
          </div>
          <div
            style={{
              fontSize: 38,
              marginTop: 18,
              color: "#cbd5e1",
            }}
          >
            Tutorials &amp; Guides
          </div>
          <div
            style={{
              fontSize: 22,
              marginTop: 60,
              color: "#94a3b8",
              fontFamily: "monospace",
              display: "flex",
            }}
          >
            www.musiker15.de
          </div>
          <div
            style={{
              fontSize: 18,
              marginTop: 8,
              color: "#64748b",
              fontFamily: "monospace",
              display: "flex",
            }}
          >
            Linux · Debian · Self-Hosting
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
