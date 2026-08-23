"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Home, RotateCcw } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import type { Locale } from "@/types/config";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");
  const locale = useLocale() as Locale;

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <h1 className="text-[1.875rem] leading-tight font-semibold tracking-[-0.025em] text-balance md:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-3 max-w-md leading-relaxed text-pretty text-[var(--color-muted-foreground)]">
        {t("subtitle")}
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-[var(--color-muted-foreground)]">
          {error.digest}
        </p>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={reset} variant="primary">
          <RotateCcw className="h-4 w-4" />
          {t("retry")}
        </Button>
        <Button asChild variant="outline">
          <Link href={`/${locale}`}>
            <Home className="h-4 w-4" />
            {t("backHome")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
