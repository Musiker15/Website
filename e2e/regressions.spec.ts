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

test.describe("Navigation beginnt oben", () => {
  /**
   * Gemeldet am 25.08.2026: ueber Home oder das Logo auf die Startseite, und
   * die stand ein Stueck heruntergescrollt da.
   *
   * Ursache ist, dass `[locale]/page.tsx` als einzige Seite ein Fragment mit
   * drei Geschwister-Sections zurueckgab statt eines Wurzelelements. Next
   * scrollt bei einer Client-Navigation das erste Element des neuen Segments
   * an, und ohne gemeinsame Wurzel traf es die zweite Section. Gemessen am
   * 25.08.2026: Sections beginnen bei 65, 583 und 1077, die Seite stand bei
   * 495, also 583 minus die 88px `scroll-padding-top`.
   *
   * Der Ablauf ist wichtig: erst auf der Startseite scrollen, weg, dann
   * zurueck. Kommt man von einer Seite, die die Startseite noch nie im
   * Router-Cache hatte, faellt der Fehler nicht auf.
   */
  for (const [name, klick] of [
    ["Home", /^Home$/],
    ["Logo", /^Musiker15$/],
  ] as const) {
    test(`${name} fuehrt an den Seitenanfang, nicht zur zweiten Section`, async ({ page }) => {
      await page.goto("/de");
      await page.evaluate(() => window.scrollTo({ top: 900, behavior: "instant" }));
      expect(await scrollposition(page)).toBeGreaterThan(500);

      await page
        .getByRole("banner")
        .getByRole("link", { name: /^News$/ })
        .click();
      await expect(page).toHaveURL(/\/de\/news$/);
      await scrollposition(page);

      await page.getByRole("banner").getByRole("link", { name: klick }).click();
      await expect(page).toHaveURL(/\/de$/);

      expect(await scrollposition(page)).toBe(0);
    });
  }

  test("die Startseite hat ein einzelnes Wurzelelement", async ({ page }) => {
    await page.goto("/de");
    // Der eigentliche Auslöser, direkt gemessen: mehrere Geschwister auf
    // oberster Ebene bringen Nexts Scroll-Reset aus dem Tritt.
    const kinder = await page
      .locator("main")
      .evaluate((el) => [...el.children].map((c) => c.tagName));
    expect(kinder, `main hat ${kinder.length} direkte Kinder: ${kinder}`).toHaveLength(1);
  });

  test("ein Anker im Inhaltsverzeichnis gleitet weiterhin", async ({ page }) => {
    await page.goto(TUTORIAL);

    // Die Korrektur darf das weiche Scrollen der Sprungmarken nicht abschalten.
    // Messbar ist das daran, dass die Position nach einem kurzen Moment noch
    // unterwegs ist statt sofort am Ziel zu stehen.
    const eintrag = page
      .getByRole("navigation", { name: /auf dieser seite/i })
      .getByRole("link")
      .filter({ hasText: /Zielverzeichnis/ });
    const ziel = (await eintrag.getAttribute("href"))!.slice(1);

    await eintrag.click();
    await page.waitForTimeout(60);
    const unterwegs = await page.evaluate(() => Math.round(window.scrollY));
    const endstand = await scrollposition(page);

    expect(endstand).toBeGreaterThan(0);
    expect(unterwegs, "Sprung war sofort am Ziel, gleitet also nicht mehr").toBeLessThan(endstand);
    await expect(page.locator(`#${ziel}`)).toBeVisible();
  });
});

test.describe("Tutorials-Menü", () => {
  /**
   * Gemeldet am 25.08.2026: im Menü hinter "Tutorials" fehlten Proton Drive
   * und der FiveM-Bereich. Das Menü kommt aus config/navigation.config.ts und
   * wird nicht aus dem Content erzeugt, ein neuer Bereich muss dort von Hand
   * nachgetragen werden. Dieser Test merkt, wenn das vergessen wird.
   */
  test("listet jeden Bereich, den auch die Tutorial-Übersicht zeigt", async ({ page }) => {
    await page.goto("/de/docs");
    // Alles, was die Übersicht als eigenen Bereich oder Einzelseite anbietet.
    const aufDerUebersicht = await page
      .locator("main a")
      .evaluateAll((as) => [
        ...new Set(
          as.map((a) => a.getAttribute("href")!).filter((h) => /^\/de\/docs\/[^/#]+$/.test(h)),
        ),
      ]);
    expect(aufDerUebersicht.length).toBeGreaterThan(3);
    const inDerSeitenleiste = aufDerUebersicht;

    const ausloeser = page.getByRole("banner").getByRole("button", { name: /^Tutorials$/ });
    await ausloeser.hover();
    // Radix haengt den Inhalt erst beim Oeffnen ein, sonst misst man ein leeres Menü.
    await expect(ausloeser).toHaveAttribute("data-state", "open");
    await expect(page.getByRole("banner").getByRole("link", { name: /Debian/ })).toBeVisible();

    const imMenue = await page
      .getByRole("banner")
      .getByRole("link")
      .evaluateAll((as) => as.map((a) => a.getAttribute("href")));

    for (const href of new Set(inDerSeitenleiste)) {
      expect(imMenue, `"${href}" fehlt im Tutorials-Menü`).toContain(href);
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
