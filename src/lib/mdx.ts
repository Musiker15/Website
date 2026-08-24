import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode, { type Options as PrettyCodeOptions } from "rehype-pretty-code";
import { mdxComponents } from "@/components/content/MDXComponents";

const prettyCodeOptions: PrettyCodeOptions = {
  theme: { dark: "github-dark", light: "github-light" },
  keepBackground: false,
  // Default-Sprache, falls in einem Code-Fence kein Lang-Tag angegeben ist.
  // "plaintext" verhindert, dass z.B. eine inline-`info@musiker15.de` als
  // Code irgendeiner Sprache geparst wird.
  defaultLang: { block: "plaintext", inline: "plaintext" },
};

export interface Heading {
  depth: 2 | 3;
  text: string;
  slug: string;
}

/* ---------------------------------------------------------------------------
   Anker-Slugs
   ---------------------------------------------------------------------------
   Es gibt genau eine Stelle, an der ein Slug entsteht: das Plugin unten. Das
   Inhaltsverzeichnis bekommt seine Einträge aus demselben Durchlauf, der die
   `id` an die Überschrift schreibt.

   Vorher war es zweigleisig: `rehype-slug` (github-slugger) vergab die ids,
   eine eigene Funktion baute daneben die Slugs für das Verzeichnis aus dem
   Roh-Markdown. Beide kamen zu unterschiedlichen Ergebnissen, sobald eine
   Überschrift einen Umlaut oder eine HTML-Entity enthielt: github-slugger
   behält "ü", die eigene Funktion warf es weg. "Schritt 5: Zielverzeichnis
   prüfen" bekam so die id `…-prüfen-…`, das Verzeichnis verlinkte aber auf
   `…-prufen-…`. Der Browser änderte die Adresse und sprang nirgendwohin, weil
   es das Ziel schlicht nicht gab. Dasselbe bei `## Social Media &amp; Gaming`.
   --------------------------------------------------------------------------- */

const TRANSLITERATION: Record<string, string> = {
  ä: "ae",
  ö: "oe",
  ü: "ue",
  Ä: "ae",
  Ö: "oe",
  Ü: "ue",
  ß: "ss",
};

/**
 * Baut einen Slugger, der innerhalb eines Dokuments Dubletten durchnummeriert
 * (`einleitung`, `einleitung-1`, …), so wie github-slugger es tut.
 */
function createSlugger(): (text: string) => string {
  const used = new Map<string, number>();
  return (text) => {
    const base =
      text
        // Vor der NFD-Zerlegung, sonst zerfällt "ü" in "u" plus Trema und die
        // Ersetzung greift nie. Genau das war hier der Fall, die Tabelle lag
        // hinter dem Strippen der kombinierenden Zeichen und war tot.
        .replace(/[äöüÄÖÜß]/g, (c) => TRANSLITERATION[c] ?? c)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "abschnitt";
    const seen = used.get(base);
    used.set(base, (seen ?? 0) + 1);
    return seen === undefined ? base : `${base}-${seen}`;
  };
}

/** Minimaler hast-Ausschnitt. Reicht für den Durchlauf und spart den Typ-Import. */
interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

const HEADING_TAGS = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);

function textOf(node: HastNode): string {
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(textOf).join("");
}

/**
 * Setzt die `id` jeder Überschrift und sammelt H2/H3 fürs Inhaltsverzeichnis.
 * Muss vor `rehype-autolink-headings` laufen, das die ids voraussetzt.
 */
function rehypeHeadingIds(collect: Heading[]) {
  return () => (tree: HastNode) => {
    const slugOf = createSlugger();
    const walk = (node: HastNode): void => {
      for (const child of node.children ?? []) {
        if (child.type === "element" && child.tagName && HEADING_TAGS.has(child.tagName)) {
          const text = textOf(child).trim();
          const slug = slugOf(text);
          child.properties = { ...child.properties, id: slug };
          // H1 bis H6 laufen durch den Slugger, damit die Durchnummerierung
          // der Dubletten dieselbe ist wie im gerenderten Dokument. Ins
          // Verzeichnis kommen trotzdem nur H2 und H3.
          const depth = Number(child.tagName.slice(1));
          if (depth === 2 || depth === 3) collect.push({ depth, text, slug });
          continue;
        }
        walk(child);
      }
    };
    walk(tree);
  };
}

/**
 * Kompiliert MDX-Source zu React-Elementen (RSC-fähig) und liefert die
 * Überschriften desselben Durchlaufs mit.
 */
export async function renderMDX(source: string) {
  const headings: Heading[] = [];
  const { content } = await compileMDX({
    source,
    components: mdxComponents,
    options: {
      parseFrontmatter: false, // wir parsen das selbst via gray-matter
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeHeadingIds(headings),
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
  return { content, headings };
}
