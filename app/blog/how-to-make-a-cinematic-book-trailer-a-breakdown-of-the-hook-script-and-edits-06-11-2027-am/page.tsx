import type { Metadata } from 'next';
import { Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BlogBackLink } from '@/components/blog/BlogBackLink';

const PAGE_DATA = {
  "slug": "how-to-make-a-cinematic-book-trailer-a-breakdown-of-the-hook-script-and-edits",
  "title": "How to make a cinematic book trailer: a breakdown of the hook, script, and edits that sell",
  "description": "Book marketing people will tell you video is \"the next big thing.\" The rest of us have watched a couple of trailers that feel like they were assembled by vibes alone\u2014pretty images, zero clarity, and a CTA that sneaks in so late you miss it entirely.",
  "readTime": "10 min read",
  "publishedDate": "2027-06-11",
  "modifiedDate": "2027-06-11",
  "canonicalUrl": "https://writequeryhook.com/blog/how-to-make-a-cinematic-book-trailer-a-breakdown-of-the-hook-script-and-edits",
  "siteUrl": "https://writequeryhook.com",
  "siteName": "Write Query Hook",
  "locale": "en-US",
  "articleSection": "Querying",
  "keywords": [
    "industry literacy",
    "marketing",
    "craft",
    "tools & resources",
    "hook-first",
    "curiosity",
    "pacing",
    "audio layers",
    "music licensing",
    "cta",
    "editing cuts",
    "conversion"
  ],
  "author": null,
  "hero": {
    "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_31/day_429/how-to-make-a-cinematic-book-trailer-a-breakdown-of-the-hook-script-and-edits/blog/blog_hero_skeptical_curious_blog_hero_landscape_805a4fef36d1.jpeg?updatedAt=1782214525117",
    "alt": "blog hero \u00b7 skeptical curious",
    "width": 8688,
    "height": 5792,
    "creator": "Andrea Piacquadio",
    "creatorUrl": "https://www.pexels.com/@olly",
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
      "name": "How to make a cinematic book trailer: a breakdown of the hook, script, and edits that sell",
      "item": "https://writequeryhook.com/blog/how-to-make-a-cinematic-book-trailer-a-breakdown-of-the-hook-script-and-edits"
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
            "A **book trailer** lives or dies on a hook-first premise you can communicate in ~30 words.",
            "Your **trailer script** is not novel-writing. It's tone + hook + stake in a handful of catchy lines.",
            "Build a **curated asset set** (stock, images, and optional self-shot clips) before you touch the edit.",
            "**Voiceover** is optional, but **music** selection and optional sound effects are not optional if you want \"cinematic.\"",
            "Genre pacing matters: short punchy cuts for fast stories, slower lingering shots for calmer tones.",
            "Your last frame needs a prominent **call to action** near the cover art: \"out now,\" \"buy now,\" or \"pre-order today.\""
          ]
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_31/day_429/how-to-make-a-cinematic-book-trailer-a-breakdown-of-the-hook-script-and-edits/blog/blog_section_image_tldr_blog_section_landscape_a81860f7be0e.jpeg?updatedAt=1782214525725",
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
      "section_id": "h2_opening_why_this_is_worth_studying",
      "heading": "Opening \u2014 why this is worth studying",
      "heading_slug": "opening-why-this-is-worth-studying",
      "keyword_key": "h2_opening_why_this_is_worth_studying",
      "keywords": [],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Book **marketing** people will tell you **video** is \"the next big thing.\" The rest of us have watched a couple of trailers that feel like they were assembled by vibes alone\u2014pretty images, zero clarity, and a CTA that sneaks in so late you miss it entirely."
        },
        {
          "type": "paragraph",
          "text": "A **case-study breakdown** helps because the best book trailers share mechanics you can copy: the hook is readable fast, the script is made for scrolling attention, and the edit makes sound and pacing do plot work."
        },
        {
          "type": "paragraph",
          "text": "A working trailer takes the book's core promise and compresses it into a **30\u201340 second** cinematic **video** that teases what the story is *for* and prompts the reader to buy."
        },
        {
          "type": "paragraph",
          "text": "Authors worry about three things: turning the book's promise into a single compelling hook, adapting story material into a short script that stays on-tone, and whether editing/voiceover/music licensing is worth the effort when a bad trailer can feel worse than doing nothing."
        },
        {
          "type": "paragraph",
          "text": "The answer is to walk through the structure like you're disassembling a watch\u2014except the watch is trying to convert viewers."
        },
        {
          "type": "blockquote",
          "text": "A trailer hooks fast: it earns curiosity by teasing the premise, not by explaining the plot."
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_31/day_429/how-to-make-a-cinematic-book-trailer-a-breakdown-of-the-hook-script-and-edits/blog/blog_section_image_opening_why_this_is_worth_studying_blog_section_landscape_5a01b1a42094.gif?updatedAt=1782214526410",
        "alt": "Opening \u2014 why this is worth studying",
        "width": 296,
        "height": 200,
        "creator": "TreehouseDirect",
        "creatorUrl": "https://giphy.com/gifs/TreehouseDirect-cartoons-turtle-franklin-zOBM2EO8rEyj1Hfe3V",
        "provider": "giphy",
        "role": "section"
      }
    },
    {
      "section_id": "h2_body_structural_breakdown",
      "heading": "Body \u2014 structural breakdown",
      "heading_slug": "body-structural-breakdown",
      "keyword_key": "h2_body_structural_breakdown",
      "keywords": [],
      "blocks": [
        {
          "type": "subheading",
          "text": "How to write a short catchy trailer script: start with the hook"
        },
        {
          "type": "paragraph",
          "text": "The most useful structural choice in a working book trailer is simple: the **hook** is the top selling point, expressed in plain language under about thirty words."
        },
        {
          "type": "paragraph",
          "text": "This has mechanical implications:"
        },
        {
          "type": "list",
          "items": [
            "The hook is not a theme sentence (\"about grief\").",
            "It's not a plot summary (\"then this happens, then that happens\").",
            "It's a promise with a reader-shaped target."
          ]
        },
        {
          "type": "paragraph",
          "text": "The best hooks do two things at once: 1) They tell viewers what the book is about in a phrase they grasp instantly. 2) They imply why they'd care\u2014by naming the thing that's at stake."
        },
        {
          "type": "paragraph",
          "text": "If someone stops watching at second five, they should still be able to repeat your hook."
        },
        {
          "type": "paragraph",
          "text": "Authors often sabotage themselves by grabbing \"cool\" lines from the manuscript instead of compressing the actual premise into a single sellable idea."
        },
        {
          "type": "paragraph",
          "text": "**Generalizable lesson:** Write 10 hook versions before you pick one. Your goal isn't \"pretty.\" It's **clear**. If your hook isn't clear, every clip becomes background noise."
        },
        {
          "type": "blockquote",
          "text": "If your hook isn't clear, every clip becomes background noise\u2014fix the premise first."
        },
        {
          "type": "paragraph",
          "text": "**Copyable checklist for hook structure:**"
        },
        {
          "type": "list",
          "items": [
            "protagonist (or the POV vibe) in a quick noun",
            "the reader's want (what they're reaching for)",
            "the threat/stakes (what makes it expensive)",
            "one distinctive angle (genre flavor, twist promise, or emotional payoff)"
          ]
        },
        {
          "type": "paragraph",
          "text": "Once you have a clear hook, you can **write a short catchy trailer script** that builds from it."
        },
        {
          "type": "subheading",
          "text": "Building your script from the hook: tone + who + desire + stakes"
        },
        {
          "type": "paragraph",
          "text": "A **trailer script** is not the same thing as writing your novel in miniature. It's tone and hook in a few catchy sentences that set up who the story is about, what they want, and what's at stake."
        },
        {
          "type": "paragraph",
          "text": "Authors commonly carry over the wrong instinct: they try to \"explain\" the story. Trailers don't explain. They tease."
        },
        {
          "type": "paragraph",
          "text": "A good trailer script is usually a sequence of short lines paired with visual beats:"
        },
        {
          "type": "list",
          "items": [
            "Line 1: hook (the selling point)",
            "Line 2: who we follow / what their situation demands",
            "Line 3: what they want",
            "Line 4: the consequence if they fail",
            "Line 5: a teaser of payoff (without spilling everything)"
          ]
        },
        {
          "type": "paragraph",
          "text": "You're trying to keep viewers from bouncing, not proving you read plot theory class in college."
        },
        {
          "type": "paragraph",
          "text": "**Generalizable lesson:** Draft your trailer script like captions for a montage. If you can't imagine a cut that matches a line, rewrite until you can."
        },
        {
          "type": "paragraph",
          "text": "Say the script out loud while imagining the visuals. If the sentences feel too long or too informational, the edit won't rescue it. It'll just make the boredom shinier."
        },
        {
          "type": "paragraph",
          "text": "A cinematic trailer isn't a complicated screenplay. It's compressed intent."
        },
        {
          "type": "subheading",
          "text": "What is a book trailer and do you need one: building assets before you edit"
        },
        {
          "type": "paragraph",
          "text": "A **book trailer** is more than a slideshow\u2014it's a strategic asset that, when done right, converts curious viewers into buyers. The structural approach that works is assembling assets *before* you edit."
        },
        {
          "type": "paragraph",
          "text": "Creators can assemble trailers using stock footage, curated images, and optional self-shot clips with a deliberate plan rather than improvising mid-edit."
        },
        {
          "type": "paragraph",
          "text": "Why this works:"
        },
        {
          "type": "list",
          "items": [
            "you reduce rework (less searching mid-edit),",
            "your pacing decisions come from the set you actually have,",
            "and you keep the trailer's tone consistent rather than randomly mixing visuals."
          ]
        },
        {
          "type": "paragraph",
          "text": "**Generalizable lesson:** Don't start editing until you can answer, \"What are the ten visuals we're remixing into a story tease?\""
        },
        {
          "type": "paragraph",
          "text": "Practical approach:"
        },
        {
          "type": "list",
          "items": [
            "Save a folder with labeled clips/images (e.g., \"chase,\" \"awakening,\" \"betrayal\")",
            "Add a few alternate picks for each beat (because the edit will demand replacements)",
            "Keep everything organized by hook beats, not by where you found the file"
          ]
        },
        {
          "type": "paragraph",
          "text": "This is a short **video** with a single job: hook viewers fast and sell the premise in under 40 seconds."
        },
        {
          "type": "subheading",
          "text": "How to edit a book trailer with sound effects: voiceover, music, and texture"
        },
        {
          "type": "paragraph",
          "text": "Now we get to the part that makes trailers feel cinematic instead of \"presentation-y.\""
        },
        {
          "type": "paragraph",
          "text": "#### Voiceover and text overlay: choose your narration approach Some creators rely on text overlay. Others use a **voiceover**."
        },
        {
          "type": "paragraph",
          "text": "The structural choice depends on budget and comfort:"
        },
        {
          "type": "list",
          "items": [
            "budget recording + DIY narration,",
            "paid narration,",
            "or professional voice talent."
          ]
        },
        {
          "type": "paragraph",
          "text": "The trap isn't \"voiceover vs no voiceover.\" The trap is forgetting that audio affects interpretation. If you go voice-only, your visuals must carry emotion. If you go text-only, your visuals must carry rhythm."
        },
        {
          "type": "paragraph",
          "text": "#### How to choose royalty-free music for trailers Music frames emotion and hints at plot motifs without having to explain anything. The approach should be:"
        },
        {
          "type": "list",
          "items": [
            "use royalty-free or licensed tracks from reputable sources,",
            "and add optional sound effects to add texture where visuals can't."
          ]
        },
        {
          "type": "paragraph",
          "text": "Writers often get anxious about legal/technical effort, but you don't need to become an audio lawyer\u2014just avoid grabbing random tracks and hoping the internet forgives you."
        },
        {
          "type": "paragraph",
          "text": "**Generalizable lesson:** Choose music early enough that the edit can cut to it. The trailer's pacing decisions often depend on the track's structure."
        },
        {
          "type": "paragraph",
          "text": "When you **choose royalty-free music for trailers**, look for tracks that match your hook's emotional temperature and genre. A thriller needs tension; a romance needs warmth. Sound effects\u2014footsteps, door slams, heartbeats\u2014can add depth to cuts where visuals alone feel thin."
        },
        {
          "type": "blockquote",
          "text": "Music frames emotion; editing controls pace; sound effects add depth where visuals can't."
        },
        {
          "type": "subheading",
          "text": "Edit pacing to match genre expectations: short cuts for fast, lingering shots for calm"
        },
        {
          "type": "paragraph",
          "text": "Editing should match genre expectations by controlling pacing (short punchy cuts for fast genres; longer lingering shots for calmer tones), transitions (used intentionally, not as \"because we can\"), and the overall rhythm of the montage."
        },
        {
          "type": "paragraph",
          "text": "Two trailers with the same script can feel totally different based on editing tempo."
        },
        {
          "type": "paragraph",
          "text": "A fast genre trailer needs motion. The viewer should feel momentum, not waiting. Slow genres need breathing room so the trailer doesn't look panicked."
        },
        {
          "type": "paragraph",
          "text": "Use transitions like punctuation:"
        },
        {
          "type": "list",
          "items": [
            "hard cuts for shocks,",
            "smoother transitions for dread that accumulates,",
            "fades/lingers when the tone wants stillness."
          ]
        },
        {
          "type": "paragraph",
          "text": "**Generalizable lesson:** Edit for reader emotion, not for your editing skills. If the transition draws attention to the editor, it's probably not doing its job."
        },
        {
          "type": "paragraph",
          "text": "If your edit keeps interrupting the mood every time you get fancy, that's not \"cinematic.\" That's \"look what I can do.\""
        },
        {
          "type": "subheading",
          "text": "End with a clear CTA near the cover art: convert in the last frame"
        },
        {
          "type": "paragraph",
          "text": "The final structural choice is where conversion happens."
        },
        {
          "type": "paragraph",
          "text": "A good book trailer finishes with a prominent **call to action** placed near the cover art, using straightforward prompts like \"out now\" or \"pre-order today.\""
        },
        {
          "type": "paragraph",
          "text": "Some trailers also add a positive review snippet before the CTA, but the CTA still needs to be front and center in the last frame."
        },
        {
          "type": "paragraph",
          "text": "Why near the cover art matters:"
        },
        {
          "type": "list",
          "items": [
            "viewers often interpret the last frame as \"where the book lives,\"",
            "and cover placement reduces cognitive steps between watching and buying."
          ]
        },
        {
          "type": "paragraph",
          "text": "**Generalizable lesson:** Your ending shouldn't feel like a generic outro slide. It should feel like the book is offering itself."
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_31/day_429/how-to-make-a-cinematic-book-trailer-a-breakdown-of-the-hook-script-and-edits/blog/blog_section_image_body_structural_breakdown_blog_section_landscape_56a08fc1e903.gif",
        "alt": "Body \u2014 structural breakdown",
        "width": 246,
        "height": 200,
        "creator": "xdelacra",
        "creatorUrl": "https://giphy.com/gifs/writing-sailing-shakespeare-5xV10CuDYqYks7WVmN",
        "provider": "giphy",
        "role": "section"
      }
    },
    {
      "section_id": "h2_lessons_takeaways",
      "heading": "Lessons / Takeaways",
      "heading_slug": "lessons-takeaways",
      "keyword_key": "h2_lessons_takeaways",
      "keywords": [],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Here are the reusable mechanics you can apply immediately:"
        },
        {
          "type": "list",
          "items": [
            "**Write a hook you can say in ~30 words.** If the premise isn't instantly readable, your **book trailer** becomes a slideshow with music.",
            "**Turn story material into trailer script beats (who/want/stakes).** Don't recap chapters\u2014tease tone and tension in a few catchy lines.",
            "**Curate assets before editing.** Stock footage + optional self-shot clips should be chosen in advance so your edit can build momentum instead of scrambling.",
            "**Treat audio like storytelling.** **Voiceover** is optional, but **music** selection (licensed/royalty-free) and optional **sound effects** are how the trailer feels intentional.",
            "**Match editing pace to genre expectations.** Short punchy cuts for fast tones, lingering shots for calmer vibes; transitions are punctuation, not decoration.",
            "**Put the CTA near the cover art in the last frame.** Use clear prompts like \"out now\" or \"pre-order today\" so conversion doesn't rely on the viewer scrolling away."
          ]
        }
      ],
      "image": null
    }
  ],
  "closingImage": null,
  "alsoLike": [
    {
      "title": "Common publishing FAQ mistakes that stall your first book (and how to fix them fast)",
      "url": "https://writequeryhook.com/blog/common-publishing-faq-mistakes-that-stall-your-first-book-and-how-to-fix-them"
    },
    {
      "title": "Common author website mistakes that trap you for years (and how to fix them)",
      "url": "https://writequeryhook.com/blog/common-author-website-mistakes-that-trap-you-for-years-and-how-to-fix-them"
    },
    {
      "title": "Publishing myths 101: \"Editors don't edit\" (and what to do instead)",
      "url": "https://writequeryhook.com/blog/publishing-myths-101-editors-don-t-edit-and-what-to-do-instead"
    },
    {
      "title": "5 publishing company mistakes that get authors scammed (and what to check instead)",
      "url": "https://writequeryhook.com/blog/5-publishing-company-mistakes-that-get-authors-scammed-and-what-to-check-instead"
    }
  ],
  "alsoLikeAfterIndex": 1,
  "faq": [
    {
      "question": "What is a book trailer and do you need one?",
      "answer": "A book trailer is a short video that teases the book's premise using visuals, text, and audio. It's meant to draw in potential readers and encourage them to buy. The format works best when the hook is clear and the edit serves the script rather than competing with it."
    },
    {
      "question": "How long should a book trailer be?",
      "answer": "Most book trailers run about 30 to 40 seconds, and around 30 seconds is a common target. The format is built for a quick teaser, not a full story recap."
    },
    {
      "question": "How do you find your hook?",
      "answer": "The hook is the book's top selling point\u2014the specific reason readers will want to know more. To find yours, watch trailers in the same genre and see how they express the hook quickly and visually. Your hook should answer: what is the book about, and why would someone care?"
    },
    {
      "question": "Do you need a voiceover for a good trailer?",
      "answer": "No. Voiceover is optional. Some trailers rely on text overlay instead, and you can choose based on budget and the tone you're aiming for."
    },
    {
      "question": "What should the trailer include at the end to convert viewers?",
      "answer": "The trailer should end with a clear call to action that's prominent in the last frame near the cover art. Examples include \"out now,\" \"buy now,\" or \"pre-order today.\" You can also include a positive review snippet before the CTA."
    }
  ],
  "closingBlocks": [
    {
      "type": "paragraph",
      "text": "If your trailer feels flat, it's usually not your editing software. It's your hook, your script clarity, or the ending CTA landing late."
    },
    {
      "type": "paragraph",
      "text": "Open your timeline. Rewrite the first 30 words to be unmistakable, then build your asset set around that hook\u2014only after that do you polish the music, voiceover, and the cut rhythm."
    }
  ],
  "relatedLinks": [
    {
      "title": "Common publishing FAQ mistakes that stall your first book (and how to fix them fast)",
      "url": "https://writequeryhook.com/blog/common-publishing-faq-mistakes-that-stall-your-first-book-and-how-to-fix-them"
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
      "@id": "https://writequeryhook.com/blog/how-to-make-a-cinematic-book-trailer-a-breakdown-of-the-hook-script-and-edits#breadcrumb",
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
          "name": "How to make a cinematic book trailer: a breakdown of the hook, script, and edits that sell",
          "item": "https://writequeryhook.com/blog/how-to-make-a-cinematic-book-trailer-a-breakdown-of-the-hook-script-and-edits"
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": "https://writequeryhook.com/blog/how-to-make-a-cinematic-book-trailer-a-breakdown-of-the-hook-script-and-edits#webpage",
      "url": "https://writequeryhook.com/blog/how-to-make-a-cinematic-book-trailer-a-breakdown-of-the-hook-script-and-edits",
      "name": "How to make a cinematic book trailer: a breakdown of the hook, script, and edits that sell",
      "isPartOf": {
        "@id": "https://writequeryhook.com/#website"
      },
      "inLanguage": "en-US",
      "primaryImageOfPage": {
        "@id": "https://writequeryhook.com/blog/how-to-make-a-cinematic-book-trailer-a-breakdown-of-the-hook-script-and-edits#primaryimage"
      },
      "breadcrumb": {
        "@id": "https://writequeryhook.com/blog/how-to-make-a-cinematic-book-trailer-a-breakdown-of-the-hook-script-and-edits#breadcrumb"
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
      "@id": "https://writequeryhook.com/blog/how-to-make-a-cinematic-book-trailer-a-breakdown-of-the-hook-script-and-edits#article",
      "isPartOf": {
        "@id": "https://writequeryhook.com/blog/how-to-make-a-cinematic-book-trailer-a-breakdown-of-the-hook-script-and-edits#webpage"
      },
      "mainEntityOfPage": "https://writequeryhook.com/blog/how-to-make-a-cinematic-book-trailer-a-breakdown-of-the-hook-script-and-edits",
      "headline": "How to make a cinematic book trailer: a breakdown of the hook, script, and edits that sell",
      "alternativeHeadline": "How to make a cinematic book trailer: a breakdown of the hook, script, and edits that sell",
      "description": "Book marketing people will tell you video is \"the next big thing.\" The rest of us have watched a couple of trailers that feel like they were assembled by vibes alone\u2014pretty images, zero clarity, and a CTA that sneaks in so late you miss it entirely.",
      "wordCount": 1902,
      "timeRequired": "PT10M",
      "articleSection": "Querying",
      "keywords": [
        "industry literacy",
        "marketing",
        "craft",
        "tools & resources",
        "hook-first",
        "curiosity",
        "pacing",
        "audio layers",
        "music licensing",
        "cta",
        "editing cuts",
        "conversion"
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
        "@id": "https://writequeryhook.com/blog/how-to-make-a-cinematic-book-trailer-a-breakdown-of-the-hook-script-and-edits#primaryimage"
      },
      "datePublished": "2027-06-11",
      "dateModified": "2027-06-11",
      "mentions": [
        {
          "@type": "WebPage",
          "name": "Common publishing FAQ mistakes that stall your first book (and how to fix them fast)",
          "url": "https://writequeryhook.com/blog/common-publishing-faq-mistakes-that-stall-your-first-book-and-how-to-fix-them"
        },
        {
          "@type": "WebPage",
          "name": "Common author website mistakes that trap you for years (and how to fix them)",
          "url": "https://writequeryhook.com/blog/common-author-website-mistakes-that-trap-you-for-years-and-how-to-fix-them"
        },
        {
          "@type": "WebPage",
          "name": "Publishing myths 101: \"Editors don't edit\" (and what to do instead)",
          "url": "https://writequeryhook.com/blog/publishing-myths-101-editors-don-t-edit-and-what-to-do-instead"
        },
        {
          "@type": "WebPage",
          "name": "5 publishing company mistakes that get authors scammed (and what to check instead)",
          "url": "https://writequeryhook.com/blog/5-publishing-company-mistakes-that-get-authors-scammed-and-what-to-check-instead"
        }
      ]
    },
    {
      "@type": "ImageObject",
      "@id": "https://writequeryhook.com/blog/how-to-make-a-cinematic-book-trailer-a-breakdown-of-the-hook-script-and-edits#primaryimage",
      "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_31/day_429/how-to-make-a-cinematic-book-trailer-a-breakdown-of-the-hook-script-and-edits/blog/blog_hero_skeptical_curious_blog_hero_landscape_805a4fef36d1.jpeg?updatedAt=1782214525117",
      "width": 8688,
      "height": 5792,
      "caption": "blog hero \u00b7 skeptical curious",
      "creditText": "Andrea Piacquadio",
      "author": {
        "@type": "Person",
        "name": "Andrea Piacquadio",
        "url": "https://www.pexels.com/@olly"
      },
      "@context": "https://schema.org"
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": "https://writequeryhook.com/blog/how-to-make-a-cinematic-book-trailer-a-breakdown-of-the-hook-script-and-edits#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is a book trailer and do you need one?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A book trailer is a short video that teases the book's premise using visuals, text, and audio. It's meant to draw in potential readers and encourage them to buy. The format works best when the hook is clear and the edit serves the script rather than competing with it."
          }
        },
        {
          "@type": "Question",
          "name": "How long should a book trailer be?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Most book trailers run about 30 to 40 seconds, and around 30 seconds is a common target. The format is built for a quick teaser, not a full story recap."
          }
        },
        {
          "@type": "Question",
          "name": "How do you find your hook?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The hook is the book's top selling point\u2014the specific reason readers will want to know more. To find yours, watch trailers in the same genre and see how they express the hook quickly and visually. Your hook should answer: what is the book about, and why would someone care?"
          }
        },
        {
          "@type": "Question",
          "name": "Do you need a voiceover for a good trailer?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. Voiceover is optional. Some trailers rely on text overlay instead, and you can choose based on budget and the tone you're aiming for."
          }
        },
        {
          "@type": "Question",
          "name": "What should the trailer include at the end to convert viewers?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The trailer should end with a clear call to action that's prominent in the last frame near the cover art. Examples include \"out now,\" \"buy now,\" or \"pre-order today.\" You can also include a positive review snippet before the CTA."
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
