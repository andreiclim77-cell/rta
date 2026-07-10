#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {
  allSources,
  atomizerValidation,
  directSource,
  loadCatalog,
  publicAtomName,
  slugify,
  sourceUrl
} = require('./catalog-data');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://ghid-rta.ro';
const TODAY = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Bucharest', year: 'numeric', month: '2-digit', day: '2-digit'
}).format(new Date());

function esc(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function xml(value) {
  return esc(value);
}

function cleanText(value) {
  return String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/\b\d+(?:[.,]\d+)?\s*ml\b/gi, '')
    .replace(/\b(?:matte|full|silk)\s+(?:black|blue|red|green|silver|gold)\b/gi, '')
    .replace(/\b(?:varianta|culoare|finish|finisaj)\s+(?:black|blue|red|green|silver|gold|polished|stainless steel)\b/gi, '')
    .replace(/\s+,/g, ',')
    .replace(/,\s*,/g, ', ')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[,;\s]+|[,;\s]+$/g, '')
    .trim();
}

function sourceLabel(source) {
  const value = cleanText(source['Titlu / identificare review YouTube'] || source['Tip sursa'] || source.type || 'Sursa');
  if (/official\/family spec/i.test(value)) return 'Sursă oficială / familie';
  if (/forum\/community/i.test(value)) return 'Forum / comunitate';
  if (/community\/reddit/i.test(value)) return 'Comunitate / Reddit';
  if (/general mtl build/i.test(value)) return 'Build MTL general';
  if (/smokee\/product/i.test(value)) return 'Smokee / produs';
  return value;
}

function sourceClaim(source) {
  return cleanText(source['Ce sustine / motiv folosire'] || source.Observatie || source.claim || 'Documentare suplimentara.');
}

function host(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch (error) { return 'sursa'; }
}

function atomPageImage(atom) {
  if (/^https?:\/\//i.test(atom.image || '')) return atom.image;
  for (const source of allSources(atom)) {
    const match = sourceUrl(source).match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{6,})/i);
    if (match) return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  }
  return `${SITE}/assets/rta-hero-background.png`;
}

function pageHead({ title, description, canonical, image, type = 'article', jsonLd }) {
  const safeImage = image || `${SITE}/assets/rta-hero-background.png`;
  return `<!doctype html>
<html lang="ro">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <meta name="theme-color" content="#080808">
  <link rel="canonical" href="${esc(canonical)}">
  <link rel="alternate" hreflang="ro-RO" href="${esc(canonical)}">
  <link rel="alternate" hreflang="x-default" href="${esc(canonical)}">
  <link rel="icon" href="/assets/favicon-192.png">
  <link rel="manifest" href="/site.webmanifest">
  <meta property="og:type" content="${esc(type)}">
  <meta property="og:site_name" content="Ghid RTA MTL - Smokee">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${esc(canonical)}">
  <meta property="og:image" content="${esc(safeImage)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${esc(safeImage)}">
  <link rel="stylesheet" href="/assets/seo-pages.css">
  <link rel="stylesheet" href="/assets/enhancements.css">
  <script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>
</head>`;
}

function topBar() {
  return `<header class="top"><div class="top-inner"><a class="brand" href="/"><img src="/assets/smokee-logo-official.png" alt="Smokee"><b>Ghid RTA MTL</b></a><nav class="top-actions" aria-label="Navigare"><a class="pill" href="/#recommender">Recomandare</a><a class="pill" href="/#comparator">Comparator</a><a class="pill hot" href="/#atomizers">Aplicația</a></nav></div></header>`;
}

function footer() {
  return `<footer class="footer"><div class="wrap"><span>Ghid informativ 18+ pentru RTA MTL.</span><span><a href="/">Home</a> · <a href="/atomizoare/">Atomizoare</a> · <a href="/lichide/clase/">Clase lichide</a> · <a href="/#methodology">Metodologie</a></span></div></footer>`;
}

function atomPage(atom) {
  const name = publicAtomName(atom.name);
  const slug = slugify(name);
  const canonical = `${SITE}/atomizoare/${slug}/`;
  const validation = atomizerValidation(atom);
  const description = cleanText(`${atom.dna || ''} Potriviri pentru ${atom.classes || 'lichide tutunoase si NET'}, builduri si surse verificate.`).slice(0, 158);
  const image = atomPageImage(atom);
  const builds = Array.isArray(atom.builds) ? atom.builds : [];
  const sources = allSources(atom).filter(source => /^https?:\/\//i.test(sourceUrl(source))).slice(0, 10);
  const directCount = sources.filter(directSource).length;
  const statusLabel = validation.status === 'verified' ? 'profil documentat' : 'profil disponibil';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TechArticle',
        headline: `${name} - profil RTA MTL`,
        description,
        url: canonical,
        image,
        inLanguage: 'ro-RO',
        dateModified: TODAY,
        author: { '@type': 'Organization', name: 'Ghid RTA MTL - Smokee', url: SITE },
        about: ['RTA MTL', name, 'lichide NET', 'sarme RTA', 'build MTL']
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ghid RTA MTL', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Atomizoare', item: `${SITE}/atomizoare/` },
          { '@type': 'ListItem', position: 3, name, item: canonical }
        ]
      }
    ]
  };

  return `${pageHead({ title: `${name} - profil RTA MTL, builduri și surse`, description, canonical, image, jsonLd })}
<body>
${topBar()}
<main class="wrap catalog-detail">
  <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/atomizoare/">Atomizoare</a><span>/</span><b>${esc(name)}</b></nav>
  <section class="product-detail-hero">
    <div class="product-detail-copy"><p class="kicker">RTA MTL documentat</p><h1>${esc(name)}</h1><p class="lead">${esc(cleanText(atom.dna || 'Profil RTA MTL pentru lichide tutunoase și NET.'))}</p><div class="actions"><a class="btn" href="/#atomizor/${esc(slug)}">Deschide profilul interactiv</a><a class="btn secondary" href="/#comparator">Adaugă în comparator</a></div></div>
    <figure class="product-detail-media"><img src="${esc(image)}" alt="${esc(name)}" loading="eager"><figcaption>${esc(statusLabel)} · ${directCount} surse directe</figcaption></figure>
  </section>
  <section class="detail-band"><div><p class="kicker">Potrivire aromatică</p><h2>Unde lucrează bine</h2><p>${esc(cleanText(atom.classes || 'Lichide tutunoase simple și complexe, calibrate după airflow, cameră și build.'))}</p></div><div class="documentation-summary"><b>Documentare disponibilă</b><span>${directCount} surse directe</span><span>${builds.length} builduri de pornire</span></div></section>
  <section class="catalog-section"><div class="section-heading"><p class="kicker">Builduri</p><h2>Puncte de pornire</h2></div><div class="grid">${builds.map(build => `<article class="card wide"><span class="chip">${esc(cleanText(build.wire || build.type || 'Build MTL'))}</span><h3>${esc(cleanText(build.type || 'Configurație'))}</h3><p>${esc(cleanText(build.build || 'Se calibrează după lichid și airflow.'))}</p></article>`).join('')}</div></section>
  <section class="catalog-section dark-band"><div class="section-heading"><p class="kicker">Arhitectură și utilizare</p><h2>Repere pentru cameră, deck și airflow</h2></div><p class="lead">${esc(cleanText(atom.dna || 'Camera, deckul și airflow-ul definesc felul în care este redat profilul aromatic.'))}</p><p>Poziția coilului, deschiderea aerului și densitatea bumbacului se ajustează gradual. O singură modificare odată permite evaluarea corectă a atomizorului și a lichidului.</p></section>
  <section class="catalog-section"><div class="section-heading"><p class="kicker">Surse</p><h2>Documentare și exemple practice</h2></div><div class="source-grid">${sources.map(source => `<a class="source-item" href="${esc(sourceUrl(source))}" target="_blank" rel="noreferrer"><span>${esc(sourceLabel(source))}</span><b>${esc(host(sourceUrl(source)))}</b><small>${esc(sourceClaim(source))}</small></a>`).join('')}</div></section>
  <div class="safe"><b>Utilizare orientativă.</b> Rezultatul se verifică printr-un build stabil, aceeași cantitate de bumbac și modificarea unui singur parametru odată.</div>
</main>
${footer()}
</body>
</html>\n`;
}

const LIQUID_CLUSTERS = [
  { slug: 'net-virginia', title: 'NET Virginia', pattern: /virginia/i, group: /NET/i, description: 'Profiluri Virginia luminoase, mature sau roșii, cu atomizoare și sârme pentru claritate și dulceață naturală controlată.' },
  { slug: 'net-burley', title: 'NET Burley', pattern: /burley/i, group: /NET/i, description: 'Profiluri Burley seci, nucose și pământii, cu builduri care păstrează corpul fără îndulcire artificială.' },
  { slug: 'net-kentucky-latakia', title: 'NET Kentucky și Latakia', pattern: /kentucky|latakia|fire[- ]?cured|dark[- ]?fired/i, group: /NET/i, description: 'Tutunuri afumate și robuste, cu repere pentru corp, hit, cameră și temperatură controlată.' },
  { slug: 'net-oriental-perique', title: 'NET Oriental și Perique', pattern: /oriental|turkish|perique/i, group: /NET/i, description: 'Condimente, floral și fermentație, păstrate prin camere precise și sârme cu separare bună.' },
  { slug: 'net-cigar-pipe', title: 'NET Cigar și Pipe', pattern: /cigar|cigarillo|pipe|cavendish/i, group: /NET/i, description: 'Profiluri cigar, pipe și Cavendish naturale, de la uscăciune lemnoasă la corp rotund.' },
  { slug: 'tutun-aromatizat', title: 'TUTUN aromatizat', pattern: /vanilie|caramel|cafea|cacao|ciocolata|rom|bourbon|biscuit|nuci|crema|miere/i, group: /TUTUN|Tutun/i, description: 'Tutunuri aromatizate simple și complexe, calibrate pentru a păstra baza de tutun în fața toppingului.' }
];

function profileText(profile) {
  return [profile.group, profile.name, ...(profile.tags || []), profile.note, profile.wire, profile.avoid].filter(Boolean).join(' ');
}

function liquidClusterPage(cluster, profiles, generatedAtomSlugs) {
  const matches = profiles.filter(profile => cluster.group.test(profile.group || '') && cluster.pattern.test(profileText(profile))).slice(0, 24);
  const atomNames = [];
  const wires = [];
  matches.forEach(profile => {
    (profile.top || []).forEach(name => { if (!atomNames.includes(name)) atomNames.push(name); });
    String(profile.wire || '').split('/').forEach(wire => { const clean = cleanText(wire); if (clean && !wires.includes(clean)) wires.push(clean); });
  });
  const canonical = `${SITE}/lichide/${cluster.slug}/`;
  const atomLink = name => {
    const slug = slugify(publicAtomName(name));
    return generatedAtomSlugs.has(slug) ? `/atomizoare/${slug}/` : `/#atomizor/${slug}`;
  };
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${cluster.title} pentru RTA MTL`,
    description: cluster.description,
    url: canonical,
    inLanguage: 'ro-RO',
    dateModified: TODAY,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: matches.slice(0, 12).map((profile, index) => ({ '@type': 'ListItem', position: index + 1, name: profile.name }))
    }
  };
  return `${pageHead({ title: `${cluster.title} pentru RTA MTL - atomizoare și sârme`, description: cluster.description, canonical, image: `${SITE}/assets/rta-hero-background.png`, jsonLd })}
<body>
${topBar()}
<main class="wrap catalog-detail">
  <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/lichide/clase/">Clase lichide</a><span>/</span><b>${esc(cluster.title)}</b></nav>
  <section class="hero"><p class="kicker">Clasă aromatică</p><h1>${esc(cluster.title)} pentru RTA MTL</h1><p class="lead">${esc(cluster.description)}</p><div class="actions"><a class="btn" href="/#recommender">Primește recomandarea</a><a class="btn secondary" href="/#profiles">Toate clasele</a></div></section>
  <section class="catalog-section"><div class="section-heading"><p class="kicker">Profiluri</p><h2>Subcategorii relevante</h2></div><div class="grid">${matches.map(profile => `<article class="card wide"><span class="chip blue">${esc(cleanText(profile.group))}</span><h3>${esc(cleanText(profile.name))}</h3><p>${esc(cleanText(profile.note))}</p><p><b>Sârme:</b> ${esc(cleanText(profile.wire))}</p><p class="muted"><b>De evitat:</b> ${esc(cleanText(profile.avoid))}</p></article>`).join('')}</div></section>
  <section class="catalog-section dark-band"><div class="section-heading"><p class="kicker">Atomizoare</p><h2>Potriviri pentru această clasă</h2></div><div class="link-list">${atomNames.slice(0, 16).map(name => `<a class="topic" href="${esc(atomLink(name))}">${esc(publicAtomName(name))}<span>profil</span></a>`).join('')}</div></section>
  <section class="catalog-section"><div class="section-heading"><p class="kicker">Sârme</p><h2>Direcții de build</h2></div><div class="grid">${wires.slice(0, 12).map(wire => `<article class="card wide"><span class="chip green">Build MTL</span><h3>${esc(wire)}</h3><p>Se calibrează după camera atomizorului, airflow și intenția de gust.</p></article>`).join('')}</div></section>
  <div class="safe"><b>Triangulare.</b> Clasa lichidului stabilește direcția, atomizorul modelează camera și aerul, iar sârma reglează viteza, corpul și separarea.</div>
</main>
${footer()}
</body>
</html>\n`;
}

function atomIndexPage(atoms) {
  const canonical = `${SITE}/atomizoare/`;
  const description = `${atoms.length} de profiluri RTA MTL documentate cu builduri, potriviri pentru NET și TUTUN, surse și acces la comparator.`;
  const jsonLd = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Atomizoare RTA MTL documentate', description, url: canonical, mainEntity: { '@type': 'ItemList', itemListElement: atoms.slice(0, 60).map((atom, index) => ({ '@type': 'ListItem', position: index + 1, name: publicAtomName(atom.name), url: `${SITE}/atomizoare/${slugify(publicAtomName(atom.name))}/` })) } };
  return `${pageHead({ title: 'Atomizoare RTA MTL documentate - builduri și surse', description, canonical, image: `${SITE}/assets/rta-hero-background.png`, jsonLd })}
<body>${topBar()}<main class="wrap catalog-detail"><section class="hero"><p class="kicker">Bibliotecă RTA MTL</p><h1>Atomizoare documentate</h1><p class="lead">Pagini individuale pentru modelele cu date suficiente despre potrivire, builduri și surse.</p><div class="actions"><a class="btn" href="/#comparator">Comparator RTA</a><a class="btn secondary" href="/#atomizers">Catalog interactiv</a></div></section><section class="catalog-section"><div class="catalog-directory">${atoms.map(atom => `<a class="directory-item" href="/atomizoare/${esc(slugify(publicAtomName(atom.name)))}/"><b>${esc(publicAtomName(atom.name))}</b><span>${esc(cleanText(atom.classes || 'RTA MTL pentru tutun și NET').slice(0, 105))}</span></a>`).join('')}</div></section></main>${footer()}</body></html>\n`;
}

function liquidIndexPage() {
  const canonical = `${SITE}/lichide/clase/`;
  const description = 'Clase de lichide NET și TUTUN pentru alegerea atomizorului RTA MTL și a sârmei potrivite.';
  const jsonLd = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Clase lichide NET și TUTUN', description, url: canonical, mainEntity: { '@type': 'ItemList', itemListElement: LIQUID_CLUSTERS.map((cluster, index) => ({ '@type': 'ListItem', position: index + 1, name: cluster.title, url: `${SITE}/lichide/${cluster.slug}/` })) } };
  return `${pageHead({ title: 'Clase lichide NET și TUTUN pentru RTA MTL', description, canonical, image: `${SITE}/assets/rta-hero-background.png`, jsonLd })}<body>${topBar()}<main class="wrap catalog-detail"><section class="hero"><p class="kicker">NET și TUTUN</p><h1>Clase aromatice pentru RTA MTL</h1><p class="lead">Profilurile sunt grupate după frunza de tutun, complexitate și intenția de gust.</p><div class="actions"><a class="btn" href="/#recommender">Recomandare</a><a class="btn secondary" href="/#profiles">Taxonomia completă</a></div></section><section class="catalog-section"><div class="grid">${LIQUID_CLUSTERS.map(cluster => `<article class="card wide"><span class="chip">Clasă aromatică</span><h2>${esc(cluster.title)}</h2><p>${esc(cluster.description)}</p><a class="btn secondary" href="/lichide/${esc(cluster.slug)}/">Deschide ghidul</a></article>`).join('')}</div></section></main>${footer()}</body></html>\n`;
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function updateGeneratedBlock(filePath, startMarker, endMarker, content, beforeToken) {
  let source = fs.readFileSync(filePath, 'utf8');
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker);
  const block = `${startMarker}\n${content}\n${endMarker}`;
  if (start >= 0 && end > start) source = `${source.slice(0, start)}${block}${source.slice(end + endMarker.length)}`;
  else source = source.replace(beforeToken, `${block}\n${beforeToken}`);
  fs.writeFileSync(filePath, source, 'utf8');
}

function sitemapEntry(url, priority, image) {
  return `  <url>\n    <loc>${xml(url)}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>${image ? `\n    <image:image><image:loc>${xml(image)}</image:loc></image:image>` : ''}\n  </url>`;
}

function main() {
  const catalog = loadCatalog(ROOT);
  const atoms = catalog.atomizers.filter(atom => atomizerValidation(atom).comparable).sort((a, b) => publicAtomName(a.name).localeCompare(publicAtomName(b.name)));
  const generatedAtomSlugs = new Set(atoms.map(atom => slugify(publicAtomName(atom.name))));
  atoms.forEach(atom => writeFile(path.join(ROOT, 'atomizoare', slugify(publicAtomName(atom.name)), 'index.html'), atomPage(atom)));
  writeFile(path.join(ROOT, 'atomizoare', 'index.html'), atomIndexPage(atoms));
  LIQUID_CLUSTERS.forEach(cluster => writeFile(path.join(ROOT, 'lichide', cluster.slug, 'index.html'), liquidClusterPage(cluster, catalog.profiles, generatedAtomSlugs)));
  writeFile(path.join(ROOT, 'lichide', 'clase', 'index.html'), liquidIndexPage());

  const urls = [
    sitemapEntry(`${SITE}/en/`, '0.95'),
    sitemapEntry(`${SITE}/atomizoare/`, '0.94'),
    ...atoms.map(atom => sitemapEntry(`${SITE}/atomizoare/${slugify(publicAtomName(atom.name))}/`, '0.78', atomPageImage(atom))),
    sitemapEntry(`${SITE}/lichide/clase/`, '0.91'),
    ...LIQUID_CLUSTERS.map(cluster => sitemapEntry(`${SITE}/lichide/${cluster.slug}/`, '0.82'))
  ];
  updateGeneratedBlock(path.join(ROOT, 'sitemap.xml'), '<!-- GENERATED-CATALOG-START -->', '<!-- GENERATED-CATALOG-END -->', urls.join('\n'), '</urlset>');

  const llmLines = [
    '- English application: https://ghid-rta.ro/en/',
    '- Atomizer library: https://ghid-rta.ro/atomizoare/',
    ...atoms.map(atom => `- ${publicAtomName(atom.name)}: ${SITE}/atomizoare/${slugify(publicAtomName(atom.name))}/`),
    '- Liquid class library: https://ghid-rta.ro/lichide/clase/',
    ...LIQUID_CLUSTERS.map(cluster => `- ${cluster.title}: ${SITE}/lichide/${cluster.slug}/`)
  ];
  updateGeneratedBlock(path.join(ROOT, 'llms.txt'), '# GENERATED-CATALOG-START', '# GENERATED-CATALOG-END', llmLines.join('\n'), '## Scope');
  console.log(`Catalog pages: ${atoms.length} atomizers and ${LIQUID_CLUSTERS.length} liquid classes generated.`);
}

main();
