import Link from "next/link";
import { Github, ExternalLink } from "lucide-react";
import { siteConfig } from "@/config/site.config";
import { footerConfig } from "@/config/footer.config";
import { cn, t, isExternal } from "@/lib/utils";
import type { Locale } from "@/types/config";

interface FooterProps {
  locale: Locale;
}

export function Footer({ locale }: FooterProps) {
  const year = new Date().getFullYear();
  const copyright = footerConfig.copyright[locale].replace("{year}", String(year));

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-muted)]/30">
      <div className="container-page py-12">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Brand-Spalte */}
          <div className="lg:col-span-1">
            <Link
              href={`/${locale}`}
              className="flex items-center gap-2 font-semibold tracking-tight"
            >
              <span className="text-base">{siteConfig.name}</span>
            </Link>
            <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
              {siteConfig.tagline[locale]}
            </p>
            <p className="mt-4 max-w-xs text-xs text-[var(--color-muted-foreground)]">
              {siteConfig.description[locale]}
            </p>
          </div>

          {/* Link-Spalten */}
          {footerConfig.columns.map((col, i) => (
            <div key={i}>
              <p className="mb-3 text-sm font-semibold">{t(col.title, locale)}</p>
              <ul className="space-y-2 text-sm">
                {col.links.map((link, j) => {
                  const label = t(link.label, locale);
                  const href = link.external || isExternal(link.href)
                    ? link.href
                    : `/${locale}${link.href}`;
                  return (
                    <li key={j}>
                      <Link
                        href={href}
                        target={link.external ? "_blank" : undefined}
                        rel={link.external ? "noopener noreferrer" : undefined}
                        className={cn(
                          "inline-flex items-center gap-1 text-[var(--color-muted-foreground)]",
                          "transition-colors hover:text-[var(--color-foreground)]",
                        )}
                      >
                        {label}
                        {link.external && <ExternalLink className="h-3 w-3 opacity-60" aria-hidden />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom-Bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[var(--color-border)] pt-6 sm:flex-row">
          <p className="text-xs text-[var(--color-muted-foreground)]">{copyright}</p>
          <div className="flex items-center gap-3">
            {footerConfig.social.map((s, i) => (
              <a
                key={i}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label ?? s.platform}
                className="text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--color-foreground)]"
              >
                <SocialIcon platform={s.platform} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ platform }: { platform: string }) {
  if (platform === "github") return <Github className="h-4 w-4" />;
  if (platform === "discord") {
    // Canonical Discord-Marke (simpleicons.org, MIT). Wichtig: alle Arcs/Curves
    // als RELATIVE Kommandos (Kleinbuchstaben) — der vorherige Pfad hatte ein
    // groß geschriebenes `A` direkt nach `M`, was die Geometrie zerstörte.
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden role="img">
        <title>Discord</title>
        <path d="M20.317 4.3698a19.7913 19.7913 0 0 0-4.8851-1.5152.0741.0741 0 0 0-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 0 0-.0785-.037 19.7363 19.7363 0 0 0-4.8852 1.515.0699.0699 0 0 0-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 0 0 .0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 0 0 .0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 0 0-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 0 1-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 0 1 .0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 0 1 .0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 0 1-.0066.1276 12.2986 12.2986 0 0 1-1.873.8914.0766.0766 0 0 0-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 0 0 .0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 0 0 .0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 0 0-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
      </svg>
    );
  }
  if (platform === "mastodon") {
    // Canonical Mastodon-Marke (simpleicons.org, MIT).
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden role="img">
        <title>Mastodon</title>
        <path d="M21.5779 13.9148c-.2706 1.3956-2.4189 2.918-4.8867 3.2128-1.2867.1554-2.5532.298-3.9043.2366-2.2154-.1015-3.9659-.5267-3.9659-.5267 0 .219.0143.4232.0418.6132.2855 2.1827 2.1644 2.3128 3.937 2.3744 1.7872.0596 3.3676-.4413 3.3676-.4413l.0731 1.6248s-1.2422.6627-3.4562.7853c-1.2202.0672-2.7368-.0309-4.504-.5066C2.4598 19.9404 1.7029 15.8417 1.5972 11.6948c-.0344-1.2425-.0153-2.4222-.0153-3.3917 0-4.235 2.7782-5.4773 2.7782-5.4773C5.7732 1.8987 8.1929 1.6741 10.7087 1.6537h.0617c2.5158.0204 4.9355.245 6.3486.8721 0 0 2.7782 1.2424 2.7782 5.4773 0 0 .0344 3.1245-.3392 5.3117M16.6814 6.1336v6.0193h-1.9009v-5.875c0-1.2387-.5212-1.8681-1.5632-1.8681-1.1521 0-1.7298.745-1.7298 2.2186v3.2126H9.6093V6.6284c0-1.4736-.5777-2.2186-1.7298-2.2186-1.042 0-1.5632.6294-1.5632 1.8681v5.875H4.4154V6.1336c0-1.2374.3148-2.221.9484-2.945.6531-.724 1.5111-1.0951 2.5775-1.0951 1.2326 0 2.1652.4736 2.7868 1.4208l.4727.7935.4732-.7935c.6213-.9472 1.5539-1.4208 2.7866-1.4208 1.0666 0 1.9244.371 2.5779 1.0951.6328.724.9469 1.7076.9469 2.945"/>
      </svg>
    );
  }
  return null;
}
