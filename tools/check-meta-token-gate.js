#!/usr/bin/env node

const assert = require('assert');
const { classifyGraphError, inspectMetaConnection } = require('./meta-token-gate');

function response(payload, ok = true, status = 200) {
  return { ok, status, json: async () => payload };
}

(async () => {
  assert.strictEqual(classifyGraphError({ code: 190, error_subcode: 463, message: 'Session has expired' }), 'token_expired');
  assert.strictEqual(classifyGraphError({ code: 190, message: 'Invalid OAuth access token' }), 'token_invalid');
  assert.strictEqual(classifyGraphError({ code: 10, message: 'Permission denied' }), 'permission_missing');

  const missing = await inspectMetaConnection({ pageId: '', accessToken: '' });
  assert.deepStrictEqual(missing, { ready: false, reason: 'missing_credentials' });

  const expired = await inspectMetaConnection({
    pageId: '123',
    accessToken: 'secret',
    fetchImpl: async () => response({ error: { code: 190, error_subcode: 463, message: 'Session has expired' } }, false, 400)
  });
  assert.strictEqual(expired.ready, false);
  assert.strictEqual(expired.reason, 'token_expired');

  const facebook = await inspectMetaConnection({
    pageId: '123',
    accessToken: 'secret',
    fetchImpl: async () => response({ id: '123', name: 'Ghid RTA MTL - Smokee' })
  });
  assert.strictEqual(facebook.ready, true);

  const instagram = await inspectMetaConnection({
    pageId: '123',
    accessToken: 'secret',
    requireInstagram: true,
    fetchImpl: async () => response({
      id: '123',
      name: 'Ghid RTA MTL - Smokee',
      instagram_business_account: { id: '456', username: 'ghid.rta' }
    })
  });
  assert.strictEqual(instagram.ready, true);
  assert.strictEqual(instagram.instagramId, '456');

  const disconnected = await inspectMetaConnection({
    pageId: '123',
    accessToken: 'secret',
    requireInstagram: true,
    fetchImpl: async () => response({ id: '123', name: 'Ghid RTA MTL - Smokee' })
  });
  assert.strictEqual(disconnected.ready, false);
  assert.strictEqual(disconnected.reason, 'instagram_not_connected');

  console.log('Meta token gate checks passed.');
})().catch(error => {
  console.error(error);
  process.exit(1);
});
