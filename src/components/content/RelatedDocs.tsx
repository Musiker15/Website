import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ContentItem } from "@/types/content";
import { cn } from "@/lib/utils";

interface Props {
  heading: string;
  items: ContentItem[];
}

/**
 * Verwandte Tutorials am Ende einer Doc-Seite.
 *
 * Zweck ist zweierlei: Leser finden das nächste passende Tutorial, ohne über die
 * Übersicht zu gehen, und jede Seite bekommt eingehende interne Links. Ohne das
 * hängen die Tutorials navigatorisch nur an der Sidebar, was einem Crawler
 * wenig darüber sagt, welche Seiten thematisch zusammengehören.
 */
export function RelatedDocs({ heading, items }: Props) {
  if (items.length === 0) return null;

  return (
    <nav
      aria-labelledby="related-docs"
      className="mt-16 border-t border-[var(--color-border)] pt-8"
    >
      <h2 id="related-docs" className="mb-5 text-lg font-semibold tracking-tight">
        {heading}
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.url}>
            <Link
              href={item.url}
              className={cn(
                "group block h-full rounded-lg border border-[var(--color-border)] p-4",
                "transition-[border-color,background-color] duration-[var(--duration-hover)] ease-[var(--ease-out)]",
                "hover:border-[var(--color-primary-line)] hover:bg-[var(--color-muted)]",
              )}
            >
              <span className="flex items-start justify-between gap-2 leading-snug font-medium transition-colors duration-[var(--duration-hover)] group-hover:text-[var(--color-primary)]">
                <span>{item.frontmatter.title}</span>
                {/* Dauerhaft sichtbar. Ein Pfeil, der nur bei Hover erscheint,
                    existiert auf Touchgeräten nicht. */}
                <ArrowRight
                  className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-muted-foreground)] transition-transform duration-[var(--duration-hover)] ease-[var(--ease-out)] group-hover:translate-x-0.5"
                  aria-hidden
                />
              </span>
              {item.frontmatter.description && (
                <span className="mt-1.5 block text-sm leading-relaxed text-[var(--color-muted-foreground)]">
                  {item.frontmatter.description}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
