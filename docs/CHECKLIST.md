# Pre-Launch SEO/AEO/GEO Checklist

Run through this for any new page before shipping. Three categories: **Critical** (must have), **Recommended** (strong impact), **Optional** (nice-to-have).

---

## 🔴 Critical (must-ship blockers)

### Metadata
- [ ] `title` is 50-60 characters, includes primary keyword near the front
- [ ] `description` is 150-160 characters, compelling enough to earn clicks
- [ ] `canonical` URL is set (absolute, not relative)
- [ ] Page has proper H1 (one per page, matches title intent)

### Open Graph
- [ ] `og:type` set correctly (`article` for content with dates, `website` for static)
- [ ] `og:title`, `og:description`, `og:url`, `og:image` all present
- [ ] OG image is 1200×630 pixels, under 5MB, JPG/PNG
- [ ] Fallback OG image is set for pages that don't have a unique one

### Twitter Card
- [ ] `twitter:card` = `summary_large_image`
- [ ] `twitter:title`, `twitter:description`, `twitter:image` all present

### JSON-LD Schema (required for every page)
- [ ] `Organization` schema present
- [ ] `BreadcrumbList` schema present (for every non-home page)
- [ ] Page-type schema present (one of: WebPage, BlogPosting, Product, FAQPage, etc.)

### Technical
- [ ] Page returns 200 OK (not 3xx redirects chain, not 4xx, not 5xx)
- [ ] `robots` meta: `index: true, follow: true` for public pages
- [ ] Works without JavaScript (server-rendered or fallback content)
- [ ] Mobile-responsive (Google uses mobile-first indexing)

---

## 🟡 Recommended (high-impact)

### Schema Depth
- [ ] `Person` schema (for E-E-A-T) — especially critical on YMYL content
- [ ] `SpeakableSpecification` — voice search + AI citation
- [ ] `FAQPage` schema if page has any Q&A content
- [ ] `mainEntityOfPage` set on primary schema (Product, Article, etc.)

### Content Structure
- [ ] H2s are written as questions or clear section headers
- [ ] TLDR / summary near the top, wrapped in `.speakable-tldr` or similar class
- [ ] Key facts wrapped in `.key-fact` class (for speakable)
- [ ] First paragraph directly answers the title's implicit question
- [ ] Internal links to 3-5 related pages on the site
- [ ] At least one external link to an authoritative source (study, org, etc.)

### Metadata Completeness
- [ ] `publishedTime` / `modifiedTime` in OG tags (signals freshness)
- [ ] `keywords` meta — short list of 5-10 target keywords
- [ ] `article:author` tag if content has a byline
- [ ] `article:section` tag for category/taxonomy

### Images
- [ ] Every image has descriptive `alt` text (not "image 1")
- [ ] Images use modern format (WebP, AVIF) where possible
- [ ] `loading="lazy"` on below-the-fold images
- [ ] `width` + `height` attributes set (prevents layout shift)

### Accessibility (indirectly affects SEO)
- [ ] Proper heading hierarchy (H1 → H2 → H3, no skipping)
- [ ] Color contrast meets WCAG AA
- [ ] Interactive elements are keyboard-accessible
- [ ] Form inputs have associated labels

---

## 🟢 Optional (polish)

### Advanced Schema
- [ ] `AggregateRating` if page has reviews (minimum 3 reviews)
- [ ] `VideoObject` if page has embedded video
- [ ] `HowTo` schema for tutorial content
- [ ] `Recipe` schema for food content
- [ ] `Event` schema for event pages
- [ ] `Course` schema for educational content

### Author Authority (E-E-A-T boosters)
- [ ] Author has a dedicated `/about/[name]` page that's linked in `Person.url`
- [ ] Author's LinkedIn is cross-linked to the author page
- [ ] Author page has its own Person JSON-LD
- [ ] Author page links to their published articles on this site

### Rich Results Eligibility
- [ ] Page tested in [Google Rich Results Test](https://search.google.com/test/rich-results)
- [ ] Page validated in [Schema.org Validator](https://validator.schema.org/)
- [ ] OG preview tested at [OpenGraph.xyz](https://www.opengraph.xyz/)
- [ ] Twitter Card preview tested at [Card Validator](https://cards-dev.twitter.com/validator)

### Performance
- [ ] Lighthouse SEO score ≥ 95
- [ ] Lighthouse Performance score ≥ 80 (Core Web Vitals)
- [ ] LCP < 2.5s, FID < 100ms, CLS < 0.1

### Monitoring
- [ ] Page added to XML sitemap
- [ ] Google Search Console tracks the URL
- [ ] Analytics event fires on page view

---

## Quick Smoke Test

After deploying, run these 3 checks in 2 minutes:

```bash
# 1. Verify the page responds 200
curl -I https://yoursite.com/your-new-page

# 2. Count the JSON-LD scripts (should be 4-7 depending on page type)
curl -s https://yoursite.com/your-new-page | grep -c 'application/ld+json'

# 3. Confirm canonical URL matches the requested URL
curl -s https://yoursite.com/your-new-page | grep 'rel="canonical"'
```

Then paste the URL into [Google Rich Results Test](https://search.google.com/test/rich-results) and verify:
- Green "Valid items" count matches the number of schemas you expect
- No red errors
- Preview renders correctly

---

## YMYL Content — Extra Requirements

For any page covering **Your Money Your Life** topics (health, finance, legal, safety), add:

- [ ] `Person` schema for the author with `hasCredential` (degree + license)
- [ ] Medical/financial reviewer listed with their credentials if different from author
- [ ] "Medically reviewed by" or "Financially reviewed by" disclaimer on the page
- [ ] Citations to primary research (peer-reviewed studies, government sources)
- [ ] Last updated date visible on the page (not just in schema)
- [ ] Disclaimer if needed (FDA, "not professional advice", etc.)

Google holds YMYL content to a dramatically higher bar. Missing E-E-A-T signals = ranking penalties.
