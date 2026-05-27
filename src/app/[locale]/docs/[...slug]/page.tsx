import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { CalendarClock, Pencil } from "lucide-react";
import { Breadcrumbs, type Crumb } from "@/components/layout/Breadcrumbs";
import { DocSidebar } from "@/components/content/DocSidebar";
import { TableOfContents } from "@/components/content/TableOfContents";
import { buildDocTree, getContent, listContent } from "@/lib/content";
import { renderMDX, extractHeadings } from "@/lib/mdx";
import { buildArticleMetadata, buildJsonLd } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { siteConfig } from "@/config/site.config";
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

  // Breadcrumbs aufbauen
  const crumbs: Crumb[] = [{ label: t("title"), href: `/${locale}/docs` }];
  for (let i = 0; i < slug.length - 1; i++) {
    const seg = slug[i];
    if (!seg) continue;
    crumbs.push({ label: seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) });
  }
  crumbs.push({ label: item.frontmatter.title });

  const articleLd = buildJsonLd({
    "@type": "TechArticle",
    headline: item.frontmatter.title,
    description: item.frontmatter.description,
    datePublished: item.frontmatter.date?.toISOString(),
    dateModified: (item.frontmatter.updated ?? item.modifiedAt).toISOString(),
    author: { "@type": "Person", name: item.frontmatter.author ?? siteConfig.author.name },
    inLanguage: locale === "de" ? "de-DE" : "en-US",
  });

  return (
    <div className="container-page py-8 lg:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: articleLd }} />

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
        </article>

        {/* Table of Contents */}
        <aside className="hidden xl:block xl:sticky xl:top-20 xl:max-h-[calc(100dvh-6rem)] xl:overflow-y-auto">
          {item.frontmatter.toc && <TableOfContents headings={headings} />}
        </aside>
      </div>
    </div>
  );
}
