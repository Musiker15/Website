"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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

      <div className="absolute top-full left-0 flex justify-center">
        {/* `ui-pop` in globals.css ersetzt die früheren `animate-in`-Klassen.
            Die stammen aus dem Plugin `tailwindcss-animate`, das hier nie
            installiert war: das Menü erschien also völlig übergangslos. */}
        <NavigationMenu.Viewport
          className={cn(
            "ui-pop relative mt-2 h-[var(--radix-navigation-menu-viewport-height)] w-[var(--radix-navigation-menu-viewport-width)]",
            "origin-top overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--shadow-floating)]",
          )}
        />
      </div>
    </NavigationMenu.Root>
  );
}

function NavbarItem({ item, locale }: { item: NavItem; locale: Locale }) {
  const pathname = usePathname();
  const router = useRouter();
  const localizedHref = item.external
    ? item.href
    : `/${locale}${item.href === "/" ? "" : item.href}`;
  const active = isActive(pathname, localizedHref);
  const label = t(item.label, locale);

  if (item.children && item.children.length > 0) {
    return (
      <NavigationMenu.Item>
        <NavigationMenu.Trigger
          onClick={(e) => {
            // Echter Mausklick (detail > 0) → zur Übersichtsseite navigieren.
            // Tastatur-Aktivierung (detail === 0) bleibt dem Radix-Dropdown
            // überlassen, Hover öffnet das Menü ohnehin.
            if (e.detail > 0) {
              e.preventDefault();
              router.push(localizedHref);
            }
          }}
          className={cn(
            "group flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium",
            "transition-[background-color,color] duration-[var(--duration-hover)] ease-[var(--ease-out)]",
            "hover:bg-[var(--color-muted)]",
            "focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:outline-none",
            active
              ? "bg-[var(--color-primary-quiet)] text-[var(--color-primary)]"
              : "text-[var(--color-foreground)]",
          )}
        >
          {label}
          <ChevronDown
            className="h-3 w-3 transition-transform duration-[var(--duration-pop)] ease-[var(--ease-out)] group-data-[state=open]:rotate-180"
            aria-hidden
          />
        </NavigationMenu.Trigger>
        <NavigationMenu.Content className="absolute top-0 left-0 w-full md:w-auto">
          <ul className="grid w-[28rem] gap-1 p-3 md:grid-cols-2">
            {item.children.map((child) => (
              <li key={child.href}>
                <NavigationMenu.Link asChild>
                  <Link
                    href={`/${locale}${child.href === "/" ? "" : child.href}`}
                    className="block rounded-md p-3 transition-colors duration-[var(--duration-hover)] ease-[var(--ease-out)] select-none hover:bg-[var(--color-muted)] focus:bg-[var(--color-muted)]"
                  >
                    <div className="text-sm font-medium">{t(child.label, locale)}</div>
                    {child.description && (
                      <p className="mt-1 text-xs leading-relaxed text-[var(--color-muted-foreground)]">
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
            "rounded-md px-3 py-2 text-sm font-medium",
            "transition-[background-color,color] duration-[var(--duration-hover)] ease-[var(--ease-out)]",
            "focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:outline-none",
            item.highlight
              ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary-hover)]"
              : active
                ? "bg-[var(--color-primary-quiet)] text-[var(--color-primary)] hover:bg-[var(--color-primary-quiet)]"
                : "text-[var(--color-foreground)] hover:bg-[var(--color-muted)]",
          )}
        >
          {label}
        </Link>
      </NavigationMenu.Link>
    </NavigationMenu.Item>
  );
}

/**
 * Bestimmt, ob ein Nav-Link aktuell aktiv ist.
 *
 * - **Home/Locale-Root** (z. B. `/de`, `/en`): nur aktiv, wenn der Pfad exakt
 *   diesem Root entspricht. Sonst wäre er auf jeder Unterseite mit-aktiv,
 *   weil `"/de/community".startsWith("/de")` true ist.
 * - **Sub-Routen** (z. B. `/de/docs`): aktiv, wenn der Pfad gleich ist oder
 *   mit `<href>/` weitergeht. So matcht `/de/docs` auch `/de/docs/certbot`,
 *   aber `/de/news` matcht NICHT `/de/news-foo` (Wort-Boundary).
 */
function isActive(pathname: string, href: string): boolean {
  // Locale-Root erkennen — zwei-Zeichen-Locale wie /de oder /en
  const isLocaleRoot = /^\/[a-z]{2}$/.test(href);
  if (isLocaleRoot) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
