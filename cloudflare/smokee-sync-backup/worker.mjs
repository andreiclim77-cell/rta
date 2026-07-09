const DEFAULT_OWNER = "andreiclim77-cell";
const DEFAULT_REPO = "rta";
const DEFAULT_WORKFLOW = "smokee-rta-sync.yml";
const DEFAULT_REF = "main";
function envValue(env, key, fallback) {
  return env && env[key] ? String(env[key]) : fallback;
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

function workflowEndpoint(env) {
  const owner = envValue(env, "GITHUB_OWNER", DEFAULT_OWNER);
  const repo = envValue(env, "GITHUB_REPO", DEFAULT_REPO);
  const workflow = envValue(env, "GITHUB_WORKFLOW", DEFAULT_WORKFLOW);
  const base =
    "https://api.github.com/repos/" +
    encodeURIComponent(owner) +
    "/" +
    encodeURIComponent(repo) +
    "/actions/workflows/" +
    encodeURIComponent(workflow);
  return { owner, repo, workflow, base };
}

function bucharestSyncWindow(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Bucharest",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date).reduce((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});
  const hour = parts.hour || "00";
  const minute = Number(parts.minute || "0");
  const run = hour === "06" && ((minute >= 0 && minute < 10) || (minute >= 20 && minute < 30));
  return { run, label: `${hour}:${String(parts.minute || "00").padStart(2, "0")}` };
}

async function githubRequest(env, endpoint, options = {}) {
  const token = envValue(env, "GITHUB_TOKEN", "");
  if (!token) {
    throw new Error("Missing GITHUB_TOKEN secret.");
  }

  return fetch(endpoint, {
    ...options,
    headers: {
      accept: "application/vnd.github+json",
      authorization: "Bearer " + token,
      "content-type": "application/json",
      "user-agent": "ghid-rta-smokee-sync-backup",
      "x-github-api-version": "2022-11-28",
      ...(options.headers || {}),
    },
  });
}

async function hasActiveWorkflowRun(env) {
  const { base } = workflowEndpoint(env);
  const ref = envValue(env, "GITHUB_REF", DEFAULT_REF);
  const response = await githubRequest(env, `${base}/runs?branch=${encodeURIComponent(ref)}&per_page=10`);
  if (!response.ok) {
    const body = await response.text();
    throw new Error("GitHub runs check failed: " + response.status + " " + body.slice(0, 400));
  }
  const payload = await response.json();
  const runs = Array.isArray(payload.workflow_runs) ? payload.workflow_runs : [];
  return runs.some((run) => run && (run.status === "queued" || run.status === "in_progress"));
}

async function dispatchSmokeeWorkflow(env) {
  const owner = envValue(env, "GITHUB_OWNER", DEFAULT_OWNER);
  const repo = envValue(env, "GITHUB_REPO", DEFAULT_REPO);
  const workflow = envValue(env, "GITHUB_WORKFLOW", DEFAULT_WORKFLOW);
  const ref = envValue(env, "GITHUB_REF", DEFAULT_REF);
  const { base } = workflowEndpoint(env);

  const response = await githubRequest(env, `${base}/dispatches`, {
    method: "POST",
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
    const window = bucharestSyncWindow();
    if (!window.run) {
      console.log("Skipped dispatch outside Bucharest 06:00/06:20 windows.", window);
      return;
    }
    if (await hasActiveWorkflowRun(env)) {
      console.log("Skipped dispatch because a Smokee workflow run is already queued or running.");
      return;
    }
    const result = await dispatchSmokeeWorkflow(env);
    console.log("Smokee workflow dispatched.", result);
  },

  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/__smokee-sync-backup/, "") || "/";

    if (path === "/health") {
      return jsonResponse({
        ok: true,
        worker: "ghid-rta-smokee-sync-backup",
        schedule: "Daily at 06:00 and 06:20 Bucharest time; skips when a sync is already running",
      });
    }

    if (path === "/trigger" && request.method === "POST") {
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
      schedule: "Daily at 06:00 and 06:20 Bucharest time; skips when a sync is already running",
    });
  },
};
