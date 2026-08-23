"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import type { SearchIndexEntry } from "@/types/content";
import type { Locale } from "@/types/config";

interface Props {
  locale: Locale;
  initialQuery: string;
}

export function SearchPageClient({ locale, initialQuery }: Props) {
  const t = useTranslations("search");
  const [query, setQuery] = useState(initialQuery);
  const [index, setIndex] = useState<SearchIndexEntry[] | null>(null);

  useEffect(() => {
    fetch("/search-index.json")
      .then((r) => (r.ok ? r.json() : []))
      .then(setIndex)
      .catch(() => setIndex([]));
  }, []);

  const results = useMemo(() => {
    if (!index || !query.trim()) return [];
    const q = query.toLowerCase().trim();
    return index
      .filter((e) => e.locale === locale)
      .filter((e) =>
        `${e.title} ${e.description} ${e.headings.join(" ")} ${e.body}`.toLowerCase().includes(q),
      )
      .slice(0, 50);
  }, [index, query, locale]);

  return (
    <>
      {/* Eingabefeld auf Lesespaltenbreite. Die Trefferliste darunter darf über
          die volle Rahmenbreite laufen, ein 1262px breites Eingabefeld sieht
          dagegen aus wie ein Fehler im Layout. */}
      <div className="flex max-w-[var(--measure)] items-center gap-2 rounded-md border border-[var(--color-border-strong)] bg-[var(--color-muted)]/40 px-3 transition-colors duration-[var(--duration-hover)] focus-within:border-[var(--color-primary)]">
        <Search
          className="h-4 w-4 flex-shrink-0 text-[var(--color-muted-foreground)]"
          aria-hidden
        />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("placeholder")}
          aria-label={t("title")}
          className="h-12 flex-1 bg-transparent text-base outline-none"
        />
      </div>

      <div className="mt-8">
        {!query.trim() ? null : results.length === 0 ? (
          <p className="text-[var(--color-muted-foreground)]">
            {t("noResultsFor")}{" "}
            <span className="font-medium text-[var(--color-foreground)]">{query}</span>.{" "}
            {t("tryDifferent")}
          </p>
        ) : (
          <>
            <p className="mb-4 text-sm text-[var(--color-muted-foreground)]">
              {results.length} {t("resultsFor")}{" "}
              <span className="font-medium text-[var(--color-foreground)]">{query}</span>
            </p>
            <ul className="divide-y divide-[var(--color-border)]">
              {results.map((r) => (
                <li key={r.id}>
                  <Link
                    href={r.url}
                    className="group -mx-3 block rounded-md px-3 py-3 transition-colors duration-[var(--duration-hover)] ease-[var(--ease-out)] hover:bg-[var(--color-muted)]"
                  >
                    <p className="leading-snug font-medium transition-colors duration-[var(--duration-hover)] group-hover:text-[var(--color-primary)]">
                      {r.title}
                    </p>
                    {r.description && (
                      <p className="mt-1 text-sm leading-relaxed text-[var(--color-muted-foreground)]">
                        {r.description}
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
}
