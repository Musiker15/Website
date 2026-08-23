"use client";

import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CodeBlockProps extends HTMLAttributes<HTMLPreElement> {
  "data-language"?: string;
  "data-theme"?: string;
  raw?: string;
}

/**
 * Eigener <pre>-Renderer für rehype-pretty-code mit Kopier-Knopf.
 *
 * Der Knopf war vorher `opacity-0` und wurde nur über `group-hover` sichtbar.
 * Auf Touchgeräten gibt es kein Hover, dort war er also nie erreichbar,
 * obwohl gerade dort das Markieren von Konsolenbefehlen mühsam ist. Jetzt:
 * dauerhaft sichtbar, und nur auf Geräten mit echtem Zeiger blendet er sich
 * aus, bis der Block unter der Maus liegt.
 */
export function CodeBlock({ children, className, raw, ...props }: CodeBlockProps) {
  const t = useTranslations("common");
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = raw ?? ref.current?.textContent ?? "";
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // Fallback für Kontexte ohne Clipboard-API (kein HTTPS, alter Browser).
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
    const timer = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? t("copied") : t("copyCode")}
        className={cn(
          "absolute top-2 right-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded-md",
          "border border-[var(--color-border)] bg-[var(--color-background)]/85 backdrop-blur-sm",
          "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]",
          "transition-[opacity,color,background-color,transform] duration-[var(--duration-hover)] ease-[var(--ease-out)]",
          "active:scale-[0.92] active:duration-[var(--duration-press)]",
          "hover:bg-[var(--color-muted)] focus-visible:opacity-100",
          // Auf Zeigergeräten zurückhaltend, auf Touch dauerhaft sichtbar.
          "[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:opacity-100",
        )}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-[var(--color-success)]" aria-hidden />
        ) : (
          <Copy className="h-3.5 w-3.5" aria-hidden />
        )}
      </button>
      <pre ref={ref} className={className} {...props}>
        {children}
      </pre>
    </div>
  );
}
