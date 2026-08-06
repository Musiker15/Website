import { describe, it, expect } from "vitest";
import { alternatePath, buildMetadata } from "./seo";
import { siteConfig } from "@/config/site.config";

// =============================================================================
// alternatePath / hreflang-Alternates
// -----------------------------------------------------------------------------
// Hintergrund: Die Alternates wurden früher rein mechanisch abgeleitet
// (`path.replace(/^\/(de|en)/, "")`). Für die vier Legal-Seiten ist das falsch,
// weil ihre Slugs sprachabhängig sind: /de/impressum hat kein /en/impressum,
// sondern /en/imprint. Diese Tests halten beides fest — die Sonderfälle und
// dass alle übrigen Pfade unverändert durchlaufen.
// =============================================================================

describe("alternatePath", () => {
  it("übersetzt die sprachabhängigen Legal-Slugs in beide Richtungen", () => {
    expect(alternatePath("/de/impressum", "en")).toBe("/imprint");
    expect(alternatePath("/en/imprint", "de")).toBe("/impressum");
    expect(alternatePath("/de/datenschutz", "en")).toBe("/privacy");
    expect(alternatePath("/en/privacy", "de")).toBe("/datenschutz");
  });

  it("liefert für die eigene Sprache denselben Slug zurück", () => {
    expect(alternatePath("/de/impressum", "de")).toBe("/impressum");
    expect(alternatePath("/en/privacy", "en")).toBe("/privacy");
  });

  it("lässt sprachgleiche Slugs unangetastet", () => {
    expect(alternatePath("/de/about", "en")).toBe("/about");
    expect(alternatePath("/en/faq", "de")).toBe("/faq");
    expect(alternatePath("/de/community", "en")).toBe("/community");
  });

  it("lässt verschachtelte Pfade unangetastet", () => {
    expect(alternatePath("/de/docs/debian-tutorials/certbot", "en")).toBe(
      "/docs/debian-tutorials/certbot",
    );
    expect(alternatePath("/en/news/wildcard-ssl-tutorial-2026-08", "de")).toBe(
      "/news/wildcard-ssl-tutorial-2026-08",
    );
  });

  it("behandelt die Startseite als leeren Rest", () => {
    expect(alternatePath("/de", "en")).toBe("");
    expect(alternatePath("/en", "de")).toBe("");
  });

  it("greift nur auf ein vollständiges Locale-Segment", () => {
    // "denkmal" beginnt mit "de", ist aber kein Locale-Präfix. Ohne die
    // Lookahead-Grenze im Regex würde daraus "/nkmal".
    expect(alternatePath("/denkmal", "en")).toBe("/denkmal");
  });

  it("übersetzt keinen Slug, der nur zufällig so heißt wie ein Legal-Slug", () => {
    // Die Tabelle greift ausschließlich auf Top-Level-Slugs. Ein Tutorial
    // namens "impressum" unterhalb von /docs bliebe unverändert.
    expect(alternatePath("/de/docs/impressum", "en")).toBe("/docs/impressum");
  });
});

describe("buildMetadata alternates", () => {
  it("verdrahtet die Legal-Seiten mit den richtigen Gegenstücken", () => {
    const meta = buildMetadata({ title: "Impressum", locale: "de", path: "/de/impressum" });

    expect(meta.alternates?.canonical).toBe(`${siteConfig.url}/de/impressum`);
    expect(meta.alternates?.languages).toMatchObject({
      "de-DE": `${siteConfig.url}/de/impressum`,
      "en-US": `${siteConfig.url}/en/imprint`,
      "x-default": `${siteConfig.url}/de/impressum`,
    });
  });

  it("zeigt aus der englischen Fassung auf dasselbe Paar", () => {
    const meta = buildMetadata({ title: "Imprint", locale: "en", path: "/en/imprint" });

    expect(meta.alternates?.languages).toMatchObject({
      "de-DE": `${siteConfig.url}/de/impressum`,
      "en-US": `${siteConfig.url}/en/imprint`,
    });
  });

  it("lässt gewöhnliche Seiten symmetrisch", () => {
    const meta = buildMetadata({
      title: "Certbot",
      locale: "de",
      path: "/de/docs/debian-tutorials/certbot",
    });

    expect(meta.alternates?.languages).toMatchObject({
      "de-DE": `${siteConfig.url}/de/docs/debian-tutorials/certbot`,
      "en-US": `${siteConfig.url}/en/docs/debian-tutorials/certbot`,
    });
  });
});
