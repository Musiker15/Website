import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site.config";
import {
  homeLastModified,
  lastModifiedOf,
  listAllContentItems,
  listNews,
  newestOf,
} from "@/lib/content";
// hreflang alternates come from the same function as the page metadata, so the
// sitemap and the HTML announce the same codes and `/de/impressum` points at
// `/en/imprint` here as well.
import { hreflangAlternates } from "@/lib/seo";
import { SUPPORTED_LOCALES } from "@/types/config";

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
      lastModified: homeLastModified(locale) ?? buildTime,
      changeFrequency: "weekly",
      priority: 1.0,
      alternates: { languages: hreflangAlternates(`/${locale}`) },
    });

    // Übersichtsseiten: so alt wie ihr jüngster Eintrag.
    entries.push({
      url: `${siteConfig.url}/${locale}/docs`,
      lastModified: newestOf(docs) ?? buildTime,
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: { languages: hreflangAlternates(`/${locale}/docs`) },
    });
    entries.push({
      url: `${siteConfig.url}/${locale}/news`,
      lastModified: newestOf(news) ?? buildTime,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: { languages: hreflangAlternates(`/${locale}/news`) },
    });

    // Tutorials — der inhaltliche Kern, entsprechend hohe Priorität.
    for (const item of docs) {
      entries.push({
        url: `${siteConfig.url}${item.url}`,
        lastModified: lastModifiedOf(item),
        changeFrequency: "monthly",
        priority: 0.8,
        alternates: { languages: hreflangAlternates(item.url) },
      });
    }

    for (const item of pages) {
      entries.push({
        url: `${siteConfig.url}${item.url}`,
        lastModified: lastModifiedOf(item),
        changeFrequency: "yearly",
        priority: 0.4,
        alternates: { languages: hreflangAlternates(item.url) },
      });
    }

    for (const item of news) {
      entries.push({
        url: `${siteConfig.url}${item.url}`,
        lastModified: lastModifiedOf(item),
        changeFrequency: "yearly",
        priority: 0.5,
        alternates: { languages: hreflangAlternates(item.url) },
      });
    }
  }

  // `/[locale]/search` fehlt hier bewusst: die Seite steht auf noindex.
  return entries;
}
