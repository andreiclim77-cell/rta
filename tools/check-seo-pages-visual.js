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

const pages = [
  "ghid-rta-mtl.html",
  "recomandari-rta-mtl.html",
  "atomizoare-rta-mtl.html",
  "lichide-net-tutun.html",
  "sarme-rta-builduri.html",
  "control-temperatura-mtl.html",
  "calculator-lichide-vape.html",
  "consumabile-rta-smokee.html",
  "legislativ-vape.html",
  "smokee-link-kit.html",
];

const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1366, height: 768 },
];

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: require("fs").existsSync(chromePath) ? chromePath : undefined,
  });
  const failures = [];

  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    for (const file of pages) {
      await page.goto(`http://127.0.0.1:8794/${file}`, { waitUntil: "networkidle" });
      const result = await page.evaluate(() => {
        const doc = document.documentElement;
        const width = doc.clientWidth;
        const offenders = [...document.querySelectorAll("a,button,h1,h2,h3,p,code")]
          .map((el) => {
            const rect = el.getBoundingClientRect();
            return {
              tag: el.tagName.toLowerCase(),
              text: (el.textContent || "").trim().slice(0, 70),
              left: Math.round(rect.left),
              right: Math.round(rect.right),
              width: Math.round(rect.width),
            };
          })
          .filter((item) => item.right > width + 3 || item.left < -3)
          .slice(0, 6);
        return {
          scrollWidth: doc.scrollWidth,
          clientWidth: width,
          offenders,
        };
      });

      const hasOverflow = result.scrollWidth > result.clientWidth + 3 || result.offenders.length > 0;
      console.log(
        `${viewport.name} ${file}: scroll ${result.scrollWidth}/${result.clientWidth}, offenders ${result.offenders.length}`
      );
      if (hasOverflow) failures.push({ viewport: viewport.name, file, result });
    }
    await page.close();
  }

  await browser.close();

  if (failures.length) {
    console.error(JSON.stringify(failures, null, 2));
    process.exit(1);
  }
})();
