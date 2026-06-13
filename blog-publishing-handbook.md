# Blog Publishing Handbook

The single source of truth for how blog posts are written, scheduled, deployed, and recovered when things break.

This doc replaces fragmented knowledge across:

- `blog_pipeline_optimization.md` (runtime behavior)
- `src/app/blog/template/page.tsx` (inline-comment conventions)
- `docs/super_blog_template_proposal.md` (content shape)
- `.github/workflows/scheduled-deploy.yml` (CI/CD)
- tribal knowledge

If anything here contradicts those, this doc wins.

---

## Table of contents

1. [Quick start — publishing a post](#1-quick-start)
2. [File conventions](#2-file-conventions)
3. [`BLOG_CONFIG` field reference](#3-blog_config-field-reference)
4. [Authoring rules](#4-authoring-rules)
5. [Publishing states & scheduling](#5-publishing-states--scheduling)
6. [The build pipeline](#6-the-build-pipeline)
7. [The scheduled-publish pipeline](#7-the-scheduled-publish-pipeline)
8. [Helper scripts](#8-helper-scripts)
9. [Failure modes & runbook](#9-failure-modes--runbook)
10. [Operational knobs](#10-operational-knobs)
11. [Known gaps](#11-known-gaps)

---

## 1. Quick start

Publishing a new post takes five steps.

```bash
# 1. Copy the template into a new slug folder
cp -r src/app/blog/template src/app/blog/my-new-post-slug

# 2. Edit the new page.tsx
#    - Change SLUG to match the folder name
#    - Fill in BLOG_CONFIG (title, dates, description, sections)
#    - Fill in TLDR (3-5 bullets)
#    - Fill in RELATED_POSTS (3 hand-picked slugs)
#    - Adjust EXTRA_JSONLD if linking to a product

# 3. Verify locally
npm run dev                       # opens on :1000
# visit http://localhost:1000/blog/my-new-post-slug

# 4. Commit and push
git add src/app/blog/my-new-post-slug
git commit -m "blog: add my-new-post-slug"
git push

# 5. (Optional) For scheduled posts: set publishedDate to a future ISO date.
#    The cron at 9 AM + 7 PM ET will redeploy and the post goes live.
```

That's it. No CMS, no DB, no admin panel. The file is the post.

---

## 2. File conventions

### Folder layout

```
src/app/blog/
├── layout.tsx              ← /blog metadata + Org/WebPage/Breadcrumb JSON-LD
├── page.tsx                ← listing page (server component, fs.readdirSync)
├── template/page.tsx       ← scaffold (excluded from listing + sitemap)
└── <slug>/page.tsx         ← one folder per post
```

**Slug rules.** Folder name = URL path = canonical slug. Use kebab-case, no leading numbers, ASCII only. Once published, **never rename a slug** — add a redirect in `next.config.ts` (see `blogRedirects` array, lines 22-35) and create a new folder.

**Excluded folders.** `template/` is the only folder skipped by listing and sitemap. Any other folder in `src/app/blog/` is treated as a post.

### Anatomy of a post file

Every `<slug>/page.tsx` exports exactly three things:

```tsx
// 1. The config object — read by listing, sitemap, page, JSON-LD
export const BLOG_CONFIG: BlogConfig = { ... }

// 2. Next.js Metadata for <head>
export const metadata = buildBlogMetadata(SLUG, BLOG_CONFIG)

// 3. The default React component — just delegates to BlogPostLayout
export default function BlogPost() {
  blogPublishGate(BLOG_CONFIG)
  return <BlogPostLayout slug={SLUG} config={BLOG_CONFIG} tldr={TLDR}
           relatedPosts={RELATED_POSTS} extraJsonLd={EXTRA_JSONLD} />
}
```

> **Critical rule** (from prior incident): `BLOG_CONFIG` **must be `export const`**, not `const`. The listing page reads it via dynamic import; removing the `export` silently breaks the listing with no error.

Two more module-level constants live in the file but are not exported because the layout receives them as props:

- `TLDR: string[]` — 3-5 bullets, rendered in the speakable block
- `RELATED_POSTS: { slug, title }[]` — 3 hand-curated related posts
- `EXTRA_JSONLD: Record<string, unknown>[]` — optional Speakable / Product schemas

---

## 3. `BLOG_CONFIG` field reference

Defined in `src/lib/blog-seo.tsx:61`. Type: `BlogConfig` extends `BlogSeoConfig`.

| Field | Required | Type | Notes |
|---|---|---|---|
| `title` | yes | `string` | Becomes h1 + Open Graph title |
| `description` | yes | `string` | 150-160 chars, meta description + OG description |
| `date` | yes | `string` | Human-readable, e.g. `"March 15, 2024"` — displayed in byline |
| `publishedDate` | yes | `string` | ISO 8601, e.g. `"2024-03-15T00:00:00Z"` — drives publish gate + JSON-LD |
| `modifiedDate` | no | `string` | Defaults to `publishedDate`; bump when you edit a live post |
| `readTime` | yes | `string` | e.g. `"5 minutes"` — shown in byline; parsed to int for schema |
| `keywords` | yes | `string[]` | SEO keywords array |
| `articleSection` | no | `string` | Defaults to `"Wellness"` |
| `wordCount` | no | `number` | Exact count for `BlogPosting` schema |
| `altHeadline` | no | `string` | Shorter/punchier title variant for schema |
| `ogImageUrl` | no | `string` | 1200x630 hero. Falls back to `og-blog-default.jpg` |
| `ogImageAlt` | no | `string` | Alt for the OG image |
| `authorName` | no | `string` | Defaults to `"yvb™"` — use `AUTHORS.victor.name` etc. |
| `author` | no | `AuthorMeta` | Full author block for Person JSON-LD; from `src/constants/authors.ts` |
| `status` | no | `'draft' \| 'published'` | `draft` hides post regardless of date |
| `sections` | yes | `BlogSection[]` | The body. See below. |

### `sections[]` shape

```ts
type BlogSection = {
  heading: string    // empty string = intro section (no h2 rendered)
  content: BlogContentItem[]
}

type BlogContentItem =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'qa'; items: { question: string; answer: string }[] }
```

Rendering rules:

- Non-empty `heading` → h2 with auto-generated id (kebab-case of heading). Goes into the auto-TOC.
- `paragraph.text` and `list.items[]` and `qa.items[].answer` all render through `dangerouslySetInnerHTML` — see [Authoring rules](#4-authoring-rules).
- Any section content of type `qa` is auto-extracted into `FAQPage` JSON-LD.

---

## 4. Authoring rules

### Inline links

Inline links are written as raw HTML inside paragraph/list/qa text. Use the token form:

```html
<a href="/blog/other-slug"
   class="text-[var(--yvb-text-primary)] hover:text-[var(--yvb-link-cta-l1)] hover:underline transition-colors">
  link text
</a>
```

External links: add `target="_blank" rel="noopener noreferrer"`.

Legacy posts use `class="text-[#2BCCC0] hover:underline"` — `migrateInlineLinks()` in `BlogPostContent.tsx` rewrites these at render time. Use the token form for new posts.

> **Security boundary.** Because every paragraph and list item ships through `dangerouslySetInnerHTML`, the trust model is "the author wrote the file." A malicious PR can inject script tags. PR review is the only gate — there is no sanitizer.

### Dates

- `date` (human) and `publishedDate` (ISO) should match. They don't have to — only `publishedDate` controls the gate — but author confusion compounds if they drift.
- ISO must be valid `new Date()` input. Use `T00:00:00Z` for midnight UTC.
- Future `publishedDate` = scheduled post (see §5).

### TLDR is required

Even if not in the `BlogConfig` type, every layout call passes `tldr`. Don't ship a post with an empty TLDR — it's the `.speakable-tldr` block referenced by the Speakable schema and the first thing AI engines extract.

### `RELATED_POSTS`

Three hand-picked slugs + titles. Validate slugs exist (the listing won't 404, but the link will). No automated "you might also like" — this is fully manual.

### Word count, alt headline

Optional but **fill them in for any post you care about ranking**. Schema accuracy = better rich-result eligibility.

### Author E-E-A-T

Set `author: AUTHORS.victor` (or `carly`) — this adds Person JSON-LD with credentials and feeds Google's E-E-A-T signals. Posts without an `author` block get only the generic `yvb™` byline.

---

## 5. Publishing states & scheduling

A post has three possible states, decided by two fields:

| `status` | `publishedDate` | State | Visible? |
|---|---|---|---|
| `'draft'` | any | **Draft** | No |
| `'published'` or unset | past | **Live** | Yes |
| `'published'` or unset | future | **Scheduled** | No, until both: date passes AND a deploy runs |

`isBlogPublished(config)` in `src/lib/blog-seo.tsx:44` is the single source of truth. The listing filters with it, and `blogPublishGate()` calls `notFound()` for unpublished posts.

### Critical scheduling gotcha

**There is no ISR or `revalidate`.** Pages are fully static at build time. A scheduled post becomes visible only when:

1. The `publishedDate` is in the past, AND
2. A Vercel deploy runs after that date.

The second condition is handled by [the scheduled-publish pipeline](#7-the-scheduled-publish-pipeline) — but if that workflow fails, scheduled posts stay invisible until the next deploy from any source.

**Never schedule a post for a holiday/weekend without confirming the cron has run successfully.**

---

## 6. The build pipeline

Two GitHub Actions workflows handle code changes.

### `.github/workflows/e2e.yml`

Triggers:

- `push` to `main` or `dev`
- `pull_request` to `main`

Jobs:

1. **`e2e`** — Node 20, install Playwright, run `npm run test:e2e`. 30 min timeout. Requires `SHOPIFY_*`, `POSTHOG_*`, `POSTGRES_URL` secrets. Uploads `playwright-report/` and `e2e/screenshots/` on failure.
2. **`unit-tests`** — Node 20, `npm run test` (Vitest) + `npm run lint`. 10 min timeout.

Both jobs run `npm run check:schema-versions` first.

### Vercel deploy

Not in `.github/workflows/`. Vercel watches the GitHub repo and:

- Deploys a **preview** for every PR.
- Deploys to **production** on push to `main`.
- Runs `next build` (Turbopack); generates static pages for all 122 posts + listing + sitemap.

No `vercel.json` in the repo. All Vercel config lives in the Vercel project dashboard.

### `next.config.ts` highlights

- `eslint.ignoreDuringBuilds: true` and `typescript.ignoreBuildErrors: true` — **builds will succeed with type errors and lint failures.** CI catches these separately via the `unit-tests` job, but a force-push to `main` could ship a broken post if CI is bypassed.
- `redirects()` includes 9 legacy blog URL redirects (lines 22-35) — add to this array whenever you rename or delete a post.
- Security headers (`X-Frame-Options`, HSTS, etc.) apply to all routes including blog.

---

## 7. The scheduled-publish pipeline

`.github/workflows/scheduled-deploy.yml` — the entire scheduled-publish mechanism in 20 lines:

```yaml
on:
  schedule:
    - cron: '0 13 * * *'   # 9 AM ET (UTC, no DST adjust)
    - cron: '0 23 * * *'   # 7 PM ET (UTC, no DST adjust)
  workflow_dispatch:       # manual trigger
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - run: curl -X POST "${{ secrets.VERCEL_DEPLOY_HOOK }}"
```

What happens:

1. GitHub Actions cron fires at 13:00 UTC and 23:00 UTC.
2. Workflow makes a POST to the Vercel deploy hook.
3. Vercel kicks off a fresh production build.
4. Build runs `next build`, which re-evaluates every `BLOG_CONFIG`, including `publishedDate` checks against the current time.
5. Posts whose `publishedDate` is now in the past get included in the static output.

### What can break this

- **`VERCEL_DEPLOY_HOOK` secret missing or rotated.** Silent failure — the curl returns 4xx, the workflow logs an error, but no one is watching.
- **DST drift.** The crons are fixed UTC. Twice a year the "9 AM ET" cron is actually at 8 AM ET (during DST) or 10 AM ET (after fall-back). Not catastrophic but worth knowing.
- **GitHub Actions outage.** No retry, no backup mechanism.
- **Vercel build failure.** If the scheduled deploy fails for any reason (broken post, dependency issue), the next scheduled run tries again 10 hours later.

### Verifying a scheduled post will actually publish

```bash
# 1. Confirm the file exists and parses
node -e "console.log(require('./src/app/blog/<slug>/page.tsx'))"
# (may not work directly with TSX — instead, run npm run dev and visit the page)

# 2. Confirm the workflow is listed and last run succeeded
gh workflow view scheduled-deploy.yml

# 3. Confirm the deploy hook is still valid in Vercel project settings
# (no CLI for this — check dashboard)
```

---

## 8. Helper scripts

`package.json` defines these blog-adjacent scripts:

| Command | File | What it does |
|---|---|---|
| `npm run generate:blog` | `scripts/generate-blog.ts` | Generates blog post files from a CSV. Used for bulk imports. |
| (no npm wrapper) | `scripts/audit-published-blogs.mjs` | Playwright-driven content audit — scans live posts for `TODO`, `TBD`, `Lorem ipsum`, `keyword1`, `Click here`, etc. Run via `node scripts/audit-published-blogs.mjs`. |
| (no npm wrapper) | `scripts/convert-html-blogs.js` | One-shot HTML → BlogConfig converter (legacy migration). |
| (no npm wrapper) | `scripts/import-blog-sprint.mjs` | Sprint import script. |
| (no npm wrapper) | `scripts/titlecase-blogs.mjs` | Title-cases blog titles in bulk. |

Most of these are one-off / migration tools. The two you'll actually use:

- **`generate:blog`** for any bulk content drop from a content team CSV.
- **`audit-published-blogs.mjs`** as a pre-publish sanity check or post-launch QA.

---

## 9. Failure modes & runbook

### "I pushed a post but it doesn't show in the listing"

**Likely causes (most → least common):**

1. **`publishedDate` is in the future.** Check the ISO date. If you want it live now, set it to a past date and push again, OR wait for the next scheduled deploy.
2. **`status: 'draft'`.** Remove it.
3. **`BLOG_CONFIG` is not exported.** Check that the line reads `export const BLOG_CONFIG`. This was the silent regression from a prior incident.
4. **The post file has a syntax error.** The listing's `getBlogPosts()` swallows errors silently (`src/app/blog/page.tsx:46-48`). Run `npm run dev` and look for a build error in the terminal.
5. **The dev server is using a stale build cache.** Restart it.

### "A scheduled deploy didn't run"

1. Check workflow runs: `gh workflow view scheduled-deploy.yml` or visit the Actions tab.
2. If the workflow ran but failed, the curl response logs will tell you whether the hook returned 4xx (secret bad) or 5xx (Vercel down).
3. If the workflow didn't run at all, GitHub Actions cron is flaky — fire it manually: `gh workflow run scheduled-deploy.yml`.

### "I shipped a post with a typo in the title — how fast can I fix it?"

1. Edit `BLOG_CONFIG.title` (and `altHeadline` if set).
2. Bump `modifiedDate` to current ISO.
3. Push. Vercel deploys on push to `main` — typically live in 2-3 minutes.
4. The fix won't auto-propagate to anywhere that cached the old title (social shares, Google's index) — that takes a recrawl.

### "I need to take a post down RIGHT NOW"

1. Add `status: 'draft'` to its `BLOG_CONFIG`.
2. Commit + push to `main`.
3. ~2-3 min later, the post returns 404 and disappears from the listing.

Alternative (faster, but not recommended for casual use): change the slug folder name — but this breaks inbound links and Google indexing. Use draft status.

### "A bulk-imported post has a broken `BLOG_CONFIG`"

1. Check the Vercel deploy log — `next build` will fail loudly on TSX syntax errors.
2. `eslint.ignoreDuringBuilds` and `typescript.ignoreBuildErrors` are both `true`, so the build will succeed for *type* errors but not for *syntax* errors.
3. Fix the file or delete the folder.

---

## 10. Operational knobs

### Force-publish a scheduled post early

Option A — change the date and push:

```bash
# Edit publishedDate to a past time, then:
git commit -am "blog: force-publish <slug>"
git push origin main
```

Option B — keep the future date but trigger the deploy manually (only works if `publishedDate` is past *enough* — i.e., already past by deploy time):

```bash
gh workflow run scheduled-deploy.yml
```

### Force a fresh build without code changes

```bash
gh workflow run scheduled-deploy.yml
# OR
# Push an empty commit:
git commit --allow-empty -m "chore: force redeploy"
git push origin main
```

### Add a redirect for a renamed/deleted post

Edit `next.config.ts`, add to `blogRedirects` array:

```ts
{ source: '/blog/old-slug', destination: '/blog/new-slug', permanent: true }
```

### Take down a post permanently

1. Set `status: 'draft'` first to confirm it goes away cleanly.
2. Add a redirect to a relevant alternative (or `/blog`) in `blogRedirects`.
3. Delete the folder.
4. Commit + push.

Without step 2, every external link to the old URL 404s. Don't skip it.

---

## 11. Known gaps

Things this handbook **does not** cover, but should be addressed eventually:

- **No alerting on cron failure.** If `scheduled-deploy.yml` fails, nobody knows. Add a Slack/email notification on workflow failure.
- **No alerting on broken `BLOG_CONFIG`.** The listing's silent `catch` block hides regressions. Either log to stderr or fail the build on import error.
- **No content-shape automation.** `super_blog_template_proposal.md` describes the ideal article structure (key takeaways, direct answer, body sections), but nothing in the template enforces it. New posts can ship without TLDRs, without h2 questions, without citations.
- **No preview link for scheduled posts.** A draft is invisible to everyone. There's no `?preview=token` mechanism for sharing an unpublished post with stakeholders.
- **No CMS.** Non-engineers can't edit. Every change needs a PR.
- **No author page.** `AUTHORS` has `url: undefined` — Person JSON-LD references no canonical author bio page.
- **DST drift in crons.** Convert to a DST-aware scheduler or accept the 1-hour drift twice a year.
- **`eslint.ignoreDuringBuilds` and `typescript.ignoreBuildErrors`** are both true in `next.config.ts`. This means a force-push to `main` can ship a broken build past CI.

Each of these is a candidate for a follow-up ticket. The system works today, but it works because we know how to drive it manually — not because it's defensively built.
