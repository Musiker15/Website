import { setRequestLocale, getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SearchPageClient } from "./search-client";
import { buildMetadata } from "@/lib/seo";
import type { Locale } from "@/types/config";

interface Props {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "search" });
  return buildMetadata({
    title: t("title"),
    locale,
    path: `/${locale}/search`,
  });
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { q = "" } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("search");

  return (
    <div className="container-page max-w-3xl py-10">
      <Breadcrumbs locale={locale} items={[{ label: t("title") }]} />
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      </header>
      <SearchPageClient locale={locale} initialQuery={q} />
    </div>
  );
}
