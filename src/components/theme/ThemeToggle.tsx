"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Monitor, Moon, Sun } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const t = useTranslations("common");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-label={t("theme")}>
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" size="icon" aria-label={t("theme")}>
          {/* Zwei Symbole, die sich am Platz ablösen. Bewusst nicht von
              `scale-0` aus: nichts in der Wahrnehmung entsteht aus dem Nichts,
              ein Rest an Form macht den Wechsel weicher. */}
          <Sun className="h-4 w-4 scale-100 rotate-0 opacity-100 transition-[transform,opacity] duration-[var(--duration-pop)] ease-[var(--ease-out)] dark:scale-50 dark:-rotate-90 dark:opacity-0" />
          <Moon className="absolute h-4 w-4 scale-50 rotate-90 opacity-0 transition-[transform,opacity] duration-[var(--duration-pop)] ease-[var(--ease-out)] dark:scale-100 dark:rotate-0 dark:opacity-100" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          className="ui-pop z-50 min-w-[10rem] rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-1 shadow-[var(--shadow-floating)]"
        >
          <ThemeItem
            icon={<Sun className="h-4 w-4" />}
            label={t("lightMode")}
            active={theme === "light"}
            onSelect={() => setTheme("light")}
          />
          <ThemeItem
            icon={<Moon className="h-4 w-4" />}
            label={t("darkMode")}
            active={theme === "dark"}
            onSelect={() => setTheme("dark")}
          />
          <ThemeItem
            icon={<Monitor className="h-4 w-4" />}
            label={t("systemMode")}
            active={theme === "system"}
            onSelect={() => setTheme("system")}
          />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function ThemeItem({
  icon,
  label,
  active,
  onSelect,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <DropdownMenu.Item
      onSelect={onSelect}
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none",
        "transition-colors duration-[var(--duration-hover)]",
        "hover:bg-[var(--color-muted)] focus:bg-[var(--color-muted)]",
        active && "font-medium text-[var(--color-primary)]",
      )}
    >
      {icon}
      <span>{label}</span>
    </DropdownMenu.Item>
  );
}
