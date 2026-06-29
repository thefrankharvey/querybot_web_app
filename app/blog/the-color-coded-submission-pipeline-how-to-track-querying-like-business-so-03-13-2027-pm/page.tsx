import type { Metadata } from 'next';
import { Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BlogBackLink } from '@/components/blog/BlogBackLink';

const PAGE_DATA = {
  "slug": "the-color-coded-submission-pipeline-how-to-track-querying-like-business-so",
  "title": "The color-coded submission pipeline: how to track querying like business so rejection stops hurting",
  "description": "The first time a rejection lands while you're still half-learning how querying actually works, it feels personal in a way that is stupid and unfair. Not because you're weak. Because your brain doesn't know the difference between \"this agent said no\" and \"my career is over.\" It just sees a red notification and latches on.",
  "readTime": "11 min read",
  "publishedDate": "2027-03-13",
  "modifiedDate": "2027-03-13",
  "canonicalUrl": "https://writequeryhook.com/blog/the-color-coded-submission-pipeline-how-to-track-querying-like-business-so",
  "siteUrl": "https://writequeryhook.com",
  "siteName": "Write Query Hook",
  "locale": "en-US",
  "articleSection": "Querying",
  "keywords": [
    "slush mental game",
    "submissions",
    "revision",
    "rejection",
    "spreadsheet",
    "momentum",
    "batch querying",
    "color coding",
    "tracking",
    "inbox clutter",
    "pipeline",
    "indignation"
  ],
  "author": null,
  "hero": {
    "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_23/day_314/the-color-coded-submission-pipeline-how-to-track-querying-like-business-so/blog/blog_hero_dread_rejection_blog_hero_landscape_f9241ac9468f.jpeg",
    "alt": "blog hero \u00b7 dread rejection",
    "width": 10800,
    "height": 6334,
    "creator": "Monstera Production",
    "creatorUrl": "https://www.pexels.com/@gabby-k",
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
      "name": "The color-coded submission pipeline: how to track querying like business so rejection stops hurting",
      "item": "https://writequeryhook.com/blog/the-color-coded-submission-pipeline-how-to-track-querying-like-business-so"
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
            "Treat querying as a business process: queries sent \u2192 responses received, and rejection is data, not a verdict.",
            "Set up one **how to track manuscript submissions spreadsheet** *before* you launch a big batch, so you never \"remember later\" and then lose the thread.",
            "Use a **color coded query tracker system** with fit status + response status that forces you to take the next step, not spiral.",
            "Send queries in controlled batches (think around ten in flight) so responses arrive while your momentum is intact.",
            "Keep **email folders for agent query responses** so follow-ups don't get buried in \"later\" and you don't lose commitments.",
            "When a rejection email hits, mark it as rejected immediately and query someone else right away\u2014no double taps, no guilt.",
            "If your manuscript still isn't ready, no spreadsheet can save you. Finish revisions and get real feedback first."
          ]
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_23/day_314/the-color-coded-submission-pipeline-how-to-track-querying-like-business-so/blog/blog_section_image_tldr_blog_section_landscape_68c7ad182be6.gif",
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
      "section_id": "h2_opening",
      "heading": "Opening",
      "heading_slug": "opening",
      "keyword_key": "h2_opening",
      "keywords": [],
      "blocks": [
        {
          "type": "paragraph",
          "text": "The first time a rejection lands while you're still half-learning how querying actually works, it feels personal in a way that is stupid and unfair. Not because you're weak. Because your brain doesn't know the difference between **\"this agent said no\"** and **\"my career is over.\"** It just sees a red notification and latches on."
        },
        {
          "type": "paragraph",
          "text": "And then you open your email search box and realize you *can't tell* when you contacted that agent, what their submission rules were, or whether you already followed up once. The spreadsheet you meant to set up? Still a fantasy. The inbox? A junk drawer. You're not only rejected\u2014you're newly disorganized, and the sting multiplies."
        },
        {
          "type": "paragraph",
          "text": "OK pause. This is fixable. Not by telling yourself \"don't take it personally.\" That's like telling someone not to feel cold while they're standing outside in January. The fix is operational: a system that makes it hard for rejection to become identity, because it immediately turns into a next action."
        },
        {
          "type": "paragraph",
          "text": "This deep_dive is about one narrow concept: **how to track submissions so your emotional reaction gets routed into process.** A tracker doesn't erase rejection. It prevents the \"waiting\" part from turning into a fog that swallows your decisions."
        },
        {
          "type": "blockquote",
          "text": "\"A tracker turns 'waiting' into momentum.\" \u2014the part you can actually control"
        }
      ],
      "image": null
    },
    {
      "section_id": "h2_pipeline_state_and_rejection_data",
      "heading": "H2 Pipeline state and rejection data",
      "heading_slug": "h2-pipeline-state-and-rejection-data",
      "keyword_key": "h2_pipeline_state_and_rejection_data",
      "keywords": [
        "indignation",
        "data",
        "rejection",
        "identity",
        "businesslike",
        "relief",
        "spreadsheet",
        "next step"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Writers love drama. Agents love efficiency. The problem is that querying trains us to treat every \"no\" like a verdict instead of a step."
        },
        {
          "type": "paragraph",
          "text": "When you're still revising, still learning, still unsure which agents match your genre, rejection feels like the only feedback you're getting. But with a tracker in place, rejection becomes a label in your workflow: rejected \u2192 mark it \u2192 send the next query to a different agent."
        },
        {
          "type": "paragraph",
          "text": "That mindset doesn't happen because you read a motivational post. It happens because your tracker is already waiting to be updated, and your next query is already lined up. Businesslike. Annoying, but effective."
        },
        {
          "type": "paragraph",
          "text": "Here's what that looks like in practice:"
        },
        {
          "type": "list",
          "items": [
            "You keep agents categorized by fit level so \"fabulous fit\" gets prioritized first.",
            "You keep query status updated so you don't ask, \"Did I already submit there?\" every time your heart spikes.",
            "You keep notes on response timing (even rough ranges) so your follow-up decisions stop being vibes.",
            "You treat \"rejection email received\" as a trigger, not a mood."
          ]
        },
        {
          "type": "paragraph",
          "text": "This is where people get tempted to romanticize patience. Don't. Querying is not a meditation retreat. It's a batch-launch process. Send in batches. Send in waves. Send so you're not sitting there staring at a blank inbox for weeks."
        },
        {
          "type": "paragraph",
          "text": "Also: rejection sting reduces when you stop running the same emotional loop in the absence of information. A tracker is information."
        },
        {
          "type": "paragraph",
          "text": "You want proof that rejection is business, not worth? Here it is: the moment rejection arrives, you do not freeze. You immediately update the sheet and send the next query. If the rejection were destiny, you wouldn't be able to keep moving. You can."
        },
        {
          "type": "blockquote",
          "text": "\"Rejection is often business, not a verdict on your worth.\""
        },
        {
          "type": "paragraph",
          "text": "This is why the tracking system matters more than people think. It's how you convert the sting into motion. Understanding **how to reduce rejection sting during querying** means building a system where the sting has nowhere to land\u2014it converts straight into the next action."
        }
      ],
      "image": null
    },
    {
      "section_id": "h2_the_how_to_track_manuscript_submissions_spreadsheet_columns",
      "heading": "H2 The how to track manuscript submissions spreadsheet columns",
      "heading_slug": "h2-the-how-to-track-manuscript-submissions-spreadsheet-columns",
      "keyword_key": "h2_the_how_to_track_manuscript_submissions_spreadsheet_columns",
      "keywords": [
        "anxiety",
        "columns",
        "rules",
        "response timeline",
        "tracking",
        "mistakes",
        "notes",
        "tabs"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Let's get concrete. If we're doing **how to track manuscript submissions spreadsheet**, then we're doing columns. Not \"use a tracker\" as an abstract idea."
        },
        {
          "type": "paragraph",
          "text": "Your spreadsheet needs to store two categories of truth:"
        },
        {
          "type": "paragraph",
          "text": "1. **Contact + submission rules truth** (so you don't break instructions or re-query the wrong person) 2. **Response + timeline truth** (so you follow up with dates instead of hope)"
        },
        {
          "type": "paragraph",
          "text": "A practical **spreadsheet** layout looks like this (you can copy this structure into your own file):"
        },
        {
          "type": "list",
          "items": [
            "Agent/Submission target name",
            "Agency name (if different)",
            "Genre + subgenre tags (so you don't query the wrong kind of agent later)",
            "Comp titles / comp notes (whatever you used for your alignment)",
            "Fit level (for example: fabulous fit / strong fit / borderline)",
            "Status (not just \"sent\"\u2014think queried, requested, partial/full requested, withdrawn, rejected, no response yet)",
            "Date sent",
            "Initial response time window (optional but helpful, e.g., \"responded ~10\u201320 days\" once you have data)",
            "Follow-up date (calculated or manually set)",
            "Rejection date (date you received it, not when you \"felt sad about it\")",
            "Notes / interesting tidbits (the stuff you only learn from doing the research and reading their guidelines carefully)"
          ]
        },
        {
          "type": "paragraph",
          "text": "Yes, that means you're maintaining it while you're also revising. That's the point: you collect research targets while you're still in revision cycles, not after you've wrapped everything and realized \"agent research is time-intensive.\""
        },
        {
          "type": "paragraph",
          "text": "One more narrow rule: create a consistent status vocabulary now, and never improvise later. If one column says \"submitted\" and another column later says \"sent,\" you've created two truths for the same reality. That's how tracking systems become stress machines."
        },
        {
          "type": "paragraph",
          "text": "If you want this to work emotionally too, add one column that forces action:"
        },
        {
          "type": "list",
          "items": [
            "Next action (examples: \"follow-up,\" \"wait,\" \"send new query,\" \"do nothing\u2014rejected,\" \"prepare materials\")"
          ]
        },
        {
          "type": "paragraph",
          "text": "The emotional payoff here is massive: when you feel the sting, your eyes land on \"next action,\" not \"blank spreadsheet.\" You're not solving uncertainty. You're following a prepared route."
        },
        {
          "type": "paragraph",
          "text": "And because we're being businesslike: if you're currently managing multiple manuscripts, your tracker should be able to filter by manuscript too. It works, even if it isn't glamorous."
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_23/day_314/the-color-coded-submission-pipeline-how-to-track-querying-like-business-so/blog/blog_section_image_anxiety_columns_blog_section_landscape_21ff49e551bc.gif",
        "alt": "H2 The how to track manuscript submissions spreadsheet columns",
        "width": 218,
        "height": 200,
        "creator": "Giphy",
        "creatorUrl": "https://giphy.com/gifs/panic-stressed-1FMaabePDEfgk",
        "provider": "giphy",
        "role": "section"
      }
    },
    {
      "section_id": "h2_color_coded_query_tracker_system_statuses_that_force_action",
      "heading": "H2 Color coded query tracker system statuses that force action",
      "heading_slug": "h2-color-coded-query-tracker-system-statuses-that-force-action",
      "keyword_key": "h2_color_coded_query_tracker_system_statuses_that_force_action",
      "keywords": [
        "color coding",
        "control",
        "momentum",
        "act fast",
        "dread",
        "checkmark",
        "color blocks",
        "follow-up"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "A color scheme is only useful if it drives decisions. Otherwise it's decoration, and we've all wasted time on decoration."
        },
        {
          "type": "paragraph",
          "text": "The **color coded query tracker system** that works has two independent layers of color:"
        },
        {
          "type": "paragraph",
          "text": "1. **Fit color** (how good a match the agent is for your project) 2. **Query status color** (what stage the submission is in)"
        },
        {
          "type": "paragraph",
          "text": "Fit color example:"
        },
        {
          "type": "list",
          "items": [
            "Green: fabulous fit",
            "Yellow: strong fit",
            "Orange/blue: borderline"
          ]
        },
        {
          "type": "paragraph",
          "text": "Status color example:"
        },
        {
          "type": "list",
          "items": [
            "Gray: queried / waiting",
            "Blue: request received (partial/full/anything else)",
            "Red: rejected",
            "Optional: \"response window ended\" in a neutral but noticeable color"
          ]
        },
        {
          "type": "paragraph",
          "text": "Now the important part: the colors must map to *behavior*."
        },
        {
          "type": "paragraph",
          "text": "When a rejection arrives:"
        },
        {
          "type": "list",
          "items": [
            "Your status changes to red immediately",
            "Your \"next action\" becomes \"send new query\"",
            "Your sheet prevents you from re-contacting that agent"
          ]
        },
        {
          "type": "paragraph",
          "text": "That \"mark rejected and move on\" habit is what stops the sting from turning into a doomsday narrative. You don't sit in \"Maybe they'll reply.\" You update reality."
        },
        {
          "type": "paragraph",
          "text": "And if you're wondering why you need fit color at all, it's because batch querying needs prioritization. If you send a whole wave of borderline agents first, you're training yourself to wait with low expectations. That's emotional self-sabotage, dressed up as \"casting a wide net.\""
        },
        {
          "type": "paragraph",
          "text": "A system can fix this by keeping fabulous fit at the top of the send queue."
        },
        {
          "type": "blockquote",
          "text": "\"Color-code your fit and your query status\u2014then act the moment you get an answer.\""
        },
        {
          "type": "paragraph",
          "text": "That line isn't poetic; it's operational. The moment you get an answer, you act. No \"thinky pause.\" No \"let me consider my feelings.\" Your job is updates + next query."
        },
        {
          "type": "subheading",
          "text": "H3 How to batch submit queries to agents"
        },
        {
          "type": "paragraph",
          "text": "Now, the batching piece. You'll see writers recommend sending everything at once. That feels productive until you have a month of silence, then six rejections on the same day, then no idea what triggered what."
        },
        {
          "type": "paragraph",
          "text": "Instead, use a pacing rule:"
        },
        {
          "type": "list",
          "items": [
            "Keep around ten queries in flight",
            "Send in controlled batches (ten at a time, for example)",
            "Mix response timeframes so replies arrive while you're still launching new ones",
            "Track each batch send date so you can monitor reply patterns"
          ]
        },
        {
          "type": "paragraph",
          "text": "**How to batch submit queries to agents** means treating each wave as a deliberate move, not a panic dump. When you send ten queries in week one, you're not waiting four weeks with zero feedback. You're sending ten more in week two while the first batch begins returning answers."
        },
        {
          "type": "paragraph",
          "text": "This is also why tracking needs to exist before you start. If you send queries in batches but don't record them cleanly, the whole batching strategy collapses and you're back to email-search panic."
        },
        {
          "type": "paragraph",
          "text": "Also: when someone says \"just wait,\" they mean \"feel your feelings in a corner.\" This system means you're not stuck in waiting\u2014you're working."
        }
      ],
      "image": null
    },
    {
      "section_id": "h2_email_folders_for_agent_query_responses_and_thread_safety",
      "heading": "H2 Email folders for agent query responses and thread safety",
      "heading_slug": "h2-email-folders-for-agent-query-responses-and-thread-safety",
      "keyword_key": "h2_email_folders_for_agent_query_responses_and_thread_safety",
      "keywords": [
        "inbox dread",
        "clutter",
        "lost thread",
        "folders",
        "follow-up dates",
        "calm",
        "search",
        "organization"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Your spreadsheet is the brain. Your inbox is the mess. And mess destroys follow-up discipline."
        },
        {
          "type": "paragraph",
          "text": "That's why you need **email folders for agent query responses**. Not one folder called \"Agents\" that becomes a landfill. Dedicated folders that mirror your submission logic."
        },
        {
          "type": "paragraph",
          "text": "A clean setup looks like:"
        },
        {
          "type": "list",
          "items": [
            "Agent-specific folders (or at least by agency/agent)",
            "Under each agent: subfolders for query, requested material, follow-up, rejection",
            "A separate \"To Follow Up\" label or folder (optional, but useful)"
          ]
        },
        {
          "type": "paragraph",
          "text": "The emotional goal is simple: when you need to send a follow-up or check a response, you shouldn't have to hunt. You open the folder, you see the thread, you know the date."
        },
        {
          "type": "paragraph",
          "text": "Here's what goes wrong without folders:"
        },
        {
          "type": "list",
          "items": [
            "You reply to the wrong email because multiple threads look similar",
            "You miss that you already followed up once",
            "You can't tell whether the agent requested a partial or full",
            "You lose context between \"submitted\" and \"received\""
          ]
        },
        {
          "type": "paragraph",
          "text": "This matters because response timing is uneven. Some agents answer fast, some take forever, and some never reply. Without thread safety, your system becomes inconsistent. And inconsistent systems lead to inconsistent behavior\u2014which is how writers accidentally double-query or miss follow-up windows."
        },
        {
          "type": "paragraph",
          "text": "Also, separate email folders reduce the sting in a sneaky way. When rejection arrives, it doesn't just live in the notification. It goes into the correct rejected thread area. You don't have to look at it across your inbox every time you check email. You contain it."
        },
        {
          "type": "paragraph",
          "text": "One more narrow tip that's boring but golden: keep filenames and saved PDFs consistent when you upload requested materials. You want \"AuthorName_Title_Partial_RequestedDate\" type consistency, not \"finalfinal2.\""
        },
        {
          "type": "paragraph",
          "text": "It's how you keep submissions organized without chaos."
        },
        {
          "type": "paragraph",
          "text": "And if you're wondering where to start, start with the folder structure before batch submitting. That way the first time you get a response, you don't improvise."
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_23/day_314/the-color-coded-submission-pipeline-how-to-track-querying-like-business-so/blog/blog_section_image_inbox_dread_clutter_blog_section_landscape_2a335c822257.jpeg?updatedAt=1781766892069",
        "alt": "H2 Email folders for agent query responses and thread safety",
        "width": 6465,
        "height": 4310,
        "creator": "Tara Winstead",
        "creatorUrl": "https://www.pexels.com/@tara-winstead",
        "provider": "pexels",
        "role": "section"
      }
    }
  ],
  "closingImage": null,
  "alsoLike": [
    {
      "title": "Pay attention to your progress: the boring measurement that keeps writers from quitting",
      "url": "https://writequeryhook.com/blog/pay-attention-to-your-progress-the-boring-measurement-that-keeps-writers-from"
    },
    {
      "title": "Nudge agents only when their published response rules run out (not when your anxiety does)",
      "url": "https://writequeryhook.com/blog/nudge-agents-only-when-their-published-response-rules-run-out-not-when-your"
    },
    {
      "title": "5 tips for if you feel like shit: sit with the discomfort (and keep writing)",
      "url": "https://writequeryhook.com/blog/5-tips-for-if-you-feel-like-shit-sit-with-the-discomfort-and-keep-writing"
    },
    {
      "title": "5 ways to survive the Dunning-Kruger effect for writers (or author despair syndrome) when feedback hits",
      "url": "https://writequeryhook.com/blog/5-ways-to-survive-the-dunning-kruger-effect-for-writers-or-author-despair"
    }
  ],
  "alsoLikeAfterIndex": 2,
  "faq": [
    {
      "question": "Q: What should a writer do before starting agent querying?",
      "answer": "Complete multiple revision cycles and get critique partners and beta readers involved so the manuscript is at its best. Then polish a professionally critiqued query letter. You can't spreadsheet your way out of a draft that's still wading."
    },
    {
      "question": "Q: How does the writer choose which agents to query?",
      "answer": "Find agents who represent your manuscript's genre, and compile a list of suitable targets. Categorize them by fit level so the best matches are prioritized first\u2014fabulous fit before borderline."
    },
    {
      "question": "Q: What's the purpose of a submissions spreadsheet?",
      "answer": "To store key details (contact info and submission rules), plus response timing and notes gathered during research. It also gives you a place to update statuses and follow-up dates so you stay organized during batch querying."
    },
    {
      "question": "Q: How should queries be sent to avoid waiting around?",
      "answer": "Send queries in batches (for example, groups of ten) and intentionally mix response timeframes so replies begin arriving at different times. The goal is to keep roughly ten queries in flight to maintain momentum."
    },
    {
      "question": "Q: What should happen after a rejection email is received?",
      "answer": "Immediately mark the agent as rejected in the spreadsheet and send a new query to another agent right away. Keep the rejected agent in the spreadsheet so you don't double-query later."
    }
  ],
  "closingBlocks": [
    {
      "type": "paragraph",
      "text": "Build the tracker so it turns rejection into a checkbox and a next action, not a personality test. Put fit and status on the sheet with colors that mean something, and keep your inbox contained with **email folders for agent query responses**. Then when the red email hits, you don't freeze\u2014you update, you send, and you keep the pipeline running."
    }
  ],
  "relatedLinks": [
    {
      "title": "Pay attention to your progress: the boring measurement that keeps writers from quitting",
      "url": "https://writequeryhook.com/blog/pay-attention-to-your-progress-the-boring-measurement-that-keeps-writers-from"
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
      "@id": "https://writequeryhook.com/blog/the-color-coded-submission-pipeline-how-to-track-querying-like-business-so#breadcrumb",
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
          "name": "The color-coded submission pipeline: how to track querying like business so rejection stops hurting",
          "item": "https://writequeryhook.com/blog/the-color-coded-submission-pipeline-how-to-track-querying-like-business-so"
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": "https://writequeryhook.com/blog/the-color-coded-submission-pipeline-how-to-track-querying-like-business-so#webpage",
      "url": "https://writequeryhook.com/blog/the-color-coded-submission-pipeline-how-to-track-querying-like-business-so",
      "name": "The color-coded submission pipeline: how to track querying like business so rejection stops hurting",
      "isPartOf": {
        "@id": "https://writequeryhook.com/#website"
      },
      "inLanguage": "en-US",
      "primaryImageOfPage": {
        "@id": "https://writequeryhook.com/blog/the-color-coded-submission-pipeline-how-to-track-querying-like-business-so#primaryimage"
      },
      "breadcrumb": {
        "@id": "https://writequeryhook.com/blog/the-color-coded-submission-pipeline-how-to-track-querying-like-business-so#breadcrumb"
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
      "@id": "https://writequeryhook.com/blog/the-color-coded-submission-pipeline-how-to-track-querying-like-business-so#article",
      "isPartOf": {
        "@id": "https://writequeryhook.com/blog/the-color-coded-submission-pipeline-how-to-track-querying-like-business-so#webpage"
      },
      "mainEntityOfPage": "https://writequeryhook.com/blog/the-color-coded-submission-pipeline-how-to-track-querying-like-business-so",
      "headline": "The color-coded submission pipeline: how to track querying like business so rejection stops hurting",
      "alternativeHeadline": "The color-coded submission pipeline: how to track querying like business so rejection stops hurting",
      "description": "The first time a rejection lands while you're still half-learning how querying actually works, it feels personal in a way that is stupid and unfair. Not because you're weak. Because your brain doesn't know the difference between \"this agent said no\" and \"my career is over.\" It just sees a red notification and latches on.",
      "wordCount": 2110,
      "timeRequired": "PT11M",
      "articleSection": "Querying",
      "keywords": [
        "slush mental game",
        "submissions",
        "revision",
        "rejection",
        "spreadsheet",
        "momentum",
        "batch querying",
        "color coding",
        "tracking",
        "inbox clutter",
        "pipeline",
        "indignation"
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
        "@id": "https://writequeryhook.com/blog/the-color-coded-submission-pipeline-how-to-track-querying-like-business-so#primaryimage"
      },
      "datePublished": "2027-03-13",
      "dateModified": "2027-03-13",
      "mentions": [
        {
          "@type": "WebPage",
          "name": "Pay attention to your progress: the boring measurement that keeps writers from quitting",
          "url": "https://writequeryhook.com/blog/pay-attention-to-your-progress-the-boring-measurement-that-keeps-writers-from"
        },
        {
          "@type": "WebPage",
          "name": "Nudge agents only when their published response rules run out (not when your anxiety does)",
          "url": "https://writequeryhook.com/blog/nudge-agents-only-when-their-published-response-rules-run-out-not-when-your"
        },
        {
          "@type": "WebPage",
          "name": "5 tips for if you feel like shit: sit with the discomfort (and keep writing)",
          "url": "https://writequeryhook.com/blog/5-tips-for-if-you-feel-like-shit-sit-with-the-discomfort-and-keep-writing"
        },
        {
          "@type": "WebPage",
          "name": "5 ways to survive the Dunning-Kruger effect for writers (or author despair syndrome) when feedback hits",
          "url": "https://writequeryhook.com/blog/5-ways-to-survive-the-dunning-kruger-effect-for-writers-or-author-despair"
        }
      ]
    },
    {
      "@type": "ImageObject",
      "@id": "https://writequeryhook.com/blog/the-color-coded-submission-pipeline-how-to-track-querying-like-business-so#primaryimage",
      "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_23/day_314/the-color-coded-submission-pipeline-how-to-track-querying-like-business-so/blog/blog_hero_dread_rejection_blog_hero_landscape_f9241ac9468f.jpeg",
      "width": 10800,
      "height": 6334,
      "caption": "blog hero \u00b7 dread rejection",
      "creditText": "Monstera Production",
      "author": {
        "@type": "Person",
        "name": "Monstera Production",
        "url": "https://www.pexels.com/@gabby-k"
      },
      "@context": "https://schema.org"
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": "https://writequeryhook.com/blog/the-color-coded-submission-pipeline-how-to-track-querying-like-business-so#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Q: What should a writer do before starting agent querying?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Complete multiple revision cycles and get critique partners and beta readers involved so the manuscript is at its best. Then polish a professionally critiqued query letter. You can't spreadsheet your way out of a draft that's still wading."
          }
        },
        {
          "@type": "Question",
          "name": "Q: How does the writer choose which agents to query?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Find agents who represent your manuscript's genre, and compile a list of suitable targets. Categorize them by fit level so the best matches are prioritized first\u2014fabulous fit before borderline."
          }
        },
        {
          "@type": "Question",
          "name": "Q: What's the purpose of a submissions spreadsheet?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "To store key details (contact info and submission rules), plus response timing and notes gathered during research. It also gives you a place to update statuses and follow-up dates so you stay organized during batch querying."
          }
        },
        {
          "@type": "Question",
          "name": "Q: How should queries be sent to avoid waiting around?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Send queries in batches (for example, groups of ten) and intentionally mix response timeframes so replies begin arriving at different times. The goal is to keep roughly ten queries in flight to maintain momentum."
          }
        },
        {
          "@type": "Question",
          "name": "Q: What should happen after a rejection email is received?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Immediately mark the agent as rejected in the spreadsheet and send a new query to another agent right away. Keep the rejected agent in the spreadsheet so you don't double-query later."
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
