import { SiteConfigSchema, type SiteConfig } from "@/types/config";

/**
 * ============================================================================
 * SITE-KONFIGURATION
 * ----------------------------------------------------------------------------
 * Hier werden globale Metadaten der Seite gepflegt: Name, Beschreibung, URL,
 * Autor, Repository-Links und SEO-Defaults.
 *
 * Diese Datei darf gefahrlos editiert werden — alle Werte werden beim Start
 * automatisch per Zod validiert, Fehler werden im Terminal angezeigt.
 * ============================================================================
 */
const config = {
  name: "Musiker15",
  tagline: {
    de: "Tutorials & Guides",
    en: "Tutorials & Guides",
  },
  description: {
    de: "Persönliche Webseite von Moritz Kohm — Tutorials, Guides und Hintergrund-Infos rund um Linux/Debian, Server-Administration und Selbst-Hosting.",
    en: "Personal website of Moritz Kohm — tutorials, guides and background info on Linux/Debian, server administration and self-hosting.",
  },

  // Öffentliche Basis-URL (ohne trailing Slash)
  url: "https://www.musiker15.de",

  // OpenGraph-Default-Image (1200×630 SVG/PNG, liegt in /public)
  ogImage: "/og-default.svg",

  locales: ["de", "en"],
  defaultLocale: "de",

  author: {
    name: "Moritz Kohm",
    email: "info@musiker15.de",
  },

  repositories: {
    github: "https://github.com/musiker15",
    mskScripts: "https://github.com/MSK-Scripts",
  },

  discord: "https://discord.gg/5hHSBRHvJE",
} satisfies SiteConfig;

export const siteConfig: SiteConfig = SiteConfigSchema.parse(config);
