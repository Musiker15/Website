import { z } from "zod";

/**
 * Schema für YAML-Frontmatter aller Markdown-Dateien unter content/.
 * Wird im Loader bei jedem Aufruf geprüft — invaliden Content findet man sofort.
 */
export const FrontmatterSchema = z.object({
  title: z.string().min(1).max(160),
  description: z.string().max(320).optional(),
  date: z.coerce.date().optional(),
  updated: z.coerce.date().optional(),
  author: z.string().optional(),
  order: z.number().int().nonnegative().default(999),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  toc: z.boolean().default(true),
  hideTitle: z.boolean().default(false),
  image: z.string().optional(),
  imageAlt: z.string().optional(),
  /** Optional: Pfad zur originalen Datei (für "Edit on GitHub"-Links) */
  source: z.string().optional(),
});

export type Frontmatter = z.infer<typeof FrontmatterSchema>;
