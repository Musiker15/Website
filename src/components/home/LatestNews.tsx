import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { listNews } from "@/lib/content";
import { formatDate } from "@/lib/utils";
import type { Locale } from "@/types/config";

interface Props {
  locale: Locale;
}

/**
 * Die drei jüngsten News-Beiträge.
 *
 * Bewusst ohne Karten: drei gleich große Kacheln mit Titel und Text sind die
 * Ersatzstruktur, zu der man greift, wenn man keine trifft. Hier trennen
 * Haarlinien und Abstand die Spalten, den Rahmen braucht es dafür nicht. Das
 * hält die Sektion außerdem visuell auseinander vom Kasten im Hero darüber.
 */
export function LatestNews({ locale }: Props) {
  const t = useTranslations("home");
  const news = listNews(locale).slice(0, 3);
  if (news.length === 0) return null;

  return (
    <section className="container-page py-16 md:py-24">
      <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{t("latestNews")}</h2>
        <Link
          href={`/${locale}/news`}
          className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] transition-colors duration-[var(--duration-hover)] hover:text-[var(--color-primary-hover)]"
        >
          {t("moreNews")}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>

      <ul className="grid gap-px bg-[var(--color-border)] md:grid-cols-3">
        {news.map((item) => (
          <li key={item.url} className="bg-[var(--color-background)]">
            <Link
              href={item.url}
              className="group flex h-full flex-col gap-3 p-6 transition-colors duration-[var(--duration-hover)] ease-[var(--ease-out)] hover:bg-[var(--color-muted)] md:px-6 md:pb-8"
            >
              {item.frontmatter.date && (
                <time
                  dateTime={item.frontmatter.date.toISOString().slice(0, 10)}
                  className="text-xs text-[var(--color-muted-foreground)]"
                >
                  {formatDate(item.frontmatter.date, locale)}
                </time>
              )}
              <h3 className="text-base leading-snug font-semibold tracking-tight transition-colors duration-[var(--duration-hover)] group-hover:text-[var(--color-primary)]">
                {item.frontmatter.title}
              </h3>
              {item.frontmatter.description && (
                <p className="line-clamp-3 text-sm leading-relaxed text-[var(--color-muted-foreground)]">
                  {item.frontmatter.description}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
