import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { listNews } from "@/lib/content";
import { formatDate } from "@/lib/utils";
import type { Locale } from "@/types/config";

interface Props {
  locale: Locale;
}

export function LatestNews({ locale }: Props) {
  const t = useTranslations("home");
  const news = listNews(locale).slice(0, 3);
  if (news.length === 0) return null;

  return (
    <section className="container-page py-16 md:py-20">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{t("latestNews")}</h2>
        <Button asChild variant="link" className="h-auto p-0">
          <Link href={`/${locale}/news`} className="inline-flex items-center gap-1">
            {t("moreNews")} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {news.map((item) => (
          <Card key={item.url} className="flex h-full flex-col">
            <CardHeader>
              <div className="mb-2 flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)]">
                <Calendar className="h-3 w-3" />
                {formatDate(item.frontmatter.date, locale)}
              </div>
              <CardTitle className="text-lg leading-tight">
                <Link href={item.url} className="hover:underline">
                  {item.frontmatter.title}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pt-0">
              {item.frontmatter.description && (
                <CardDescription className="line-clamp-3">
                  {item.frontmatter.description}
                </CardDescription>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
