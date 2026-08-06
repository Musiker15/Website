import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site.config";
import { listAllContentItems, listNews } from "@/lib/content";
import { alternatePath } from "@/lib/seo";
import { SUPPORTED_LOCALES } from "@/types/config";
import type { ContentItem } from "@/types/content";

/**
 * Letztes Änderungsdatum eines Items: bevorzugt aus dem Frontmatter, sonst die
 * mtime der Datei.
 */
function lastModifiedOf(item: ContentItem): Date {
  return item.frontmatter.updated ?? item.frontmatter.date ?? item.modifiedAt;
}

/** Jüngstes Datum aus einer Liste, für die Übersichtsseiten. */
function newestOf(items: ContentItem[], fallback: Date): Date {
  let newest = 0;
  for (const item of items) newest = Math.max(newest, lastModifiedOf(item).getTime());
  return newest > 0 ? new Date(newest) : fallback;
}

/**
 * hreflang-Alternates für einen Pfad, im Format das Next.js für die Sitemap
 * erwartet. Nutzt dieselbe Slug-Auflösung wie die Seiten-Metadata, damit
 * `/de/impressum` auch hier auf `/en/imprint` zeigt und nicht ins Leere.
 */
function languagesFor(path: string): Record<string, string> {
  return {
    de: `${siteConfig.url}/de${alternatePath(path, "de")}`,
    en: `${siteConfig.url}/en${alternatePath(path, "en")}`,
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Fallback-Datum für Übersichtsseiten ohne eigenen Content: der Zeitpunkt des
  // Builds. Bewusst NICHT für Seiten mit Inhalt verwendet — ein lastmod, das bei
  // jedem Build auf "heute" springt, entwertet das Signal für alle Seiten.
  const buildTime = new Date();

  for (const locale of SUPPORTED_LOCALES) {
    const docs = listAllContentItems("docs", locale);
    const pages = listAllContentItems("pages", locale);
    const news = listNews(locale);

    // Startseite: ändert sich mit dem neuesten News-Eintrag (LatestNews-Block).
    entries.push({
      url: `${siteConfig.url}/${locale}`,
      lastModified: newestOf(news, buildTime),
      changeFrequency: "weekly",
      priority: 1.0,
      alternates: { languages: languagesFor(`/${locale}`) },
    });

    // Übersichtsseiten: so alt wie ihr jüngster Eintrag.
    entries.push({
      url: `${siteConfig.url}/${locale}/docs`,
      lastModified: newestOf(docs, buildTime),
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: { languages: languagesFor(`/${locale}/docs`) },
    });
    entries.push({
      url: `${siteConfig.url}/${locale}/news`,
      lastModified: newestOf(news, buildTime),
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: { languages: languagesFor(`/${locale}/news`) },
    });

    // Tutorials — der inhaltliche Kern, entsprechend hohe Priorität.
    for (const item of docs) {
      entries.push({
        url: `${siteConfig.url}${item.url}`,
        lastModified: lastModifiedOf(item),
        changeFrequency: "monthly",
        priority: 0.8,
        alternates: { languages: languagesFor(item.url) },
      });
    }

    for (const item of pages) {
      entries.push({
        url: `${siteConfig.url}${item.url}`,
        lastModified: lastModifiedOf(item),
        changeFrequency: "yearly",
        priority: 0.4,
        alternates: { languages: languagesFor(item.url) },
      });
    }

    for (const item of news) {
      entries.push({
        url: `${siteConfig.url}${item.url}`,
        lastModified: lastModifiedOf(item),
        changeFrequency: "yearly",
        priority: 0.5,
        alternates: { languages: languagesFor(item.url) },
      });
    }
  }

  // `/[locale]/search` fehlt hier bewusst: die Seite steht auf noindex.
  return entries;
}
