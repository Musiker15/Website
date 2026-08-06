import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ContentItem } from "@/types/content";

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
    <nav aria-labelledby="related-docs" className="mt-12 border-t border-[var(--color-border)] pt-8">
      <h2 id="related-docs" className="mb-4 text-lg font-semibold tracking-tight">
        {heading}
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.url}>
            <Link
              href={item.url}
              className="group block h-full rounded-lg border border-[var(--color-border)] p-4 transition-colors hover:border-[var(--color-primary)]/40"
            >
              <span className="flex items-center justify-between gap-2 font-medium">
                <span>{item.frontmatter.title}</span>
                <ArrowRight className="h-4 w-4 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
              </span>
              {item.frontmatter.description && (
                <span className="mt-1 block text-sm text-[var(--color-muted-foreground)]">
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
