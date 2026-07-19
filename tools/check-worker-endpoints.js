#!/usr/bin/env node

const ORIGIN = 'https://ghid-rta-smokee-sync-backup.ghid-rta-smokee.workers.dev';

(async () => {
  const failures = [];
  const health = await fetch(`${ORIGIN}/__smokee-sync-backup/health`);
  const healthData = health.ok ? await health.json() : null;
  if (!health.ok || !healthData || !healthData.ok || !/06:00.*06:20/.test(healthData.schedule || '')) failures.push(`health endpoint failed: ${health.status}`);

  const image = await fetch(`${ORIGIN}/media/smokee/wp-content/uploads/2026/01/ambition-mods-amazier-mtl-rta-black.jpg`, { method: 'HEAD' });
  if (!image.ok || !/^image\//i.test(image.headers.get('content-type') || '')) failures.push(`image cache failed: ${image.status}`);
  if (!/s-maxage=604800/.test(image.headers.get('cache-control') || '')) failures.push('image cache TTL is missing');

  const analytics = await fetch(`${ORIGIN}/__rta-event`, {
    method: 'POST',
    headers: { origin: 'https://ghid-rta.ro', 'content-type': 'application/json' },
    body: JSON.stringify({ event: 'page_view', language: 'ro', route: 'worker-check', device: 'automation' })
  });
  if (analytics.status !== 204) failures.push(`anonymous event endpoint failed: ${analytics.status}`);

  const visitorEvent = await fetch(`${ORIGIN}/__rta-event`, {
    method: 'POST',
    headers: { origin: 'https://ghid-rta.ro', 'content-type': 'application/json' },
    body: JSON.stringify({ event: 'page_view', language: 'ro', route: 'worker-visitor-check', device: 'automation', visitor: 'worker-visitor-check' })
  });
  if (visitorEvent.status !== 204) failures.push(`unique visitor event endpoint failed: ${visitorEvent.status}`);

  const rejected = await fetch(`${ORIGIN}/__rta-event`, {
    method: 'POST',
    headers: { origin: 'https://example.com', 'content-type': 'application/json' },
    body: JSON.stringify({ event: 'page_view' })
  });
  if (rejected.status !== 404) failures.push(`event endpoint accepted an untrusted origin: ${rejected.status}`);

  const metrics = await fetch(`${ORIGIN}/__rta-metrics?days=7`, {
    headers: { origin: 'https://ghid-rta.ro' }
  });
  const metricsData = metrics.ok ? await metrics.json() : null;
  if (!metrics.ok || !metricsData || metricsData.schemaVersion !== 1 || !Array.isArray(metricsData.daily)) {
    failures.push(`aggregated metrics endpoint failed: ${metrics.status}`);
  }
  if (!metricsData || !metricsData.totals || typeof metricsData.totals.uniqueVisitors !== 'number') {
    failures.push('aggregated metrics endpoint does not expose unique visitors');
  }

  if (failures.length) {
    console.error(failures.map(item => `- ${item}`).join('\n'));
    process.exit(1);
  }
  console.log('Cloudflare Worker: sync health, image cache, anonymous events and aggregated metrics passed.');
})().catch(error => {
  console.error(error);
  process.exit(1);
});
