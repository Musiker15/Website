import { FooterConfigSchema, type FooterConfig } from "@/types/config";

/**
 * ============================================================================
 * FOOTER-KONFIGURATION
 * ----------------------------------------------------------------------------
 * Pflege der Footer-Spalten, Social-Links und Copyright-Hinweis.
 *
 * STRUKTUR
 *   columns:    Array von Spalten (responsive 1→2→4)
 *     title:    Spaltenüberschrift (I18n)
 *     links:    Liste von Links innerhalb der Spalte
 *
 *   social:     Icon-Leiste (Discord, GitHub, ...)
 *     platform: "discord" | "github" | "mastodon" | "twitter" | "linkedin" | "youtube"
 *     href:     vollständige URL
 *
 *   copyright:  {year} wird automatisch ersetzt
 * ============================================================================
 */
const config = {
  columns: [
    {
      title: { de: "Inhalte", en: "Content" },
      links: [
        { label: { de: "Tutorials", en: "Tutorials" }, href: "/docs" },
        { label: { de: "News", en: "News" }, href: "/news" },
        { label: "FAQ", href: "/faq" },
      ],
    },
    {
      title: { de: "Über mich", en: "About" },
      links: [
        { label: { de: "Über Musiker15", en: "About Musiker15" }, href: "/about" },
        { label: { de: "Community", en: "Community" }, href: "/community" },
        { label: "MSK Scripts", href: "https://www.msk-scripts.de", external: true },
      ],
    },
    {
      title: { de: "Socials", en: "Socials" },
      links: [
        { label: "Discord", href: "https://discord.gg/5hHSBRHvJE", external: true },
        { label: "GitHub Musiker15", href: "https://github.com/musiker15", external: true },
        { label: "GitHub MSK Scripts", href: "https://github.com/MSK-Scripts", external: true },
      ],
    },
    {
      title: { de: "Rechtliches", en: "Legal" },
      links: [
        { label: { de: "Impressum", en: "Imprint" }, href: "/impressum" },
        { label: { de: "Datenschutz", en: "Privacy" }, href: "/datenschutz" },
      ],
    },
  ],

  social: [
    { platform: "discord", href: "https://discord.gg/5hHSBRHvJE" },
    { platform: "github", href: "https://github.com/musiker15" },
  ],

  copyright: {
    de: "© {year} Moritz Kohm",
    en: "© {year} Moritz Kohm",
  },
} satisfies FooterConfig;

export const footerConfig: FooterConfig = FooterConfigSchema.parse(config);
