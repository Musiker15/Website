import { Slot } from "@radix-ui/react-slot";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "link";
type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

/**
 * Hover verändert die Farbe, nicht die Deckkraft.
 *
 * Vorher stand hier `hover:opacity-90` bei gleichzeitigem `transition-colors`.
 * Die Übergangsliste enthielt `opacity` nicht, der Hover sprang also hart um.
 * Jede Variante hat jetzt einen eigenen Hover-Ton, und der steht in derselben
 * Übergangsliste wie die Farbe selbst.
 */
const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] shadow-[var(--shadow-raised)] hover:bg-[var(--color-primary-hover)]",
  secondary:
    "bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] hover:bg-[var(--color-muted)]",
  outline:
    "border border-[var(--color-border-strong)] bg-transparent text-[var(--color-foreground)] hover:border-[var(--color-primary-line)] hover:bg-[var(--color-primary-quiet)] hover:text-[var(--color-primary)]",
  ghost: "bg-transparent text-[var(--color-foreground)] hover:bg-[var(--color-muted)]",
  link: "bg-transparent p-0 text-[var(--color-primary)] underline-offset-4 hover:underline",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-md",
  md: "h-10 px-4 text-sm gap-2 rounded-md",
  lg: "h-11 px-5 text-[0.9375rem] gap-2 rounded-md",
  icon: "h-10 w-10 rounded-md",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", asChild = false, className, ...props },
  ref,
) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      className={cn(
        "relative inline-flex items-center justify-center font-medium",
        // Nur die Eigenschaften, die sich wirklich ändern. `transition-all`
        // animiert unter anderem Layoutwerte und kostet Frames ohne Gegenwert.
        "transition-[background-color,border-color,color,transform,box-shadow] duration-[var(--duration-hover)] ease-[var(--ease-out)]",
        // Rückmeldung beim Drücken. Ohne sie fühlt sich eine Schaltfläche an,
        // als hätte die Oberfläche den Klick nicht bemerkt.
        "active:scale-[0.97] active:duration-[var(--duration-press)]",
        "focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] focus-visible:outline-none",
        "disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
});
