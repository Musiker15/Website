import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import type { Locale } from "@/types/config";
import type { Frontmatter } from "./frontmatter";

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
 */
function alternatePath(path: string, target: Locale): string {
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
      images: [{ url: ogImage, width: 900, height: 360, alt: imageAlt ?? title }],
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

export function buildArticleMetadata(frontmatter: Frontmatter, locale: Locale, path: string): Metadata {
  return buildMetadata({
    title: frontmatter.title,
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
