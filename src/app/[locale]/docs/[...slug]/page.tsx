import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { CalendarClock, Pencil } from "lucide-react";
import { Breadcrumbs, type Crumb } from "@/components/layout/Breadcrumbs";
import { DocSidebar } from "@/components/content/DocSidebar";
import { TableOfContents } from "@/components/content/TableOfContents";
import { RelatedDocs } from "@/components/content/RelatedDocs";
import { buildDocTree, getContent, getRelatedDocs, listContent } from "@/lib/content";
import { renderMDX, extractHeadings } from "@/lib/mdx";
import { buildArticleMetadata, buildArticleLd, buildBreadcrumbLd, buildJsonLdGraph } from "@/lib/seo";
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

  const headings = extractHeadings(item.content);
  const content = await renderMDX(item.content);
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

      <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)_14rem]">
        {/* Sidebar — Doc-Baum */}
        <aside className="hidden lg:block lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto">
          <DocSidebar tree={tree} />
        </aside>

        {/* Hauptinhalt */}
        <article className="min-w-0">
          <Breadcrumbs locale={locale} items={crumbs} />

          {!item.frontmatter.hideTitle && (
            <header className="mb-8 border-b border-[var(--color-border)] pb-6">
              <h1 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
                {item.frontmatter.title}
              </h1>
              {item.frontmatter.description && (
                <p className="mt-3 text-balance text-lg text-[var(--color-muted-foreground)]">
                  {item.frontmatter.description}
                </p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[var(--color-muted-foreground)]">
                {item.frontmatter.updated && (
                  <span className="inline-flex items-center gap-1">
                    <CalendarClock className="h-3 w-3" />
                    {t("lastUpdated")} {formatDate(item.frontmatter.updated, locale)}
                  </span>
                )}
                <Link
                  href={`https://github.com/Musiker15/Website/edit/main/content/docs/${locale}/${slug.join("/")}.md`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-[var(--color-primary)]"
                >
                  <Pencil className="h-3 w-3" />
                  {t("editPage")}
                </Link>
              </div>
            </header>
          )}

          <div className="prose dark:prose-invert">{content}</div>

          <RelatedDocs heading={t("related")} items={related} />
        </article>

        {/* Table of Contents */}
        <aside className="hidden xl:block xl:sticky xl:top-20 xl:max-h-[calc(100dvh-6rem)] xl:overflow-y-auto">
          {item.frontmatter.toc && <TableOfContents headings={headings} />}
        </aside>
      </div>
    </div>
  );
}
