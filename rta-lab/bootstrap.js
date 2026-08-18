(() => {
  const VERSION = "10";
  let reloading = false;

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

  window.addEventListener("load", () => {
    Promise.allSettled([cleanLegacyCaches(), installFreshWorker()]);
  });
})();
