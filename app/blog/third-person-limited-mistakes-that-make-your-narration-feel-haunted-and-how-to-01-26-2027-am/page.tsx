import type { Metadata } from 'next';
import { Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BlogBackLink } from '@/components/blog/BlogBackLink';

const PAGE_DATA = {
  "slug": "third-person-limited-mistakes-that-make-your-narration-feel-haunted-and-how-to",
  "title": "Third person limited mistakes that make your narration feel haunted (and how to fix them)",
  "description": "If your third person limited draft feels off\u2014like the emotional lens keeps slipping, even when you swear you're \"staying in one head\"\u2014that's usually not vibes. It's the POV contract breaking in small, almost-invisible ways.",
  "readTime": "9 min read",
  "publishedDate": "2027-01-25",
  "modifiedDate": "2027-01-25",
  "canonicalUrl": "https://writequeryhook.com/blog/third-person-limited-mistakes-that-make-your-narration-feel-haunted-and-how-to",
  "siteUrl": "https://writequeryhook.com",
  "siteName": "Write Query Hook",
  "locale": "en-US",
  "articleSection": "Querying",
  "keywords": [
    "sample pages",
    "craft",
    "revision",
    "querying",
    "pov contract",
    "head-hopping",
    "confusion",
    "consistency",
    "narration control",
    "audit",
    "show-not-tell",
    "mystery"
  ],
  "author": null,
  "hero": {
    "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_19/day_261/third-person-limited-mistakes-that-make-your-narration-feel-haunted-and-how-to/blog/blog_hero_dread_haunted_narration_blog_hero_landscape_bd0465d433b3.jpeg?updatedAt=1781685790097",
    "alt": "blog hero \u00b7 dread haunted narration",
    "width": 6000,
    "height": 4000,
    "creator": "Heber Vazquez",
    "creatorUrl": "https://www.pexels.com/@unpoquitodefoto",
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
      "name": "Third person limited mistakes that make your narration feel haunted (and how to fix them)",
      "item": "https://writequeryhook.com/blog/third-person-limited-mistakes-that-make-your-narration-feel-haunted-and-how-to"
    }
  ],
  "tldrBlocks": [],
  "openingBlocks": [
    {
      "type": "paragraph",
      "text": "If your third person limited draft feels *off*\u2014like the emotional lens keeps slipping, even when you swear you're \"staying in one head\"\u2014that's usually not vibes. It's the POV contract breaking in small, almost-invisible ways."
    },
    {
      "type": "paragraph",
      "text": "Writers worry about head-hopping. But the bigger pain point is this: we don't define third person limited tightly enough to police it during revision. Then the narration starts doing whatever it wants."
    },
    {
      "type": "blockquote",
      "text": "\"Head-hopping breaks the POV promise\u2014and readers feel it immediately.\""
    },
    {
      "type": "paragraph",
      "text": "Let's name the most common third person limited mistakes, why each one happens, and what to do instead."
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
            "You're using a fuzzy definition of third person limited POV, so consistency drifts mid-draft.",
            "You're head-hopping by accident\u2014especially when you \"explain\" another character's motive.",
            "You switch closeness/distance without realizing it, which causes POV whiplash.",
            "You tell instead of showing: you narrate internal states that the viewpoint character couldn't know.",
            "You pick third person limited for the wrong job, then pay for it in revision.",
            "You revise without a line-by-line POV audit method, so the same problem repeats in the next draft."
          ]
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_19/day_261/third-person-limited-mistakes-that-make-your-narration-feel-haunted-and-how-to/blog/blog_section_image_tldr_blog_section_landscape_7912982aa0a3.jpeg",
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
      "section_id": "h2_opening",
      "heading": "Opening",
      "heading_slug": "opening",
      "keyword_key": "h2_opening",
      "keywords": [],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Here's the pattern I keep seeing: a writer explains what third person limited *means* in theory, then the draft starts behaving like third person omniscient when the tension peaks."
        },
        {
          "type": "paragraph",
          "text": "You'll be cruising in narration, everything's clear, then one paragraph later you're accidentally inside a character's private dread\u2014except that character isn't the one we're supposed to be glued to. The reader doesn't need a writing degree to feel it. They just feel the spell break."
        },
        {
          "type": "paragraph",
          "text": "Smooth prose doesn't mean POV-true prose. And that's the crack where the haunted feeling lives."
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_19/day_261/third-person-limited-mistakes-that-make-your-narration-feel-haunted-and-how-to/blog/blog_section_image_opening_blog_section_landscape_3691200dcdc3.gif",
        "alt": "Opening",
        "width": 296,
        "height": 200,
        "creator": "TreehouseDirect",
        "creatorUrl": "https://giphy.com/gifs/TreehouseDirect-cartoons-turtle-franklin-zOBM2EO8rEyj1Hfe3V",
        "provider": "giphy",
        "role": "section"
      }
    },
    {
      "section_id": "h2_definition_drift_and_pov_contract_slips",
      "heading": "1) You're treating the definition like decoration (POV contract slips)",
      "heading_slug": "1-you-re-treating-the-definition-like-decoration-pov-contract-slips",
      "keyword_key": "h2_definition_drift_and_pov_contract_slips",
      "keywords": [
        "foggy definition",
        "rules drifting",
        "POV contract",
        "clarity",
        "confusion",
        "checklist",
        "line-by-line",
        "revision",
        "distance",
        "focus"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Writers memorize the definition of third person limited\u2014one character's thoughts and feelings\u2014but don't enforce it during revision. When the going gets tense, the narrator starts \"helping\" by adding context, inference, or emotional interpretation that the viewpoint character never earned."
        },
        {
          "type": "paragraph",
          "text": "This is where \"limited\" stops meaning actual limitation."
        },
        {
          "type": "blockquote",
          "text": "\"Third person limited only reveals what the viewpoint character can know and feel.\""
        },
        {
          "type": "paragraph",
          "text": "One symptom: you can't point to the exact moment the POV changed, because it didn't. It just blurred."
        },
        {
          "type": "paragraph",
          "text": "**Fix it:** write a one-line POV contract at the top of your draft. Example:"
        },
        {
          "type": "list",
          "items": [
            "*The narration may only share what the viewpoint character notices, assumes, or reacts to in the moment.*"
          ]
        },
        {
          "type": "paragraph",
          "text": "Then, during revision, flag any sentence that contains:"
        },
        {
          "type": "list",
          "items": [
            "another character's inner emotion,",
            "certainty about another character's private motive,",
            "a \"because she felt\u2026\" explanation."
          ]
        },
        {
          "type": "paragraph",
          "text": "**Concrete example (before \u2192 after):** **Before (wrong):** \"Jules heard the insult and knew Mara was trying to hurt him on purpose.\" **After (true limited):** \"Jules heard the insult. Her smile didn't match the words, and he couldn't shake the feeling she wanted him rattled.\""
        },
        {
          "type": "paragraph",
          "text": "Same moment. Same tension. Different POV contract."
        }
      ],
      "image": null
    },
    {
      "section_id": "h2_head_hopping_by_accident",
      "heading": "2) You're head-hopping by accident (you \"borrow\" feelings you didn't earn)",
      "heading_slug": "2-you-re-head-hopping-by-accident-you-borrow-feelings-you-didn-t-earn",
      "keyword_key": "h2_head_hopping_by_accident",
      "keywords": [
        "panic",
        "head-hopping",
        "wrong thoughts",
        "slipping lens",
        "dread",
        "betrayal",
        "show-not-tell",
        "eyes",
        "body language"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Head-hopping in third person limited happens when narration reveals thoughts or feelings of a character who isn't the viewpoint. In theory you know that. In practice, you smuggle it in through \"motive sentences.\""
        },
        {
          "type": "paragraph",
          "text": "You'll see it as:"
        },
        {
          "type": "list",
          "items": [
            "\"He suspected\u2026\" (fine if *he* is the viewpoint, wrong if he isn't)",
            "\"She regretted\u2026\" (wrong unless the regret is observed or directly inferred from viewpoint-knowledge)",
            "\"He wanted\u2026\" (same issue)"
          ]
        },
        {
          "type": "paragraph",
          "text": "This is how you end up with a haunted third person narration\u2014like the camera keeps changing hands while you're filming one scene."
        },
        {
          "type": "paragraph",
          "text": "**Fix it with observable behavior:** when you feel the urge to mind-read, force yourself into what the viewpoint sees:"
        },
        {
          "type": "list",
          "items": [
            "throat tightens,",
            "stalled sentence,",
            "averted eye contact,",
            "fidgeting,",
            "too-fast politeness,",
            "refusal to answer."
          ]
        },
        {
          "type": "blockquote",
          "text": "\"How to avoid head-hopping in third person: replace mind-reading with observable cues.\""
        },
        {
          "type": "paragraph",
          "text": "**Concrete example (before \u2192 after):** **Before (head-hopping):** \"Mara apologized, but Jules could tell she was scared of being honest.\" **After (limited):** \"Mara apologized. Her hands kept finding the edge of the table, then letting go. Jules waited for the rest of the truth that never came.\""
        },
        {
          "type": "paragraph",
          "text": "Now the reader learns what Jules can learn: the apology, the body language, the gap."
        },
        {
          "type": "paragraph",
          "text": "If you can't point to a behavior the viewpoint would notice, you probably wrote a private motive sentence that the POV contract doesn't authorize."
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_19/day_261/third-person-limited-mistakes-that-make-your-narration-feel-haunted-and-how-to/blog/blog_section_image_panic_head_hopping_blog_section_landscape_ce3ec41af880.gif",
        "alt": "2) You're head-hopping by accident (you \"borrow\" feelings you didn't earn)",
        "width": 356,
        "height": 200,
        "creator": "Giphy",
        "creatorUrl": "https://giphy.com/gifs/8HqjtoyKrnfJC",
        "provider": "giphy",
        "role": "section"
      }
    },
    {
      "section_id": "h2_switching_close_and_distant_without_markers",
      "heading": "3) You switch close and distant without markers (POV whiplash)",
      "heading_slug": "3-you-switch-close-and-distant-without-markers-pov-whiplash",
      "keyword_key": "h2_switching_close_and_distant_without_markers",
      "keywords": [
        "whiplash",
        "distance",
        "inconsistency",
        "camera jump",
        "scene confusion",
        "fix",
        "anchor details",
        "viewpoint grip",
        "rhythm"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Third person limited doesn't mean \"stay identical distance forever.\" It *does* mean you can't randomly widen the lens and pretend nothing changed."
        },
        {
          "type": "paragraph",
          "text": "Writers mess this up when they use author-level narration tricks:"
        },
        {
          "type": "list",
          "items": [
            "summary instead of close observation,",
            "\"time passed\" with emotional interpretation,",
            "background that feels omniscient because it's not tied to the viewpoint character's active experience."
          ]
        },
        {
          "type": "paragraph",
          "text": "The reader feels it as whiplash: one paragraph is inside the viewpoint's breath, the next paragraph is suddenly a camera zoomed out with commentary."
        },
        {
          "type": "paragraph",
          "text": "**Fix it:** pick one anchor for each scene and keep returning to it:"
        },
        {
          "type": "list",
          "items": [
            "a physical action the viewpoint does repeatedly (rubbing a ring, gripping a bag strap),",
            "a specific sensory detail tied to viewpoint perception (sound level, light angle),",
            "a short list of what the viewpoint character wants right now."
          ]
        },
        {
          "type": "paragraph",
          "text": "When you want to zoom out, earn it: \"From Jules's seat\u2026\" or \"From the hallway\u2026\"\u2014not as a repeated crutch, but as a consistency tether."
        },
        {
          "type": "paragraph",
          "text": "**Concrete example (before \u2192 after):** **Before (distance jump):** \"Jules stared at Mara. She was the kind of person who always lied when it mattered.\" **After (still limited):** \"Jules stared at Mara. The apology came quick, too practiced, and when she paused he heard what she wasn't saying.\""
        },
        {
          "type": "paragraph",
          "text": "The \"kind of person\" line reads like narrator judgment. The revised version locks to Jules's perception in the moment."
        }
      ],
      "image": null
    },
    {
      "section_id": "h2_explaining_internals_instead_of_showing_behavior",
      "heading": "4) You explain internals instead of showing behavior (you're writing mind-reading for drama)",
      "heading_slug": "4-you-explain-internals-instead-of-showing-behavior-you-re-writing-mind",
      "keyword_key": "h2_explaining_internals_instead_of_showing_behavior",
      "keywords": [
        "mind-reading",
        "tell-not-show",
        "behavior cues",
        "fidget",
        "avoidance",
        "deceit",
        "suspense",
        "fixation",
        "fix-it pass"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Writers don't always head-hop by naming another character's feelings directly. Sometimes they do it by narrating certainty."
        },
        {
          "type": "paragraph",
          "text": "Example patterns:"
        },
        {
          "type": "list",
          "items": [
            "\"He didn't mean it, he just wanted control.\"",
            "\"She was trying to manipulate him.\"",
            "\"They were hiding their guilt.\""
          ]
        },
        {
          "type": "paragraph",
          "text": "Even if you're not switching POV explicitly, you're still giving readers access to judgments the viewpoint character couldn't verify."
        },
        {
          "type": "paragraph",
          "text": "**Fix:** replace internal certainty with limited inference."
        },
        {
          "type": "list",
          "items": [
            "Use \"seemed,\" \"looked,\" \"felt\" only if grounded in viewpoint perception.",
            "Prefer action beats: withheld answers, defensive humor, sudden silence.",
            "If you must state an assumption, make it contingent: \"Jules guessed\u2026\""
          ]
        },
        {
          "type": "paragraph",
          "text": "**Concrete example (before \u2192 after):** **Before (mind-reading):** \"Jules knew Mara lied because she wanted him to doubt himself.\" **After (limited):** \"Mara lied. Jules didn't have proof, but her story changed every time he asked a follow-up, and that inconsistency made his own thoughts start second-guessing.\""
        },
        {
          "type": "paragraph",
          "text": "This keeps the narration in third person limited's allowed territory: what Jules notices, infers, and reacts to."
        }
      ],
      "image": null
    },
    {
      "section_id": "h2_overusing_third_person_limited_for_the_wrong_genre",
      "heading": "5) You're using third person limited for the wrong genre job",
      "heading_slug": "5-you-re-using-third-person-limited-for-the-wrong-genre-job",
      "keyword_key": "h2_overusing_third_person_limited_for_the_wrong_genre",
      "keywords": [
        "wrong tool",
        "cast size",
        "distance needs",
        "suspense expectations",
        "mystery",
        "thriller tone",
        "manage POVs",
        "decision",
        "genre match"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Third person limited for mystery and suspense can work great\u2014because suspense thrives on controlled revelation. But writers sometimes force it onto a structure where the cast needs broader coverage, then compensate with forbidden interior access."
        },
        {
          "type": "paragraph",
          "text": "You end up writing omniscient narration while using third person pronouns. Then you call it third person limited because technically you stayed in third."
        },
        {
          "type": "paragraph",
          "text": "**Fix:** decide if third person limited is doing the work you want:"
        },
        {
          "type": "list",
          "items": [
            "Tight suspense where the reader learns facts only as the viewpoint character learns them? Good fit.",
            "Multiple competing motives where the reader needs frequent shifts? You may need multiple viewpoint characters with ruthless POV discipline, or the genre goals don't match your chosen distance."
          ]
        },
        {
          "type": "paragraph",
          "text": "When to use third person limited POV depends on what the story actually needs. Don't treat it like a default. Treat it like a contract with your own draft."
        },
        {
          "type": "paragraph",
          "text": "**Concrete example:** If your story has 6 POV-relevant characters and each scene revolves around uncovering a different hidden agenda, but you only commit to one viewpoint, you'll constantly be tempted to \"explain\" the other character's interiority. That's head-hopping fuel wearing a \"limited\" costume."
        }
      ],
      "image": null
    },
    {
      "section_id": "h2_no_self_audit_method",
      "heading": "6) You don't have a self-audit method, so revision becomes guesswork",
      "heading_slug": "6-you-don-t-have-a-self-audit-method-so-revision-becomes-guesswork",
      "keyword_key": "h2_no_self_audit_method",
      "keywords": [
        "no system",
        "guesswork",
        "revision dread",
        "audit method",
        "line scan",
        "sentence check",
        "confidence",
        "fix"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "This is the pain point that creates the spiral: \"I'm sure I'm fine\" \u2192 beta readers find a POV slip \u2192 writer argues semantics \u2192 repeat."
        },
        {
          "type": "paragraph",
          "text": "Many writers revise by reading for plot. That catches missing events. It doesn't reliably catch perspective violations."
        },
        {
          "type": "paragraph",
          "text": "**Fix:** do a line-by-line POV contract audit. Here's a method you can run in 20\u201340 minutes per chapter."
        },
        {
          "type": "subheading",
          "text": "The POV contract audit (quick + ruthless)"
        },
        {
          "type": "paragraph",
          "text": "1. Circle the viewpoint character's name and anchor phrases. 2. For every paragraph, ask: *What does the viewpoint character perceive right now?* 3. Red-flag any sentence that contains:"
        },
        {
          "type": "list",
          "items": [
            "a non-viewpoint character's internal emotion,",
            "certainty about non-viewpoint motives,",
            "\"thought access\" without a behavior trigger."
          ]
        },
        {
          "type": "paragraph",
          "text": "4. Rewrite red-flag sentences into one of these approved forms:"
        },
        {
          "type": "list",
          "items": [
            "observed action,",
            "viewpoint-justified inference,",
            "direct dialogue (which the viewpoint can hear)."
          ]
        },
        {
          "type": "subheading",
          "text": "Before/after rewrite exercise"
        },
        {
          "type": "paragraph",
          "text": "**Before (problem):** \"Mara was offended, and she hated that Jules kept asking.\" **After (limited rewrite):** \"Mara's smile tightened. Jules asked again anyway\u2014and the words stuck in her throat before she answered.\""
        },
        {
          "type": "paragraph",
          "text": "Same power. No stolen mind space."
        },
        {
          "type": "paragraph",
          "text": "This is the difference between \"it feels right\" and \"it's structurally right,\" and it's how you stop repeating the same head-hopping patterns in your narration."
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
          "text": "You're not failing because third person limited is \"hard.\" You're failing because your draft doesn't enforce the POV contract. The common mistakes are:"
        },
        {
          "type": "paragraph",
          "text": "1) definition drift, 2) head-hopping via motive sentences, 3) closeness/distance whiplash, 4) mind-reading instead of behavior, 5) wrong POV choice for the story's suspense needs, 6) no POV audit method."
        }
      ],
      "image": null
    }
  ],
  "closingImage": null,
  "alsoLike": [
    {
      "title": "6 mystery mistakes that kill suspense (and what to do instead)",
      "url": "https://writequeryhook.com/blog/6-mystery-mistakes-that-kill-suspense-and-what-to-do-instead"
    },
    {
      "title": "Short stories won't fix your novel\u2014until you stop these 7 mistakes",
      "url": "https://writequeryhook.com/blog/short-stories-won-t-fix-your-novel-until-you-stop-these-7-mistakes"
    },
    {
      "title": "Fact-checking in editing: the one habit that stops \"common knowledge\" from wrecking your manuscript",
      "url": "https://writequeryhook.com/blog/fact-checking-in-editing-the-one-habit-that-stops-common-knowledge-from"
    },
    {
      "title": "How to Get an Agent's Attention From the First Page: 6 Edits That Pay Off",
      "url": "https://writequeryhook.com/blog/how-to-get-an-agent-s-attention-from-the-first-page-6-edits-that-pay-off"
    }
  ],
  "alsoLikeAfterIndex": 4,
  "faq": [
    {
      "question": "What does third person limited mean?",
      "answer": "It means the narrator tells the story from one character's perspective at a time, using third-person pronouns. The narration can only share what the viewpoint character knows, feels, perceives, thinks, guesses, or hopes."
    },
    {
      "question": "How is third person limited different from third person omniscient?",
      "answer": "Third person omniscient has an all-knowing narrator who can reveal more than any single character. Third person limited vs omniscient boils down to this: limited stays restricted to one character's perspective at a time, similar in closeness to first person, while omniscient roams freely."
    },
    {
      "question": "What are the main advantages of third person limited?",
      "answer": "It creates strong narrative empathy by giving access to a character's inner thoughts and emotions. It can also feel slightly more reliable than first person and supports uncertainty, revelations, and plot twists."
    },
    {
      "question": "What is head-hopping in third person limited?",
      "answer": "Head-hopping is when the narration reveals thoughts or feelings of a character who isn't the current viewpoint character. In third person limited, this is especially damaging because it violates the POV restriction."
    },
    {
      "question": "When should a writer choose third person limited POV?",
      "answer": "Choose it based on how much distance you want and whether the story needs the reader to be up close all the time. Third person limited for mystery and suspense works well because controlled revelation builds tension. But if you need frequent interior access for many characters, you'll want multiple POVs with the same strict narration discipline, or another approach entirely."
    }
  ],
  "closingBlocks": [
    {
      "type": "paragraph",
      "text": "Stop trusting smooth prose. Run the POV contract audit, rewrite any mind-reading into observable behavior, and your narration will stop feeling haunted\u2014because it will finally be limited for real, not for marketing."
    },
    {
      "type": "paragraph",
      "text": "Now go fix the next chapter you're procrastinating on."
    }
  ],
  "relatedLinks": [
    {
      "title": "How to stress-test female characters: a case-study on agency, Bechdel, and point of view",
      "url": "https://writequeryhook.com/blog/how-to-stress-test-female-characters-a-case-study-on-agency-bechdel-and-point"
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
      "@id": "https://writequeryhook.com/blog/third-person-limited-mistakes-that-make-your-narration-feel-haunted-and-how-to#breadcrumb",
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
          "name": "Third person limited mistakes that make your narration feel haunted (and how to fix them)",
          "item": "https://writequeryhook.com/blog/third-person-limited-mistakes-that-make-your-narration-feel-haunted-and-how-to"
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": "https://writequeryhook.com/blog/third-person-limited-mistakes-that-make-your-narration-feel-haunted-and-how-to#webpage",
      "url": "https://writequeryhook.com/blog/third-person-limited-mistakes-that-make-your-narration-feel-haunted-and-how-to",
      "name": "Third person limited mistakes that make your narration feel haunted (and how to fix them)",
      "isPartOf": {
        "@id": "https://writequeryhook.com/#website"
      },
      "inLanguage": "en-US",
      "primaryImageOfPage": {
        "@id": "https://writequeryhook.com/blog/third-person-limited-mistakes-that-make-your-narration-feel-haunted-and-how-to#primaryimage"
      },
      "breadcrumb": {
        "@id": "https://writequeryhook.com/blog/third-person-limited-mistakes-that-make-your-narration-feel-haunted-and-how-to#breadcrumb"
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
      "@id": "https://writequeryhook.com/blog/third-person-limited-mistakes-that-make-your-narration-feel-haunted-and-how-to#article",
      "isPartOf": {
        "@id": "https://writequeryhook.com/blog/third-person-limited-mistakes-that-make-your-narration-feel-haunted-and-how-to#webpage"
      },
      "mainEntityOfPage": "https://writequeryhook.com/blog/third-person-limited-mistakes-that-make-your-narration-feel-haunted-and-how-to",
      "headline": "Third person limited mistakes that make your narration feel haunted (and how to fix them)",
      "alternativeHeadline": "Third person limited mistakes that make your narration feel haunted (and how to fix them)",
      "description": "If your third person limited draft feels off\u2014like the emotional lens keeps slipping, even when you swear you're \"staying in one head\"\u2014that's usually not vibes. It's the POV contract breaking in small, almost-invisible ways.",
      "wordCount": 1854,
      "timeRequired": "PT9M",
      "articleSection": "Querying",
      "keywords": [
        "sample pages",
        "craft",
        "revision",
        "querying",
        "pov contract",
        "head-hopping",
        "confusion",
        "consistency",
        "narration control",
        "audit",
        "show-not-tell",
        "mystery"
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
        "@id": "https://writequeryhook.com/blog/third-person-limited-mistakes-that-make-your-narration-feel-haunted-and-how-to#primaryimage"
      },
      "datePublished": "2027-01-25",
      "dateModified": "2027-01-25",
      "mentions": [
        {
          "@type": "WebPage",
          "name": "How to stress-test female characters: a case-study on agency, Bechdel, and point of view",
          "url": "https://writequeryhook.com/blog/how-to-stress-test-female-characters-a-case-study-on-agency-bechdel-and-point"
        },
        {
          "@type": "WebPage",
          "name": "6 mystery mistakes that kill suspense (and what to do instead)",
          "url": "https://writequeryhook.com/blog/6-mystery-mistakes-that-kill-suspense-and-what-to-do-instead"
        },
        {
          "@type": "WebPage",
          "name": "Short stories won't fix your novel\u2014until you stop these 7 mistakes",
          "url": "https://writequeryhook.com/blog/short-stories-won-t-fix-your-novel-until-you-stop-these-7-mistakes"
        },
        {
          "@type": "WebPage",
          "name": "Fact-checking in editing: the one habit that stops \"common knowledge\" from wrecking your manuscript",
          "url": "https://writequeryhook.com/blog/fact-checking-in-editing-the-one-habit-that-stops-common-knowledge-from"
        },
        {
          "@type": "WebPage",
          "name": "How to Get an Agent's Attention From the First Page: 6 Edits That Pay Off",
          "url": "https://writequeryhook.com/blog/how-to-get-an-agent-s-attention-from-the-first-page-6-edits-that-pay-off"
        }
      ]
    },
    {
      "@type": "ImageObject",
      "@id": "https://writequeryhook.com/blog/third-person-limited-mistakes-that-make-your-narration-feel-haunted-and-how-to#primaryimage",
      "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_19/day_261/third-person-limited-mistakes-that-make-your-narration-feel-haunted-and-how-to/blog/blog_hero_dread_haunted_narration_blog_hero_landscape_bd0465d433b3.jpeg?updatedAt=1781685790097",
      "width": 6000,
      "height": 4000,
      "caption": "blog hero \u00b7 dread haunted narration",
      "creditText": "Heber Vazquez",
      "author": {
        "@type": "Person",
        "name": "Heber Vazquez",
        "url": "https://www.pexels.com/@unpoquitodefoto"
      },
      "@context": "https://schema.org"
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": "https://writequeryhook.com/blog/third-person-limited-mistakes-that-make-your-narration-feel-haunted-and-how-to#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What does third person limited mean?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "It means the narrator tells the story from one character's perspective at a time, using third-person pronouns. The narration can only share what the viewpoint character knows, feels, perceives, thinks, guesses, or hopes."
          }
        },
        {
          "@type": "Question",
          "name": "How is third person limited different from third person omniscient?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Third person omniscient has an all-knowing narrator who can reveal more than any single character. Third person limited vs omniscient boils down to this: limited stays restricted to one character's perspective at a time, similar in closeness to first person, while omniscient roams freely."
          }
        },
        {
          "@type": "Question",
          "name": "What are the main advantages of third person limited?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "It creates strong narrative empathy by giving access to a character's inner thoughts and emotions. It can also feel slightly more reliable than first person and supports uncertainty, revelations, and plot twists."
          }
        },
        {
          "@type": "Question",
          "name": "What is head-hopping in third person limited?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Head-hopping is when the narration reveals thoughts or feelings of a character who isn't the current viewpoint character. In third person limited, this is especially damaging because it violates the POV restriction."
          }
        },
        {
          "@type": "Question",
          "name": "When should a writer choose third person limited POV?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Choose it based on how much distance you want and whether the story needs the reader to be up close all the time. Third person limited for mystery and suspense works well because controlled revelation builds tension. But if you need frequent interior access for many characters, you'll want multiple POVs with the same strict narration discipline, or another approach entirely."
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
