import type { Metadata } from 'next';
import { Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BlogBackLink } from '@/components/blog/BlogBackLink';

const PAGE_DATA = {
  "slug": "rejection-isn-t-the-enemy-7-anti-patterns-that-keep-us-stuck",
  "title": "Rejection isn't the enemy: 7 anti-patterns that keep us stuck",
  "description": "Rejection shows up like a tax bill: inevitable, annoying, and never timed to your best mood. The contrarian part? The problem usually isn't the rejection.",
  "readTime": "9 min read",
  "publishedDate": "2027-02-07",
  "modifiedDate": "2027-02-07",
  "canonicalUrl": "https://writequeryhook.com/blog/rejection-isn-t-the-enemy-7-anti-patterns-that-keep-us-stuck",
  "siteUrl": "https://writequeryhook.com",
  "siteName": "Write Query Hook",
  "locale": "en-US",
  "articleSection": "Querying",
  "keywords": [
    "slush mental game",
    "resilience",
    "rejection",
    "spiral",
    "stubbornness",
    "breath",
    "receipts",
    "reset",
    "momentum",
    "stubborn hope",
    "indignation",
    "pivot"
  ],
  "author": null,
  "hero": {
    "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_20/day_274/rejection-isn-t-the-enemy-7-anti-patterns-that-keep-us-stuck/blog/blog_hero_rejection_letter_doomscroll_blog_hero_landscape_8594df5d5ba4.jpeg",
    "alt": "blog hero \u00b7 rejection letter doomscroll",
    "width": 6000,
    "height": 4000,
    "creator": "alleksana",
    "creatorUrl": "https://www.pexels.com/@alleksana",
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
      "name": "Rejection isn't the enemy: 7 anti-patterns that keep us stuck",
      "item": "https://writequeryhook.com/blog/rejection-isn-t-the-enemy-7-anti-patterns-that-keep-us-stuck"
    }
  ],
  "tldrBlocks": [],
  "openingBlocks": [
    {
      "type": "paragraph",
      "text": "Rejection shows up like a tax bill: inevitable, annoying, and never timed to your best mood. The contrarian part? The problem usually isn't the rejection."
    },
    {
      "type": "paragraph",
      "text": "It's how we behave after it."
    },
    {
      "type": "paragraph",
      "text": "Most advice treats rejection like a monster we need to \"process\" until it stops being painful. Cute. Ineffective. Most of us don't need a kinder emotion\u2014we need a tighter loop between **what happened**, **what we learn**, and **what we do next**. Preferably without dissolving into a doomscroll."
    },
    {
      "type": "paragraph",
      "text": "I built Write Query Hook because the process around submissions is its own second job. When rejection hits, the mental math starts. Here are the anti-patterns that keep that math wrong\u2014plus fixes you can actually try today."
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
            "Stop treating the first rejection like final proof. Treat it like a signal with context.",
            "Don't freeze until your feelings feel \"handled.\" Query cycles don't wait for mood.",
            "Don't write emotionally \"clean\" follow-ups that hide your real question.",
            "Don't analyze only the material you sent; analyze fit and channel too.",
            "Don't hunt one magic reason. Use a small set of plausible explanations.",
            "Don't compare your rejection pile to other writers' wins. Different timelines, different luck.",
            "Don't confuse \"closure\" with \"certainty.\" Closure is what you do, not what you know."
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
          "text": "Most writers don't spiral because they're weak. They spiral because rejection creates a vacuum. In that vacuum, your brain invents a story: *They hated it. It's broken. I'm broken.* Then you try to soothe that story with advice that sounds compassionate but doesn't change the behavior."
        },
        {
          "type": "paragraph",
          "text": "And then\u2014because the brain wants continuity\u2014you start repeating the same moves: panic-refresh, re-read the same query line, rewrite the same paragraph, delay the next submission until the mood improves."
        },
        {
          "type": "paragraph",
          "text": "Rejection isn't a prophecy. It's one stamp in the machine. The six worst anti-patterns below are the ones that turn one stamp into an identity."
        },
        {
          "type": "blockquote",
          "text": "\"If you treat every rejection like a verdict, you'll never collect enough receipts to improve.\""
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_20/day_274/rejection-isn-t-the-enemy-7-anti-patterns-that-keep-us-stuck/blog/blog_section_image_opening_blog_section_landscape_12d7189c7734.gif?updatedAt=1781693039659",
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
      "section_id": "h2_you_treat_the_first_rejection_as_the_story_itself",
      "heading": "You treat the rejection like the story itself",
      "heading_slug": "you-treat-the-rejection-like-the-story-itself",
      "keyword_key": "h2_you_treat_the_first_rejection_as_the_story_itself",
      "keywords": [
        "panic",
        "doom",
        "i knew it",
        "finality",
        "spiraling",
        "dread",
        "clenched jaw",
        "eye roll",
        "certainty"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Here's the mental game anti-pattern: you get a rejection, then your brain edits the entire narrative to match it."
        },
        {
          "type": "paragraph",
          "text": "One rejection becomes: *\"They didn't get it.\"* Then: *\"I can't write this category.\"* Then: *\"I should quit.\"* That's not analysis\u2014that's drama production. (Yes, I know that's harsh. It's also accurate.)"
        },
        {
          "type": "paragraph",
          "text": "Why it happens: because rejection is the sharpest event you've got in the moment. Your brain grabs it and tries to make the world make sense fast."
        },
        {
          "type": "paragraph",
          "text": "Fix: separate **event** from **conclusion**."
        },
        {
          "type": "list",
          "items": [
            "Log what you know: date, submission type (query only vs query + pages), and any response language you got.",
            "Write one working hypothesis (not a courtroom sentence): \"Fit likely missed\" or \"hook might be unclear\" or \"timing/availability might be off.\"",
            "Then do the next action that doesn't require emotional agreement."
          ]
        },
        {
          "type": "paragraph",
          "text": "Concrete example: You sent a query for a 2026 debut novel. Two weeks later: form rejection. You mark that a form rejection likely means no personal notes at that moment, or the manuscript wasn't a match. You revise the first scene's inciting movement, check the agent's recent MSWL posts for stronger fit, and submit to a new batch. You're testing hypotheses against real targets, not kneeling to verdicts."
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_20/day_274/rejection-isn-t-the-enemy-7-anti-patterns-that-keep-us-stuck/blog/blog_section_image_panic_doom_blog_section_landscape_84c69ef612fe.jpeg?updatedAt=1781693040622",
        "alt": "You treat closure like certainty",
        "width": 4240,
        "height": 2384,
        "creator": "Skylar Kang",
        "creatorUrl": "https://www.pexels.com/@skylar-kang",
        "provider": "pexels",
        "role": "section"
      }
    },
    {
      "section_id": "h2_you_aim_for_emotionally_clean_responses",
      "heading": "You're aiming for emotionally clean responses instead of useful ones",
      "heading_slug": "you-re-aiming-for-emotionally-clean-responses-instead-of-useful-ones",
      "keyword_key": "h2_you_aim_for_emotionally_clean_responses",
      "keywords": [
        "stiff upper lip",
        "numbness",
        "anxiety",
        "self-censorship",
        "awkward drafts",
        "breath",
        "rigidity",
        "facepalm"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Another anti-pattern: you try to write your way out of discomfort."
        },
        {
          "type": "paragraph",
          "text": "So you over-correct. You hide the real question. You sound \"professional\" in a way that actually turns your message into mush. Or you draft the reply (or the next query) like you're apologizing for existing."
        },
        {
          "type": "paragraph",
          "text": "This shows up after rejection when you want control. But \"emotionally clean\" turns into \"information-free.\""
        },
        {
          "type": "paragraph",
          "text": "Fix: write for **decision-making**, not mood management."
        },
        {
          "type": "paragraph",
          "text": "A useful response (even if it's \"thanks, noted\") has:"
        },
        {
          "type": "list",
          "items": [
            "one line acknowledging the request/result,",
            "one line showing you understand what's being asked (if asked),",
            "one line with an actual next step\u2014when relevant."
          ]
        },
        {
          "type": "paragraph",
          "text": "Concrete example: An agent form rejection requests \"if there's new material, feel free to reach out.\" Emotionally clean trap: you send a vague \"Thanks for your time; I hope to connect again.\" Useful version: \"Thanks for the note. I've revised the opening with a clearer inciting incident (same premise, tightened scenes). If you're open to it, I can send updated pages with the changes.\""
        },
        {
          "type": "paragraph",
          "text": "And if there's no instruction to follow up? Then don't manufacture follow-up just to soothe yourself. You can let it be done and move on to the next submission wave."
        },
        {
          "type": "paragraph",
          "text": "Sending a useless, mushy \"professional\" note is a great way to keep yourself stuck in your own head. It's not communication\u2014it's self-soothing with punctuation, crap."
        }
      ],
      "image": null
    },
    {
      "section_id": "h2_you_wait_to_feel_ready_before_you_query_again",
      "heading": "You wait to feel ready before querying again",
      "heading_slug": "you-wait-to-feel-ready-before-querying-again",
      "keyword_key": "h2_you_wait_to_feel_ready_before_you_query_again",
      "keywords": [
        "procrastination",
        "blank-page",
        "deadline",
        "sunk cost",
        "resist",
        "cursor blinking",
        "misery",
        "fist pump"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "This one is the quiet killer. You think, *\"Once I feel better, I'll submit.\"* So you \"recover\" long enough that your draft becomes stale, your confidence collapses, and the next submission batch turns into a monthly fantasy."
        },
        {
          "type": "paragraph",
          "text": "Your brain calls it self-care. Your calendar calls it procrastination."
        },
        {
          "type": "paragraph",
          "text": "Fix: use a two-stage approach\u2014**feel later, act now**."
        },
        {
          "type": "list",
          "items": [
            "Stage 1 (15 minutes): make the submission list + pick your next batch of targets.",
            "Stage 2 (draft later): send the query/materials you already have the stamina to send."
          ]
        },
        {
          "type": "paragraph",
          "text": "No waiting for catharsis. You can grieve after you hit submit. Moods don't control the \"send\" button."
        },
        {
          "type": "paragraph",
          "text": "Concrete example: You get rejection on Monday. By Tuesday, you revise one paragraph (not the whole manuscript), update your query to reflect the tightened hook, and re-submit to 10 new agents on your list Thursday. If you wait until the dread disappears, the dread will schedule itself for next week, because dread is a roommate."
        },
        {
          "type": "paragraph",
          "text": "Contrarian truth: feelings are allowed to suck. The work still goes out."
        }
      ],
      "image": null
    },
    {
      "section_id": "h2_you_only_analyze_the_thing_you_sent",
      "heading": "You only analyze the thing you sent",
      "heading_slug": "you-only-analyze-the-thing-you-sent",
      "keyword_key": "h2_you_only_analyze_the_thing_you_sent",
      "keywords": [
        "blind spots",
        "tunnel vision",
        "slanted notes",
        "confusion",
        "revision",
        "sticky notes",
        "clarity",
        "what now?"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "This is a super common mental trap: you treat the manuscript like a solo performance. You obsess over your query letter, your synopsis, your opening pages, your comps\u2014only those."
        },
        {
          "type": "paragraph",
          "text": "But submission is not just craft. It's fit + timing + packaging + how the agent actually reads. You can write a brilliant query and still miss the person who's actively reading your kind of story."
        },
        {
          "type": "paragraph",
          "text": "Fix: analyze the process, not just the pages."
        },
        {
          "type": "paragraph",
          "text": "Use three buckets: 1. **Fit** (genre/subgenre, audience promise, reader expectations) 2. **Positioning** (hook clarity, premise clarity, comps that function as shortcuts) 3. **Channel mechanics** (what they asked for, whether they were open/closed, what kind of form rejection you got)"
        },
        {
          "type": "paragraph",
          "text": "Concrete example: You get a rejection after a query that feels \"clean.\" Your analysis focuses only on wording. But your bucket check reveals: the agent closed to submissions right after you sent; you might have hit the \"we're not actively reading\" window. Or you discover your comps don't match the agent's typical range (even if they're good books). Your fix isn't \"rewrite everything.\" Your fix is targeted: swap one comp for one with closer market position and adjust your first-paragraph premise framing."
        },
        {
          "type": "paragraph",
          "text": "If this sounds like \"more work,\" yeah. It is. But it's also how you stop blaming your draft for problems you can actually change."
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_20/day_274/rejection-isn-t-the-enemy-7-anti-patterns-that-keep-us-stuck/blog/blog_section_image_blind_spots_tunnel_vision_blog_section_landscape_010f168d4a48.gif",
        "alt": "You only analyze the thing you sent",
        "width": 266,
        "height": 200,
        "creator": "Giphy",
        "creatorUrl": "https://giphy.com/gifs/tunnel-Xqi1trOx4HA6Q",
        "provider": "giphy",
        "role": "section"
      }
    },
    {
      "section_id": "h2_you_seek_one_magic_reason_for_rejection",
      "heading": "You seek one magic reason for rejection",
      "heading_slug": "you-seek-one-magic-reason-for-rejection",
      "keyword_key": "h2_you_seek_one_magic_reason_for_rejection",
      "keywords": [
        "obsession",
        "rumination",
        "conspiracy brain",
        "overthinking",
        "grip",
        "spiral",
        "frustration",
        "relief"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "This anti-pattern looks like obsession. You turn rejection into a scavenger hunt for a single culprit."
        },
        {
          "type": "paragraph",
          "text": "Then you spend weeks building a theory around one datapoint."
        },
        {
          "type": "paragraph",
          "text": "Fix: shrink the problem to a manageable set."
        },
        {
          "type": "paragraph",
          "text": "Pick two or three plausible causes\u2014not ten theories, not one divine explanation. For each cause, write a test:"
        },
        {
          "type": "list",
          "items": [
            "If the hook is unclear \u2192 rewrite first 150 words to make the inciting event land on page one.",
            "If fit is off \u2192 adjust comps + tighten audience promise.",
            "If materials pacing is slow \u2192 cut one scene and reflect that tightening in synopsis summary order."
          ]
        },
        {
          "type": "paragraph",
          "text": "Concrete example: You get a form rejection and no notes. Your brain says \"my writing style is bad.\" Your test plan says: tighten premise in query paragraph one and adjust synopsis to reveal conflict escalation in the first half. Then submit again. After five to ten submissions with that single change, you'll know if the pattern holds. One rejection can only tell you what you should test next."
        }
      ],
      "image": null
    },
    {
      "section_id": "h2_you_compare_your_rejections_to_other_writers_wins",
      "heading": "You compare your rejection pile to other writers' wins",
      "heading_slug": "you-compare-your-rejection-pile-to-other-writers-wins",
      "keyword_key": "h2_you_compare_your_rejections_to_other_writers_wins",
      "keywords": [
        "jealousy",
        "betrayal feelings",
        "social media guilt",
        "shame",
        "vindication",
        "deep breath",
        "focus"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "This one is mean to you. And it rarely helps you improve."
        },
        {
          "type": "paragraph",
          "text": "You scroll. You see someone post \"partial request!\" or \"offer!\" and your brain uses that as a measuring stick. Then your inner narrator goes: *Maybe my work is worse.* Or worse: *Maybe I chose the wrong thing.*"
        },
        {
          "type": "paragraph",
          "text": "Fix: compare your process to your process."
        },
        {
          "type": "list",
          "items": [
            "Same manuscript, different batch, different timing? That's not a score.",
            "Another writer's momentum is not your dashboard."
          ]
        },
        {
          "type": "paragraph",
          "text": "Use a \"same metric\" rule:"
        },
        {
          "type": "list",
          "items": [
            "Track **how many submissions** you've sent in a time window.",
            "Track **what you changed** between batches (one or two variables, max).",
            "Track **requests** as outcomes, not as proof of moral worth."
          ]
        },
        {
          "type": "paragraph",
          "text": "Concrete example: You and another writer both submit 30 queries in April. Their May has three partial requests. Your May has two form rejections. Comparison anti-pattern says \"I'm behind.\" Process comparison says: \"I didn't change anything between batches\" (or \"I changed too much at once,\" making it impossible to learn). Your fix is batch control: only revise one or two targeted elements per cycle so you can actually interpret results."
        },
        {
          "type": "paragraph",
          "text": "Also, no Slushie doomspiral. Keep it in the tool loop: write notes, make adjustments, move."
        }
      ],
      "image": null
    },
    {
      "section_id": "h2_you_treat_the_first_rejection_as_the_story_itself",
      "heading": "You treat closure like certainty",
      "heading_slug": "you-treat-closure-like-certainty",
      "keyword_key": "h2_you_treat_the_first_rejection_as_the_story_itself",
      "keywords": [
        "panic",
        "doom",
        "i knew it",
        "finality",
        "spiraling",
        "dread",
        "clenched jaw",
        "eye roll",
        "certainty"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Another anti-pattern: waiting for a clean emotional ending."
        },
        {
          "type": "paragraph",
          "text": "Rejection doesn't give closure. It gives information you didn't get. So writers invent closure: they decide they understand why it happened\u2014even when they don't."
        },
        {
          "type": "paragraph",
          "text": "Then they stop learning because they're \"done.\" It feels mature. It's actually avoidance wearing a robe."
        },
        {
          "type": "paragraph",
          "text": "Fix: choose closure-by-action."
        },
        {
          "type": "paragraph",
          "text": "Closure = you made a decision about what to do next, not you solved the mystery."
        },
        {
          "type": "paragraph",
          "text": "Use this decision rule after any rejection:"
        },
        {
          "type": "list",
          "items": [
            "If the reason is unknown \u2192 run the next test anyway.",
            "If you got feedback with specifics, incorporate it and send to the right targets.",
            "If nothing changes \u2192 revise one specific element (hook, positioning, or scene function) and submit."
          ]
        },
        {
          "type": "paragraph",
          "text": "Concrete example: You get rejected with no feedback. Closure-by-action means you revise your query opening to make the inciting event unmistakable and submit to agents with clearer fit. You don't convince yourself you know the cause. You're not \"accepting defeat.\" You're refusing to let the uncertainty turn into paralysis."
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_20/day_274/rejection-isn-t-the-enemy-7-anti-patterns-that-keep-us-stuck/blog/blog_section_image_panic_doom_blog_section_landscape_84c69ef612fe.jpeg?updatedAt=1781693040622",
        "alt": "You treat closure like certainty",
        "width": 4240,
        "height": 2384,
        "creator": "Skylar Kang",
        "creatorUrl": "https://www.pexels.com/@skylar-kang",
        "provider": "pexels",
        "role": "section"
      }
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
          "text": "You get stuck when you:"
        },
        {
          "type": "list",
          "items": [
            "treat rejection like the story,",
            "chase emotional cleanliness instead of usefulness,",
            "wait to feel ready,",
            "analyze only what you sent,",
            "hunt one magic reason,",
            "compare outcomes instead of process,",
            "confuse closure with certainty."
          ]
        },
        {
          "type": "paragraph",
          "text": "That's the whole loop. Break the loop, then keep your work moving."
        }
      ],
      "image": null
    }
  ],
  "closingImage": null,
  "alsoLike": [
    {
      "title": "Rejection isn\u2019t proof your writing is bad: 7 mistakes that make the sting worse",
      "url": "https://writequeryhook.com/blog/rejection-isn-t-proof-your-writing-is-bad-7-mistakes-that-make-the-sting-worse"
    },
    {
      "title": "Full-manuscript rejection mistakes writers keep making (and what to fix instead)",
      "url": "https://writequeryhook.com/blog/full-manuscript-rejection-mistakes-writers-keep-making-and-what-to-fix-instead"
    },
    {
      "title": "Writer burnout isn't \"can't write\"\u2014it's pressure fatigue you can unplug and recover from",
      "url": "https://writequeryhook.com/blog/writer-burnout-isn-t-can-t-write-it-s-pressure-fatigue-you-can-unplug-and"
    },
    {
      "title": "Tension in a Novel FAQ: How to Build Anticipation Without Losing Momentum",
      "url": "https://writequeryhook.com/blog/tension-in-a-novel-faq-how-to-build-anticipation-without-losing-momentum"
    }
  ],
  "alsoLikeAfterIndex": 4,
  "faq": [],
  "closingBlocks": [
    {
      "type": "paragraph",
      "text": "Rejection is inevitable. Pick one test, make one revision, send the next batch\u2014even if your stomach still thinks you're about to throw up."
    }
  ],
  "relatedLinks": [
    {
      "title": "Rejection isn\u2019t proof your writing is bad: 7 mistakes that make the sting worse",
      "url": "https://writequeryhook.com/blog/rejection-isn-t-proof-your-writing-is-bad-7-mistakes-that-make-the-sting-worse"
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
      "@id": "https://writequeryhook.com/blog/rejection-isn-t-the-enemy-7-anti-patterns-that-keep-us-stuck#breadcrumb",
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
          "name": "Rejection isn't the enemy: 7 anti-patterns that keep us stuck",
          "item": "https://writequeryhook.com/blog/rejection-isn-t-the-enemy-7-anti-patterns-that-keep-us-stuck"
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": "https://writequeryhook.com/blog/rejection-isn-t-the-enemy-7-anti-patterns-that-keep-us-stuck#webpage",
      "url": "https://writequeryhook.com/blog/rejection-isn-t-the-enemy-7-anti-patterns-that-keep-us-stuck",
      "name": "Rejection isn't the enemy: 7 anti-patterns that keep us stuck",
      "isPartOf": {
        "@id": "https://writequeryhook.com/#website"
      },
      "inLanguage": "en-US",
      "primaryImageOfPage": {
        "@id": "https://writequeryhook.com/blog/rejection-isn-t-the-enemy-7-anti-patterns-that-keep-us-stuck#primaryimage"
      },
      "breadcrumb": {
        "@id": "https://writequeryhook.com/blog/rejection-isn-t-the-enemy-7-anti-patterns-that-keep-us-stuck#breadcrumb"
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
      "@id": "https://writequeryhook.com/blog/rejection-isn-t-the-enemy-7-anti-patterns-that-keep-us-stuck#article",
      "isPartOf": {
        "@id": "https://writequeryhook.com/blog/rejection-isn-t-the-enemy-7-anti-patterns-that-keep-us-stuck#webpage"
      },
      "mainEntityOfPage": "https://writequeryhook.com/blog/rejection-isn-t-the-enemy-7-anti-patterns-that-keep-us-stuck",
      "headline": "Rejection isn't the enemy: 7 anti-patterns that keep us stuck",
      "alternativeHeadline": "Rejection isn\u2019t the enemy: 7 anti-patterns that keep us stuck",
      "description": "Rejection shows up like a tax bill: inevitable, annoying, and never timed to your best mood. The contrarian part? The problem usually isn't the rejection.",
      "wordCount": 1793,
      "timeRequired": "PT9M",
      "articleSection": "Querying",
      "keywords": [
        "slush mental game",
        "resilience",
        "rejection",
        "spiral",
        "stubbornness",
        "breath",
        "receipts",
        "reset",
        "momentum",
        "stubborn hope",
        "indignation",
        "pivot"
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
        "@id": "https://writequeryhook.com/blog/rejection-isn-t-the-enemy-7-anti-patterns-that-keep-us-stuck#primaryimage"
      },
      "datePublished": "2027-02-07",
      "dateModified": "2027-02-07",
      "mentions": [
        {
          "@type": "WebPage",
          "name": "Rejection isn\u2019t proof your writing is bad: 7 mistakes that make the sting worse",
          "url": "https://writequeryhook.com/blog/rejection-isn-t-proof-your-writing-is-bad-7-mistakes-that-make-the-sting-worse"
        },
        {
          "@type": "WebPage",
          "name": "Full-manuscript rejection mistakes writers keep making (and what to fix instead)",
          "url": "https://writequeryhook.com/blog/full-manuscript-rejection-mistakes-writers-keep-making-and-what-to-fix-instead"
        },
        {
          "@type": "WebPage",
          "name": "Writer burnout isn't \"can't write\"\u2014it's pressure fatigue you can unplug and recover from",
          "url": "https://writequeryhook.com/blog/writer-burnout-isn-t-can-t-write-it-s-pressure-fatigue-you-can-unplug-and"
        },
        {
          "@type": "WebPage",
          "name": "Tension in a Novel FAQ: How to Build Anticipation Without Losing Momentum",
          "url": "https://writequeryhook.com/blog/tension-in-a-novel-faq-how-to-build-anticipation-without-losing-momentum"
        }
      ]
    },
    {
      "@type": "ImageObject",
      "@id": "https://writequeryhook.com/blog/rejection-isn-t-the-enemy-7-anti-patterns-that-keep-us-stuck#primaryimage",
      "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_20/day_274/rejection-isn-t-the-enemy-7-anti-patterns-that-keep-us-stuck/blog/blog_hero_rejection_letter_doomscroll_blog_hero_landscape_8594df5d5ba4.jpeg",
      "width": 6000,
      "height": 4000,
      "caption": "blog hero \u00b7 rejection letter doomscroll",
      "creditText": "alleksana",
      "author": {
        "@type": "Person",
        "name": "alleksana",
        "url": "https://www.pexels.com/@alleksana"
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
