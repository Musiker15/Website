import { siteConfig } from "@/config/site.config";
import { listNews } from "@/lib/content";
import { SUPPORTED_LOCALES, type Locale } from "@/types/config";

/**
 * RSS-2.0-Feed pro Sprache unter /[locale]/news/feed.xml
 *
 * Zweck ist Auffindbarkeit außerhalb der Suchmaschine: Feed-Reader, Aggregatoren
 * und Planet-artige Sammelseiten für Linux-Themen ziehen Beiträge darüber ein,
 * und jeder dieser Einträge ist ein Rückverweis auf die Seite.
 */

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

/** Escaped die fünf XML-Sonderzeichen. Titel enthalten Apostrophe und Ampersands. */
function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!SUPPORTED_LOCALES.includes(locale as Locale)) {
    return new Response("Not found", { status: 404 });
  }
  const l = locale as Locale;

  const items = listNews(l);
  const feedUrl = `${siteConfig.url}/${l}/news/feed.xml`;
  const newest = items[0]?.frontmatter.date ?? items[0]?.modifiedAt;

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(`${siteConfig.name} | ${siteConfig.tagline[l]}`)}</title>
    <link>${siteConfig.url}/${l}/news</link>
    <description>${xmlEscape(siteConfig.description[l])}</description>
    <language>${l === "de" ? "de-DE" : "en-US"}</language>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
${newest ? `    <lastBuildDate>${newest.toUTCString()}</lastBuildDate>\n` : ""}${items
    .map((item) => {
      const url = `${siteConfig.url}${item.url}`;
      const date = item.frontmatter.date ?? item.modifiedAt;
      return `    <item>
      <title>${xmlEscape(item.frontmatter.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${date.toUTCString()}</pubDate>
${item.frontmatter.description ? `      <description>${xmlEscape(item.frontmatter.description)}</description>\n` : ""}${
        item.frontmatter.author
          ? `      <author>${xmlEscape(item.frontmatter.author)}</author>\n`
          : ""
      }    </item>`;
    })
    .join("\n")}
  </channel>
</rss>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      // Eine Stunde Cache: der Feed ändert sich nur beim Deploy, aber ein
      // Reader, der im Minutentakt pollt, soll den Node-Prozess nicht belasten.
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
