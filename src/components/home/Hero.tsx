import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { GitHubIcon } from "@/components/ui/BrandIcons";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { listLatestDocs, getSectionLabel } from "@/lib/content";
import { formatDate } from "@/lib/utils";
import { siteConfig } from "@/config/site.config";
import type { Locale } from "@/types/config";

interface HeroProps {
  locale: Locale;
}

/**
 * Der Einstieg.
 *
 * Drei Dinge sind hier bewusst anders als vorher:
 *
 * 1. Die Überschrift nennt das Thema, nicht den Markennamen. "Musiker15" steht
 *    im Header, im Seitentitel und im Footer. Wer zum ersten Mal hier landet,
 *    muss oben lesen können, worum es geht.
 * 2. Kein kleines Label über der Überschrift. Ein solches Etikett trägt keine
 *    Information, die die Überschrift nicht selbst trägt.
 * 3. Rechts stehen echte Tutorials statt eines nachgebauten Terminalfensters.
 *    Die Attrappe hatte deutsche Kommentare, auch auf der englischen Seite,
 *    und war der einzige Ort der Seite, an dem etwas Inhalt vortäuschte.
 */
export function Hero({ locale }: HeroProps) {
  const t = useTranslations("home");
  const latest = listLatestDocs(locale, 3);

  return (
    <section className="relative overflow-hidden border-b border-[var(--color-border)]">
      {/* Akzentschimmer, definiert in globals.css. Als eigene Klasse statt als
          Inline-Style, damit `style-src` ohne 'unsafe-inline' auskommt. */}
      <div aria-hidden className="hero-decor-gradient pointer-events-none absolute inset-0 -z-10" />

      <div className="container-page grid gap-12 py-16 md:py-20 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-center lg:gap-16 lg:py-24">
        <div className="stagger-rise">
          {/* Ohne Breitenbegrenzung: die Zeile bricht dadurch zweimal statt
              dreimal, und `text-balance` verteilt die beiden Zeilen gleichmäßig.
              Eine Überschrift, die im Einstieg über drei Zeilen läuft, drückt
              alles Weitere aus dem ersten Bildschirm. */}
          <h1 className="text-[2.25rem] leading-[1.08] font-semibold tracking-[-0.035em] text-balance sm:text-5xl lg:text-[3.5rem]">
            {t("heroTitle")}
          </h1>

          <p className="mt-6 max-w-[48ch] text-lg leading-relaxed text-pretty text-[var(--color-muted-foreground)] md:text-xl">
            {t("heroLead")}
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="primary">
              <Link href={`/${locale}/docs`}>
                {t("heroCtaPrimary")}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            {siteConfig.repositories.github && (
              <Button asChild size="lg" variant="outline">
                <Link
                  href={siteConfig.repositories.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GitHubIcon className="h-4 w-4" aria-hidden />
                  {t("heroCtaSecondary")}
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Zuletzt geschriebene Tutorials. Der einzige inszenierte Moment der
            Seite: die drei Zeilen laufen leicht versetzt ein. */}
        {latest.length > 0 && (
          <aside
            aria-labelledby="hero-latest"
            className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--shadow-raised)]"
          >
            <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-5 py-3">
              <h2 id="hero-latest" className="text-sm font-semibold tracking-tight">
                {t("latestDocs")}
              </h2>
              <Link
                href={`/${locale}/docs`}
                className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] transition-colors duration-[var(--duration-hover)] hover:text-[var(--color-primary-hover)]"
              >
                {t("allDocs")}
                <ArrowUpRight className="h-3 w-3" aria-hidden />
              </Link>
            </div>

            <ul className="stagger-rise divide-y divide-[var(--color-border)]">
              {latest.map((item) => {
                const section = getSectionLabel(item, locale);
                return (
                  <li key={item.url}>
                    <Link
                      href={item.url}
                      className="group block px-5 py-4 transition-colors duration-[var(--duration-hover)] ease-[var(--ease-out)] hover:bg-[var(--color-muted)]"
                    >
                      <span className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-muted-foreground)]">
                        {section && <Badge variant="quiet">{section}</Badge>}
                        {item.frontmatter.date && (
                          <time dateTime={item.frontmatter.date.toISOString().slice(0, 10)}>
                            {formatDate(item.frontmatter.date, locale)}
                          </time>
                        )}
                      </span>
                      <span className="mt-2 block text-sm leading-snug font-medium transition-colors duration-[var(--duration-hover)] group-hover:text-[var(--color-primary)]">
                        {item.frontmatter.title}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </aside>
        )}
      </div>
    </section>
  );
}
