// Local mock PostgREST only. OUTREACH_SEND_ENABLED is never set. No external sends.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { runSender } from '../netlify/functions/outreach-sender-scheduled.mts';
import { handleReply } from '../netlify/functions/outreach-reply.mts';

type Mock = (url: URL, method: string) => { status?: number; data: unknown };
async function withDatabase(mock: Mock, run: (env: (k: string) => string | undefined) => Promise<void>) {
  const server = http.createServer((req, res) => {
    const result = mock(new URL(req.url!, 'http://localhost'), req.method!);
    req.resume();
    req.on('end', () => { res.writeHead(result.status || 200, { 'content-type': 'application/json' }); res.end(JSON.stringify(result.data)); });
  });
  await new Promise<void>(r => server.listen(0, '127.0.0.1', r));
  const port = (server.address() as { port: number }).port;
  const values: Record<string, string> = { SUPABASE_URL: `http://127.0.0.1:${port}`, SUPABASE_SERVICE_ROLE_KEY: 'synthetic-review-key', OUTREACH_INBOUND_SECRET: 'synthetic-review-secret' };
  try { await run(k => values[k]); } finally { server.closeAllConnections(); await new Promise<void>(r => server.close(() => r())); }
}
const failed = { status: 500, data: { message: 'synthetic database failure' } };
const draft = { id: 'test-draft', jobsite_id: 'test-site', to_email: 'synthetic@example.test', sequence_step: 1, language: 'en', approved_at: '2026-09-29' };
for (const failedTable of ['suppression_list', 'jobsites', 'previous_send']) {
  test(`sender fails closed on ${failedTable} lookup error`, async () => {
    await withDatabase((url, method) => {
      assert.equal(method, 'GET'); // dry run without previous sends never writes or contacts provider
      if (url.searchParams.get('status') === 'eq.sent') return { data: [] };
      if (url.searchParams.get('status') === 'eq.approved') return { data: [draft] };
      if (url.pathname.endsWith('/suppression_list')) return failedTable === 'suppression_list' ? failed : { data: null };
      if (url.pathname.endsWith('/jobsites')) return failedTable === 'jobsites' ? failed : { data: { lead_id: null, source_code: 'o-test' } };
      return failedTable === 'previous_send' ? failed : { data: [] };
    }, async env => { await assert.rejects(runSender(env), /lookup failed/); });
  });
}
function reply(text = 'STOP', secret = 'synthetic-review-secret') {
  return new Request('http://localhost/api/outreach-reply', { method: 'POST', headers: { 'content-type': 'application/json', 'x-spatchy-secret': secret }, body: JSON.stringify({ from: 'synthetic@example.test', text }) });
}
for (const failedTable of ['lookup', 'suppression_list', 'outreach_drafts', 'outreach_events']) {
  test(`STOP returns failure on ${failedTable} error, not false suppression success`, async () => {
    await withDatabase((url, method) => {
      if (method === 'GET') return failedTable === 'lookup' ? failed : { data: [] };
      if (url.pathname.endsWith('/' + failedTable)) return failed;
      return { data: null };
    }, async env => {
      const response = await handleReply(reply(), env);
      assert.equal(response.status, 503);
      assert.deepEqual(await response.json(), { ok: false, error: 'database_operation_failed' });
    });
  });
}
test('STOP success follows confirmed persistence; wrong secret never accesses DB', async () => {
  let writes = 0;
  await withDatabase((_url, method) => { if (method !== 'GET') writes++; return { data: method === 'GET' ? [] : null }; }, async env => {
    assert.equal((await handleReply(reply('STOP', 'wrong'), env)).status, 401);
    assert.equal(writes, 0);
    const response = await handleReply(reply(), env);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true, action: 'suppressed', matched: false });
    assert.equal(writes, 3);
  });
});
test('unmatched reply log error is not false success', async () => {
  await withDatabase((_url, method) => method === 'GET' ? { data: [] } : failed, async env => {
    assert.equal((await handleReply(reply('Interested'), env)).status, 503);
  });
});
