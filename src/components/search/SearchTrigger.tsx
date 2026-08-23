"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { SearchDialog } from "./SearchDialog";

export function SearchTrigger() {
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    // `navigator.platform` ist abgekündigt. Wo die User-Agent-Client-Hints
    // vorhanden sind, wird deren Angabe genommen, sonst der alte Weg.
    const hinted = (navigator as Navigator & { userAgentData?: { platform?: string } })
      .userAgentData?.platform;
    setIsMac(/mac/i.test(hinted ?? navigator.platform ?? ""));
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* Desktop: Inline-Input-Look */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("search")}
        className={cn(
          "hidden h-9 w-full max-w-[15rem] items-center gap-2 rounded-md px-3 text-sm md:inline-flex",
          "border border-[var(--color-border)] bg-[var(--color-muted)]/40 text-[var(--color-muted-foreground)]",
          "transition-[background-color,border-color,color] duration-[var(--duration-hover)] ease-[var(--ease-out)]",
          "hover:border-[var(--color-border-strong)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]",
          "focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] focus-visible:outline-none",
        )}
      >
        <Search className="h-3.5 w-3.5 flex-shrink-0" aria-hidden />
        <span className="flex-1 truncate text-left">{t("searchPlaceholder")}</span>
        <kbd className="hidden flex-shrink-0 items-center gap-0.5 rounded border border-[var(--color-border)] bg-[var(--color-background)] px-1.5 py-0.5 font-mono text-[10px] leading-4 lg:inline-flex">
          <span>{isMac ? "⌘" : "Ctrl"}</span>
          <span>K</span>
        </kbd>
      </button>
      {/* Mobile: Icon-Only */}
      <Button
        variant="ghost"
        size="icon"
        aria-label={t("search")}
        className="md:hidden"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
      </Button>
      <SearchDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
