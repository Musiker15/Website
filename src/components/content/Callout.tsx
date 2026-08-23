import { AlertTriangle, Info, Lightbulb, OctagonAlert, StickyNote } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type CalloutType = "info" | "tip" | "warning" | "danger" | "note";

/**
 * Hinweisblock in Tutorials.
 *
 * Kein dicker Farbbalken an der linken Kante mehr. Der ist die am leichtesten
 * wiedererkennbare Signatur generierter Oberflächen, und er trägt nichts, was
 * Symbol und getönte Fläche nicht schon tragen. Stattdessen umlaufende
 * Haarlinie in der Semantikfarbe, eingefärbtes Symbol, ruhiger Grund.
 *
 * Die Beschriftung kommt aus `messages/{de,en}.json`. Vorher stand hier eine
 * eigene Tabelle mit `labelDe` und `labelEn`, von der nur die deutsche Hälfte
 * benutzt wurde: englische Leser bekamen "Achtung" als Vorlesetext.
 */
const config: Record<CalloutType, { icon: ReactNode; surface: string; accent: string }> = {
  info: {
    icon: <Info className="h-[1.125rem] w-[1.125rem]" aria-hidden />,
    surface:
      "border-[color-mix(in_oklab,var(--color-info)_35%,transparent)] bg-[color-mix(in_oklab,var(--color-info)_7%,transparent)]",
    accent: "text-[var(--color-info)]",
  },
  tip: {
    icon: <Lightbulb className="h-[1.125rem] w-[1.125rem]" aria-hidden />,
    surface:
      "border-[color-mix(in_oklab,var(--color-success)_35%,transparent)] bg-[color-mix(in_oklab,var(--color-success)_7%,transparent)]",
    accent: "text-[var(--color-success)]",
  },
  warning: {
    icon: <AlertTriangle className="h-[1.125rem] w-[1.125rem]" aria-hidden />,
    surface:
      "border-[color-mix(in_oklab,var(--color-warning)_38%,transparent)] bg-[color-mix(in_oklab,var(--color-warning)_8%,transparent)]",
    accent: "text-[var(--color-warning)]",
  },
  danger: {
    icon: <OctagonAlert className="h-[1.125rem] w-[1.125rem]" aria-hidden />,
    surface:
      "border-[color-mix(in_oklab,var(--color-danger)_38%,transparent)] bg-[color-mix(in_oklab,var(--color-danger)_8%,transparent)]",
    accent: "text-[var(--color-danger)]",
  },
  note: {
    icon: <StickyNote className="h-[1.125rem] w-[1.125rem]" aria-hidden />,
    surface: "border-[var(--color-border-strong)] bg-[var(--color-muted)]",
    accent: "text-[var(--color-muted-foreground)]",
  },
};

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
}

export function Callout({ type = "info", title, children }: CalloutProps) {
  const t = useTranslations("callout");
  const c = config[type];
  const label = title ?? t(type);

  return (
    <aside
      className={cn(
        "not-prose my-6 flex gap-3 rounded-md border p-4 text-[var(--color-foreground)]",
        c.surface,
      )}
      role="note"
      aria-label={label}
    >
      <span className={cn("mt-0.5 flex-shrink-0", c.accent)}>{c.icon}</span>
      <div className="min-w-0 flex-1 text-[0.9375rem] leading-relaxed">
        {title && <p className="mb-1 font-semibold">{title}</p>}
        <div className="[&_a]:font-medium [&_a]:text-[var(--color-primary)] [&_a]:underline [&_a]:underline-offset-2 [&_code]:rounded-sm [&_code]:bg-[var(--color-muted)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&>*+*]:mt-3">
          {children}
        </div>
      </div>
    </aside>
  );
}
