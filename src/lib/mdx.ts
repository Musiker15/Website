import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode, { type Options as PrettyCodeOptions } from "rehype-pretty-code";
import { mdxComponents } from "@/components/content/MDXComponents";

const prettyCodeOptions: PrettyCodeOptions = {
  theme: { dark: "github-dark", light: "github-light" },
  keepBackground: false,
  defaultLang: { block: "latex", inline: "latex" },
};

/**
 * Kompiliert MDX-Source zu React-Elementen (RSC-fähig).
 */
export async function renderMDX(source: string) {
  const { content } = await compileMDX({
    source,
    components: mdxComponents,
    options: {
      parseFrontmatter: false, // wir parsen das selbst via gray-matter
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: "wrap",
              properties: { className: ["heading-anchor"] },
            },
          ],
          [rehypePrettyCode, prettyCodeOptions],
        ],
      },
    },
  });
  return content;
}

/**
 * Extrahiert Headings (H2/H3) aus dem Roh-Markdown für das Table-of-Contents-Widget.
 */
export interface Heading {
  depth: 2 | 3;
  text: string;
  slug: string;
}

export function extractHeadings(source: string): Heading[] {
  const lines = source.split("\n");
  const headings: Heading[] = [];
  let inCodeBlock = false;
  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;
    const m = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (!m) continue;
    const depth = m[1]!.length as 2 | 3;
    const text = m[2]!.replace(/[*_`]/g, "").trim();
    const slug = text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[äöüÄÖÜß]/g, (c) =>
        ({ ä: "ae", ö: "oe", ü: "ue", Ä: "ae", Ö: "oe", Ü: "ue", ß: "ss" })[c] || c,
      )
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    headings.push({ depth, text, slug });
  }
  return headings;
}
