"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import type { DocTreeNode } from "@/types/content";
import { cn } from "@/lib/utils";

interface Props {
  tree: DocTreeNode[];
  /** Ohne Rahmen-Label, wenn die Navigation bereits in einem `nav` steckt. */
  bare?: boolean;
}

export function DocSidebar({ tree, bare = false }: Props) {
  const t = useTranslations("docs");

  const list = (
    <ul className="space-y-0.5">
      {tree.map((node) => (
        <TreeNode key={node.name} node={node} />
      ))}
    </ul>
  );

  if (bare) return list;

  return (
    <nav aria-label={t("sidebarLabel")} className="text-sm">
      {list}
    </nav>
  );
}

function TreeNode({ node }: { node: DocTreeNode }) {
  const t = useTranslations("common");
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  if (node.type === "folder") {
    const folderActive = pathname === node.href;
    return (
      <li>
        <div
          className={cn(
            "flex items-center rounded-md transition-colors duration-[var(--duration-hover)]",
            folderActive ? "text-[var(--color-primary)]" : "text-[var(--color-foreground)]",
          )}
        >
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? t("collapse") : t("expand")}
            aria-expanded={open}
            className="flex-shrink-0 rounded-md p-1.5 text-[var(--color-muted-foreground)] transition-colors duration-[var(--duration-hover)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
          >
            <ChevronRight
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-[var(--duration-pop)] ease-[var(--ease-out)]",
                open && "rotate-90",
              )}
              aria-hidden
            />
          </button>
          {node.href ? (
            <Link
              href={node.href}
              className="flex-1 rounded-md px-2 py-1.5 font-semibold transition-colors duration-[var(--duration-hover)] hover:bg-[var(--color-muted)]"
            >
              {node.label}
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex-1 rounded-md px-2 py-1.5 text-left font-semibold transition-colors duration-[var(--duration-hover)] hover:bg-[var(--color-muted)]"
            >
              {node.label}
            </button>
          )}
        </div>
        {open && node.children && (
          <ul className="mt-0.5 ml-[0.9375rem] space-y-0.5 border-l border-[var(--color-border)] pl-2">
            {node.children.map((child) => (
              <TreeNode key={child.name} node={child} />
            ))}
          </ul>
        )}
      </li>
    );
  }

  const active = pathname === node.href;
  return (
    <li>
      <Link
        href={node.href ?? "#"}
        aria-current={active ? "page" : undefined}
        className={cn(
          "block rounded-md px-2 py-1.5 transition-colors duration-[var(--duration-hover)] ease-[var(--ease-out)]",
          active
            ? "bg-[var(--color-primary-quiet)] font-medium text-[var(--color-primary)]"
            : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]",
        )}
      >
        {node.label}
      </Link>
    </li>
  );
}
