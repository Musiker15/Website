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
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          className={cn(
            "z-50 min-w-[10rem] rounded-md border border-[var(--color-border)] bg-[var(--color-background)] p-1 shadow-lg",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0",
          )}
        >
          <ThemeItem icon={<Sun className="h-4 w-4" />} label={t("lightMode")} active={theme === "light"} onSelect={() => setTheme("light")} />
          <ThemeItem icon={<Moon className="h-4 w-4" />} label={t("darkMode")} active={theme === "dark"} onSelect={() => setTheme("dark")} />
          <ThemeItem icon={<Monitor className="h-4 w-4" />} label={t("systemMode")} active={theme === "system"} onSelect={() => setTheme("system")} />
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
        "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
        "hover:bg-[var(--color-muted)] focus:bg-[var(--color-muted)]",
        active && "font-medium text-[var(--color-primary)]",
      )}
    >
      {icon}
      <span>{label}</span>
    </DropdownMenu.Item>
  );
}
