#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SOURCE = path.join(ROOT, 'index.html');
const OUTPUT = path.join(ROOT, 'en', 'index.html');

let html = fs.readFileSync(SOURCE, 'utf8');

html = html
  .replace('<html lang="ro">', '<html lang="en">')
  .replace('<meta charset="utf-8" />', '<meta charset="utf-8" />\n<base href="/" />')
  .replace(/<title>[^<]*<\/title>/, '<title>MTL RTA Guide - Smokee | atomizers, NET liquids and wires</title>')
  .replace(/<meta name="title" content="[^"]*"\s*\/>/, '<meta name="title" content="MTL RTA Guide - Smokee | atomizers, NET liquids and wires" />')
  .replace(/<meta name="description" content="[^"]*"\s*\/>/, '<meta name="description" content="MTL RTA guide for tobacco and NET liquids: atomizers, wires, builds, temperature control, taste diagnosis, reviews and Smokee supplies." />')
  .replace(/<meta name="keywords" content="[^"]*"\s*\/>/, '<meta name="keywords" content="MTL RTA guide, MTL atomizers, NET tobacco liquids, RTA wires, MTL builds, temperature control, taste diagnosis, Smokee" />')
  .replace('<meta name="application-name" content="Ghid RTA MTL - Smokee" />', '<meta name="application-name" content="MTL RTA Guide - Smokee" />')
  .replace('<meta name="apple-mobile-web-app-title" content="Ghid RTA MTL" />', '<meta name="apple-mobile-web-app-title" content="MTL RTA Guide" />')
  .replace('<link rel="manifest" href="https://ghid-rta.ro/site.webmanifest" />', '<link rel="manifest" href="https://ghid-rta.ro/site-en.webmanifest" />')
  .replace('<link rel="canonical" href="https://ghid-rta.ro/" />', '<link rel="canonical" href="https://ghid-rta.ro/en/" />')
  .replace('<link rel="alternate" hreflang="ro-RO" href="https://ghid-rta.ro/" />', '<link rel="alternate" hreflang="ro-RO" href="https://ghid-rta.ro/" />')
  .replace('<link rel="alternate" hreflang="en" href="https://ghid-rta.ro/en/" />', '<link rel="alternate" hreflang="en" href="https://ghid-rta.ro/en/" />')
  .replace('<meta property="og:locale" content="ro_RO" />', '<meta property="og:locale" content="en_US" />')
  .replace(/<meta property="og:title" content="[^"]*"\s*\/>/, '<meta property="og:title" content="MTL RTA Guide - Smokee | atomizers, NET liquids and wires" />')
  .replace(/<meta property="og:description" content="[^"]*"\s*\/>/, '<meta property="og:description" content="MTL RTA recommendations for NET and TOBACCO liquids: atomizer, wire, build, reviews, temperature control and Smokee supplies." />')
  .replace('<meta property="og:url" content="https://ghid-rta.ro/" />', '<meta property="og:url" content="https://ghid-rta.ro/en/" />')
  .replace(/<meta name="twitter:title" content="[^"]*"\s*\/>/, '<meta name="twitter:title" content="MTL RTA Guide - Smokee" />')
  .replace(/<meta name="twitter:description" content="[^"]*"\s*\/>/, '<meta name="twitter:description" content="MTL RTA recommendations for NET and tobacco liquids, atomizers, wires, builds and temperature control." />')
  .replace('<meta name="twitter:url" content="https://ghid-rta.ro/" />', '<meta name="twitter:url" content="https://ghid-rta.ro/en/" />')
  .replace('title="Audiență agregată și progres documentare"', 'title="Aggregated audience and documentation progress"')
  .replace('left_text=Vizite', 'left_text=Visits')
  .replace('alt="Vizite"', 'alt="Visits"')
  .replace('<span class="counter-fallback">Vizite</span>', '<span class="counter-fallback">Visits</span>')
  .replace('https://mystic-profile-online-full-test-cmln.onrender.com/?lang=ro', 'https://mystic-profile-online-full-test-cmln.onrender.com/?lang=en')
  .replace(/("url"\s*:\s*)"https:\/\/ghid-rta\.ro\/"/g, '$1"https://ghid-rta.ro/en/"')
  .replace(/("inLanguage"\s*:\s*)"ro-RO"/g, '$1"en"');

html = html.replace(/\s*$/, '\n');

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, html, 'utf8');
console.log('English application generated at /en/.');
