"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/Button";
import { SUPPORTED_LOCALES, type Locale } from "@/types/config";
import { alternatePath } from "@/lib/seo";
import { cn } from "@/lib/utils";

const NAMES: Record<Locale, string> = {
  de: "Deutsch",
  en: "English",
};

/**
 * Sprachumschalter.
 *
 * Die Einträge sind echte `<a href>`, kein `router.push`. Das ist Absicht und
 * nicht der bequemere Weg:
 *
 * `<html>` und `<body>` stehen in `app/[locale]/layout.tsx`. Der Locale ist
 * damit Teil des Segment-Schlüssels, und ein Wechsel per Client-Navigation
 * hängt nicht etwa neue Texte in die vorhandenen Knoten, sondern hängt den
 * kompletten Baum aus und neu ein. Gemessen am 24.08.2026 mit einem
 * MutationObserver: `header`, `main`, `footer`, sämtliche `meta`-Tags und das
 * Anti-Flash-`<style>` von next-themes verschwinden und kommen neu. Sichtbar
 * ist das als kurzes Aufblitzen der ganzen Seite. Dazu kam, dass der
 * Fokus verloren ging, weil Radix ihn auf den Auslöser zurückgibt, den es zu
 * dem Zeitpunkt nicht mehr gibt, und dass die Scrollposition davon abhing,
 * wann der Baum gerade wie hoch war.
 *
 * Eine echte Navigation hat davon nichts: der Browser zeigt die alte Seite,
 * bis die neue fertig ist, und ein neues Dokument beginnt oben. Zu sparen gibt
 * es dabei ohnehin nichts, weil beim Sprachwechsel jeder Text neu vom Server
 * kommt.
 *
 * `modal={false}` am Menü: die Vorgabe `true` zieht `react-remove-scroll`
 * heran, das seinen Scroll-Lock über ein zur Laufzeit eingehängtes `<style>`
 * ohne Nonce löst. Die CSP blockt das, im Log stand bei jedem Öffnen ein
 * Verstoß. Ein Menü mit zwei Einträgen braucht keinen Scroll-Lock.
 */
export function LocaleSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale() as Locale;
  const pathname = usePathname();

  // Nicht einfach das Sprachpräfix austauschen: `impressum` heißt auf
  // Englisch `imprint` und `datenschutz` heißt `privacy`. Ein mechanisches
  // /de/impressum → /en/impressum landete auf der Nicht-gefunden-Seite.
  // `alternatePath` löst genau diese Zuordnung auf und ist dieselbe
  // Funktion, die auch die hreflang-Alternates baut.
  function hrefFor(target: Locale): string {
    const hasPrefix = SUPPORTED_LOCALES.includes(pathname.split("/")[1] as Locale);
    const rest = hasPrefix ? alternatePath(pathname, target) : pathname;
    return `/${target}${rest === "/" ? "" : rest}`;
  }

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" size="icon" aria-label={t("language")}>
          <Languages className="h-4 w-4" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          className="ui-pop z-50 min-w-[10rem] rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-1 shadow-[var(--shadow-floating)]"
        >
          {SUPPORTED_LOCALES.map((l) => (
            <DropdownMenu.Item key={l} asChild>
              <a
                href={hrefFor(l)}
                hrefLang={l}
                aria-current={locale === l ? "true" : undefined}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-sm outline-none",
                  "transition-colors duration-[var(--duration-hover)]",
                  "hover:bg-[var(--color-muted)] focus:bg-[var(--color-muted)]",
                  locale === l && "font-medium text-[var(--color-primary)]",
                )}
              >
                <span>{NAMES[l]}</span>
                <span className="font-mono text-xs uppercase opacity-70">{l}</span>
              </a>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
