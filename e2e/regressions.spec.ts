import { expect, test } from "@playwright/test";

/**
 * Diese Datei deckt genau die Fehler ab, die am 24.08.2026 gemeldet wurden.
 * Jeder Test hier hätte einen davon gefangen, und keiner davon war an den
 * Quelldateien zu sehen: es sind alles Aussagen über die laufende Seite.
 */

const TUTORIAL = "/de/docs/debian-tutorials/acme-sh-wildcard-ionos";

/** Wartet, bis die Seite zwei Messungen lang an derselben Stelle steht. */
async function scrollposition(page: import("@playwright/test").Page): Promise<number> {
  let letzte = -1;
  for (let i = 0; i < 40; i++) {
    const jetzt = await page.evaluate(() => Math.round(window.scrollY));
    if (jetzt === letzte) return jetzt;
    letzte = jetzt;
    await page.waitForTimeout(50);
  }
  return letzte;
}

test.describe("Inhaltsverzeichnis", () => {
  test("ein Klick springt zur Überschrift, nicht nur in die Adresszeile", async ({ page }) => {
    await page.goto(TUTORIAL);

    const eintrag = page
      .getByRole("navigation", { name: /auf dieser seite/i })
      .getByRole("link")
      .filter({ hasText: /Zielverzeichnis/ });
    const ziel = (await eintrag.getAttribute("href"))!.slice(1);

    await eintrag.click();
    await expect(page).toHaveURL(new RegExp(`#${ziel}$`));

    // Der eigentliche Punkt: die Seite muss sich auch bewegt haben.
    expect(await scrollposition(page)).toBeGreaterThan(0);

    // Und die Überschrift steht unter dem klebenden Header, nicht dahinter.
    const abstand = await page.locator(`#${ziel}`).evaluate((el) => el.getBoundingClientRect().top);
    const headerUnterkante = await page
      .locator("header")
      .first()
      .evaluate((el) => el.getBoundingClientRect().bottom);
    expect(abstand).toBeGreaterThan(headerUnterkante);
    expect(abstand).toBeLessThan(headerUnterkante + 60);
  });

  test("jeder Anker im Verzeichnis hat ein Ziel im Dokument", async ({ page }) => {
    await page.goto(TUTORIAL);
    const hrefs = await page
      .getByRole("navigation", { name: /auf dieser seite/i })
      .getByRole("link")
      .evaluateAll((as) => as.map((a) => a.getAttribute("href")!.slice(1)));

    expect(hrefs.length).toBeGreaterThan(3);
    for (const id of hrefs) {
      await expect(page.locator(`#${id}`), `Ziel #${id} fehlt`).toHaveCount(1);
    }
  });
});

test.describe("Statuscodes", () => {
  const fehlend = [
    "/de/gibtsnicht",
    "/en/nope",
    "/de/docs/gibtsnicht",
    "/de/docs/debian-tutorials/nope",
    "/de/news/nope",
  ];

  for (const pfad of fehlend) {
    test(`${pfad} antwortet mit 404, nicht mit 200`, async ({ page }) => {
      const antwort = await page.goto(pfad);
      expect(antwort?.status()).toBe(404);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });
  }

  test("vorhandene Seiten antworten weiter mit 200", async ({ page }) => {
    for (const pfad of ["/de", "/de/docs", "/de/impressum", "/en/privacy", TUTORIAL]) {
      const antwort = await page.goto(pfad);
      expect(antwort?.status(), pfad).toBe(200);
    }
  });
});

test.describe("Sprachwechsel", () => {
  test("lädt das Dokument neu und beginnt oben", async ({ page }) => {
    await page.goto("/de");
    await page.evaluate(() => {
      (window as unknown as { __marker?: string }).__marker = "alte-seite";
      window.scrollTo({ top: 600, behavior: "instant" });
    });

    await page.getByRole("button", { name: /sprache/i }).click();
    await page.getByRole("menuitem", { name: /English/ }).click();
    await page.waitForURL("**/en");

    // Echte Navigation: die Markierung im alten Dokument hat sie nicht überlebt.
    const markerWeg = await page.evaluate(
      () => (window as unknown as { __marker?: string }).__marker === undefined,
    );
    expect(markerWeg).toBe(true);
    expect(await scrollposition(page)).toBe(0);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("führt von den Rechtsseiten auf den passenden Slug", async ({ page }) => {
    await page.goto("/de/impressum");
    await page.getByRole("button", { name: /sprache/i }).click();
    await expect(page.getByRole("menuitem", { name: /English/ })).toHaveAttribute(
      "href",
      "/en/imprint",
    );
  });
});

test.describe("Content-Security-Policy", () => {
  test("kein Verstoß beim Öffnen von Menüs und Suchdialog", async ({ page }) => {
    await page.goto("/de");
    await page.evaluate(() => {
      const w = window as unknown as { __csp: string[] };
      w.__csp = [];
      document.addEventListener("securitypolicyviolation", (e) =>
        w.__csp.push(e.violatedDirective),
      );
    });

    await page.getByRole("button", { name: /sprache/i }).click();
    await page.keyboard.press("Escape");
    await page.keyboard.press("Control+k");
    await expect(page.getByRole("dialog")).toBeVisible();

    const verstoesse = await page.evaluate(() => (window as unknown as { __csp: string[] }).__csp);
    expect(verstoesse).toEqual([]);
  });
});
