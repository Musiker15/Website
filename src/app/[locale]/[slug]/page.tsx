import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { getContent, listContent } from "@/lib/content";
import { renderMDX } from "@/lib/mdx";
import { buildArticleMetadata } from "@/lib/seo";
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

  return (
    <article className="container-page max-w-3xl py-10">
      <Breadcrumbs locale={locale} items={[{ label: item.frontmatter.title }]} />
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
        </header>
      )}
      <div className="prose dark:prose-invert">{content}</div>
    </article>
  );
}
