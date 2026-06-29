import type { Metadata } from 'next';
import { Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BlogBackLink } from '@/components/blog/BlogBackLink';

const PAGE_DATA = {
  "slug": "querying-one-mswl-at-a-time-vs-the-research-binge-alternatives-and-why-your",
  "title": "Querying one MSWL at a time vs the \"research-binge\" alternatives (and why your anxiety still shows up)",
  "description": "The dumbest part of the whole thing is that I'd done the prep. I mean, I went full research gremlin: agent lists, MSWLs, \"what to submit first,\" \"what to put in the query,\" all of it.",
  "readTime": "8 min read",
  "publishedDate": "2027-04-21",
  "modifiedDate": "2027-04-21",
  "canonicalUrl": "https://writequeryhook.com/blog/querying-one-mswl-at-a-time-vs-the-research-binge-alternatives-and-why-your",
  "siteUrl": "https://writequeryhook.com",
  "siteName": "Write Query Hook",
  "locale": "en-US",
  "articleSection": "Querying",
  "keywords": [
    "slush mental game",
    "querying",
    "revision",
    "sanity-saving",
    "spreadsheet",
    "decision fatigue",
    "pacing",
    "nerves",
    "workflow",
    "speed",
    "momentum",
    "ledge"
  ],
  "author": null,
  "hero": {
    "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_26/day_363/querying-one-mswl-at-a-time-vs-the-research-binge-alternatives-and-why-your/blog/blog_hero_almost_killed_me_adrenaline_blog_hero_landscape_a0353f5955ba.jpeg",
    "alt": "blog hero \u00b7 almost-killed-me adrenaline",
    "width": 6000,
    "height": 4000,
    "creator": "David Rama",
    "creatorUrl": "https://www.pexels.com/@phreewil",
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
      "name": "Querying one MSWL at a time vs the \"research-binge\" alternatives (and why your anxiety still shows up)",
      "item": "https://writequeryhook.com/blog/querying-one-mswl-at-a-time-vs-the-research-binge-alternatives-and-why-your"
    }
  ],
  "tldrBlocks": [],
  "openingBlocks": [],
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
            "Querying **one MSWL** at a time beats the \"send randomly while you research\" approach for steady momentum.",
            "Research helps, but **you still need a workflow** that treats anxiety like part of the job.",
            "The best systems answer two questions: **what do agents look for in query inboxes** and what do we do *next* after edits.",
            "If your \"plan\" is mostly reading, you'll stall at the moment of **submissions** because you never built a decision rhythm.",
            "A process that includes **how to organize querying research notes** lowers avoidable mistakes and makes querying less painful and more effective.",
            "You'll query better (and panic less) when **querying process from start to finish** is documented like receipts."
          ]
        }
      ],
      "image": null
    },
    {
      "section_id": "h2_opening",
      "heading": "Opening",
      "heading_slug": "opening",
      "keyword_key": "h2_opening",
      "keywords": [],
      "blocks": [
        {
          "type": "paragraph",
          "text": "The dumbest part of the whole thing is that I'd done the prep. I mean, I went full research gremlin: agent lists, MSWLs, \"what to submit first,\" \"what to put in the query,\" all of it."
        },
        {
          "type": "paragraph",
          "text": "When the moment came to start **querying** for real\u2014actual **manuscript** sentences headed toward other people's **agents**\u2014my body acted like I was about to jump off something tall with no plan for falling. Not metaphorically. Like, cursor-blinking panic. Like, \"haha, no\" energy, except it wasn't funny."
        },
        {
          "type": "paragraph",
          "text": "Sound familiar? Great. Because this comparison is here for the exact flavor of freak-out that research-bingers get: you learn enough to be dangerous\u2026 and still feel irrational dread when you start **submissions**."
        },
        {
          "type": "paragraph",
          "text": "We're comparing one method\u2014**querying one MSWL at a time**\u2014against the common alternatives: the research-binge chaos strategy and the \"wait until you feel ready\" stall. One of these gives you footing. The others keep you standing at the edge, debating whether gravity is personal."
        },
        {
          "type": "paragraph",
          "text": "And yes, we're doing it with comedic relatability, because your brain deserves to be mocked a little while it's trying to ruin your **edits**-to-query transition."
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_26/day_363/querying-one-mswl-at-a-time-vs-the-research-binge-alternatives-and-why-your/blog/blog_section_image_opening_blog_section_landscape_46ec4fdae3f4.gif",
        "alt": "Opening",
        "width": 279,
        "height": 200,
        "creator": "Giphy",
        "creatorUrl": "https://giphy.com/gifs/fight-club-edward-norton-writing-Y5ytdl4PXziZW",
        "provider": "giphy",
        "role": "section"
      }
    },
    {
      "section_id": "h2_side_by_side_the_competing_approaches",
      "heading": "Side-by-side: the competing approaches",
      "heading_slug": "side-by-side-the-competing-approaches",
      "keyword_key": "h2_side_by_side_the_competing_approaches",
      "keywords": [],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Here's the fast map before we get into the weeds."
        },
        {
          "type": "paragraph",
          "text": "| Approach | What it feels like | Biggest strength | Biggest failure mode | |---|---|---|---| | **MSWL one-at-a-time** | Slow-burn control, steady breath | Clear decision rhythm; fewer avoidable mistakes | Takes discipline; you can't \"wing it\" | | **Research-binge + send later** | Helpful\u2026 then paralyzing | Lots of info; possible better targeting | You postpone the actual step that scares you | | **Wait-for-confidence** | \"Almost done\" forever | None, except comfort | Anxiety stays because the job never happens |"
        },
        {
          "type": "paragraph",
          "text": "Now let's earn the verdict."
        }
      ],
      "image": null
    },
    {
      "section_id": "h2_sanity_and_speed",
      "heading": "Sanity and speed",
      "heading_slug": "sanity-and-speed",
      "keyword_key": "h2_sanity_and_speed",
      "keywords": [
        "anxiety",
        "speed",
        "momentum",
        "ledge",
        "footing",
        "slow-burn",
        "control",
        "breath"
      ],
      "blocks": [
        {
          "type": "subheading",
          "text": "Querying one MSWL at a time"
        },
        {
          "type": "paragraph",
          "text": "This method creates a simple cadence: pick one list (one MSWL), do the best work you can for that batch, then move. You're not trying to conquer the entire **querying process from start to finish** in one sitting. You're doing the next right action in a way your nervous system can tolerate."
        },
        {
          "type": "paragraph",
          "text": "So when you're asking **how to start querying after edits**, the answer isn't \"after you feel perfect.\" It's \"after you've turned edits into a concrete outgoing sequence.\" That's the footing. That's the weirdly comforting part: you can point at the next target and say, \"That's what I'm doing.\""
        },
        {
          "type": "paragraph",
          "text": "Because you're not hopping between random research tracks, you avoid the panic loop: read more, learn more, stall harder, then finally try to send while still mentally in research mode."
        },
        {
          "type": "subheading",
          "text": "Research-binge + send later"
        },
        {
          "type": "paragraph",
          "text": "This is the trap of \"I'll start when I'm done researching.\" It feels responsible. It's also a time bomb."
        },
        {
          "type": "paragraph",
          "text": "You get the dopamine hit from organizing. Then you delay the actual submission action because it's still scary, and the scariest part is not knowing what to do next. So you keep reading, refining notes, buying yourself time."
        },
        {
          "type": "paragraph",
          "text": "Eventually your research becomes a fog machine. You have lots of data, but no decision rhythm. That's why it fails even when you're knowledgeable."
        },
        {
          "type": "subheading",
          "text": "Verdict in this category"
        },
        {
          "type": "paragraph",
          "text": "MSWL one-at-a-time is the one with footing. Research-binge is the one that turns \"prepared\" into \"stuck.\""
        }
      ],
      "image": null
    },
    {
      "section_id": "h2_what_you_track",
      "heading": "What you track (and why anxiety hates receipts)",
      "heading_slug": "what-you-track-and-why-anxiety-hates-receipts",
      "keyword_key": "h2_what_you_track",
      "keywords": [
        "notes",
        "tracking",
        "color-coding",
        "uncertainty",
        "receipts",
        "agents",
        "submissions",
        "proof"
      ],
      "blocks": [
        {
          "type": "subheading",
          "text": "Querying one MSWL at a time"
        },
        {
          "type": "paragraph",
          "text": "This system is built around organization, not vibes. You track what matters so you're not inventing decisions on the fly."
        },
        {
          "type": "paragraph",
          "text": "You're doing things like:"
        },
        {
          "type": "list",
          "items": [
            "noting which agents are open and why you're targeting them",
            "keeping a shortlist of matching **manuscript** elements (themes, comps you can defend, audience fit)",
            "documenting what you changed after each **edits** pass so you're not rereading your own work like a stranger"
          ]
        },
        {
          "type": "paragraph",
          "text": "Most importantly, you answer \"what now?\" repeatedly. That's **how to reduce anxiety when querying**: by giving nerves a job to remind you to follow the workflow."
        },
        {
          "type": "subheading",
          "text": "Research-binge + send later"
        },
        {
          "type": "paragraph",
          "text": "Research-binge tends to generate notes you can't use under pressure. It's the difference between \"I learned stuff\" and \"I can immediately choose what to do next.\""
        },
        {
          "type": "paragraph",
          "text": "You end up with spreadsheets full of good intentions but no clear \"send order.\" Your notes are too broad to translate into concrete submission decisions."
        },
        {
          "type": "paragraph",
          "text": "When you finally sit down to write query letters, your brain goes hunting for certainty you don't actually have. Anxiety loves that. It gets to feel busy while you do nothing."
        },
        {
          "type": "subheading",
          "text": "Wait-for-confidence"
        },
        {
          "type": "paragraph",
          "text": "Confidence doesn't arrive on schedule. If it's your gatekeeper, you're always one draft revision away from never starting."
        },
        {
          "type": "paragraph",
          "text": "Anxiety doesn't care that you've read about the process. It cares that you're about to press the send button and become real to someone else's inbox."
        },
        {
          "type": "subheading",
          "text": "Verdict in this category"
        },
        {
          "type": "paragraph",
          "text": "MSWL one-at-a-time wins because it forces **how to organize querying research notes** into something you can act on. Receipts beat daydreaming."
        }
      ],
      "image": null
    },
    {
      "section_id": "h2_research_style",
      "heading": "Research style: curated vs endless",
      "heading_slug": "research-style-curated-vs-endless",
      "keyword_key": "h2_research_style",
      "keywords": [
        "research-binge",
        "learning",
        "rabbit-hole",
        "boundaries",
        "curated",
        "organized",
        "confidence",
        "calm"
      ],
      "blocks": [
        {
          "type": "subheading",
          "text": "Querying one MSWL at a time"
        },
        {
          "type": "paragraph",
          "text": "This approach treats research like a tool, not a lifestyle. You're not collecting everything. You're collecting what helps with the next batch."
        },
        {
          "type": "paragraph",
          "text": "So when you're figuring out **how to start querying after edits**, you also decide what \"enough\" means:"
        },
        {
          "type": "list",
          "items": [
            "enough matching logic to avoid scattershot targeting",
            "enough clarity on **what agents look for in query inboxes**",
            "enough organization to avoid dumb mistakes"
          ]
        },
        {
          "type": "paragraph",
          "text": "Your research stops being the main event. Querying does. Anxiety has to join the work instead of hijacking it."
        },
        {
          "type": "subheading",
          "text": "Research-binge + send later"
        },
        {
          "type": "paragraph",
          "text": "This lets you build a second procrastination job. Research isn't bad\u2014the alternative lets you postpone the step that produces movement."
        },
        {
          "type": "paragraph",
          "text": "You keep chasing the comfort of \"I'm nearly ready,\" then **edits** stretch into \"still not ready,\" and suddenly you're back in revision brain instead of submission brain."
        },
        {
          "type": "subheading",
          "text": "Verdict in this category"
        },
        {
          "type": "paragraph",
          "text": "Curated research for a specific MSWL beats research-binge every time."
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_26/day_363/querying-one-mswl-at-a-time-vs-the-research-binge-alternatives-and-why-your/blog/blog_section_image_research_binge_learning_blog_section_landscape_4b617d007eef.jpeg?updatedAt=1781851746710",
        "alt": "Research style: curated vs endless",
        "width": 6000,
        "height": 4000,
        "creator": "Tima Miroshnichenko",
        "creatorUrl": "https://www.pexels.com/@tima-miroshnichenko",
        "provider": "pexels",
        "role": "section"
      }
    },
    {
      "section_id": "h2_privacy_and_public_documentation",
      "heading": "Privacy and public documentation",
      "heading_slug": "privacy-and-public-documentation",
      "keyword_key": "h2_privacy_and_public_documentation",
      "keywords": [
        "transparency",
        "privacy",
        "blur",
        "documenting",
        "comedy-relief",
        "vulnerability",
        "boundaries",
        "diary"
      ],
      "blocks": [
        {
          "type": "subheading",
          "text": "Querying one MSWL at a time"
        },
        {
          "type": "paragraph",
          "text": "This is where the WQH angle shows up loud and clear: emotional honesty paired with process transparency."
        },
        {
          "type": "paragraph",
          "text": "You can document **querying process from start to finish**\u2014what you targeted, what you changed, what you learned\u2014while blurring identifying details to protect privacy. That's not just \"content.\" It's a mental health strategy."
        },
        {
          "type": "paragraph",
          "text": "When you're scared, you want to believe you're alone. Documentation says: no, you're not alone\u2014you're doing the work, one batch at a time, and it's learnable."
        },
        {
          "type": "paragraph",
          "text": "Because you're doing MSWL one-at-a-time, your public notes become coherent. Readers can actually follow the chain from edits \u2192 decisions \u2192 submissions."
        },
        {
          "type": "subheading",
          "text": "Research-binge + send later"
        },
        {
          "type": "paragraph",
          "text": "Research-binge is hard to document cleanly because nothing is stable. One day you're \"researching,\" the next day you're sending, the next day you're re-researching."
        },
        {
          "type": "paragraph",
          "text": "It's a messy narrative arc. Messy narrative arcs are great for anxiety. They look like progress from far away and feel like chaos up close."
        },
        {
          "type": "subheading",
          "text": "Verdict in this category"
        },
        {
          "type": "paragraph",
          "text": "MSWL one-at-a-time creates the right structure for transparency without turning your inbox into a full-body panic documentary."
        },
        {
          "type": "blockquote",
          "text": "\"Research can prepare you\u2014but it doesn't erase the nerves. So build a system that tells your brain what to do when it freaks out.\""
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
          "text": "**Pick querying one MSWL at a time.** It's the clear winner for writers who finish **edits** and then get ambushed by anxiety the second the first real **submission** happens."
        },
        {
          "type": "paragraph",
          "text": "The research-binge alternative can help you target better, but it doesn't solve the real problem: you still need a repeatable decision rhythm for the inbox moment. And \"wait for confidence\" is just anxiety wearing a polite outfit."
        },
        {
          "type": "paragraph",
          "text": "MSWL one-at-a-time gives you:"
        },
        {
          "type": "list",
          "items": [
            "a usable **querying process from start to finish**",
            "a concrete answer to **how to start querying after edits**",
            "a real way to **how to reduce anxiety when querying** (not by erasing nerves, by managing them)",
            "better alignment between what you learned and what you send"
          ]
        },
        {
          "type": "paragraph",
          "text": "Also: your future self will thank you when you need to figure out why a batch went one way instead of another."
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_26/day_363/querying-one-mswl-at-a-time-vs-the-research-binge-alternatives-and-why-your/blog/blog_section_image_the_verdict_blog_section_landscape_7042b0dd96e1.gif",
        "alt": "The verdict",
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
      "title": "Progress FAQ: How to Measure Incremental Writing Growth (Without Losing Your Mind)",
      "url": "https://writequeryhook.com/blog/progress-faq-how-to-measure-incremental-writing-growth-without-losing-your-mind"
    },
    {
      "title": "When Should You Nudge Agents? A Query Follow-Up FAQ",
      "url": "https://writequeryhook.com/blog/when-should-you-nudge-agents-a-query-follow-up-faq"
    },
    {
      "title": "Ghosting, rejection, and motivation: a querying FAQ for when publishing feels unfair",
      "url": "https://writequeryhook.com/blog/ghosting-rejection-and-motivation-a-querying-faq-for-when-publishing-feels"
    },
    {
      "title": "Writing contests: build a growth mindset that survives draft hope and result whiplash",
      "url": "https://writequeryhook.com/blog/writing-contests-build-a-growth-mindset-that-survives-draft-hope-and-result"
    }
  ],
  "alsoLikeAfterIndex": 3,
  "faq": [
    {
      "question": "When should a writer begin querying?",
      "answer": "Begin querying after you've completed a first draft and finished meaningful edits, then you're ready to transition into action. The move is a deliberate phase change\u2014\"next milestone\"\u2014not an automatic reflex."
    },
    {
      "question": "Does research and industry knowledge remove querying anxiety?",
      "answer": "No. Even with years of learning, you can still panic when you're about to send. Knowledge helps you target better and reduces avoidable mistakes, but it doesn't erase nerves."
    },
    {
      "question": "Why does prior publishing experience not guarantee confidence?",
      "answer": "Because each new manuscript comes with different stakes. Genre fit, current market realities, and timing can make one book feel uniquely risky even if you've been published before."
    },
    {
      "question": "What approach does the writer use to handle the querying process?",
      "answer": "They use multiple research sources plus structured organization\u2014often spreadsheets and color-coded notes\u2014so they're not \"diving headfirst.\" That organization is how you organize querying research notes into decisions instead of scattered information."
    },
    {
      "question": "Will the writer share their querying journey publicly?",
      "answer": "Yes. They plan to blog the journey from start to finish, while blurring identifying details to protect privacy."
    }
  ],
  "closingBlocks": [
    {
      "type": "paragraph",
      "text": "Choose the method that gets your work into the world without requiring you to feel fearless first. If your current plan is mostly reading, stop rewarding your brain for stalling."
    },
    {
      "type": "paragraph",
      "text": "One MSWL batch today is how you turn panic into a process\u2014and make **querying** less painful and more effective, one decision at a time."
    }
  ],
  "relatedLinks": [
    {
      "title": "Progress FAQ: How to Measure Incremental Writing Growth (Without Losing Your Mind)",
      "url": "https://writequeryhook.com/blog/progress-faq-how-to-measure-incremental-writing-growth-without-losing-your-mind"
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
      "@id": "https://writequeryhook.com/blog/querying-one-mswl-at-a-time-vs-the-research-binge-alternatives-and-why-your#breadcrumb",
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
          "name": "Querying one MSWL at a time vs the \"research-binge\" alternatives (and why your anxiety still shows up)",
          "item": "https://writequeryhook.com/blog/querying-one-mswl-at-a-time-vs-the-research-binge-alternatives-and-why-your"
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": "https://writequeryhook.com/blog/querying-one-mswl-at-a-time-vs-the-research-binge-alternatives-and-why-your#webpage",
      "url": "https://writequeryhook.com/blog/querying-one-mswl-at-a-time-vs-the-research-binge-alternatives-and-why-your",
      "name": "Querying one MSWL at a time vs the \"research-binge\" alternatives (and why your anxiety still shows up)",
      "isPartOf": {
        "@id": "https://writequeryhook.com/#website"
      },
      "inLanguage": "en-US",
      "primaryImageOfPage": {
        "@id": "https://writequeryhook.com/blog/querying-one-mswl-at-a-time-vs-the-research-binge-alternatives-and-why-your#primaryimage"
      },
      "breadcrumb": {
        "@id": "https://writequeryhook.com/blog/querying-one-mswl-at-a-time-vs-the-research-binge-alternatives-and-why-your#breadcrumb"
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
      "@id": "https://writequeryhook.com/blog/querying-one-mswl-at-a-time-vs-the-research-binge-alternatives-and-why-your#article",
      "isPartOf": {
        "@id": "https://writequeryhook.com/blog/querying-one-mswl-at-a-time-vs-the-research-binge-alternatives-and-why-your#webpage"
      },
      "mainEntityOfPage": "https://writequeryhook.com/blog/querying-one-mswl-at-a-time-vs-the-research-binge-alternatives-and-why-your",
      "headline": "Querying one MSWL at a time vs the \"research-binge\" alternatives (and why your anxiety still shows up)",
      "alternativeHeadline": "Querying one MSWL at a time vs the \"research-binge\" alternatives (and why your anxiety still shows up)",
      "description": "The dumbest part of the whole thing is that I'd done the prep. I mean, I went full research gremlin: agent lists, MSWLs, \"what to submit first,\" \"what to put in the query,\" all of it.",
      "wordCount": 1642,
      "timeRequired": "PT8M",
      "articleSection": "Querying",
      "keywords": [
        "slush mental game",
        "querying",
        "revision",
        "sanity-saving",
        "spreadsheet",
        "decision fatigue",
        "pacing",
        "nerves",
        "workflow",
        "speed",
        "momentum",
        "ledge"
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
        "@id": "https://writequeryhook.com/blog/querying-one-mswl-at-a-time-vs-the-research-binge-alternatives-and-why-your#primaryimage"
      },
      "datePublished": "2027-04-21",
      "dateModified": "2027-04-21",
      "mentions": [
        {
          "@type": "WebPage",
          "name": "Progress FAQ: How to Measure Incremental Writing Growth (Without Losing Your Mind)",
          "url": "https://writequeryhook.com/blog/progress-faq-how-to-measure-incremental-writing-growth-without-losing-your-mind"
        },
        {
          "@type": "WebPage",
          "name": "When Should You Nudge Agents? A Query Follow-Up FAQ",
          "url": "https://writequeryhook.com/blog/when-should-you-nudge-agents-a-query-follow-up-faq"
        },
        {
          "@type": "WebPage",
          "name": "Ghosting, rejection, and motivation: a querying FAQ for when publishing feels unfair",
          "url": "https://writequeryhook.com/blog/ghosting-rejection-and-motivation-a-querying-faq-for-when-publishing-feels"
        },
        {
          "@type": "WebPage",
          "name": "Writing contests: build a growth mindset that survives draft hope and result whiplash",
          "url": "https://writequeryhook.com/blog/writing-contests-build-a-growth-mindset-that-survives-draft-hope-and-result"
        }
      ]
    },
    {
      "@type": "ImageObject",
      "@id": "https://writequeryhook.com/blog/querying-one-mswl-at-a-time-vs-the-research-binge-alternatives-and-why-your#primaryimage",
      "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_26/day_363/querying-one-mswl-at-a-time-vs-the-research-binge-alternatives-and-why-your/blog/blog_hero_almost_killed_me_adrenaline_blog_hero_landscape_a0353f5955ba.jpeg",
      "width": 6000,
      "height": 4000,
      "caption": "blog hero \u00b7 almost-killed-me adrenaline",
      "creditText": "David Rama",
      "author": {
        "@type": "Person",
        "name": "David Rama",
        "url": "https://www.pexels.com/@phreewil"
      },
      "@context": "https://schema.org"
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": "https://writequeryhook.com/blog/querying-one-mswl-at-a-time-vs-the-research-binge-alternatives-and-why-your#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "When should a writer begin querying?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Begin querying after you've completed a first draft and finished meaningful edits, then you're ready to transition into action. The move is a deliberate phase change\u2014\"next milestone\"\u2014not an automatic reflex."
          }
        },
        {
          "@type": "Question",
          "name": "Does research and industry knowledge remove querying anxiety?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. Even with years of learning, you can still panic when you're about to send. Knowledge helps you target better and reduces avoidable mistakes, but it doesn't erase nerves."
          }
        },
        {
          "@type": "Question",
          "name": "Why does prior publishing experience not guarantee confidence?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Because each new manuscript comes with different stakes. Genre fit, current market realities, and timing can make one book feel uniquely risky even if you've been published before."
          }
        },
        {
          "@type": "Question",
          "name": "What approach does the writer use to handle the querying process?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "They use multiple research sources plus structured organization\u2014often spreadsheets and color-coded notes\u2014so they're not \"diving headfirst.\" That organization is how you organize querying research notes into decisions instead of scattered information."
          }
        },
        {
          "@type": "Question",
          "name": "Will the writer share their querying journey publicly?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. They plan to blog the journey from start to finish, while blurring identifying details to protect privacy."
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
