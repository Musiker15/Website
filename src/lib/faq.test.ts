import { describe, it, expect } from "vitest";
import { extractFaq } from "./faq";
import { getContent } from "./content";
import { SUPPORTED_LOCALES } from "@/types/config";

describe("extractFaq", () => {
  it("takes each H3 as a question and the text below it as the answer", () => {
    const entries = extractFaq(
      [
        "## Group",
        "",
        "### First question?",
        "",
        "First answer.",
        "",
        "### Second?",
        "Second.",
      ].join("\n"),
    );

    expect(entries).toEqual([
      { question: "First question?", answer: "First answer." },
      { question: "Second?", answer: "Second." },
    ]);
  });

  it("ends an answer at the next H2, so a group heading never leaks into it", () => {
    const entries = extractFaq(["### Q?", "A.", "## Next group", "Intro of the group."].join("\n"));

    expect(entries).toEqual([{ question: "Q?", answer: "A." }]);
  });

  it("keeps link text and drops the markers of inline Markdown", () => {
    const [entry] = extractFaq(
      ["### Where?", "See [the docs](https://example.org), **here**, in `apt`."].join("\n"),
    );

    expect(entry?.answer).toBe("See the docs, here, in apt.");
  });

  it("does not read a shell comment in a code block as a heading", () => {
    const entries = extractFaq(
      ["### How?", "Run this:", "```bash", "# update first", "apt update", "```", "Done."].join(
        "\n",
      ),
    );

    expect(entries).toHaveLength(1);
    expect(entries[0]?.answer).toBe("Run this: # update first apt update Done.");
  });

  it("leaves an underscore inside a file name alone", () => {
    const [entry] = extractFaq(
      ["### Which file?", "Copy `libsoundbot_plugin.so` over."].join("\n"),
    );

    expect(entry?.answer).toBe("Copy libsoundbot_plugin.so over.");
  });

  it("turns a table into one sentence per row, without header and separator", () => {
    const [entry] = extractFaq(
      [
        "### What?",
        "Rule of thumb:",
        "| Use | Size |",
        "| --- | --- |",
        "| Static site | 1 vCPU, 1 GB |",
        "| LAMP | 2 GB |",
      ].join("\n"),
    );

    expect(entry?.answer).toBe("Rule of thumb: Static site: 1 vCPU, 1 GB LAMP: 2 GB");
  });

  it("drops a question that has no answer", () => {
    expect(extractFaq(["### Empty?", "", "### Full?", "Yes."].join("\n"))).toEqual([
      { question: "Full?", answer: "Yes." },
    ]);
  });

  it("removes tags, so nothing in an answer can close the script element it ends up in", () => {
    const [entry] = extractFaq(["### Safe?", "<Callout>Yes</Callout> </script>"].join("\n"));

    expect(entry?.answer).toBe("Yes");
  });
});

// The real pages. A FAQ page that is flagged but yields no entries would ship
// an empty FAQPage node, and nothing but this test would notice.
describe("the FAQ pages", () => {
  it.each(SUPPORTED_LOCALES)("%s: is flagged and yields questions with answers", (locale) => {
    const page = getContent("pages", locale, ["faq"]);

    expect(page?.frontmatter.faq).toBe(true);
    const entries = extractFaq(page?.content ?? "");
    expect(entries.length).toBeGreaterThan(5);
    for (const entry of entries) {
      expect(entry.question.length).toBeGreaterThan(0);
      expect(entry.answer.length).toBeGreaterThan(0);
      expect(entry.answer).not.toMatch(/[<>`]|\*\*/);
    }
  });
});
