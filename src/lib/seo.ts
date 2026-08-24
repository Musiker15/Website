import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import type { Locale } from "@/types/config";
import type { Frontmatter } from "./frontmatter";

/**
 * Maße des OG-Bildes. Einzige Quelle für die `og:image:width`/`height`-Angaben.
 * Muss mit `export const size` in `src/app/opengraph-image.tsx` übereinstimmen,
 * sonst melden die Karten-Debugger von Facebook und LinkedIn eine Abweichung
 * zwischen deklarierter und tatsächlicher Bildgröße.
 */
export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

interface BuildMetadataParams {
  title: string;
  description?: string;
  locale: Locale;
  path: string;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  publishedTime?: Date;
  modifiedTime?: Date;
  authors?: string[];
}

/**
 * Seiten, deren Slug sich zwischen den Sprachen unterscheidet.
 *
 * Ohne diese Tabelle würde der hreflang-Alternate mechanisch aus dem Pfad
 * abgeleitet: aus `/de/impressum` entstünde `/en/impressum`, und diese Seite
 * existiert nicht (sie heißt `/en/imprint`). Beide Schreibweisen stehen als
 * Key drin, damit die Auflösung aus jeder Sprachrichtung funktioniert.
 *
 * Alle übrigen Seiten (about, faq, community, docs, news) haben in beiden
 * Sprachen denselben Slug und brauchen hier keinen Eintrag.
 */
const LOCALIZED_SLUGS: Record<string, Record<Locale, string>> = {
  impressum: { de: "impressum", en: "imprint" },
  imprint: { de: "impressum", en: "imprint" },
  datenschutz: { de: "datenschutz", en: "privacy" },
  privacy: { de: "datenschutz", en: "privacy" },
};

/**
 * Baut den locale-freien Pfadrest für die hreflang-Alternate einer Zielsprache.
 * `/de/impressum` + "en" → `/imprint`, `/de/docs/certbot` + "en" → `/docs/certbot`.
 *
 * Exportiert für den Unit-Test in `seo.test.ts`, außerhalb davon nicht gedacht.
 */
export function alternatePath(path: string, target: Locale): string {
  const rest = path.replace(/^\/(de|en)(?=\/|$)/, "");
  const mapped = LOCALIZED_SLUGS[rest.replace(/^\//, "")];
  return mapped ? `/${mapped[target]}` : rest;
}

export function buildMetadata(params: BuildMetadataParams): Metadata {
  const {
    title,
    description = siteConfig.description[params.locale],
    locale,
    path,
    image,
    imageAlt,
    type = "website",
    publishedTime,
    modifiedTime,
    authors = [siteConfig.author.name],
  } = params;

  const url = `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
  const ogImage = image ?? siteConfig.ogImage;
  const altDe = alternatePath(path, "de");
  const altEn = alternatePath(path, "en");
  const ogLocale = locale === "de" ? "de_DE" : "en_US";

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        "de-DE": `${siteConfig.url}/de${altDe}`,
        "en-US": `${siteConfig.url}/en${altEn}`,
        "x-default": `${siteConfig.url}/de${altDe}`,
      },
    },
    openGraph: {
      type,
      locale: ogLocale,
      url,
      siteName: siteConfig.name,
      title,
      description,
      images: [
        {
          url: ogImage,
          width: OG_IMAGE_SIZE.width,
          height: OG_IMAGE_SIZE.height,
          alt: imageAlt ?? title,
        },
      ],
      ...(type === "article" && {
        publishedTime: publishedTime?.toISOString(),
        modifiedTime: modifiedTime?.toISOString(),
        authors,
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export function buildArticleMetadata(
  frontmatter: Frontmatter,
  locale: Locale,
  path: string,
): Metadata {
  return buildMetadata({
    // `metaTitle` erlaubt einen Titel für Suchergebnis und Browser-Tab, der von
    // der sichtbaren H1 abweicht. Gedacht für Fälle, in denen die H1 aus dem
    // Seitenzusammenhang kurz sein darf ("Über Musiker15"), der Titel im
    // Suchergebnis aber ohne diesen Zusammenhang funktionieren muss.
    title: frontmatter.metaTitle ?? frontmatter.title,
    description: frontmatter.description,
    locale,
    path,
    image: frontmatter.image,
    imageAlt: frontmatter.imageAlt,
    type: "article",
    publishedTime: frontmatter.date,
    modifiedTime: frontmatter.updated,
    authors: frontmatter.author ? [frontmatter.author] : undefined,
  });
}

/**
 * JSON-LD-Generator für strukturierte Daten.
 */
export function buildJsonLd(payload: Record<string, unknown>): string {
  return JSON.stringify({ "@context": "https://schema.org", ...payload });
}

/**
 * Mehrere JSON-LD-Knoten in EINEM `<script>`-Tag, über `@graph`.
 *
 * Google liest mehrere einzelne Tags genauso, aber im Graph lassen sich die
 * Knoten über `@id` aufeinander beziehen (Artikel → Autor → Website), statt
 * dieselbe Person in jedem Block erneut auszuschreiben.
 */
export function buildJsonLdGraph(nodes: Array<Record<string, unknown>>): string {
  return JSON.stringify({ "@context": "https://schema.org", "@graph": nodes });
}

/** Stabile Knoten-IDs, damit sich die Graph-Teile gegenseitig referenzieren können. */
export const LD_IDS = {
  person: `${siteConfig.url}/#person`,
  website: `${siteConfig.url}/#website`,
} as const;

export interface BreadcrumbEntry {
  name: string;
  /** Absolut oder als Pfad ab Root. Der letzte Eintrag darf ohne URL bleiben. */
  path?: string;
}

/**
 * BreadcrumbList für die Suchergebnis-Darstellung.
 *
 * Google ersetzt damit die URL-Zeile im Snippet durch den Navigationspfad
 * ("Musiker15 > Tutorials > Debian-Tutorials > Certbot"). Ohne diese Auszeichnung
 * fällt es auf die rohe URL zurück, obwohl die Krümel auf der Seite sichtbar sind.
 */
export function buildBreadcrumbLd(entries: BreadcrumbEntry[]): Record<string, unknown> {
  return {
    "@type": "BreadcrumbList",
    itemListElement: entries.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      ...(entry.path ? { item: `${siteConfig.url}${entry.path}` } : {}),
    })),
  };
}

interface ArticleLdParams {
  type: "TechArticle" | "BlogPosting";
  frontmatter: Frontmatter;
  locale: Locale;
  /** Pfad der Seite, z.B. `/de/docs/debian-tutorials/certbot`. */
  path: string;
  /** Fallback, wenn im Frontmatter kein `updated` steht. */
  modifiedAt: Date;
}

/**
 * Artikel-Knoten für Tutorials (`TechArticle`) und News (`BlogPosting`).
 *
 * Enthält bewusst `mainEntityOfPage` und `image`: ohne beides stuft der Rich
 * Results Test den Artikel als unvollständig ein, und `image` ist die Angabe,
 * die in der mobilen Suche über die Vorschau entscheidet.
 */
export function buildArticleLd({
  type,
  frontmatter,
  locale,
  path,
  modifiedAt,
}: ArticleLdParams): Record<string, unknown> {
  const url = `${siteConfig.url}${path}`;
  const image = `${siteConfig.url}${frontmatter.image ?? siteConfig.ogImage}`;

  return {
    "@type": type,
    "@id": `${url}#article`,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    headline: frontmatter.title,
    ...(frontmatter.description ? { description: frontmatter.description } : {}),
    image,
    ...(frontmatter.date ? { datePublished: frontmatter.date.toISOString() } : {}),
    dateModified: (frontmatter.updated ?? frontmatter.date ?? modifiedAt).toISOString(),
    author: frontmatter.author
      ? { "@type": "Person", name: frontmatter.author }
      : { "@id": LD_IDS.person },
    publisher: { "@id": LD_IDS.person },
    isPartOf: { "@id": LD_IDS.website },
    inLanguage: locale === "de" ? "de-DE" : "en-US",
    ...(frontmatter.tags.length > 0 ? { keywords: frontmatter.tags.join(", ") } : {}),
  };
}
