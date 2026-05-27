import Link from "next/link";

// Globals importieren, damit die unten verwendeten Klassen verfügbar sind
// (diese Page liegt außerhalb von /[locale]/ und nutzt nicht das Locale-Layout).
import "@/styles/globals.css";

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
          <h1 className="notfound-page-title">404 — Seite nicht gefunden</h1>
          <p className="notfound-page-text">Die angeforderte Seite existiert nicht.</p>
          <Link href="/de" className="notfound-page-link">
            Zur Startseite
          </Link>
        </div>
      </body>
    </html>
  );
}
