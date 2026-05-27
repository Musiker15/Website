"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { SearchDialog } from "./SearchDialog";

export function SearchTrigger() {
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().includes("MAC"));
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
        className="hidden h-9 min-w-[180px] items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-muted)]/40 px-3 text-sm text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] md:inline-flex"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1 text-left">{t("searchPlaceholder")}</span>
        <kbd className="hidden items-center gap-0.5 rounded border border-[var(--color-border)] bg-[var(--color-background)] px-1.5 py-0.5 text-[10px] font-mono lg:inline-flex">
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
