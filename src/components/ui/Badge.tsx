import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "primary" | "outline" | "quiet" | "success" | "warning" | "danger";

/**
 * Kontrast-Hinweis: die gefüllten Varianten liegen auf den 700er-Stufen der
 * Semantikfarben, im Dark-Mode auf den hellen Stufen mit dunkler Schrift.
 * Die früheren 500er-Werte (#f59e0b mit Weiß = 2,1:1) haben WCAG AA klar
 * verfehlt, waren also als Textträger unbrauchbar.
 */
const variants: Record<Variant, string> = {
  default: "bg-[var(--color-muted)] text-[var(--color-foreground)]",
  primary: "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]",
  outline: "border border-[var(--color-border-strong)] text-[var(--color-muted-foreground)]",
  quiet: "bg-[var(--color-primary-quiet)] text-[var(--color-primary)]",
  success: "bg-[var(--color-success)] text-[var(--color-success-foreground)]",
  warning: "bg-[var(--color-warning)] text-[var(--color-warning-foreground)]",
  danger: "bg-[var(--color-danger)] text-[var(--color-danger-foreground)]",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { className, variant = "default", ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
});
