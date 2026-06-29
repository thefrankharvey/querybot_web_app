import type { Metadata } from 'next';
import { Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BlogBackLink } from '@/components/blog/BlogBackLink';

const PAGE_DATA = {
  "slug": "advances-vs-royalties-traditional-publishing-s-earn-out-headache-vs-self",
  "title": "Advances vs royalties: traditional publishing's earn-out headache vs self-publishing's platform math",
  "description": "You know the vibe: traditional publishing says, \"Here's an advance!\" and then, two minutes later, whispers, \"Cool cool\u2014now wait for the book to earn it back first. We'll do royalties after.\"",
  "readTime": "8 min read",
  "publishedDate": "2027-08-13",
  "modifiedDate": "2027-08-13",
  "canonicalUrl": "https://writequeryhook.com/blog/advances-vs-royalties-traditional-publishing-s-earn-out-headache-vs-self",
  "siteUrl": "https://writequeryhook.com",
  "siteName": "Write Query Hook",
  "locale": "en-US",
  "articleSection": "Querying",
  "keywords": [
    "industry literacy",
    "publishing business",
    "querying",
    "payment timing",
    "earn-out",
    "risk",
    "contract fine print",
    "no advance",
    "returns",
    "platform royalties",
    "calculator-brain",
    "stress"
  ],
  "author": null,
  "hero": {
    "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_36/day_503/advances-vs-royalties-traditional-publishing-s-earn-out-headache-vs-self/blog/blog_hero_book_contract_eye_roll_blog_hero_landscape_c3c6d8ced560.jpeg?updatedAt=1782311859006",
    "alt": "blog hero \u00b7 book contract eye roll",
    "width": 6390,
    "height": 4790,
    "creator": "Ana Claudia Quevedo Estrada",
    "creatorUrl": "https://www.pexels.com/@ana-claudia-quevedo-estrada-922193",
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
      "name": "Advances vs royalties: traditional publishing's earn-out headache vs self-publishing's platform math",
      "item": "https://writequeryhook.com/blog/advances-vs-royalties-traditional-publishing-s-earn-out-headache-vs-self"
    }
  ],
  "tldrBlocks": [],
  "openingBlocks": [
    {
      "type": "paragraph",
      "text": "You know the vibe: traditional publishing says, \"Here's an advance!\" and then, two minutes later, whispers, \"Cool cool\u2014now wait for the book to earn it back first. We'll do royalties after.\""
    },
    {
      "type": "paragraph",
      "text": "Self-publishing is the opposite personality. No advance usually, fewer mysterious timing beats, and the real work is figuring out the platform's royalty percentage and payout rules. It's less \"we'll talk later\" and more \"here's the math.\""
    },
    {
      "type": "paragraph",
      "text": "This comparison is for Slushies staring at **advances**, **royalties**, and **contracts** and trying to answer one brutal question: **when do you actually start earning royalties**, and what parts of that agreement can quietly reduce what you get?"
    },
    {
      "type": "blockquote",
      "text": "\"Traditional publishing can feel like they're paying you to gamble\u2014then calling the payout 'royalties' only after the gamble earns out.\" \u2014 (Frank, in your head, pretending he's chill)"
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
            "**Advances** are money paid up front based on expected long-term performance; **royalties** are a percentage of **actual sales**.",
            "Traditional publishing usually pays royalties **against royalties** via an **earn-out**: you may wait before you see any royalty checks.",
            "Traditional advances are paid in **stages** per contract (signing, delivery, acceptance), not \"one big payday.\"",
            "Self-publishing typically means **no advance**, and income comes from **platform royalties** (often higher, but tied to platform rules).",
            "Returns can reduce what you earn in both models; the contract spells out how.",
            "If you can't translate the contract into \"when money shows up,\" you don't understand it yet."
          ]
        }
      ],
      "image": null
    },
    {
      "section_id": "h2_what_you_get_paid_with_advances_vs_royalties",
      "heading": "What you get paid with: advances vs royalties",
      "heading_slug": "what-you-get-paid-with-advances-vs-royalties",
      "keyword_key": "h2_what_you_get_paid_with_advances_vs_royalties",
      "keywords": [
        "upfront money",
        "fake certainty",
        "expectation",
        "actual sales",
        "percentage",
        "upfront vs later",
        "dread",
        "handshake",
        "contract",
        "spreadsheet"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Let's name the pieces cleanly, because the terms get mangled everywhere\u2014often by people who want you to stop asking questions."
        },
        {
          "type": "subheading",
          "text": "Advances (traditional publishing's \"upfront\" bet)"
        },
        {
          "type": "list",
          "items": [
            "An **advance** is a publisher payment based on what they expect the book will earn over time.",
            "It's usually **paid in stages**. The contract decides when (signing, delivery, acceptance).",
            "It's money you receive even before the book \"proves\" itself in sales, but it's not free money. It ties into the earn-out math."
          ]
        },
        {
          "type": "subheading",
          "text": "Royalties (a slice of actual sales)"
        },
        {
          "type": "list",
          "items": [
            "**Royalties** are a percentage of what the book earns from **actual sales** (rate defined in the contract or platform agreement).",
            "In **traditional publishing**, the publisher typically pays royalties **after** the advance is recouped\u2014i.e., after the book \"earns out.\"",
            "In **self-publishing**, royalties generally start based on sales immediately, but your rate and payout timing depend on the platform and their deal terms."
          ]
        },
        {
          "type": "paragraph",
          "text": "Here's the scannable version:"
        },
        {
          "type": "paragraph",
          "text": "| Topic | Traditional publishing | Self-publishing | |---|---|---| | Advances | Usually yes; paid in stages per **contracts** | Usually no | | Royalties source | Publisher sales + contract terms | Platform sales + platform agreement | | \"When do I see royalty checks?\" | After **earn-out** (advance recoupment) | Typically after sales start, per platform payout schedule | | Rate expectations | Often **1% to 20%** depending on format | Often **30% to 70%** depending on platform | | Returns impact | Can reduce royalties via deductions | Can reduce royalties via platform rules/returns handling |"
        },
        {
          "type": "paragraph",
          "text": "And yes, those numbers aren't \"better/worse\" by themselves. They're just different ways of splitting risk and timing."
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_36/day_503/advances-vs-royalties-traditional-publishing-s-earn-out-headache-vs-self/blog/blog_section_image_upfront_money_fake_certainty_blog_section_landscape_d1e97c672fef.gif",
        "alt": "What you get paid with: advances vs royalties",
        "width": 226,
        "height": 200,
        "creator": "theinnernette",
        "creatorUrl": "https://giphy.com/gifs/theinnernette-rest-in-peace-rip-anthony-head-giles-6APRk8PmCkmoRMe5V9",
        "provider": "giphy",
        "role": "section"
      }
    },
    {
      "section_id": "h2_traditional_publishing_the_earn_out_mechanism",
      "heading": "Traditional publishing: the earn-out mechanism",
      "heading_slug": "traditional-publishing-the-earn-out-mechanism",
      "keyword_key": "h2_traditional_publishing_the_earn_out_mechanism",
      "keywords": [
        "earn-out",
        "delay",
        "start date",
        "prove it",
        "cashflow",
        "suspense",
        "frustration",
        "red pen",
        "contract clause",
        "waiting"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "This is the part that makes writers laugh in a bitter way and then go back to highlighting clauses."
        },
        {
          "type": "paragraph",
          "text": "In **traditional publishing**, the advance is typically paid **against royalties**. That means:"
        },
        {
          "type": "list",
          "items": [
            "The publisher treats the advance as prepayment.",
            "Royalty statements may start tracking sales, but **you may not receive checks** until the book earns enough to \"earn out\" the advance.",
            "So the obvious question\u2014**when do you start earning royalties**\u2014often has an unsatisfying answer: *after the book earns its way past the advance.*"
          ]
        },
        {
          "type": "paragraph",
          "text": "You get an upfront payment, but until the book hits the recoupment threshold, the royalties aren't really \"yours yet\" in cash terms."
        },
        {
          "type": "paragraph",
          "text": "Traditional advances can be paid when certain milestones happen. The contract might pay a portion when you sign, another when you deliver, another after acceptance. That's why some writers feel like they got paid, then later feel blindsided by silence on royalty checks."
        },
        {
          "type": "paragraph",
          "text": "**How advances work against royalties** comes down to this: the advance is money the publisher fronts, betting on future sales. Once royalties start accruing, they offset the advance dollar-for-dollar until it's recouped. Only then do royalty payments go to you."
        },
        {
          "type": "paragraph",
          "text": "So the decision isn't just \"do I want advances?\" It's:"
        },
        {
          "type": "list",
          "items": [
            "Do I need cash now?",
            "Do I accept that **royalties** may be delayed by the **earn-out**?"
          ]
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_36/day_503/advances-vs-royalties-traditional-publishing-s-earn-out-headache-vs-self/blog/blog_section_image_earn_out_delay_blog_section_landscape_76be631e5cb1.jpeg",
        "alt": "Traditional publishing: the earn-out mechanism",
        "width": 5307,
        "height": 4246,
        "creator": "Josh Withers",
        "creatorUrl": "https://www.pexels.com/@hellojoshwithers",
        "provider": "pexels",
        "role": "section"
      }
    },
    {
      "section_id": "h2_self_publishing_the_platform_driven_royalty_model",
      "heading": "Self-publishing: the platform-driven royalty model",
      "heading_slug": "self-publishing-the-platform-driven-royalty-model",
      "keyword_key": "h2_self_publishing_the_platform_driven_royalty_model",
      "keywords": [
        "platform math",
        "instant clarity",
        "higher percentages",
        "payment schedule",
        "payout minimums",
        "control",
        "relief",
        "inbox anxiety",
        "royalties",
        "dashboard"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Self-publishing usually flips the script: **no advance**, income comes from royalties tied to the sales platform."
        },
        {
          "type": "paragraph",
          "text": "That typically means:"
        },
        {
          "type": "list",
          "items": [
            "Your **self-publishing royalties percentage range** is defined by the platform agreement.",
            "The **payment schedule** is also controlled by the platform (with possible minimums for payouts depending on method).",
            "There's no publisher recouping an upfront advance, because there usually isn't one."
          ]
        },
        {
          "type": "paragraph",
          "text": "When do you start earning royalties here? Usually right when sales happen, but you might not *see the money* until the platform issues payouts. Timing shifts from \"earn-out gate\" to \"platform payout cadence.\""
        },
        {
          "type": "paragraph",
          "text": "The rates are commonly higher than traditional\u2014often **30% to 70%**, again depending on the platform deal and format. That higher percentage can feel like the whole story, but it's not. You still need to understand the platform's rules:"
        },
        {
          "type": "list",
          "items": [
            "what counts as \"sales\"",
            "how returns work in the platform system",
            "whether certain retailer programs affect your effective royalty"
          ]
        }
      ],
      "image": null
    },
    {
      "section_id": "h2_contracts_are_where_the_body_lives",
      "heading": "Contracts are where the body lives",
      "heading_slug": "contracts-are-where-the-body-lives",
      "keyword_key": "h2_contracts_are_where_the_body_lives",
      "keywords": [
        "legalese",
        "deductions",
        "returns",
        "stage payments",
        "acceptance",
        "signing",
        "fight the clause",
        "redline",
        "clarity",
        "agreement"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Everything interesting about **advances**, **royalties**, and timing is locked behind **contracts**. Reading a contract without a decoder ring feels like being handed a legal ransom note."
        },
        {
          "type": "paragraph",
          "text": "But you only need to find a few specific things:"
        },
        {
          "type": "subheading",
          "text": "1) Advance payment schedule"
        },
        {
          "type": "paragraph",
          "text": "In traditional publishing, the contract tells you whether the advance is paid at:"
        },
        {
          "type": "list",
          "items": [
            "signing",
            "delivery",
            "acceptance"
          ]
        },
        {
          "type": "paragraph",
          "text": "(and sometimes other milestones)"
        },
        {
          "type": "subheading",
          "text": "2) Earn-out / \"against royalties\" terms"
        },
        {
          "type": "paragraph",
          "text": "The contract explains how and when the advance is recouped, and when royalty payments begin."
        },
        {
          "type": "subheading",
          "text": "3) Royalty definitions and rates by format"
        },
        {
          "type": "paragraph",
          "text": "**Traditional publishing royalty rates explained** start with a set of rates that vary by:"
        },
        {
          "type": "list",
          "items": [
            "hardcover vs paperback vs ebook vs audio",
            "territory",
            "other format-specific terms"
          ]
        },
        {
          "type": "paragraph",
          "text": "Self-publishing is simpler in concept but still deal-defined. Your **self-publishing royalties percentage range** comes from the sales platform agreement."
        },
        {
          "type": "paragraph",
          "text": "A contract written for lawyers to read first will disguise its payment terms in cross-referenced clauses, defined-term layers, and conditional language\u2014making the path from \"book sells\" to \"you get paid\" deliberately hard to trace without legal help."
        }
      ],
      "image": null
    },
    {
      "section_id": "h2_returns_and_deductions_the_silent_royalty_killers",
      "heading": "Returns and deductions: the silent royalty killers",
      "heading_slug": "returns-and-deductions-the-silent-royalty-killers",
      "keyword_key": "h2_returns_and_deductions_the_silent_royalty_killers",
      "keywords": [
        "returns",
        "deductions",
        "clawback",
        "surprise",
        "sinking feeling",
        "wait, what?",
        "accounting statements",
        "refund spiral",
        "regret",
        "vigilance"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Returns are the reason your royalty numbers can look \"fine\" and still end up smaller than you expected."
        },
        {
          "type": "paragraph",
          "text": "In traditional publishing, returns are usually handled via deductions. If books are returned, the publisher may:"
        },
        {
          "type": "list",
          "items": [
            "deduct from amounts otherwise payable",
            "adjust the royalty calculation for the period"
          ]
        },
        {
          "type": "paragraph",
          "text": "Even if the sales line looks healthy, the final payout can reflect net sales after returns."
        },
        {
          "type": "paragraph",
          "text": "In self-publishing, returns can also reduce revenue used for royalty calculations, depending on how the platform and retailers implement returns/refunds in their reporting."
        },
        {
          "type": "paragraph",
          "text": "This matters because traditional publishing may also include other deductions beyond returns (depending on contract). When you compare models, you're comparing \"gross royalties potential\" versus \"net what actually gets paid.\""
        },
        {
          "type": "paragraph",
          "text": "Royalties are based on actual sales, but returns can reduce what you receive\u2014sometimes so quietly the contract feels deliberately written to hide it."
        }
      ],
      "image": null
    },
    {
      "section_id": "h2_the_verdict",
      "heading": "The verdict",
      "heading_slug": "the-verdict",
      "keyword_key": "h2_the_verdict",
      "keywords": [],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Pick **self-publishing** if what you want most is clarity on timing and fewer \"earn-out, wait for it\" surprises. No advance usually means there's less structural delay between sales and royalty reality."
        },
        {
          "type": "paragraph",
          "text": "Pick **traditional publishing** if you can live with the risk/timing trade and you specifically want the upfront cash in stages\u2014just understand that the book usually has to earn enough to recoup the advance before royalties show up."
        },
        {
          "type": "paragraph",
          "text": "My recommendation is self-publishing for writers who are tired of waiting for a contract to translate itself."
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_36/day_503/advances-vs-royalties-traditional-publishing-s-earn-out-headache-vs-self/blog/blog_section_image_the_verdict_blog_section_landscape_fbb3adea8b75.gif",
        "alt": "The verdict",
        "width": 279,
        "height": 200,
        "creator": "Giphy",
        "creatorUrl": "https://giphy.com/gifs/fight-club-edward-norton-writing-Y5ytdl4PXziZW",
        "provider": "giphy",
        "role": "section"
      }
    }
  ],
  "closingImage": null,
  "alsoLike": [
    {
      "title": "Word count for novels and children's books FAQ",
      "url": "https://writequeryhook.com/blog/word-count-for-novels-and-children-s-books-faq"
    },
    {
      "title": "Types of novels FAQ: genre, literary, and mainstream (explained for writers)",
      "url": "https://writequeryhook.com/blog/types-of-novels-faq-genre-literary-and-mainstream-explained-for-writers"
    },
    {
      "title": "How can you market your book effectively? FAQ for self-published authors",
      "url": "https://writequeryhook.com/blog/how-can-you-market-your-book-effectively-faq-for-self-published-authors"
    },
    {
      "title": "Breaking down small press publishing: what it is, when to submit, and what you're trading",
      "url": "https://writequeryhook.com/blog/breaking-down-small-press-publishing-what-it-is-when-to-submit-and-what-you-re"
    }
  ],
  "alsoLikeAfterIndex": 3,
  "faq": [
    {
      "question": "What's the difference between an advance and a royalty?",
      "answer": "An advance is money paid upfront by a publisher based on expected long-term earnings. A royalty is a percentage of actual sales paid to the author. In traditional publishing, those two are connected through the \"against royalties\" earn-out system."
    },
    {
      "question": "Do traditional publishers pay royalties immediately after publication?",
      "answer": "Usually not. Royalties often begin only after the book earns enough to \"earn out\" the advance\u2014so you might wait before any royalty payments show up as cash to you."
    },
    {
      "question": "How are traditional advances paid out?",
      "answer": "The contract controls the advance amount and schedule. Many publishers pay portions at signing, delivery, or final acceptance/approval milestones. The exact steps are not universal; the contract tells the truth."
    },
    {
      "question": "What royalty rates can authors expect in traditional publishing versus self-publishing?",
      "answer": "Traditional publishing royalty rates commonly range from 1% to 20%, depending on format and contract terms. Self-publishing royalties percentage range is often much higher, commonly 30% to 70%, depending on the platform agreement and format."
    },
    {
      "question": "Can returns reduce what an author earns?",
      "answer": "Yes. If books are returned, the publisher may deduct amounts from royalties. Authors should read the contract language for how returns are handled and what gets deducted before payments are calculated."
    }
  ],
  "closingBlocks": [
    {
      "type": "paragraph",
      "text": "If you're stuck between routes, stop asking \"which is better\" and start asking \"when do I start earning royalties, and what can reduce that number?\""
    },
    {
      "type": "paragraph",
      "text": "You can decide today\u2014by reading the **contracts** like they're plot-critical, not like they're decoration."
    }
  ],
  "relatedLinks": [
    {
      "title": "Word count for novels and children's books FAQ",
      "url": "https://writequeryhook.com/blog/word-count-for-novels-and-children-s-books-faq"
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
      "@id": "https://writequeryhook.com/blog/advances-vs-royalties-traditional-publishing-s-earn-out-headache-vs-self#breadcrumb",
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
          "name": "Advances vs royalties: traditional publishing's earn-out headache vs self-publishing's platform math",
          "item": "https://writequeryhook.com/blog/advances-vs-royalties-traditional-publishing-s-earn-out-headache-vs-self"
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": "https://writequeryhook.com/blog/advances-vs-royalties-traditional-publishing-s-earn-out-headache-vs-self#webpage",
      "url": "https://writequeryhook.com/blog/advances-vs-royalties-traditional-publishing-s-earn-out-headache-vs-self",
      "name": "Advances vs royalties: traditional publishing's earn-out headache vs self-publishing's platform math",
      "isPartOf": {
        "@id": "https://writequeryhook.com/#website"
      },
      "inLanguage": "en-US",
      "primaryImageOfPage": {
        "@id": "https://writequeryhook.com/blog/advances-vs-royalties-traditional-publishing-s-earn-out-headache-vs-self#primaryimage"
      },
      "breadcrumb": {
        "@id": "https://writequeryhook.com/blog/advances-vs-royalties-traditional-publishing-s-earn-out-headache-vs-self#breadcrumb"
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
      "@id": "https://writequeryhook.com/blog/advances-vs-royalties-traditional-publishing-s-earn-out-headache-vs-self#article",
      "isPartOf": {
        "@id": "https://writequeryhook.com/blog/advances-vs-royalties-traditional-publishing-s-earn-out-headache-vs-self#webpage"
      },
      "mainEntityOfPage": "https://writequeryhook.com/blog/advances-vs-royalties-traditional-publishing-s-earn-out-headache-vs-self",
      "headline": "Advances vs royalties: traditional publishing's earn-out headache vs self-publishing's platform math",
      "alternativeHeadline": "Advances vs royalties: traditional publishing\u2019s earn-out headache vs self-publishing\u2019s platform math",
      "description": "You know the vibe: traditional publishing says, \"Here's an advance!\" and then, two minutes later, whispers, \"Cool cool\u2014now wait for the book to earn it back first. We'll do royalties after.\"",
      "wordCount": 1530,
      "timeRequired": "PT8M",
      "articleSection": "Querying",
      "keywords": [
        "industry literacy",
        "publishing business",
        "querying",
        "payment timing",
        "earn-out",
        "risk",
        "contract fine print",
        "no advance",
        "returns",
        "platform royalties",
        "calculator-brain",
        "stress"
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
        "@id": "https://writequeryhook.com/blog/advances-vs-royalties-traditional-publishing-s-earn-out-headache-vs-self#primaryimage"
      },
      "datePublished": "2027-08-13",
      "dateModified": "2027-08-13",
      "mentions": [
        {
          "@type": "WebPage",
          "name": "Word count for novels and children's books FAQ",
          "url": "https://writequeryhook.com/blog/word-count-for-novels-and-children-s-books-faq"
        },
        {
          "@type": "WebPage",
          "name": "Types of novels FAQ: genre, literary, and mainstream (explained for writers)",
          "url": "https://writequeryhook.com/blog/types-of-novels-faq-genre-literary-and-mainstream-explained-for-writers"
        },
        {
          "@type": "WebPage",
          "name": "How can you market your book effectively? FAQ for self-published authors",
          "url": "https://writequeryhook.com/blog/how-can-you-market-your-book-effectively-faq-for-self-published-authors"
        },
        {
          "@type": "WebPage",
          "name": "Breaking down small press publishing: what it is, when to submit, and what you're trading",
          "url": "https://writequeryhook.com/blog/breaking-down-small-press-publishing-what-it-is-when-to-submit-and-what-you-re"
        }
      ]
    },
    {
      "@type": "ImageObject",
      "@id": "https://writequeryhook.com/blog/advances-vs-royalties-traditional-publishing-s-earn-out-headache-vs-self#primaryimage",
      "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_36/day_503/advances-vs-royalties-traditional-publishing-s-earn-out-headache-vs-self/blog/blog_hero_book_contract_eye_roll_blog_hero_landscape_c3c6d8ced560.jpeg?updatedAt=1782311859006",
      "width": 6390,
      "height": 4790,
      "caption": "blog hero \u00b7 book contract eye roll",
      "creditText": "Ana Claudia Quevedo Estrada",
      "author": {
        "@type": "Person",
        "name": "Ana Claudia Quevedo Estrada",
        "url": "https://www.pexels.com/@ana-claudia-quevedo-estrada-922193"
      },
      "@context": "https://schema.org"
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": "https://writequeryhook.com/blog/advances-vs-royalties-traditional-publishing-s-earn-out-headache-vs-self#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What's the difference between an advance and a royalty?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "An advance is money paid upfront by a publisher based on expected long-term earnings. A royalty is a percentage of actual sales paid to the author. In traditional publishing, those two are connected through the \"against royalties\" earn-out system."
          }
        },
        {
          "@type": "Question",
          "name": "Do traditional publishers pay royalties immediately after publication?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Usually not. Royalties often begin only after the book earns enough to \"earn out\" the advance\u2014so you might wait before any royalty payments show up as cash to you."
          }
        },
        {
          "@type": "Question",
          "name": "How are traditional advances paid out?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The contract controls the advance amount and schedule. Many publishers pay portions at signing, delivery, or final acceptance/approval milestones. The exact steps are not universal; the contract tells the truth."
          }
        },
        {
          "@type": "Question",
          "name": "What royalty rates can authors expect in traditional publishing versus self-publishing?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Traditional publishing royalty rates commonly range from 1% to 20%, depending on format and contract terms. Self-publishing royalties percentage range is often much higher, commonly 30% to 70%, depending on the platform agreement and format."
          }
        },
        {
          "@type": "Question",
          "name": "Can returns reduce what an author earns?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. If books are returned, the publisher may deduct amounts from royalties. Authors should read the contract language for how returns are handled and what gets deducted before payments are calculated."
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
