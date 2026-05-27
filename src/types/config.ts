import { z } from "zod";

// ============================================================================
// Sprachen
// ============================================================================
export const SUPPORTED_LOCALES = ["de", "en"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

// I18n-String: entweder ein String (für beide Sprachen identisch — z.B. Eigennamen
// wie "GitHub") oder ein Objekt mit allen Sprachen.
export const I18nStringSchema = z.union([
  z.string(),
  z.object({
    de: z.string(),
    en: z.string(),
  }),
]);
export type I18nString = z.infer<typeof I18nStringSchema>;

// ============================================================================
// Site-Config
// ============================================================================
export const SiteConfigSchema = z.object({
  name: z.string(),
  tagline: z.object({ de: z.string(), en: z.string() }),
  description: z.object({ de: z.string(), en: z.string() }),
  url: z.string().url(),
  ogImage: z.string(),
  locales: z.array(z.enum(SUPPORTED_LOCALES)),
  defaultLocale: z.enum(SUPPORTED_LOCALES),
  author: z.object({
    name: z.string(),
    mastodon: z.string().url().optional(),
    email: z.string().email().optional(),
  }),
  repositories: z.object({
    github: z.string().url().optional(),
    mskScripts: z.string().url().optional(),
  }),
  discord: z.string().url().optional(),
});
export type SiteConfig = z.infer<typeof SiteConfigSchema>;

// ============================================================================
// Navigation-Config
// ============================================================================
export interface NavItem {
  label: I18nString;
  href: string;
  highlight?: boolean;
  external?: boolean;
  icon?: string;
  description?: I18nString;
  children?: NavItem[];
}

export const NavItemSchema: z.ZodType<NavItem> = z.lazy(() =>
  z.object({
    label: I18nStringSchema,
    href: z.string(),
    highlight: z.boolean().optional(),
    external: z.boolean().optional(),
    icon: z.string().optional(),
    description: I18nStringSchema.optional(),
    children: z.array(NavItemSchema).optional(),
  }),
);

export const NavActionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("search"), label: I18nStringSchema }),
  z.object({ type: z.literal("locale") }),
  z.object({ type: z.literal("theme") }),
  z.object({
    type: z.literal("link"),
    label: z.string(),
    href: z.string(),
    icon: z.string().optional(),
    external: z.boolean().optional(),
    "aria-label": z.string().optional(),
  }),
]);
export type NavAction = z.infer<typeof NavActionSchema>;

export const NavigationConfigSchema = z.object({
  primary: z.array(NavItemSchema),
  actions: z.array(NavActionSchema),
});
export type NavigationConfig = z.infer<typeof NavigationConfigSchema>;

// ============================================================================
// Footer-Config
// ============================================================================
export const FooterLinkSchema = z.object({
  label: I18nStringSchema,
  href: z.string(),
  external: z.boolean().optional(),
});
export type FooterLink = z.infer<typeof FooterLinkSchema>;

export const FooterColumnSchema = z.object({
  title: I18nStringSchema,
  links: z.array(FooterLinkSchema),
});
export type FooterColumn = z.infer<typeof FooterColumnSchema>;

export const FooterSocialSchema = z.object({
  platform: z.enum([
    "mastodon",
    "github",
    "codeberg",
    "sourceforge",
    "twitter",
    "linkedin",
    "youtube",
    "discord",
  ]),
  href: z.string().url(),
  label: z.string().optional(),
});
export type FooterSocial = z.infer<typeof FooterSocialSchema>;

export const FooterConfigSchema = z.object({
  columns: z.array(FooterColumnSchema),
  social: z.array(FooterSocialSchema),
  copyright: z.object({ de: z.string(), en: z.string() }),
});
export type FooterConfig = z.infer<typeof FooterConfigSchema>;
