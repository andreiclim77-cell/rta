#!/usr/bin/env node

const fs = require('fs');

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const requireInstagram = args.includes('--require-instagram');

function oneLine(value) {
  return String(value || '').replace(/[\r\n]+/g, ' ').trim();
}

function classifyGraphError(error) {
  const code = Number(error && error.code);
  const subcode = Number(error && error.error_subcode);
  const message = oneLine(error && error.message).toLowerCase();
  if (code === 190 && (subcode === 463 || /expired|session has expired/.test(message))) return 'token_expired';
  if (code === 190) return 'token_invalid';
  if (code === 10 || code === 200 || /permission/.test(message)) return 'permission_missing';
  return 'graph_unavailable';
}

async function inspectMetaConnection(options = {}) {
  const pageId = oneLine(options.pageId);
  const accessToken = oneLine(options.accessToken);
  const graphVersion = oneLine(options.graphVersion) || 'v25.0';
  const fetchImpl = options.fetchImpl || global.fetch;
  const needsInstagram = Boolean(options.requireInstagram);

  if (!pageId || !accessToken) {
    return { ready: false, reason: 'missing_credentials' };
  }

  const fields = needsInstagram
    ? 'id,name,instagram_business_account{id,username}'
    : 'id,name';
  const url = new URL(`https://graph.facebook.com/${graphVersion}/${encodeURIComponent(pageId)}`);
  url.searchParams.set('fields', fields);

  try {
    const response = await fetchImpl(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.error) {
      const graphError = payload.error || { message: `HTTP ${response.status}` };
      return {
        ready: false,
        reason: classifyGraphError(graphError),
        detail: oneLine(graphError.message)
      };
    }
    if (String(payload.id || '') !== pageId) {
      return { ready: false, reason: 'page_mismatch' };
    }
    const instagram = payload.instagram_business_account || null;
    if (needsInstagram && !instagram?.id) {
      return { ready: false, reason: 'instagram_not_connected', pageName: oneLine(payload.name) };
    }
    return {
      ready: true,
      reason: 'ready',
      pageId,
      pageName: oneLine(payload.name),
      instagramId: oneLine(instagram && instagram.id),
      instagramUsername: oneLine(instagram && instagram.username)
    };
  } catch (error) {
    return { ready: false, reason: 'network_error', detail: oneLine(error && error.message) };
  }
}

function appendOutput(name, value) {
  if (!process.env.GITHUB_OUTPUT) return;
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${oneLine(value)}\n`);
}

function appendSummary(result) {
  if (!process.env.GITHUB_STEP_SUMMARY) return;
  const lines = result.ready
    ? [
        '### Meta connection ready',
        '',
        `Facebook Page: ${result.pageName || result.pageId}`,
        result.instagramId ? `Instagram: ${result.instagramUsername ? `@${result.instagramUsername}` : result.instagramId}` : ''
      ]
    : [
        '### Meta publication paused safely',
        '',
        `Reason: ${result.reason}`,
        'Catalog synchronization remains active. No social state was changed.'
      ];
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${lines.filter(Boolean).join('\n')}\n`);
}

async function main() {
  const result = await inspectMetaConnection({
    pageId: process.env.FACEBOOK_PAGE_ID,
    accessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
    graphVersion: process.env.FACEBOOK_GRAPH_VERSION,
    requireInstagram
  });

  appendOutput('ready', result.ready ? 'true' : 'false');
  appendOutput('reason', result.reason);
  appendOutput('page_id', result.pageId || '');
  appendOutput('instagram_id', result.instagramId || '');
  appendSummary(result);

  if (result.ready) {
    console.log(`Meta connection ready for ${result.pageName || result.pageId}.`);
    return;
  }

  console.warn(`Meta publication paused safely: ${result.reason}.`);
  if (strict) process.exitCode = 1;
}

if (require.main === module) {
  main().catch(error => {
    console.error(oneLine(error && error.message) || 'Meta connection check failed.');
    process.exitCode = strict ? 1 : 0;
  });
}

module.exports = { classifyGraphError, inspectMetaConnection, oneLine };
