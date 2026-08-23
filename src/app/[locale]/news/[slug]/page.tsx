import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Calendar, User } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { DocNavMobile } from "@/components/content/DocNavMobile";
import { TableOfContents } from "@/components/content/TableOfContents";
import { getContent, listContent } from "@/lib/content";
import { renderMDX, extractHeadings } from "@/lib/mdx";
import {
  buildArticleMetadata,
  buildArticleLd,
  buildBreadcrumbLd,
  buildJsonLdGraph,
} from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { SUPPORTED_LOCALES, type Locale } from "@/types/config";

interface Props {
  params: Promise<{ locale: Locale; slug: string }>;
}

export function generateStaticParams() {
  const params: Array<{ locale: Locale; slug: string }> = [];
  for (const locale of SUPPORTED_LOCALES) {
    for (const slug of listContent("news", locale)) {
      const first = slug[0];
      if (first) params.push({ locale, slug: first });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const item = getContent("news", locale, [slug]);
  if (!item) return {};
  return buildArticleMetadata(item.frontmatter, locale, item.url);
}

export default async function NewsArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("news");
  const item = getContent("news", locale, [slug]);
  if (!item) notFound();

  const content = await renderMDX(item.content);
  const headings = extractHeadings(item.content);
  const showToc = item.frontmatter.toc && headings.length > 1;

  const ld = buildJsonLdGraph([
    buildArticleLd({
      type: "BlogPosting",
      frontmatter: item.frontmatter,
      locale,
      path: item.url,
      modifiedAt: item.modifiedAt,
    }),
    buildBreadcrumbLd([
      { name: t("title"), path: `/${locale}/news` },
      { name: item.frontmatter.title },
    ]),
  ]);

  return (
    <div className="container-page py-12 md:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld }} />
      <div className={showToc ? "grid gap-10 xl:grid-cols-[minmax(0,1fr)_12rem]" : "grid gap-10"}>
        <article className="min-w-0">
          <Breadcrumbs
            locale={locale}
            items={[
              { label: t("title"), href: `/${locale}/news` },
              { label: item.frontmatter.title },
            ]}
          />
          {showToc && <DocNavMobile headings={headings} />}

          <header className="mb-10 border-b border-[var(--color-border)] pb-6">
            <h1 className="text-[1.875rem] leading-tight font-semibold tracking-[-0.025em] text-balance md:text-4xl">
              {item.frontmatter.title}
            </h1>
            {item.frontmatter.description && (
              <p className="mt-3 text-lg leading-relaxed text-pretty text-[var(--color-muted-foreground)]">
                {item.frontmatter.description}
              </p>
            )}
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[var(--color-muted-foreground)]">
              {item.frontmatter.date && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" aria-hidden />
                  <time dateTime={item.frontmatter.date.toISOString().slice(0, 10)}>
                    {formatDate(item.frontmatter.date, locale)}
                  </time>
                </span>
              )}
              {item.frontmatter.author && (
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" aria-hidden />
                  {item.frontmatter.author}
                </span>
              )}
            </div>
          </header>

          <div className="prose prose-wide dark:prose-invert">{content}</div>
        </article>

        {showToc && (
          <aside className="hidden xl:sticky xl:top-20 xl:block xl:max-h-[calc(100dvh-6rem)] xl:self-start xl:overflow-y-auto xl:pb-8">
            <TableOfContents headings={headings} />
          </aside>
        )}
      </div>
    </div>
  );
}
