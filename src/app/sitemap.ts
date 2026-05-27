import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site.config";
import { listAllContentItems, listNews } from "@/lib/content";
import { SUPPORTED_LOCALES } from "@/types/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Statische Top-Level-Routen
  const staticRoutes = ["", "/docs", "/news", "/search"];

  for (const locale of SUPPORTED_LOCALES) {
    for (const path of staticRoutes) {
      entries.push({
        url: `${siteConfig.url}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1.0 : 0.7,
      });
    }

    // Dynamische Content-Routen
    const sections: Array<"pages" | "docs"> = ["pages", "docs"];
    for (const section of sections) {
      for (const item of listAllContentItems(section, locale)) {
        entries.push({
          url: `${siteConfig.url}${item.url}`,
          lastModified: item.frontmatter.updated ?? item.frontmatter.date ?? item.modifiedAt,
          changeFrequency: section === "docs" ? "monthly" : "yearly",
          priority: section === "docs" ? 0.8 : 0.6,
        });
      }
    }

    // News
    for (const item of listNews(locale)) {
      entries.push({
        url: `${siteConfig.url}${item.url}`,
        lastModified: item.frontmatter.updated ?? item.frontmatter.date ?? item.modifiedAt,
        changeFrequency: "yearly",
        priority: 0.5,
      });
    }
  }

  return entries;
}
