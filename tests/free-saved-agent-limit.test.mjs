import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
const require = createRequire(import.meta.url);
const ts = require("typescript");
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
function loader(mocks = {}, globals = {}) {
  const modules = new Map();
  function load(path) {
    if (modules.has(path)) return modules.get(path);
    const module = { exports: {} };
    const source = ts.transpileModule(
      readFileSync(resolve(root, path), "utf8"),
      {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
          jsx: ts.JsxEmit.ReactJSX,
          esModuleInterop: true,
        },
      },
    ).outputText;
    vm.runInNewContext(source, {
      module,
      exports: module.exports,
      console,
      URL,
      URLSearchParams,
      Request,
      Response,
      Headers,
      AbortSignal,
      setTimeout,
      clearTimeout,
      process,
      ...globals,
      require: (specifier) => {
        if (Object.hasOwn(mocks, specifier)) return mocks[specifier];
        if (specifier === "server-only") return {};
        if (specifier.startsWith("@/") || specifier.startsWith(".")) {
          const base = specifier.startsWith("@/")
            ? resolve(root, specifier.slice(2))
            : resolve(root, dirname(path), specifier);
          const alias = "@/" + base.slice(root.length + 1);
          if (Object.hasOwn(mocks, alias)) return mocks[alias];
          return load([base + ".ts", base + ".tsx"].find(existsSync));
        }
        return require(specifier);
      },
    });
    modules.set(path, module.exports);
    return module.exports;
  }
  return load;
}

const React = require("react");
const { QueryClient } = require("@tanstack/react-query");
const message = "You've reached your limit of free saved agents. Subscribe for unlimited.";
const row = (index) => ({ id: `saved-${index}`, index_id: `agent-${index}`, name: `Agent ${index}`, project_name: index % 2 ? "Book A" : "Book B" });

function providerHarness({ count = 6, paid = false, fetchResponse, noData = false } = {}) {
  const client = new QueryClient();
  const key = ["agent-matches", "owner"];
  if (!noData) client.setQueryData(key, { agent_matches: Array.from({length: count}, (_, i) => row(i)), projects: [] });
  let requests = 0;
  let refreshes = 0;
  const states = [];
  const refs = [];
  let stateIndex = 0, refIndex = 0;
  const Provider = loader({
    react: { ...React, useMemo: (fn) => fn(), useEffect() {},
      useState: (initial) => { const i = stateIndex++; if (!(i in states)) states[i] = initial; return [states[i], (value) => { states[i] = value; }]; },
      useRef: (initial) => { const i = refIndex++; return refs[i] ?? (refs[i] = {current: initial}); },
    },
    "@clerk/nextjs": {useUser: () => ({user: {id: "owner", publicMetadata: {isSubscribed: paid}}})},
    "@tanstack/react-query": {useQueryClient: () => client},
    "@/app/hooks/use-fetch-agents-list": {useFetchAgentsList: () => ({ data: client.getQueryData(key), refetch: async () => { refreshes++; return {}; } })},
    sonner: {toast: {info() {}, success() {}, error() {}}},
  }, {fetch: async () => { requests++; return fetchResponse ? fetchResponse() : Response.json({created:[row(100+requests)]}, {status:201}); }})("app/(app)/context/profile-context.tsx").ProfileProvider;
  return {
    render() { stateIndex = 0; refIndex = 0; return Provider({children:null}).props.value; },
    client, key,
    get requests() { return requests; },
    get refreshes() { return refreshes; },
  };
}

test("a free user can save the sixth agent across projects, then cannot save a seventh with a stale callback", async () => {
  const h = providerHarness({count:5});
  const profile = h.render();
  assert.equal(profile.isFreeSaveLimitReached, false);
  assert.ok(await profile.saveAgent({index_id:"sixth", name:"Sixth"}));
  assert.equal(h.render().isFreeSaveLimitReached, true);
  assert.equal(await profile.saveAgent({index_id:"seventh", name:"Seventh"}), null);
  assert.equal(h.requests, 1);
  assert.equal(h.client.getQueryData(h.key).agent_matches.length,6);
  h.client.clear();
});

test("free users already over the cap retain their rows and may save again after removing enough", async () => {
  const h = providerHarness({count:7});
  assert.equal(h.render().isFreeSaveLimitReached,true);
  assert.equal(await h.render().saveAgent({name:"New"}),null);
  await h.render().removeAgents(["saved-0","saved-1"]);
  assert.equal(h.render().isFreeSaveLimitReached,false);
  assert.ok(await h.render().saveAgent({name:"New"}));
  h.client.clear();
});

test("paid users can save above six individually and in bulk", async () => {
  const h = providerHarness({count:8, paid:true});
  assert.equal(h.render().isFreeSaveLimitReached,false);
  assert.ok(await h.render().saveAgent({name:"New"}));
  assert.ok(await h.render().saveAllAgents([{name:"More",index_id:"more"},{name:"Again",index_id:"again"}]));
  assert.equal(h.requests,2);
  h.client.clear();
});

test("bulk saves cannot overflow the free allowance and unknown dashboard counts block saves", async () => {
  const h = providerHarness({count:5});
  assert.equal(await h.render().saveAllAgents([{name:"New",index_id:"new"},{name:"Another",index_id:"another"}]),null);
  assert.equal(h.requests,0);
  h.client.clear();
  const unknown = providerHarness({noData:true});
  assert.equal(await unknown.render().saveAgent({name:"New"}),null);
  assert.equal(unknown.requests,0);
  unknown.client.clear();
});

test("rapid saves are serialized until the successful save updates the shared count", async () => {
  let finish;
  const h = providerHarness({count:5,fetchResponse: () => new Promise(resolve => {finish=resolve;})});
  const profile = h.render();
  const first = profile.saveAgent({name:"Sixth",index_id:"sixth"});
  assert.equal(await profile.saveAgent({name:"Seventh",index_id:"seventh"}),null);
  finish(Response.json({created:[row(6)]},{status:201}));
  await first;
  assert.equal(await profile.saveAgent({name:"Seventh",index_id:"seventh"}),null);
  assert.equal(h.requests,1);
  h.client.clear();
});

test("a stale tab refreshes its count and identifies the rejected save for an anchored message", async () => {
  const h = providerHarness({count:5,fetchResponse: () => Response.json({code:"FREE_SAVED_AGENT_LIMIT",error:message},{status:403})});
  assert.equal(await h.render().saveAgent({name:"New",index_id:"new"}),null);
  assert.equal(h.render().limitRejectedAgentId,"new");
  assert.equal(h.refreshes,1);
  assert.equal(h.client.getQueryData(h.key).agent_matches.length,5);
  h.client.clear();
});

function routeHarness({count=6, paid=false, countError=false, userId="owner", mismatch=false}={}) {
  const reads=[], inserts=[];
  const route=loader({
    "next/server": {NextResponse:{json:(body,options)=>Response.json(body,options)}},
    "@clerk/nextjs/server": {auth:async()=>({userId}),currentUser:async()=>({id:mismatch?"other":userId,publicMetadata:{isSubscribed:paid}})},
    "@/app/api/supabase/server": {createServerSupabase:()=>({from:()=>({
      select:(_fields,options)=>({eq:async(_field,owner)=>{reads.push({owner,options});return {count,error:countError};}}),
      insert:(payloads)=>{inserts.push(...payloads);return {select:async()=>({data:payloads,error:null})};},
    })})},
  })("app/api/agent-matches/route.ts");
  return {reads,inserts,save:(payload)=>route.POST(new Request("http://localhost/api/agent-matches",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)}))};
}

test("the save API allows the sixth free row, denies a seventh and rejects overflowing batches", async () => {
  for (const [count,payload,status] of [[5,{name:"Sixth"},201],[6,{name:"Seventh"},403],[9,{name:"More"},403],[5,[{name:"Sixth"},{name:"Seventh"}],403]]) {
    const h=routeHarness({count});
    const res=await h.save(payload);
    assert.equal(res.status,status);
    assert.equal(h.reads[0].owner,"owner");
    assert.equal(h.reads[0].options.head,true);
    if (status===403) {
      assert.equal((await res.json()).error,message);
      assert.equal(h.inserts.length,0);
    }
  }
});

test("the save API trusts server subscription metadata, ignores forged fields, and fails closed on count errors", async () => {
  const paid=routeHarness({count:15,paid:true});
  assert.equal((await paid.save([{name:"New"},{name:"More"}])).status,201);
  assert.equal(paid.reads.length,0);
  const forged=routeHarness();
  assert.equal((await forged.save({name:"New",user_id:"other",isSubscribed:true})).status,403);
  assert.equal(forged.inserts.length,0);
  const unavailable=routeHarness({countError:true});
  assert.equal((await unavailable.save({name:"New"})).status,503);
  assert.equal(unavailable.inserts.length,0);
  for (const options of [{userId:null},{mismatch:true}]) {
    const denied=routeHarness(options);
    assert.equal((await denied.save({name:"New"})).status,401);
    assert.equal(denied.inserts.length,0);
    assert.equal(denied.reads.length,0);
  }
});

function find(element,type) {
  if (!element || typeof element !== "object") return undefined;
  if (element?.type===type) return element;
  return [element?.props?.children].flat(Infinity).map(child=>find(child,type)).find(Boolean);
}
function buttonHarness(profile={}) {
  const states=[]; let index=0, saves=0;
  const component=loader({
    react: {...React,useState:(initial)=>{const i=index++;if (!(i in states))states[i]=initial;return [states[i],value=>{states[i]=value;}];}},
    "next/link":"link",
    "@/app/(app)/context/profile-context": {useProfileContext:()=>({agentsList:[],isFreeSaveLimitReached:true,...profile})},
    "@/app/ui-primitives/button":{Button:"button"},
    "@/app/ui-primitives/spinner":{Spinner:"spinner"},
    "@/app/ui-primitives/tooltip":{Tooltip:"tooltip",TooltipTrigger:"tooltip-trigger",TooltipContent:"tooltip-content"},
    "@/app/ui-primitives/popover":{Popover:"popover",PopoverTrigger:"popover-trigger",PopoverContent:"popover-content"},
  })("app/components/agent-save-button.tsx").AgentSaveButton;
  return {render(props={}) {index=0;return component({onSave:()=>{saves++;},agentId:"new",...props});},get saves(){return saves;}};
}
const event=()=>({prevented:false,stopped:false,preventDefault(){this.prevented=true;},stopPropagation(){this.stopped=true;}});

test("limited save controls keep the exact copy, stay focusable, and pin a dismissible message instead of saving or navigating", () => {
  for (const iconOnly of [false,true]) {
    const h=buttonHarness();
    let tree=h.render({iconOnly});
    const button=find(tree,"button");
    assert.equal(button.props["aria-disabled"],true);
    assert.equal(button.props.disabled,false);
    const click=event();
    button.props.onClick(click);
    tree=h.render({iconOnly});
    assert.equal(h.saves,0);
    assert.ok(click.prevented && click.stopped);
    assert.equal(tree.props.open,true);
    assert.equal(find(tree,"tooltip-content").props.children,message);
    assert.equal(find(tree,"link").props.href,"/subscribe");
    tree.props.onOpenChange(false);
    assert.equal(h.render({iconOnly}).props.open,false);
  }
});

test("paid and under-limit save controls run the save action, while unknown counts disable it", () => {
  const h=buttonHarness({isFreeSaveLimitReached:false});
  find(h.render(),"button").props.onClick(event());
  assert.equal(h.saves,1);
  assert.equal(h.render().props.open,false);
  const unknown=buttonHarness({agentsList:undefined,isLoading:true});
  assert.equal(find(unknown.render(),"button").props.disabled,true);
});

test("stale-tab rejections open the same message by the attempted agent and can be dismissed", () => {
  const h=buttonHarness({isFreeSaveLimitReached:false,limitRejectedAgentId:"new"});
  const tree=h.render();
  assert.equal(tree.props.open,true);
  tree.props.onOpenChange(false);
  assert.equal(h.render().props.open,false);
  assert.equal(h.render({agentId:"other"}).props.open,false);
});
