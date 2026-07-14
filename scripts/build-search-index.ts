/**
 * Erzeugt zur Build-Zeit den Such-Index unter public/search-index.json
 * Wird im Browser von SearchDialog / SearchPage geladen.
 *
 * Usage:
 *   pnpm run build:search
 */
import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { FrontmatterSchema } from "../src/lib/frontmatter";
import type { SearchIndexEntry } from "../src/types/content";
import type { Locale } from "../src/types/config";

const CONTENT_ROOT = path.join(process.cwd(), "content");
const PUBLIC_DIR = path.join(process.cwd(), "public");
const OUT_FILE = path.join(PUBLIC_DIR, "search-index.json");
const SECTIONS: Array<"pages" | "docs" | "news"> = ["pages", "docs", "news"];
const LOCALES: Locale[] = ["de", "en"];

function walkSection(section: string, locale: string): string[][] {
  const root = path.join(CONTENT_ROOT, section, locale);
  if (!existsSync(root)) return [];
  const out: string[][] = [];

  function rec(dir: string, prefix: string[]) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith(".") || entry.name.startsWith("_")) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        rec(full, [...prefix, entry.name]);
      } else if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) {
        const base = entry.name.replace(/\.(md|mdx)$/, "");
        if (base === "index") {
          if (prefix.length > 0) out.push(prefix);
        } else {
          out.push([...prefix, base]);
        }
      }
    }
  }

  rec(root, []);
  return out;
}

// Entfernt HTML-Tags vollständig. Ein einzelner Replace ist unvollständig, weil
// verschachtelte Konstrukte (z.B. "<<script>script>") nach einem Durchlauf ein
// intaktes Tag zurücklassen. Deshalb wird bis zum Fixpunkt wiederholt und danach
// jede verbliebene spitze Klammer entfernt, sodass kein "<script"-Fragment in den
// Suchindex gelangen kann.
function stripHtmlTags(input: string): string {
  let prev: string;
  let out = input;
  do {
    prev = out;
    out = out.replace(/<[^>]*>/g, "");
  } while (out !== prev);
  return out.replace(/[<>]/g, "");
}

function stripMarkdown(md: string): string {
  return stripHtmlTags(
    md
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`[^`]+`/g, "")
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1"),
  )
    .replace(/[#*_~|]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractHeadings(md: string): string[] {
  return md
    .split("\n")
    .filter((l) => /^#{2,4}\s+/.test(l))
    .map((l) => l.replace(/^#+\s+/, "").trim());
}

function main() {
  console.log("→ Baue Such-Index …");
  const entries: SearchIndexEntry[] = [];

  for (const locale of LOCALES) {
    for (const section of SECTIONS) {
      const slugs = walkSection(section, locale);
      for (const slug of slugs) {
        const fileBase = path.join(CONTENT_ROOT, section, locale, ...slug);
        const candidates = [`${fileBase}.md`, `${fileBase}.mdx`, path.join(fileBase, "index.md")];
        const file = candidates.find((f) => existsSync(f));
        if (!file) continue;

        const raw = readFileSync(file, "utf-8");
        const { data, content } = matter(raw);
        const fm = FrontmatterSchema.safeParse(data);
        if (!fm.success) continue;
        if (fm.data.draft) continue;

        const pathStr = slug.join("/");
        const url = `/${locale}/${section === "pages" ? pathStr : `${section}/${pathStr}`}`.replace(
          /\/+$/,
          "",
        );

        const body = stripMarkdown(content).slice(0, 5000);

        entries.push({
          id: `${section}-${locale}-${slug.join("-")}`,
          url,
          title: fm.data.title,
          description: fm.data.description ?? "",
          section,
          locale,
          headings: extractHeadings(content),
          body,
        });
      }
    }
  }

  if (!existsSync(PUBLIC_DIR)) mkdirSync(PUBLIC_DIR, { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify(entries), "utf-8");

  const sizeKb = Math.round(statSync(OUT_FILE).size / 1024);
  console.log(`✓ Such-Index geschrieben: ${entries.length} Einträge · ${sizeKb} KB`);
  console.log(`  ${path.relative(process.cwd(), OUT_FILE)}`);
}

main();
