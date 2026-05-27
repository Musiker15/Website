"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CodeBlockProps extends HTMLAttributes<HTMLPreElement> {
  "data-language"?: string;
  "data-theme"?: string;
  raw?: string;
}

/**
 * Custom <pre>-Renderer für rehype-pretty-code mit Copy-Button.
 */
export function CodeBlock({ children, className, raw, ...props }: CodeBlockProps) {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = raw ?? ref.current?.textContent ?? "";
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // Fallback: temporäres Textarea
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
    }
  }

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Code kopieren"
        className={cn(
          "absolute right-2 top-2 z-10 rounded-md border border-[var(--color-border)] bg-[var(--color-background)]/80 p-1.5 text-xs",
          "opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100",
          "hover:bg-[var(--color-muted)]",
        )}
      >
        {copied ? <Check className="h-3.5 w-3.5 text-[var(--color-success)]" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
      <pre ref={ref} className={className} {...props}>
        {children}
      </pre>
    </div>
  );
}
