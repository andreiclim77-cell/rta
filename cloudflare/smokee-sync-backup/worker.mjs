const DEFAULT_OWNER = "andreiclim77-cell";
const DEFAULT_REPO = "rta";
const DEFAULT_WORKFLOW = "smokee-rta-sync.yml";
const DEFAULT_REF = "main";
const SMOKEE_MEDIA_PREFIX = "/media/smokee/";
const ANALYTICS_PATH = "/__rta-event";
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

function analyticsCors(request) {
  const origin = request.headers.get("origin") || "";
  const allowed = /^https:\/\/(?:www\.)?ghid-rta\.ro$/i.test(origin);
  return {
    "access-control-allow-origin": allowed ? origin : "https://ghid-rta.ro",
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
    vary: "Origin"
  };
}

function analyticsValue(value, limit = 80) {
  return String(value == null ? "" : value).replace(/[\r\n\t]/g, " ").slice(0, limit);
}

async function recordAnalytics(request, env) {
  const headers = analyticsCors(request);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
  const origin = request.headers.get("origin") || "";
  if (request.method !== "POST" || !/^https:\/\/(?:www\.)?ghid-rta\.ro$/i.test(origin)) {
    return new Response(null, { status: 404, headers });
  }

  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return jsonResponse({ ok: false }, 400);
  }
  const event = analyticsValue(payload && payload.event, 32);
  if (!/^(page_view|tool_open|tool_complete|search_submit|smokee_click|guide_open|client_error|web_vital)$/.test(event)) {
    return jsonResponse({ ok: false }, 400);
  }

  if (env.RTA_ANALYTICS) {
    env.RTA_ANALYTICS.writeDataPoint({
      blobs: [
        event,
        analyticsValue(payload.language, 8),
        analyticsValue(payload.route, 64),
        analyticsValue(payload.tool, 40),
        analyticsValue(payload.device, 16),
        analyticsValue(payload.metric, 16),
        analyticsValue(request.cf && request.cf.country || "unknown", 8)
      ],
      doubles: [1, Number.isFinite(Number(payload.value)) ? Number(payload.value) : 0],
      indexes: [event]
    });
  }
  console.log("rta_event", JSON.stringify({
    event,
    language: analyticsValue(payload.language, 8),
    route: analyticsValue(payload.route, 64),
    tool: analyticsValue(payload.tool, 40),
    device: analyticsValue(payload.device, 16),
    metric: analyticsValue(payload.metric, 16),
    value: Number.isFinite(Number(payload.value)) ? Number(payload.value) : 0
  }));
  return new Response(null, { status: 204, headers: { ...headers, "cache-control": "no-store" } });
}

function mediaSourceUrl(url) {
  if (!url.pathname.startsWith(SMOKEE_MEDIA_PREFIX)) return null;
  const relative = url.pathname.slice(SMOKEE_MEDIA_PREFIX.length);
  if (!/^wp-content\/uploads\//i.test(relative) || relative.includes("..") || relative.includes("\\")) return null;
  const source = new URL(`https://smokee.ro/${relative}`);
  source.search = url.search;
  return source;
}

async function cachedSmokeeMedia(request, url, context) {
  if (request.method !== "GET" && request.method !== "HEAD") return new Response("Method not allowed", { status: 405 });
  const source = mediaSourceUrl(url);
  if (!source) return new Response("Not found", { status: 404 });

  const cache = caches.default;
  const cacheKey = new Request(url.toString(), { method: "GET" });
  const cached = await cache.match(cacheKey);
  if (cached) return request.method === "HEAD" ? new Response(null, cached) : cached;

  const upstream = await fetch(source, {
    headers: {
      accept: request.headers.get("accept") || "image/avif,image/webp,image/*,*/*;q=0.8",
      "user-agent": "ghid-rta-media-cache/1.0"
    },
    redirect: "follow",
    cf: { cacheEverything: true, cacheTtl: 604800 }
  });
  const type = upstream.headers.get("content-type") || "";
  if (!upstream.ok || !/^image\//i.test(type)) return new Response("Image unavailable", { status: upstream.status || 502 });

  const headers = new Headers(upstream.headers);
  headers.set("cache-control", "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000");
  headers.set("x-content-type-options", "nosniff");
  headers.set("referrer-policy", "no-referrer");
  headers.delete("set-cookie");
  const response = new Response(request.method === "HEAD" ? null : upstream.body, {
    status: upstream.status,
    headers
  });
  if (request.method === "GET") context.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
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

  async fetch(request, env, context) {
    const url = new URL(request.url);
    if (url.pathname === ANALYTICS_PATH) return recordAnalytics(request, env);
    if (url.pathname.startsWith(SMOKEE_MEDIA_PREFIX)) {
      try {
        return await cachedSmokeeMedia(request, url, context);
      } catch (error) {
        return new Response("Image unavailable", { status: 502 });
      }
    }
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
