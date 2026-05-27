import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { SUPPORTED_LOCALES } from "@/types/config";

const intlMiddleware = createMiddleware({
  locales: SUPPORTED_LOCALES,
  defaultLocale: "de",
  localePrefix: "always",
  localeDetection: true,
  // NEXT_LOCALE Cookie absichern (Mozilla Observatory: Cookies-Check):
  // • secure   → nur über HTTPS übertragen
  // • sameSite → "lax" reicht für Locale-Persistenz
  // • maxAge   → 1 Jahr, gleicher Wert wie next-intl Default
  // (`httpOnly` unterstützt next-intl im Typ nicht — wir setzen es danach
  //  manuell über die Response, siehe unten.)
  localeCookie: {
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  },
});

// =============================================================================
// Content-Security-Policy mit Nonce + strict-dynamic
// -----------------------------------------------------------------------------
// • Pro Request wird ein kryptographisch sicherer 128-bit Nonce erzeugt.
// • Der Nonce wird sowohl im x-nonce Request-Header (für Server Components
//   via `headers()`) als auch in der CSP `script-src 'nonce-XXX'` gesetzt.
// • `'strict-dynamic'` erlaubt es Next.js' Bootstrap-Script, weitere Module
//   dynamisch nachzuladen — ohne dass jedes einzelne Script ein Nonce braucht.
// • Folge: Alle Routes werden dynamisch gerendert (kein SSG). Bewusster
//   Trade-off für eine Observatory-konforme strikte CSP.
// =============================================================================
function buildCsp(nonce: string): string {
  return [
    "default-src 'none'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    // style-src: nonce-basiert. Tailwind v4 erzeugt eine externe CSS-Datei
    // (kein inline-CSS). next-themes injiziert sein Anti-Flash-<style>-Tag
    // mit dem nonce-Prop, das wir im Layout durchreichen.
    //
    // style-src-elem (für <style>-Tags): nur Nonce + 'self'. Keine inline-
    // <style>-Tags ohne Nonce erlaubt — Observatory-konform.
    //
    // style-src-attr (für `style="..."`-Attribute): 'unsafe-inline' notwendig,
    // weil Third-Party-Libraries automatisch style-Attribute setzen:
    //   • next/image fügt `style="color:transparent"` auf <img>-Tags hinzu
    //     (interner Placeholder vor Lazy-Load, nicht abschaltbar)
    //   • Radix-UI NavigationMenu setzt `style="position:relative"` für sein
    //     interaktives Layout
    // Mozilla Observatory prüft nur `style-src` direkt auf 'unsafe-inline',
    // nicht style-src-attr — der A+ Score bleibt erhalten. XSS-Risiko über
    // style-Attribute ist deutlich niedriger als über script-src.
    `style-src 'self' 'nonce-${nonce}'`,
    `style-src-elem 'self' 'nonce-${nonce}'`,
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "media-src 'self'",
    "manifest-src 'self'",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "frame-src 'none'",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}

function patchLocaleCookie(response: NextResponse): void {
  const cookie = response.cookies.get("NEXT_LOCALE");
  if (!cookie) return;
  response.cookies.set("NEXT_LOCALE", cookie.value, {
    secure: true,
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
}

export default function middleware(request: NextRequest): NextResponse {
  // -------------------------------------------------------------------------
  // 1. Nonce (16 zufällige Bytes → Base64, ~24 Zeichen)
  // -------------------------------------------------------------------------
  const nonceBytes = new Uint8Array(16);
  crypto.getRandomValues(nonceBytes);
  const nonce = btoa(String.fromCharCode(...nonceBytes));
  const csp = buildCsp(nonce);

  // -------------------------------------------------------------------------
  // 2. Request-Header für Server Components vorbereiten (x-nonce)
  // -------------------------------------------------------------------------
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  // -------------------------------------------------------------------------
  // 3. next-intl Middleware aufrufen (kann Redirect / Rewrite / Pass-through)
  // -------------------------------------------------------------------------
  const intlResponse = intlMiddleware(request);

  const isRedirect = intlResponse.headers.has("location");
  const isRewrite = intlResponse.headers.has("x-middleware-rewrite");

  let finalResponse: NextResponse;

  if (isRedirect || isRewrite) {
    // Redirect/Rewrite kennt keine downstream-Server-Components → Request-
    // Header müssen nicht propagiert werden. intl-Response direkt verwenden.
    finalResponse = intlResponse;
  } else {
    // Pass-through: Eigene Response erzeugen, damit Server Components den
    // x-nonce Request-Header sehen (Next.js liest ihn auch automatisch für
    // generierte <script>-Tags).
    finalResponse = NextResponse.next({
      request: { headers: requestHeaders },
    });

    // intl-Response Headers (Link / Vary / Set-Cookie / …) übernehmen,
    // damit hreflang-Alternates etc. nicht verloren gehen.
    //
    // WICHTIG: `x-middleware-*` Header AUSSCHLIESSEN — sie sind Next.js-
    // internal und finalResponse hat bereits die korrekten gesetzt (aus
    // dem NextResponse.next({ request: { headers } }) oben). Ein Overwrite
    // mit intl-Response-Werten kappt den Request-Header-Override an die
    // Server Components → `headers().get("x-nonce")` wird dort `null`.
    intlResponse.headers.forEach((value, key) => {
      const lk = key.toLowerCase();
      if (lk === "content-security-policy") return;
      if (lk.startsWith("x-middleware-")) return;
      finalResponse.headers.set(key, value);
    });
    intlResponse.cookies.getAll().forEach((c) => finalResponse.cookies.set(c));
  }

  // -------------------------------------------------------------------------
  // 4. CSP-Header pro Response setzen
  // -------------------------------------------------------------------------
  finalResponse.headers.set("Content-Security-Policy", csp);

  // -------------------------------------------------------------------------
  // 5. NEXT_LOCALE Cookie mit HttpOnly nachpatchen (XSS-Schutz)
  // -------------------------------------------------------------------------
  patchLocaleCookie(finalResponse);

  return finalResponse;
}

export const config = {
  matcher: [
    // Alle Pfade außer:
    //   /api, /_next/static, /_next/image, /favicon, /robots, /sitemap, /manifest, /og-*
    "/((?!api|_next/static|_next/image|favicon\\.ico|favicon\\.svg|robots\\.txt|sitemap\\.xml|manifest\\.webmanifest|og-.*\\.png|.*\\..*$).*)",
  ],
};
