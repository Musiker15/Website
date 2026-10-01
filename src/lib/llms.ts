import { siteConfig } from "@/config/site.config";
import { buildDocTree, listAllContentItems, listNews } from "./content";
import type { DocTreeNode } from "@/types/content";

/**
 * /llms.txt: the short map of the site for language models. What the site is,
 * which tutorials there are and what each one covers.
 *
 * Built from the content files rather than kept as a file in `public/`, so a
 * new tutorial shows up here without anyone remembering a second place. It
 * lists the German pages, the default locale, and points to the English start
 * page once instead of repeating every link.
 *
 * Lives here and not in the route file, because Next allows a route file only
 * its own exports, and the test needs to call this.
 */

const LOCALE = "de";

/** Legal pages go to the end. A reader looking for a tutorial does not need them. */
const LEGAL_SLUGS = new Set(["impressum", "datenschutz"]);

const absolute = (path: string) => `${siteConfig.url}${path}`;

function entry(label: string, path: string, note?: string): string {
  return note ? `- [${label}](${absolute(path)}): ${note}` : `- [${label}](${absolute(path)})`;
}

/** Every page below a folder, in sidebar order, nested folders flattened. */
function pagesOf(nodes: DocTreeNode[]): DocTreeNode[] {
  return nodes.flatMap((node) =>
    node.type === "folder"
      ? [...(node.href ? [node] : []), ...pagesOf(node.children ?? [])]
      : [node],
  );
}

function section(heading: string, lines: string[]): string[] {
  return lines.length > 0 ? [`## ${heading}`, "", ...lines, ""] : [];
}

export function buildLlmsTxt(): string {
  const tree = buildDocTree(LOCALE);
  const topLevelPages = tree.filter((node) => node.type === "page");
  const folders = tree.filter((node) => node.type === "folder");

  const pages = listAllContentItems("pages", LOCALE);
  const legal = pages.filter((page) => LEGAL_SLUGS.has(page.slug[0] ?? ""));
  const other = pages.filter((page) => !LEGAL_SLUGS.has(page.slug[0] ?? ""));

  const toEntry = (node: DocTreeNode) => entry(node.label, node.href ?? "", node.description);

  const lines = [
    `# ${siteConfig.name}`,
    "",
    `> ${siteConfig.description[LOCALE]}`,
    "",
    `Die Tutorials gibt es auf Deutsch und auf Englisch. Diese Übersicht verweist auf die deutschen Fassungen, die englischen beginnen unter ${absolute("/en")}.`,
    "",
    ...section("Tutorials", [
      entry("Alle Tutorials", `/${LOCALE}/docs`, "Übersicht über alle Bereiche."),
      ...topLevelPages.map(toEntry),
    ]),
    ...folders.flatMap((folder) => section(folder.label, pagesOf([folder]).map(toEntry))),
    ...section(
      "News",
      listNews(LOCALE).map((item) =>
        entry(item.frontmatter.title, item.url, item.frontmatter.description),
      ),
    ),
    ...section(
      "Seiten",
      other.map((page) => entry(page.frontmatter.title, page.url, page.frontmatter.description)),
    ),
    ...section("Optional", [
      ...legal.map((page) => entry(page.frontmatter.title, page.url)),
      entry("RSS-Feed", `/${LOCALE}/news/feed.xml`, "Die News als Feed."),
      entry("English", "/en", "The same site in English."),
    ]),
  ];

  return lines.join("\n").trimEnd() + "\n";
}
