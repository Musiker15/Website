// =============================================================================
// ESLint v9 — Native Flat Config
// -----------------------------------------------------------------------------
// Wir nutzen NICHT eslint-config-next, weil dessen Compat-Schicht mit
// @eslint/eslintrc.FlatCompat in v16 zirkuläre Plugin-Referenzen produziert.
// Die wichtigsten Next.js-spezifischen Checks (img-element, link-passhref, etc.)
// macht Next.js bereits zur Build-Zeit selbst — die Lint-Stufe deckt hier
// hauptsächlich allgemeine TypeScript-Sauberkeit ab.
// =============================================================================

import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    // Globale Ignores — werden auf ALLE Dateien angewendet
    ignores: [
      ".next/**",
      "out/**",
      "node_modules/**",
      "public/search-index.json",
      "next-env.d.ts",
      "*.config.{js,mjs,cjs,ts}", // Konfigurationsdateien selbst nicht linten
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      // Unused-Vars: Warning statt Error, mit Unterstrich-Ignorierung
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
      // any ist manchmal pragmatisch (z.B. bei generischen Props/Spreads)
      "@typescript-eslint/no-explicit-any": "warn",
      // Empty-Object-Type in Interface-Erweiterungen ist OK
      "@typescript-eslint/no-empty-object-type": "off",
      // Wir brauchen keinen no-undef in TS-Dateien — TypeScript erledigt das selbst
      "no-undef": "off",
    },
  },

  {
    files: ["scripts/**/*.ts"],
    rules: {
      // Scripts dürfen console.log nutzen
      "no-console": "off",
    },
  },
);
