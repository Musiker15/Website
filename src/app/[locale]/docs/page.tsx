import { setRequestLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { buildDocTree } from "@/lib/content";
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

  return (
    <div className="container-page max-w-5xl py-10">
      <Breadcrumbs locale={locale} items={[{ label: t("title") }]} />
      <header className="mb-10">
        <h1 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h1>
        <p className="mt-3 text-balance text-lg text-[var(--color-muted-foreground)]">
          {t("subtitle")}
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {tree.map((node) => (
          <DocCard key={node.name} node={node} />
        ))}
      </div>
    </div>
  );
}

function DocCard({ node }: { node: DocTreeNode }) {
  if (node.type === "page") {
    return (
      <Link href={node.href ?? "#"} className="group">
        <Card className="h-full transition-colors hover:border-[var(--color-primary)]/40">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span>{node.label}</span>
              <ChevronRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
            </CardTitle>
          </CardHeader>
        </Card>
      </Link>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{node.label}</CardTitle>
        {node.children && (
          <CardDescription>
            <ul className="mt-2 space-y-1.5">
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
          </CardDescription>
        )}
      </CardHeader>
    </Card>
  );
}
