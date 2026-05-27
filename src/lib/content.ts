import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { FrontmatterSchema, type Frontmatter } from "./frontmatter";
import type { ContentItem, ContentSection, DocTreeNode } from "@/types/content";
import type { Locale } from "@/types/config";

const CONTENT_ROOT = path.join(process.cwd(), "content");

/**
 * Liest eine einzelne Content-Datei aus content/<section>/<locale>/<slug…>.md
 * Bei nicht-existierender Datei → null (Caller entscheidet über notFound()).
 */
export function getContent(
  section: ContentSection,
  locale: Locale,
  slug: string[],
): ContentItem | null {
  const candidates = [
    path.join(CONTENT_ROOT, section, locale, ...slug) + ".md",
    path.join(CONTENT_ROOT, section, locale, ...slug) + ".mdx",
    path.join(CONTENT_ROOT, section, locale, ...slug, "index.md"),
    path.join(CONTENT_ROOT, section, locale, ...slug, "index.mdx"),
  ];

  for (const filePath of candidates) {
    if (!existsSync(filePath)) continue;
    const raw = readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    const frontmatterResult = FrontmatterSchema.safeParse(data);
    if (!frontmatterResult.success) {
      throw new Error(
        `Invalides Frontmatter in ${path.relative(process.cwd(), filePath)}:\n` +
          frontmatterResult.error.errors.map((e) => `  - ${e.path.join(".")}: ${e.message}`).join("\n"),
      );
    }
    const frontmatter: Frontmatter = frontmatterResult.data;
    if (frontmatter.draft && process.env.NODE_ENV === "production") return null;
    const stat = statSync(filePath);
    const pathStr = slug.join("/");
    return {
      section,
      locale,
      slug,
      path: section === "pages" ? pathStr : `${section}/${pathStr}`,
      url: `/${locale}/${section === "pages" ? pathStr : `${section}/${pathStr}`}`.replace(/\/+$/, ""),
      frontmatter,
      content,
      modifiedAt: stat.mtime,
    };
  }
  return null;
}

/**
 * Listet alle Slugs (als Array von Pfad-Segmenten) einer Section/Locale auf.
 * Verschachtelte Verzeichnisse werden rekursiv aufgelöst.
 */
export function listContent(section: ContentSection, locale: Locale): string[][] {
  const root = path.join(CONTENT_ROOT, section, locale);
  if (!existsSync(root)) return [];
  return walk(root, []);
}

function walk(dir: string, prefix: string[]): string[][] {
  const out: string[][] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name.startsWith("_")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full, [...prefix, entry.name]));
    } else if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) {
      const base = entry.name.replace(/\.(md|mdx)$/, "");
      if (base === "index") {
        if (prefix.length > 0) out.push(prefix);
      } else {
        out.push([...prefix, base]);
      }
    }
  }
  return out;
}

/**
 * Listet alle ContentItems einer Section in der gewünschten Sprache.
 * Sortierung: frontmatter.order ASC, dann title.
 */
export function listAllContentItems(section: ContentSection, locale: Locale): ContentItem[] {
  const items: ContentItem[] = [];
  for (const slug of listContent(section, locale)) {
    const item = getContent(section, locale, slug);
    if (item) items.push(item);
  }
  items.sort((a, b) => {
    if (a.frontmatter.order !== b.frontmatter.order) return a.frontmatter.order - b.frontmatter.order;
    return a.frontmatter.title.localeCompare(b.frontmatter.title);
  });
  return items;
}

/**
 * News werden absteigend nach Datum sortiert.
 */
export function listNews(locale: Locale): ContentItem[] {
  return listAllContentItems("news", locale).sort((a, b) => {
    const da = a.frontmatter.date?.getTime() ?? 0;
    const db = b.frontmatter.date?.getTime() ?? 0;
    return db - da;
  });
}

/**
 * Erzeugt einen hierarchischen Doc-Baum für die Sidebar.
 */
export function buildDocTree(locale: Locale): DocTreeNode[] {
  const items = listAllContentItems("docs", locale);
  const root: DocTreeNode[] = [];

  for (const item of items) {
    let level = root;
    for (let i = 0; i < item.slug.length; i++) {
      const segment = item.slug[i];
      if (!segment) continue;
      const isLeaf = i === item.slug.length - 1;
      if (isLeaf) {
        level.push({
          type: "page",
          name: segment,
          label: item.frontmatter.title,
          href: item.url,
          order: item.frontmatter.order,
        });
      } else {
        let folder = level.find((n) => n.type === "folder" && n.name === segment);
        if (!folder) {
          folder = {
            type: "folder",
            name: segment,
            label: humanize(segment),
            order: 500,
            children: [],
          };
          level.push(folder);
        }
        level = folder.children ??= [];
      }
    }
  }

  const sortRec = (nodes: DocTreeNode[]) => {
    nodes.sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));
    nodes.forEach((n) => n.children && sortRec(n.children));
  };
  sortRec(root);
  return root;
}

function humanize(segment: string): string {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
