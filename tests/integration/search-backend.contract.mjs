// Invoked by the backend's disposable-Postgres integration fixture.
// Only loopback HTTP is allowed; Clerk and dashboard storage are synthetic.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import vm from 'node:vm';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const base = new URL(process.env.WQH_CONTRACT_API_URL);
assert.ok(['127.0.0.1','localhost'].includes(base.hostname));
assert.equal(base.protocol, 'http:');
const email = 'contract-writer@example.com';
const headers = { Authorization: 'Bearer contract-test-secret', 'Content-Type': 'application/json' };
const config = { getWqhApiEndpoint: name => new URL(name,base).href, getWqhApiUrl: () => base.href, getWqhTraitsApiUrl: () => base.href };
class SmartMatchProjectError extends Error {}
const mocks = {
  '@/lib/config': config,
  '@/lib/wqh-history-auth': { getWriterEmail: () => email, getWqhHistoryHeaders: () => headers },
  '@clerk/nextjs/server': { auth: async () => ({userId:'fixture'}), currentUser: async () => ({id:'fixture'}) },
  'next/server': { NextResponse: {json: (body,init) => Response.json(body,init)} },
  '@/app/utils/smart-match-projects.server': { resolveSmartMatchWriterProjectId: async input => input.writerProjectId, SmartMatchProjectError },
  '@/app/utils/smart-match-profile-link.server': { getLegacySearchProject: async () => null, linkLegacySearchProfile: async () => {} },
  '@/app/utils/smart-match-dashboard.server': { ensureSmartMatchDashboardProject: async input => ({id:'synthetic-dashboard',project_name:input.projectName,writer_project_id:input.writerProjectId}) },
};
function load(file) {
  const code = ts.transpileModule(readFileSync(resolve(file),'utf8'), { compilerOptions: { module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true }}).outputText;
  const module = {exports:{}};
  vm.runInNewContext(code, { module, exports:module.exports, require:name => Object.hasOwn(mocks,name) ? mocks[name] : require(name),
    URL, URLSearchParams, Request, Response, AbortController, AbortSignal, setTimeout, clearTimeout, console,
    fetch: async (url,init) => { assert.equal(new URL(url).origin,base.origin); return fetch(url,init); } });
  return module.exports;
}
mocks['@/lib/traits'] = load('lib/traits.ts');
mocks['@/lib/wqh-local-backend-auth'] = { getLocalVocabularyWriteHeaders: () => ({}) };
const traitRoute = load('app/api/traits/route.ts');
const paid = load('app/api/get-agents-paid/route.ts');
const free = load('app/api/get-agents-free/route.ts');
const details = load('app/api/get-agent/route.ts');
const form = {email:'forged@example.com', project_name:'Contract book',genre:'science-fiction',genres:['science-fiction','fantasy'],target_audience:'young-adult'};
const post = (route, query, body=form) => route.POST(new Request(`http://ui.test/api/search?${query}`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}));
const firstResponse = await post(paid,'status=open');
assert.equal(firstResponse.status,200, await firstResponse.clone().text());
assert.equal(firstResponse.headers.get('cache-control'),'private, no-store');
const first = await firstResponse.json();
assert.equal(first.matches.length,21);
assert.equal(first.total_agents,24); // The secondary genre contributes half the matches.
assert.equal(first.next_cursor,21);
assert.ok(first.ranking_version.startsWith('manuscript-fit-v2.'));
assert.ok(first.matches.every(agent => agent.submission_status==='open' && agent.vocabulary.submission_status==='open'));
assert.ok(first.matches.every(agent => agent.match_explanation.length));
const body = {...form,writer_project_id:first.writer_project_id};
const secondResponse = await post(paid,`status=open&last_index=21&result_set_id=${first.result_set_id}`,body);
assert.equal(secondResponse.status,200,await secondResponse.clone().text());
const second = await secondResponse.json();
assert.equal(second.matches.length,3);
assert.equal(second.next_cursor,null);
assert.equal(second.task_id,first.task_id);
assert.equal(second.evidence_version,first.evidence_version);
const all = [...first.matches,...second.matches];
assert.equal(new Set(all.map(agent=>agent.agent_id)).size,24);
const freeResponse = await post(free,'status=open',{...body,project_name:'Free book',writer_project_id:undefined});
assert.equal(freeResponse.status,200,await freeResponse.clone().text());
const freeData = await freeResponse.json();
assert.deepEqual(freeData.matches.map(a=>a.agent_id),all.slice(0,9).map(a=>a.agent_id));
assert.equal((await post(paid,`status=open&result_set_id=${first.result_set_id}`,{...body,themes:['hope']})).status,409);
assert.equal((await post(paid,'status=open&result_set_id=00000000-0000-4000-8000-000000000000',body)).status,410);
assert.equal((await post(paid,'status=open&last_index=21',body)).status,400);
const history = await (await fetch(new URL(`get-writer-projects?email=${email}`,base),{headers})).json();
assert.equal(history.writer_projects.length,2);
assert.ok(history.writer_projects.every(p=>JSON.stringify(p.genres)===JSON.stringify(form.genres)));
const profile = await (await fetch(new URL(`writer-projects/${first.writer_project_id}?email=${email}`,base),{headers})).json();
const patch = await fetch(new URL(`writer-projects/${first.writer_project_id}`,base),{method:'PATCH',headers,body:JSON.stringify({email,expected_revision:profile.writer_project.revision,traits:{themes:['hope']}})});
assert.equal(patch.status,200,await patch.clone().text());
assert.deepEqual((await patch.json()).writer_project.genres,form.genres);
const detailResponse = await details.GET(new Request(`http://ui.test/api/get-agent?agent_id=${all[0].agent_id}&writer_project_id=${first.writer_project_id}`));
assert.equal(detailResponse.status,200,await detailResponse.clone().text());
const detail = (await detailResponse.json()).agent;
assert.equal(detail.agent_id,all[0].agent_id);
assert.equal(detail.vocabulary.submission_status,'open');
assert.ok(detail.trait_matches);
const recResponse = await fetch(new URL('get-agents-paid?status=open',base),{method:'POST',headers,body:JSON.stringify({...body,email,recommendations_only:true,exclude_agent_ids:[all[0].agent_id]})});
assert.equal(recResponse.status,200,await recResponse.clone().text());
const rec = await recResponse.json();
assert.equal(rec.recommendations_only,true);
assert.equal(rec.matches.length,3);
assert.ok(rec.matches.every(a=>a.agent_id!==all[0].agent_id));
const after = await (await fetch(new URL(`get-writer-projects?email=${email}`,base),{headers})).json();
assert.equal(after.writer_projects.length,2);
assert.equal((await fetch(new URL('get-agents-paid',base),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})).status,401);
const traitResponse = await traitRoute.GET(new Request('http://ui.test/api/traits?type=genre'));
assert.equal(traitResponse.status,200);
const traits = await traitResponse.json();
assert.ok(JSON.stringify(traits).includes('science-fiction'));
assert.ok(!JSON.stringify(traits).includes('unapproved-candidate'));
console.log('PASS: real UI proxies → HTTP Flask → disposable PostgreSQL: multi-genre, paid/free, frozen pages, 400/409/410, history, profile edits/details, recommendations, auth, traits.');
