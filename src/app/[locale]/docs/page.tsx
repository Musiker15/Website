import { setRequestLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { DocSidebar } from "@/components/content/DocSidebar";
import { DocNavMobile } from "@/components/content/DocNavMobile";
import { buildDocTree, getContent, listAllContentItems } from "@/lib/content";
import { renderMDX } from "@/lib/mdx";
import { buildMetadata, buildBreadcrumbLd, buildJsonLdGraph, LD_IDS } from "@/lib/seo";
import { siteConfig } from "@/config/site.config";
import type { DocTreeNode } from "@/types/content";
import type { Locale } from "@/types/config";

interface Props {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "docs" });
  // Titel und Beschreibung kommen aus content/docs/<locale>/index.md, damit sie
  // redaktionell pflegbar sind. `metaTitle` erlaubt dort einen Suchtitel, der
  // von der sichtbaren H1 abweicht. Die Übersetzungsstrings bleiben Fallback.
  const index = getContent("docs", locale, []);
  return buildMetadata({
    title: index?.frontmatter.metaTitle ?? index?.frontmatter.title ?? t("title"),
    description: index?.frontmatter.description ?? t("subtitle"),
    locale,
    path: `/${locale}/docs`,
  });
}

export default async function DocsIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("docs");
  const tree = buildDocTree(locale);

  // Top-Level-Index (content/docs/<locale>/index.md) rendern, falls vorhanden.
  const index = getContent("docs", locale, []);
  const indexContent = index ? await renderMDX(index.content) : null;
  const heading = index?.frontmatter.title ?? t("title");
  const subtitle = index?.frontmatter.description ?? t("subtitle");

  // CollectionPage plus ItemList: sagt der Suchmaschine, dass diese Seite eine
  // Sammlung ist und welche Tutorials dazugehören. Die Liste folgt derselben
  // Sortierung wie die sichtbaren Karten.
  const items = listAllContentItems("docs", locale).filter((i) => i.slug.length > 0);
  const ld = buildJsonLdGraph([
    {
      "@type": "CollectionPage",
      "@id": `${siteConfig.url}/${locale}/docs`,
      name: index?.frontmatter.title ?? t("title"),
      description: index?.frontmatter.description ?? t("subtitle"),
      isPartOf: { "@id": LD_IDS.website },
      inLanguage: locale === "de" ? "de-DE" : "en-US",
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: items.length,
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.frontmatter.title,
          url: `${siteConfig.url}${item.url}`,
        })),
      },
    },
    buildBreadcrumbLd([{ name: t("title") }]),
  ]);

  return (
    <div className="container-page py-8 lg:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld }} />
      <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
        {/* Seitenleiste mit dem Tutorial-Baum, identisch zu den Unterseiten */}
        <aside className="hidden lg:sticky lg:top-20 lg:block lg:max-h-[calc(100dvh-6rem)] lg:self-start lg:overflow-y-auto lg:pb-8">
          <DocSidebar tree={tree} />
        </aside>

        {/* Hauptinhalt. Ohne rechte Verzeichnisspalte füllt die Übersicht die
            Breite bis zur Rahmenkante, sonst bliebe dort ein leerer Streifen.
            Der einleitende Fließtext aus der index.md bleibt über `.prose` auf
            der Lesespalte, die Bereichskarten laufen darüber hinaus. */}
        <article className="min-w-0">
          <Breadcrumbs locale={locale} items={[{ label: t("title") }]} />
          <DocNavMobile tree={tree} />

          <header className="mb-10 border-b border-[var(--color-border)] pb-6">
            <h1 className="text-[1.875rem] leading-tight font-semibold tracking-[-0.025em] text-balance md:text-4xl">
              {heading}
            </h1>
            <p className="mt-3 max-w-[var(--measure)] text-lg leading-relaxed text-pretty text-[var(--color-muted-foreground)]">
              {subtitle}
            </p>
          </header>

          {indexContent && <div className="prose dark:prose-invert mb-12">{indexContent}</div>}

          {/* Bereiche als Einstiegspunkte */}
          <h2 className="mb-5 text-xl font-semibold tracking-tight">{t("sections")}</h2>
          <div className="grid items-start gap-5 md:grid-cols-2">
            {tree.map((node) => (
              <DocCard key={node.name} node={node} />
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}

/**
 * Einstieg in einen Bereich oder ein einzelnes Tutorial.
 *
 * Der Pfeil war vorher `opacity-0` und erschien nur bei Hover. Auf
 * Touchgeräten blieb er damit dauerhaft unsichtbar. Jetzt steht er ständig da
 * und rückt beim Überfahren ein Stück nach rechts.
 */
function DocCard({ node }: { node: DocTreeNode }) {
  if (node.type === "page") {
    return (
      <Link href={node.href ?? "#"} className="group block h-full">
        <Card className="h-full transition-[border-color,box-shadow] duration-[var(--duration-hover)] ease-[var(--ease-out)] group-hover:border-[var(--color-primary-line)] group-hover:shadow-[var(--shadow-floating)]">
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2 text-base transition-colors duration-[var(--duration-hover)] group-hover:text-[var(--color-primary)]">
              <span>{node.label}</span>
              <ChevronRight
                className="h-4 w-4 flex-shrink-0 text-[var(--color-muted-foreground)] transition-transform duration-[var(--duration-hover)] ease-[var(--ease-out)] group-hover:translate-x-0.5"
                aria-hidden
              />
            </CardTitle>
            {node.description && <CardDescription>{node.description}</CardDescription>}
          </CardHeader>
        </Card>
      </Link>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">
          {node.href ? (
            <Link
              href={node.href}
              className="transition-colors duration-[var(--duration-hover)] hover:text-[var(--color-primary)]"
            >
              {node.label}
            </Link>
          ) : (
            node.label
          )}
        </CardTitle>
        {node.description && <CardDescription>{node.description}</CardDescription>}
        {node.children && (
          <ul className="mt-4 space-y-0.5 border-t border-[var(--color-border)] pt-3">
            {node.children.map((child) => (
              <li key={child.name}>
                <Link
                  href={child.href ?? "#"}
                  className="-mx-2 block rounded-md px-2 py-1.5 text-sm text-[var(--color-muted-foreground)] transition-colors duration-[var(--duration-hover)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                >
                  {child.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardHeader>
    </Card>
  );
}
