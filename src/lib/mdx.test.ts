import { describe, expect, it } from "vitest";
import { renderMDX } from "./mdx";

/**
 * Der Vertrag, den diese Datei absichert, ist ein einziger Satz: **die `id` an
 * der Überschrift und der Slug im Inhaltsverzeichnis sind derselbe String.**
 *
 * Läuft er auseinander, ändert ein Klick im Verzeichnis die Adresse und die
 * Seite bleibt stehen. Genau das war bis zum 24.08.2026 der Fall, sobald eine
 * Überschrift einen Umlaut oder eine HTML-Entity enthielt: `rehype-slug`
 * vergab die id, eine zweite Funktion baute die Verzeichnis-Slugs aus dem
 * Roh-Markdown, und beide kamen zu unterschiedlichen Ergebnissen.
 *
 * Deshalb prüft der erste Test nicht einzelne Slugs, sondern die Gleichheit.
 * Er hält auch dann, wenn sich die Slug-Regel später ändert.
 */

/** Liest alle `id`-Werte aus dem gerenderten HTML in Dokumentreihenfolge. */
function idsInHtml(html: string): string[] {
  return [...html.matchAll(/<h[1-6][^>]*\sid="([^"]+)"/g)].map((m) => m[1]!);
}

/** Rendert MDX und gibt HTML plus die gesammelten Überschriften zurück. */
async function render(source: string) {
  const { content, headings } = await renderMDX(source);
  const { renderToStaticMarkup } = await import("react-dom/server");
  return { html: renderToStaticMarkup(content), headings };
}

describe("renderMDX", () => {
  it("vergibt an der Überschrift dieselbe id, die im Verzeichnis steht", async () => {
    const { html, headings } = await render(
      [
        "## Voraussetzungen",
        "## Schritt 5: Zielverzeichnis prüfen, bevor Du installierst",
        "### Häufige Fehler",
        "## Social Media &amp; Gaming",
        "## Größe, Maß und Straße",
      ].join("\n\n"),
    );

    const ids = idsInHtml(html);
    expect(ids).toHaveLength(headings.length);
    expect(ids).toEqual(headings.map((h) => h.slug));
  });

  it("transliteriert Umlaute, statt sie wegzuwerfen", async () => {
    const { headings } = await render("## Schritt 5: Zielverzeichnis prüfen\n\n## Größe messen");
    expect(headings.map((h) => h.slug)).toEqual([
      "schritt-5-zielverzeichnis-pruefen",
      "groesse-messen",
    ]);
  });

  it("löst HTML-Entities auf, bevor der Slug entsteht", async () => {
    // Aus `&amp;` wird beim Rendern ein `&`. Würde der Slug aus dem
    // Roh-Markdown gebaut, stünde hier `social-media-amp-gaming`.
    const { html, headings } = await render("## Social Media &amp; Gaming");
    expect(headings[0]!.slug).toBe("social-media-gaming");
    expect(idsInHtml(html)).toEqual(["social-media-gaming"]);
  });

  it("nummeriert doppelte Überschriften durch, in beiden Richtungen gleich", async () => {
    const { html, headings } = await render(["## Prüfen", "## Prüfen", "### Prüfen"].join("\n\n"));
    expect(headings.map((h) => h.slug)).toEqual(["pruefen", "pruefen-1", "pruefen-2"]);
    expect(idsInHtml(html)).toEqual(headings.map((h) => h.slug));
  });

  it("zählt H1 bei der Nummerierung mit, nimmt es aber nicht ins Verzeichnis", async () => {
    // Sonst bekämen H1 und H2 mit gleichem Text denselben Slug, und der Sprung
    // landete auf der falschen Überschrift.
    const { html, headings } = await render("# Prüfen\n\n## Prüfen");
    expect(headings.map((h) => h.depth)).toEqual([2]);
    expect(headings[0]!.slug).toBe("pruefen-1");
    expect(idsInHtml(html)).toEqual(["pruefen", "pruefen-1"]);
  });

  it("nimmt nur H2 und H3 ins Verzeichnis auf", async () => {
    const { headings } = await render(
      ["# Titel", "## Zwei", "### Drei", "#### Vier", "##### Fuenf"].join("\n\n"),
    );
    expect(headings.map((h) => [h.depth, h.text])).toEqual([
      [2, "Zwei"],
      [3, "Drei"],
    ]);
  });

  it("lässt Überschriften in Codeblöcken unangetastet", async () => {
    // Hier bewusst ohne `render`: ein Codeblock zieht die Client-Komponente
    // `CodeBlock` herein, die next-intl-Kontext braucht. Geprüft wird die
    // Überschriften-Erfassung, nicht das Markup.
    const { headings } = await renderMDX(
      ["## Echt", "```bash", "# kein Titel, ein Kommentar", "## auch nicht", "```"].join("\n"),
    );
    expect(headings.map((h) => h.text)).toEqual(["Echt"]);
  });

  it("gibt einen Ersatz-Slug aus, wenn nichts Verwertbares übrig bleibt", async () => {
    const { html, headings } = await render("## ---");
    expect(headings[0]!.slug).toBe("abschnitt");
    expect(idsInHtml(html)).toEqual(["abschnitt"]);
  });
});
