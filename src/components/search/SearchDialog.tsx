"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { FileText, Hash, Loader2, Search, X } from "lucide-react";
import type { SearchIndexEntry } from "@/types/content";
import type { Locale } from "@/types/config";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ResultGroup {
  label: string;
  items: SearchIndexEntry[];
}

export function SearchDialog({ open, onOpenChange }: Props) {
  const t = useTranslations("search");
  const locale = useLocale() as Locale;
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<SearchIndexEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Index laden, sobald Dialog erstmals geöffnet wird
  useEffect(() => {
    if (!open || index !== null) return;
    setLoading(true);
    fetch("/search-index.json")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: SearchIndexEntry[]) => setIndex(data))
      .catch(() => setIndex([]))
      .finally(() => setLoading(false));
  }, [open, index]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [open]);

  const groups = useMemo<ResultGroup[]>(() => {
    if (!index || !query.trim()) return [];
    const q = query.toLowerCase().trim();
    const filtered = index
      .filter((entry) => entry.locale === locale)
      .filter((entry) => {
        const haystack = `${entry.title} ${entry.description} ${entry.headings.join(" ")} ${entry.body}`.toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, 30);

    const grouped: Record<string, SearchIndexEntry[]> = {};
    for (const item of filtered) {
      const key = item.section;
      (grouped[key] ??= []).push(item);
    }

    const labels: Record<string, string> = {
      docs: t("groupDocs"),
      news: t("groupNews"),
      pages: t("groupPages"),
    };

    return Object.entries(grouped).map(([section, items]) => ({
      label: labels[section] ?? section,
      items,
    }));
  }, [index, query, locale, t]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-[15%] z-50 max-h-[70vh] w-[92vw] max-w-2xl -translate-x-1/2",
            "overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] shadow-2xl",
          )}
        >
          <Dialog.Title className="sr-only">{t("title")}</Dialog.Title>
          <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-4 py-3">
            <Search className="h-4 w-4 flex-shrink-0 text-[var(--color-muted-foreground)]" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("placeholder")}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--color-muted-foreground)]"
            />
            <Dialog.Close
              aria-label="Schließen"
              className="rounded-md p-1 text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
            >
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <div className="max-h-[55vh] overflow-y-auto p-2">
            {loading && (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-[var(--color-muted-foreground)]">
                <Loader2 className="h-4 w-4 animate-spin" /> {t("title")} …
              </div>
            )}

            {!loading && query.trim() && groups.length === 0 && (
              <div className="px-4 py-12 text-center">
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  {t("noResultsFor")}{" "}
                  <span className="font-medium text-[var(--color-foreground)]">"{query}"</span>
                </p>
                <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">{t("tryDifferent")}</p>
              </div>
            )}

            {groups.map((group) => (
              <div key={group.label} className="mb-3">
                <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
                  {group.label}
                </p>
                <ul>
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={item.url}
                        onClick={() => onOpenChange(false)}
                        className="flex items-start gap-3 rounded-md px-2 py-2 hover:bg-[var(--color-muted)]"
                      >
                        <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-muted-foreground)]" />
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium">{item.title}</p>
                          {item.description && (
                            <p className="truncate text-xs text-[var(--color-muted-foreground)]">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-muted)]/30 px-4 py-2 text-xs text-[var(--color-muted-foreground)]">
            <span className="inline-flex items-center gap-1">
              <Hash className="h-3 w-3" /> {index?.filter((i) => i.locale === locale).length ?? 0} Einträge
            </span>
            <span>
              <kbd className="rounded border border-[var(--color-border)] bg-[var(--color-background)] px-1.5 py-0.5 font-mono">
                Esc
              </kbd>{" "}
              schließen
            </span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
