const fs = require("fs");

const host = "ghid-rta.ro";
const key = "1e7b9f2d3c4a5b6e8f9012a3b4c5d6e7f8a9b0c1d2e3f405162738495a6b7c8d";
const keyLocation = `https://${host}/${key}.txt`;
const sitemap = fs.readFileSync("sitemap.xml", "utf8");
const urlList = [...sitemap.matchAll(/<loc>(https:\/\/ghid-rta\.ro\/[^<]+)<\/loc>/g)]
  .map((match) => match[1])
  .filter((url, index, list) => list.indexOf(url) === index);

if (!urlList.length) {
  throw new Error("No ghid-rta.ro URLs found in sitemap.xml");
}

async function submit(endpoint) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host, key, keyLocation, urlList }),
  });
  const text = await response.text();
  return { endpoint, status: response.status, text: text.trim() };
}

(async () => {
  const endpoints = [
    "https://api.indexnow.org/indexnow",
    "https://www.bing.com/indexnow",
  ];

  const results = [];
  for (const endpoint of endpoints) {
    try {
      results.push(await submit(endpoint));
    } catch (error) {
      results.push({ endpoint, status: "error", text: error.message });
    }
  }

  for (const result of results) {
    console.log(`${result.endpoint}: ${result.status}${result.text ? ` ${result.text}` : ""}`);
  }

  const ok = results.some((result) => result.status === 200 || result.status === 202);
  if (!ok) {
    process.exitCode = 1;
  }
})();
