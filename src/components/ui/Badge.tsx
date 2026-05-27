import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "primary" | "outline" | "success" | "warning";

const variants: Record<Variant, string> = {
  default: "bg-[var(--color-muted)] text-[var(--color-foreground)]",
  primary: "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]",
  outline: "border border-[var(--color-border)] text-[var(--color-foreground)]",
  success: "bg-[var(--color-success)] text-[var(--color-success-foreground)]",
  warning: "bg-[var(--color-warning)] text-[var(--color-warning-foreground)]",
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
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
});
