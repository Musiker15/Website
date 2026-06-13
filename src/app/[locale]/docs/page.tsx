import { setRequestLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { DocSidebar } from "@/components/content/DocSidebar";
import { buildDocTree, getContent } from "@/lib/content";
import { renderMDX } from "@/lib/mdx";
import { buildMetadata } from "@/lib/seo";
import type { DocTreeNode } from "@/types/content";
import type { Locale } from "@/types/config";

interface Props {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "docs" });
  return buildMetadata({
    title: t("title"),
    description: t("subtitle"),
    locale,
    path: `/${locale}/docs`,
  });
}

export default async function DocsIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("docs");
  const tree = buildDocTree(locale);

  // Top-Level-Index (content/docs/<locale>/index.md) rendern, falls vorhanden.
  const index = getContent("docs", locale, []);
  const indexContent = index ? await renderMDX(index.content) : null;
  const heading = index?.frontmatter.title ?? t("title");
  const subtitle = index?.frontmatter.description ?? t("subtitle");

  return (
    <div className="container-page py-8 lg:py-10">
      <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
        {/* Sidebar — Doc-Baum, identisch zu den Unterseiten */}
        <aside className="hidden lg:block lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto">
          <DocSidebar tree={tree} />
        </aside>

        {/* Hauptinhalt */}
        <article className="min-w-0">
          <Breadcrumbs locale={locale} items={[{ label: t("title") }]} />

          <header className="mb-8 border-b border-[var(--color-border)] pb-6">
            <h1 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">{heading}</h1>
            <p className="mt-3 text-balance text-lg text-[var(--color-muted-foreground)]">
              {subtitle}
            </p>
          </header>

          {indexContent && (
            <div className="prose dark:prose-invert mb-12 max-w-none">{indexContent}</div>
          )}

          {/* Bereiche als Navigations-Karten */}
          <h2 className="mb-4 text-xl font-semibold tracking-tight">{t("sections")}</h2>
          <div className="grid items-start gap-4 md:grid-cols-2">
            {tree.map((node) => (
              <DocCard key={node.name} node={node} />
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}

function DocCard({ node }: { node: DocTreeNode }) {
  if (node.type === "page") {
    return (
      <Link href={node.href ?? "#"} className="group">
        <Card className="transition-colors hover:border-[var(--color-primary)]/40">
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2 text-base">
              <span>{node.label}</span>
              <ChevronRight className="h-4 w-4 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
            </CardTitle>
            {node.description && <CardDescription>{node.description}</CardDescription>}
          </CardHeader>
        </Card>
      </Link>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {node.href ? (
            <Link
              href={node.href}
              className="transition-colors hover:text-[var(--color-primary)]"
            >
              {node.label}
            </Link>
          ) : (
            node.label
          )}
        </CardTitle>
        {node.description && <CardDescription>{node.description}</CardDescription>}
        {node.children && (
          <ul className="mt-3 space-y-1.5 border-t border-[var(--color-border)] pt-3">
            {node.children.map((child) => (
              <li key={child.name}>
                <Link
                  href={child.href ?? "#"}
                  className="text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)]"
                >
                  {child.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardHeader>
    </Card>
  );
}
