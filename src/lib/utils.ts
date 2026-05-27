import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { I18nString, Locale } from "@/types/config";

/**
 * Kombiniert Tailwind-Klassen mit clsx + tailwind-merge.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Liefert für einen I18n-String die Variante in der gewünschten Sprache.
 */
export function t(value: I18nString, locale: Locale): string {
  if (typeof value === "string") return value;
  return value[locale] ?? value.de;
}

/**
 * Formatiert ein Datum gemäß Locale (z.B. "9. Mai 2026" / "May 9, 2026").
 */
export function formatDate(
  date: Date | string | undefined,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" },
): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(locale === "de" ? "de-DE" : "en-US", options).format(d);
}

/**
 * Erzeugt aus einem Heading-Text einen URL-Slug.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[äöüÄÖÜß]/g, (m) =>
      ({ ä: "ae", ö: "oe", ü: "ue", Ä: "ae", Ö: "oe", Ü: "ue", ß: "ss" })[m] || m,
    )
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Liefert eine URL ohne führende/abschließende Slashes.
 */
export function trimSlashes(path: string): string {
  return path.replace(/^\/+|\/+$/g, "");
}

/**
 * Erzeugt eine vollständige absolute URL.
 */
export function absoluteUrl(path: string, baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}/${trimSlashes(path)}`;
}

/**
 * Externe URL erkennen.
 */
export function isExternal(href: string): boolean {
  return /^(https?:|mailto:|tel:)/.test(href);
}

/**
 * Liest einen kurzen Lese-Aufwand aus einem Markdown-Body (ca. 200 WPM).
 */
export function readingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}
