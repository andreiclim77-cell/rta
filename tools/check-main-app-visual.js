const path = require("path");

const dependencyNodeModules =
  "C:\\Users\\acasa\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules";

process.env.NODE_PATH = [
  process.env.NODE_PATH,
  dependencyNodeModules,
  path.join(dependencyNodeModules, ".pnpm", "node_modules"),
]
  .filter(Boolean)
  .join(path.delimiter);
require("module").Module._initPaths();

const { chromium } = require("playwright");
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1366, height: 768 },
];

async function checkOverflow(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const width = doc.clientWidth;
    const offenders = [...document.querySelectorAll("a,button,h1,h2,h3,p,small,b,span")]
      .filter((el) => !el.closest(".navlinks") && !el.closest(".liquid-subfilters") && !el.closest(".supplier-rail"))
      .map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          tag: el.tagName.toLowerCase(),
          text: (el.textContent || "").trim().slice(0, 80),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
        };
      })
      .filter((item) => item.width > 0 && (item.right > width + 4 || item.left < -4))
      .slice(0, 8);
    return { scrollWidth: doc.scrollWidth, clientWidth: width, offenders };
  });
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: require("fs").existsSync(chromePath) ? chromePath : undefined,
  });
  const failures = [];

  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    await page.goto("http://127.0.0.1:8794/", { waitUntil: "domcontentloaded" });

    const accept = page.locator("#ageAccept");
    if (await accept.isVisible().catch(() => false)) {
      const ageResult = await page.evaluate(() => {
        const gate = document.querySelector("#ageGate");
        const card = document.querySelector(".age-card");
        const actions = document.querySelector(".age-actions");
        const rail = document.querySelector("#ageSupplierRail");
        const cardRect = card?.getBoundingClientRect();
        const actionsRect = actions?.getBoundingClientRect();
        return {
          visible: Boolean(gate && !gate.hidden),
          ageCards: rail?.querySelectorAll(".supplier-card").length || 0,
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          cardTop: Math.round(cardRect?.top || 0),
          cardBottom: Math.round(cardRect?.bottom || 0),
          actionsBottom: Math.round(actionsRect?.bottom || 0),
          viewportHeight: window.innerHeight,
        };
      });
      if (
        !ageResult.visible ||
        ageResult.ageCards < 4 ||
        ageResult.scrollWidth > ageResult.clientWidth + 4 ||
        ageResult.cardTop < -4 ||
        ageResult.actionsBottom > ageResult.viewportHeight + 4
      ) {
        failures.push({ viewport: viewport.name, ageResult });
      }
      await accept.click();
    }

    await page.waitForSelector(".supplier-showcase", { timeout: 5000 });
    const homeResult = await page.evaluate(() => {
      const supplier = document.querySelector(".supplier-showcase");
      const guide = document.querySelector(".guide-hub");
      const wrap = document.querySelector("main.wrap");
      const wrapStyle = wrap ? getComputedStyle(wrap) : null;
      const wrapPadding =
        (parseFloat(wrapStyle?.paddingLeft || "0") || 0) + (parseFloat(wrapStyle?.paddingRight || "0") || 0);
      const supplierCards = [...document.querySelectorAll(".supplier-card")];
      return {
        supplierWidth: Math.round(supplier?.getBoundingClientRect().width || 0),
        guideWidth: Math.round(guide?.getBoundingClientRect().width || 0),
        wrapWidth: Math.round(wrap?.getBoundingClientRect().width || 0),
        wrapContentWidth: Math.round((wrap?.getBoundingClientRect().width || 0) - wrapPadding),
        supplierCards: supplierCards.length,
        supplierImages: supplierCards.filter((el) => (el.getAttribute("style") || "").includes("--supplier-img")).length,
      };
    });
    const homeOverflow = await checkOverflow(page);

    if (
      homeOverflow.scrollWidth > homeOverflow.clientWidth + 4 ||
      homeOverflow.offenders.length ||
      homeResult.supplierCards < 20 ||
      homeResult.supplierImages !== homeResult.supplierCards ||
      (viewport.width > 900 &&
        (homeResult.supplierWidth < homeResult.wrapContentWidth - 12 ||
          homeResult.guideWidth < homeResult.wrapContentWidth - 12))
    ) {
      failures.push({ viewport: viewport.name, homeResult, homeOverflow });
    }

    await page.goto("http://127.0.0.1:8794/#liquids", { waitUntil: "domcontentloaded" });
    const routeAccept = page.locator("#ageAccept");
    if (await routeAccept.isVisible().catch(() => false)) {
      await routeAccept.click();
    }

    await page.waitForSelector("#liquidCatalogGrid", { timeout: 5000 });
    await page.locator('[data-liquid-group="tutun"][data-liquid-sub="dulci"]').first().click();
    await page.waitForTimeout(250);

    const result = await page.evaluate(() => {
      const hasMusicMount = Boolean(document.querySelector("#musicMount"));
      const hasMusicFrame = Boolean(document.querySelector('iframe[src*="youtube"]'));
      const sweetButton = document.querySelector('[data-liquid-group="tutun"][data-liquid-sub="dulci"]');
      const sweetVisible = Boolean(sweetButton && sweetButton.classList.contains("active"));
      const sweetProducts = [...document.querySelectorAll("#liquidCatalogGrid .consumable-zone")]
        .find((zone) => (zone.querySelector("h3")?.textContent || "").trim() === "TUTUN")
        ?.querySelectorAll(".consumable-item").length || 0;
      const airflowTargets = ["Muted+", "Ennequadro VICO RTA", "Ennequadro Baya RTA"].map((name) => {
        const atom = atomizers.find((item) => getName(item) === name);
        const air = atom ? airflowInfo(atom) : null;
        const roles = atom ? inferRoles(atom) : [];
        return { name, found: Boolean(atom), label: air?.label || "", side: Boolean(air?.side), roles };
      });
      const airflowOk = airflowTargets.every((item) => item.found && item.side && item.roles.includes("sideair"));
      const chamberTargets = [
        { name: "Dvarw MTL FL", match: /PEEK/i, kind: "verified" },
        { name: "BP Mods Labs RTA", match: /Patru camere/i, kind: "verified" },
        { name: "Ennequadro VICO RTA", match: /Fluid Deck/i, kind: "partial" },
      ].map((target) => {
        const atom = atomizers.find((item) => getName(item) === target.name);
        const chamber = atom ? chamberInfo(atom) : null;
        return {
          name: target.name,
          found: Boolean(atom),
          label: chamber?.label || "",
          kind: chamber?.kind || "",
          ok: Boolean(atom && chamber && target.match.test(chamber.label) && chamber.kind === target.kind),
        };
      });
      const chamberOk = chamberTargets.every((item) => item.ok);
      return { hasMusicMount, hasMusicFrame, sweetVisible, sweetProducts, airflowTargets, airflowOk, chamberTargets, chamberOk };
    });
    const overflow = await checkOverflow(page);

    console.log(
      `${viewport.name}: scroll ${overflow.scrollWidth}/${overflow.clientWidth}, sweet ${result.sweetProducts}, airflow ${result.airflowOk}, chamber ${result.chamberOk}, music ${result.hasMusicMount || result.hasMusicFrame}`
    );

    if (result.hasMusicMount || result.hasMusicFrame || !result.sweetVisible || result.sweetProducts < 1 || !result.airflowOk || !result.chamberOk) {
      failures.push({ viewport: viewport.name, result });
    }
    if (overflow.scrollWidth > overflow.clientWidth + 4 || overflow.offenders.length) {
      failures.push({ viewport: viewport.name, overflow });
    }

    await page.close();
  }

  await browser.close();
  if (failures.length) {
    console.error(JSON.stringify(failures, null, 2));
    process.exit(1);
  }
})();
