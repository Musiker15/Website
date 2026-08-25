import { z } from "zod";

/**
 * ============================================================================
 * ZOD OHNE JIT
 * ----------------------------------------------------------------------------
 * Zod 4 kompiliert seine Validatoren zur Laufzeit und prüft dafür einmal, ob
 * die Umgebung das erlaubt. Diese Prüfung ist ein `Function("")` in einem
 * try/catch. Unter unserer CSP ohne `'unsafe-eval'` wirft der Aufruf, Zod
 * fängt ihn ab und nimmt den langsameren Pfad. Funktional passiert also
 * nichts, aber der Browser meldet trotzdem einen `securitypolicyviolation`:
 *
 *     script-src   blockedURI: "eval"
 *
 * Gemessen am 25.08.2026 auf jeder Seite von www.musiker15.de, genau einmal
 * pro Seitenaufruf. In den DevTools steht das als Issue, und ein Report-Ziel
 * bekäme es ebenfalls jedes Mal.
 *
 * `jitless: true` überspringt die Prüfung, statt sie scheitern zu lassen. Zod
 * hat dafür einen eigenen Regressionstest (`jitless-allows-eval.test.ts`).
 *
 * WICHTIG: Der Schalter muss gesetzt sein, **bevor** das erste Schema benutzt
 * wird. Zod merkt sich das Ergebnis der Prüfung beim ersten Zugriff. Deshalb
 * importiert jede Datei, die ein Schema anlegt, dieses Modul als Erstes:
 * `src/types/config.ts` und `src/lib/frontmatter.ts`.
 *
 * Kosten: die Validierung läuft ohne JIT etwas langsamer. Bei ein paar
 * Config-Objekten und dem Frontmatter einer Seite ist das nicht messbar.
 * ============================================================================
 */
z.config({ jitless: true });
