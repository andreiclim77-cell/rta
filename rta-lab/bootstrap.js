(() => {
  const VERSION = "10";
  let reloading = false;

  function installContinuityPanel() {
    if (document.getElementById("rtaContinuityPanel")) return;
    const main = document.querySelector("main.wrap");
    if (!main) return;

    const panel = document.createElement("section");
    panel.id = "rtaContinuityPanel";
    panel.className = "panel";
    panel.innerHTML = `
      <div class="ptitle">
        <div class="num">↻</div>
        <div>
          <h3>Arhivă de continuitate · MASTER</h3>
          <p>Sursa canonică pentru reluarea proiectului Rta în orice conversație nouă.</p>
        </div>
      </div>
      <div class="info" style="display:block;margin-bottom:12px">
        <p><b>Într-o discuție nouă spune exact:</b> „du-te în Lab și actualizează-te!”</p>
        <p>Asistentul va citi mai întâi <code>andreiclim77-cell/rta · main · rta-lab/RTA_CONTINUITY_MASTER.md</code>, apoi validările Lab curente.</p>
        <p><b>„salvează”</b> = persistă concluzia acceptată în arhiva canonică. <b>„da mi arhiva de continuitate la zi”</b> = generează și livrează arhiva completă cea mai nouă.</p>
      </div>
      <a class="freeprofile" href="./RTA_CONTINUITY_MASTER.md?v=10" download="RTA_CONTINUITY_MASTER.md" style="display:block;text-align:center;text-decoration:none;box-sizing:border-box">
        DESCARCĂ ARHIVA MASTER
      </a>`;

    const hero = main.querySelector(".hero");
    if (hero && hero.nextSibling) main.insertBefore(panel, hero.nextSibling);
    else if (hero) hero.insertAdjacentElement("afterend", panel);
    else main.insertBefore(panel, main.firstChild);
  }

  async function cleanLegacyCaches() {
    if (!("caches" in window)) return;
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => key.startsWith("rta-lab-") && !key.includes("v10-"))
      .map(key => caches.delete(key)));
  }

  async function installFreshWorker() {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloading) return;
      reloading = true;
      location.reload();
    });

    const registration = await navigator.serviceWorker.register(`./sw.js?v=${VERSION}`, {
      scope: "./",
      updateViaCache: "none"
    });

    await registration.update();
    if (registration.waiting) registration.waiting.postMessage("SKIP_WAITING");
  }

  document.addEventListener("DOMContentLoaded", installContinuityPanel);
  window.addEventListener("load", () => {
    installContinuityPanel();
    Promise.allSettled([cleanLegacyCaches(), installFreshWorker()]);
  });
})();
