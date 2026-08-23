import { ChevronDown } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { DocSidebar } from "./DocSidebar";
import { TableOfContents } from "./TableOfContents";
import type { Heading } from "@/lib/mdx";
import type { DocTreeNode } from "@/types/content";
import { cn } from "@/lib/utils";

interface Props {
  /** Ohne Baum bleibt nur das Inhaltsverzeichnis, etwa auf /about oder /faq. */
  tree?: DocTreeNode[];
  headings?: Heading[];
}

/**
 * Navigation für schmale Viewports: Tutorial-Baum und Inhaltsverzeichnis.
 *
 * Unterhalb von `lg` waren Seitenleiste und Inhaltsverzeichnis beide
 * ausgeblendet. Wer ein Tutorial auf dem Telefon las, hatte damit keinen Weg
 * zum nächsten und keinen Überblick über die Abschnitte, sondern nur die
 * Hauptnavigation mit den beiden Sammelseiten.
 *
 * Wird auch von den Einzelseiten (/about, /faq, /impressum) und den
 * News-Artikeln benutzt, dort ohne Baum.
 *
 * Umgesetzt mit `<details>`: kein Zustand, kein JavaScript, funktioniert mit
 * Tastatur und Screenreader von Haus aus, und die Seite bleibt ohne Hydration
 * bedienbar.
 */
export async function DocNavMobile({ tree, headings }: Props) {
  const t = await getTranslations("docs");
  const hasTree = !!tree && tree.length > 0;
  const hasHeadings = !!headings && headings.length > 0;
  if (!hasTree && !hasHeadings) return null;

  // Zwei Breakpoints, nicht einer: der Baum wandert ab `lg` in die
  // Seitenleiste, das Inhaltsverzeichnis erst ab `xl` in die rechte Spalte.
  // Mit einem gemeinsamen `lg:hidden` gäbe es zwischen 1024px und 1279px
  // überhaupt kein Inhaltsverzeichnis mehr.
  return (
    <div className={hasHeadings ? "mb-8 space-y-2 xl:hidden" : "mb-8 space-y-2 lg:hidden"}>
      {hasTree && (
        <Disclosure label={t("allTutorials")} className="lg:hidden">
          <div className="px-4 pb-4 text-sm">
            <DocSidebar tree={tree} bare />
          </div>
        </Disclosure>
      )}

      {hasHeadings && (
        <Disclosure label={t("onThisPage")}>
          <div className="px-4 pb-4">
            <TableOfContents headings={headings} hideLabel />
          </div>
        </Disclosure>
      )}
    </div>
  );
}

function Disclosure({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <details
      className={cn(
        "group overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-card)]",
        className,
      )}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-medium transition-colors duration-[var(--duration-hover)] hover:bg-[var(--color-muted)] [&::-webkit-details-marker]:hidden">
        {label}
        <ChevronDown
          className="h-4 w-4 flex-shrink-0 text-[var(--color-muted-foreground)] transition-transform duration-[var(--duration-pop)] ease-[var(--ease-out)] group-open:rotate-180"
          aria-hidden
        />
      </summary>
      {children}
    </details>
  );
}
