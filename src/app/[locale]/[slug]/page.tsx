import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { DocNavMobile } from "@/components/content/DocNavMobile";
import { TableOfContents } from "@/components/content/TableOfContents";
import { getContent, listContent } from "@/lib/content";
import { renderMDX } from "@/lib/mdx";
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

  const { content, headings } = await renderMDX(item.content);
  // Ab zwei Überschriften trägt ein Verzeichnis etwas bei. Bei einer einzigen
  // wiederholt es nur, was zwei Zeilen darunter ohnehin steht.
  const showToc = item.frontmatter.toc && headings.length > 1;

  const ld = buildJsonLdGraph([buildBreadcrumbLd([{ name: item.frontmatter.title }])]);

  return (
    // Der Fließtext steht auf `--measure`, wie überall sonst auch. Diese Seite
    // hat keine linke Leiste, rechts im Rahmen bleibt dadurch Platz stehen.
    // Das ist seit dem Wechsel auf einen 120rem-Rahmen so gewollt: die
    // Adresszeilen des Impressums über 1814px zu ziehen, füllte den Rahmen
    // nicht, es ließ ihn leerer wirken.
    <div className="container-page py-12 md:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld }} />
      <div
        className={
          showToc
            ? "grid gap-10 xl:grid-cols-[minmax(0,var(--measure))_12rem] xl:justify-start"
            : "grid gap-10"
        }
      >
        <article className="min-w-0">
          <Breadcrumbs locale={locale} items={[{ label: item.frontmatter.title }]} />
          {showToc && <DocNavMobile headings={headings} />}
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
            </header>
          )}
          <div className="prose dark:prose-invert">{content}</div>
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
