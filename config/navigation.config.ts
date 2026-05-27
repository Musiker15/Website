import { NavigationConfigSchema, type NavigationConfig } from "@/types/config";

/**
 * ============================================================================
 * NAVIGATIONS-KONFIGURATION
 * ----------------------------------------------------------------------------
 * Hier werden alle Einträge der Hauptnavigation (Navbar) gepflegt.
 *
 *  • `primary`   — Hauptmenü (Desktop + Mobile)
 *  • `actions`   — Rechte Icon-Leiste (Suche, Sprache, Theme, externe Links)
 *
 * STRUKTUR EINES NAV-ITEMS
 *   label:       I18n-Beschriftung — entweder String oder { de, en }
 *   href:        Ziel-URL (relativ ohne Locale-Prefix, z.B. "/docs")
 *   highlight?:  true → wird als CTA-Button hervorgehoben
 *   external?:   true → öffnet in neuem Tab + rel=noopener
 *   children?:   Untermenü (für Dropdowns)
 *   description?:Optionaler Untertitel im Dropdown
 *
 * Reihenfolge im Array = Reihenfolge in der Navbar.
 * ============================================================================
 */
const config = {
  primary: [
    {
      label: { de: "Start", en: "Home" },
      href: "/",
    },
    {
      label: { de: "Tutorials", en: "Tutorials" },
      href: "/docs",
      children: [
        {
          label: { de: "PC-Hardware", en: "PC Hardware" },
          href: "/docs/pc-hardware",
          description: {
            de: "Mein aktueller Hardware-Setup",
            en: "My current hardware setup",
          },
        },
        {
          label: { de: "Debian-Tutorials", en: "Debian Tutorials" },
          href: "/docs/debian-tutorials",
          description: {
            de: "Server-Setup, Apache, MariaDB, Certbot & mehr",
            en: "Server setup, Apache, MariaDB, Certbot & more",
          },
        },
      ],
    },
    {
      label: { de: "News", en: "News" },
      href: "/news",
    },
    {
      label: "FAQ",
      href: "/faq",
    },
    {
      label: { de: "Community", en: "Community" },
      href: "/community",
    },
  ],

  actions: [
    { type: "search", label: { de: "Suchen", en: "Search" } },
    { type: "locale" },
    { type: "theme" },
    {
      type: "link",
      label: "GitHub",
      href: "https://github.com/musiker15",
      icon: "github",
      external: true,
      "aria-label": "Musiker15 auf GitHub",
    },
  ],
} satisfies NavigationConfig;

export const navigationConfig: NavigationConfig = NavigationConfigSchema.parse(config);
