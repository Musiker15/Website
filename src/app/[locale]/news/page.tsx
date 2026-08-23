import { setRequestLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { listNews } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import type { Locale } from "@/types/config";

interface Props {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "news" });
  return buildMetadata({
    title: t("title"),
    description: t("subtitle"),
    locale,
    path: `/${locale}/news`,
  });
}

export default async function NewsIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("news");
  const items = listNews(locale);

  return (
    <div className="container-page py-12 md:py-16">
      <Breadcrumbs locale={locale} items={[{ label: t("title") }]} />
      <header className="mb-10 border-b border-[var(--color-border)] pb-6">
        <h1 className="text-[1.875rem] leading-tight font-semibold tracking-[-0.025em] text-balance md:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-[var(--measure)] text-lg leading-relaxed text-pretty text-[var(--color-muted-foreground)]">
          {t("subtitle")}
        </p>
      </header>

      {/* Beiträge als Zeitleiste über die volle Rahmenbreite: Datum in einer
          eigenen Spalte links, Titel und Anriss daneben. Eine Liste liest man
          nicht Zeile für Zeile wie einen Fließtext, sie darf deshalb breiter
          laufen als die Lesespalte. Bis `md` klappt das Datum über den Titel.

          Keine Karten. Bei etwas, das man von oben nach unten überfliegt,
          trennt eine Haarlinie zuverlässiger als ein Rahmen um jeden Eintrag. */}
      {items.length === 0 && (
        // Leerzustand. Eine Überschrift über einer leeren Liste sieht aus wie
        // ein Ladefehler, nicht wie eine Aussage.
        <p className="max-w-[var(--measure)] leading-relaxed text-[var(--color-muted-foreground)]">
          {t("empty")}
        </p>
      )}

      <ol className="divide-y divide-[var(--color-border)] border-b border-[var(--color-border)] empty:hidden">
        {items.map((item) => (
          <li key={item.url}>
            <Link
              href={item.url}
              className="group -mx-4 grid gap-x-8 gap-y-2 rounded-lg px-4 py-6 transition-colors duration-[var(--duration-hover)] ease-[var(--ease-out)] hover:bg-[var(--color-muted)] md:grid-cols-[11rem_minmax(0,1fr)]"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm text-[var(--color-muted-foreground)] md:flex-col md:gap-y-1 md:pt-1">
                {item.frontmatter.date && (
                  <time dateTime={item.frontmatter.date.toISOString().slice(0, 10)}>
                    {formatDate(item.frontmatter.date, locale)}
                  </time>
                )}
                {item.frontmatter.author && (
                  <span className="text-xs">{item.frontmatter.author}</span>
                )}
              </div>
              <div className="min-w-0">
                <h2 className="text-xl leading-snug font-semibold tracking-tight transition-colors duration-[var(--duration-hover)] group-hover:text-[var(--color-primary)]">
                  {item.frontmatter.title}
                </h2>
                {item.frontmatter.description && (
                  <p className="mt-2 max-w-[var(--measure)] leading-relaxed text-pretty text-[var(--color-muted-foreground)]">
                    {item.frontmatter.description}
                  </p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
