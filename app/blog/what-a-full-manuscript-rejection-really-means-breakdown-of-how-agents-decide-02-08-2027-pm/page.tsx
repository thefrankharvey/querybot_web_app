import type { Metadata } from 'next';
import { Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BlogBackLink } from '@/components/blog/BlogBackLink';

const PAGE_DATA = {
  "slug": "what-a-full-manuscript-rejection-really-means-breakdown-of-how-agents-decide",
  "title": "What a Full Manuscript Rejection Really Means (Breakdown of How Agents Decide Later, Not Just at the Opening)",
  "description": "You get the full manuscript request. You feel the dopamine hit in your shoulders. Then the rejection comes back anyway\u2014often with vague language that makes you stare at your draft like it personally betrayed you.",
  "readTime": "11 min read",
  "publishedDate": "2027-02-08",
  "modifiedDate": "2027-02-08",
  "canonicalUrl": "https://writequeryhook.com/blog/what-a-full-manuscript-rejection-really-means-breakdown-of-how-agents-decide",
  "siteUrl": "https://writequeryhook.com",
  "siteName": "Write Query Hook",
  "locale": "en-US",
  "articleSection": "Querying",
  "keywords": [
    "slush mental game",
    "submissions",
    "revision",
    "agents",
    "rejection",
    "gut-punch",
    "momentum",
    "revise",
    "keep querying",
    "receipt",
    "consistency",
    "pacing"
  ],
  "author": null,
  "hero": {
    "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_20/day_276/what-a-full-manuscript-rejection-really-means-breakdown-of-how-agents-decide/blog/blog_hero_dread_hopeful_request_blog_hero_landscape_7c9b5a5abcfe.jpeg",
    "alt": "blog hero \u00b7 dread hopeful request",
    "width": 3875,
    "height": 2848,
    "creator": "Alexandro David",
    "creatorUrl": "https://www.pexels.com/@alexandro-david-871783",
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
      "name": "What a Full Manuscript Rejection Really Means (Breakdown of How Agents Decide Later, Not Just at the Opening)",
      "item": "https://writequeryhook.com/blog/what-a-full-manuscript-rejection-really-means-breakdown-of-how-agents-decide"
    }
  ],
  "tldrBlocks": [],
  "openingBlocks": [
    {
      "type": "paragraph",
      "text": "You get the full manuscript request. You feel the dopamine hit in your shoulders. Then the rejection comes back anyway\u2014often with vague language that makes you stare at your draft like it personally betrayed you."
    },
    {
      "type": "paragraph",
      "text": "OK. Pause."
    },
    {
      "type": "paragraph",
      "text": "A full-manuscript rejection doesn't necessarily mean the query and opening were a lie. It usually means the manuscript didn't keep its promise when an agent had to read farther than the first \"this could work.\" And that's *exactly* why this breakdown matters: we're going to treat the manuscript as a whole document, because that's how agents actually evaluate it."
    },
    {
      "type": "paragraph",
      "text": "In this case study, we're not dissecting one magical \"successful\" submission. We're dissecting the most common failure point writers hit: getting blindsided by the fact that full reading is where consistency, pacing, plot development, and character work either lock in\u2014or fall apart."
    },
    {
      "type": "blockquote",
      "text": "\"A full request doesn't mean representation. It means the agent is willing to gamble their time on the long version of your pitch\u2014and your manuscript has to hold up when the shine wears off.\""
    },
    {
      "type": "paragraph",
      "text": "Along the way, we'll cover the stuff that makes writers spiral: **why agents ghost after full request**, how to **interpret silence and subjectivity**, and what **how to revise after full rejection** actually looks like in practice."
    },
    {
      "type": "paragraph",
      "text": "And yes, we'll talk about the part nobody wants to admit: sometimes the **story doesn't fit current market** expectations, and no amount of \"but it's good!\" can bully that into changing."
    }
  ],
  "sections": [
    {
      "section_id": "h2_what_to_do_when_ghosted_or_silent",
      "heading": "What \"later in the read\" problems look like (consistency, pacing, plot)",
      "heading_slug": "what-later-in-the-read-problems-look-like-consistency-pacing-plot",
      "keyword_key": "h2_what_to_do_when_ghosted_or_silent",
      "keywords": [
        "waiting",
        "anxiety",
        "spreadsheet",
        "follow-up email",
        "status check",
        "backlog",
        "deadline",
        "silence",
        "refusal",
        "relief"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "When agents reject after requesting a manuscript, the **reasons agents reject full manuscripts** tend to be boring in the worst way: the manuscript stops doing the job it was doing at the start. The query can land. The opening can intrigue. But later pages are where an agent tests whether the story is stable enough to advocate for."
        },
        {
          "type": "paragraph",
          "text": "Most writers don't get rejected because they can't write. They get rejected because the manuscript doesn't stay coherent under prolonged attention."
        },
        {
          "type": "subheading",
          "text": "The most common \"full read\" breakdown points"
        },
        {
          "type": "paragraph",
          "text": "**1) Consistency drifts.** Maybe the stakes make sense in chapter one, then get fuzzy by chapter nine. Maybe the character goals wobble. Maybe the timeline starts behaving like it has three different brains."
        },
        {
          "type": "paragraph",
          "text": "Agents aren't reading your manuscript like a fan. They're reading it like a professional trying to predict whether *their* client\u2014if they got you\u2014would be able to deliver the full story promise every time."
        },
        {
          "type": "paragraph",
          "text": "**2) Pacing changes its mind.** You can have good sentences and still have a slug of nothing happening. The \"why\" might be clear in your head, but on the page the middle drags. Or the midpoint arrives late because earlier scenes are busy but not moving."
        },
        {
          "type": "paragraph",
          "text": "**3) Plot development doesn't pay off what it sets up.** The opening shows an engine. Later, the gears might grind. Often it's not that something \"bad\" happens. It's that the sequence doesn't escalate the way genre readers expect, or the narrative spends time circling problems instead of solving them."
        },
        {
          "type": "subheading",
          "text": "Case-study excerpt (rejection language as a clue, not a verdict)"
        },
        {
          "type": "paragraph",
          "text": "Most rejection letters won't say \"your pacing collapses at page 240.\" But the *shape* of vague feedback often points to later-stage issues. Here's how writers misread those letters:"
        },
        {
          "type": "list",
          "items": [
            "They treat \"I didn't connect\" like a compliment you didn't earn.",
            "They treat \"the fit isn't right\" like a personal insult.",
            "They treat \"thank you for your submission\" like a black box."
          ]
        },
        {
          "type": "paragraph",
          "text": "If you were confident in the opening, the rejection still might be about the later read: consistency, pacing, plot, and character development weakening after the agent invested time beyond the first chunk."
        },
        {
          "type": "blockquote",
          "text": "\"Almost every full rejection is the same lesson: your manuscript has to be a single promise, not a chain of separate drafts.\""
        },
        {
          "type": "subheading",
          "text": "Generalizable lesson: audit the whole manuscript, not the beginning you're proud of"
        },
        {
          "type": "paragraph",
          "text": "Where does the manuscript start lying about itself? That's the real question writers need to ask instead of fixating on whether the opening worked."
        },
        {
          "type": "paragraph",
          "text": "Practical move for writers pursuing querying: make a scene-by-scene map and mark three things for every major sequence:"
        },
        {
          "type": "paragraph",
          "text": "1) What changes in the protagonist's situation? 2) What decision or action drives that change? 3) Does the next sequence pay off the promise the last sequence made?"
        },
        {
          "type": "paragraph",
          "text": "If the answer turns into \"they talk about it\" or \"the story drifts,\" that's your evidence that the later read is where your manuscript breaks."
        }
      ],
      "image": null
    },
    {
      "section_id": "h2_reasons_agents_use_fit_and_market_timing",
      "heading": "Reasons agents cite fit and market timing (taste, advocacy, and \"not this agent's lane\")",
      "heading_slug": "reasons-agents-cite-fit-and-market-timing-taste-advocacy-and-not-this-agent-s",
      "keyword_key": "h2_reasons_agents_use_fit_and_market_timing",
      "keywords": [
        "rage",
        "gatekeeping",
        "market mismatch",
        "genre expectations",
        "length",
        "structure",
        "taste",
        "advocacy",
        "subjectivity",
        "vindication"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Agents evaluate three layers when they read a full: how the manuscript holds together from page one to the end, whether the story matches the specific clients they're trying to build, and what buyers are actually acquiring that season. The **cluster rejection \u2192 reasons agents reject full manuscripts** connects directly to **how to pick the right literary agent** and understanding why your **story doesn't fit current market** expectations."
        },
        {
          "type": "paragraph",
          "text": "Because sometimes you're rejected because an agent's advocacy style, current client strategy, and the market's seasonal mood don't align with your specific story shape."
        },
        {
          "type": "subheading",
          "text": "Fit issues can be disguised as \"merit\""
        },
        {
          "type": "paragraph",
          "text": "You can have a manuscript with clear craft strengths and still not land, because:"
        },
        {
          "type": "list",
          "items": [
            "**The agent wants a different flavor** of that genre (tone, structure, theme density, pacing expectations).",
            "**The agent's current list** may already cover similar projects, leaving less room for yours.",
            "**The market lens** may be narrowing\u2014length, subgenre conventions, and story architecture can shift how \"right\" something feels."
          ]
        },
        {
          "type": "paragraph",
          "text": "That's why a full manuscript rejection can include feedback that sounds like it's about you, when it's actually about the agent's ability to sell *this particular shape* of story."
        },
        {
          "type": "subheading",
          "text": "Personalized feedback doesn't always equal \"you're close\""
        },
        {
          "type": "paragraph",
          "text": "Writers get hung up on personalized feedback. That can be good news, sure. Sometimes it means the agent saw enough to want a conversation later."
        },
        {
          "type": "paragraph",
          "text": "But it can also mean: \"This is good, and I still can't be the right advocate.\""
        },
        {
          "type": "paragraph",
          "text": "So when someone asks **how to revise after full rejection**, they need to separate two questions:"
        },
        {
          "type": "paragraph",
          "text": "1) \"What will improve my odds generally?\" 2) \"What will improve fit with *this* agent *right now*?\""
        },
        {
          "type": "paragraph",
          "text": "If the rejection is about later manuscript mechanics, revising the whole manuscript can fix it. If it's about agent fit, revising might improve your chances broadly\u2014but it won't magically make the same agent fall in love with a lane they don't take."
        },
        {
          "type": "subheading",
          "text": "Case-study excerpt (an \"advocacy\" signal hidden inside polite prose)"
        },
        {
          "type": "paragraph",
          "text": "Here's the kind of thing that shows up in real rejections:"
        },
        {
          "type": "blockquote",
          "text": "\"Thank you for sharing\u2026 I don't feel I can champion this effectively.\""
        },
        {
          "type": "paragraph",
          "text": "That's not \"you're not good enough.\" It's \"you're not the agent's sales pitch right now.\""
        },
        {
          "type": "blockquote",
          "text": "\"Rejections are often about fit and market timing, not just talent.\""
        },
        {
          "type": "subheading",
          "text": "Generalizable lesson: stop treating every full rejection as a ranking of writing ability"
        },
        {
          "type": "paragraph",
          "text": "If the rejection suggests fit issues, momentum comes from two moves:"
        },
        {
          "type": "list",
          "items": [
            "**Revise for structural clarity** (so the manuscript competes better across markets).",
            "**Select agents differently next round** (so the manuscript goes to people who actually want to advocate for that exact kind of story)."
          ]
        },
        {
          "type": "paragraph",
          "text": "This is how you keep the **publishing** process from turning into a single-agent heartbreak loop."
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_20/day_276/what-a-full-manuscript-rejection-really-means-breakdown-of-how-agents-decide/blog/blog_section_image_rage_gatekeeping_blog_section_landscape_15fa811529e3.gif?updatedAt=1781697037380",
        "alt": "Reasons agents cite fit and market timing (taste, advocacy, and \"not this agent's lane\")",
        "width": 204,
        "height": 200,
        "creator": "Giphy",
        "creatorUrl": "https://giphy.com/gifs/funny-rage-hbcorXlnIJySI",
        "provider": "giphy",
        "role": "section"
      }
    },
    {
      "section_id": "h2_landing_after_the_full_request",
      "heading": "When it's ghosting: how to interpret silence after a full request",
      "heading_slug": "when-it-s-ghosting-how-to-interpret-silence-after-a-full-request",
      "keyword_key": "h2_landing_after_the_full_request",
      "keywords": [
        "thud",
        "later-read",
        "consistency",
        "pacing",
        "plot",
        "character development",
        "structure",
        "cohesion",
        "panic",
        "late-stage"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Let's talk about the emotional landmine: **why agents ghost after full request**."
        },
        {
          "type": "paragraph",
          "text": "Sometimes silence is about workload. Backlogs exist. Reading slush is real. Some agents have processors, assistants, shared inboxes, or simply too many requests landing at the same time. If you've ever wondered whether your manuscript vanished into a black hole, that feeling is normal."
        },
        {
          "type": "paragraph",
          "text": "Other times, silence is about fit. Sometimes the agent mentally \"moves on\" after realizing it's not the right advocate story, and the ghosting is just them being human-ish and busy-ish."
        },
        {
          "type": "paragraph",
          "text": "Either way, silence isn't a verdict you can interpret as either \"they loved it\" or \"they hated it.\" It's just information about where they are in their process."
        },
        {
          "type": "blockquote",
          "text": "\"Ghosting can be workload, not rejection\u2014send a status check, then move on.\""
        },
        {
          "type": "subheading",
          "text": "Generalizable lesson: status check, then convert silence into strategy"
        },
        {
          "type": "paragraph",
          "text": "Because we have to respect the reality: **querying** requires pace. Writers waste time when they wait like a romantic partner for someone to reply."
        },
        {
          "type": "paragraph",
          "text": "Here's the practical approach:"
        },
        {
          "type": "paragraph",
          "text": "1) **Wait a reasonable interval** after the full request (long enough that the agent could realistically be reading). 2) **Send a status check** to confirm receipt and ask about timeline. 3) If there's still no response after a reasonable follow-up, treat it as a sign to move on and keep querying other agents."
        },
        {
          "type": "paragraph",
          "text": "This isn't \"being rude.\" It's risk management. A publishing timeline is a pile of deadlines plus emotional stamina. If you stall, you lose both."
        },
        {
          "type": "subheading",
          "text": "Case-study excerpt (silence is not an answer)"
        },
        {
          "type": "paragraph",
          "text": "If your brain is telling you \"no response means X,\" force it to pick between only two realities:"
        },
        {
          "type": "list",
          "items": [
            "You haven't gotten an answer yet.",
            "You're unlikely to get one soon."
          ]
        },
        {
          "type": "paragraph",
          "text": "Just keep momentum, keep querying, and revise when it's time."
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_20/day_276/what-a-full-manuscript-rejection-really-means-breakdown-of-how-agents-decide/blog/blog_section_image_thud_later_read_blog_section_landscape_c6dd8293ef3b.jpeg?updatedAt=1781697037887",
        "alt": "When it's ghosting: how to interpret silence after a full request",
        "width": 6000,
        "height": 4000,
        "creator": "ready made",
        "creatorUrl": "https://www.pexels.com/@readymade",
        "provider": "pexels",
        "role": "section"
      }
    },
    {
      "section_id": "h2_how_to_revise_after_full_rejection",
      "heading": "How to revise after a full-manuscript rejection (and when to keep querying)",
      "heading_slug": "how-to-revise-after-a-full-manuscript-rejection-and-when-to-keep-querying",
      "keyword_key": "h2_how_to_revise_after_full_rejection",
      "keywords": [
        "teeth-gritting",
        "revision pass",
        "fix the whole manuscript",
        "symptoms",
        "checklist",
        "logline clarity",
        "scene order",
        "requery readiness",
        "momentum"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Writers ask: **how to revise after full rejection** like it's a single checkbox. It isn't. The revision plan depends on what the rejection implies\u2014later-read structural issues, market/fit mismatch, or close-call \"revise and resubmit\" guidance."
        },
        {
          "type": "paragraph",
          "text": "Here are the revision moves for the three scenarios your rejection can represent."
        },
        {
          "type": "subheading",
          "text": "Scenario A: the rejection hints the manuscript falls apart later"
        },
        {
          "type": "paragraph",
          "text": "If the agent asked for a full and then rejected, it's plausible that something weak shows up after the opening: pacing drift, payoff problems, character development stalling, or inconsistency."
        },
        {
          "type": "paragraph",
          "text": "**Revise for the whole manuscript**, not just \"the parts that already worked.\""
        },
        {
          "type": "paragraph",
          "text": "A good revision pass looks like:"
        },
        {
          "type": "list",
          "items": [
            "Re-ordering sequences to restore cause-and-effect.",
            "Cutting dead-air scenes (the ones that read like you were stalling for tension).",
            "Clarifying what the protagonist wants and what changes because they want it.",
            "Fixing the middle so momentum doesn't die in the swamp."
          ]
        },
        {
          "type": "paragraph",
          "text": "This is where the **manuscript** becomes literal: treat it like one coherent machine."
        },
        {
          "type": "subheading",
          "text": "Scenario B: the rejection is about fit and market expectations"
        },
        {
          "type": "paragraph",
          "text": "If the rejection reads like \"this isn't what I'm excited to sell,\" then revision may help you generally\u2014but it won't necessarily change the market shelf your story sits on."
        },
        {
          "type": "paragraph",
          "text": "Here, you focus on:"
        },
        {
          "type": "list",
          "items": [
            "genre structure expectations (length, sequence shape, subgenre conventions)",
            "clarity of premise and escalation",
            "making the story's \"why it's different\" obvious without inventing a different book"
          ]
        },
        {
          "type": "paragraph",
          "text": "This is how you respond to **story doesn't fit current market** without pretending you can bargain with taste."
        },
        {
          "type": "subheading",
          "text": "Scenario C: \"revise and resubmit\" after a full rejection"
        },
        {
          "type": "paragraph",
          "text": "\"Revise and resubmit\" rejections are close calls. Usually that means the agent sees a lot that could work, and they're asking for a specific improvement direction\u2014or they're buying time while their list and market priorities align."
        },
        {
          "type": "paragraph",
          "text": "But here's the hard truth: even with R&R, **you should keep querying other agents**."
        },
        {
          "type": "paragraph",
          "text": "Why? Because R&R isn't a contract. It's an opening. Your job is to reduce risk and keep options open."
        },
        {
          "type": "blockquote",
          "text": "\"Rejections don't all mean 'no.' Some mean 'not yet.' But your publishing timeline doesn't pause for anyone.\""
        },
        {
          "type": "subheading",
          "text": "Generalizable lesson: choose your revision based on the rejection's signal, then pair revision with continued querying"
        },
        {
          "type": "paragraph",
          "text": "A clean approach for intermediate writers looks like:"
        },
        {
          "type": "paragraph",
          "text": "1) Determine whether the signal is structure/later-read vs fit/market vs close-call R&R. 2) Revise the relevant system (whole manuscript for structure; targeted changes for market clarity). 3) Continue querying while the revision runs\u2014because the next good advocate is probably in a different inbox."
        },
        {
          "type": "paragraph",
          "text": "That's how you stop the full-manuscript rejection from becoming a months-long emotional time-sink."
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
            "A full request doesn't guarantee representation; it guarantees the agent read far enough to test your manuscript as a whole.",
            "**Reasons agents reject full manuscripts** often show up later: consistency, pacing, and plot development weakening after the opening.",
            "**Why agents ghost after full request** can be workload, backlog, or process timing\u2014not a mystical message. Status check, then move on.",
            "Fit and timing matter: **story doesn't fit current market** expectations, or the agent can't effectively champion this exact shape of story.",
            "For \"revise and resubmit,\" treat it like progress, not salvation\u2014revise, but keep querying other agents."
          ]
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_20/day_276/what-a-full-manuscript-rejection-really-means-breakdown-of-how-agents-decide/blog/blog_section_image_lessons_takeaways_blog_section_landscape_96b7da9fa209.gif",
        "alt": "Lessons / Takeaways",
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
      "title": "Why publishing success looks like luck (even when your craft is right)",
      "url": "https://writequeryhook.com/blog/why-publishing-success-looks-like-luck-even-when-your-craft-is-right"
    },
    {
      "title": "Common mistakes that keep you from feeling pride (and force your creativity into pain)",
      "url": "https://writequeryhook.com/blog/common-mistakes-that-keep-you-from-feeling-pride-and-force-your-creativity"
    },
    {
      "title": "Rejection isn't the enemy: 7 anti-patterns that keep us stuck",
      "url": "https://writequeryhook.com/blog/rejection-isn-t-the-enemy-7-anti-patterns-that-keep-us-stuck"
    },
    {
      "title": "Writer burnout isn't \"can't write\"\u2014it's pressure fatigue you can unplug and recover from",
      "url": "https://writequeryhook.com/blog/writer-burnout-isn-t-can-t-write-it-s-pressure-fatigue-you-can-unplug-and"
    }
  ],
  "alsoLikeAfterIndex": 2,
  "faq": [],
  "closingBlocks": [
    {
      "type": "paragraph",
      "text": "A full manuscript rejection can feel like getting kicked out of the building after you've already made it past the lobby. But the mechanism is usually simpler: the manuscript didn't keep the promise under later pressure, or it wasn't the right match for that agent's advocacy lane."
    },
    {
      "type": "paragraph",
      "text": "Now look at your current draft like an agent would\u2014starting at the last place your opening still works, and walking forward until the story tells the truth. Then revise that. And while you revise, keep querying\u2014because silence isn't a plan."
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
      "@id": "https://writequeryhook.com/blog/what-a-full-manuscript-rejection-really-means-breakdown-of-how-agents-decide#breadcrumb",
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
          "name": "What a Full Manuscript Rejection Really Means (Breakdown of How Agents Decide Later, Not Just at the Opening)",
          "item": "https://writequeryhook.com/blog/what-a-full-manuscript-rejection-really-means-breakdown-of-how-agents-decide"
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": "https://writequeryhook.com/blog/what-a-full-manuscript-rejection-really-means-breakdown-of-how-agents-decide#webpage",
      "url": "https://writequeryhook.com/blog/what-a-full-manuscript-rejection-really-means-breakdown-of-how-agents-decide",
      "name": "What a Full Manuscript Rejection Really Means (Breakdown of How Agents Decide Later, Not Just at the Opening)",
      "isPartOf": {
        "@id": "https://writequeryhook.com/#website"
      },
      "inLanguage": "en-US",
      "primaryImageOfPage": {
        "@id": "https://writequeryhook.com/blog/what-a-full-manuscript-rejection-really-means-breakdown-of-how-agents-decide#primaryimage"
      },
      "breadcrumb": {
        "@id": "https://writequeryhook.com/blog/what-a-full-manuscript-rejection-really-means-breakdown-of-how-agents-decide#breadcrumb"
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
      "@id": "https://writequeryhook.com/blog/what-a-full-manuscript-rejection-really-means-breakdown-of-how-agents-decide#article",
      "isPartOf": {
        "@id": "https://writequeryhook.com/blog/what-a-full-manuscript-rejection-really-means-breakdown-of-how-agents-decide#webpage"
      },
      "mainEntityOfPage": "https://writequeryhook.com/blog/what-a-full-manuscript-rejection-really-means-breakdown-of-how-agents-decide",
      "headline": "What a Full Manuscript Rejection Really Means (Breakdown of How Agents Decide Later, Not Just at the Opening)",
      "alternativeHeadline": "What a Full Manuscript Rejection Really Means (Breakdown of How Agents Decide Later, Not Just at the Opening)",
      "description": "You get the full manuscript request. You feel the dopamine hit in your shoulders. Then the rejection comes back anyway\u2014often with vague language that makes you stare at your draft like it personally betrayed you.",
      "wordCount": 2135,
      "timeRequired": "PT11M",
      "articleSection": "Querying",
      "keywords": [
        "slush mental game",
        "submissions",
        "revision",
        "agents",
        "rejection",
        "gut-punch",
        "momentum",
        "revise",
        "keep querying",
        "receipt",
        "consistency",
        "pacing"
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
        "@id": "https://writequeryhook.com/blog/what-a-full-manuscript-rejection-really-means-breakdown-of-how-agents-decide#primaryimage"
      },
      "datePublished": "2027-02-08",
      "dateModified": "2027-02-08",
      "mentions": [
        {
          "@type": "WebPage",
          "name": "Why publishing success looks like luck (even when your craft is right)",
          "url": "https://writequeryhook.com/blog/why-publishing-success-looks-like-luck-even-when-your-craft-is-right"
        },
        {
          "@type": "WebPage",
          "name": "Common mistakes that keep you from feeling pride (and force your creativity into pain)",
          "url": "https://writequeryhook.com/blog/common-mistakes-that-keep-you-from-feeling-pride-and-force-your-creativity"
        },
        {
          "@type": "WebPage",
          "name": "Rejection isn't the enemy: 7 anti-patterns that keep us stuck",
          "url": "https://writequeryhook.com/blog/rejection-isn-t-the-enemy-7-anti-patterns-that-keep-us-stuck"
        },
        {
          "@type": "WebPage",
          "name": "Writer burnout isn't \"can't write\"\u2014it's pressure fatigue you can unplug and recover from",
          "url": "https://writequeryhook.com/blog/writer-burnout-isn-t-can-t-write-it-s-pressure-fatigue-you-can-unplug-and"
        }
      ]
    },
    {
      "@type": "ImageObject",
      "@id": "https://writequeryhook.com/blog/what-a-full-manuscript-rejection-really-means-breakdown-of-how-agents-decide#primaryimage",
      "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_20/day_276/what-a-full-manuscript-rejection-really-means-breakdown-of-how-agents-decide/blog/blog_hero_dread_hopeful_request_blog_hero_landscape_7c9b5a5abcfe.jpeg",
      "width": 3875,
      "height": 2848,
      "caption": "blog hero \u00b7 dread hopeful request",
      "creditText": "Alexandro David",
      "author": {
        "@type": "Person",
        "name": "Alexandro David",
        "url": "https://www.pexels.com/@alexandro-david-871783"
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
