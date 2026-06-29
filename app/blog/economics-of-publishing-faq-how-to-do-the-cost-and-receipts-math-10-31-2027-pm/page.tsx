import type { Metadata } from 'next';
import { Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BlogBackLink } from '@/components/blog/BlogBackLink';

const PAGE_DATA = {
  "slug": "economics-of-publishing-faq-how-to-do-the-cost-and-receipts-math",
  "title": "Economics of publishing FAQ: how to do the cost-and-receipts math",
  "description": "If you've ever heard \"the publisher made a killing\" and then watched the author's payout look\u2026 suspiciously small, that disconnect is the whole point of publishing economics. Readers assume list price turns into clean profit. In reality, the industry runs on discounts, unit costs, and spend\u2014and then waits to see what actually gets recouped.",
  "readTime": "5 min read",
  "publishedDate": "2027-11-01",
  "modifiedDate": "2027-11-01",
  "canonicalUrl": "https://writequeryhook.com/blog/economics-of-publishing-faq-how-to-do-the-cost-and-receipts-math",
  "siteUrl": "https://writequeryhook.com",
  "siteName": "Write Query Hook",
  "locale": "en-US",
  "articleSection": "Querying",
  "keywords": [
    "industry literacy",
    "publishing business",
    "revision",
    "querying",
    "receipts",
    "discounts",
    "net proceeds",
    "risk",
    "recoupment",
    "catalog",
    "profit",
    "overhead"
  ],
  "author": null,
  "hero": {
    "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_43/day_599/economics-of-publishing-faq-how-to-do-the-cost-and-receipts-math/blog/blog_hero_shock_confusion_blog_hero_landscape_1afc5093ec91.jpeg",
    "alt": "blog hero \u00b7 shock confusion",
    "width": 8688,
    "height": 5792,
    "creator": "Andrea Piacquadio",
    "creatorUrl": "https://www.pexels.com/@olly",
    "provider": "pexels",
    "role": "hero"
  },
  "breadcrumbs": [
    {
      "name": "Home",
      "item": "/"
    },
    {
      "name": "Blog",
      "item": "/blog"
    },
    {
      "name": "Economics of publishing FAQ: how to do the cost-and-receipts math",
      "item": "https://writequeryhook.com/blog/economics-of-publishing-faq-how-to-do-the-cost-and-receipts-math"
    }
  ],
  "tldrBlocks": [],
  "openingBlocks": [
    {
      "type": "paragraph",
      "text": "If you've ever heard \"the publisher made a killing\" and then watched the author's payout look\u2026 suspiciously small, that disconnect is the whole point of **publishing economics**. Readers assume list price turns into clean profit. In reality, the industry runs on **discounts, unit costs, and spend**\u2014and then waits to see what actually gets recouped."
    },
    {
      "type": "paragraph",
      "text": "WQH's angle here is educational and brutally practical: don't guess. Build a simple cost-and-receipts model to understand where money goes after list price and **why authors earn less than publishers**."
    },
    {
      "type": "blockquote",
      "text": "Profit is the number that survives after discounts, production costs, marketing, and overhead get subtracted from the sale."
    }
  ],
  "sections": [
    {
      "section_id": "h2_why_can_a_bestselling_book_lead_to_low_author_earnings",
      "heading": "Why can a bestselling book lead to low author earnings?",
      "heading_slug": "why-can-a-bestselling-book-lead-to-low-author-earnings",
      "keyword_key": "h2_why_can_a_bestselling_book_lead_to_low_author_earnings",
      "keywords": [
        "dread",
        "disbelief",
        "payout",
        "advance",
        "recoupment",
        "marketing",
        "overhead",
        "risk",
        "underperformance",
        "reality check"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Because the author's **author income** is only one slice of a much bigger set of numbers. Even when a book sells well, the money the publisher can treat as profit typically has to clear more than just \"sales revenue.\""
        },
        {
          "type": "paragraph",
          "text": "In most simplified models, the author's payout path starts with **book advances** and recoupment terms. Then marketing, review copies, and overhead come out of the publisher's side before the title is truly \"profitable.\" If you only imagine the blockbuster headline, you miss that the author and publisher follow different risk and cost paths."
        },
        {
          "type": "paragraph",
          "text": "Most books don't turn a profit, so even the \"winners\" often help cover catalog losses."
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_43/day_599/economics-of-publishing-faq-how-to-do-the-cost-and-receipts-math/blog/blog_section_image_dread_disbelief_blog_section_landscape_e3d4a99bf1e5.gif",
        "alt": "Why can a bestselling book lead to low author earnings?",
        "width": 356,
        "height": 200,
        "creator": "tallywally162",
        "creatorUrl": "https://giphy.com/gifs/persona-4-the-animation-52uthbYfXZuhbCqmFT",
        "provider": "giphy",
        "role": "section"
      }
    },
    {
      "section_id": "h2_how_does_list_price_turn_into_what_a_publisher_actually_receives",
      "heading": "How does list price turn into what a publisher actually receives?",
      "heading_slug": "how-does-list-price-turn-into-what-a-publisher-actually-receives",
      "keyword_key": "h2_how_does_list_price_turn_into_what_a_publisher_actually_receives",
      "keywords": [
        "pricing",
        "math",
        "confusion",
        "discounts",
        "net copies",
        "list price",
        "margin",
        "clarity",
        "spreadsheet",
        "receipts"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "This is where people get lost, because **breakdown of book pricing and discounts** sounds boring until it explains everything. The basic napkin math goes like this: start with list price, apply a discount to estimate the publisher's **net** proceeds per copy, and only then think about costs."
        },
        {
          "type": "paragraph",
          "text": "A rough mental model:"
        },
        {
          "type": "list",
          "items": [
            "**List price** is the sticker.",
            "**Discounts** reflect what retailers and distributors take off.",
            "The publisher's share is what's left on the \"receipts\" side."
          ]
        },
        {
          "type": "paragraph",
          "text": "If the publisher's net per copy shrinks a lot from discounts, the remaining margin can look thin fast\u2014especially once production and distribution unit costs are counted. That's why **publishing economics** is less about \"how high sales are\" and more about \"what the publisher actually receives per copy after discounts.\""
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_43/day_599/economics-of-publishing-faq-how-to-do-the-cost-and-receipts-math/blog/blog_section_image_pricing_math_blog_section_landscape_f50beb0e9340.jpg",
        "alt": "How does list price turn into what a publisher actually receives?",
        "width": 4928,
        "height": 3264,
        "creator": "Breakingpic",
        "creatorUrl": "https://www.pexels.com/@breakingpic",
        "provider": "pexels",
        "role": "section"
      }
    },
    {
      "section_id": "h2_what_costs_are_deducted_before_a_publisher_can_profit",
      "heading": "What costs are deducted before a publisher can profit?",
      "heading_slug": "what-costs-are-deducted-before-a-publisher-can-profit",
      "keyword_key": "h2_what_costs_are_deducted_before_a_publisher_can_profit",
      "keywords": [
        "expense",
        "irritation",
        "ads",
        "review copies",
        "overhead",
        "cover costs",
        "distribution",
        "admin",
        "loss",
        "budget"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Before any real **publisher profit**, you have to subtract costs that aren't visible in customer-facing pricing. Past printing and distribution, the big categories usually include:"
        },
        {
          "type": "list",
          "items": [
            "**marketing costs**: ads, promotions, and the work required to generate demand",
            "review and promotional materials",
            "cover and catalog production",
            "business overhead: salaries, rent, systems"
          ]
        },
        {
          "type": "paragraph",
          "text": "Publishing isn't just \"sell books, collect money.\" It's \"spend money to get the right sales, then hope the remaining receipts cover what you already paid.\" If you don't account for spend, you'll overestimate profits and underestimate **author income**."
        }
      ],
      "image": null
    },
    {
      "section_id": "h2_does_the_publisher_take_on_more_financial_risk_than_the_author",
      "heading": "Does the publisher take on more financial risk than the author?",
      "heading_slug": "does-the-publisher-take-on-more-financial-risk-than-the-author",
      "keyword_key": "h2_does_the_publisher_take_on_more_financial_risk_than_the_author",
      "keywords": [
        "fairness",
        "tension",
        "risk",
        "advance",
        "unsold inventory",
        "funding",
        "repayment logic",
        "ownership",
        "uncertainty",
        "career impact"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Yes. The publisher funds early costs (including **book advances**) and carries the risk if sales don't recoup those payments. When performance is weak, the publisher's financial downside is typically more direct."
        },
        {
          "type": "paragraph",
          "text": "The author can still get career impact from underperformance, but the mechanics in a simplified deal model treat repayment risk differently. The publisher is the one funding production and marketing before it's sure the title will work. That's **advance recoupment and publishing risk** in plain language: money gets put in early, then the receipts have to clear the bill."
        }
      ],
      "image": null
    },
    {
      "section_id": "h2_are_publishers_raking_it_in_across_the_board",
      "heading": "Are publishers \"raking it in\" across the board?",
      "heading_slug": "are-publishers-raking-it-in-across-the-board",
      "keyword_key": "h2_are_publishers_raking_it_in_across_the_board",
      "keywords": [
        "hope",
        "skepticism",
        "catalog math",
        "winners cover losses",
        "non-profitable books",
        "profit timing",
        "reinvestment",
        "publishing business",
        "stability",
        "vindication"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "No. Titles don't all behave the same way, and the catalog matters. Winners often help cover losses from books that never recoup. That means **how publishers make money on books** depends on the cost structure and spend across many releases, not just one breakout."
        },
        {
          "type": "paragraph",
          "text": "When a title becomes profitable, the publisher may earn more than the author on that specific win. But that doesn't imply every book prints easy margin. In practice, profitable titles can be helping cover failures\u2014so the average looks less glamorous than the headlines."
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_43/day_599/economics-of-publishing-faq-how-to-do-the-cost-and-receipts-math/blog/blog_section_image_hope_skepticism_blog_section_landscape_82dbf3a7ddcc.gif",
        "alt": "Are publishers \"raking it in\" across the board?",
        "width": 200,
        "height": 200,
        "creator": "dazn",
        "creatorUrl": "https://giphy.com/gifs/dazn-football-chelsea-thomas-tuchel-TzxFpZa9ZxlusFPCoH",
        "provider": "giphy",
        "role": "section"
      }
    }
  ],
  "closingImage": {
    "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_43/day_599/economics-of-publishing-faq-how-to-do-the-cost-and-receipts-math/blog/blog_section_image_resolve_action_blog_section_landscape_b5568d139bc0.jpeg",
    "alt": "blog section image \u00b7 resolve action",
    "width": 6000,
    "height": 4000,
    "creator": "Fuka jaz",
    "creatorUrl": "https://www.pexels.com/@fukajaz",
    "provider": "pexels",
    "role": "section"
  },
  "alsoLike": [
    {
      "title": "Unagented submission examples: three real-world submission paths (and what each one costs you)",
      "url": "https://writequeryhook.com/blog/unagented-submission-examples-three-real-world-submission-paths-and-what-each"
    },
    {
      "title": "Novel series examples: how book one earns its landing and book two earns its shadow",
      "url": "https://writequeryhook.com/blog/novel-series-examples-how-book-one-earns-its-landing-and-book-two-earns-its"
    },
    {
      "title": "What the publishing \u201cglamour\u201d hides: how printing, distribution, and wholesale actually get you into stores",
      "url": "https://writequeryhook.com/blog/what-the-publishing-glamour-hides-how-printing-distribution-and-wholesale"
    },
    {
      "title": "Novel series mistakes to avoid: the contrarian way to land book one (and still promise book two)",
      "url": "https://writequeryhook.com/blog/novel-series-mistakes-to-avoid-the-contrarian-way-to-land-book-one-and-still"
    }
  ],
  "alsoLikeAfterIndex": 2,
  "faq": [],
  "closingBlocks": [
    {
      "type": "paragraph",
      "text": "If you want fewer surprises in **publishing economics**, steal the educational approach: estimate net proceeds per sold copy after **breakdown of book pricing and discounts**, subtract unit production and distribution costs, then account for **marketing costs** before you even talk about **publisher profit**."
    },
    {
      "type": "paragraph",
      "text": "When you review any publishing claim\u2014advance, expected earnings, \"how this bestseller works\"\u2014ask for the cost-and-receipts math. That's the only version that holds up."
    }
  ],
  "relatedLinks": []
} as const;
const SCHEMA_GRAPH = {
  "@graph": [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": "https://writequeryhook.com/#organization",
      "name": "Write Query Hook",
      "url": "https://writequeryhook.com",
      "logo": "https://writequeryhook.com/logo.png",
      "description": "WQH helps writers build query packages and navigate the submission process.",
      "sameAs": []
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": "https://writequeryhook.com/#website",
      "url": "https://writequeryhook.com",
      "name": "Write Query Hook",
      "publisher": {
        "@id": "https://writequeryhook.com/#organization"
      },
      "inLanguage": "en-US"
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "@id": "https://writequeryhook.com/blog/economics-of-publishing-faq-how-to-do-the-cost-and-receipts-math#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://writequeryhook.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Blog",
          "item": "https://writequeryhook.com/blog"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Economics of publishing FAQ: how to do the cost-and-receipts math",
          "item": "https://writequeryhook.com/blog/economics-of-publishing-faq-how-to-do-the-cost-and-receipts-math"
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": "https://writequeryhook.com/blog/economics-of-publishing-faq-how-to-do-the-cost-and-receipts-math#webpage",
      "url": "https://writequeryhook.com/blog/economics-of-publishing-faq-how-to-do-the-cost-and-receipts-math",
      "name": "Economics of publishing FAQ: how to do the cost-and-receipts math",
      "isPartOf": {
        "@id": "https://writequeryhook.com/#website"
      },
      "inLanguage": "en-US",
      "primaryImageOfPage": {
        "@id": "https://writequeryhook.com/blog/economics-of-publishing-faq-how-to-do-the-cost-and-receipts-math#primaryimage"
      },
      "breadcrumb": {
        "@id": "https://writequeryhook.com/blog/economics-of-publishing-faq-how-to-do-the-cost-and-receipts-math#breadcrumb"
      },
      "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": [
          "h1",
          "h2",
          ".tldr-section",
          ".summary-section",
          "blockquote"
        ]
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "@id": "https://writequeryhook.com/blog/economics-of-publishing-faq-how-to-do-the-cost-and-receipts-math#article",
      "isPartOf": {
        "@id": "https://writequeryhook.com/blog/economics-of-publishing-faq-how-to-do-the-cost-and-receipts-math#webpage"
      },
      "mainEntityOfPage": "https://writequeryhook.com/blog/economics-of-publishing-faq-how-to-do-the-cost-and-receipts-math",
      "headline": "Economics of publishing FAQ: how to do the cost-and-receipts math",
      "alternativeHeadline": "Economics of publishing FAQ: how to do the cost-and-receipts math",
      "description": "If you've ever heard \"the publisher made a killing\" and then watched the author's payout look\u2026 suspiciously small, that disconnect is the whole point of publishing economics. Readers assume list price turns into clean profit. In reality, the industry runs on discounts, unit costs, and spend\u2014and then waits to see what actually gets recouped.",
      "wordCount": 1029,
      "timeRequired": "PT5M",
      "articleSection": "Querying",
      "keywords": [
        "industry literacy",
        "publishing business",
        "revision",
        "querying",
        "receipts",
        "discounts",
        "net proceeds",
        "risk",
        "recoupment",
        "catalog",
        "profit",
        "overhead"
      ],
      "inLanguage": "en-US",
      "author": {
        "@id": "https://writequeryhook.com/#organization"
      },
      "publisher": {
        "@id": "https://writequeryhook.com/#organization"
      },
      "isAccessibleForFree": true,
      "image": {
        "@id": "https://writequeryhook.com/blog/economics-of-publishing-faq-how-to-do-the-cost-and-receipts-math#primaryimage"
      },
      "datePublished": "2027-11-01",
      "dateModified": "2027-11-01",
      "mentions": [
        {
          "@type": "WebPage",
          "name": "Unagented submission examples: three real-world submission paths (and what each one costs you)",
          "url": "https://writequeryhook.com/blog/unagented-submission-examples-three-real-world-submission-paths-and-what-each"
        },
        {
          "@type": "WebPage",
          "name": "Novel series examples: how book one earns its landing and book two earns its shadow",
          "url": "https://writequeryhook.com/blog/novel-series-examples-how-book-one-earns-its-landing-and-book-two-earns-its"
        },
        {
          "@type": "WebPage",
          "name": "What the publishing \u201cglamour\u201d hides: how printing, distribution, and wholesale actually get you into stores",
          "url": "https://writequeryhook.com/blog/what-the-publishing-glamour-hides-how-printing-distribution-and-wholesale"
        },
        {
          "@type": "WebPage",
          "name": "Novel series mistakes to avoid: the contrarian way to land book one (and still promise book two)",
          "url": "https://writequeryhook.com/blog/novel-series-mistakes-to-avoid-the-contrarian-way-to-land-book-one-and-still"
        }
      ]
    },
    {
      "@type": "ImageObject",
      "@id": "https://writequeryhook.com/blog/economics-of-publishing-faq-how-to-do-the-cost-and-receipts-math#primaryimage",
      "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_43/day_599/economics-of-publishing-faq-how-to-do-the-cost-and-receipts-math/blog/blog_hero_shock_confusion_blog_hero_landscape_1afc5093ec91.jpeg",
      "width": 8688,
      "height": 5792,
      "caption": "blog hero \u00b7 shock confusion",
      "creditText": "Andrea Piacquadio",
      "author": {
        "@type": "Person",
        "name": "Andrea Piacquadio",
        "url": "https://www.pexels.com/@olly"
      },
      "@context": "https://schema.org"
    }
  ]
} as const;

export const metadata: Metadata = {
  title: PAGE_DATA.title,
  description: PAGE_DATA.description,
  keywords: PAGE_DATA.keywords as unknown as string[],
  alternates: { canonical: PAGE_DATA.canonicalUrl },
  openGraph: {
    title: PAGE_DATA.title,
    description: PAGE_DATA.description,
    url: PAGE_DATA.canonicalUrl,
    type: 'article',
    siteName: PAGE_DATA.siteName,
    locale: PAGE_DATA.locale,
    publishedTime: PAGE_DATA.publishedDate || undefined,
    modifiedTime: PAGE_DATA.modifiedDate || undefined,
    authors: PAGE_DATA.author?.name ? [PAGE_DATA.author.name] : undefined,
    section: PAGE_DATA.articleSection,
    images: PAGE_DATA.hero?.url
      ? [{ url: PAGE_DATA.hero.url, width: PAGE_DATA.hero.width, height: PAGE_DATA.hero.height, alt: PAGE_DATA.hero.alt }]
      : [],
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_DATA.title,
    description: PAGE_DATA.description,
    images: PAGE_DATA.hero?.url ? [PAGE_DATA.hero.url] : [],
  },
};

// Render inline markdown ([links](/url), **bold**, *italic*) to real React nodes.
function renderInline(text: string, keyPrefix: string): any[] {
  const nodes: any[] = [];
  const pattern = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|(?<!\*)\*(?!\*)([^*]+)\*(?!\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const key = `${keyPrefix}-i${i++}`;
    if (match[1] !== undefined) {
      const label = match[1];
      const href = match[2];
      if (href.startsWith('/')) {
        nodes.push(
          <Link key={key} href={href} className="font-medium text-accent underline underline-offset-2 hover:opacity-80">
            {label}
          </Link>,
        );
      } else {
        nodes.push(
          <a key={key} href={href} target="_blank" rel="noopener noreferrer"
             className="font-medium text-accent underline underline-offset-2 hover:opacity-80">
            {label}
          </a>,
        );
      }
    } else if (match[3] !== undefined) {
      nodes.push(<strong key={key} className="font-semibold">{match[3]}</strong>);
    } else if (match[4] !== undefined) {
      nodes.push(<em key={key}>{match[4]}</em>);
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

function renderBlock(block: any, key: string) {
  if (block.type === 'paragraph') {
    return <p key={key} className="mb-4 leading-7 text-accent/90">{renderInline(block.text, key)}</p>;
  }
  if (block.type === 'list') {
    return (
      <ul key={key} className="mb-4 list-disc pl-6 text-accent/90">
        {block.items.map((item: string, index: number) => (
          <li key={`${key}-${index}`} className="mb-2">{renderInline(item, `${key}-${index}`)}</li>
        ))}
      </ul>
    );
  }
  if (block.type === 'blockquote') {
    return (
      <blockquote key={key} className="mb-4 border-l-4 border-accent pl-4 italic text-accent/90">
        {renderInline(block.text, key)}
      </blockquote>
    );
  }
  if (block.type === 'subheading') {
    return <h3 key={key} className="mb-3 mt-6 text-xl font-semibold text-accent">{renderInline(block.text, key)}</h3>;
  }
  return null;
}

// Article column is max-w-3xl (~768px); images render full-width within it.
const FIGURE_SIZES = '(max-width: 768px) 100vw, 768px';

function Figure({ image }: { image: any }) {
  if (!image?.url) return null;
  const isHero = image.role === 'hero';
  // Render the STRAIGHT ImageKit URL via a plain <img> for every image (photos
  // and gifs). No next/image proxy/optimization: the raw candidate asset is
  // served as-is, and animated gifs keep animating.
  return (
    <figure className="mb-6">
      {(
        <img
          src={image.url}
          alt={image.alt || ''}
          loading={isHero ? 'eager' : 'lazy'}
          decoding="async"
          className="w-full rounded-xl object-cover"
        />
      )}
      {image.creator ? (
        <figcaption className="mt-2 text-xs text-accent/70">
          Photo:{' '}
          {image.creatorUrl ? (
            <a href={image.creatorUrl} target="_blank" rel="noopener noreferrer" className="underline">{image.creator}</a>
          ) : (
            image.creator
          )}
          {image.provider ? ` / ${image.provider}` : ''}
        </figcaption>
      ) : null}
    </figure>
  );
}

export default function Page() {
  return (
    <main className="ambient-page px-4 pb-16 pt-8 md:px-6">
      <div className="ambient-orb-top" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA_GRAPH) }} />
      <BlogBackLink />
      <article className="glass-panel-strong mx-auto max-w-3xl p-6 md:p-8">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-accent/60">
          <ol className="flex flex-wrap gap-1">
            {PAGE_DATA.breadcrumbs.map((crumb: any, index: number) => (
              <li key={`crumb-${index}`} className="flex gap-1">
                {index > 0 ? <span aria-hidden="true">/</span> : null}
                {index < PAGE_DATA.breadcrumbs.length - 1 ? (
                  <Link href={crumb.item} className="underline hover:opacity-80">{crumb.name}</Link>
                ) : (
                  <span aria-current="page">{crumb.name}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <header className="mb-8">
          <h1 className="mb-4 text-4xl font-semibold text-accent">{PAGE_DATA.title}</h1>
          <div className="flex flex-wrap gap-3 text-sm text-accent/60">
            {PAGE_DATA.publishedDate ? (
              <time dateTime={PAGE_DATA.publishedDate}>
                {new Date(PAGE_DATA.publishedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </time>
            ) : null}
            {PAGE_DATA.publishedDate ? <span>&bull;</span> : null}
            <span>{PAGE_DATA.readTime}</span>
            {PAGE_DATA.author?.name ? <span>&bull;</span> : null}
            {PAGE_DATA.author?.name ? <span>By {PAGE_DATA.author.name}</span> : null}
          </div>
        </header>

        {PAGE_DATA.tldrBlocks.length > 0 ? (
          <section className="tldr-section mb-10 rounded-xl border border-accent/15 bg-accent/5 p-5">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-[0.15em] text-accent">TL;DR</h2>
            {PAGE_DATA.tldrBlocks.map((block: any, index: number) => renderBlock(block, `tldr-${index}`))}
          </section>
        ) : null}

        {PAGE_DATA.sections.length > 1 ? (
          <nav aria-label="Table of contents" className="mb-10 rounded-xl bg-accent/5 p-5">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-[0.15em] text-accent">On this page</h2>
            <ul className="list-disc pl-5 text-accent">
              {PAGE_DATA.sections.map((section: any) => (
                <li key={`toc-${section.heading_slug}`} className="mb-1">
                  <a href={`#${section.heading_slug}`} className="underline underline-offset-2 hover:opacity-80">{section.heading}</a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        <section className="mb-10">
          <Figure image={PAGE_DATA.hero} />
          {PAGE_DATA.openingBlocks.map((block: any, index: number) => renderBlock(block, `opening-${index}`))}
        </section>

        {PAGE_DATA.sections.map((section: any, sIdx: number) => (
          <Fragment key={section.section_id}>
            <section className="mb-10">
              <h2 id={section.heading_slug} className="mb-4 scroll-mt-24 text-2xl font-semibold text-accent">{section.heading}</h2>
              <Figure image={section.image} />
              {section.blocks.map((block: any, index: number) => renderBlock(block, `${section.section_id}-${index}`))}
            </section>
            {PAGE_DATA.alsoLike.length > 0 && sIdx === PAGE_DATA.alsoLikeAfterIndex ? (
              <aside className="mb-10 rounded-xl border border-accent/15 bg-accent/5 p-5">
                <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.15em] text-accent">You may also like</h2>
                <ul className="list-disc pl-6 text-accent">
                  {PAGE_DATA.alsoLike.map((link: any, index: number) => (
                    <li key={`alsolike-${index}`} className="mb-2">
                      <Link href={link.url.replace(PAGE_DATA.siteUrl, '')} className="underline underline-offset-2 hover:opacity-80">
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </aside>
            ) : null}
          </Fragment>
        ))}

        {PAGE_DATA.faq.length > 0 ? (
          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold text-accent">Frequently asked questions</h2>
            {PAGE_DATA.faq.map((item: any, index: number) => (
              <div key={`faq-${index}`} className="mb-5">
                <h3 className="mb-2 text-lg font-semibold text-accent">{item.question}</h3>
                <p className="leading-7 text-accent/90">{renderInline(item.answer, `faq-a-${index}`)}</p>
              </div>
            ))}
          </section>
        ) : null}

        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-semibold text-accent">The bottom line</h2>
          <Figure image={PAGE_DATA.closingImage} />
          {PAGE_DATA.closingBlocks.map((block: any, index: number) => renderBlock(block, `closing-${index}`))}
        </section>

        {PAGE_DATA.relatedLinks.length > 0 ? (
          <section className="border-t border-accent/15 pt-6">
            <h2 className="mb-4 text-2xl font-semibold text-accent">Continue reading</h2>
            <ul className="list-disc pl-6 text-accent">
              {PAGE_DATA.relatedLinks.map((link: any, index: number) => (
                <li key={`related-${index}`} className="mb-2">
                  <Link href={link.url.replace(PAGE_DATA.siteUrl, '')} className="underline underline-offset-2 hover:opacity-80">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </article>
    </main>
  );
}
