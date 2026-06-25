import type { Metadata } from 'next';
import { Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const PAGE_DATA = {
  "slug": "what-rights-do-i-sign-away-in-a-book-deal-and-which-ones-authors-usually-retain",
  "title": "What rights do I sign away in a book deal (and which ones authors usually retain)",
  "description": "The first time you read a \"book deal\" offer letter, it feels like winning. Then the contract lands, and suddenly you're squinting at dense pages of boilerplate trying to figure out what you actually gave away.",
  "readTime": "9 min read",
  "publishedDate": null,
  "modifiedDate": null,
  "canonicalUrl": "https://writequeryhook.com/query-letters/what-rights-do-i-sign-away-in-a-book-deal-and-which-ones-authors-usually-retain",
  "siteUrl": "https://writequeryhook.com",
  "siteName": "Write Query Hook",
  "locale": "en-US",
  "articleSection": "Querying",
  "keywords": [
    "after the offer",
    "submissions",
    "publishing business",
    "agents",
    "rights",
    "contract",
    "boilerplate",
    "advance",
    "royalties",
    "formats",
    "cover control",
    "exasperation"
  ],
  "author": null,
  "hero": {
    "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_27/day_370/what-rights-do-i-sign-away-in-a-book-deal-and-which-ones-authors-usually-retain/blog/blog_hero_recognition_panic_blog_hero_landscape_9c0ee0128e4e.jpeg",
    "alt": "blog hero \u00b7 recognition panic",
    "width": 3500,
    "height": 2333,
    "creator": "Anna Tarazevich",
    "creatorUrl": "https://www.pexels.com/@anntarazevich",
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
      "item": "/query-letters"
    },
    {
      "name": "What rights do I sign away in a book deal (and which ones authors usually retain)",
      "item": "https://writequeryhook.com/query-letters/what-rights-do-i-sign-away-in-a-book-deal-and-which-ones-authors-usually-retain"
    }
  ],
  "tldrBlocks": [],
  "openingBlocks": [
    {
      "type": "paragraph",
      "text": "The first time you read a \"book deal\" offer letter, it feels like winning. Then the contract lands, and suddenly you're squinting at dense pages of boilerplate trying to figure out what you actually gave away."
    },
    {
      "type": "paragraph",
      "text": "Here's the recognition moment: most writers don't have a mental map of **rights**. They know \"advance\" and \"royalties\" as words, maybe. They don't know what \"print,\" \"electronic,\" \"subsidiary,\" \"territory,\" or \"adaptation\" mean in practice. And then someone says, \"Just sign\u2014it's standard.\" Sure. Standard like getting fitted for a straightjacket."
    },
    {
      "type": "blockquote",
      "text": "\"A book deal is mostly a legal contract\u2014with boilerplate you usually can't negotiate.\""
    },
    {
      "type": "paragraph",
      "text": "This deep dive is about the rights piece: **which permissions a publisher gets, which sub-rights float to them, and which buckets are nearly always kept by the author**. The goal here is to identify the clauses that move your future instead of guessing at them."
    },
    {
      "type": "paragraph",
      "text": "This is open-generation advice for writers who already understand the broad querying process and are now staring at the post-offer, pre-signing paperwork."
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
            "A **book deal** is a contract where \"rights\" are the currency\u2014not just money.",
            "The publisher usually gets the right to publish and distribute your book in **print and electronic** forms for the agreed **territory/language**.",
            "Many contracts include **sub-rights** (foreign/translation/world rights), and those can be separate leverage points.",
            "**Film/TV adaptation rights** are *nearly always* retained by the author, but check the exact drafting.",
            "Format guarantees for **print vs ebook in publishing contracts** have weakened, so print commitments may be conditional or not ironclad.",
            "**Cover and jacket/promo materials** are often publisher-controlled; authors are frequently consulted, not granted approval or veto.",
            "The advance/payment schedule matters, but rights and scope can matter later when the book's life expands."
          ]
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_27/day_370/what-rights-do-i-sign-away-in-a-book-deal-and-which-ones-authors-usually-retain/blog/blog_section_image_tldr_blog_section_landscape_9a28504b25fd.jpeg",
        "alt": "TLDR",
        "width": 6611,
        "height": 4407,
        "creator": "Ron Lach",
        "creatorUrl": "https://www.pexels.com/@ron-lach",
        "provider": "pexels",
        "role": "section"
      }
    },
    {
      "section_id": "h2_rights_list_you_need",
      "heading": "Rights list you need before you obsess over every line of boilerplate",
      "heading_slug": "rights-list-you-need-before-you-obsess-over-every-line-of-boilerplate",
      "keyword_key": "h2_rights_list_you_need",
      "keywords": [
        "ownership",
        "paperwork",
        "maze",
        "who controls what",
        "rights",
        "permissions",
        "signatures",
        "named specifics",
        "attorney",
        "checklist"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "The core work is spotting the **scope of what's licensed**. Rights work like a permission map. If you can see the map, you can see the trap."
        },
        {
          "type": "paragraph",
          "text": "In a major-house contract, the \"publisher rights\" section is usually the closest thing the document has to a core body. It's where the publisher gets permission to do things that look simple on the surface:"
        },
        {
          "type": "list",
          "items": [
            "publish the manuscript as a book",
            "distribute it to the public",
            "sell copies (print and electronic)",
            "exploit editions and versions (sometimes including audio or other formats, depending on the agreement)",
            "manage the book's presence in the market for the term of the deal"
          ]
        },
        {
          "type": "paragraph",
          "text": "Now\u2014here's the part that makes people feel stupid after the fact. Writers often assume they're \"agreeing to publish a book.\" But legally, they're granting a license-like set of permissions. That means the question isn't only **\"Do I get a publishing relationship?\"** It's **\"Which uses of my work can the publisher profit from without coming back to me?\"**"
        },
        {
          "type": "paragraph",
          "text": "So when you ask **what rights do I sign away in a book deal**, your checklist is less \"what does the publisher want\" and more:"
        },
        {
          "type": "paragraph",
          "text": "1. **The primary rights**: publish and distribute the book (commonly print + electronic). 2. **Territory and language**: where and in what language those rights operate. 3. **Sub-rights**: which offshoot markets or formats are included (or carved out). 4. **Term and media evolution**: whether the publisher's permission covers future formats that didn't exist when the contract was drafted. 5. **Control rights**: who controls cover and promotional materials (and whether you have approval power or any veto)."
        },
        {
          "type": "paragraph",
          "text": "If you're doing this with an agent, this is the part that gets redlined first\u2014not because the boilerplate isn't real, but because **the rights section tells you where your leverage lives**."
        },
        {
          "type": "paragraph",
          "text": "And yes, there's overlap with money terms, because rights scope impacts future revenue. But when writers panic, they usually panic in the wrong direction: they fixate on whether they'll get \"enough advance,\" instead of whether the publisher is buying a wider **publishing contract** scope than they understand."
        },
        {
          "type": "paragraph",
          "text": "You can't out-earn a bad rights grant forever."
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_27/day_370/what-rights-do-i-sign-away-in-a-book-deal-and-which-ones-authors-usually-retain/blog/blog_section_image_ownership_paperwork_blog_section_landscape_b1a720b67381.gif",
        "alt": "Rights list you need before you obsess over every line of boilerplate",
        "width": 200,
        "height": 200,
        "creator": "oimarketingca",
        "creatorUrl": "https://giphy.com/gifs/oimarketingca-paperworks-file-sorting-organizing-SYw1TeYENoxU3PL4e0",
        "provider": "giphy",
        "role": "section"
      }
    },
    {
      "section_id": "h2_foreign_translation_film_tv",
      "heading": "Publisher rights, foreign/translation/world rights, and the adaptation cliff writers miss",
      "heading_slug": "publisher-rights-foreign-translation-world-rights-and-the-adaptation-cliff",
      "keyword_key": "h2_foreign_translation_film_tv",
      "keywords": [
        "indignation",
        "control",
        "adaptation",
        "screen rights",
        "translation",
        "territory",
        "clause-nerd",
        "future-proofing",
        "fear"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Most contracts separate the broad \"you can publish the book\" permission from the **publisher rights foreign translation film tv rights** buckets that look like side issues\u2014until they're exactly where your future options get strangled."
        },
        {
          "type": "paragraph",
          "text": "Let's name the common pattern."
        },
        {
          "type": "subheading",
          "text": "What the publisher nearly always gets"
        },
        {
          "type": "paragraph",
          "text": "The publisher rights in a major-house contract usually include the right to publish and distribute the work in **print and electronically**, in the relevant **language and territory**. That's the backbone. Without it, the rest of the deal is just fantasy."
        },
        {
          "type": "subheading",
          "text": "What gets bundled as sub-rights"
        },
        {
          "type": "paragraph",
          "text": "Many deals also grant sub-rights\u2014often described as **foreign/translation/world rights**. That can mean the publisher can exploit certain international markets directly, or it can mean they hold the licensing permissions for specific territories/languages."
        },
        {
          "type": "paragraph",
          "text": "If you don't understand the territory/language scope, you can accidentally give away a portion of your audience reach that would otherwise be negotiable later."
        },
        {
          "type": "subheading",
          "text": "What authors nearly always retain: film/TV adaptation rights"
        },
        {
          "type": "paragraph",
          "text": "The bright line that prevents a lot of heartache: **adaptation rights (film/television)** are **nearly always retained by the author**. Your contract may allow the publisher to develop the book into marketing text, maybe pursue certain merchandising adjacent activities\u2014but when it comes to *optioning* or *adapting* your story into screen media, the author is typically the decision-maker."
        },
        {
          "type": "paragraph",
          "text": "But \"nearly always\" is not \"always.\" Read the clause. The devil is in the defined terms."
        },
        {
          "type": "paragraph",
          "text": "If you're negotiating, pay attention to whether the contract:"
        },
        {
          "type": "list",
          "items": [
            "includes any language that touches adaptation in disguise",
            "grants the publisher any participation rights in those adaptations",
            "creates conditions that could delay or obstruct your future licensing options"
          ]
        },
        {
          "type": "paragraph",
          "text": "This is also where an agent earns their keep. A writer can read the contract and know it's \"standard,\" but agents focus on what's actually operational: what permission survives contact with future opportunities."
        },
        {
          "type": "paragraph",
          "text": "The moment someone offers screen interest, a translation opportunity, or a reformatting plan\u2014and you realize your contract already decided who gets to say yes\u2014that's when **publisher rights foreign translation film tv rights** stops being abstract."
        }
      ],
      "image": null
    },
    {
      "section_id": "h2_format_guarantee_print_vs_ebook",
      "heading": "Format guarantee print vs ebook in publishing contracts: why \"we'll publish it\" may mean \"we'll try\"",
      "heading_slug": "format-guarantee-print-vs-ebook-in-publishing-contracts-why-we-ll-publish-it",
      "keyword_key": "h2_format_guarantee_print_vs_ebook",
      "keywords": [
        "uncertainty",
        "frustration",
        "compromise",
        "print vs ebook",
        "format guarantee",
        "timing",
        "delivery",
        "acceptance",
        "reality-check"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Writers sometimes assume a deal guarantees the publisher will publish in a certain way\u2014especially print. Ebook and print uncertainty has made the industry more cautious, and publishers have responded by drafting print commitments with more conditions, more flexibility, or weaker enforcement."
        },
        {
          "type": "paragraph",
          "text": "Print can be expensive, schedules slip, and demand forecasts aren't stable. Publishers preserve their options rather than lock themselves into expensive production."
        },
        {
          "type": "paragraph",
          "text": "That doesn't mean the publisher won't publish. It means the contract may not guarantee the exact print outcome you assumed at the contract stage."
        },
        {
          "type": "paragraph",
          "text": "This matters because **format guarantees** connect directly to timelines, revenue realization, and how \"public\" your book becomes. If the ebook is available quickly but print is uncertain, you still get readers\u2014but maybe not the placement, shelf, or institutional reach you expected."
        },
        {
          "type": "paragraph",
          "text": "When you're deciding whether **format guarantee print vs ebook in publishing contracts** language is \"good enough,\" look for concrete drafting signals:"
        },
        {
          "type": "list",
          "items": [
            "Is print a firm obligation or conditional?",
            "Does the agreement define what counts as \"publication\" for acceptance/release?",
            "Are there dates, or is it more flexible?",
            "Does \"delivery and acceptance\" control when money changes hands and when publication obligations trigger?"
          ]
        },
        {
          "type": "paragraph",
          "text": "This is also where the **book contract advance payment schedule explained** piece is not separate from rights and formats\u2014it's tangled with them. The advance installments often hinge on delivery, acceptance, and publication or time-based milestones. If publication is delayed or treated differently by format, payment can follow the contract's definitions more than your expectations."
        },
        {
          "type": "paragraph",
          "text": "When negotiating print guarantees, focus on removing ambiguity about the commitments the contract creates for **print** versus **ebook** instead of trying to win a fantasy scenario."
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_27/day_370/what-rights-do-i-sign-away-in-a-book-deal-and-which-ones-authors-usually-retain/blog/blog_section_image_uncertainty_frustration_blog_section_landscape_eef78189b8b0.gif",
        "alt": "Format guarantee print vs ebook in publishing contracts: why \"we'll publish it\" may mean \"we'll try\"",
        "width": 200,
        "height": 200,
        "creator": "DogelonMars",
        "creatorUrl": "https://giphy.com/gifs/DogelonMars-mexico-south-korea-vs-nVeQZJXDmHI7M5RdPC",
        "provider": "giphy",
        "role": "section"
      }
    },
    {
      "section_id": "h2_cover_and_promos_publisher_control",
      "heading": "Cover approval and promotional materials: do authors get cover approval in a book deal?",
      "heading_slug": "cover-approval-and-promotional-materials-do-authors-get-cover-approval-in-a",
      "keyword_key": "h2_cover_and_promos_publisher_control",
      "keywords": [
        "hands-off",
        "disappointment",
        "branding",
        "jacket copy",
        "cover approval",
        "marketing control",
        "eye-roll",
        "publisher decision",
        "limits"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "This is the part that makes writers bristle. They imagine a collaborative process. The publisher imagines a professional workflow with brand consistency."
        },
        {
          "type": "paragraph",
          "text": "In most traditional publishing contracts, writers **do not** get guaranteed cover approval or a veto power over design decisions. They may be consulted\u2014sometimes repeatedly\u2014but the publisher typically controls final design and branding decisions."
        },
        {
          "type": "paragraph",
          "text": "So the answer to **do authors get cover approval in a book deal** is usually: not in a binding, guaranteed \"you approve or it doesn't run\" way. You're often participating, not owning."
        },
        {
          "type": "paragraph",
          "text": "The same control pattern tends to show up in promotional and advertising materials, including jacket \"flap copy.\" The publisher is making decisions reflecting their investment and market positioning."
        },
        {
          "type": "paragraph",
          "text": "This doesn't mean writers should ignore the cover. Your leverage is different:"
        },
        {
          "type": "list",
          "items": [
            "you negotiate influence, not control",
            "you preserve the ability to give feedback without assuming you own the outcome",
            "you avoid signing language that converts a limited consultation into a misleading expectation"
          ]
        },
        {
          "type": "paragraph",
          "text": "If you're worried about creative control, here's the reality: rights scope is where you can sometimes win. Cover approvals are where authors often get consulted but rarely get veto rights."
        }
      ],
      "image": null
    }
  ],
  "closingImage": {
    "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_27/day_370/what-rights-do-i-sign-away-in-a-book-deal-and-which-ones-authors-usually-retain/blog/blog_section_image_resolve_exhale_blog_section_landscape_4ae87397f505.jpeg",
    "alt": "blog section image \u00b7 resolve exhale",
    "width": 5184,
    "height": 3888,
    "creator": "Nikita Korchagin",
    "creatorUrl": "https://www.pexels.com/@nikkor",
    "provider": "pexels",
    "role": "section"
  },
  "alsoLike": [
    {
      "title": "Why publishing takes forever (and why \"radio silence\" often means work is happening)",
      "url": "https://writequeryhook.com/why-publishing-takes-forever-and-why-radio-silence-often-means-work-is-happening"
    },
    {
      "title": "8 steps to a book launch that actually sells",
      "url": "https://writequeryhook.com/8-steps-to-a-book-launch-that-actually-sells"
    },
    {
      "title": "9 best practices for writing a blurb request that gets read (and answered)",
      "url": "https://writequeryhook.com/9-best-practices-for-writing-a-blurb-request-that-gets-read-and-answered"
    },
    {
      "title": "How to know when to leave your agent without burning the whole relationship",
      "url": "https://writequeryhook.com/how-to-know-when-to-leave-your-agent-without-burning-the-whole-relationship"
    }
  ],
  "alsoLikeAfterIndex": 2,
  "faq": [
    {
      "question": "What is a \"book deal,\" really?",
      "answer": "A book deal is a publishing contract: a legal agreement with a bunch of fixed \"boilerplate\" terms and a few sections that actually determine what the publisher can do with your work. The headline is not \"winning a prize.\" The headline is rights plus money, in a document designed to stay enforceable."
    },
    {
      "question": "How does the advance and payment schedule usually work?",
      "answer": "A book contract advance payment schedule explained usually looks like installments: some money at signing, more tied to delivery and/or acceptance, and sometimes further payments tied to publication or to a set time after delivery. When the schedule is tied to definitions of \"acceptance\" or \"publication,\" format uncertainty (like print vs ebook) can affect timing."
    },
    {
      "question": "What rights do publishers usually get in a major-house contract?",
      "answer": "The rights most publishers get are the core permissions to publish and distribute the book in relevant print and electronic formats in the agreed language and territory. Many deals also include publisher rights foreign translation film tv rights as sub-rights, while film/TV adaptation rights are nearly always retained by the author."
    },
    {
      "question": "Are publishers required to produce the book in print formats?",
      "answer": "Not necessarily. Format guarantee print vs ebook in publishing contracts has drifted: print commitments have weakened in some agreements, meaning the publisher may not have the same enforceable obligation to release in print even if they start with that intention."
    },
    {
      "question": "Can an author approve or veto the cover and promotional materials?",
      "answer": "Generally, no\u2014not in the way writers often hope. For do authors get cover approval in a book deal, the publisher typically controls final design and branding. Authors may be consulted, and promotional text like jacket copy is often publisher-controlled too."
    }
  ],
  "closingBlocks": [
    {
      "type": "paragraph",
      "text": "If you want one calm rule for signing: don't read the contract like it's celebrating your future. Read it like it's allocating permissions for the next decade."
    },
    {
      "type": "paragraph",
      "text": "Underline the **rights** you're granting, circle anything about **territory/language**, and verify the stance on **publisher rights foreign translation film tv rights**\u2014especially the line on screen adaptation. Then negotiate from that map, not from vibes."
    },
    {
      "type": "paragraph",
      "text": "Write Query Hook exists because \"just sign\" is the laziest advice in the room. This is where you earn clarity before the deal becomes a done deal."
    }
  ],
  "relatedLinks": [
    {
      "title": "How to resubmit a revision to an agent without sounding like you\u2019re fishing",
      "url": "https://writequeryhook.com/query-letters/how-to-resubmit-a-revision-to-an-agent-without-sounding-like-you-re-fishing"
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
      "@id": "https://writequeryhook.com/query-letters/what-rights-do-i-sign-away-in-a-book-deal-and-which-ones-authors-usually-retain#breadcrumb",
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
          "item": "https://writequeryhook.com/query-letters"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "What rights do I sign away in a book deal (and which ones authors usually retain)",
          "item": "https://writequeryhook.com/query-letters/what-rights-do-i-sign-away-in-a-book-deal-and-which-ones-authors-usually-retain"
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": "https://writequeryhook.com/query-letters/what-rights-do-i-sign-away-in-a-book-deal-and-which-ones-authors-usually-retain#webpage",
      "url": "https://writequeryhook.com/query-letters/what-rights-do-i-sign-away-in-a-book-deal-and-which-ones-authors-usually-retain",
      "name": "What rights do I sign away in a book deal (and which ones authors usually retain)",
      "isPartOf": {
        "@id": "https://writequeryhook.com/#website"
      },
      "inLanguage": "en-US",
      "primaryImageOfPage": {
        "@id": "https://writequeryhook.com/query-letters/what-rights-do-i-sign-away-in-a-book-deal-and-which-ones-authors-usually-retain#primaryimage"
      },
      "breadcrumb": {
        "@id": "https://writequeryhook.com/query-letters/what-rights-do-i-sign-away-in-a-book-deal-and-which-ones-authors-usually-retain#breadcrumb"
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
      "@id": "https://writequeryhook.com/query-letters/what-rights-do-i-sign-away-in-a-book-deal-and-which-ones-authors-usually-retain#article",
      "isPartOf": {
        "@id": "https://writequeryhook.com/query-letters/what-rights-do-i-sign-away-in-a-book-deal-and-which-ones-authors-usually-retain#webpage"
      },
      "mainEntityOfPage": "https://writequeryhook.com/query-letters/what-rights-do-i-sign-away-in-a-book-deal-and-which-ones-authors-usually-retain",
      "headline": "What rights do I sign away in a book deal (and which ones authors usually retain)",
      "alternativeHeadline": "What rights do I sign away in a book deal (and which ones authors usually retain)",
      "description": "The first time you read a \"book deal\" offer letter, it feels like winning. Then the contract lands, and suddenly you're squinting at dense pages of boilerplate trying to figure out what you actually gave away.",
      "wordCount": 1891,
      "timeRequired": "PT9M",
      "articleSection": "Querying",
      "keywords": [
        "after the offer",
        "submissions",
        "publishing business",
        "agents",
        "rights",
        "contract",
        "boilerplate",
        "advance",
        "royalties",
        "formats",
        "cover control",
        "exasperation"
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
        "@id": "https://writequeryhook.com/query-letters/what-rights-do-i-sign-away-in-a-book-deal-and-which-ones-authors-usually-retain#primaryimage"
      },
      "mentions": [
        {
          "@type": "WebPage",
          "name": "How to resubmit a revision to an agent without sounding like you\u2019re fishing",
          "url": "https://writequeryhook.com/query-letters/how-to-resubmit-a-revision-to-an-agent-without-sounding-like-you-re-fishing"
        },
        {
          "@type": "WebPage",
          "name": "Why publishing takes forever (and why \"radio silence\" often means work is happening)",
          "url": "https://writequeryhook.com/why-publishing-takes-forever-and-why-radio-silence-often-means-work-is-happening"
        },
        {
          "@type": "WebPage",
          "name": "8 steps to a book launch that actually sells",
          "url": "https://writequeryhook.com/8-steps-to-a-book-launch-that-actually-sells"
        },
        {
          "@type": "WebPage",
          "name": "9 best practices for writing a blurb request that gets read (and answered)",
          "url": "https://writequeryhook.com/9-best-practices-for-writing-a-blurb-request-that-gets-read-and-answered"
        },
        {
          "@type": "WebPage",
          "name": "How to know when to leave your agent without burning the whole relationship",
          "url": "https://writequeryhook.com/how-to-know-when-to-leave-your-agent-without-burning-the-whole-relationship"
        }
      ]
    },
    {
      "@type": "ImageObject",
      "@id": "https://writequeryhook.com/query-letters/what-rights-do-i-sign-away-in-a-book-deal-and-which-ones-authors-usually-retain#primaryimage",
      "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_27/day_370/what-rights-do-i-sign-away-in-a-book-deal-and-which-ones-authors-usually-retain/blog/blog_hero_recognition_panic_blog_hero_landscape_9c0ee0128e4e.jpeg",
      "width": 3500,
      "height": 2333,
      "caption": "blog hero \u00b7 recognition panic",
      "creditText": "Anna Tarazevich",
      "author": {
        "@type": "Person",
        "name": "Anna Tarazevich",
        "url": "https://www.pexels.com/@anntarazevich"
      },
      "@context": "https://schema.org"
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": "https://writequeryhook.com/query-letters/what-rights-do-i-sign-away-in-a-book-deal-and-which-ones-authors-usually-retain#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is a \"book deal,\" really?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A book deal is a publishing contract: a legal agreement with a bunch of fixed \"boilerplate\" terms and a few sections that actually determine what the publisher can do with your work. The headline is not \"winning a prize.\" The headline is rights plus money, in a document designed to stay enforceable."
          }
        },
        {
          "@type": "Question",
          "name": "How does the advance and payment schedule usually work?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A book contract advance payment schedule explained usually looks like installments: some money at signing, more tied to delivery and/or acceptance, and sometimes further payments tied to publication or to a set time after delivery. When the schedule is tied to definitions of \"acceptance\" or \"publication,\" format uncertainty (like print vs ebook) can affect timing."
          }
        },
        {
          "@type": "Question",
          "name": "What rights do publishers usually get in a major-house contract?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The rights most publishers get are the core permissions to publish and distribute the book in relevant print and electronic formats in the agreed language and territory. Many deals also include publisher rights foreign translation film tv rights as sub-rights, while film/TV adaptation rights are nearly always retained by the author."
          }
        },
        {
          "@type": "Question",
          "name": "Are publishers required to produce the book in print formats?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Not necessarily. Format guarantee print vs ebook in publishing contracts has drifted: print commitments have weakened in some agreements, meaning the publisher may not have the same enforceable obligation to release in print even if they start with that intention."
          }
        },
        {
          "@type": "Question",
          "name": "Can an author approve or veto the cover and promotional materials?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Generally, no\u2014not in the way writers often hope. For do authors get cover approval in a book deal, the publisher typically controls final design and branding. Authors may be consulted, and promotional text like jacket copy is often publisher-controlled too."
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
