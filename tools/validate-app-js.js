const fs = require("fs");

const html = fs.readFileSync("index.html", "utf8");
const scripts = [...html.matchAll(/<script(?![^>]*application\/json)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g)]
  .map((match) => match[1]);

scripts.forEach((script, index) => {
  try {
    new Function(script);
  } catch (error) {
    throw new Error(`index.html script block ${index + 1} invalid: ${error.message}`);
  }
});

console.log(`index.html script block(s) ok: ${scripts.length}`);
