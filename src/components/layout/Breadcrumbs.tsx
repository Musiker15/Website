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
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm">
      <ol className="flex flex-wrap items-center gap-1 text-[var(--color-muted-foreground)]">
        <li>
          <Link
            href={`/${locale}`}
            className="inline-flex items-center transition-colors hover:text-[var(--color-foreground)]"
          >
            <Home className="h-3.5 w-3.5" aria-hidden />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5 opacity-50" aria-hidden />
            {item.href ? (
              <Link href={item.href} className="transition-colors hover:text-[var(--color-foreground)]">
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-[var(--color-foreground)]">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
