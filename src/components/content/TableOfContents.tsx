"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { Heading } from "@/lib/mdx";
import { cn } from "@/lib/utils";

interface Props {
  headings: Heading[];
  /** Für Kontexte, die die Überschrift selbst mitbringen (mobile Ausklapper). */
  hideLabel?: boolean;
}

export function TableOfContents({ headings, hideLabel = false }: Props) {
  const t = useTranslations("docs");
  const [activeId, setActiveId] = useState<string>("");
  const visible = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (headings.length === 0) return;
    const order = headings.map((h) => h.slug);
    const seen = visible.current;
    seen.clear();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) seen.add(entry.target.id);
          else seen.delete(entry.target.id);
        }
        // Die Reihenfolge der `entries` folgt nicht der Dokumentreihenfolge.
        // Vorher wurde einfach `visible[0]` genommen, wodurch die Markierung
        // beim Scrollen gelegentlich zurücksprang. Jetzt gewinnt immer die
        // oberste sichtbare Überschrift, gemessen an der Gliederung selbst.
        const first = order.find((slug) => seen.has(slug));
        if (first) setActiveId(first);
      },
      { rootMargin: "-88px 0px -70% 0px", threshold: 0 },
    );

    for (const slug of order) {
      const el = document.getElementById(slug);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav aria-label={t("onThisPage")} className="text-sm">
      {!hideLabel && (
        <p className="mb-3 font-semibold tracking-tight text-[var(--color-foreground)]">
          {t("onThisPage")}
        </p>
      )}
      <ul className="space-y-px">
        {headings.map((h) => {
          const active = activeId === h.slug;
          return (
            <li key={h.slug}>
              <a
                href={`#${h.slug}`}
                aria-current={active ? "location" : undefined}
                className={cn(
                  "block border-l py-1 pr-2 leading-snug",
                  "transition-[color,border-color] duration-[var(--duration-hover)] ease-[var(--ease-out)]",
                  h.depth === 3 ? "pl-6" : "pl-3",
                  active
                    ? "border-[var(--color-primary)] font-medium text-[var(--color-primary)]"
                    : "border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-foreground)]",
                )}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
