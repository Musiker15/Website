import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { DocNavMobile } from "@/components/content/DocNavMobile";
import { TableOfContents } from "@/components/content/TableOfContents";
import { getContent, listContent } from "@/lib/content";
import { renderMDX, extractHeadings } from "@/lib/mdx";
import { buildArticleMetadata, buildBreadcrumbLd, buildJsonLdGraph } from "@/lib/seo";
import { SUPPORTED_LOCALES, type Locale } from "@/types/config";

interface Props {
  params: Promise<{ locale: Locale; slug: string }>;
}

export function generateStaticParams() {
  const params: Array<{ locale: Locale; slug: string }> = [];
  for (const locale of SUPPORTED_LOCALES) {
    for (const slug of listContent("pages", locale)) {
      const first = slug[0];
      if (first) params.push({ locale, slug: first });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const item = getContent("pages", locale, [slug]);
  if (!item) return {};
  return buildArticleMetadata(item.frontmatter, locale, item.url);
}

export default async function CatchAllPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const item = getContent("pages", locale, [slug]);
  if (!item) notFound();

  const content = await renderMDX(item.content);
  const headings = extractHeadings(item.content);
  // Ab zwei Überschriften trägt ein Verzeichnis etwas bei. Bei einer einzigen
  // wiederholt es nur, was zwei Zeilen darunter ohnehin steht.
  const showToc = item.frontmatter.toc && headings.length > 1;

  const ld = buildJsonLdGraph([buildBreadcrumbLd([{ name: item.frontmatter.title }])]);

  return (
    // Diese Seite hat keine linke Leiste, deshalb füllt der Text die Breite
    // zwischen Rahmenkante und Verzeichnisspalte aus. Eine auf `--measure`
    // begrenzte Spalte ließe rechts im Rahmen einen leeren Streifen stehen.
    // Auf den Tutorial-Seiten bleibt es bei `--measure`, dort begrenzen
    // Tutorial-Baum und Verzeichnis die Textspalte ohnehin auf diesen Wert.
    <div className="container-page py-12 md:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld }} />
      <div className={showToc ? "grid gap-10 xl:grid-cols-[minmax(0,1fr)_12rem]" : "grid gap-10"}>
        <article className="min-w-0">
          <Breadcrumbs locale={locale} items={[{ label: item.frontmatter.title }]} />
          {showToc && <DocNavMobile headings={headings} />}
          {!item.frontmatter.hideTitle && (
            <header className="mb-10 border-b border-[var(--color-border)] pb-6">
              <h1 className="text-[1.875rem] leading-tight font-semibold tracking-[-0.025em] text-balance md:text-4xl">
                {item.frontmatter.title}
              </h1>
              {item.frontmatter.description && (
                <p className="mt-3 text-lg leading-relaxed text-pretty text-[var(--color-muted-foreground)]">
                  {item.frontmatter.description}
                </p>
              )}
            </header>
          )}
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
