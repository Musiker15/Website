"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/Button";
import { SUPPORTED_LOCALES, type Locale } from "@/types/config";
import { alternatePath } from "@/lib/seo";
import { cn } from "@/lib/utils";

const NAMES: Record<Locale, string> = {
  de: "Deutsch",
  en: "English",
};

export function LocaleSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function switchTo(next: Locale) {
    if (next === locale) return;
    // Nicht einfach das Sprachpräfix austauschen: `impressum` heißt auf
    // Englisch `imprint` und `datenschutz` heißt `privacy`. Ein mechanisches
    // /de/impressum → /en/impressum landete auf der Nicht-gefunden-Seite.
    // `alternatePath` löst genau diese Zuordnung auf und ist dieselbe
    // Funktion, die auch die hreflang-Alternates baut.
    const hasPrefix = SUPPORTED_LOCALES.includes(pathname.split("/")[1] as Locale);
    const rest = hasPrefix ? alternatePath(pathname, next) : pathname;
    const newPath = `/${next}${rest === "/" ? "" : rest}`;
    startTransition(() => router.push(newPath));
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" size="icon" aria-label={t("language")} disabled={pending}>
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
            <DropdownMenu.Item
              key={l}
              onSelect={() => switchTo(l)}
              className={cn(
                "flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-sm outline-none",
                "transition-colors duration-[var(--duration-hover)]",
                "hover:bg-[var(--color-muted)] focus:bg-[var(--color-muted)]",
                locale === l && "font-medium text-[var(--color-primary)]",
              )}
            >
              <span>{NAMES[l]}</span>
              <span className="font-mono text-xs uppercase opacity-70">{l}</span>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
