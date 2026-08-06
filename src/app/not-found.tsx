import Link from "next/link";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";

// Globals importieren, damit die unten verwendeten Klassen verfügbar sind
// (diese Page liegt außerhalb von /[locale]/ und nutzt nicht das Locale-Layout).
import "@/styles/globals.css";

/**
 * Diese Route liegt außerhalb von `/[locale]/` und erbt deshalb NICHTS aus dem
 * Locale-Layout, auch nicht dessen `metadataBase`. Ohne den Wert hier baut Next
 * die absoluten og:-URLs aus dem Origin des Prozesses und schreibt
 * `http://localhost:3101/opengraph-image` in die 404-Seite.
 *
 * `noindex` dazu, damit eine 404 nicht doch im Index landet, falls irgendwo ein
 * toter Link darauf zeigt.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: "404: Seite nicht gefunden",
  robots: { index: false, follow: false },
};

/**
 * Root not-found für Pfade außerhalb von /[locale]/…
 * Leitet den Nutzer auf die deutsche Startseite.
 *
 * Inline-styles wurden in CSS-Klassen extrahiert (globals.css), damit die
 * strikte CSP ohne `style-src 'unsafe-inline'` auskommt.
 */
export default function NotFound() {
  return (
    <html lang="de">
      <body className="notfound-page-body">
        <div className="notfound-page-content">
          <h1 className="notfound-page-title">404: Seite nicht gefunden</h1>
          <p className="notfound-page-text">Die angeforderte Seite existiert nicht.</p>
          <Link href="/de" className="notfound-page-link">
            Zur Startseite
          </Link>
        </div>
      </body>
    </html>
  );
}
