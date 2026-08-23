"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { FileText, Loader2, Newspaper, Search, X } from "lucide-react";
import type { SearchIndexEntry } from "@/types/content";
import type { ContentSection } from "@/types/content";
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

const SECTION_ICON: Record<ContentSection, typeof FileText> = {
  docs: FileText,
  news: Newspaper,
  pages: FileText,
};

/**
 * Schnellsuche über Strg/Cmd + K.
 *
 * Gegenüber der ersten Fassung sind drei Dinge dazugekommen, die ein
 * Suchdialog braucht, damit er sich wie einer anfühlt: Navigation mit den
 * Pfeiltasten samt Übernahme per Enter, eine Ein- und Ausblendung (die
 * `animate-in`-Klassen von vorher stammten aus einem Plugin, das hier nie
 * installiert war, der Dialog erschien also schlagartig), und übersetzte
 * Bedienelemente. "Schließen" und "Einträge" standen fest auf Deutsch, auch
 * auf der englischen Seite.
 */
export function SearchDialog({ open, onOpenChange }: Props) {
  const t = useTranslations("search");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<SearchIndexEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Index erst laden, wenn der Dialog zum ersten Mal geöffnet wird.
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
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
    setQuery("");
    return undefined;
  }, [open]);

  const groups = useMemo<ResultGroup[]>(() => {
    if (!index || !query.trim()) return [];
    const q = query.toLowerCase().trim();
    const filtered = index
      .filter((entry) => entry.locale === locale)
      .filter((entry) => {
        const haystack =
          `${entry.title} ${entry.description} ${entry.headings.join(" ")} ${entry.body}`.toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, 30);

    const grouped: Record<string, SearchIndexEntry[]> = {};
    for (const item of filtered) {
      (grouped[item.section] ??= []).push(item);
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

  // Flache Liste über alle Gruppen hinweg: die Pfeiltasten laufen durch die
  // Ergebnisse, nicht durch die Zwischenüberschriften.
  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>('[data-active="true"]');
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  function onKeyDown(event: React.KeyboardEvent) {
    if (flat.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % flat.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (i - 1 + flat.length) % flat.length);
    } else if (event.key === "Enter") {
      const target = flat[activeIndex];
      if (target) {
        event.preventDefault();
        onOpenChange(false);
        router.push(target.url);
      }
    }
  }

  let cursor = -1;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="ui-overlay fixed inset-0 z-50 bg-[#0e111b]/60 backdrop-blur-sm" />
        <Dialog.Content
          onKeyDown={onKeyDown}
          className={cn(
            "ui-modal fixed top-[12%] left-1/2 z-50 flex max-h-[74vh] w-[92vw] max-w-2xl -translate-x-1/2 flex-col",
            "overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--shadow-floating)]",
          )}
        >
          <Dialog.Title className="sr-only">{t("title")}</Dialog.Title>

          <div className="flex flex-shrink-0 items-center gap-2 border-b border-[var(--color-border)] px-4 py-3">
            <Search
              className="h-4 w-4 flex-shrink-0 text-[var(--color-muted-foreground)]"
              aria-hidden
            />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("placeholder")}
              aria-label={t("title")}
              className="flex-1 bg-transparent text-sm outline-none"
            />
            <Dialog.Close
              aria-label={tc("close")}
              className="rounded-md p-1 text-[var(--color-muted-foreground)] transition-colors duration-[var(--duration-hover)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
            >
              <X className="h-4 w-4" aria-hidden />
            </Dialog.Close>
          </div>

          <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto p-2">
            {loading && (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-[var(--color-muted-foreground)]">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> {t("title")}
              </div>
            )}

            {!loading && query.trim() && flat.length === 0 && (
              <div className="px-4 py-12 text-center">
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  {t("noResultsFor")}{" "}
                  <span className="font-medium text-[var(--color-foreground)]">{query}</span>
                </p>
                <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
                  {t("tryDifferent")}
                </p>
              </div>
            )}

            {groups.map((group) => (
              <div key={group.label} className="mb-2 last:mb-0">
                <p className="px-2 py-1.5 text-xs font-semibold text-[var(--color-muted-foreground)]">
                  {group.label}
                </p>
                <ul>
                  {group.items.map((item) => {
                    cursor += 1;
                    const isActive = cursor === activeIndex;
                    const Icon = SECTION_ICON[item.section] ?? FileText;
                    const ownIndex = cursor;
                    return (
                      <li key={item.id}>
                        <Link
                          href={item.url}
                          data-active={isActive}
                          onMouseEnter={() => setActiveIndex(ownIndex)}
                          onClick={() => onOpenChange(false)}
                          className={cn(
                            "flex items-start gap-3 rounded-md px-2 py-2",
                            "transition-colors duration-[var(--duration-hover)] ease-[var(--ease-out)]",
                            isActive ? "bg-[var(--color-muted)]" : "bg-transparent",
                          )}
                        >
                          <Icon
                            className={cn(
                              "mt-0.5 h-4 w-4 flex-shrink-0 transition-colors duration-[var(--duration-hover)]",
                              isActive
                                ? "text-[var(--color-primary)]"
                                : "text-[var(--color-muted-foreground)]",
                            )}
                            aria-hidden
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">{item.title}</span>
                            {item.description && (
                              <span className="block truncate text-xs text-[var(--color-muted-foreground)]">
                                {item.description}
                              </span>
                            )}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          {/* Tastaturhinweise statt einer Trefferzahl: was man hier wissen
              will, ist die Bedienung, nicht die Größe des Index. */}
          <div className="flex flex-shrink-0 flex-wrap items-center gap-x-4 gap-y-1 border-t border-[var(--color-border)] bg-[var(--color-muted)]/40 px-4 py-2 text-xs text-[var(--color-muted-foreground)]">
            <Hint keys={["↑", "↓"]} label={t("hintNavigate")} />
            <Hint keys={["↵"]} label={t("hintOpen")} />
            <Hint keys={["Esc"]} label={tc("toClose")} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Hint({ keys, label }: { keys: string[]; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex gap-1">
        {keys.map((k) => (
          <kbd
            key={k}
            className="rounded border border-[var(--color-border)] bg-[var(--color-background)] px-1.5 py-0.5 font-mono text-[10px] leading-4"
          >
            {k}
          </kbd>
        ))}
      </span>
      {label}
    </span>
  );
}
