import { describe, it, expect } from "vitest";
import { buildLlmsTxt } from "./llms";
import { listAllContentItems, listNews } from "./content";
import { siteConfig } from "@/config/site.config";

describe("buildLlmsTxt", () => {
  const text = buildLlmsTxt();

  it("opens with the site name and its description, as the format asks", () => {
    const [title, blank, summary] = text.split("\n");

    expect(title).toBe(`# ${siteConfig.name}`);
    expect(blank).toBe("");
    expect(summary).toBe(`> ${siteConfig.description.de}`);
  });

  // The reason the file is generated at all: a tutorial that exists and is
  // missing here would be the drift a hand-kept file runs into.
  it("links every German tutorial, news entry and page exactly once", () => {
    const items = [
      ...listAllContentItems("docs", "de"),
      ...listNews("de"),
      ...listAllContentItems("pages", "de"),
    ];

    expect(items.length).toBeGreaterThan(10);
    for (const item of items) {
      const link = `](${siteConfig.url}${item.url})`;
      expect(text.split(link).length - 1, item.url).toBe(1);
    }
  });

  it("keeps the legal pages out of the main sections", () => {
    const optional = text.slice(text.indexOf("## Optional"));

    expect(optional).toContain("/de/impressum)");
    expect(optional).toContain("/de/datenschutz)");
    expect(text.slice(0, text.indexOf("## Optional"))).not.toContain("/de/impressum)");
  });

  it("carries no dash that the text conventions rule out", () => {
    expect(text).not.toMatch(/[–—]/);
  });

  it("ends with a single newline and has no empty section", () => {
    expect(text.endsWith("\n")).toBe(true);
    expect(text.endsWith("\n\n")).toBe(false);
    expect(text).not.toMatch(/## [^\n]+\n\n## /);
  });
});
