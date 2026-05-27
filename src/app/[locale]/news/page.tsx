import { setRequestLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { listNews } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import type { Locale } from "@/types/config";

interface Props {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "news" });
  return buildMetadata({
    title: t("title"),
    description: t("subtitle"),
    locale,
    path: `/${locale}/news`,
  });
}

export default async function NewsIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("news");
  const items = listNews(locale);

  return (
    <div className="container-page max-w-4xl py-10">
      <Breadcrumbs locale={locale} items={[{ label: t("title") }]} />
      <header className="mb-10">
        <h1 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h1>
        <p className="mt-3 text-balance text-lg text-[var(--color-muted-foreground)]">
          {t("subtitle")}
        </p>
      </header>

      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.url} className="transition-colors hover:border-[var(--color-primary)]/40">
            <CardHeader>
              <div className="mb-2 flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)]">
                <Calendar className="h-3 w-3" />
                {formatDate(item.frontmatter.date, locale)}
                {item.frontmatter.author && <span>· {item.frontmatter.author}</span>}
              </div>
              <CardTitle className="text-xl">
                <Link href={item.url} className="hover:underline">
                  {item.frontmatter.title}
                </Link>
              </CardTitle>
            </CardHeader>
            {item.frontmatter.description && (
              <CardContent className="pt-0">
                <CardDescription>{item.frontmatter.description}</CardDescription>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
