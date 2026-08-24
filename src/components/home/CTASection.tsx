import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site.config";
import type { Locale } from "@/types/config";

interface Props {
  locale: Locale;
}

/**
 * Abschluss der Startseite.
 *
 * Der Abschnitt führt jetzt dorthin, wovon sein Text handelt. Vorher stand
 * über zwei Discord-Sätzen ein Knopf "Tutorials lesen", also dasselbe Ziel wie
 * im Hero, und die zweite Aktion hieß nur "Community". Ein Funkel-Symbol über
 * der Überschrift gab es auch, das ist ersatzlos weg.
 */
export function CTASection({ locale }: Props) {
  const t = useTranslations("home");

  return (
    <section className="border-t border-[var(--color-border)] bg-[var(--color-muted)]/40">
      <div className="container-page py-16 md:py-20">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div>
            <h2 className="max-w-[20ch] text-2xl font-semibold tracking-tight text-balance md:text-3xl xl:max-w-[30ch]">
              {t("ctaTitle")}
            </h2>
            <p className="mt-3 max-w-[52ch] leading-relaxed text-pretty text-[var(--color-muted-foreground)] xl:max-w-[78ch]">
              {t("ctaSubtitle")}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" variant="primary">
              <Link href={`/${locale}/community`}>
                {t("ctaPrimary")}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={siteConfig.discord} target="_blank" rel="noopener noreferrer">
                {t("ctaSecondary")}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
