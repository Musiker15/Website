import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/home/Hero";
import { LatestNews } from "@/components/home/LatestNews";
import { CTASection } from "@/components/home/CTASection";
import { siteConfig } from "@/config/site.config";
import { homeLastModified } from "@/lib/content";
import { buildJsonLdGraph, buildWebPageLd } from "@/lib/seo";
import type { Locale } from "@/types/config";

interface Props {
  params: Promise<{ locale: Locale }>;
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // The front page as a node of its own, with the date it last changed. Name
  // and description are the ones the layout puts into <title> and the meta
  // description, so the structured data says what the page says.
  const ld = buildJsonLdGraph([
    buildWebPageLd({
      path: `/${locale}`,
      name: `${siteConfig.name} | ${siteConfig.tagline[locale]}`,
      description: siteConfig.description[locale],
      locale,
      modifiedAt: homeLastModified(locale),
    }),
  ]);

  // Ein einzelnes Wurzelelement, kein Fragment. Next scrollt bei einer
  // Client-Navigation das erste Element des neuen Segments an. Standen die
  // drei Sections als Geschwister nebeneinander, traf das die zweite: die
  // Startseite kam über Home oder das Logo bei 495px heraus statt oben.
  // Alle anderen Seiten haben ohnehin ein Wurzel-div, deshalb fiel nur diese
  // hier auf. Festgehalten in e2e/regressions.spec.ts.
  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld }} />
      <Hero locale={locale} />
      <LatestNews locale={locale} />
      <CTASection locale={locale} />
    </div>
  );
}
