"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { Heading } from "@/lib/mdx";
import { cn } from "@/lib/utils";

interface Props {
  headings: Heading[];
}

export function TableOfContents({ headings }: Props) {
  const t = useTranslations("docs");
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0]!.target.id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 },
    );
    headings.forEach((h) => {
      const el = document.getElementById(h.slug);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav aria-label={t("onThisPage")} className="text-sm">
      <p className="mb-3 font-semibold text-[var(--color-foreground)]">{t("onThisPage")}</p>
      <ul className="space-y-1.5 border-l border-[var(--color-border)]">
        {headings.map((h) => (
          <li key={h.slug} className={cn(h.depth === 3 && "ml-3")}>
            <a
              href={`#${h.slug}`}
              className={cn(
                "block border-l-2 px-3 py-0.5 text-[var(--color-muted-foreground)] transition-colors",
                "hover:text-[var(--color-foreground)]",
                activeId === h.slug
                  ? "border-[var(--color-primary)] font-medium text-[var(--color-primary)]"
                  : "border-transparent",
              )}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
