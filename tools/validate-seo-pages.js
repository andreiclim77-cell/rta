const fs = require("fs");

const pages = [
  "index.html",
  "ghid-rta-mtl.html",
  "start.html",
  "ce-atomizor-rta-mtl-aleg.html",
  "recomandari-rta-mtl.html",
  "atomizoare-rta-mtl.html",
  "lichide-net-tutun.html",
  "net-rta-mtl.html",
  "tutun-rta-mtl.html",
  "sarme-rta-builduri.html",
  "builduri-mtl-sarme-rta.html",
  "airflow-camera-rta-mtl.html",
  "control-temperatura-mtl.html",
  "nife30-control-temperatura-mtl.html",
  "ss316l-mtl-rta.html",
  "clapton-mtl-rta.html",
  "kanthal-ni80-mtl-rta.html",
  "net-complex-rta-mtl.html",
  "ry4-tutun-dulce-rta-mtl.html",
  "bottom-side-airflow-rta-mtl.html",
  "diagnostic-gust-rta-mtl.html",
  "calculator-lichide-vape.html",
  "consumabile-rta-smokee.html",
  "wizard-smokee.html",
  "rta-mtl-smokee.html",
  "legislativ-vape.html",
  "smokee-link-kit.html",
];

const requiredSeoTokens = [
  "<title>",
  'meta name="description"',
  'rel="canonical"',
];

for (const file of pages) {
  const html = fs.readFileSync(file, "utf8");
  for (const token of requiredSeoTokens) {
    if (!html.includes(token)) {
      throw new Error(`${file}: missing ${token}`);
    }
  }
  if (file !== "index.html" && !html.includes("assets/seo-pages.css")) {
    throw new Error(`${file}: missing shared CSS`);
  }

  const scripts = html
    .split('<script type="application/ld+json">')
    .slice(1)
    .map((part) => part.split("</script>")[0]);

  scripts.forEach((script, index) => {
    try {
      JSON.parse(script);
    } catch (error) {
      throw new Error(`${file}: JSON-LD ${index + 1} invalid: ${error.message}`);
    }
  });

  console.log(`${file}: ${scripts.length} JSON-LD block(s) ok`);
}

const sitemap = fs.readFileSync("sitemap.xml", "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
for (const file of pages.filter((page) => page !== "index.html")) {
  const url = `https://ghid-rta.ro/${file}`;
  if (!sitemapUrls.includes(url)) {
    throw new Error(`sitemap.xml: missing ${url}`);
  }
}

console.log(`sitemap.xml: ${sitemapUrls.length} URL(s) ok`);
