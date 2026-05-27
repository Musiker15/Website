import Link from "next/link";
import Image from "next/image";
import { Github } from "lucide-react";
import { Navbar } from "./Navbar";
import { MobileMenu } from "./MobileMenu";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { SearchTrigger } from "@/components/search/SearchTrigger";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site.config";
import { navigationConfig } from "@/config/navigation.config";
import type { Locale } from "@/types/config";

interface HeaderProps {
  locale: Locale;
}

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  github: Github,
};

export function Header({ locale }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-background)]/85 backdrop-blur-md supports-[backdrop-filter]:bg-[var(--color-background)]/70">
      {/* Volle Browserbreite — nur leichtes Edge-Padding für Atmungsfreiheit */}
      <div className="flex h-16 w-full items-center gap-4 px-4 md:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 font-semibold tracking-tight transition-opacity hover:opacity-80"
          aria-label={siteConfig.name}
        >
          <Image
            src="/logo.png"
            alt=""
            width={32}
            height={32}
            priority
            className="h-6 w-6 object-contain"
          />
          <span className="hidden text-base sm:inline">{siteConfig.name}</span>
        </Link>

        {/* Desktop-Navigation */}
        <div className="flex-1">
          <Navbar locale={locale} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {navigationConfig.actions.map((action, i) => {
            if (action.type === "search") return <SearchTrigger key={i} />;
            if (action.type === "locale") return <LocaleSwitcher key={i} />;
            if (action.type === "theme") return <ThemeToggle key={i} />;
            if (action.type === "link") {
              const Icon = action.icon ? ICONS[action.icon] : null;
              return (
                <Button
                  key={i}
                  asChild
                  variant="ghost"
                  size="icon"
                  aria-label={action["aria-label"] ?? action.label}
                >
                  <a href={action.href} target="_blank" rel="noopener noreferrer">
                    {Icon ? <Icon className="h-4 w-4" /> : <span>{action.label}</span>}
                  </a>
                </Button>
              );
            }
            return null;
          })}
          <MobileMenu locale={locale} />
        </div>
      </div>
    </header>
  );
}

