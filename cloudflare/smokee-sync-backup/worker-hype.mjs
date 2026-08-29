import baseWorker from './worker.mjs';

const HYPE_WORKFLOW = 'market-hype-72h.yml';
const HYPE_REFRESH_PATH = '/__smokee-sync-backup/hype-refresh';
const HYPE_REFRESH_KEY = 'hype-refresh:last-dispatch';
const MIN_REFRESH_GAP_MS = 10 * 60 * 1000;

function value(env, key, fallback = '') {
  return env && env[key] ? String(env[key]) : fallback;
}

function headers(request) {
  const origin = request.headers.get('origin') || '';
  const allowed = /^https:\/\/(?:www\.)?ghid-rta\.ro$/i.test(origin);
  return {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'access-control-allow-origin': allowed ? origin : 'https://ghid-rta.ro',
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-max-age': '86400',
    vary: 'Origin'
  };
}

function json(request, payload, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: headers(request) });
}

async function github(env, endpoint, options = {}) {
  const token = value(env, 'GITHUB_TOKEN');
  if (!token) throw new Error('GitHub dispatch unavailable');
  return fetch(endpoint, {
    ...options,
    headers: {
      accept: 'application/vnd.github+json',
      authorization: 'Bearer ' + token,
      'content-type': 'application/json',
      'user-agent': 'ghid-rta-hype-refresh',
      'x-github-api-version': '2022-11-28',
      ...(options.headers || {})
    }
  });
}

function workflowBase(env) {
  const owner = value(env, 'GITHUB_OWNER', 'andreiclim77-cell');
  const repo = value(env, 'GITHUB_REPO', 'rta');
  return `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/actions/workflows/${encodeURIComponent(HYPE_WORKFLOW)}`;
}

async function activeRun(env) {
  const ref = value(env, 'GITHUB_REF', 'main');
  const response = await github(env, `${workflowBase(env)}/runs?branch=${encodeURIComponent(ref)}&per_page=8`);
  if (!response.ok) return false;
  const payload = await response.json();
  return (payload.workflow_runs || []).some(run => run && (run.status === 'queued' || run.status === 'in_progress'));
}

async function dispatch(env) {
  const ref = value(env, 'GITHUB_REF', 'main');
  const response = await github(env, `${workflowBase(env)}/dispatches`, {
    method: 'POST',
    body: JSON.stringify({ ref })
  });
  if (response.status !== 204) throw new Error('Hype refresh dispatch failed: ' + response.status);
}

async function hypeRefresh(request, env) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: headers(request) });
  const origin = request.headers.get('origin') || '';
  if (request.method !== 'POST' || !/^https:\/\/(?:www\.)?ghid-rta\.ro$/i.test(origin)) return json(request, { ok: false }, 404);
  if (!env.RTA_METRICS) return json(request, { ok: false, kind: 'hype-refresh', state: 'throttle-unavailable' }, 503);

  const now = Date.now();
  const previous = Number(await env.RTA_METRICS.get(HYPE_REFRESH_KEY) || 0);
  if (previous && now - previous < MIN_REFRESH_GAP_MS) {
    return json(request, { ok: true, kind: 'hype-refresh', state: 'recently-requested' });
  }

  try {
    if (await activeRun(env)) {
      await env.RTA_METRICS.put(HYPE_REFRESH_KEY, String(now), { expirationTtl: 3600 });
      return json(request, { ok: true, kind: 'hype-refresh', state: 'already-running' });
    }
    await dispatch(env);
    await env.RTA_METRICS.put(HYPE_REFRESH_KEY, String(now), { expirationTtl: 3600 });
    return json(request, { ok: true, kind: 'hype-refresh', state: 'dispatched' });
  } catch (error) {
    return json(request, { ok: false, kind: 'hype-refresh', state: 'error' }, 503);
  }
}

export default {
  async scheduled(controller, env, context) {
    return baseWorker.scheduled(controller, env, context);
  },
  async fetch(request, env, context) {
    const url = new URL(request.url);
    if (url.pathname === HYPE_REFRESH_PATH) return hypeRefresh(request, env);
    return baseWorker.fetch(request, env, context);
  }
};
