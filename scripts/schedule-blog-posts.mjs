#!/usr/bin/env node
/**
 * schedule-blog-posts — turn raw generator output into live-scheduled blog posts.
 *
 * The runtime gate (lib/blog-schedule.ts) reveals a post only once its slot
 * instant has passed, and it reads everything from the FOLDER NAME, which must
 * be in this canonical form:
 *
 *     app/blog/<clean-slug>-MM-DD-YYYY-(am|pm)
 *         am -> 15:00 America/New_York   (3:00pm, afternoon)
 *         pm -> 18:00 America/New_York   (6:00pm, evening)
 *
 * The folder name is also the public URL: /blog/<clean-slug>-MM-DD-YYYY-(am|pm).
 *
 * THE GENERATOR DOES NOT EMIT THAT FORMAT. It emits:
 *
 *     app/blog/NNNN_<type>_<underscored-slug>_MM_DD_YYYY/
 *         page.tsx          ← the post (its PAGE_DATA.slug is the clean slug)
 *         parsed.json, schema.json, source_output.md  ← scratch (gitignored)
 *
 * This script is the bridge. For each generator folder it:
 *   1. reads the clean slug from PAGE_DATA (`"slug": "..."`) in page.tsx,
 *   2. uses the NNNN prefix as publish order and the MM_DD_YYYY as the date,
 *   3. buckets posts into publish-days (2/day) and gives the first the `am`
 *      slot (3:00pm) and the second the `pm` slot (6pm),
 *   4. renames the folder to `<clean-slug>-MM-DD-YYYY-(am|pm)`.
 *
 * Folders already in canonical form are recognised and left alone (idempotent),
 * so it is safe to re-run after every import.
 *
 * DATES
 *   no --start          preserve the date already encoded in each folder.
 *   --start=YYYY-MM-DD   re-sequence: order posts globally, 2 per day, day 1 on
 *                        this date, counting forward one calendar day per pair.
 *   --reschedule         alias forcing the --start re-sequence (requires --start).
 *
 * USAGE
 *   node scripts/schedule-blog-posts.mjs --dry-run
 *   node scripts/schedule-blog-posts.mjs
 *   node scripts/schedule-blog-posts.mjs --start=2026-06-13
 *   node scripts/schedule-blog-posts.mjs --start=2026-06-13 --reschedule
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { execFileSync } from "node:child_process";

const BLOG_DIR = path.join(process.cwd(), "app", "blog");
const EXCLUDED = new Set(["template"]);

// Canonical (already-scheduled) folder: <slug>-MM-DD-YYYY[-am|-pm]
const CANONICAL_RE = /-(\d{2})-(\d{2})-(\d{4})(?:-(am|pm))?$/i;
// Raw generator folder: NNNN_<type+slug>_MM_DD_YYYY
const GENERATOR_RE = /^(\d{4})_(.+)_(\d{2})_(\d{2})_(\d{4})$/;
const SPRINT_DAY_RE = /sprint_(\d+)\/day_(\d+)/i;
const SLUG_RE = /["']slug["']\s*:\s*["']([^"']+)["']/;
const MS_PER_DAY = 86_400_000;
const SLOTS = ["am", "pm"];

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const RESCHEDULE = args.includes("--reschedule");
const startArg = args.find((a) => a.startsWith("--start="))?.split("=")[1];

if (startArg && !/^\d{4}-\d{2}-\d{2}$/.test(startArg)) {
  fail(`--start must be YYYY-MM-DD (got "${startArg}")`);
}
if (RESCHEDULE && !startArg) fail("--reschedule requires --start=YYYY-MM-DD");

function fail(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

function readPostSource(dir) {
  try {
    return fs.readFileSync(path.join(BLOG_DIR, dir, "page.tsx"), "utf8");
  } catch {
    return "";
  }
}

/** Resolve { order, slug, date, slot, sprintDay } for a folder in either format. */
function parsePost(dir) {
  const src = readPostSource(dir);
  const sdMatch = src.match(SPRINT_DAY_RE);
  const sprintDay = sdMatch
    ? { sprint: Number(sdMatch[1]), day: Number(sdMatch[2]) }
    : null;

  const gen = dir.match(GENERATOR_RE);
  if (gen) {
    const [, order, , mm, dd, yyyy] = gen;
    const slug = src.match(SLUG_RE)?.[1];
    if (!slug) {
      fail(`${dir}: no PAGE_DATA "slug" found in page.tsx — cannot build a clean URL.`);
    }
    return {
      dir,
      order: Number(order),
      slug,
      date: { mm, dd, yyyy },
      slot: null, // assigned from within-day order
      sprintDay,
    };
  }

  const canon = dir.match(CANONICAL_RE);
  if (canon) {
    const [, mm, dd, yyyy, slot] = canon;
    return {
      dir,
      order: null,
      slug: dir.replace(CANONICAL_RE, ""),
      date: { mm, dd, yyyy },
      slot: slot?.toLowerCase() ?? null,
      sprintDay,
    };
  }

  // Unknown format: keep the name as the slug, no date.
  return { dir, order: null, slug: dir, date: null, slot: null, sprintDay };
}

// ── Collect ──────────────────────────────────────────────────────────────────
let entries;
try {
  entries = fs.readdirSync(BLOG_DIR, { withFileTypes: true });
} catch {
  fail(`cannot read ${BLOG_DIR}`);
}

const posts = entries
  .filter(
    (e) =>
      e.isDirectory() &&
      !EXCLUDED.has(e.name) &&
      !e.name.startsWith(".") &&
      !e.name.startsWith("_"),
  )
  .map((e) => parsePost(e.name));

if (posts.length === 0) fail("no blog posts found under app/blog");

// ── Order ────────────────────────────────────────────────────────────────────
// Prefer the generator's NNNN prefix; then sprint/day; then embedded date; then slug.
function orderKey(p) {
  if (p.order != null) return [0, p.order, 0, p.slug];
  if (p.sprintDay) return [1, p.sprintDay.sprint, p.sprintDay.day, p.slug];
  if (p.date) return [2, 0, 0, `${p.date.yyyy}-${p.date.mm}-${p.date.dd}-${p.slug}`];
  return [3, 0, 0, p.slug];
}
posts.sort((a, b) => {
  const ka = orderKey(a);
  const kb = orderKey(b);
  for (let i = 0; i < ka.length; i++) {
    if (ka[i] < kb[i]) return -1;
    if (ka[i] > kb[i]) return 1;
  }
  return 0;
});

// ── Bucket into publish-days ─────────────────────────────────────────────────
let startDate = null;
if (startArg) {
  startDate = new Date(`${startArg}T00:00:00Z`);
  if (Number.isNaN(startDate.getTime())) fail(`invalid --start "${startArg}"`);
}

function fmt(d) {
  return {
    mm: String(d.getUTCMonth() + 1).padStart(2, "0"),
    dd: String(d.getUTCDate()).padStart(2, "0"),
    yyyy: String(d.getUTCFullYear()),
  };
}

const useStartSequence = startArg && (RESCHEDULE || posts.every((p) => !p.date));
const buckets = [];

if (useStartSequence) {
  // Global order → consecutive pairs → one calendar day each from the anchor.
  for (let i = 0; i < posts.length; i += 2) {
    const dayIndex = i / 2;
    buckets.push({
      date: fmt(new Date(startDate.getTime() + dayIndex * MS_PER_DAY)),
      posts: posts.slice(i, i + 2),
    });
  }
} else {
  // Preserve embedded dates: group by calendar date.
  const byDate = new Map();
  for (const p of posts) {
    if (!p.date) {
      fail(`"${p.dir}" has no date and no --start given — pass --start=YYYY-MM-DD.`);
    }
    const key = `${p.date.yyyy}-${p.date.mm}-${p.date.dd}`;
    if (!byDate.has(key)) byDate.set(key, { date: p.date, posts: [] });
    byDate.get(key).posts.push(p);
  }
  buckets.push(...byDate.values());
}

// ── Build rename plan ────────────────────────────────────────────────────────
const plan = [];
const warnings = [];
const seenSlugs = new Map();

for (const bucket of buckets) {
  if (bucket.posts.length !== 2) {
    warnings.push(
      `${bucket.date.mm}-${bucket.date.dd}-${bucket.date.yyyy} has ${bucket.posts.length} post(s), not 2.`,
    );
  }
  // Preserve any slot a folder already carries (canonical posts), so re-runs are
  // idempotent and never reshuffle am/pm. Slot-less posts (raw generator folders)
  // fill the remaining slots in publish order — first free slot to the first post.
  const taken = new Set(bucket.posts.map((p) => p.slot).filter(Boolean));
  const free = SLOTS.filter((s) => !taken.has(s));
  let freeIdx = 0;
  bucket.posts.forEach((p) => {
    const slot = p.slot ?? free[freeIdx++] ?? `extra${freeIdx}`;
    if (seenSlugs.has(p.slug)) {
      warnings.push(`duplicate clean slug "${p.slug}" (${p.dir} & ${seenSlugs.get(p.slug)}).`);
    } else {
      seenSlugs.set(p.slug, p.dir);
    }
    const to = `${p.slug}-${bucket.date.mm}-${bucket.date.dd}-${bucket.date.yyyy}-${slot}`;
    plan.push({ from: p.dir, to, changed: p.dir !== to, slot });
  });
}

// ── Report + apply ───────────────────────────────────────────────────────────
const time = (s) => (s === "pm" ? "6:00pm ET" : s === "am" ? "3:00pm ET" : s);
const changes = plan.filter((p) => p.changed);

console.log(`\n${DRY_RUN ? "DRY RUN — " : ""}Scheduling ${posts.length} post(s) across ${buckets.length} day(s):\n`);
for (const p of plan) {
  const mark = p.changed ? "→" : "·";
  if (p.changed) console.log(`  ${mark} [${time(p.slot).padEnd(10)}] ${p.from}\n        ⇒ ${p.to}`);
  else console.log(`  ${mark} [${time(p.slot).padEnd(10)}] ${p.to}`);
}

if (warnings.length) {
  console.log("\nWarnings:");
  warnings.forEach((w) => console.log(`  ⚠ ${w}`));
}

if (changes.length === 0) {
  console.log("\n✓ Already scheduled — nothing to rename.\n");
  process.exit(0);
}
if (DRY_RUN) {
  console.log(`\n${changes.length} folder(s) would be renamed. Re-run without --dry-run to apply.\n`);
  process.exit(0);
}

let useGit = false;
try {
  execFileSync("git", ["rev-parse", "--is-inside-work-tree"], { stdio: "ignore" });
  useGit = true;
} catch {
  /* not a git repo */
}

for (const p of changes) {
  const from = path.join(BLOG_DIR, p.from);
  const to = path.join(BLOG_DIR, p.to);
  if (fs.existsSync(to)) fail(`target already exists: ${p.to}`);
  if (useGit) {
    try {
      execFileSync("git", ["mv", from, to], { stdio: ["ignore", "ignore", "pipe"] });
      continue;
    } catch {
      /* untracked — fall through to fs.renameSync */
    }
  }
  fs.renameSync(from, to);
}
console.log(`\n✓ Renamed ${changes.length} folder(s)${useGit ? " (git mv where tracked)" : ""}.\n`);
