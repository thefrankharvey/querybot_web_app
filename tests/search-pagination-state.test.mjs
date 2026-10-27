import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import test from 'node:test';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const React = require('react');
function find(element, type) {
  if (!element || typeof element !== 'object') return null;
  if (element.type === type) return element;
  return [element.props?.children].flat().map(child => find(child, type)).find(Boolean);
}
for (const kind of ['full', 'paywall']) {
  test(`${kind}: failed filter requests preserve visible results, filters, cursors and snapshot`, async () => {
    let mutation, submitted;
    const changes = {}, errors = [], calls = [];
    const state = { matches: [{ agent_id: 'old' }], formData: { genre: 'fantasy', result_set_id: 'frozen' },
      currentCursor: 21, nextCursorCount: 42, statusFilter: 'open', countryFilter: 'US', projectName: 'Book' };
    for (const key of ['Matches','FormData','CurrentCursor','NextCursor','StatusFilter','CountryFilter','TotalAgents','WriterProjectId'])
      state[`save${key}`] = value => { changes[key] = value; };
    Object.assign(state, { beginSpreadsheetExport() {}, failSpreadsheetExport() {}, handleAgentExportResponse() {} });
    const mocks = {
      react: { ...React, useRef: value => ({ current: value }) },
      '@/lib/agent-search-v2': { resultSetQuery: (id, refresh) => id && !refresh ? `&result_set_id=${id}` : '' },
      '@/app/utils/smart-match-projects': { getSmartMatchSaveProjectId: (_, id) => id },
      '@/app/utils/project-scope': { isSameProjectScope: () => false },
      '../../context/agent-matches-context': { useAgentMatches: () => state },
      '../../context/profile-context': { useProfileContext: () => ({ agentsList: [] }) },
      '@tanstack/react-query': { useMutation: options => { mutation = options; return { isPending: false, mutate: params => { submitted = params; } }; } },
      '@/app/constants': { QUERY_LIMIT: 21 },
      '@/app/ui-primitives/pagination': Object.fromEntries(['Pagination','PaginationContent','PaginationItem','PaginationNext','PaginationPrevious'].map(key => [key,key])),
      './agent-matches-inner': { __esModule: true, default: 'Results' },
      '@/app/components/pay-wall': { __esModule: true, default: 'Paywall' },
      '@/app/utils/project-dashboard-summary': { normalizeProjectName: name => name },
      sonner: { toast: { error: message => errors.push(message) } },
    };
    const code = ts.transpileModule(readFileSync(new URL(`../app/(app)/agent-matches/components/agent-matches-${kind}.tsx`, import.meta.url),'utf8'),
      {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
    const module = { exports: {} };
    vm.runInNewContext(code, { module, exports: module.exports, require: name => Object.hasOwn(mocks,name) ? mocks[name] : require(name),
      window: { scrollTo() {} }, console: { error() {} }, fetch: async url => { calls.push(url); return Response.json({message:'Service unavailable'},{status:503}); } });
    const tree = module.exports.default({});
    const results = find(tree, 'Results');
    results.props.onStatusChange('closed');
    assert.equal(submitted.status,'closed');
    assert.deepEqual(changes, {});
    try { await mutation.mutationFn(submitted); assert.fail('Expected rejection'); }
    catch (error) { mutation.onError(error, submitted); }
    assert.deepEqual(changes, {});
    assert.equal(errors.length, 1);
    assert.ok(!calls[0].includes('result_set_id='));
    mutation.onSuccess({ matches: [], next_cursor: null, total_agents: 0, writer_project_id: 'project', result_set_id:'new' }, submitted);
    assert.equal(changes.StatusFilter,'closed');
    assert.equal(changes.CountryFilter,'US');
    assert.equal(changes.CurrentCursor,0);
    assert.equal(changes.NextCursor,-1);
    assert.equal(changes.FormData.result_set_id,'new');
    assert.equal(changes.Matches.length,0);
  });
}
