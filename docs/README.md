# SEO / AEO / GEO Schema Guide

A drop-in foundation for optimizing any page on any site for:

- **SEO** — Traditional search (Google, Bing) — rank for keywords
- **AEO** — Answer Engine Optimization (voice search, featured snippets, People Also Ask)
- **GEO** — Generative Engine Optimization (ChatGPT, Perplexity, Claude, Gemini, Google SGE) — get cited in AI-generated answers

This guide works for any Next.js 13+ project (App Router) and can be adapted to any framework that supports meta tags + JSON-LD scripts.

---

## Why All Three Matter in 2026+

Traditional SEO alone is no longer sufficient. Users now get answers from:

| Channel | Ranking Signal | What to Optimize |
|---|---|---|
| Google Search | Keywords, backlinks, E-E-A-T | Meta tags, JSON-LD, author authority |
| Google SGE / AI Overviews | Structured data, cited sources | FAQ schema, clear H2/H3, TLDR sections |
| ChatGPT / Perplexity / Claude | Crawled training data + citations | Speakable schema, clear factual claims, author bio |
| Voice assistants (Alexa, Google) | Speakable spec, FAQ schema | `SpeakableSpecification` CSS selectors |
| Featured snippets | Q&A structure, direct answers | FAQ JSON-LD, `<h2>What is...</h2>` patterns |

**Bottom line:** The same structured data that helps Google also helps AI engines decide whether to cite your content as a source.

---

## The 7 Schema Types Every Page Needs

Every indexable page should emit these JSON-LD blocks in the `<head>` (order doesn't matter):

### 1. **Organization** (site-wide)
Tells search engines who's behind the site. Goes on every page.

**Required fields:** `name`, `url`, `logo`, `description`, `sameAs` (social links)
**Strong to add:** `contactPoint`, `foundingDate`, `address`, `knowsAbout`

### 2. **WebSite** (homepage only)
Declares the site exists and enables sitelinks search box.

**Required fields:** `name`, `url`, `description`
**Strong to add:** `potentialAction` (SearchAction for sitelinks search box)

### 3. **BreadcrumbList** (every non-home page)
Shows hierarchy in search results and helps AI engines understand site structure.

**Required fields:** `itemListElement` array with `position`, `name`, `item` (URL)

### 4. **Person** (E-E-A-T signals — any page with opinions/advice/content)
Attributes content to a real human with credentials. Critical for **YMYL** (Your Money Your Life) topics — health, finance, legal.

**Required fields:** `name`, `jobTitle`, `description` (bio)
**Strong to add:** `image`, `alumniOf`, `hasCredential`, `memberOf`, `sameAs` (LinkedIn, Twitter)

### 5. **Page-type-specific schema** (the main content)
One of:
- **BlogPosting / Article** — for blog posts, articles
- **Product** — for product detail pages (+ Offer, AggregateRating, Review)
- **WebPage** — for landing/marketing pages
- **CollectionPage** — for category/listing pages
- **FAQPage** — for pages that are primarily Q&A

### 6. **FAQPage** (any page with ≥2 Q&A pairs)
Google pulls these directly into search results as "People Also Ask" entries.

**Required:** `mainEntity` array of `Question` objects with `acceptedAnswer`

### 7. **Speakable** (voice search + AI citation)
A `WebPage` with `SpeakableSpecification` identifying which DOM nodes AI assistants should quote.

**Required:** `url`, `speakable.cssSelector` (array of CSS selectors targeting quotable content)
**Default selectors we use:** `h1`, `h2`, `.tldr-section`, `.speakable-tldr`, `.ai-summary`, `.key-fact`, `blockquote`, `.direct-answer`

---

## Per-Page Type Checklist

### 🏠 Homepage
- [ ] Metadata: title, description, canonical, robots
- [ ] OG: type=`article` or `website`, title, description, image (1200×630), `publishedTime`, `modifiedTime`
- [ ] Twitter Card: `summary_large_image`
- [ ] JSON-LD: WebSite + Organization (with address) + Person (CEO/founder) + Speakable + FAQ + Breadcrumb

### 📦 Product listing page
- [ ] Metadata + OG/Twitter (with listing image)
- [ ] JSON-LD: WebPage + Organization + Person + Speakable + FAQ + Breadcrumb
- [ ] Optional: CollectionPage schema with `hasPart` array of products

### 🛍️ Product detail page
- [ ] Metadata: dynamic title/description per product, canonical
- [ ] OG/Twitter: dynamic product image, `publishedTime`, `modifiedTime`
- [ ] JSON-LD: **Product** (with `mainEntityOfPage`, `offers`, `aggregateRating`, `review`) + Organization + Person (health expert for health products) + Speakable + FAQ + Breadcrumb

### 📝 Blog post / article
- [ ] Metadata: title, description, keywords, canonical, author
- [ ] OG: type=`article`, `publishedTime`, `modifiedTime`, `section`, author, per-post image
- [ ] Twitter Card
- [ ] JSON-LD: **BlogPosting** (with `headline`, `alternativeHeadline`, `author`, `wordCount`, `timeRequired`, `speakable`, `isAccessibleForFree`) + Organization + Person (full E-E-A-T) + FAQ (if Q&A section exists) + Breadcrumb

### 📄 Policy / legal pages (Terms, Privacy, etc.)
- [ ] Metadata: title, description, canonical, `robots: noindex` is NOT needed (let them rank)
- [ ] JSON-LD: WebPage + Organization + Breadcrumb
- [ ] Optional: `lastReviewed` date in schema

### 🔍 Search / filter results
- [ ] Metadata: dynamic based on query
- [ ] `robots: noindex` for infinite filter combos to avoid crawl budget waste
- [ ] JSON-LD: WebPage + Breadcrumb

---

## Google Rich Results Eligibility

Schemas that unlock **rich snippets** (images, ratings, prices directly in search results):

| Schema | Rich Result | Requires |
|---|---|---|
| Product | Price, availability, rating stars | `offers`, `aggregateRating`, `review` |
| FAQPage | Expandable Q&A in search | Valid Q/A pairs, visible on page |
| BlogPosting | Article card with image | `headline`, `image` (1200×630), `datePublished`, `author` |
| Breadcrumb | Breadcrumb trail replaces URL | 2+ items |
| Organization | Knowledge panel | `logo`, `sameAs`, consistent NAP |
| SpeakableSpecification | Google Assistant "read it to me" | Valid CSS selectors matching DOM |

---

## The Files in This Folder

- **`README.md`** — this file
- **`TEMPLATE.md`** — implementation template with copy-pasteable code for Next.js 13+ App Router
- **`AUTHOR_CONFIG_TEMPLATE.ts`** — typed config for `Person` JSON-LD (E-E-A-T author data)
- **`CHECKLIST.md`** — pre-launch QA checklist for any new page
- **`TESTING.md`** — how to validate the schema (Google Rich Results Test, Schema.org Validator, etc.)

---

## Quick Start for a New Project

1. Copy `TEMPLATE.md` code into a `src/lib/seo.tsx` (or equivalent) — this has all the builder functions
2. Fill in site-level constants (SITE_URL, SITE_NAME, SITE_LOGO) at the top
3. Copy `AUTHOR_CONFIG_TEMPLATE.ts` to `src/constants/authors.ts` and fill in author data
4. On each page, import the builders + `<JsonLdScript>` component and emit the schema blocks matching the page type
5. Add Next.js `export const metadata` with title, description, OG, Twitter
6. Run through `CHECKLIST.md` before shipping
7. Validate with tools in `TESTING.md`

---

## Philosophy

- **Ship the schema once, update it rarely.** Put builders in a shared lib so every page uses the same logic.
- **Prefer JSON-LD over microdata/RDFa.** Google's preferred format, easier to maintain.
- **Author authority compounds.** Every blog post, every product page should link back to a real expert's `Person` schema.
- **Speakable is the cheapest AI optimization.** Add the `WebPage` with `SpeakableSpecification` to every page — AI engines use it to know what to cite.
- **OG dates matter even for static pages.** `publishedTime` and `modifiedTime` signal content freshness to every crawler.
- **Images are non-negotiable.** Every page needs a 1200×630 OG image. Use a branded fallback for pages without a custom one.
