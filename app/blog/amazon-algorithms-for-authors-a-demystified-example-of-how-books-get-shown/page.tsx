import type { Metadata } from 'next';
import { Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const PAGE_DATA = {
  "slug": "amazon-algorithms-for-authors-a-demystified-example-of-how-books-get-shown",
  "title": "Amazon algorithms for authors: a demystified example of how books get shown",
  "description": "Most writers hear \"Amazon algorithms\" and picture one giant brain deciding their fate. Then they do the common thing: panic-refresh rankings, change keywords ten times, and assume the system is either broken or magic.",
  "readTime": "9 min read",
  "publishedDate": "2027-09-14",
  "modifiedDate": "2027-09-14",
  "canonicalUrl": "https://writequeryhook.com/blog/amazon-algorithms-for-authors-a-demystified-example-of-how-books-get-shown",
  "siteUrl": "https://writequeryhook.com",
  "siteName": "Write Query Hook",
  "locale": "en-US",
  "articleSection": "Querying",
  "keywords": [
    "industry literacy",
    "querying",
    "craft",
    "marketing",
    "signals",
    "visibility",
    "metrics",
    "metadata",
    "steady sales",
    "conversion",
    "also-bought",
    "control-levers"
  ],
  "author": null,
  "hero": {
    "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_39/day_541/amazon-algorithms-for-authors-a-demystified-example-of-how-books-get-shown/blog/blog_hero_overwhelmed_blank_page_blog_hero_landscape_1ff132a40c5c.jpeg?updatedAt=1782332350554",
    "alt": "blog hero \u00b7 overwhelmed blank-page",
    "width": 5763,
    "height": 3842,
    "creator": "Cup of  Couple",
    "creatorUrl": "https://www.pexels.com/@cup-of-couple",
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
      "name": "Amazon algorithms for authors: a demystified example of how books get shown",
      "item": "https://writequeryhook.com/blog/amazon-algorithms-for-authors-a-demystified-example-of-how-books-get-shown"
    }
  ],
  "tldrBlocks": [],
  "openingBlocks": [
    {
      "type": "paragraph",
      "text": "Most writers hear \"Amazon algorithms\" and picture one giant brain deciding their fate. Then they do the common thing: panic-refresh rankings, change keywords ten times, and assume the system is either broken or magic."
    },
    {
      "type": "paragraph",
      "text": "Let me kill the magic for you."
    },
    {
      "type": "paragraph",
      "text": "This case-study maps what the Amazon system actually does\u2014the **algorithms** (plural), sales behavior, sales conversion vs page visits, **keywords**, **categories**, **metadata**, and those slippery \"also bought\" connections that can make recommendations feel haunted. You'll see which levers move which parts of visibility."
    },
    {
      "type": "paragraph",
      "text": "If you've ever wondered why one promotional push seems to help in one place and then vanish elsewhere, this is the mechanism behind that kind of mess. Also: no hagiography, no vibes. Just a controlled juggling act\u2014where you focus on the levers you can move without wrecking the signals you need."
    }
  ],
  "sections": [
    {
      "section_id": "h2_tldr",
      "heading": "TLDR",
      "heading_slug": "tldr",
      "keyword_key": "h2_tldr",
      "keywords": [],
      "blocks": [
        {
          "type": "list",
          "items": [
            "Amazon uses multiple interconnected **algorithms**, not a single \"all-powerful\" switch.",
            "The system first predicts whether a book is likely to sell, then decides **who** it should be shown to.",
            "Sales conversion vs page visits matters: the traffic source is only half the story.",
            "Your **keywords**, **categories**, and **metadata** help the system understand what your book is and where it fits.",
            "**How \"also boughts\" affect recommendations** is real: genre-adjacent promotions can protect (or muddle) those relationships."
          ]
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_39/day_541/amazon-algorithms-for-authors-a-demystified-example-of-how-books-get-shown/blog/blog_section_image_tldr_blog_section_landscape_3a027a03af24.gif?updatedAt=1782332351266",
        "alt": "TLDR",
        "width": 279,
        "height": 200,
        "creator": "Giphy",
        "creatorUrl": "https://giphy.com/gifs/fight-club-edward-norton-writing-Y5ytdl4PXziZW",
        "provider": "giphy",
        "role": "section"
      }
    },
    {
      "section_id": "h2_deconstructing_the_visibility_problem",
      "heading": "How Amazon turns \"interest\" into visibility: the multi-algorithm visibility problem",
      "heading_slug": "how-amazon-turns-interest-into-visibility-the-multi-algorithm-visibility-problem",
      "keyword_key": "h2_deconstructing_the_visibility_problem",
      "keywords": [
        "reality-check",
        "attention",
        "search-results",
        "bestseller-lists",
        "recommendation-emails",
        "ranking",
        "confusion",
        "receipts",
        "showing-up"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "When people say \"Amazon algorithms,\" they usually mean one thing: ranking. But Amazon runs separate processes that touch different visibility areas\u2014search results, bestseller lists, hot/new lists, and recommendation emails. Each area needs different data, and each data source is its own mini scoreboard."
        },
        {
          "type": "paragraph",
          "text": "Your book exists in four visibility neighborhoods:"
        },
        {
          "type": "paragraph",
          "text": "1. **Search results** are a matching problem (**keywords**, **metadata**, category signals). 2. **Bestseller / rank lists** are a momentum + sales-pattern problem. 3. **Recommendation emails** are a \"customers like you bought this\" problem (including \"also bought\" relationships). 4. **Highly rated lists** are review and satisfaction signals layered with sales and freshness."
        },
        {
          "type": "paragraph",
          "text": "You can mess up one neighborhood and still look fine in another. That's why authors feel like they're doing everything \"right\" while the ranking plot still won't behave. Writer brain wants one knob. **Amazon** uses several."
        },
        {
          "type": "paragraph",
          "text": "Stop chasing one number. Build your mental model around *which visibility area you're trying to win* and which signals that area actually cares about."
        },
        {
          "type": "paragraph",
          "text": "Also, notice the terminology: **Amazon** + **algorithms** + **metadata** + **keywords**. These are category names for different matching jobs\u2014the system uses them to sort which books go where."
        },
        {
          "type": "paragraph",
          "text": "Amazon doesn't run one algorithm\u2014it runs several, each judging different signals. Treat it like separate judges, not one jury."
        },
        {
          "type": "paragraph",
          "text": "If you've been treating **metadata** as the only lever, this is where you fix that instinct. Your **keywords** and **categories** might be strong for search, but your sales pattern might not support bestseller momentum. Or your traffic might convert poorly, which hurts rankings even if the initial show was accurate."
        },
        {
          "type": "paragraph",
          "text": "**This matters:** **How Amazon algorithms choose books to show** isn't about deciding your worth. It's about deciding *where to place your book in the attention economy* given what it predicts about sales and customer fit."
        }
      ],
      "image": null
    },
    {
      "section_id": "h2_the_two_step_sales_machine_likely_to_sell_then_who_to_show",
      "heading": "The two-step sales machine: likely to sell first, then who to show",
      "heading_slug": "the-two-step-sales-machine-likely-to-sell-first-then-who-to-show",
      "keyword_key": "h2_the_two_step_sales_machine_likely_to_sell_then_who_to_show",
      "keywords": [
        "maximizing-sales",
        "sales-history",
        "steady-patterns",
        "spikes",
        "anomaly",
        "second-order-effects",
        "pressure",
        "relief",
        "decision"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Now let's zoom into what Amazon does for sales performance. The key idea is that **algorithms** aim to maximize sales, but they do it in two passes:"
        },
        {
          "type": "paragraph",
          "text": "1. **Whether your book is likely to sell** 2. **Who should see it**"
        },
        {
          "type": "paragraph",
          "text": "That means a promotion isn't just \"more visibility.\" It becomes training data for the system about whether your book behaves like something certain readers buy."
        },
        {
          "type": "paragraph",
          "text": "And here's the part authors underestimate: steady historical sales signals beat short spikes that vanish after the promo stops. If you get a burst and then drop back immediately, the **algorithms** may treat the spike as an anomaly rather than a durable signal."
        },
        {
          "type": "paragraph",
          "text": "Think of it like testing a new product in a store. If people buy it consistently when it's placed in front of them, the store manager keeps it in circulation. If it sells once because of a one-off external push, the manager won't assume it's broadly wanted."
        },
        {
          "type": "paragraph",
          "text": "This is exactly why pacing promotions can matter: you're not just trying to \"go viral.\" You're trying to produce evidence that the book is a dependable seller for the kinds of customers you're targeting."
        },
        {
          "type": "paragraph",
          "text": "Plan promotions to produce repeatable sales behavior, not just a fireworks show. If the strategy can't generate a steadier pattern, expect volatility in rank behavior."
        },
        {
          "type": "paragraph",
          "text": "Also: writers often interpret ranking dips as punishment for \"not doing enough.\" Sometimes the system is doing the opposite\u2014it's refusing to generalize from your spike. That refusal can look like \"the algo is ignoring me,\" when it's actually doing prediction math based on what it has."
        },
        {
          "type": "paragraph",
          "text": "Credibility beats spectacle. Stop trying to brute-force the **algorithms** with raw tempo. Tempo without durability teaches the system the wrong story about your book."
        }
      ],
      "image": null
    },
    {
      "section_id": "h2_sales_conversion_vs_page_visits_the_rank_that_changes_after_click",
      "heading": "Sales conversion vs page visits: why the same sales can rank differently",
      "heading_slug": "sales-conversion-vs-page-visits-why-the-same-sales-can-rank-differently",
      "keyword_key": "h2_sales_conversion_vs_page_visits_the_rank_that_changes_after_click",
      "keywords": [
        "click",
        "conversion",
        "page-visits",
        "disappointment",
        "churn",
        "proof",
        "metrics-shock",
        "turning-point",
        "better-landing",
        "traction"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Here's the part that makes authors angry the first time they understand it: ranking can depend not just on sales volume, but on sales conversion efficiency\u2014how effectively your book turns views into purchases."
        },
        {
          "type": "paragraph",
          "text": "In other words, **Amazon** compares sales to page visits. If two books sell the same number of units, the one that converts better from the traffic it receives is usually a stronger bet."
        },
        {
          "type": "paragraph",
          "text": "This makes your book's placement signal-specific. A book can get traffic from the right crowd or from the wrong crowd. Both crowds can click. Only one crowd buys."
        },
        {
          "type": "paragraph",
          "text": "Let's make the example concrete."
        },
        {
          "type": "list",
          "items": [
            "Book A gets 10,000 page visits/day and sells 200 copies/day (2% conversion).",
            "Book B gets 10,000 page visits/day and sells 200 copies/day (same units).",
            "But suppose Book B's 10,000 visits are thinner quality: maybe it's being shown because it matches **keywords** and category patterns, but the cover/blurb promise doesn't deliver on that promise.",
            "If conversion lags in the live system because readers aren't following through on the match **Amazon** made, the prediction tightens against Book B in future showings."
          ]
        },
        {
          "type": "paragraph",
          "text": "Even without inventing exact percentages for your situation, the principle is the lesson:"
        },
        {
          "type": "paragraph",
          "text": "If you're chasing rank, you also need the page-level \"conversion story,\" not only the sales quantity story."
        },
        {
          "type": "paragraph",
          "text": "Now, you might immediately think: \"Isn't that marketing on the product page?\" Yes. But in this case-study framing, it's also part of **algorithms** literacy. Your conversion impacts the next cycle of show/no-show decisions."
        },
        {
          "type": "paragraph",
          "text": "Your **keywords** might pull the right people\u2014or people who only partially match. Conversion tells the system which group you really deserve to keep. Improving visibility without protecting conversion can create one of those messy patterns authors describe as \"my promo helped, then it didn't stick.\""
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_39/day_541/amazon-algorithms-for-authors-a-demystified-example-of-how-books-get-shown/blog/blog_section_image_click_conversion_blog_section_landscape_b0031465bb0e.jpeg?updatedAt=1782332351720",
        "alt": "Sales conversion vs page visits: why the same sales can rank differently",
        "width": 4288,
        "height": 2848,
        "creator": "Roberto Cosentino",
        "creatorUrl": "https://www.pexels.com/@rcfoto",
        "provider": "pexels",
        "role": "section"
      }
    },
    {
      "section_id": "h2_market_fit_metadata_keywords_categories_and_also_buys",
      "heading": "Market fit signals: keywords, categories, and metadata",
      "heading_slug": "market-fit-signals-keywords-categories-and-metadata",
      "keyword_key": "h2_market_fit_metadata_keywords_categories_and_also_buys",
      "keywords": [
        "genre",
        "matching",
        "also-bought",
        "muddied-signals",
        "metadata",
        "categories",
        "indexing",
        "this belongs here",
        "alignment",
        "anxiety-release"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Now we get to the \"what is this book?\" layer. If sales prediction is the \"should it sell\" part, market fit is the \"who is it for\" part. And that's where **keywords**, **categories**, and **metadata** do a lot of work."
        },
        {
          "type": "paragraph",
          "text": "**How to pick keywords and categories for Kindle** starts with understanding that **metadata** serves the **algorithms** as much as human readers do. **Amazon** uses on-page metadata and category signals to understand what the book is, what shelf it belongs on, and what customers it should be shown to next."
        },
        {
          "type": "paragraph",
          "text": "This is where the **algorithms** stop being abstract and become practical."
        },
        {
          "type": "paragraph",
          "text": "1. **keywords** and **categories** help the system match your book to reader intent and genre neighborhood. 2. **metadata** acts like clarifying context\u2014again, not just for humans. 3. **\"Also bought\" relationships** help the system map where your book fits in the market by observing purchasing adjacency."
        },
        {
          "type": "paragraph",
          "text": "And here's the warning authors need to hear without soft language: those \"also bought\" connections can get muddied if your promotional reach pulls in mismatched audiences."
        },
        {
          "type": "paragraph",
          "text": "Meaning: you might sell during a push, but if the buyers are consistently \"off-genre\" relative to your core positioning, your recommendations can get contaminated."
        },
        {
          "type": "paragraph",
          "text": "Keep your targeting genre-aligned so **how \"also boughts\" affect recommendations** goes in the direction you want. Protect the relationships built from what customers purchase together."
        },
        {
          "type": "paragraph",
          "text": "Now, does this mean you can control everything? No. But you can control a chunk of it by being deliberate about which comparisons and audience pockets you reinforce."
        },
        {
          "type": "paragraph",
          "text": "Train the system to place your book correctly, and protect that placement with coherent audience pulls. These adjacency patterns shape **what data drives bestseller and search rankings**, so they're not marginal\u2014they matter."
        },
        {
          "type": "paragraph",
          "text": "If you've been treating **keyword** research like a purely \"search traffic\" exercise, this is your fix: your **keywords** and **categories** are also part of **what data drives bestseller and search rankings** and recommendation pathways."
        }
      ],
      "image": null
    },
    {
      "section_id": "h2_lessons_takeaways",
      "heading": "Lessons / Takeaways",
      "heading_slug": "lessons-takeaways",
      "keyword_key": "h2_lessons_takeaways",
      "keywords": [],
      "blocks": [
        {
          "type": "list",
          "items": [
            "**Think in systems, not one algorithm.** If you chase rank without knowing which visibility area you're in, you'll chase ghosts. This is why \"Amazon **algorithms**\" is plural in practice, not one mythical toggle.",
            "**Build patterns that last.** **Algorithms** prefer steady historical sales signals over short spikes that vanish after the promo stops. A spike that fades teaches the system nothing durable about your book.",
            "**Track conversion quality, not only sales volume.** Sales conversion efficiency is why two books can sell similarly and still rank differently depending on traffic-to-purchase efficiency.",
            "**Market fit is metadata math.** **keywords**, **categories**, and **metadata** help **how Amazon algorithms choose books to show**\u2014and \"also bought\" relationships can help or hurt your recommendation placement based on adjacency behavior.",
            "**Protect \"also bought\" genre coherence.** Promotions that pull in the wrong audience can train the wrong associations, and then your recommendations get weird."
          ]
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_39/day_541/amazon-algorithms-for-authors-a-demystified-example-of-how-books-get-shown/blog/blog_section_image_lessons_takeaways_blog_section_landscape_39f5adb2845e.gif?updatedAt=1782332352584",
        "alt": "Lessons / Takeaways",
        "width": 296,
        "height": 200,
        "creator": "TreehouseDirect",
        "creatorUrl": "https://giphy.com/gifs/TreehouseDirect-cartoons-turtle-franklin-zOBM2EO8rEyj1Hfe3V",
        "provider": "giphy",
        "role": "section"
      }
    }
  ],
  "closingImage": null,
  "alsoLike": [
    {
      "title": "Copyright a book: 7 registration mistakes that waste money (and leave you weaker than you think)",
      "url": "https://writequeryhook.com/blog/copyright-a-book-7-registration-mistakes-that-waste-money-and-leave-you-weaker"
    },
    {
      "title": "The cheapest publishing plan is a lie: 7 cost mistakes that blow up self-publish budgets in 2025",
      "url": "https://writequeryhook.com/blog/the-cheapest-publishing-plan-is-a-lie-7-cost-mistakes-that-blow-up-self"
    },
    {
      "title": "Amazon algorithms: 7 common mistakes authors make when they treat \"the algorithm\" like one thing",
      "url": "https://writequeryhook.com/blog/amazon-algorithms-7-common-mistakes-authors-make-when-they-treat-the-algorithm"
    },
    {
      "title": "How to build a marketing plan that actually targets readers (not vibes)",
      "url": "https://writequeryhook.com/blog/how-to-build-a-marketing-plan-that-actually-targets-readers-not-vibes"
    }
  ],
  "alsoLikeAfterIndex": 2,
  "faq": [
    {
      "question": "Are there multiple Amazon algorithms or just one?",
      "answer": "There isn't a single algorithm. Different algorithms work together to index and rank products across separate visibility areas\u2014search results, bestseller and popularity lists, and recommendation emails included."
    },
    {
      "question": "What do Amazon algorithms want most?",
      "answer": "They're described as maximizing sales by showing customers the books they're most likely to buy."
    },
    {
      "question": "How do sales spikes affect ranking?",
      "answer": "The algorithms prefer steady patterns over inconsistent spikes. A dramatic jump that fades quickly can look like an anomaly rather than durable demand."
    },
    {
      "question": "What is sales conversion, and why does it matter?",
      "answer": "Sales conversion is sales relative to page visits. Two books can show similar sales volume, but the one that converts better from the traffic it receives can rank more strongly because it's a better bet for future shows."
    },
    {
      "question": "How do \"also bought\" connections influence recommendations?",
      "answer": "\"Also bought\" relationships come from customers who purchase books together. Those connections help determine what the system recommends to similar readers, and it's wise to keep those relationships aligned with genre so recommendations don't get muddied."
    }
  ],
  "closingBlocks": [
    {
      "type": "paragraph",
      "text": "If you stop treating **Amazon** like one black box and start treating it like a set of visibility judges, the whole process gets less mystical and a lot more controllable. Now look at your own book: where are you strong\u2014**keywords**, **categories**, **metadata**, sales conversion, steady sales patterns, or those \"also bought\" relationships\u2014and what's the next lever you'll touch?"
    }
  ],
  "relatedLinks": [
    {
      "title": "Copyright a book: 7 registration mistakes that waste money (and leave you weaker than you think)",
      "url": "https://writequeryhook.com/blog/copyright-a-book-7-registration-mistakes-that-waste-money-and-leave-you-weaker"
    }
  ]
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
      "@id": "https://writequeryhook.com/blog/amazon-algorithms-for-authors-a-demystified-example-of-how-books-get-shown#breadcrumb",
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
          "name": "Amazon algorithms for authors: a demystified example of how books get shown",
          "item": "https://writequeryhook.com/blog/amazon-algorithms-for-authors-a-demystified-example-of-how-books-get-shown"
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": "https://writequeryhook.com/blog/amazon-algorithms-for-authors-a-demystified-example-of-how-books-get-shown#webpage",
      "url": "https://writequeryhook.com/blog/amazon-algorithms-for-authors-a-demystified-example-of-how-books-get-shown",
      "name": "Amazon algorithms for authors: a demystified example of how books get shown",
      "isPartOf": {
        "@id": "https://writequeryhook.com/#website"
      },
      "inLanguage": "en-US",
      "primaryImageOfPage": {
        "@id": "https://writequeryhook.com/blog/amazon-algorithms-for-authors-a-demystified-example-of-how-books-get-shown#primaryimage"
      },
      "breadcrumb": {
        "@id": "https://writequeryhook.com/blog/amazon-algorithms-for-authors-a-demystified-example-of-how-books-get-shown#breadcrumb"
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
      "@id": "https://writequeryhook.com/blog/amazon-algorithms-for-authors-a-demystified-example-of-how-books-get-shown#article",
      "isPartOf": {
        "@id": "https://writequeryhook.com/blog/amazon-algorithms-for-authors-a-demystified-example-of-how-books-get-shown#webpage"
      },
      "mainEntityOfPage": "https://writequeryhook.com/blog/amazon-algorithms-for-authors-a-demystified-example-of-how-books-get-shown",
      "headline": "Amazon algorithms for authors: a demystified example of how books get shown",
      "alternativeHeadline": "Amazon algorithms for authors: a demystified example of how books get shown",
      "description": "Most writers hear \"Amazon algorithms\" and picture one giant brain deciding their fate. Then they do the common thing: panic-refresh rankings, change keywords ten times, and assume the system is either broken or magic.",
      "wordCount": 1839,
      "timeRequired": "PT9M",
      "articleSection": "Querying",
      "keywords": [
        "industry literacy",
        "querying",
        "craft",
        "marketing",
        "signals",
        "visibility",
        "metrics",
        "metadata",
        "steady sales",
        "conversion",
        "also-bought",
        "control-levers"
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
        "@id": "https://writequeryhook.com/blog/amazon-algorithms-for-authors-a-demystified-example-of-how-books-get-shown#primaryimage"
      },
      "datePublished": "2027-09-14",
      "dateModified": "2027-09-14",
      "mentions": [
        {
          "@type": "WebPage",
          "name": "Copyright a book: 7 registration mistakes that waste money (and leave you weaker than you think)",
          "url": "https://writequeryhook.com/blog/copyright-a-book-7-registration-mistakes-that-waste-money-and-leave-you-weaker"
        },
        {
          "@type": "WebPage",
          "name": "The cheapest publishing plan is a lie: 7 cost mistakes that blow up self-publish budgets in 2025",
          "url": "https://writequeryhook.com/blog/the-cheapest-publishing-plan-is-a-lie-7-cost-mistakes-that-blow-up-self"
        },
        {
          "@type": "WebPage",
          "name": "Amazon algorithms: 7 common mistakes authors make when they treat \"the algorithm\" like one thing",
          "url": "https://writequeryhook.com/blog/amazon-algorithms-7-common-mistakes-authors-make-when-they-treat-the-algorithm"
        },
        {
          "@type": "WebPage",
          "name": "How to build a marketing plan that actually targets readers (not vibes)",
          "url": "https://writequeryhook.com/blog/how-to-build-a-marketing-plan-that-actually-targets-readers-not-vibes"
        }
      ]
    },
    {
      "@type": "ImageObject",
      "@id": "https://writequeryhook.com/blog/amazon-algorithms-for-authors-a-demystified-example-of-how-books-get-shown#primaryimage",
      "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_39/day_541/amazon-algorithms-for-authors-a-demystified-example-of-how-books-get-shown/blog/blog_hero_overwhelmed_blank_page_blog_hero_landscape_1ff132a40c5c.jpeg?updatedAt=1782332350554",
      "width": 5763,
      "height": 3842,
      "caption": "blog hero \u00b7 overwhelmed blank-page",
      "creditText": "Cup of  Couple",
      "author": {
        "@type": "Person",
        "name": "Cup of  Couple",
        "url": "https://www.pexels.com/@cup-of-couple"
      },
      "@context": "https://schema.org"
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": "https://writequeryhook.com/blog/amazon-algorithms-for-authors-a-demystified-example-of-how-books-get-shown#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Are there multiple Amazon algorithms or just one?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "There isn't a single algorithm. Different algorithms work together to index and rank products across separate visibility areas\u2014search results, bestseller and popularity lists, and recommendation emails included."
          }
        },
        {
          "@type": "Question",
          "name": "What do Amazon algorithms want most?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "They're described as maximizing sales by showing customers the books they're most likely to buy."
          }
        },
        {
          "@type": "Question",
          "name": "How do sales spikes affect ranking?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The algorithms prefer steady patterns over inconsistent spikes. A dramatic jump that fades quickly can look like an anomaly rather than durable demand."
          }
        },
        {
          "@type": "Question",
          "name": "What is sales conversion, and why does it matter?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Sales conversion is sales relative to page visits. Two books can show similar sales volume, but the one that converts better from the traffic it receives can rank more strongly because it's a better bet for future shows."
          }
        },
        {
          "@type": "Question",
          "name": "How do \"also bought\" connections influence recommendations?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "\"Also bought\" relationships come from customers who purchase books together. Those connections help determine what the system recommends to similar readers, and it's wise to keep those relationships aligned with genre so recommendations don't get muddied."
          }
        }
      ]
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
          <Link key={key} href={href} className="font-medium text-[#1B4A56] underline underline-offset-2 hover:opacity-80">
            {label}
          </Link>,
        );
      } else {
        nodes.push(
          <a key={key} href={href} target="_blank" rel="noopener noreferrer"
             className="font-medium text-[#1B4A56] underline underline-offset-2 hover:opacity-80">
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
    return <p key={key} className="mb-4 leading-7 text-[#1B4A56]">{renderInline(block.text, key)}</p>;
  }
  if (block.type === 'list') {
    return (
      <ul key={key} className="mb-4 list-disc pl-6 text-[#1B4A56]">
        {block.items.map((item: string, index: number) => (
          <li key={`${key}-${index}`} className="mb-2">{renderInline(item, `${key}-${index}`)}</li>
        ))}
      </ul>
    );
  }
  if (block.type === 'blockquote') {
    return (
      <blockquote key={key} className="mb-4 border-l-4 border-[#1B4A56] pl-4 italic text-[#1B4A56]">
        {renderInline(block.text, key)}
      </blockquote>
    );
  }
  if (block.type === 'subheading') {
    return <h3 key={key} className="mb-3 mt-6 text-xl font-semibold text-[#1B4A56]">{renderInline(block.text, key)}</h3>;
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
        <figcaption className="mt-2 text-xs text-[#1B4A56]/70">
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
    <main className="min-h-screen bg-[#FAF0E6] px-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA_GRAPH) }} />
      <article className="mx-auto max-w-3xl rounded-2xl bg-[#F0F0EA] p-8 shadow-sm">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-[#1B4A56]/70">
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
          <h1 className="mb-4 text-4xl font-semibold text-[#1B4A56]">{PAGE_DATA.title}</h1>
          <div className="flex flex-wrap gap-3 text-sm text-[#1B4A56]">
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
          <section className="tldr-section mb-10 rounded-xl border border-[#1B4A56]/20 bg-[#FAF0E6] p-5">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-[0.15em] text-[#1B4A56]">TL;DR</h2>
            {PAGE_DATA.tldrBlocks.map((block: any, index: number) => renderBlock(block, `tldr-${index}`))}
          </section>
        ) : null}

        {PAGE_DATA.sections.length > 1 ? (
          <nav aria-label="Table of contents" className="mb-10 rounded-xl bg-[#FAF0E6] p-5">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-[0.15em] text-[#1B4A56]">On this page</h2>
            <ul className="list-disc pl-5 text-[#1B4A56]">
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
              <h2 id={section.heading_slug} className="mb-4 scroll-mt-24 text-2xl font-semibold text-[#1B4A56]">{section.heading}</h2>
              <Figure image={section.image} />
              {section.blocks.map((block: any, index: number) => renderBlock(block, `${section.section_id}-${index}`))}
            </section>
            {PAGE_DATA.alsoLike.length > 0 && sIdx === PAGE_DATA.alsoLikeAfterIndex ? (
              <aside className="mb-10 rounded-xl border border-[#1B4A56]/20 bg-[#FAF0E6] p-5">
                <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.15em] text-[#1B4A56]">You may also like</h2>
                <ul className="list-disc pl-6 text-[#1B4A56]">
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
            <h2 className="mb-4 text-2xl font-semibold text-[#1B4A56]">Frequently asked questions</h2>
            {PAGE_DATA.faq.map((item: any, index: number) => (
              <div key={`faq-${index}`} className="mb-5">
                <h3 className="mb-2 text-lg font-semibold text-[#1B4A56]">{item.question}</h3>
                <p className="leading-7 text-[#1B4A56]">{renderInline(item.answer, `faq-a-${index}`)}</p>
              </div>
            ))}
          </section>
        ) : null}

        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-semibold text-[#1B4A56]">The bottom line</h2>
          <Figure image={PAGE_DATA.closingImage} />
          {PAGE_DATA.closingBlocks.map((block: any, index: number) => renderBlock(block, `closing-${index}`))}
        </section>

        {PAGE_DATA.relatedLinks.length > 0 ? (
          <section className="border-t border-[#1B4A56]/20 pt-6">
            <h2 className="mb-4 text-2xl font-semibold text-[#1B4A56]">Continue reading</h2>
            <ul className="list-disc pl-6 text-[#1B4A56]">
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
