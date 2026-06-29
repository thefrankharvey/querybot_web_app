import type { Metadata } from 'next';
import { Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BlogBackLink } from '@/components/blog/BlogBackLink';

const PAGE_DATA = {
  "slug": "how-to-use-a-long-form-synopsis-to-plan-your-novel-without-over-polishing-it",
  "title": "How to use a long-form synopsis to plan your novel (without over-polishing it)",
  "description": "A long-form synopsis can feel weirdly threatening. Not because it's hard\u2014but because it wants to be a \"real document.\" Like, polished. Like, pitch-ready. Like it should come out perfect on page one.",
  "readTime": "7 min read",
  "publishedDate": "2027-11-06",
  "modifiedDate": "2027-11-06",
  "canonicalUrl": "https://writequeryhook.com/blog/how-to-use-a-long-form-synopsis-to-plan-your-novel-without-over-polishing-it",
  "siteUrl": "https://writequeryhook.com",
  "siteName": "Write Query Hook",
  "locale": "en-US",
  "articleSection": "Querying",
  "keywords": [
    "synopsis",
    "revision",
    "craft",
    "messy draft",
    "brainstorming",
    "plot holes",
    "logic checks",
    "story shape",
    "critique boundaries",
    "living document",
    "page count",
    "anxious writer"
  ],
  "author": null,
  "hero": {
    "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_44/day_605/how-to-use-a-long-form-synopsis-to-plan-your-novel-without-over-polishing-it/blog/blog_hero_recognition_dread_blog_hero_landscape_a215e0da9866.gif",
    "alt": "blog hero \u00b7 recognition dread",
    "width": 200,
    "height": 200,
    "creator": "pennydreadful",
    "creatorUrl": "https://giphy.com/gifs/pennydreadful-city-of-angels-penny-dreadful-mB9WpwAR6YUc7W7Uqa",
    "provider": "giphy",
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
      "name": "How to use a long-form synopsis to plan your novel (without over-polishing it)",
      "item": "https://writequeryhook.com/blog/how-to-use-a-long-form-synopsis-to-plan-your-novel-without-over-polishing-it"
    }
  ],
  "tldrBlocks": [],
  "openingBlocks": [
    {
      "type": "paragraph",
      "text": "A long-form synopsis can feel weirdly threatening. Not because it's hard\u2014but because it *wants* to be a \"real document.\" Like, polished. Like, pitch-ready. Like it should come out perfect on page one."
    },
    {
      "type": "paragraph",
      "text": "Haha. No."
    },
    {
      "type": "paragraph",
      "text": "This is the **synopsis** you use while you're still building. **Novel planning** at intermediate stage means your draft isn't a finished product yet, and your brain is still juggling plot threads, character choices, and \"what if\" possibilities. So you're going to write the mess on purpose, then pressure-test the **plot structure** and **character arc** until it holds up when you read it back out loud."
    },
    {
      "type": "paragraph",
      "text": "And when you finally share for **critique**, you'll do it in a way that protects everyone's time\u2014because wasting critique time is the fastest route to despair."
    },
    {
      "type": "blockquote",
      "text": "Fix obvious plot holes first, so critique time becomes deep creativity."
    }
  ],
  "sections": [
    {
      "section_id": "h2_step_1_write_the_story_essentials",
      "heading": "Step 1: Write the story essentials in a dump page (not a final draft)",
      "heading_slug": "step-1-write-the-story-essentials-in-a-dump-page-not-a-final-draft",
      "keyword_key": "h2_step_1_write_the_story_essentials",
      "keywords": [
        "dump",
        "focus",
        "age category",
        "genre",
        "big idea",
        "goals",
        "change arc",
        "clarity",
        "messy page",
        "blueprint"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Start with the minimum set of facts you can't improvise reliably later. This becomes your spine. Your first pass can be ugly. Use headings if that helps, but the goal is dumping the essentials, not writing something \"beautiful.\""
        },
        {
          "type": "paragraph",
          "text": "At minimum, document:"
        },
        {
          "type": "list",
          "items": [
            "age category and genre",
            "the \"what if?\" big idea (the premise hook your plot is built on)",
            "protagonist goal",
            "antagonist goal",
            "the protagonist's change arc (what they become by the end)"
          ]
        },
        {
          "type": "paragraph",
          "text": "Then add whatever else you already know: major characters, early turning points, the villain's method, the subplot you keep writing around, the twist you can't stop thinking about."
        },
        {
          "type": "paragraph",
          "text": "If you're tempted to \"fix it\" on the spot\u2014stop. Leave contradictions. Leave questions. Leave the weird version that's only half-true. Your job in this step is to get the story essentials on paper."
        },
        {
          "type": "paragraph",
          "text": "Concrete example: If your protagonist is \"a burned-out paramedic who discovers she's been working the wrong cases,\" your dump might include: genre (thriller), big idea (\"what if her department is hiding a pattern\"), protagonist goal (\"prove the pattern and keep one kid alive\"), antagonist goal (\"keep the cover intact\"), change arc (\"from reactive rescuer to strategic protector\")."
        },
        {
          "type": "paragraph",
          "text": "This is exactly **how to write a long-form synopsis**\u2014as a brainstorming document, not a submission-ready artifact."
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_44/day_605/how-to-use-a-long-form-synopsis-to-plan-your-novel-without-over-polishing-it/blog/blog_section_image_dump_focus_blog_section_landscape_6e2015b94c14.jpeg",
        "alt": "Step 1: Write the story essentials in a dump page (not a final draft)",
        "width": 5184,
        "height": 3456,
        "creator": "Emmet",
        "creatorUrl": "https://www.pexels.com/@emmet-35167",
        "provider": "pexels",
        "role": "section"
      }
    },
    {
      "section_id": "h2_step_2_turn_gaps_into_plot_structure",
      "heading": "Step 2: Turn gaps into plot structure with an ordinary-world \u2192 problem \u2192 confrontation \u2192 climax \u2192 resolution sequence",
      "heading_slug": "step-2-turn-gaps-into-plot-structure-with-an-ordinary-world-problem",
      "keyword_key": "h2_step_2_turn_gaps_into_plot_structure",
      "keywords": [
        "structure",
        "gaps",
        "ordinary world",
        "problem",
        "confrontation",
        "climax",
        "resolution",
        "logic",
        "wiring",
        "momentum"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Now you stop being a notetaker and start being a mechanic. The chaos becomes useful when you translate it into a familiar story shape."
        },
        {
          "type": "paragraph",
          "text": "Pick a simple sequence and map what you *already drafted* into it:"
        },
        {
          "type": "list",
          "items": [
            "ordinary world",
            "problem (inciting disruption)",
            "confrontation (rising complications that force choices)",
            "climax",
            "resolution"
          ]
        },
        {
          "type": "paragraph",
          "text": "Sketch **plot structure** beat-by-beat in your own messy sentences, not chapter prose."
        },
        {
          "type": "paragraph",
          "text": "When you hit a gap\u2014\"Wait, how does the protagonist learn that?\"\u2014write the gap down as a question and keep moving. If a subplot doesn't reach into the main conflict, it needs either a function or a cut."
        },
        {
          "type": "paragraph",
          "text": "Concrete example: In a romance-drama, ordinary world shows the character's life rhythm and what they think is true. Problem is the event that breaks the rhythm. Confrontation is where compatibility stops being hypothetical and becomes painful decisions. Climax is the moment the relationship (and the protagonist's change arc) is forced to commit. Resolution is what's different because the commitment happened."
        },
        {
          "type": "paragraph",
          "text": "**What to include in a long synopsis** without drowning in detail: aim for about 3\u20137 pages\u2014a length you can read aloud to critique partners in a workshop setting and discuss on the same day. You're building a shared reference point, not a novel replacement."
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_44/day_605/how-to-use-a-long-form-synopsis-to-plan-your-novel-without-over-polishing-it/blog/blog_section_image_structure_gaps_blog_section_landscape_e7b6812fe5b6.jpeg",
        "alt": "Step 2: Turn gaps into plot structure with an ordinary-world \u2192 problem \u2192 confrontation \u2192 climax \u2192 resolution sequence",
        "width": 5568,
        "height": 3712,
        "creator": "Juan Carlos Tamayo",
        "creatorUrl": "https://www.pexels.com/@juan-carlos-tamayo-2154936396",
        "provider": "pexels",
        "role": "section"
      }
    },
    {
      "section_id": "h2_step_3_do_a_logic_read_and_list_unanswered_questions",
      "heading": "Step 3: Do a logic read and list unanswered questions while the draft is still chaotic",
      "heading_slug": "step-3-do-a-logic-read-and-list-unanswered-questions-while-the-draft-is-still",
      "keyword_key": "h2_step_3_do_a_logic_read_and_list_unanswered_questions",
      "keywords": [
        "read-aloud",
        "confusion",
        "list questions",
        "plot hole",
        "tension",
        "revision",
        "detective brain",
        "blank spots",
        "correction",
        "relief"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Read your long-form synopsis and grade your own coherence for logic, not style."
        },
        {
          "type": "paragraph",
          "text": "Start at the top and ask, sentence by sentence: *Does this event cause the next one? Does the protagonist want something real at this moment? Does the antagonist create pressure that forces a decision?*"
        },
        {
          "type": "paragraph",
          "text": "Then list unanswered questions as you go. Use a blunt format:"
        },
        {
          "type": "list",
          "items": [
            "\"How does X happen?\"",
            "\"Why does Y choice occur now?\"",
            "\"What does the antagonist do between A and B?\"",
            "\"Where does the protagonist change actually show up?\""
          ]
        },
        {
          "type": "paragraph",
          "text": "This maps the gaps so feedback can go toward the creative work, not basic triage. A logic read generates concrete questions you can answer: \"What choice does she make in the confrontation that contradicts her old belief?\" Now you know what to fix."
        }
      ],
      "image": null
    },
    {
      "section_id": "h2_step_4_refine_until_arc_and_plot_make_sense_out_loud",
      "heading": "Step 4: Revise until the plot and arc make sense when you explain them out loud",
      "heading_slug": "step-4-revise-until-the-plot-and-arc-make-sense-when-you-explain-them-out-loud",
      "keyword_key": "h2_step_4_refine_until_arc_and_plot_make_sense_out_loud",
      "keywords": [
        "voice",
        "coherence",
        "arc logic",
        "protagonist change",
        "clarity",
        "critique ready",
        "breathing room",
        "conviction",
        "sharpen",
        "wins"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Tighten enough that you can describe it without fumbling."
        },
        {
          "type": "paragraph",
          "text": "Read it again\u2014but this time, imagine you're standing in front of critique partners. Can you summarize the story shape quickly? Can you point to the protagonist's \"before\" and \"after\"? Can you explain what the antagonist wants and how they apply pressure?"
        },
        {
          "type": "paragraph",
          "text": "If you can't, revise the synopsis like a draft: cut the fluff that doesn't change the logic, and add sentences that clarify causality, timing, and character motivation."
        },
        {
          "type": "paragraph",
          "text": "Don't force every subplot into perfect symmetry yet. Force the main arc to be unambiguous. A chaotic subplot you can explain is better than a \"perfectly detailed\" subplot that doesn't connect to the protagonist's change."
        },
        {
          "type": "paragraph",
          "text": "Concrete example: Add a short line after a key confrontation beat: \"This is where she stops treating survival as luck and starts treating it as strategy.\" That single sentence can anchor the **character arc** so your critique partners can react to the actual choices."
        },
        {
          "type": "paragraph",
          "text": "**Long-form synopsis for planning a novel** earns itself through readability."
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_44/day_605/how-to-use-a-long-form-synopsis-to-plan-your-novel-without-over-polishing-it/blog/blog_section_image_voice_coherence_blog_section_landscape_afcad3a38298.gif",
        "alt": "Step 4: Revise until the plot and arc make sense when you explain them out loud",
        "width": 354,
        "height": 200,
        "creator": "johannaespinosa",
        "creatorUrl": "https://giphy.com/gifs/voice-sonido-voz-Yq8vNOxsBCThC6kubL",
        "provider": "giphy",
        "role": "section"
      }
    },
    {
      "section_id": "h2_step_5_use_your_synopsis_in_critique_without_wasting_time",
      "heading": "Step 5: Share with critique partners by setting boundaries that prevent nitpicking and wasted time",
      "heading_slug": "step-5-share-with-critique-partners-by-setting-boundaries-that-prevent",
      "keyword_key": "h2_step_5_use_your_synopsis_in_critique_without_wasting_time",
      "keywords": [
        "critique",
        "boundaries",
        "clarifying questions",
        "what if brainstorming",
        "comparable titles",
        "nitpicking avoidance",
        "time respect",
        "workshop energy",
        "trust",
        "control"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Now share it. But do not dump it on people without guidance\u2014especially if your synopsis is meant to be messy."
        },
        {
          "type": "paragraph",
          "text": "In your share message (or on the first page), instruct partners to:"
        },
        {
          "type": "list",
          "items": [
            "ask clarifying questions",
            "generate \"what if\" brainstorming",
            "suggest comparable titles",
            "avoid nitpicking character names, plot points, or other details at this stage",
            "focus on core logic (does the plot shape make sense? does the arc feel earned?)"
          ]
        },
        {
          "type": "paragraph",
          "text": "This is **how to share synopsis with critique partners** without wasting critique time."
        }
      ],
      "image": null
    },
    {
      "section_id": "h2_step_6_keep_it_living_document_during_revision_and_rewrite",
      "heading": "Step 6: Treat your synopsis like a living document you revisit during planning, drafting, and revising",
      "heading_slug": "step-6-treat-your-synopsis-like-a-living-document-you-revisit-during-planning",
      "keyword_key": "h2_step_6_keep_it_living_document_during_revision_and_rewrite",
      "keywords": [
        "living document",
        "tracking changes",
        "structural edits",
        "drafts",
        "feedback alignment",
        "ongoing revisions",
        "calm plan",
        "momentum",
        "adaptation",
        "steady"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Your long-form synopsis should not freeze at \"done.\" It should move with your manuscript."
        },
        {
          "type": "paragraph",
          "text": "As you draft, your story will change:"
        },
        {
          "type": "list",
          "items": [
            "a scene teaches you something new about a character",
            "a subplot becomes dominant (or gets murdered)",
            "a twist lands differently than you expected"
          ]
        },
        {
          "type": "paragraph",
          "text": "When that happens, update the synopsis at the structural level. If you revise a climax scene so the protagonist fails in a different way, update the synopsis beats for climax and resolution, then adjust the protagonist change sentence (\"before/after\") so it matches what actually happens on the page."
        },
        {
          "type": "paragraph",
          "text": "**Using a synopsis as a living document** means updating it as your draft evolves, so your critique partners can track major structural changes without reading the full manuscript each time you revise."
        }
      ],
      "image": null
    }
  ],
  "closingImage": {
    "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_44/day_605/how-to-use-a-long-form-synopsis-to-plan-your-novel-without-over-polishing-it/blog/blog_section_image_closing_the_tab_next_draft_blog_section_landscape_c4a1d1924dc0.jpeg",
    "alt": "blog section image \u00b7 closing the tab next draft",
    "width": 6000,
    "height": 4000,
    "creator": "Diana \u2728",
    "creatorUrl": "https://www.pexels.com/@didsss",
    "provider": "pexels",
    "role": "section"
  },
  "alsoLike": [
    {
      "title": "How to Write a Synopsis for Agents That Actually Summarizes the Ending",
      "url": "https://writequeryhook.com/blog/how-to-write-a-synopsis-for-agents-that-actually-summarizes-the-ending"
    },
    {
      "title": "How to write an incredible synopsis in 4 simple steps (beat by beat)",
      "url": "https://writequeryhook.com/blog/how-to-write-an-incredible-synopsis-in-4-simple-steps-beat-by-beat"
    },
    {
      "title": "How to write a novel synopsis that reveals the ending (and still reads clean)",
      "url": "https://writequeryhook.com/blog/how-to-write-a-novel-synopsis-that-reveals-the-ending-and-still-reads-clean"
    },
    {
      "title": "What Format Do Publishers Expect for a Synopsis\u2014and How to Write One That Reveals the Ending",
      "url": "https://writequeryhook.com/blog/what-format-do-publishers-expect-for-a-synopsis-and-how-to-write-one-that"
    }
  ],
  "alsoLikeAfterIndex": 2,
  "faq": [
    {
      "question": "What makes a long-form synopsis different from a traditional synopsis?",
      "answer": "It's meant to be messy and flexible rather than polished and submission-ready. Writers use it as a brainstorming document to capture major characters, plot events, arcs, subplots, twists, and unexpected turns."
    },
    {
      "question": "What should writers include in the first draft of a long-form synopsis?",
      "answer": "At minimum: age category, genre, the \"what if?\" big idea, the protagonist's goal, the antagonist's goal, and the protagonist's change arc. Then fill gaps and add logic."
    },
    {
      "question": "How do writers turn a messy synopsis into a coherent plan?",
      "answer": "Read it back, list unanswered questions, then revise until the major plot and arc logic feel solid. Use a familiar story sequence like ordinary world \u2192 problem \u2192 confrontation \u2192 climax \u2192 resolution to expose gaps."
    },
    {
      "question": "How should critique partners be instructed when reviewing a long-form synopsis?",
      "answer": "Tell partners they can ask clarifying questions, do \"what if\" brainstorming, and suggest comparable titles. Also tell them to avoid nitpicking characters, plot points, or other details too early."
    },
    {
      "question": "When should writers revisit or revise the long-form synopsis?",
      "answer": "Revisit it throughout planning, drafting, and revising. Treat it as a living document that helps track big-picture changes and communicate structural edits at a high level without forcing partners to read the full manuscript."
    }
  ],
  "closingBlocks": [
    {
      "type": "paragraph",
      "text": "Open your doc and write the essentials dump. Then run the logic read, list the unanswered questions, and revise until the plot and **character arc** make sense when you explain them out loud."
    },
    {
      "type": "paragraph",
      "text": "Do not over-polish. Do not hide your plot problems. Fix the obvious holes first\u2014then let critique become the deep creativity it's supposed to be."
    }
  ],
  "relatedLinks": [
    {
      "title": "5 tips for writing a compelling book synopsis that ends with the right proof",
      "url": "https://writequeryhook.com/blog/5-tips-for-writing-a-compelling-book-synopsis-that-ends-with-the-right-proof"
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
      "@id": "https://writequeryhook.com/blog/how-to-use-a-long-form-synopsis-to-plan-your-novel-without-over-polishing-it#breadcrumb",
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
          "name": "How to use a long-form synopsis to plan your novel (without over-polishing it)",
          "item": "https://writequeryhook.com/blog/how-to-use-a-long-form-synopsis-to-plan-your-novel-without-over-polishing-it"
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": "https://writequeryhook.com/blog/how-to-use-a-long-form-synopsis-to-plan-your-novel-without-over-polishing-it#webpage",
      "url": "https://writequeryhook.com/blog/how-to-use-a-long-form-synopsis-to-plan-your-novel-without-over-polishing-it",
      "name": "How to use a long-form synopsis to plan your novel (without over-polishing it)",
      "isPartOf": {
        "@id": "https://writequeryhook.com/#website"
      },
      "inLanguage": "en-US",
      "primaryImageOfPage": {
        "@id": "https://writequeryhook.com/blog/how-to-use-a-long-form-synopsis-to-plan-your-novel-without-over-polishing-it#primaryimage"
      },
      "breadcrumb": {
        "@id": "https://writequeryhook.com/blog/how-to-use-a-long-form-synopsis-to-plan-your-novel-without-over-polishing-it#breadcrumb"
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
      "@id": "https://writequeryhook.com/blog/how-to-use-a-long-form-synopsis-to-plan-your-novel-without-over-polishing-it#article",
      "isPartOf": {
        "@id": "https://writequeryhook.com/blog/how-to-use-a-long-form-synopsis-to-plan-your-novel-without-over-polishing-it#webpage"
      },
      "mainEntityOfPage": "https://writequeryhook.com/blog/how-to-use-a-long-form-synopsis-to-plan-your-novel-without-over-polishing-it",
      "headline": "How to use a long-form synopsis to plan your novel (without over-polishing it)",
      "alternativeHeadline": "How to use a long-form synopsis to plan your novel (without over-polishing it)",
      "description": "A long-form synopsis can feel weirdly threatening. Not because it's hard\u2014but because it wants to be a \"real document.\" Like, polished. Like, pitch-ready. Like it should come out perfect on page one.",
      "wordCount": 1436,
      "timeRequired": "PT7M",
      "articleSection": "Querying",
      "keywords": [
        "synopsis",
        "revision",
        "craft",
        "messy draft",
        "brainstorming",
        "plot holes",
        "logic checks",
        "story shape",
        "critique boundaries",
        "living document",
        "page count",
        "anxious writer"
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
        "@id": "https://writequeryhook.com/blog/how-to-use-a-long-form-synopsis-to-plan-your-novel-without-over-polishing-it#primaryimage"
      },
      "datePublished": "2027-11-06",
      "dateModified": "2027-11-06",
      "mentions": [
        {
          "@type": "WebPage",
          "name": "5 tips for writing a compelling book synopsis that ends with the right proof",
          "url": "https://writequeryhook.com/blog/5-tips-for-writing-a-compelling-book-synopsis-that-ends-with-the-right-proof"
        },
        {
          "@type": "WebPage",
          "name": "How to Write a Synopsis for Agents That Actually Summarizes the Ending",
          "url": "https://writequeryhook.com/blog/how-to-write-a-synopsis-for-agents-that-actually-summarizes-the-ending"
        },
        {
          "@type": "WebPage",
          "name": "How to write an incredible synopsis in 4 simple steps (beat by beat)",
          "url": "https://writequeryhook.com/blog/how-to-write-an-incredible-synopsis-in-4-simple-steps-beat-by-beat"
        },
        {
          "@type": "WebPage",
          "name": "How to write a novel synopsis that reveals the ending (and still reads clean)",
          "url": "https://writequeryhook.com/blog/how-to-write-a-novel-synopsis-that-reveals-the-ending-and-still-reads-clean"
        },
        {
          "@type": "WebPage",
          "name": "What Format Do Publishers Expect for a Synopsis\u2014and How to Write One That Reveals the Ending",
          "url": "https://writequeryhook.com/blog/what-format-do-publishers-expect-for-a-synopsis-and-how-to-write-one-that"
        }
      ]
    },
    {
      "@type": "ImageObject",
      "@id": "https://writequeryhook.com/blog/how-to-use-a-long-form-synopsis-to-plan-your-novel-without-over-polishing-it#primaryimage",
      "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_44/day_605/how-to-use-a-long-form-synopsis-to-plan-your-novel-without-over-polishing-it/blog/blog_hero_recognition_dread_blog_hero_landscape_a215e0da9866.gif",
      "width": 200,
      "height": 200,
      "caption": "blog hero \u00b7 recognition dread",
      "creditText": "pennydreadful",
      "author": {
        "@type": "Person",
        "name": "pennydreadful",
        "url": "https://giphy.com/gifs/pennydreadful-city-of-angels-penny-dreadful-mB9WpwAR6YUc7W7Uqa"
      },
      "@context": "https://schema.org"
    },
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "@id": "https://writequeryhook.com/blog/how-to-use-a-long-form-synopsis-to-plan-your-novel-without-over-polishing-it#howto",
      "name": "How to use a long-form synopsis to plan your novel (without over-polishing it)",
      "description": "A long-form synopsis can feel weirdly threatening. Not because it's hard\u2014but because it wants to be a \"real document.\" Like, polished. Like, pitch-ready. Like it should come out perfect on page one.",
      "totalTime": "PT7M",
      "step": [
        {
          "@type": "HowToStep",
          "position": 1,
          "name": "Step 1: Write the story essentials in a dump page (not a final draft)",
          "text": "Start with the minimum set of facts you can't improvise reliably later. This becomes your spine. Your first pass can be ugly. Use headings if that helps, but the goal is dumping the essentials, not writing something \"beautiful.\"",
          "url": "https://writequeryhook.com/blog/how-to-use-a-long-form-synopsis-to-plan-your-novel-without-over-polishing-it#step-1-write-the-story-essentials-in-a-dump-page-not-a-final-draft"
        },
        {
          "@type": "HowToStep",
          "position": 2,
          "name": "Step 2: Turn gaps into plot structure with an ordinary-world \u2192 problem \u2192 confrontation \u2192 climax \u2192 resolution sequence",
          "text": "Now you stop being a notetaker and start being a mechanic. The chaos becomes useful when you translate it into a familiar story shape.",
          "url": "https://writequeryhook.com/blog/how-to-use-a-long-form-synopsis-to-plan-your-novel-without-over-polishing-it#step-2-turn-gaps-into-plot-structure-with-an-ordinary-world-problem"
        },
        {
          "@type": "HowToStep",
          "position": 3,
          "name": "Step 3: Do a logic read and list unanswered questions while the draft is still chaotic",
          "text": "Read your long-form synopsis and grade your own coherence for logic, not style.",
          "url": "https://writequeryhook.com/blog/how-to-use-a-long-form-synopsis-to-plan-your-novel-without-over-polishing-it#step-3-do-a-logic-read-and-list-unanswered-questions-while-the-draft-is-still"
        },
        {
          "@type": "HowToStep",
          "position": 4,
          "name": "Step 4: Revise until the plot and arc make sense when you explain them out loud",
          "text": "Tighten enough that you can describe it without fumbling.",
          "url": "https://writequeryhook.com/blog/how-to-use-a-long-form-synopsis-to-plan-your-novel-without-over-polishing-it#step-4-revise-until-the-plot-and-arc-make-sense-when-you-explain-them-out-loud"
        },
        {
          "@type": "HowToStep",
          "position": 5,
          "name": "Step 5: Share with critique partners by setting boundaries that prevent nitpicking and wasted time",
          "text": "Now share it. But do not dump it on people without guidance\u2014especially if your synopsis is meant to be messy.",
          "url": "https://writequeryhook.com/blog/how-to-use-a-long-form-synopsis-to-plan-your-novel-without-over-polishing-it#step-5-share-with-critique-partners-by-setting-boundaries-that-prevent"
        },
        {
          "@type": "HowToStep",
          "position": 6,
          "name": "Step 6: Treat your synopsis like a living document you revisit during planning, drafting, and revising",
          "text": "Your long-form synopsis should not freeze at \"done.\" It should move with your manuscript.",
          "url": "https://writequeryhook.com/blog/how-to-use-a-long-form-synopsis-to-plan-your-novel-without-over-polishing-it#step-6-treat-your-synopsis-like-a-living-document-you-revisit-during-planning"
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": "https://writequeryhook.com/blog/how-to-use-a-long-form-synopsis-to-plan-your-novel-without-over-polishing-it#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What makes a long-form synopsis different from a traditional synopsis?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "It's meant to be messy and flexible rather than polished and submission-ready. Writers use it as a brainstorming document to capture major characters, plot events, arcs, subplots, twists, and unexpected turns."
          }
        },
        {
          "@type": "Question",
          "name": "What should writers include in the first draft of a long-form synopsis?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "At minimum: age category, genre, the \"what if?\" big idea, the protagonist's goal, the antagonist's goal, and the protagonist's change arc. Then fill gaps and add logic."
          }
        },
        {
          "@type": "Question",
          "name": "How do writers turn a messy synopsis into a coherent plan?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Read it back, list unanswered questions, then revise until the major plot and arc logic feel solid. Use a familiar story sequence like ordinary world \u2192 problem \u2192 confrontation \u2192 climax \u2192 resolution to expose gaps."
          }
        },
        {
          "@type": "Question",
          "name": "How should critique partners be instructed when reviewing a long-form synopsis?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Tell partners they can ask clarifying questions, do \"what if\" brainstorming, and suggest comparable titles. Also tell them to avoid nitpicking characters, plot points, or other details too early."
          }
        },
        {
          "@type": "Question",
          "name": "When should writers revisit or revise the long-form synopsis?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Revisit it throughout planning, drafting, and revising. Treat it as a living document that helps track big-picture changes and communicate structural edits at a high level without forcing partners to read the full manuscript."
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
