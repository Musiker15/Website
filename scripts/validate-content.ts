/**
 * Validiert alle Markdown-Dateien unter content/ gegen das Frontmatter-Schema.
 * Wird vor jedem Build (CI + lokal via `pnpm prebuild`) ausgeführt.
 *
 * Usage:
 *   pnpm run validate:content
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { FrontmatterSchema } from "../src/lib/frontmatter";

const CONTENT_ROOT = path.join(process.cwd(), "content");

interface ValidationError {
  file: string;
  errors: string[];
}

function walk(dir: string): string[] {
  const files: string[] = [];
  if (!statSync(dir, { throwIfNoEntry: false })) return files;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name.startsWith("_")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) files.push(full);
  }
  return files;
}

function main() {
  console.log("→ Validiere Content unter", CONTENT_ROOT);
  const files = walk(CONTENT_ROOT);
  console.log(`  ${files.length} Datei(en) gefunden\n`);

  const errors: ValidationError[] = [];
  let okCount = 0;

  for (const file of files) {
    const rel = path.relative(process.cwd(), file);
    try {
      const raw = readFileSync(file, "utf-8");
      const { data, content } = matter(raw);
      const result = FrontmatterSchema.safeParse(data);
      if (!result.success) {
        errors.push({
          file: rel,
          errors: result.error.errors.map((e) => `${e.path.join(".") || "(root)"}: ${e.message}`),
        });
      } else {
        if (content.trim().length < 20) {
          console.warn(`  ⚠ ${rel} — Body sehr kurz (< 20 Zeichen)`);
        }
        okCount++;
      }
    } catch (e) {
      errors.push({ file: rel, errors: [(e as Error).message] });
    }
  }

  if (errors.length === 0) {
    console.log(`\n✓ Alle ${okCount} Content-Dateien gültig`);
    process.exit(0);
  }

  console.error(`\n✗ ${errors.length} Datei(en) mit Fehlern:\n`);
  for (const err of errors) {
    console.error(`  ${err.file}`);
    for (const msg of err.errors) console.error(`    - ${msg}`);
    console.error();
  }
  process.exit(1);
}

main();
