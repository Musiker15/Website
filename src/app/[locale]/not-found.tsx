import Link from "next/link";
import { Home, Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import type { Locale } from "@/types/config";

export default function NotFound() {
  const t = useTranslations("notFound");
  const locale = useLocale() as Locale;

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="font-mono text-sm text-[var(--color-muted-foreground)]">404</p>
      <h1 className="mt-2 text-balance text-3xl font-bold tracking-tight md:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-3 max-w-md text-balance text-[var(--color-muted-foreground)]">{t("subtitle")}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild variant="primary">
          <Link href={`/${locale}`}>
            <Home className="h-4 w-4" />
            {t("backHome")}
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/${locale}/search`}>
            <Search className="h-4 w-4" />
            {t("search")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
