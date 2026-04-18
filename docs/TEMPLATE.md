# SEO/AEO/GEO Template — Copy-Paste Code

Portable Next.js 13+ App Router implementation. Drop into any project.

---

## 1. Site Constants (`src/lib/seo.tsx`)

```tsx
// Replace these with your site's values
export const SITE_URL = 'https://yoursite.com';
export const SITE_NAME = 'Your Brand™';
export const SITE_LOGO = 'https://yoursite.com/logo.svg';
export const SITE_TWITTER = '@yourhandle';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-default.jpg`; // 1200x630
```

---

## 2. JsonLdScript Component

```tsx
export function JsonLdScript({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

---

## 3. Schema Builders

### Organization (every page)

```tsx
export function buildOrganizationJsonLd(opts?: { includeAddress?: boolean }) {
  const base: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: SITE_LOGO,
    description: 'Your brand description here.',
    contactPoint: [{
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@yoursite.com',
      availableLanguage: 'English',
    }],
    sameAs: [
      'https://instagram.com/yourhandle',
      'https://linkedin.com/company/yourbrand',
      'https://x.com/yourhandle',
    ],
  };
  if (opts?.includeAddress) {
    base.address = {
      '@type': 'PostalAddress',
      addressCountry: 'US',
      addressLocality: 'Miami',
      addressRegion: 'FL',
    };
  }
  return base;
}
```

### WebSite (homepage only)

```tsx
export function buildWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: 'Your site description.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}
```

### WebPage (landing / category pages)

```tsx
export function buildWebPageJsonLd(page: { title: string; description: string; url: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.description,
    url: page.url,
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: SITE_LOGO, width: 300, height: 300 },
    },
  };
}
```

### Breadcrumb (every non-home page)

```tsx
interface BreadcrumbItem { name: string; url: string; }

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
```

### FAQ (any page with Q&A)

```tsx
interface FaqItem { question: string; answer: string; }

export function buildFaqJsonLd(faqs: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}
```

### Speakable (voice search + AI citation — put on EVERY page)

```tsx
const DEFAULT_SPEAKABLE_SELECTORS = [
  'h1', 'h2', '.tldr-section', '.speakable-tldr', '.ai-summary',
  '.key-fact', '.summary-section', 'blockquote',
  '.direct-answer', '.quick-answer',
];

export function buildSpeakableJsonLd(url: string, cssSelectors?: string[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: cssSelectors ?? DEFAULT_SPEAKABLE_SELECTORS,
    },
  };
}
```

### Person (E-E-A-T — tie content to a real expert)

```tsx
export interface AuthorMeta {
  name: string;
  title: string;               // Job title
  bio: string;                 // 1-3 sentence professional bio
  url?: string;                // Author profile page
  imageUrl?: string;           // Headshot
  expertise?: string[];        // Topics they know about
  linkedinUrl?: string;
  twitterUrl?: string;
  university?: string;
  degree?: string;
  educationLevel?: string;     // "Bachelor's" | "Master's" | "PhD"
  certifications?: { name: string; category: string }[];
  memberOf?: string;           // Professional organization
}

export function buildPersonJsonLd(author: AuthorMeta) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    jobTitle: author.title,
    description: author.bio,
    url: author.url,
    image: author.imageUrl
      ? { '@type': 'ImageObject', url: author.imageUrl, width: 400, height: 400 }
      : undefined,
    knowsAbout: author.expertise,
    alumniOf: author.university
      ? { '@type': 'EducationalOrganization', name: author.university }
      : undefined,
    hasCredential: [
      ...(author.degree ? [{
        '@type': 'EducationalOccupationalCredential',
        name: author.degree,
        credentialCategory: 'degree',
        educationalLevel: author.educationLevel,
      }] : []),
      ...(author.certifications?.map((c) => ({
        '@type': 'EducationalOccupationalCredential',
        name: c.name,
        credentialCategory: c.category,
      })) ?? []),
    ],
    memberOf: author.memberOf
      ? { '@type': 'Organization', name: author.memberOf }
      : undefined,
    worksFor: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    sameAs: [author.linkedinUrl, author.twitterUrl].filter(Boolean),
  };
}
```

### Product (product detail pages)

```tsx
export function buildProductJsonLd(product: {
  name: string;
  description: string;
  url: string;
  image?: string;
  price?: string;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  aggregateRating?: { ratingValue: number; reviewCount: number };
  reviews?: { author: string; rating: number; date: string; content: string }[];
}) {
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    url: product.url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': product.url },
    brand: { '@type': 'Brand', name: SITE_NAME },
    image: product.image,
    offers: {
      '@type': 'Offer',
      url: product.url,
      priceCurrency: product.currency ?? 'USD',
      price: product.price,
      availability: `https://schema.org/${product.availability ?? 'InStock'}`,
      seller: { '@type': 'Organization', name: SITE_NAME },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'US',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: '30',
        returnMethod: 'https://schema.org/ReturnByMail',
      },
    },
  };
  if (product.aggregateRating) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.aggregateRating.ratingValue.toString(),
      bestRating: '5',
      ratingCount: product.aggregateRating.reviewCount.toString(),
    };
  }
  if (product.reviews?.length) {
    jsonLd.review = product.reviews.slice(0, 3).map((r) => ({
      '@type': 'Review',
      reviewBody: r.content,
      author: { '@type': 'Person', name: r.author },
      datePublished: r.date,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.rating.toString(),
        bestRating: '5',
        worstRating: '1',
      },
    }));
  }
  return jsonLd;
}
```

### BlogPosting / Article (blog posts)

```tsx
export interface BlogPostMeta {
  title: string;
  altHeadline?: string;
  description: string;
  canonicalUrl: string;
  ogImageUrl?: string;
  ogImageAlt?: string;
  publishedDate: string;    // ISO 8601
  modifiedDate: string;
  articleSection?: string;
  wordCount?: number;
  readingTimeMinutes?: number;
  keywords?: string[];
  authorName: string;
  authorUrl?: string;
}

export function buildBlogPostingJsonLd(post: BlogPostMeta) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    alternativeHeadline: post.altHeadline,
    description: post.description,
    image: post.ogImageUrl
      ? { '@type': 'ImageObject', url: post.ogImageUrl, width: 1200, height: 630, caption: post.ogImageAlt }
      : undefined,
    datePublished: post.publishedDate,
    dateModified: post.modifiedDate,
    articleSection: post.articleSection,
    wordCount: post.wordCount,
    timeRequired: post.readingTimeMinutes ? `PT${post.readingTimeMinutes}M` : undefined,
    keywords: post.keywords,
    author: { '@type': 'Person', name: post.authorName, url: post.authorUrl },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: SITE_LOGO, width: 300, height: 300 },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': post.canonicalUrl },
    isAccessibleForFree: true,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', 'h2', '.tldr-section', '.speakable-tldr', '.ai-summary', 'blockquote'],
    },
  };
}
```

---

## 4. Next.js Metadata Pattern

```tsx
// Page-level metadata (goes at top of page.tsx or layout.tsx)
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Title — Primary Keyword | Brand',
  description: '150-160 char description with primary keyword, click-worthy copy.',
  keywords: ['keyword1', 'keyword2', 'keyword3'],
  alternates: { canonical: 'https://yoursite.com/this-page' },
  openGraph: {
    type: 'article',                         // 'article' gives you publishedTime/modifiedTime
    title: 'Page Title',
    description: 'Description',
    url: 'https://yoursite.com/this-page',
    siteName: 'Brand',
    locale: 'en_US',
    images: [{
      url: 'https://yoursite.com/images/page-og.jpg',
      width: 1200,
      height: 630,
      alt: 'Descriptive alt text',
    }],
    publishedTime: '2025-01-15T00:00:00Z',
    modifiedTime: new Date().toISOString(),
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Page Title',
    description: 'Description',
    site: '@yourhandle',
    creator: '@yourhandle',
    images: ['https://yoursite.com/images/page-og.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
};
```

---

## 5. Page Examples

### Homepage

```tsx
import {
  JsonLdScript, buildWebSiteJsonLd, buildOrganizationJsonLd,
  buildPersonJsonLd, buildSpeakableJsonLd, buildFaqJsonLd,
  buildBreadcrumbJsonLd, SITE_URL,
} from '@/lib/seo';
import { AUTHORS } from '@/constants/authors';

export default function HomePage() {
  return (
    <>
      <JsonLdScript data={buildWebSiteJsonLd()} />
      <JsonLdScript data={buildOrganizationJsonLd({ includeAddress: true })} />
      <JsonLdScript data={buildPersonJsonLd(AUTHORS.ceo)} />
      <JsonLdScript data={buildSpeakableJsonLd(SITE_URL)} />
      <JsonLdScript data={buildFaqJsonLd(homepageFaqs)} />
      <JsonLdScript data={buildBreadcrumbJsonLd([
        { name: 'Home', url: SITE_URL },
      ])} />
      {/* page content */}
    </>
  );
}
```

### Product Detail Page

```tsx
export default async function ProductLayout({ children, params }) {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  const reviews = await fetchReviews(slug);

  return (
    <>
      <JsonLdScript data={buildProductJsonLd({
        name: product.title,
        description: product.description,
        url: `${SITE_URL}/p/${slug}`,
        image: product.image,
        price: product.price,
        aggregateRating: reviews.aggregate,
        reviews: reviews.items,
      })} />
      <JsonLdScript data={buildOrganizationJsonLd()} />
      <JsonLdScript data={buildPersonJsonLd(AUTHORS.expert)} />
      <JsonLdScript data={buildSpeakableJsonLd(`${SITE_URL}/p/${slug}`)} />
      <JsonLdScript data={buildFaqJsonLd(productFaqs)} />
      <JsonLdScript data={buildBreadcrumbJsonLd([
        { name: 'Home', url: SITE_URL },
        { name: 'Products', url: `${SITE_URL}/products` },
        { name: product.title, url: `${SITE_URL}/p/${slug}` },
      ])} />
      {children}
    </>
  );
}
```

### Blog Post

```tsx
export default function BlogPost() {
  return (
    <>
      <JsonLdScript data={buildBlogPostingJsonLd({
        title: BLOG_CONFIG.title,
        altHeadline: BLOG_CONFIG.altHeadline,
        description: BLOG_CONFIG.description,
        canonicalUrl: `${SITE_URL}/blog/${SLUG}`,
        ogImageUrl: BLOG_CONFIG.ogImageUrl,
        publishedDate: BLOG_CONFIG.publishedDate,
        modifiedDate: BLOG_CONFIG.modifiedDate ?? BLOG_CONFIG.publishedDate,
        articleSection: BLOG_CONFIG.articleSection,
        wordCount: BLOG_CONFIG.wordCount,
        keywords: BLOG_CONFIG.keywords,
        authorName: AUTHORS.writer.name,
      })} />
      <JsonLdScript data={buildOrganizationJsonLd()} />
      <JsonLdScript data={buildPersonJsonLd(AUTHORS.writer)} />
      {faqItems.length > 0 && <JsonLdScript data={buildFaqJsonLd(faqItems)} />}
      <JsonLdScript data={buildBreadcrumbJsonLd([
        { name: 'Home', url: SITE_URL },
        { name: 'Blog', url: `${SITE_URL}/blog` },
        { name: BLOG_CONFIG.title, url: `${SITE_URL}/blog/${SLUG}` },
      ])} />
      {/* article content */}
    </>
  );
}
```

---

## 6. Speakable Content Classes (add to your HTML)

For the speakable spec to work, your page must have these CSS classes on content you want AI engines to cite:

```tsx
{/* TLDR section — summary that AI assistants should quote */}
<div className="speakable-tldr">
  <p className="font-bold">TLDR:</p>
  <ul>
    <li>Key takeaway 1</li>
    <li>Key takeaway 2</li>
  </ul>
</div>

{/* Key fact */}
<p className="key-fact">Alpha brain waves run at 8-12 Hz.</p>

{/* Direct answer to a likely question */}
<div className="direct-answer">
  <p><strong>What are alpha brain waves?</strong></p>
  <p>Alpha brain waves are rhythmic electrical patterns...</p>
</div>
```

---

## 7. Content Patterns That Rank in AI Answers

Beyond schema, structure your content like this:

1. **Lead with the direct answer.** First paragraph should answer the title's question in 1-2 sentences.
2. **Use question-style H2s.** "What are X?" "How does Y work?" "Why does Z matter?"
3. **Include a TLDR bullet list near the top.** Wrap in `.speakable-tldr` class.
4. **Add a real FAQ section at the bottom.** Each question becomes an `AcceptedAnswer` in the schema.
5. **Cite studies with author + year + journal.** AI engines weight content that cites primary sources.
6. **Write for humans, not keyword density.** Modern ranking models penalize keyword stuffing.
