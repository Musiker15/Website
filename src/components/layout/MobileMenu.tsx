"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronDown, Menu, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/Button";
import { navigationConfig } from "@/config/navigation.config";
import { cn, t } from "@/lib/utils";
import type { Locale, NavItem } from "@/types/config";

interface Props {
  locale: Locale;
}

export function MobileMenu({ locale }: Props) {
  const tr = useTranslations("common");
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="ghost" size="icon" aria-label={tr("menu")} className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <Dialog.Content
          className={cn(
            "fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-[var(--color-background)] shadow-xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
          )}
        >
          <div className="flex items-center justify-between border-b border-[var(--color-border)] p-4">
            <Dialog.Title className="font-semibold">{tr("menu")}</Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label={tr("close")}>
                <X className="h-5 w-5" />
              </Button>
            </Dialog.Close>
          </div>
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {navigationConfig.primary.map((item) => (
                <MobileItem
                  key={item.href}
                  item={item}
                  locale={locale}
                  pathname={pathname}
                  onNavigate={() => setOpen(false)}
                />
              ))}
            </ul>
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function MobileItem({
  item,
  locale,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  locale: Locale;
  pathname: string;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const href = `/${locale}${item.href === "/" ? "" : item.href}`;
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <li>
      {hasChildren ? (
        <>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={cn(
              "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium",
              "hover:bg-[var(--color-muted)]",
              active && "text-[var(--color-primary)]",
            )}
          >
            <span>{t(item.label, locale)}</span>
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
              aria-hidden
            />
          </button>
          {open && (
            <ul className="ml-3 mt-1 space-y-0.5 border-l border-[var(--color-border)] pl-3">
              {item.children!.map((child) => (
                <li key={child.href}>
                  <Link
                    href={`/${locale}${child.href}`}
                    onClick={onNavigate}
                    className="block rounded-md px-3 py-1.5 text-sm text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                  >
                    {t(child.label, locale)}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <Link
          href={href}
          onClick={onNavigate}
          className={cn(
            "block rounded-md px-3 py-2 text-sm font-medium",
            "hover:bg-[var(--color-muted)]",
            item.highlight
              ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
              : active
                ? "text-[var(--color-primary)]"
                : "text-[var(--color-foreground)]",
          )}
        >
          {t(item.label, locale)}
        </Link>
      )}
    </li>
  );
}
