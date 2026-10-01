/**
 * Reads questions and answers out of a Markdown page, for the `FAQPage`
 * structured data.
 *
 * The convention is the one `content/pages/<locale>/faq.md` already follows:
 * an H2 groups questions, an H3 is a question, and everything up to the next
 * H2 or H3 is its answer. The answer comes back as plain text, because that is
 * what schema.org expects in `acceptedAnswer.text`.
 *
 * It works on the raw Markdown rather than on the rendered tree. The page is
 * rendered once for the visitor already, and a second pass over a syntax tree
 * only to collect text would cost more than these few rules.
 */

export interface FaqEntry {
  question: string;
  answer: string;
}

const FENCE = /^\s*(```|~~~)/;
const HEADING = /^(#{1,6})\s+(.*?)\s*#*\s*$/;
const TABLE_SEPARATOR = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/;

/** Removes tags such as an MDX component. Repeated until nothing changes, so a
 *  nested fragment cannot leave a tag behind. */
function stripTags(input: string): string {
  let out = input;
  let previous: string;
  do {
    previous = out;
    out = out.replace(/<[^>]*>/g, "");
  } while (out !== previous);
  return out.replace(/[<>]/g, "");
}

/** Inline Markdown to plain text: link text stays, markers go. */
function inlineToText(line: string): string {
  return stripTags(
    line
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/`([^`]*)`/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*\s][^*]*)\*/g, "$1"),
  );
}

/** A table row becomes "first cell: remaining cells", which reads as a sentence. */
function tableRowToText(line: string): string {
  const cells = line
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((cell) => inlineToText(cell).trim())
    .filter((cell) => cell.length > 0);
  if (cells.length < 2) return cells.join("");
  return `${cells[0]}: ${cells.slice(1).join(", ")}`;
}

export function extractFaq(markdown: string): FaqEntry[] {
  const entries: FaqEntry[] = [];
  let question: string | undefined;
  let answer: string[] = [];
  let inFence = false;
  let previousWasTableRow = false;

  const flush = () => {
    if (question !== undefined) {
      const text = answer.join(" ").replace(/\s+/g, " ").trim();
      // A question without an answer is not an entry. Marking it up would
      // promise a search engine something the page does not hold.
      if (text.length > 0) entries.push({ question, answer: text });
    }
    question = undefined;
    answer = [];
  };

  for (const line of markdown.split(/\r?\n/)) {
    if (FENCE.test(line)) {
      inFence = !inFence;
      continue;
    }

    // Inside a code block a leading "#" is a shell comment, not a heading.
    if (inFence) {
      if (question !== undefined) answer.push(line.trim());
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      const level = heading[1]?.length ?? 0;
      if (level <= 3) flush();
      if (level === 3) question = inlineToText(heading[2] ?? "").trim();
      // A deeper heading belongs to the answer it sits in.
      else if (level > 3 && question !== undefined) answer.push(inlineToText(heading[2] ?? ""));
      continue;
    }

    if (question === undefined) continue;

    // The line above a separator is the header row. It names the columns and
    // says nothing on its own, so it goes again.
    if (TABLE_SEPARATOR.test(line)) {
      if (previousWasTableRow) answer.pop();
      previousWasTableRow = false;
      continue;
    }

    previousWasTableRow = line.trim().startsWith("|");
    answer.push(previousWasTableRow ? tableRowToText(line) : inlineToText(line).trim());
  }
  flush();

  return entries;
}
