import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { GitHubIcon } from "@/components/ui/BrandIcons";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { siteConfig } from "@/config/site.config";
import type { Locale } from "@/types/config";

interface HeroProps {
  locale: Locale;
}

export function Hero({ locale }: HeroProps) {
  const t = useTranslations("home");

  return (
    <section className="relative overflow-hidden border-b border-[var(--color-border)]">
      {/* Background-Decoration — Gradient in globals.css (.hero-decor-gradient).
          Inline-Style entfernt, damit CSP `style-src` ohne 'unsafe-inline' auskommt. */}
      <div
        aria-hidden
        className="hero-decor-gradient pointer-events-none absolute inset-0 -z-10"
      />

      <div className="container-page grid items-center gap-10 py-16 md:py-20 lg:grid-cols-2 lg:py-28">
        {/* Text-Spalte */}
        <div>
          <Badge variant="outline" className="mb-5 gap-1.5">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-success)]" />
            {t("heroBadge")}
          </Badge>

          <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            {siteConfig.name}
          </h1>
          <p className="mt-4 text-balance text-xl text-[var(--color-muted-foreground)] md:text-2xl">
            {siteConfig.tagline[locale]}
          </p>
          <p className="mt-6 max-w-xl text-pretty text-base text-[var(--color-muted-foreground)] md:text-lg">
            {siteConfig.description[locale]}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="primary">
              <Link href={`/${locale}/docs`}>
                <BookOpen className="h-4 w-4" />
                {t("heroCtaPrimary")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            {siteConfig.repositories.github && (
              <Button asChild size="lg" variant="outline">
                <Link
                  href={siteConfig.repositories.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GitHubIcon className="h-4 w-4" />
                  {t("heroCtaSecondary")}
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Tutorial-Showcase: Terminal-Style Code-Block */}
        <div className="relative">
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] shadow-xl">
            <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-4 py-2">
              <span className="h-3 w-3 rounded-full bg-red-500/80" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <span className="h-3 w-3 rounded-full bg-green-500/80" />
              <span className="ml-2 font-mono text-xs text-[var(--color-muted-foreground)]">
                musiker15@server: ~
              </span>
            </div>
            <pre className="overflow-x-auto p-5 font-mono text-sm leading-relaxed text-[var(--color-foreground)]">
              <code>
                <span className="text-[var(--color-muted-foreground)]"># Debian-Server frisch aufgesetzt?</span>
                {"\n"}
                <span className="text-emerald-500">$</span>{" "}
                <span>sudo apt update </span>
                <span className="text-amber-600">&amp;&amp;</span>{" "}
                <span>sudo apt upgrade -y</span>
                {"\n\n"}
                <span className="text-[var(--color-muted-foreground)]"># Webserver installieren</span>
                {"\n"}
                <span className="text-emerald-500">$</span>{" "}
                <span>sudo apt install apache2 mariadb-server</span>
                {"\n\n"}
                <span className="text-[var(--color-muted-foreground)]"># Let&apos;s Encrypt aktivieren</span>
                {"\n"}
                <span className="text-emerald-500">$</span>{" "}
                <span>sudo certbot --apache</span>
                {"\n\n"}
                <span className="text-[var(--color-muted-foreground)]"># Fertig.</span>
              </code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
