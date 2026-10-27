import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import test from "node:test";
const require = createRequire(import.meta.url);
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
function load(path, mocks = {}, globals = {}) {
  const loadedModule = { exports: {} };
  const code = ts.transpileModule(readFileSync(new URL(`../${path}`, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(code, { module: loadedModule, exports: loadedModule.exports, URL, Response, AbortSignal, console,
    require: (name) => Object.hasOwn(mocks, name) ? mocks[name] : require(name), ...globals });
  return loadedModule.exports;
}
const helpers = load("lib/agent-vocabulary.ts");
const sections = load("app/components/agent-vocabulary-sections.tsx", { "@/lib/agent-vocabulary": helpers, "@/app/components/tooltip": ({ children }) => children });
const trait = { trait_id: "sf", trait_type: "genre", canonical_value: "science-fiction", display_value: "Science Fiction" };
const vocabulary = { version: 1, build_id: "build-one", workspace_id: "workspace-one", submission_status: null,
  trait_details: { genres: [trait], audiences: [{ ...trait, trait_id: "ya", display_value: "Young Adult" }] },
  raw_genre_statements: ["Sci-Fi, YA"], raw_negative_statements: ["No adult science fiction, but YA is welcome."],
  negative_preferences: [{ ...trait, raw_value: "No adult science fiction, but YA is welcome.", requires_exception_aware_matching: true }],
};
const matches = { version: 1, build_id: "build-one", workspace_id: "workspace-one", basis: "reviewed_trait_overlap", score_basis: "legacy_matcher",
  groups: { genres: [{ ...trait, match_type: "alias", selected_values: ["Sci Fi"] }], themes: [] } };

test("card labels use reviewed matches, including an authoritative empty group", () => {
  assert.equal(helpers.matchingLabels(matches, "genres").join(), "Science Fiction");
  assert.equal(helpers.matchingLabels(matches, "themes").length, 0);
  assert.equal(helpers.matchingLabels(null, "genres").length, 0);
});

test("profiles show one genre/subgenre list with matches highlighted and an open interest statement", () => {
  const html = renderToStaticMarkup(React.createElement(sections.AgentVocabularySections, { vocabulary, matches }));
  assert.equal((html.match(/>Genres<\/h3>/g) ?? []).length, 1);
  assert.equal((html.match(/>Subgenres<\/h3>/g) ?? []).length, 1);
  assert.match(html, /data-matched="true"[^>]*>Science Fiction<\/span>/);
  assert.match(html, /Equivalent to your selection: Sci Fi/);
  for (const label of ["Matching traits", "Matching Genres:", "Matching Themes:", "Interests shared", "Agent interests", "Highlighted interests", "Formats", "Audiences", "Original interest statements"]) {
    assert.ok(!html.includes(label), label);
  }
  const interest = html.match(/<section[^>]*aria-label="Interest Statement">([\s\S]*?)<\/section>/)?.[1];
  assert.ok(interest);
  assert.match(interest, /<h3 class="text-lg font-semibold">Interest Statement<\/h3>/);
  assert.match(interest, /<p[^>]*>Sci-Fi, YA<\/p>/);
  assert.ok(!interest.includes("<details"));
});

test("stale build or workspace matches leave current interests visible without highlighting", () => {
  for (const stale of [{ build_id: "old-build" }, { workspace_id: "other-workspace" }]) {
    const html = renderToStaticMarkup(React.createElement(sections.AgentVocabularySections, { vocabulary, matches: { ...matches, ...stale } }));
    assert.ok(html.includes("Science Fiction"));
    assert.ok(!html.includes("data-matched"));
    assert.ok(!html.includes("Matching traits"));
  }
});

test("empty overlaps and unavailable matching context show interests without a matching section", () => {
  for (const props of [{ matches: { ...matches, groups: {} } }, { matchingContext: { status: "unavailable", writer_project_id: "foreign" } }]) {
    const html = renderToStaticMarkup(React.createElement(sections.AgentVocabularySections, { vocabulary, ...props }));
    assert.ok(html.includes(">Science Fiction</span>"));
    assert.ok(!html.includes("data-matched"));
    assert.ok(!html.includes("Matching"));
    assert.ok(!html.includes("No matching"));
  }
});

test("profiles display Themes only when there is more than one theme", () => {
  const themes = [
    { ...trait, trait_id: "family", trait_type: "theme", display_value: "Found Family" },
    { ...trait, trait_id: "coming-of-age", trait_type: "theme", display_value: "Coming of Age" },
  ];
  for (const count of [0, 1, 2]) {
    const html = renderToStaticMarkup(React.createElement(sections.AgentVocabularySections, {
      vocabulary: { ...vocabulary, trait_details: { ...vocabulary.trait_details, themes: themes.slice(0, count) } }, matches,
    }));
    assert.equal(html.includes(">Themes</h3>"), count > 1);
    assert.equal(html.includes(">Found Family</span>"), count > 1);
  }
});

test("negatives show deduplicated badges and visible wording with complete exceptions", () => {
  const exception = "No adult science fiction, but YA is welcome.";
  const second = "No fantasy, poetry, or short stories.";
  const html = renderToStaticMarkup(React.createElement(sections.AgentVocabularySections, {
    vocabulary: { ...vocabulary,
      raw_negative_statements: [exception, "science fiction", exception.toUpperCase(), second],
      negative_preferences: [...vocabulary.negative_preferences,
        { ...trait, clause_id: "another-clause", raw_value: "science fiction", requires_exception_aware_matching: false },
        { ...trait, trait_id: "fantasy", display_value: "Fantasy", raw_value: second, requires_exception_aware_matching: false }],
      negative_clauses: [{ clause_id: "original", raw_value: "but YA is welcome", status: "qualified", effect: "refuse" }],
    }, matches,
  }));
  const negatives = html.match(/<section[^>]*aria-label="Not interested in">([\s\S]*?)<\/section>/)?.[1];
  assert.ok(negatives);
  assert.equal((negatives.match(/>Science Fiction<\/span>/g) ?? []).length, 1);
  assert.equal((negatives.match(/<span\b/g) ?? []).length, 2);
  assert.match(negatives, /data-conditional="true"/);
  assert.match(negatives, /title="Conditions apply\. No adult science fiction, but YA is welcome\."/);
  assert.ok(!negatives.includes("<details"));
  assert.ok(!negatives.includes("No exclusions listed"));
  assert.match(negatives, /<p[^>]*>No adult science fiction, but YA is welcome\. No fantasy, poetry, or short stories\.<\/p>/);
  for (const removed of ["Exclusions", "rounded-xl", "<ul", "<li", "Original preference statements", "Preference details"]) {
    assert.ok(!negatives.includes(removed), removed);
  }
});

test("a refusal without badges shows its separate qualifier and no empty message", () => {
  const html = renderToStaticMarkup(React.createElement(sections.AgentVocabularySections, {
    vocabulary: { ...vocabulary, raw_negative_statements: [], negative_preferences: [],
      negative_clauses: [{ clause_id: "qualified", raw_value: "No fantasy.", qualifier_text: "Unless it is for young adults.", status: "qualified", effect: "refuse" }],
    },
  }));
  assert.match(html, /<p[^>]*>No fantasy\. Unless it is for young adults\.<\/p>/);
  assert.ok(!html.includes(">Fantasy</span>"));
  assert.ok(!html.includes("No exclusions listed"));
  assert.ok(!html.includes("<details"));
});

test("statement paragraphs preserve independent wording and do not confuse substrings with complete fragments", () => {
  assert.equal(helpers.statementParagraph(["No royalty statements.", "YA", "ya", "No royalty statements.", "  Not for me, except when funny.\n"]),
    "No royalty statements. YA Not for me, except when funny.");
});

test("unknown reviewed availability is never shown as open", () => {
  const render = (status) => renderToStaticMarkup(React.createElement(sections.AgentSubmissionStatus, { vocabulary: { ...vocabulary, submission_status: status } }));
  for (const value of ["unknown", null, undefined, "QueryManager Form"]) {
    assert.match(render(value), /Unknown Status/);
    assert.match(render(value), /bg-white/);
    assert.ok(!render(value).includes("Open to Submissions"));
  }
  assert.match(render("closed"), /bg-white/);
  assert.match(render("open"), /border-accent bg-accent text-white/);
  for (const value of ["open", "closed", "unknown"]) assert.match(render(value), /rounded-full/);
  assert.match(render("closed"), /Closed to Submissions/);
  assert.match(render("open"), /Open to Submissions/);
});

function proxy({ userId = "owner", user = { id: "owner", primaryEmailAddress: { emailAddress: "owner@example.com" } }, headers = { Authorization: "Bearer server-secret" }, fetch } = {}) {
  return load("app/api/get-agent/route.ts", {
    "@/lib/config": { getWqhApiUrl: () => "http://127.0.0.1:10000" },
    "@clerk/nextjs/server": { auth: async () => ({ userId }), currentUser: async () => user },
    "next/server": { NextResponse: { json: (data, init) => Response.json(data, init) } },
    "@/lib/wqh-history-auth": { getWriterEmail: (value) => value.primaryEmailAddress.emailAddress, getWqhHistoryHeaders: () => headers },
  }, { fetch });
}
test("saved profile proxy derives identity on the server and forwards only approved parameters", async () => {
  let call;
  const route = proxy({ fetch: async (url, init) => { call = { url, init }; return Response.json({ agent: { vocabulary } }); } });
  const result = await route.GET({ url: "http://localhost/api/get-agent?agent_id=agent-one&writer_project_id=project-one&email=attacker@example.com&Authorization=injected" });
  assert.equal(result.status, 200);
  assert.equal(call.url.searchParams.get("email"), "owner@example.com");
  assert.equal(call.url.searchParams.get("writer_project_id"), "project-one");
  assert.equal(call.url.searchParams.has("Authorization"), false);
  assert.equal(call.init.headers.Authorization, "Bearer server-secret");
  assert.equal(call.init.cache, "no-store");
  assert.equal(result.headers.get("Cache-Control"), "private, no-store");
});

test("ordinary detail reads need no history token, and failed authentication prevents a request", async () => {
  let calls = 0;
  const fetch = async (_url, init) => { calls++; assert.equal(init.headers.Authorization, undefined); return Response.json({ agent: {} }); };
  assert.equal((await proxy({ headers: null, fetch }).GET({ url: "http://localhost/api/get-agent?agent_id=one" })).status, 200);
  assert.equal((await proxy({ userId: null, fetch }).GET({ url: "http://localhost/api/get-agent?agent_id=one" })).status, 401);
  assert.equal((await proxy({ user: { id: "different" }, fetch }).GET({ url: "http://localhost/api/get-agent?agent_id=one&writer_project_id=two" })).status, 401);
  assert.equal((await proxy({ headers: null, fetch }).GET({ url: "http://localhost/api/get-agent?agent_id=one&writer_project_id=two" })).status, 503);
  assert.equal(calls, 1);
});


function renderCard(traitMatches, overrides = {}, options = {}) {
  const wrapper = ({ children }) => React.createElement("div", null, children);
  const { AgentMatchCard } = load("app/(app)/agent-matches/components/agent-match-card.tsx", {
    "@/app/components/agent-vocabulary-sections": sections,
    "@/app/components/query-safety/discovery-agency-guard": { DiscoveryAgencyGuard: () => null },
    "@/app/components/query-safety/agency-save-confirmation": { useAgencySaveConfirmation: () => ({ requestSave() {}, isChecking: false, confirmation: null }) },
    "@/app/utils/project-scope": { isSameProjectScope: () => false },
    "next/link": ({ children, href }) => React.createElement("a", { href }, children),
    "@/app/utils": { cn: (...values) => values.filter((value) => typeof value === "string").join(" ") },
    "@/app/(app)/context/agent-matches-context": { useAgentMatches: () => ({ writerProjectId: "search-one" }) },
    "@/app/ui-primitives/skeleton": { Skeleton: wrapper },
    "@/app/components/tooltip": wrapper,
    "@/app/(app)/context/profile-context": { useProfileContext: () => ({ agentsList: [] }) },
    "@/lib/agent-vocabulary": helpers,
    "@/app/ui-primitives/spinner": { Spinner: () => null },
    "@/app/components/agent-save-button": { AgentSaveButton: () => React.createElement("button", null, "Save Agent") },
    "@/app/constants": { ALL_COUNTRY_FLAG_LABELS: {}, DEFAULT_PROJECT_NAME: "Untitled Project" },
    "@/app/components/fit-rating-badge": load("app/components/fit-rating-badge.tsx", { "@/app/utils": { cn: (...values) => values.filter(Boolean).join(" ") } }),
  });
  return renderToStaticMarkup(React.createElement(AgentMatchCard, {
    agent: { id: "adam", agent_id: "adam", name: "Adam Gauntlett", agency: "Agency", normalized_score: 4.8,
      genres: "Commercial fiction, contemporary, historical fiction", favorites: "FAVORITES FALLBACK MUST NOT APPEAR",
      trait_matches: traitMatches, match_hits: { direct: { genres: ["legacy genre"] } }, ...overrides },
    index: 0, id: "card-adam", isLoading: false, isSubscribed: true, ...options,
  }));
}

test("a card's subgenre match is highlighted in the profile's Subgenres list by typed ID", () => {
  const crime = { ...trait, trait_id: "crime-subgenre", trait_type: "subgenre", canonical_value: "crime-detective-police",
    display_value: "Crime Detective Police", match_type: "direct", selected_values: ["crime-detective-police"] };
  const crimeMatches = { ...matches, groups: { genres: [], subgenres: [crime], themes: [] } };
  const crimeVocabulary = { ...vocabulary, trait_details: { genres: [trait], subgenres: [crime],
    themes: [{ ...crime, trait_id: "unmatched-theme-with-same-label", trait_type: "theme" },
      { ...trait, trait_id: "family", trait_type: "theme", display_value: "Found Family" }] } };
  const card = renderCard(crimeMatches);
  const profile = renderToStaticMarkup(React.createElement(sections.AgentVocabularySections, { vocabulary: crimeVocabulary, matches: crimeMatches }));
  assert.ok(card.includes("Matching Genres:"));
  assert.ok(card.includes("Crime Detective Police"));
  for (const removed of ["Top Genres", "Favorites", "Matching Themes:", "No matching themes.", "Commercial fiction", "FAVORITES FALLBACK", "legacy genre"]) {
    assert.ok(!card.includes(removed), removed);
  }
  assert.ok(!profile.includes("Matching Genres:"));
  assert.ok(!profile.includes("Matching Themes:"));
  const subgenres = profile.match(/<section[^>]*aria-label="Subgenres">([\s\S]*?)<\/section>/)?.[1];
  assert.match(subgenres, /data-matched="true"[^>]*>Crime Detective Police<\/span>/);
  const themes = profile.match(/<section[^>]*aria-label="Themes">([\s\S]*?)<\/section>/)?.[1];
  assert.ok(themes.includes("Crime Detective Police"));
  assert.ok(!themes.includes("data-matched"));
  assert.equal((profile.match(/data-matched="true"/g) ?? []).length, 1);
});

test("matching card genre/theme badges are highlighted within the profile's interest lists", () => {
  const theme = { ...trait, trait_id: "found-family", trait_type: "theme", canonical_value: "found-family",
    display_value: "Found Family", match_type: "direct", selected_values: ["found-family"] };
  const both = { ...matches, groups: { ...matches.groups, themes: [theme] } };
  const card = renderCard(both);
  const profile = renderToStaticMarkup(React.createElement(sections.AgentVocabularySections, {
    vocabulary: { ...vocabulary, trait_details: { ...vocabulary.trait_details,
      themes: [theme, { ...theme, trait_id: "unmatched", display_value: "Coming of Age" }] } }, matches: both,
  }));
  assert.ok(card.includes("Matching Genres:"));
  assert.ok(card.includes("Matching Themes:"));
  for (const label of ["Science Fiction", "Found Family"]) {
    assert.ok(card.includes(label));
    assert.match(profile, new RegExp(`data-matched="true"[^>]*>${label}</span>`));
  }
  assert.equal((profile.match(/data-matched="true"/g) ?? []).length, 2);
  assert.ok(!profile.includes("Matching Genres:"));
  assert.ok(!profile.includes("Matching Themes:"));
});

test("empty or unavailable card matches never fall back to raw genres or favorites", () => {
  const empty = renderCard({ ...matches, groups: {} });
  assert.ok(empty.includes("No matching genres."));
  assert.ok(!empty.includes("Matching Themes:"));
  assert.ok(!empty.includes("No matching themes."));
  const unavailable = renderCard(null);
  assert.ok(unavailable.includes("Matching information unavailable."));
  for (const html of [empty, unavailable]) {
    assert.ok(!html.includes("Matching Themes:"));
    assert.ok(!html.includes("Top Genres"));
    assert.ok(!html.includes("Favorites"));
    assert.ok(!html.includes("FAVORITES FALLBACK"));
    assert.ok(!html.includes("Commercial fiction"));
  }
});


test("card and profile share the canonical badge even when legacy status disagrees", () => {
  for (const [status, legacy] of [["open", "Closed"], ["closed", "QueryManager Form"], ["unknown", "Open"], [null, "E-Mail"], [undefined, "Open"]]) {
    const currentVocabulary = { ...vocabulary, submission_status: status };
    const profileBadge = renderToStaticMarkup(React.createElement(sections.AgentSubmissionStatus, { vocabulary: currentVocabulary }));
    const card = renderCard(matches, { vocabulary: currentVocabulary, status: legacy });
    assert.ok(card.includes(profileBadge), `${status}: shared badge`);
    assert.equal(card.includes("Open to Submissions"), status === "open");
  }
  const missing = renderCard(matches, { status: "Open" });
  assert.ok(missing.includes("Unknown Status"));
  assert.ok(!missing.includes("Open to Submissions"));
});

test("v2 result cards retain the original badges and free access limit", () => {
  const agent = { ranking_version: "manuscript-fit-v2.1", fit_rating: "Core interests supported",
    match_explanation: [{ kind: "explicit", explanation: "Seeks science fiction." }] };
  const available = renderCard(matches, agent, { index: 5, isSubscribed: false });
  assert.ok(available.includes("/agent-matches/5"));
  assert.ok(available.includes("Perfect Fit"));
  assert.ok(!available.includes("Core interests supported"));
  assert.ok(!available.includes("Why this match"));
  for (const index of [6, 8]) {
    assert.ok(renderCard(matches, agent, { index, isSubscribed: false }).includes('href="#"'));
  }
  assert.ok(renderCard(matches, agent, { index: 8, isSubscribed: true }).includes("/agent-matches/8"));
});


test("saved raw refusal sentences stay visible without trait links and escape source markup", () => {
  const html = renderToStaticMarkup(React.createElement(sections.AgentVocabularySections, {
    vocabulary: { ...vocabulary, negative_preferences: [], negative_clauses: [],
      raw_negative_statements: ["No fantasy unless it is humorous <script>source text</script>."] },
  }));
  assert.match(html, /No fantasy unless it is humorous &lt;script&gt;source text&lt;\/script&gt;\./);
  assert.ok(!html.includes("<script>"));
  assert.ok(!html.includes("No exclusions listed"));
  assert.ok(!html.includes("<details"));
});

test("each separately saved qualifier stays attached to its own refusal", () => {
  const paragraph = helpers.negativeStatementParagraph({ ...vocabulary,
    raw_negative_statements: ["No fantasy.", "No horror."], negative_preferences: [],
    negative_clauses: [
      { clause_id: "fantasy", raw_value: "No fantasy.", qualifier_text: "Unless it is humorous.", status: "qualified", effect: "refusal" },
      { clause_id: "horror", raw_value: "No horror.", qualifier_text: "Unless it is humorous.", status: "qualified", effect: "refusal" },
    ],
  });
  assert.equal(paragraph, "No fantasy. Unless it is humorous. No horror. Unless it is humorous.");
});

test("reviewed submission instructions and context are not displayed as refusal statements", () => {
  const currentVocabulary = { ...vocabulary, negative_preferences: [],
    raw_negative_statements: ["Closed to submissions, do not send attachments", "NOT DEAD by Dana Stabenow", "No response means no offer."],
    negative_clauses: [
      { clause_id: "closed", raw_value: "Closed to submissions", status: "nontrait", effect: "refusal" },
      { clause_id: "attachments", raw_value: "do not send attachments", status: "nontrait", effect: "nontrait" },
      { clause_id: "title", raw_value: "NOT DEAD by Dana Stabenow", status: "nontrait", effect: "context" },
      { clause_id: "response", raw_value: "No response means no offer.", qualifier_text: "unless requested", status: "nontrait", effect: "refusal" },
    ],
  };
  assert.equal(helpers.negativeStatementParagraph(currentVocabulary), "");
  const html = renderToStaticMarkup(React.createElement(sections.AgentVocabularySections, { vocabulary: currentVocabulary }));
  assert.ok(html.includes("No exclusions listed"));
  for (const text of currentVocabulary.raw_negative_statements) assert.ok(!html.includes(text));
});

test("complete mixed source wording and unclassified sentences survive reviewed context filtering", () => {
  const source = "No adult fantasy, except YA fantasy; do not send attachments.";
  const paragraph = helpers.negativeStatementParagraph({ ...vocabulary, negative_preferences: [],
    raw_negative_statements: [source, "do not send attachments", "No royalty statements."],
    negative_clauses: [
      { clause_id: "refusal", raw_value: "No adult fantasy, except YA fantasy", status: "qualified", effect: "refusal" },
      { clause_id: "instructions", raw_value: "do not send attachments", status: "nontrait", effect: "nontrait" },
    ],
  });
  assert.equal(paragraph, `${source} No royalty statements.`);
});

test("the empty message requires both missing badges and missing refusal statements", () => {
  for (const currentVocabulary of [undefined, { ...vocabulary, negative_preferences: [], raw_negative_statements: [], negative_clauses: [] }]) {
    const html = renderToStaticMarkup(React.createElement(sections.AgentVocabularySections, { vocabulary: currentVocabulary }));
    assert.ok(html.includes("No exclusions listed"));
  }
  const html = renderToStaticMarkup(React.createElement(sections.AgentVocabularySections, {
    vocabulary: { ...vocabulary, raw_negative_statements: [], negative_clauses: [],
      negative_preferences: [{ ...trait, raw_value: "", requires_exception_aware_matching: false }] },
  }));
  const section = html.match(/<section[^>]*aria-label="Not interested in">([\s\S]*?)<\/section>/)[1];
  assert.ok(section.includes(">Science Fiction</span>"));
  assert.ok(!section.includes("No exclusions listed"));
});


test("unknown availability explains missing confirmation and supports keyboard focus", () => {
  const captured = [];
  const statusComponent = load("app/components/agent-vocabulary-sections.tsx", {
    "@/lib/agent-vocabulary": helpers,
    "@/app/components/tooltip": ({ content, children }) => { captured.push(content); return children; },
  });
  for (const value of ["unknown", null, undefined]) {
    const html = renderToStaticMarkup(React.createElement(statusComponent.AgentSubmissionStatus, {
      vocabulary: { ...vocabulary, submission_status: value },
    }));
    assert.match(html, /Unknown Status/);
    assert.match(html, /tabindex="0"/);
    assert.equal(captured.at(-1), "Current submission availability is unconfirmed.");
  }
  for (const value of ["open", "closed"]) {
    const count = captured.length;
    const html = renderToStaticMarkup(React.createElement(statusComponent.AgentSubmissionStatus, {
      vocabulary: { ...vocabulary, submission_status: value },
    }));
    assert.equal(captured.length, count);
    assert.ok(!html.includes("Unknown Status"));
    assert.ok(html.includes(value === "open" ? "Open to Submissions" : "Closed to Submissions"));
  }
});

test("contact methods retain channel information without displaying availability as a method", () => {
  for (const raw of ["Closed", "closed", "Unknown", "open", null, undefined, "Email, closed", "Email, Phone"]) {
    assert.equal(helpers.submissionMethods(raw).length, 0);
  }
  assert.equal(helpers.submissionMethods("E-Mail, QueryManager Form").join(", "), "Email, QueryManager Form");
  assert.equal(helpers.submissionMethods(" email , E-Mail,  Postal   Mail ").join(", "), "Email, Postal Mail");
});
