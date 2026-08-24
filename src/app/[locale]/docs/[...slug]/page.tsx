import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { CalendarClock, Pencil } from "lucide-react";
import { Breadcrumbs, type Crumb } from "@/components/layout/Breadcrumbs";
import { DocSidebar } from "@/components/content/DocSidebar";
import { DocNavMobile } from "@/components/content/DocNavMobile";
import { TableOfContents } from "@/components/content/TableOfContents";
import { RelatedDocs } from "@/components/content/RelatedDocs";
import { buildDocTree, getContent, getRelatedDocs, listContent } from "@/lib/content";
import { renderMDX } from "@/lib/mdx";
import {
  buildArticleMetadata,
  buildArticleLd,
  buildBreadcrumbLd,
  buildJsonLdGraph,
} from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { SUPPORTED_LOCALES, type Locale } from "@/types/config";

interface Props {
  params: Promise<{ locale: Locale; slug: string[] }>;
}

export function generateStaticParams() {
  const params: Array<{ locale: Locale; slug: string[] }> = [];
  for (const locale of SUPPORTED_LOCALES) {
    for (const slug of listContent("docs", locale)) {
      params.push({ locale, slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const item = getContent("docs", locale, slug);
  if (!item) return {};
  return buildArticleMetadata(item.frontmatter, locale, item.url);
}

export default async function DocPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("docs");

  const item = getContent("docs", locale, slug);
  if (!item) notFound();

  const { content, headings } = await renderMDX(item.content);
  const tree = buildDocTree(locale);
  const related = getRelatedDocs(item, locale);

  // Beschriftung einer Zwischenebene: bevorzugt der Titel aus der index.md des
  // Ordners ("Debian-Tutorials"), sonst der humanisierte Verzeichnisname als
  // Notnagel ("Debian Tutorials"). Der Unterschied landet sichtbar im Snippet,
  // sobald Google die BreadcrumbList übernimmt.
  const segmentLabel = (index: number): string => {
    const segments = slug.slice(0, index + 1);
    const seg = segments[index] ?? "";
    return (
      getContent("docs", locale, segments)?.frontmatter.title ??
      seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    );
  };

  const parents = slug.slice(0, -1).map((_, i) => ({
    name: segmentLabel(i),
    path: `/${locale}/docs/${slug.slice(0, i + 1).join("/")}`,
  }));

  const crumbs: Crumb[] = [
    { label: t("title"), href: `/${locale}/docs` },
    ...parents.map((p) => ({ label: p.name, href: p.path })),
    { label: item.frontmatter.title },
  ];

  // Dieselben Krümel als BreadcrumbList. Der letzte Eintrag bleibt bewusst ohne
  // URL, so verlangt es die Schema.org-Empfehlung für die aktuelle Seite.
  const ldCrumbs = [
    { name: t("title"), path: `/${locale}/docs` },
    ...parents,
    { name: item.frontmatter.title },
  ];

  const pageLd = buildJsonLdGraph([
    buildArticleLd({
      type: "TechArticle",
      frontmatter: item.frontmatter,
      locale,
      path: item.url,
      modifiedAt: item.modifiedAt,
    }),
    buildBreadcrumbLd(ldCrumbs),
  ]);

  return (
    <div className="container-page py-8 lg:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: pageLd }} />

      {/* Die dritte Spalte gibt es erst ab `xl`, weil das Inhaltsverzeichnis
          erst dort eingeblendet wird. Vorher stand sie schon ab `lg` im
          Raster: zwischen 1024px und 1279px blieben 256px rechts leer, und
          die Textspalte wurde dadurch auf 482px gequetscht. */}
      <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[15rem_minmax(0,1fr)_12rem]">
        {/* Seitenleiste mit dem Tutorial-Baum */}
        <aside className="hidden lg:sticky lg:top-20 lg:block lg:max-h-[calc(100dvh-6rem)] lg:self-start lg:overflow-y-auto lg:pb-8">
          <DocSidebar tree={tree} />
        </aside>

        {/* Hauptinhalt */}
        <article className="min-w-0">
          <Breadcrumbs locale={locale} items={crumbs} />
          <DocNavMobile tree={tree} headings={item.frontmatter.toc ? headings : undefined} />

          {!item.frontmatter.hideTitle && (
            <header className="mb-10 max-w-[var(--measure)] border-b border-[var(--color-border)] pb-6">
              <h1 className="text-[1.875rem] leading-tight font-semibold tracking-[-0.025em] text-balance md:text-4xl">
                {item.frontmatter.title}
              </h1>
              {item.frontmatter.description && (
                <p className="mt-3 text-lg leading-relaxed text-pretty text-[var(--color-muted-foreground)]">
                  {item.frontmatter.description}
                </p>
              )}
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--color-muted-foreground)]">
                {item.frontmatter.updated && (
                  <span className="inline-flex min-h-6 items-center gap-1.5">
                    <CalendarClock className="h-3 w-3" />
                    {t("lastUpdated")} {formatDate(item.frontmatter.updated, locale)}
                  </span>
                )}
                <Link
                  href={`https://github.com/Musiker15/Website/edit/main/content/docs/${locale}/${slug.join("/")}.md`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-6 items-center gap-1.5 rounded-sm transition-colors duration-[var(--duration-hover)] hover:text-[var(--color-primary)]"
                >
                  <Pencil className="h-3 w-3" aria-hidden />
                  {t("editPage")}
                </Link>
              </div>
            </header>
          )}

          <div className="prose dark:prose-invert">{content}</div>

          <div className="max-w-[var(--measure)]">
            <RelatedDocs heading={t("related")} items={related} />
          </div>
        </article>

        {/* Inhaltsverzeichnis */}
        <aside className="hidden xl:sticky xl:top-20 xl:block xl:max-h-[calc(100dvh-6rem)] xl:self-start xl:overflow-y-auto xl:pb-8">
          {item.frontmatter.toc && <TableOfContents headings={headings} />}
        </aside>
      </div>
    </div>
  );
}
