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
      .filter((el) => !el.closest(".navlinks") && !el.closest(".liquid-subfilters"))
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
    await page.goto("http://127.0.0.1:8794/#liquids", { waitUntil: "domcontentloaded" });

    const accept = page.locator("#ageAccept");
    if (await accept.isVisible().catch(() => false)) {
      await accept.click();
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
      return { hasMusicMount, hasMusicFrame, sweetVisible, sweetProducts };
    });
    const overflow = await checkOverflow(page);

    console.log(
      `${viewport.name}: scroll ${overflow.scrollWidth}/${overflow.clientWidth}, sweet ${result.sweetProducts}, music ${result.hasMusicMount || result.hasMusicFrame}`
    );

    if (result.hasMusicMount || result.hasMusicFrame || !result.sweetVisible || result.sweetProducts < 1) {
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
