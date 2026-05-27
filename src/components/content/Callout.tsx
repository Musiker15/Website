import { AlertTriangle, Info, Lightbulb, OctagonAlert, StickyNote } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type CalloutType = "info" | "tip" | "warning" | "danger" | "note";

const config: Record<
  CalloutType,
  { icon: ReactNode; classes: string; labelDe: string; labelEn: string }
> = {
  info: {
    icon: <Info className="h-5 w-5" aria-hidden />,
    classes: "border-[var(--color-info)] bg-[var(--color-info)]/10 text-[var(--color-foreground)]",
    labelDe: "Information",
    labelEn: "Information",
  },
  tip: {
    icon: <Lightbulb className="h-5 w-5" aria-hidden />,
    classes: "border-[var(--color-success)] bg-[var(--color-success)]/10 text-[var(--color-foreground)]",
    labelDe: "Tipp",
    labelEn: "Tip",
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5" aria-hidden />,
    classes: "border-[var(--color-warning)] bg-[var(--color-warning)]/10 text-[var(--color-foreground)]",
    labelDe: "Achtung",
    labelEn: "Warning",
  },
  danger: {
    icon: <OctagonAlert className="h-5 w-5" aria-hidden />,
    classes: "border-[var(--color-danger)] bg-[var(--color-danger)]/10 text-[var(--color-foreground)]",
    labelDe: "Gefahr",
    labelEn: "Danger",
  },
  note: {
    icon: <StickyNote className="h-5 w-5" aria-hidden />,
    classes: "border-[var(--color-border)] bg-[var(--color-muted)] text-[var(--color-foreground)]",
    labelDe: "Hinweis",
    labelEn: "Note",
  },
};

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
}

export function Callout({ type = "info", title, children }: CalloutProps) {
  const c = config[type];
  return (
    <aside
      className={cn(
        "not-prose my-6 flex gap-3 rounded-md border-l-4 p-4",
        c.classes,
      )}
      role="note"
      aria-label={title ?? c.labelDe}
    >
      <span className="flex-shrink-0">{c.icon}</span>
      <div className="flex-1">
        {title && <p className="mb-1 font-semibold">{title}</p>}
        <div className="prose-sm text-[var(--color-foreground)]">{children}</div>
      </div>
    </aside>
  );
}
