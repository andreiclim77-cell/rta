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
  { name: "mobile-320", width: 320, height: 740 },
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
      await page.waitForFunction(() => !document.body.classList.contains("app-preparing"), { timeout: 45000 });
    }

    await page.waitForSelector(".supplier-showcase", { timeout: 12000 });
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
      await page.waitForFunction(() => !document.body.classList.contains("app-preparing"), { timeout: 45000 });
    }

    await page.waitForSelector("#liquidCatalogGrid", { timeout: 5000 });
    await page.locator('[data-liquid-group="tutun"][data-liquid-sub="dulci"]').first().click();
    await page.waitForTimeout(250);
    const sweetExpected = Number(await page.locator('[data-liquid-group="tutun"][data-liquid-sub="dulci"] span').first().textContent());
    const expandSweet = page.locator('[data-liquid-expand="tutun"]').first();
    const expandVisible = await expandSweet.isVisible().catch(() => false);
    if (expandVisible) {
      await expandSweet.click();
      await page.waitForTimeout(250);
    }

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
    result.sweetExpected = sweetExpected;
    result.expandVisible = expandVisible;
    const overflow = await checkOverflow(page);

    console.log(
      `${viewport.name}: scroll ${overflow.scrollWidth}/${overflow.clientWidth}, sweet ${result.sweetProducts}/${result.sweetExpected}, airflow ${result.airflowOk}, chamber ${result.chamberOk}, music ${result.hasMusicMount || result.hasMusicFrame}`
    );

    if (result.hasMusicMount || result.hasMusicFrame || !result.sweetVisible || !result.expandVisible || result.sweetExpected < 100 || result.sweetProducts !== result.sweetExpected || !result.airflowOk || !result.chamberOk) {
      failures.push({ viewport: viewport.name, result });
    }
    if (overflow.scrollWidth > overflow.clientWidth + 4 || overflow.offenders.length) {
      failures.push({ viewport: viewport.name, overflow });
    }

    await page.goto("http://127.0.0.1:8794/#setupList", { waitUntil: "domcontentloaded" });
    const wizardAccept = page.locator("#ageAccept");
    if (await wizardAccept.isVisible().catch(() => false)) {
      await wizardAccept.click();
      await page.waitForFunction(() => !document.body.classList.contains("app-preparing"), { timeout: 45000 });
    }
    await page.locator('[data-setup-group="liquid"] [data-value="tutun-dulce"]').click();
    await page.waitForTimeout(250);
    const wizardResult = await page.evaluate(() => {
      const liquids = document.querySelector('[data-setup-picker="liquids"]');
      const search = document.querySelector('[data-setup-picker-search="liquids"]');
      const liquidGroup = [...document.querySelectorAll('#setupSuggestedProducts .setup-suggestion-group')]
        .find(group => /Lichide sugerate/.test(group.textContent || ''));
      const compatibleChip = [...document.querySelectorAll('#setupVerdict .chip')]
        .find(chip => /lichide compatibile/.test(chip.textContent || ''));
      return {
        options: liquids ? liquids.options.length : 0,
        search: Boolean(search),
        suggestedCards: liquidGroup ? liquidGroup.querySelectorAll('.setup-product').length : 0,
        suggestionCount: liquidGroup?.querySelector('.setup-suggestion-head span')?.textContent || '',
        compatibleCount: compatibleChip?.textContent || '',
        pickerLabel: liquids?.closest('.setup-picker')?.querySelector('label')?.textContent || ''
      };
    });
    const wizardOverflow = await checkOverflow(page);
    console.log(`${viewport.name}: wizard sweet ${wizardResult.suggestedCards}/${wizardResult.options}, search ${wizardResult.search}`);
    if (
      wizardResult.options < 100 ||
      wizardResult.suggestedCards !== 4 ||
      !wizardResult.search ||
      !/4 sugestii principale din \d+ compatibile/.test(wizardResult.suggestionCount) ||
      !new RegExp(`${wizardResult.options}\\s+lichide compatibile`).test(wizardResult.compatibleCount) ||
      !new RegExp(`${wizardResult.options}\\s+compatibile`).test(wizardResult.pickerLabel)
    ) {
      failures.push({ viewport: viewport.name, wizardResult });
    }
    if (wizardOverflow.scrollWidth > wizardOverflow.clientWidth + 4 || wizardOverflow.offenders.length) {
      failures.push({ viewport: viewport.name, wizardOverflow });
    }

    if (viewport.name === "mobile-320" || viewport.name === "desktop") {
      await page.goto("http://127.0.0.1:8794/en/#setupList", { waitUntil: "domcontentloaded" });
      const englishAccept = page.locator("#ageAccept");
      if (await englishAccept.isVisible().catch(() => false)) {
        await englishAccept.click();
        await page.waitForFunction(() => !document.body.classList.contains("app-preparing"), { timeout: 45000 });
      }
      await page.locator('[data-setup-group="liquid"] [data-value="tutun-dulce"]').click();
      await page.waitForTimeout(250);
      const englishWizard = await page.evaluate(() => {
        const liquids = document.querySelector('[data-setup-picker="liquids"]');
        const liquidGroup = [...document.querySelectorAll('#setupSuggestedProducts .setup-suggestion-group')]
          .find(group => /Suggested liquids/.test(group.textContent || ''));
        return {
          options: liquids ? liquids.options.length : 0,
          heading: liquidGroup?.querySelector('.setup-suggestion-head span')?.textContent || '',
          placeholder: document.querySelector('[data-setup-picker-search="liquids"]')?.getAttribute('placeholder') || ''
        };
      });
      const englishWizardOverflow = await checkOverflow(page);
      console.log(`${viewport.name}: EN wizard sweet ${englishWizard.options}, search ${englishWizard.placeholder}`);
      if (englishWizard.options < 100 || !/4 primary suggestions out of \d+ compatible/.test(englishWizard.heading) || englishWizard.placeholder !== 'Search product') {
        failures.push({ viewport: viewport.name, englishWizard });
      }
      if (englishWizardOverflow.scrollWidth > englishWizardOverflow.clientWidth + 4 || englishWizardOverflow.offenders.length) {
        failures.push({ viewport: viewport.name, englishWizardOverflow });
      }
    }

    await page.close();
  }

  await browser.close();
  if (failures.length) {
    console.error(JSON.stringify(failures, null, 2));
    process.exit(1);
  }
})();
