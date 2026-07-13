const DEFAULT_OWNER = "andreiclim77-cell";
const DEFAULT_REPO = "rta";
const DEFAULT_WORKFLOW = "smokee-rta-sync.yml";
const DEFAULT_REF = "main";
const SMOKEE_MEDIA_PREFIX = "/media/smokee/";
const ANALYTICS_PATH = "/__rta-event";
const METRICS_PATH = "/__rta-metrics";
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
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
    vary: "Origin"
  };
}

function analyticsValue(value, limit = 80) {
  return String(value == null ? "" : value).replace(/[\r\n\t]/g, " ").slice(0, limit);
}

function metricDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Bucharest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date).reduce((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function incrementMetric(map, key, limit = 40) {
  const clean = analyticsValue(key || "unknown", 64) || "unknown";
  if (!Object.prototype.hasOwnProperty.call(map, clean) && Object.keys(map).length >= limit) {
    map.other = (map.other || 0) + 1;
    return;
  }
  map[clean] = (map[clean] || 0) + 1;
}

async function updateMetricSummary(payload, request, env) {
  if (!env.RTA_METRICS) return;
  const date = metricDate();
  const key = `metrics:${date}`;
  const current = await env.RTA_METRICS.get(key, "json") || {
    schemaVersion: 1,
    date,
    updatedAt: "",
    events: {},
    routes: {},
    tools: {},
    devices: {},
    languages: {},
    countries: {}
  };
  const event = analyticsValue(payload.event, 32);
  incrementMetric(current.events, event, 20);
  if (payload.route) incrementMetric(current.routes, payload.route, 50);
  if (payload.tool) incrementMetric(current.tools, payload.tool, 40);
  if (payload.device) incrementMetric(current.devices, payload.device, 10);
  if (payload.language) incrementMetric(current.languages, payload.language, 10);
  incrementMetric(current.countries, request.cf && request.cf.country || "unknown", 40);
  current.updatedAt = new Date().toISOString();
  await env.RTA_METRICS.put(key, JSON.stringify(current), { expirationTtl: 60 * 60 * 24 * 400 });
}

function mergeMetricMap(target, source) {
  Object.entries(source || {}).forEach(([key, value]) => {
    target[key] = (target[key] || 0) + Number(value || 0);
  });
}

function sortedMetricRows(map, limit = 12) {
  return Object.entries(map || {})
    .map(([name, value]) => ({ name, value: Number(value || 0) }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name))
    .slice(0, limit);
}

async function readMetricSummary(request, env) {
  const headers = analyticsCors(request);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (request.method !== "GET" || !env.RTA_METRICS) return jsonResponse({ ok: false }, 404);
  const url = new URL(request.url);
  const days = Math.min(90, Math.max(7, Number(url.searchParams.get("days") || 30)));
  const dates = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    dates.push(metricDate(new Date(Date.now() - offset * 86400000)));
  }
  const rows = await Promise.all(dates.map(date => env.RTA_METRICS.get(`metrics:${date}`, "json")));
  const totals = { events: {}, routes: {}, tools: {}, devices: {}, languages: {}, countries: {} };
  const daily = dates.map((date, index) => {
    const row = rows[index] || {};
    Object.keys(totals).forEach(key => mergeMetricMap(totals[key], row[key]));
    return {
      date,
      pageViews: Number(row.events && row.events.page_view || 0),
      toolOpens: Number(row.events && row.events.tool_open || 0),
      searches: Number(row.events && row.events.search_submit || 0),
      smokeeClicks: Number(row.events && row.events.smokee_click || 0)
    };
  });
  return new Response(JSON.stringify({
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    days,
    totals: {
      pageViews: Number(totals.events.page_view || 0),
      toolOpens: Number(totals.events.tool_open || 0),
      toolCompletions: Number(totals.events.tool_complete || 0),
      searches: Number(totals.events.search_submit || 0),
      smokeeClicks: Number(totals.events.smokee_click || 0),
      clientErrors: Number(totals.events.client_error || 0)
    },
    routes: sortedMetricRows(totals.routes),
    tools: sortedMetricRows(totals.tools),
    devices: sortedMetricRows(totals.devices, 6),
    languages: sortedMetricRows(totals.languages, 6),
    countries: sortedMetricRows(totals.countries, 10),
    daily
  }), {
    status: 200,
    headers: { ...headers, "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=60" }
  });
}

async function recordAnalytics(request, env, context) {
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
  if (context && env.RTA_METRICS) {
    context.waitUntil(updateMetricSummary(payload, request, env).catch(error => console.log("rta_metric_summary_error", String(error))));
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
    if (url.pathname === ANALYTICS_PATH) return recordAnalytics(request, env, context);
    if (url.pathname === METRICS_PATH) return readMetricSummary(request, env);
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
