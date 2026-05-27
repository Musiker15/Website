import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Calendar, User } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { getContent, listContent } from "@/lib/content";
import { renderMDX } from "@/lib/mdx";
import { buildArticleMetadata, buildJsonLd } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { siteConfig } from "@/config/site.config";
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

  const ld = buildJsonLd({
    "@type": "BlogPosting",
    headline: item.frontmatter.title,
    description: item.frontmatter.description,
    datePublished: item.frontmatter.date?.toISOString(),
    dateModified: (item.frontmatter.updated ?? item.modifiedAt).toISOString(),
    author: { "@type": "Person", name: item.frontmatter.author ?? siteConfig.author.name },
    inLanguage: locale === "de" ? "de-DE" : "en-US",
  });

  return (
    <article className="container-page max-w-3xl py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld }} />
      <Breadcrumbs
        locale={locale}
        items={[{ label: t("title"), href: `/${locale}/news` }, { label: item.frontmatter.title }]}
      />

      <header className="mb-8 border-b border-[var(--color-border)] pb-6">
        <h1 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
          {item.frontmatter.title}
        </h1>
        {item.frontmatter.description && (
          <p className="mt-3 text-balance text-lg text-[var(--color-muted-foreground)]">
            {item.frontmatter.description}
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[var(--color-muted-foreground)]">
          {item.frontmatter.date && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(item.frontmatter.date, locale)}
            </span>
          )}
          {item.frontmatter.author && (
            <span className="inline-flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              {item.frontmatter.author}
            </span>
          )}
        </div>
      </header>

      <div className="prose dark:prose-invert">{content}</div>
    </article>
  );
}
