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
  const altPath = path.replace(/^\/(de|en)/, "");
  const ogLocale = locale === "de" ? "de_DE" : "en_US";

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        "de-DE": `${siteConfig.url}/de${altPath}`,
        "en-US": `${siteConfig.url}/en${altPath}`,
        "x-default": `${siteConfig.url}/de${altPath}`,
      },
    },
    openGraph: {
      type,
      locale: ogLocale,
      url,
      siteName: siteConfig.name,
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: imageAlt ?? title }],
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
