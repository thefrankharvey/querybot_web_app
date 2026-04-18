# Testing & Validation Guide

How to verify your SEO/AEO/GEO schema is working before and after deployment.

---

## 🔍 Validator Tools

### Google Rich Results Test (primary)
**URL:** https://search.google.com/test/rich-results
**What it checks:** Whether your JSON-LD is valid AND eligible for Google rich snippets
**How to use:**
1. Paste your page URL
2. Click "Test URL"
3. Review the "Valid items detected" section
4. Each schema type should show as valid (green checkmark)
5. Click "View details" to see warnings/errors

**Common errors:**
- "Missing field: image" — add OG image or product image
- "Invalid URL" — check for typos, ensure absolute URLs
- "Shall be of type X" — wrong data type (string vs. array)

### Schema.org Validator (secondary)
**URL:** https://validator.schema.org/
**What it checks:** Schema.org compliance (even things Google doesn't use for rich results)
**Use when:** You want strict validation beyond Google's rich results requirements

### OpenGraph Preview
**URL:** https://www.opengraph.xyz/
**What it checks:** How your page looks when shared on LinkedIn, iMessage, Slack, Discord
**Checks:** Image dimensions, title, description truncation

### Twitter Card Validator
**URL:** https://cards-dev.twitter.com/validator
**What it checks:** How your page appears on X/Twitter
**Note:** X has restricted this tool — use OpenGraph.xyz as backup

### Facebook Sharing Debugger
**URL:** https://developers.facebook.com/tools/debug/
**What it checks:** Facebook-specific OG tags, clears their cache
**Use when:** You've updated OG tags and want Facebook to recrawl

---

## 🧪 Local Testing (Before Deploy)

### View raw HTML

```bash
# Start dev server
npm run dev

# In another terminal, fetch the raw HTML
curl -s http://localhost:3000/your-page | grep -A5 'application/ld+json'
```

### Count schema scripts

```bash
curl -s http://localhost:3000/your-page | grep -c 'application/ld+json'
```

Expected counts by page type:
- Homepage: 6 (WebSite + Organization + Person + Speakable + FAQ + Breadcrumb)
- Blog post: 5 (BlogPosting + Organization + Person + FAQ + Breadcrumb)
- Product page: 6 (Product + Organization + Person + Speakable + FAQ + Breadcrumb)
- Static page: 4 (WebPage + Organization + Speakable + Breadcrumb)

### Extract and validate JSON-LD locally

```bash
# Save page HTML
curl -s http://localhost:3000/your-page > page.html

# Extract all JSON-LD
grep -oE '<script type="application/ld\+json"[^>]*>.*?</script>' page.html

# Pipe each into jq to check syntax
curl -s http://localhost:3000/your-page | \
  pup 'script[type="application/ld+json"] text{}' | \
  jq . # <- will error if JSON is invalid
```

---

## 🔎 Browser DevTools Inspection

Chrome DevTools → **Elements tab** → Ctrl+F for `application/ld+json`

For each script found:
1. Right-click → Copy → Copy element
2. Paste into [JSON formatter](https://jsonformatter.org/) to check structure
3. Verify required fields are present
4. Look for `undefined` in stringified output (indicates missing data)

---

## 🤖 AI Engine Citation Testing

Modern AI engines crawl the web independently. To see if your content is citable:

### ChatGPT / Claude / Perplexity
Ask them specific questions your content answers. Example:
> "What are alpha brain waves and how do they affect creativity?"

If your article is well-optimized and has good authority signals, it should be cited in the response.

### Google SGE (Search Generative Experience)
Search for your target keywords on Google and check the AI Overview box. If your page appears in the cited sources, your schema is doing its job.

### Voice Search Testing
- Google Assistant: "Hey Google, [your question]"
- Alexa: "Alexa, [your question]"
- Siri: "Siri, [your question]"

If a voice assistant reads text from your page, your Speakable schema is working.

---

## 📊 Post-Launch Monitoring

### Google Search Console (must-have)
**URL:** https://search.google.com/search-console

Key reports to monitor:
1. **Performance** — Track clicks, impressions, CTR for your target pages
2. **Enhancements** → Rich results — See which schemas are detected + any errors
3. **Coverage** — Ensure all pages are indexed (not 404, not excluded)
4. **Sitemaps** — Submit your XML sitemap for faster indexing

### URL Inspection Tool
Within Search Console:
1. Paste any URL into the top search bar
2. View indexing status, canonical, structured data detection
3. Click "Test Live URL" to check current state vs. indexed version

### Bing Webmaster Tools
**URL:** https://www.bing.com/webmasters
- Similar to GSC but for Bing (which also powers ChatGPT's web search)
- Submit sitemap here too

---

## ⚡ Quick Validation Script

Save this as `scripts/validate-seo.sh` and run after deploys:

```bash
#!/bin/bash
# Usage: ./validate-seo.sh https://yoursite.com/your-page

URL=$1

echo "🔍 Testing: $URL"
echo ""

# Check response code
CODE=$(curl -o /dev/null -s -w "%{http_code}" "$URL")
echo "HTTP Status: $CODE"

# Count JSON-LD scripts
HTML=$(curl -s "$URL")
SCHEMA_COUNT=$(echo "$HTML" | grep -c 'application/ld+json')
echo "JSON-LD scripts: $SCHEMA_COUNT"

# Check for canonical
CANONICAL=$(echo "$HTML" | grep -oE 'rel="canonical" href="[^"]+"' | head -1)
echo "Canonical: $CANONICAL"

# Check for OG tags
OG_TITLE=$(echo "$HTML" | grep -oE 'og:title" content="[^"]+"' | head -1)
OG_IMAGE=$(echo "$HTML" | grep -oE 'og:image" content="[^"]+"' | head -1)
echo "OG Title: $OG_TITLE"
echo "OG Image: $OG_IMAGE"

echo ""
echo "✅ Manual validation needed:"
echo "   https://search.google.com/test/rich-results?url=$URL"
echo "   https://www.opengraph.xyz/url/$URL"
```

---

## 🚨 Common Issues & Fixes

### "Your page is not indexable"
- Check `robots.txt` — ensure it doesn't disallow the URL
- Check `<meta name="robots">` — must be `index, follow`
- Check canonical — if it points to a different URL, only that one is indexed

### "Rich result not detected"
- Check required fields for that schema type at schema.org
- `BlogPosting` needs `image` (1200×630 minimum for Google)
- `Product` needs `name`, `image`, `offers` or `review` or `aggregateRating`
- `FAQPage` needs Q&A visible on the page (not hidden)

### "Speakable not working on voice assistant"
- CSS selectors must match actual DOM elements
- Content must be visible (not `display: none`)
- Speakable content should be ≤150 words per selector

### Social share preview shows wrong image
- Force re-scrape via Facebook Debugger / Twitter Card Validator
- Some platforms cache OG images for weeks
- Ensure OG image URL is absolute (not relative `/images/foo.jpg`)

### Schema validates but doesn't show in search
- Rich results aren't guaranteed — Google decides based on quality
- Factors: page authority, content quality, user intent match
- Give it 2-4 weeks after indexing for rich results to appear
- Check Search Console → Enhancements for rejection reasons

---

## 📈 Measuring Success

**Leading indicators (check weekly):**
- Rich results count in Search Console
- Impressions for target keywords
- Schema validation errors trending to zero

**Lagging indicators (check monthly):**
- Organic traffic growth
- CTR from search results (rich results boost this)
- AI engine citation frequency (search your brand in ChatGPT/Perplexity)
- Voice search mentions (harder to measure but correlates with speakable)

**Target benchmarks:**
- Rich results appearing for 70%+ of indexed pages
- Zero critical errors in Search Console
- CTR above 3% for target queries (industry median is 1.5-2%)
