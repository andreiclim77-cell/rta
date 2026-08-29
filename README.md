# Ghid RTA MTL

Ghid interactiv pentru atomizoare RTA MTL, profile de tutun, build-uri, sarme si surse.

Pagina principala este `index.html` si poate fi publicata direct prin GitHub Pages.

## Pagini SEO

Pe langa aplicatia principala exista pagini tematice indexabile:

- `en/index.html` pentru URL-ul canonic in engleza `https://ghid-rta.ro/en/`
- `atomizoare/index.html` si pagini individuale generate numai pentru modelele cu date suficiente
- `lichide/clase/index.html` si sase ghiduri editoriale NET/TUTUN

- `ghid-rta-mtl.html`
- `start.html`
- `ce-atomizor-rta-mtl-aleg.html`
- `recomandari-rta-mtl.html`
- `atomizoare-rta-mtl.html`
- `lichide-net-tutun.html`
- `sarme-rta-builduri.html`
- `net-rta-mtl.html`
- `tutun-rta-mtl.html`
- `builduri-mtl-sarme-rta.html`
- `airflow-camera-rta-mtl.html`
- `control-temperatura-mtl.html`
- `nife30-control-temperatura-mtl.html`
- `ss316l-mtl-rta.html`
- `clapton-mtl-rta.html`
- `kanthal-ni80-mtl-rta.html`
- `net-complex-rta-mtl.html`
- `ry4-tutun-dulce-rta-mtl.html`
- `bottom-side-airflow-rta-mtl.html`
- `diagnostic-gust-rta-mtl.html`
- `calculator-lichide-vape.html`
- `consumabile-rta-smokee.html`
- `wizard-smokee.html`
- `rta-mtl-smokee.html`
- `legislativ-vape.html`
- `smokee-link-kit.html`

Pentru WhatsApp, profiluri si QR, linkul recomandat este `https://ghid-rta.ro/start.html`.

Pentru expunere din Smokee, pagina recomandata pentru materiale si linkuri este `smokee-link-kit.html`, iar linkul public principal ramane `https://ghid-rta.ro/`.

SEO operational:

- `sitemap.xml` listeaza aplicatia si paginile tematice indexabile.
- `robots.txt` permite indexarea si indica sitemap-ul.
- `llms.txt` ofera un rezumat pentru cautari asistate de AI.
- IndexNow este configurat prin `tools/submit-indexnow.js` si workflow-ul `Submit URLs to IndexNow`.
- Sincronizarea directa ruleaza la 06:00 si 06:20, ora Romaniei, cu ultima baza valida pastrata daca sursa nu raspunde.
- Imaginile Smokee sunt servite prin cache-ul Worker-ului Cloudflare, nu cerute direct de browser de la magazin.
- `RTA Guide Quality Gate` verifica automat sintaxa, catalogul, canonical-urile, sitemap-ul si regula Noutati de sapte zile.
