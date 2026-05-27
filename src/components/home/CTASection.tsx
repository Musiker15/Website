import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import type { Locale } from "@/types/config";

interface Props {
  locale: Locale;
}

export function CTASection({ locale }: Props) {
  const t = useTranslations("home");
  return (
    <section className="border-t border-[var(--color-border)] bg-[var(--color-muted)]/30">
      <div className="container-page py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <Sparkles className="mx-auto mb-4 h-8 w-8 text-[var(--color-primary)]" />
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
            {t("ctaTitle")}
          </h2>
          <p className="mt-3 text-balance text-[var(--color-muted-foreground)] md:text-lg">
            {t("ctaSubtitle")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" variant="primary">
              <Link href={`/${locale}/docs`}>
                {t("ctaPrimary")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={`/${locale}/community`}>{t("ctaSecondary")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
