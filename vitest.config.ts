import { defineConfig } from "vitest/config";
import path from "node:path";

// =============================================================================
// Vitest-Config
// -----------------------------------------------------------------------------
// Die Alias-Einträge spiegeln `compilerOptions.paths` aus der tsconfig.
// Reihenfolge ist wichtig: `@/config` und `@/content` müssen VOR `@/` stehen,
// sonst greift der generische Eintrag zuerst und löst `@/config/site.config`
// nach `src/config/site.config` auf — dort liegt nichts.
// =============================================================================
export default defineConfig({
  resolve: {
    alias: [
      { find: /^@\/config\//, replacement: path.resolve(import.meta.dirname, "config") + "/" },
      { find: /^@\/content\//, replacement: path.resolve(import.meta.dirname, "content") + "/" },
      { find: /^@\//, replacement: path.resolve(import.meta.dirname, "src") + "/" },
    ],
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "scripts/**/*.test.ts"],
  },
});
