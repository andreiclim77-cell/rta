# RTA Lab — punct de intrare pentru orice conversație nouă

**Comanda lui Andrei:** „Du-te în Lab și actualizează-te”.

## Unde se află sursa de adevăr

- Repository canonic: `https://github.com/andreiclim77-cell/rta`, ramura **`main`**, directorul `rta-lab/`.
- **Arhiva portabilă persistentă ÎN LAB:** `rta-lab/continuity/RTA_CONTINUITATE_CURENTA.zip` (același nume și aceeași cale la fiecare actualizare; nu crea copii paralele).
- Această pagină: `rta-lab/CONTINUITY_START_HERE.md`.
- Aplicația publică: `https://ghid-rta.ro/rta-lab/atlas/`. **Nu presupune că ultima versiune GitHub este deja publicată**: verifică separat ce afișează efectiv site-ul și starea GitHub Pages.

## Flux de reluare, obligatoriu

1. Citește **ultima versiune de pe `main`** a acestui document, apoi `RTA_CURRENT_HANDOFF.md`, `RTA_CONTINUITY_MASTER.md`, `RTA_ATLAS_DESIGN_BLUEPRINT.md`, `RTA_OPERATING_PROTOCOL.md` și fișa recentă `RTA_K1_FOUR_BUILDS_20261111.md`.
2. Deschide ZIP-ul din `rta-lab/continuity/`, verifică `MANIFEST_SHA256.json` și SHA-256 pentru fiecare fișier. ZIP-ul are `snapshot_commit`: commitul surselor din care s-a generat, care poate fi părintele commitului ce adaugă ZIP-ul; asta evită o referință circulară la propriul fișier.
3. Verifică diferențele apărute după acel `snapshot_commit` pe `main`. În caz de diferență, **documentele și codul mai noi din `main` au prioritate** față de ZIP; nu suprascrie accidental decizii recente.
4. Verifică independent pagina live, testele, release-ul și starea publicării. **Commit pe `main` nu înseamnă automat că publicul vede noua versiune.**
5. La „salvează”, actualizează codul/documentele, reconstruiește și testează release-ul, apoi **regenerează și înlocuiește fișierul ZIP exact în calea de mai sus** într-un commit nou, verifică manifestul și posibilitatea recuperării de pe GitHub. Biblioteca ChatGPT este o copie suplimentară, niciodată singurul loc pentru arhivă. Nu declara salvare reușită dacă un pas e blocat.

## Completare 13.11.2026 — tipul spirelor în 01A și 01B

Codul din `data/k1-geometry-20261111.js` și secțiunea „Actualizare 13.11.2026” din `RTA_K1_FOUR_BUILDS_20261111.md` au prioritate pentru **CONTACT/SPACED explicit pentru ambele K1** de pe prima poziție. Tipul indicat ca propunere inginerească nu dovedește montaj; preferințele contact/spaced istorice Prime/KX se păstrează. Verifică separat dacă Pages a publicat codul nou.

## Ultima regulă de build (11.11.2026)

În comparația HOME + Atomizer Atlas, **poziția 01 conține ambele variante Kanthal A1 K1 28 GA și 29 GA, fiecare Ø2,5 mm**, cu spirele și airflow-ul specifice platformei. Din fostele poziții **02–04** se elimină din afișaj **toate variantele cu fir K1 (`k128`, `k129`, `k1clap`)**. Rămân exclusiv buildurile istorice **NiFe30 / NiFe52 / SS Clapton**, fără modificarea conținutului și în aceeași ordine, renumerotate 02, 03, fără poziții goale. Este **numai un filtru de prezentare**; Wire Lab, `buildLeads()` și istoricul personal rămân intacte. GAIA Boro are numai 01 cu două ipoteze, fără scor validat.

**Status publicare la redactare:** sursele acestei reguli există deja pe `main` în commitul `a506d50`; observația directă a site-ului după acel commit a arătat încă versiunea anterioară. Re-verifică starea de deploy, nu presupune rezolvarea sa.
