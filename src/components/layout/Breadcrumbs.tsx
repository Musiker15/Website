import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import type { Locale } from "@/types/config";

export interface Crumb {
  label: string;
  href?: string;
}

interface Props {
  items: Crumb[];
  locale: Locale;
}

export function Breadcrumbs({ items, locale }: Props) {
  // Nur Vorlesetext, sichtbar ist das Haus-Symbol. Deshalb hier direkt statt
  // über die Message-Dateien: ein einzelnes Wort, das nirgends sonst auftaucht.
  const homeLabel = locale === "de" ? "Startseite" : "Home";

  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[var(--color-muted-foreground)]">
        <li>
          <Link
            href={`/${locale}`}
            className="inline-flex min-h-6 items-center rounded-sm py-1 transition-colors duration-[var(--duration-hover)] ease-[var(--ease-out)] hover:text-[var(--color-foreground)]"
          >
            <Home className="h-3.5 w-3.5" aria-hidden />
            <span className="sr-only">{homeLabel}</span>
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <ChevronRight
              className="h-3.5 w-3.5 flex-shrink-0 text-[var(--color-border-strong)]"
              aria-hidden
            />
            {item.href ? (
              <Link
                href={item.href}
                className="inline-flex min-h-6 items-center rounded-sm py-1 transition-colors duration-[var(--duration-hover)] ease-[var(--ease-out)] hover:text-[var(--color-foreground)]"
              >
                {item.label}
              </Link>
            ) : (
              <span className="inline-flex min-h-6 items-center py-1 font-medium text-[var(--color-foreground)]">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
