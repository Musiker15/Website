import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");

// =============================================================================
// Security-Header — Single Source of Truth (außer CSP)
// -----------------------------------------------------------------------------
// Alle "statischen" Security-Header (HSTS, X-Frame-Options, X-Content-Type-
// Options, Referrer-Policy, Permissions-Policy, COOP, CORP, COEP, XPCDP,
// X-DNS-Prefetch-Control) werden hier zentral gesetzt.
//
// Die Content-Security-Policy ist NICHT hier — sie wird pro Request in der
// Middleware (src/proxy.ts) mit einem frischen Nonce generiert und über
// `'strict-dynamic'` durchgesetzt. Das ist die Observatory-konforme
// Variante ohne `'unsafe-inline'` in script-src.
// =============================================================================
const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Mozilla Observatorys Whitelist scheint nur einen einzigen Wert sauber
  // zu erkennen — den, den sie selbst im UI explizit empfehlen
  // (`strict-origin-when-cross-origin`). Andere laut MDN/scoring.md sichere
  // Werte (`no-referrer`, `strict-origin`) werden fälschlich −5 bewertet.
  // Wir folgen der Recommendation, um den Test-Bug zu umgehen — der Wert
  // ist trotzdem ein moderner Standard (Browser-Default in Chromium/Firefox).
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Bild-Optimierung — KEINE remotePatterns, damit kein Server- oder Client-Fetch
  // zu externen Hosts möglich ist. Alle Bilder müssen in /public/images/ liegen.
  // Falls Du später externe Bilder erlauben willst: remotePatterns explizit ergänzen.
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    remotePatterns: [],
  },

  // Markdown / MDX
  pageExtensions: ["ts", "tsx", "md", "mdx"],

  // Production: kompakte Logs
  logging: {
    fetches: { fullUrl: false },
  },

  // Experimentelle Features
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
    ],
  },

  // Globale HTTP-Header — Single Source of Truth für Security-Headers.
  // Apache vHost setzt keine eigenen mehr (siehe deploy/apache2/musiker15.de.conf).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },

  async redirects() {
    return [
      // Legacy-Pfade von der alten Docusaurus-Site
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/index", destination: "/", permanent: true },
      // Legacy-Docs-URLs (Docusaurus → Next.js)
      { source: "/docs", destination: "/de/docs", permanent: true },
      {
        source: "/docs/debian-tutorials/mariadb-upgrade-auf-debian-ubuntu-systemen",
        destination: "/de/docs/debian-tutorials/mariadb-upgrade",
        permanent: true,
      },
      {
        source: "/docs/debian-tutorials/update-von-debian-10-auf-debian-11",
        destination: "/de/docs/debian-tutorials/debian-10-zu-11",
        permanent: true,
      },
      {
        source: "/docs/debian-tutorials/apache2-php-8-mariadb-und-phpmyadmin",
        destination: "/de/docs/debian-tutorials/apache2-php-mariadb-phpmyadmin",
        permanent: true,
      },
      {
        source: "/docs/debian-tutorials/certbot-lets-encrypt",
        destination: "/de/docs/debian-tutorials/certbot",
        permanent: true,
      },
      {
        source: "/docs/debian-tutorials/teamspeak-3-server",
        destination: "/de/docs/debian-tutorials/teamspeak3",
        permanent: true,
      },
      // Legacy-Pages
      { source: "/datenschutz", destination: "/de/datenschutz", permanent: true },
      { source: "/impressum", destination: "/de/impressum", permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
