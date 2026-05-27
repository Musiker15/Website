"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { DocTreeNode } from "@/types/content";
import { cn } from "@/lib/utils";

interface Props {
  tree: DocTreeNode[];
}

export function DocSidebar({ tree }: Props) {
  return (
    <nav aria-label="Dokumentation" className="text-sm">
      <ul className="space-y-1">
        {tree.map((node) => (
          <TreeNode key={node.name} node={node} depth={0} />
        ))}
      </ul>
    </nav>
  );
}

function TreeNode({ node, depth }: { node: DocTreeNode; depth: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  if (node.type === "folder") {
    return (
      <li>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "flex w-full items-center gap-1 rounded px-2 py-1.5 text-left font-semibold text-[var(--color-foreground)]",
            "hover:bg-[var(--color-muted)]",
          )}
        >
          {open ? (
            <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
          )}
          <span>{node.label}</span>
        </button>
        {open && node.children && (
          <ul className={cn("ml-3 mt-1 space-y-0.5 border-l border-[var(--color-border)] pl-2")}>
            {node.children.map((child) => (
              <TreeNode key={child.name} node={child} depth={depth + 1} />
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
        className={cn(
          "block rounded px-2 py-1.5 transition-colors",
          active
            ? "bg-[var(--color-muted)] font-medium text-[var(--color-primary)]"
            : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]",
        )}
      >
        {node.label}
      </Link>
    </li>
  );
}
