import type { Metadata } from 'next';
import { Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const PAGE_DATA = {
  "slug": "writers-use-ai-but-these-7-mistakes-make-it-a-publishing-risk",
  "title": "Writers Use AI\u2014But These 7 Mistakes Make It a Publishing Risk",
  "description": "If you've been doom-scrolling writing discourse and tripping over the headline \"half of authors use AI,\" you're not crazy for feeling rattled. Viral numbers hide the real question: what task did the AI actually do, and what will a reviewer think that implies about authorship and rights?",
  "readTime": "10 min read",
  "publishedDate": null,
  "modifiedDate": null,
  "canonicalUrl": "https://writequeryhook.com/query-letters/writers-use-ai-but-these-7-mistakes-make-it-a-publishing-risk",
  "siteUrl": "https://writequeryhook.com",
  "siteName": "Write Query Hook",
  "locale": "en-US",
  "articleSection": "Querying",
  "keywords": [
    "industry literacy",
    "publishing business",
    "agents",
    "revision",
    "viral claims",
    "confusion",
    "checklist",
    "contract risk",
    "ethics",
    "fear",
    "decision",
    "uncertainty"
  ],
  "author": null,
  "hero": {
    "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_34/day_469/writers-use-ai-but-these-7-mistakes-make-it-a-publishing-risk/blog/blog_hero_overwhelmed_dread_blog_hero_landscape_24807a9f740a.jpeg",
    "alt": "blog hero \u00b7 overwhelmed dread",
    "width": 6000,
    "height": 4000,
    "creator": "Zhine Pics",
    "creatorUrl": "https://www.pexels.com/@zhine-pics-475050645",
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
      "name": "Writers Use AI\u2014But These 7 Mistakes Make It a Publishing Risk",
      "item": "https://writequeryhook.com/query-letters/writers-use-ai-but-these-7-mistakes-make-it-a-publishing-risk"
    }
  ],
  "tldrBlocks": [],
  "openingBlocks": [
    {
      "type": "paragraph",
      "text": "If you've been doom-scrolling writing discourse and tripping over the headline \"half of authors use AI,\" you're not crazy for feeling rattled. Viral numbers hide the real question: **what task did the AI actually do, and what will a reviewer think that implies about authorship and rights?**"
    },
    {
      "type": "paragraph",
      "text": "WQH's obsession here is task-specific reality: survey limits, ethics pressure, and the disclosure/policy uncertainty that gets authors stuck mid-process. Traditional publishers policies on AI content don't all react the same way\u2014but enough skepticism shows up early (especially at the querying stage) that you can't afford vague assumptions."
    },
    {
      "type": "blockquote",
      "text": "The headline number hides the real question: what task is AI actually doing?"
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
            "Viral \"half of authors use AI\" claims don't tell you what *you* can safely do.",
            "Treating \"AI use\" as one blob makes your risk worse because policies and contracts care about specifics.",
            "If you don't track what you used and why, you'll panic when a question hits your inbox.",
            "\"Quality concerns\" aren't the main fear; originality, copyright, and contract language are.",
            "Waiting to decide disclosure until you're already under review is how mistakes get stuck in drafts.",
            "Traditional publishers policies on AI content may differ by imprint or agent\u2014don't assume consistency.",
            "Going deep on generation without managing the human handoff to editing is a rights-and-review trap."
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
          "text": "I get why writers are overwhelmed. You see a survey number, you infer \"AI is normal now,\" then you hit the next post: ethics, contracts, training on copyrighted material, and disclosure fights. Your brain tries to stack it all into one conclusion, and that's where people make stupid, preventable mistakes."
        },
        {
          "type": "paragraph",
          "text": "Like, the survey might be reporting \"AI use in some way,\" not \"AI wrote your book.\" Or it might be weighted toward certain kinds of authors. Or it might show the *most common uses* are research and marketing\u2014things that can be ethically annoying but aren't automatically \"full story generation.\""
        },
        {
          "type": "paragraph",
          "text": "Then a separate anxiety kicks in: **if I used AI for brainstorming, am I contaminating my chances with agents or publishers?** That question doesn't have a single answer. But it *does* have common failure modes. Let's hit them."
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_34/day_469/writers-use-ai-but-these-7-mistakes-make-it-a-publishing-risk/blog/blog_section_image_opening_blog_section_landscape_406290e32c21.gif",
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
      "section_id": "h2_half_of_authors_use_ai_makes_the_problem_smaller",
      "heading": "You're taking the \"half of authors use AI\" headline as a verdict",
      "heading_slug": "you-re-taking-the-half-of-authors-use-ai-headline-as-a-verdict",
      "keyword_key": "h2_half_of_authors_use_ai_makes_the_problem_smaller",
      "keywords": [
        "headline number",
        "misunderstanding",
        "statistic anxiety",
        "sampling bias",
        "self-selection",
        "overwhelm",
        "context",
        "what tasks",
        "research",
        "anxiety"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "The survey behind the \"nearly half\" claim may be limited because it went to partners of a book discovery/marketing service. Self-selection and representativeness issues are real\u2014especially if the sample is heavily weighted toward self-published fiction authors. When you read \"generative AI\" + \"authors\" + \"45%,\" your brain turns it into: \"So it's probably fine.\""
        },
        {
          "type": "paragraph",
          "text": "It might be fine for some tasks. It might still be risky for others."
        },
        {
          "type": "paragraph",
          "text": "**Here's what to do instead:** treat survey results on AI use by authors as a starting point for \"what's common,\" not \"what's safe for publishing.\" Ask the narrower question: **how authors are using generative AI in ways that touch rights, disclosure, or what a reviewer could infer about authorship.**"
        },
        {
          "type": "paragraph",
          "text": "Concrete example: A writer uses AI only for marketing angles, then assumes the survey proves there's no disclosure issue. A reviewer later asks about process, and the mismatch between \"marketing copy\" use and \"full story generation\" assumptions becomes a credibility problem."
        }
      ],
      "image": null
    },
    {
      "section_id": "h2_treating_ai_as_one_thing_makes_your_risks_bigger",
      "heading": "You're treating generative AI as one thing (instead of task-specific uses)",
      "heading_slug": "you-re-treating-generative-ai-as-one-thing-instead-of-task-specific-uses",
      "keyword_key": "h2_treating_ai_as_one_thing_makes_your_risks_bigger",
      "keywords": [
        "task-specific",
        "risk mismatch",
        "fear",
        "ethics",
        "quality",
        "outlining",
        "editing",
        "research",
        "marketing",
        "clarity"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Writers lump research, outlining, editing, jacket copy, cover art, audiobook narration, translation, and \"writing\" into a single category called \"AI.\" That's how you end up making decision errors."
        },
        {
          "type": "paragraph",
          "text": "The survey results often show the top uses include research and marketing, and even among AI users, only a portion report writing frequently while others write occasionally. That means **generative AI for writing outlining editing** can be wildly different from \"AI for full story generation.\""
        },
        {
          "type": "paragraph",
          "text": "**Here's what to do instead:** split your usage into the task buckets that actually map to risk\u2014research vs outlining vs editing vs marketing vs writing. Write it down."
        },
        {
          "type": "paragraph",
          "text": "Concrete example: You run AI to outline chapters (plotting support), then you also let it generate jacket copy. Later, an agent asks \"human authorship\" questions. If you can't separate those tasks cleanly, you can't answer cleanly either."
        }
      ],
      "image": null
    },
    {
      "section_id": "h2_using_ai_without_tracking_what_you_used",
      "heading": "You're not tracking what you used, when you used it, and what changed",
      "heading_slug": "you-re-not-tracking-what-you-used-when-you-used-it-and-what-changed",
      "keyword_key": "h2_using_ai_without_tracking_what_you_used",
      "keywords": [
        "documentation",
        "paper trail",
        "compliance",
        "uncertainty",
        "contracts",
        "timeline",
        "receipts",
        "revision",
        "audit",
        "proof"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Writers underestimate how quickly \"process questions\" arrive."
        },
        {
          "type": "paragraph",
          "text": "You used AI once in a panic. You pasted something into a prompt, got a paragraph, edited it, moved on. Then someone requests documentation, a contract asks about source materials, or you decide disclosure and realize you can't remember what happened."
        },
        {
          "type": "paragraph",
          "text": "Ethics fears aren't the only concern. A lot of contractual friction comes from the fact that many agreements want clean statements of originality, authorship, and rights. If you can't produce a simple internal record, you end up bargaining with uncertainty."
        },
        {
          "type": "paragraph",
          "text": "**Here's what to do instead:** keep a boring paper trail. For each AI-assisted pass, record: what you fed the tool, what purpose that served, what came back, and what you changed in revision. If you can't explain the chain from draft to final, you're building on fog."
        },
        {
          "type": "paragraph",
          "text": "Concrete example: You used AI for editing and accepted its suggestions wholesale. Weeks later, you get feedback that something feels \"too generic,\" and you realize you can't tell which phrases came from you and which came from the tool."
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_34/day_469/writers-use-ai-but-these-7-mistakes-make-it-a-publishing-risk/blog/blog_section_image_documentation_paper_trail_blog_section_landscape_cdc663650ffc.jpeg",
        "alt": "You're not tracking what you used, when you used it, and what changed",
        "width": 4404,
        "height": 2936,
        "creator": "DS stories",
        "creatorUrl": "https://www.pexels.com/@ds-stories",
        "provider": "pexels",
        "role": "section"
      }
    },
    {
      "section_id": "h2_mistaking_quality_concerns_for_the_real_contract_risk",
      "heading": "You're assuming quality is the real problem (and contract/copyright risk is a footnote)",
      "heading_slug": "you-re-assuming-quality-is-the-real-problem-and-contract-copyright-risk-is-a",
      "keyword_key": "h2_mistaking_quality_concerns_for_the_real_contract_risk",
      "keywords": [
        "contract",
        "originality",
        "copyright",
        "misconception",
        "gatekeepers",
        "querying",
        "skepticism",
        "clauses",
        "authorship",
        "fear"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "This one is sneaky: writers hear \"ethics\" and translate it into \"will my prose be worse?\" But writers still misread what ethics threatens in practice."
        },
        {
          "type": "paragraph",
          "text": "Ethics often means concerns that models may be trained on copyrighted material used without permission. And in publishing business reality, copyright worries collide with **contract originality clauses** and what agents or editors think you did to create the text in your name."
        },
        {
          "type": "paragraph",
          "text": "**Here's what to do instead:** stop treating this like a purely artistic question. The risk is about **publishing** expectations: what your submission implies about authorship and what your contracts might require you to affirm."
        },
        {
          "type": "paragraph",
          "text": "Concrete example: You tell yourself, \"My story came from my head, not the model,\" so you assume there's no problem. But if a publisher later asks about AI assistance in writing, and you can't distinguish brainstorming vs drafting vs text generation, your answer turns into a liability\u2014no matter how good the final manuscript reads."
        }
      ],
      "image": null
    },
    {
      "section_id": "h2_ignoring_disclosure_until_it_breaks_your_draft",
      "heading": "You're delaying disclosure until the last second, then scrambling to guess policies",
      "heading_slug": "you-re-delaying-disclosure-until-the-last-second-then-scrambling-to-guess",
      "keyword_key": "h2_ignoring_disclosure_until_it_breaks_your_draft",
      "keywords": [
        "disclosure",
        "honesty",
        "policy uncertainty",
        "readers",
        "publisher questions",
        "stress",
        "ambiguity",
        "future regulation",
        "planning",
        "email"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Disclosure breaks writers because it carries weight in two places at once: it touches how you present yourself ethically, and it shapes how a publisher interprets your submission and what contractual obligations you may have to affirm later."
        },
        {
          "type": "paragraph",
          "text": "The survey angle that most AI users do not disclose to readers isn't a clear endorsement. It's a sign of uncertainty. Most authors don't know whether and how disclosure will be regulated as policies evolve, and traditional publishers policies on AI content may shift, differ by imprint, or be interpreted differently by agents."
        },
        {
          "type": "paragraph",
          "text": "**Here's what to do instead:** decide **disclosure** as a process decision, not a panic decision. Ask: what will the reader see, what will the publisher ask, and what could your marketing material imply? Even if you don't disclose publicly, you need internal clarity."
        },
        {
          "type": "paragraph",
          "text": "Concrete example: You used AI for jacket copy and cover-related text, then you publish without mentioning it. Months later, a complaint thread starts, and suddenly your \"small marketing use\" is treated like \"they used AI to write the book.\" That interpretation mismatch is avoidable with planning."
        },
        {
          "type": "blockquote",
          "text": "Most AI users don't disclose it to readers, and that uncertainty is the next flashpoint."
        }
      ],
      "image": null
    },
    {
      "section_id": "h2_assuming_traditional_publishers_all_think_the_same_way",
      "heading": "You're assuming traditional publishers policies on AI content are uniform",
      "heading_slug": "you-re-assuming-traditional-publishers-policies-on-ai-content-are-uniform",
      "keyword_key": "h2_assuming_traditional_publishers_all_think_the_same_way",
      "keywords": [
        "policies",
        "skepticism",
        "screening",
        "agents",
        "submissions",
        "gatekeeping",
        "variation",
        "caution",
        "querying stage",
        "uncertainty"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Writers love the comfort of a universal rule: \"If it's allowed for self-publishing, it's allowed everywhere.\" That's not how the ecosystem works."
        },
        {
          "type": "paragraph",
          "text": "Traditional publishing and trade fiction show heightened skepticism and caution. Some gatekeepers can screen for AI-generated content at the querying stage. Even when everyone agrees \"don't claim false authorship,\" that doesn't mean everyone agrees what counts as \"AI-generated.\""
        },
        {
          "type": "paragraph",
          "text": "**Here's what to do instead:** treat traditional publishers policies on AI content as variable by context. Look at what you're submitting, where, and what the form or agent instructions imply. Don't gamble your career on internet consensus."
        },
        {
          "type": "paragraph",
          "text": "Concrete example: One agent is fine with AI being used for research and outlining support, but still expects you to answer questions about writing assistance. Another agent may be more strict at the submission stage. If you assume \"publishing\" is one monolith, you'll miss the differences that matter."
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_34/day_469/writers-use-ai-but-these-7-mistakes-make-it-a-publishing-risk/blog/blog_section_image_policies_skepticism_blog_section_landscape_01bb62d648c3.jpeg",
        "alt": "You're assuming traditional publishers policies on AI content are uniform",
        "width": 3999,
        "height": 2667,
        "creator": "Markus Winkler",
        "creatorUrl": "https://www.pexels.com/@markus-winkler-1430818",
        "provider": "pexels",
        "role": "section"
      }
    },
    {
      "section_id": "h2_going_deep_on_generation_and_forgetting_the_handoff",
      "heading": "You're going all-in on generation and forgetting the human handoff",
      "heading_slug": "you-re-going-all-in-on-generation-and-forgetting-the-human-handoff",
      "keyword_key": "h2_going_deep_on_generation_and_forgetting_the_handoff",
      "keywords": [
        "workflow",
        "permissions",
        "licensing",
        "rights",
        "editing pass",
        "human decision",
        "chain-of-custody",
        "jacket copy",
        "cover art",
        "translation"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "This is the \"I typed a prompt, I got something, I moved on\" trap. It shows up in full story generation, but also in smaller places: jacket copy, translation, audiobook narration scripts, even editing suggestions that you never truly interrogate."
        },
        {
          "type": "paragraph",
          "text": "When you rely heavily on generation, you increase two problems at once: 1) review ambiguity (what parts are truly yours?) 2) risk ambiguity (what rights and originality statements can you defend?)"
        },
        {
          "type": "paragraph",
          "text": "**Here's what to do instead:** if you use **generative AI for writing outlining editing**, make the human handoff explicit in your revision. Read everything as if someone else will audit your choices. Cut anything that doesn't match your intent."
        },
        {
          "type": "paragraph",
          "text": "Concrete example: You use AI to draft multiple plot variations, pick one, and then let the tool generate a large chunk of prose without a careful revision pass. The draft might look polished, but your ability to justify decisions\u2014especially in disclosure conversations\u2014becomes weak."
        }
      ],
      "image": null
    },
    {
      "section_id": "h2_recap",
      "heading": "Recap",
      "heading_slug": "recap",
      "keyword_key": "h2_recap",
      "keywords": [],
      "blocks": [
        {
          "type": "paragraph",
          "text": "You didn't lose time because you \"did AI wrong.\" You lost time because you did AI thinking like a single issue, not a set of tasks with different risks. The 7 mistakes:"
        },
        {
          "type": "paragraph",
          "text": "1) treating the headline as a verdict 2) lumping AI tasks together 3) not tracking your process 4) focusing on quality fears and missing contract/copyright risk 5) waiting on disclosure until you're under review 6) assuming one policy for traditional publishers policies on AI content 7) over-relying on generation without managing the human handoff"
        }
      ],
      "image": null
    }
  ],
  "closingImage": {
    "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_34/day_469/writers-use-ai-but-these-7-mistakes-make-it-a-publishing-risk/blog/blog_section_image_deep_breath_pick_a_tool_blog_section_landscape_81d49dd886fa.gif",
    "alt": "blog section image \u00b7 deep breath pick a tool",
    "width": 226,
    "height": 200,
    "creator": "Thestrongtoothbrush",
    "creatorUrl": "https://giphy.com/gifs/goofball-6767-676767-XMMUWcz4XtDTNgZj22",
    "provider": "giphy",
    "role": "section"
  },
  "alsoLike": [
    {
      "title": "How to write for adaptation: rights, inner thoughts, and pacing that survive the screen",
      "url": "https://writequeryhook.com/how-to-write-for-adaptation-rights-inner-thoughts-and-pacing-that-survive-the-screen"
    },
    {
      "title": "What publishing really means by subrights\u2014especially for sci-fi graphic novels",
      "url": "https://writequeryhook.com/what-publishing-really-means-by-subrights-especially-for-sci-fi-graphic-novels"
    },
    {
      "title": "Unconventional writing that still fits: category-busting without becoming a gimmick",
      "url": "https://writequeryhook.com/unconventional-writing-that-still-fits-category-busting-without-becoming-a-gimmick"
    },
    {
      "title": "5 things writers should know about Wattpad (and the future of publishing)",
      "url": "https://writequeryhook.com/5-things-writers-should-know-about-wattpad-and-the-future-of-publishing"
    }
  ],
  "alsoLikeAfterIndex": 4,
  "faq": [
    {
      "question": "How reliable is the survey claim that nearly half of authors use generative AI?",
      "answer": "It's not a universal measurement of \"authors\" everywhere. The survey was sent to partners of a book discovery/marketing service, which can skew who responds. The sample may also be weighted toward self-published fiction authors and may self-select, so you shouldn't treat it like a definitive map of the entire writing community."
    },
    {
      "question": "Does the survey mean authors are using AI to write entire books?",
      "answer": "No. Even when authors report using generative AI, the top uses are often research and marketing. Writing (as a high-frequency activity) is only reported by a portion of AI users, so the \"nearly half\" headline doesn't translate to \"half of books are AI-written.\""
    },
    {
      "question": "What are the main ways authors report using generative AI?",
      "answer": "Reported uses commonly include research, marketing copy or art, outlining/plotting, editing/proofreading, jacket copy, writing, cover art, audiobook narration, and translation. Research is frequently the top use, and \"writing\" is present enough to shape the debate\u2014just not evenly distributed."
    },
    {
      "question": "Why do many authors avoid generative AI?",
      "answer": "The primary reason cited is ethics\u2014especially concerns that models may be trained on copyrighted material used without permission. Interestingly, quality concerns aren't always the top reason, which is why you have to treat this as more than \"will my draft be good.\""
    },
    {
      "question": "Should authors disclose AI assistance to readers?",
      "answer": "There's no settled standard, and survey results show that most AI users do not disclose. That uncertainty is part of why the should authors disclose AI assistance question keeps flaring up, and it's also why authors should watch how policies evolve\u2014especially if publishers or agents begin asking for clearer statements in the submission process."
    }
  ],
  "closingBlocks": [
    {
      "type": "paragraph",
      "text": "Pick your AI tasks deliberately, document what you did, and decide **disclosure** (or non-disclosure) with the same seriousness you bring to querying and revision. If you can't explain your process in plain language, you're not ready to defend your choices\u2014either to a reader or to a reviewer."
    },
    {
      "type": "paragraph",
      "text": "Now go fix yours: rewrite your notes into task buckets, then align your submission strategy to those buckets."
    }
  ],
  "relatedLinks": [
    {
      "title": "How to write for adaptation: rights, inner thoughts, and pacing that survive the screen",
      "url": "https://writequeryhook.com/query-letters/how-to-write-for-adaptation-rights-inner-thoughts-and-pacing-that-survive-the"
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
      "@id": "https://writequeryhook.com/query-letters/writers-use-ai-but-these-7-mistakes-make-it-a-publishing-risk#breadcrumb",
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
          "name": "Writers Use AI\u2014But These 7 Mistakes Make It a Publishing Risk",
          "item": "https://writequeryhook.com/query-letters/writers-use-ai-but-these-7-mistakes-make-it-a-publishing-risk"
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": "https://writequeryhook.com/query-letters/writers-use-ai-but-these-7-mistakes-make-it-a-publishing-risk#webpage",
      "url": "https://writequeryhook.com/query-letters/writers-use-ai-but-these-7-mistakes-make-it-a-publishing-risk",
      "name": "Writers Use AI\u2014But These 7 Mistakes Make It a Publishing Risk",
      "isPartOf": {
        "@id": "https://writequeryhook.com/#website"
      },
      "inLanguage": "en-US",
      "primaryImageOfPage": {
        "@id": "https://writequeryhook.com/query-letters/writers-use-ai-but-these-7-mistakes-make-it-a-publishing-risk#primaryimage"
      },
      "breadcrumb": {
        "@id": "https://writequeryhook.com/query-letters/writers-use-ai-but-these-7-mistakes-make-it-a-publishing-risk#breadcrumb"
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
      "@id": "https://writequeryhook.com/query-letters/writers-use-ai-but-these-7-mistakes-make-it-a-publishing-risk#article",
      "isPartOf": {
        "@id": "https://writequeryhook.com/query-letters/writers-use-ai-but-these-7-mistakes-make-it-a-publishing-risk#webpage"
      },
      "mainEntityOfPage": "https://writequeryhook.com/query-letters/writers-use-ai-but-these-7-mistakes-make-it-a-publishing-risk",
      "headline": "Writers Use AI\u2014But These 7 Mistakes Make It a Publishing Risk",
      "alternativeHeadline": "Writers Use AI\u2014But These 7 Mistakes Make It a Publishing Risk",
      "description": "If you've been doom-scrolling writing discourse and tripping over the headline \"half of authors use AI,\" you're not crazy for feeling rattled. Viral numbers hide the real question: what task did the AI actually do, and what will a reviewer think that implies about authorship and rights?",
      "wordCount": 2012,
      "timeRequired": "PT10M",
      "articleSection": "Querying",
      "keywords": [
        "industry literacy",
        "publishing business",
        "agents",
        "revision",
        "viral claims",
        "confusion",
        "checklist",
        "contract risk",
        "ethics",
        "fear",
        "decision",
        "uncertainty"
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
        "@id": "https://writequeryhook.com/query-letters/writers-use-ai-but-these-7-mistakes-make-it-a-publishing-risk#primaryimage"
      },
      "mentions": [
        {
          "@type": "WebPage",
          "name": "How to write for adaptation: rights, inner thoughts, and pacing that survive the screen",
          "url": "https://writequeryhook.com/query-letters/how-to-write-for-adaptation-rights-inner-thoughts-and-pacing-that-survive-the"
        },
        {
          "@type": "WebPage",
          "name": "How to write for adaptation: rights, inner thoughts, and pacing that survive the screen",
          "url": "https://writequeryhook.com/how-to-write-for-adaptation-rights-inner-thoughts-and-pacing-that-survive-the-screen"
        },
        {
          "@type": "WebPage",
          "name": "What publishing really means by subrights\u2014especially for sci-fi graphic novels",
          "url": "https://writequeryhook.com/what-publishing-really-means-by-subrights-especially-for-sci-fi-graphic-novels"
        },
        {
          "@type": "WebPage",
          "name": "Unconventional writing that still fits: category-busting without becoming a gimmick",
          "url": "https://writequeryhook.com/unconventional-writing-that-still-fits-category-busting-without-becoming-a-gimmick"
        },
        {
          "@type": "WebPage",
          "name": "5 things writers should know about Wattpad (and the future of publishing)",
          "url": "https://writequeryhook.com/5-things-writers-should-know-about-wattpad-and-the-future-of-publishing"
        }
      ]
    },
    {
      "@type": "ImageObject",
      "@id": "https://writequeryhook.com/query-letters/writers-use-ai-but-these-7-mistakes-make-it-a-publishing-risk#primaryimage",
      "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_34/day_469/writers-use-ai-but-these-7-mistakes-make-it-a-publishing-risk/blog/blog_hero_overwhelmed_dread_blog_hero_landscape_24807a9f740a.jpeg",
      "width": 6000,
      "height": 4000,
      "caption": "blog hero \u00b7 overwhelmed dread",
      "creditText": "Zhine Pics",
      "author": {
        "@type": "Person",
        "name": "Zhine Pics",
        "url": "https://www.pexels.com/@zhine-pics-475050645"
      },
      "@context": "https://schema.org"
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": "https://writequeryhook.com/query-letters/writers-use-ai-but-these-7-mistakes-make-it-a-publishing-risk#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How reliable is the survey claim that nearly half of authors use generative AI?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "It's not a universal measurement of \"authors\" everywhere. The survey was sent to partners of a book discovery/marketing service, which can skew who responds. The sample may also be weighted toward self-published fiction authors and may self-select, so you shouldn't treat it like a definitive map of the entire writing community."
          }
        },
        {
          "@type": "Question",
          "name": "Does the survey mean authors are using AI to write entire books?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. Even when authors report using generative AI, the top uses are often research and marketing. Writing (as a high-frequency activity) is only reported by a portion of AI users, so the \"nearly half\" headline doesn't translate to \"half of books are AI-written.\""
          }
        },
        {
          "@type": "Question",
          "name": "What are the main ways authors report using generative AI?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Reported uses commonly include research, marketing copy or art, outlining/plotting, editing/proofreading, jacket copy, writing, cover art, audiobook narration, and translation. Research is frequently the top use, and \"writing\" is present enough to shape the debate\u2014just not evenly distributed."
          }
        },
        {
          "@type": "Question",
          "name": "Why do many authors avoid generative AI?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The primary reason cited is ethics\u2014especially concerns that models may be trained on copyrighted material used without permission. Interestingly, quality concerns aren't always the top reason, which is why you have to treat this as more than \"will my draft be good.\""
          }
        },
        {
          "@type": "Question",
          "name": "Should authors disclose AI assistance to readers?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "There's no settled standard, and survey results show that most AI users do not disclose. That uncertainty is part of why the should authors disclose AI assistance question keeps flaring up, and it's also why authors should watch how policies evolve\u2014especially if publishers or agents begin asking for clearer statements in the submission process."
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
