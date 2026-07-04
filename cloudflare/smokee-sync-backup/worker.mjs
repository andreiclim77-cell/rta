const DEFAULT_OWNER = "andreiclim77-cell";
const DEFAULT_REPO = "rta";
const DEFAULT_WORKFLOW = "smokee-rta-sync.yml";
const DEFAULT_REF = "main";
const ROMANIA_TZ = "Europe/Bucharest";

function envValue(env, key, fallback) {
  return env && env[key] ? String(env[key]) : fallback;
}

function romaniaClockParts(timestamp) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: ROMANIA_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(timestamp));
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    hour: Number(map.hour),
    minute: Number(map.minute),
  };
}

function isRomaniaSixWindow(timestamp) {
  return romaniaClockParts(timestamp).hour === 6;
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

async function dispatchSmokeeWorkflow(env) {
  const token = envValue(env, "GITHUB_TOKEN", "");
  if (!token) {
    throw new Error("Missing GITHUB_TOKEN secret.");
  }

  const owner = envValue(env, "GITHUB_OWNER", DEFAULT_OWNER);
  const repo = envValue(env, "GITHUB_REPO", DEFAULT_REPO);
  const workflow = envValue(env, "GITHUB_WORKFLOW", DEFAULT_WORKFLOW);
  const ref = envValue(env, "GITHUB_REF", DEFAULT_REF);
  const endpoint =
    "https://api.github.com/repos/" +
    encodeURIComponent(owner) +
    "/" +
    encodeURIComponent(repo) +
    "/actions/workflows/" +
    encodeURIComponent(workflow) +
    "/dispatches";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      accept: "application/vnd.github+json",
      authorization: "Bearer " + token,
      "content-type": "application/json",
      "user-agent": "ghid-rta-smokee-sync-backup",
      "x-github-api-version": "2022-11-28",
    },
    body: JSON.stringify({ ref }),
  });

  if (response.status !== 204) {
    const body = await response.text();
    throw new Error("GitHub dispatch failed: " + response.status + " " + body.slice(0, 400));
  }

  return { ok: true, owner, repo, workflow, ref };
}

export default {
  async scheduled(controller, env) {
    const scheduledTime = controller && controller.scheduledTime ? controller.scheduledTime : Date.now();
    if (!isRomaniaSixWindow(scheduledTime)) {
      console.log("Skipped outside 06:00 Romania window.");
      return;
    }
    const result = await dispatchSmokeeWorkflow(env);
    console.log("Smokee workflow dispatched.", result);
  },

  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return jsonResponse({
        ok: true,
        worker: "ghid-rta-smokee-sync-backup",
      });
    }

    if (url.pathname === "/trigger" && request.method === "POST") {
      const expected = envValue(env, "TRIGGER_TOKEN", "");
      const received = request.headers.get("x-trigger-token") || "";
      if (!expected || received !== expected) {
        return jsonResponse({ ok: false }, 404);
      }
      try {
        return jsonResponse(await dispatchSmokeeWorkflow(env));
      } catch (error) {
        return jsonResponse({ ok: false, error: String(error && error.message ? error.message : error) }, 500);
      }
    }

    return jsonResponse({
      ok: true,
      service: "Smokee Catalog Sync backup",
      schedule: "06:05 and 06:35 Romania, guarded by local time",
    });
  },
};
