import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/home/Hero";
import { LatestNews } from "@/components/home/LatestNews";
import { CTASection } from "@/components/home/CTASection";
import type { Locale } from "@/types/config";

interface Props {
  params: Promise<{ locale: Locale }>;
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Ein einzelnes Wurzelelement, kein Fragment. Next scrollt bei einer
  // Client-Navigation das erste Element des neuen Segments an. Standen die
  // drei Sections als Geschwister nebeneinander, traf das die zweite: die
  // Startseite kam über Home oder das Logo bei 495px heraus statt oben.
  // Alle anderen Seiten haben ohnehin ein Wurzel-div, deshalb fiel nur diese
  // hier auf. Festgehalten in e2e/regressions.spec.ts.
  return (
    <div>
      <Hero locale={locale} />
      <LatestNews locale={locale} />
      <CTASection locale={locale} />
    </div>
  );
}
