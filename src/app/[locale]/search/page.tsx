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
  return {
    ...buildMetadata({
      title: t("title"),
      locale,
      path: `/${locale}/search`,
    }),
    // Suchergebnisseiten gehören nicht in den Index: sie erzeugen pro Query eine
    // eigene URL mit Inhalten, die anderswo bereits kanonisch stehen. `follow`
    // bleibt an, damit die verlinkten Treffer trotzdem gecrawlt werden.
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { q = "" } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("search");

  return (
    <div className="container-page py-12 md:py-16">
      <Breadcrumbs locale={locale} items={[{ label: t("title") }]} />
      <header className="mb-8">
        <h1 className="text-[1.875rem] leading-tight font-semibold tracking-[-0.025em] md:text-4xl">
          {t("title")}
        </h1>
      </header>
      <SearchPageClient locale={locale} initialQuery={q} />
    </div>
  );
}
