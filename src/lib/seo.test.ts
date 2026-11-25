import { describe, it, expect } from "vitest";
import {
  alternatePath,
  buildMetadata,
  hreflangAlternates,
  pageTitle,
  renderedTitle,
  searchSnippetErrors,
  TITLE_MAX,
} from "./seo";
import { FrontmatterSchema } from "./frontmatter";
import de from "@/messages/de.json";
import en from "@/messages/en.json";
import { siteConfig } from "@/config/site.config";
import sitemap from "@/app/sitemap";

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
      de: `${siteConfig.url}/de/impressum`,
      en: `${siteConfig.url}/en/imprint`,
      "x-default": `${siteConfig.url}/de/impressum`,
    });
  });

  it("zeigt aus der englischen Fassung auf dasselbe Paar", () => {
    const meta = buildMetadata({ title: "Imprint", locale: "en", path: "/en/imprint" });

    expect(meta.alternates?.languages).toMatchObject({
      de: `${siteConfig.url}/de/impressum`,
      en: `${siteConfig.url}/en/imprint`,
    });
  });

  it("lässt gewöhnliche Seiten symmetrisch", () => {
    const meta = buildMetadata({
      title: "Certbot",
      locale: "de",
      path: "/de/docs/debian-tutorials/certbot",
    });

    expect(meta.alternates?.languages).toMatchObject({
      de: `${siteConfig.url}/de/docs/debian-tutorials/certbot`,
      en: `${siteConfig.url}/en/docs/debian-tutorials/certbot`,
    });
  });
});

// =============================================================================
// One set of hreflang codes
// -----------------------------------------------------------------------------
// Until 2026-10-22 the HTML said de-DE/en-US/x-default and the sitemap de/en
// without x-default. Both sources now go through hreflangAlternates(); these
// tests keep a third spelling from creeping back in.
// =============================================================================

describe("hreflang codes", () => {
  it("uses the plain language codes plus x-default", () => {
    expect(Object.keys(hreflangAlternates("/de/about"))).toEqual(["de", "en", "x-default"]);
  });

  it("points x-default at the German version", () => {
    const alt = hreflangAlternates("/en/privacy");
    expect(alt["x-default"]).toBe(`${siteConfig.url}/de/datenschutz`);
    expect(alt["x-default"]).toBe(alt.de);
  });

  it("announces the same alternates in page metadata and sitemap", () => {
    const entries = sitemap();
    expect(entries.length).toBeGreaterThan(10);

    for (const entry of entries) {
      const path = entry.url.slice(siteConfig.url.length);
      const fromMetadata = buildMetadata({ title: "x", locale: "de", path }).alternates?.languages;
      expect(entry.alternates?.languages, entry.url).toEqual(fromMetadata);
    }
  });
});

// =============================================================================
// Search titles and descriptions
// -----------------------------------------------------------------------------
// An OpenSpider crawl on 25.11.2026 found titles past 60 characters (the site
// name appended to an already long title), titles below 30 and descriptions
// past 155. The title rule drops the site name instead of the page's words;
// searchSnippetErrors is what validate-content runs before every build.
// =============================================================================

describe("pageTitle", () => {
  it("keeps the template when the title with the site name fits", () => {
    expect(pageTitle("Sinusbot auf Debian installieren")).toBe("Sinusbot auf Debian installieren");
    expect(renderedTitle("Sinusbot auf Debian installieren")).toBe(
      "Sinusbot auf Debian installieren | Musiker15",
    );
  });

  it("drops the site name when the title would pass the limit", () => {
    const long = "SSHCraft: mein SSH-Client mit eigenem Sync-Server";
    expect(pageTitle(long)).toEqual({ absolute: long });
    expect(renderedTitle(long)).toBe(long);
  });

  it("never renders more than the limit while the title itself fits", () => {
    for (let n = 1; n <= TITLE_MAX; n++) {
      expect(renderedTitle("x".repeat(n)).length).toBeLessThanOrEqual(TITLE_MAX);
    }
  });
});

describe("searchSnippetErrors", () => {
  const page = (fields: Record<string, unknown>) =>
    FrontmatterSchema.parse({ title: "Sinusbot auf Debian installieren", ...fields });
  const okDescription =
    "Musik-Bot für TeamSpeak: Sinusbot installieren, konfigurieren und updaten.";

  it("accepts a page inside both limits", () => {
    expect(searchSnippetErrors(page({ description: okDescription }))).toEqual([]);
  });

  it("flags a title below the minimum and lets metaTitle fix it", () => {
    expect(
      searchSnippetErrors(page({ title: "Sinusbot", description: okDescription })),
    ).toHaveLength(1);
    expect(
      searchSnippetErrors(
        page({
          title: "Sinusbot",
          metaTitle: "Sinusbot auf Debian installieren",
          description: okDescription,
        }),
      ),
    ).toEqual([]);
  });

  it("flags a title that is too long even without the site name", () => {
    expect(
      searchSnippetErrors(page({ title: "x".repeat(61), description: okDescription })),
    ).toHaveLength(1);
  });

  it("flags a description outside the limits and lets metaDescription fix it", () => {
    expect(searchSnippetErrors(page({ description: "Zu kurz." }))).toHaveLength(1);
    expect(searchSnippetErrors(page({ description: "x".repeat(156) }))).toHaveLength(1);
    expect(searchSnippetErrors(page({}))).toHaveLength(1);
    expect(
      searchSnippetErrors(page({ description: "x".repeat(200), metaDescription: okDescription })),
    ).toEqual([]);
  });

  it("skips drafts", () => {
    expect(searchSnippetErrors(page({ title: "x", draft: true }))).toEqual([]);
  });
});

describe("news index metadata", () => {
  it.each([
    ["de", de],
    ["en", en],
  ])("stays inside the limits in %s", (_, messages) => {
    expect(renderedTitle(messages.news.metaTitle).length).toBeGreaterThanOrEqual(30);
    expect(renderedTitle(messages.news.metaTitle).length).toBeLessThanOrEqual(60);
    expect(messages.news.metaDescription.length).toBeGreaterThanOrEqual(70);
    expect(messages.news.metaDescription.length).toBeLessThanOrEqual(155);
  });

  it("differs between the languages", () => {
    expect(de.news.metaTitle).not.toBe(en.news.metaTitle);
  });
});
