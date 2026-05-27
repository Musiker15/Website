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
      <div className="flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-muted)]/40 px-3">
        <Search className="h-4 w-4 text-[var(--color-muted-foreground)]" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("placeholder")}
          className="h-12 flex-1 bg-transparent text-base outline-none"
        />
      </div>

      <div className="mt-8">
        {!query.trim() ? null : results.length === 0 ? (
          <p className="text-[var(--color-muted-foreground)]">
            {t("noResultsFor")}{" "}
            <span className="font-medium text-[var(--color-foreground)]">"{query}"</span> · {t("tryDifferent")}
          </p>
        ) : (
          <>
            <p className="mb-4 text-sm text-[var(--color-muted-foreground)]">
              {results.length} {t("resultsFor")} "{query}"
            </p>
            <ul className="space-y-3">
              {results.map((r) => (
                <li key={r.id}>
                  <Link
                    href={r.url}
                    className="block rounded-md border border-[var(--color-border)] p-4 transition-colors hover:border-[var(--color-primary)]/40"
                  >
                    <p className="font-medium">{r.title}</p>
                    {r.description && (
                      <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
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
