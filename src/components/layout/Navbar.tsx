"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { navigationConfig } from "@/config/navigation.config";
import { cn, t } from "@/lib/utils";
import type { Locale, NavItem } from "@/types/config";

interface NavbarProps {
  locale: Locale;
}

export function Navbar({ locale }: NavbarProps) {
  return (
    <NavigationMenu.Root className="relative hidden lg:block">
      <NavigationMenu.List className="flex items-center gap-1">
        {navigationConfig.primary.map((item) => (
          <NavbarItem key={item.href} item={item} locale={locale} />
        ))}
      </NavigationMenu.List>

      <div className="absolute left-0 top-full flex justify-center">
        <NavigationMenu.Viewport
          className={cn(
            "relative mt-2 h-[var(--radix-navigation-menu-viewport-height)] w-[var(--radix-navigation-menu-viewport-width)]",
            "origin-top overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-background)] shadow-lg",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
          )}
        />
      </div>
    </NavigationMenu.Root>
  );
}

function NavbarItem({ item, locale }: { item: NavItem; locale: Locale }) {
  const pathname = usePathname();
  const localizedHref = item.external ? item.href : `/${locale}${item.href === "/" ? "" : item.href}`;
  const active = isActive(pathname, localizedHref);
  const label = t(item.label, locale);

  if (item.children && item.children.length > 0) {
    return (
      <NavigationMenu.Item>
        <NavigationMenu.Trigger
          className={cn(
            "group flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            "hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]",
            active ? "text-[var(--color-primary)]" : "text-[var(--color-foreground)]",
          )}
        >
          {label}
          <ChevronDown
            className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180"
            aria-hidden
          />
        </NavigationMenu.Trigger>
        <NavigationMenu.Content className="absolute left-0 top-0 w-full md:w-auto">
          <ul className="grid w-[28rem] gap-1 p-3 md:grid-cols-2">
            {item.children.map((child) => (
              <li key={child.href}>
                <NavigationMenu.Link asChild>
                  <Link
                    href={`/${locale}${child.href === "/" ? "" : child.href}`}
                    className="block select-none space-y-0.5 rounded-md p-3 leading-none transition-colors hover:bg-[var(--color-muted)] focus:bg-[var(--color-muted)]"
                  >
                    <div className="text-sm font-medium">{t(child.label, locale)}</div>
                    {child.description && (
                      <p className="text-xs text-[var(--color-muted-foreground)]">
                        {t(child.description, locale)}
                      </p>
                    )}
                  </Link>
                </NavigationMenu.Link>
              </li>
            ))}
          </ul>
        </NavigationMenu.Content>
      </NavigationMenu.Item>
    );
  }

  return (
    <NavigationMenu.Item>
      <NavigationMenu.Link asChild active={active}>
        <Link
          href={localizedHref}
          target={item.external ? "_blank" : undefined}
          rel={item.external ? "noopener noreferrer" : undefined}
          className={cn(
            "rounded-md px-3 py-2 text-sm font-medium transition-colors",
            "hover:bg-[var(--color-muted)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]",
            item.highlight
              ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90 hover:bg-[var(--color-primary)]"
              : active
                ? "text-[var(--color-primary)]"
                : "text-[var(--color-foreground)]",
          )}
        >
          {label}
        </Link>
      </NavigationMenu.Link>
    </NavigationMenu.Item>
  );
}

function isActive(pathname: string, href: string): boolean {
  if (href === `/${pathname.split("/")[1] ?? ""}` && pathname.split("/").length <= 2) {
    return pathname === href;
  }
  return pathname.startsWith(href);
}
