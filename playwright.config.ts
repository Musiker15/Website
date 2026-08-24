import { defineConfig, devices } from "@playwright/test";

/**
 * E2E-Konfiguration.
 *
 * Bewusst gegen den **Produktions-Build**, nicht gegen `next dev`: die strikte
 * Nonce-CSP lässt `next dev` nicht hydratisieren, ein Klicktest liefe dort ins
 * Leere. `pnpm run start:e2e` setzt also einen fertigen Build voraus, in der CI
 * läuft `pnpm run build` davor.
 *
 * Eigener Port, damit ein nebenher laufender `pnpm dev` (3000) oder ein
 * Handtest (3217) nicht in die Quere kommt.
 */
const PORT = 3218;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `pnpm run start:e2e`,
    url: `http://127.0.0.1:${PORT}/de`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
