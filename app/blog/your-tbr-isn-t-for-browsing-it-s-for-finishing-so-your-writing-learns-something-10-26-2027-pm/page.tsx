import type { Metadata } from 'next';
import { Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BlogBackLink } from '@/components/blog/BlogBackLink';

const PAGE_DATA = {
  "slug": "your-tbr-isn-t-for-browsing-it-s-for-finishing-so-your-writing-learns-something",
  "title": "Your TBR Isn't for Browsing\u2014It's for Finishing (So Your Writing Learns Something)",
  "description": "I have a theory, and I'm putting it on the table before we pretend this is \"productivity\": browsing isn't reading. Browsing is what you do while your reading life waits in the lobby, holding a clipboard and wondering if today is its day.",
  "readTime": "12 min read",
  "publishedDate": "2027-10-26",
  "modifiedDate": "2027-10-26",
  "canonicalUrl": "https://writequeryhook.com/blog/your-tbr-isn-t-for-browsing-it-s-for-finishing-so-your-writing-learns-something",
  "siteUrl": "https://writequeryhook.com",
  "siteName": "Write Query Hook",
  "locale": "en-US",
  "articleSection": "Querying",
  "keywords": [
    "industry literacy",
    "craft",
    "tools & resources",
    "contrarian",
    "finish-line",
    "browsing trap",
    "queue",
    "genre depth",
    "accountability",
    "craft notes",
    "reading progress",
    "discipline"
  ],
  "author": null,
  "hero": {
    "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_43/day_593/your-tbr-isn-t-for-browsing-it-s-for-finishing-so-your-writing-learns-something/blog/blog_hero_catalog_scrolling_dread_blog_hero_landscape_8c237d102b5b.jpeg",
    "alt": "blog hero \u00b7 catalog scrolling dread",
    "width": 6000,
    "height": 4000,
    "creator": "Felicity Tai",
    "creatorUrl": "https://www.pexels.com/@felicity-tai",
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
      "name": "Your TBR Isn't for Browsing\u2014It's for Finishing (So Your Writing Learns Something)",
      "item": "https://writequeryhook.com/blog/your-tbr-isn-t-for-browsing-it-s-for-finishing-so-your-writing-learns-something"
    }
  ],
  "tldrBlocks": [],
  "openingBlocks": [
    {
      "type": "paragraph",
      "text": "I have a theory, and I'm putting it on the table before we pretend this is \"productivity\": browsing isn't reading. Browsing is what you do while your reading life waits in the lobby, holding a clipboard and wondering if today is its day."
    },
    {
      "type": "paragraph",
      "text": "Like, you add a title. You \"just check\" another blurb. You scroll through a genre fiction list like it's a slot machine that pays out with inspiration. And meanwhile the pile grows teeth. It starts looking back at you every time you open your apps."
    },
    {
      "type": "paragraph",
      "text": "Most writers organize their TBR like it's a buffet. They keep grabbing options until nothing gets eaten. That might feel generous, but it's also how reading goals become fiction. And yes, it also kills the part we actually care about: the craft learning that comes from follow-through."
    },
    {
      "type": "paragraph",
      "text": "So here's the contrarian version of TBR organization: build a system that makes it hard to *collect*. Make it easy to *finish*. Then your writing stops living on \"maybe next read\" and starts living on the actual receipts."
    },
    {
      "type": "paragraph",
      "text": "Also: I'm writing this for Slushies who want their reading habits to feed their drafts, not their tabs."
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
            "Treat your **TBR** like a contract with your future draft, not a mood board.",
            "Use **reading goals** that match your actual reading mix\u2014otherwise the goal becomes self-punishment.",
            "Keep your **genre fiction** depth by tracking what's working *right now*, not just what you already love.",
            "**How to minimize browsing and start books**: add friction to queue checks and time-box the browsing window.",
            "Keep **how to track what you read for writing** simple: 3\u20136 sentences per read, plus optional \"private notes\" for tougher critique.",
            "Balance breadth with joy by leaving room for spontaneous picks\u2014without letting the queue sprawl.",
            "If your system turns into catalog scrolling, it isn't helping your reading habits. It's sabotaging them."
          ]
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_43/day_593/your-tbr-isn-t-for-browsing-it-s-for-finishing-so-your-writing-learns-something/blog/blog_section_image_tldr_blog_section_landscape_65964be2152e.gif",
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
      "section_id": "h2_tbr_as_a_starting_contract",
      "heading": "TBR as a starting contract (not a wish list)",
      "heading_slug": "tbr-as-a-starting-contract-not-a-wish-list",
      "keyword_key": "h2_tbr_as_a_starting_contract",
      "keywords": [
        "commitment",
        "discipline",
        "guilt",
        "choice",
        "starting line",
        "finish line",
        "agency",
        "priority",
        "resentment",
        "control"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Let's name the broken part plainly: a lot of TBRs are built out of permission. Permission to want. Permission to fantasize. Permission to postpone."
        },
        {
          "type": "paragraph",
          "text": "A TBR pile works best when it's structured like a starting contract: *this book is on-deck for a reason, and there's a moment you're starting it.* No drift. No vibes. No \"I'll start it when I feel like it,\" because \"feel like it\" is a liar when you're also drafting, revising, teaching yourself craft, and negotiating life."
        },
        {
          "type": "paragraph",
          "text": "If you've ever done the \"I'll just start two things so I don't get bored\" move, you already know how the ending goes. You get better at sampling and worse at completion. Your reading goals slip into collecting instead of finishing\u2014which means you're not absorbing the craft details from the books sitting in front of you."
        },
        {
          "type": "paragraph",
          "text": "Here's how to organize your TBR pile for finishing:"
        },
        {
          "type": "paragraph",
          "text": "1. **Pick one current \"lane.\"** Your lane is the next book you're actually starting this week. Everything else waits. 2. **Cap your active queue.** If you have 17 books \"ready,\" you have a scrolling interface problem masquerading as options. 3. **Define the start trigger.** Examples: \"After I revise chapter 3,\" \"After the weekend,\" \"When the draft hits X,\" \"When I finish my current read-aloud.\" Make the trigger concrete enough that future-you can't wriggle out."
        },
        {
          "type": "paragraph",
          "text": "You'll still have your *want pile*. Fine. But your active reading queue is something different\u2014a smaller, more intentional set."
        },
        {
          "type": "paragraph",
          "text": "Also, contrarian warning: \"But I need options!\" No. You need a follow-through loop. Options are how you avoid commitment. Commitment is how you turn reading into writing oxygen."
        },
        {
          "type": "paragraph",
          "text": "One specific setup that works for writers: take your genre fiction lane (say contemporary literary with punchy moral dilemmas, or romantic suspense with tight pacing) and choose **three** titles that are all good candidates for the same reader promise. Not \"three vibes.\" Three books you could plausibly start back-to-back without changing what you're studying."
        },
        {
          "type": "paragraph",
          "text": "If you can't explain why each one belongs to the lane in one sentence, it doesn't belong in the active queue. It can live in \"later,\" which is what wishlisting is for."
        },
        {
          "type": "paragraph",
          "text": "And yes, this is also how you stop comparing yourself to shiny examples: your next book isn't a threat. It's a syllabus."
        },
        {
          "type": "blockquote",
          "text": "\"Minimize browsing time so you can spend more time actually reading.\" \u2014the thought your system should enforce, not just your willpower"
        }
      ],
      "image": null
    },
    {
      "section_id": "h2_minimize_browsing_and_start_books",
      "heading": "How to minimize browsing and start books (without losing your mind)",
      "heading_slug": "how-to-minimize-browsing-and-start-books-without-losing-your-mind",
      "keyword_key": "h2_minimize_browsing_and_start_books",
      "keywords": [
        "distraction",
        "compulsion",
        "wishlist queue",
        "friction",
        "timer",
        "decision fatigue",
        "dopamine",
        "deep focus",
        "start books",
        "reading habit"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Browsing restraint isn't about becoming some monk who never checks a catalogue. It's about removing the exact mechanical steps that hijack your time."
        },
        {
          "type": "paragraph",
          "text": "Endless wishlisting and queue-checking turns into procrastination with better lighting."
        },
        {
          "type": "paragraph",
          "text": "So **how to minimize browsing and start books** is really about decision design. You want fewer \"micro-decisions\" per day and more \"book-in-hand\" minutes per week."
        },
        {
          "type": "paragraph",
          "text": "Here's what the contrarian systems do differently:"
        },
        {
          "type": "subheading",
          "text": "1) Time-box catalog interactions like they're a task"
        },
        {
          "type": "paragraph",
          "text": "Set one window\u2014once per day or once per week. No exceptions. During the window, you can add to TBR, review a few blurbs, and update your queue. Outside the window, your queue stays put."
        },
        {
          "type": "paragraph",
          "text": "If you keep checking \"just to see if there's something better,\" you've built a machine that converts curiosity into delay."
        },
        {
          "type": "subheading",
          "text": "2) Add friction to \"start now\" behaviors"
        },
        {
          "type": "paragraph",
          "text": "If your system lets you immediately click \"buy\" or \"request\" from wherever you're browsing, you're one impulse away from derailment."
        },
        {
          "type": "paragraph",
          "text": "Instead, you route new titles into the queue, and you route queue titles into start only when they're the lane pick. That means your \"start\" action isn't always available. It has a rule."
        },
        {
          "type": "subheading",
          "text": "3) Separate browsing intent from reading habit"
        },
        {
          "type": "paragraph",
          "text": "Browsing is for \"finding.\" Reading is for \"finishing.\" They use different muscles. When you mash them together, you get anxious collecting instead of steady progress."
        },
        {
          "type": "paragraph",
          "text": "If your TBR feels like it's calling you, you've trained your brain that every interesting title deserves immediate action."
        },
        {
          "type": "paragraph",
          "text": "So we break the conditioning by making the action boring and the finishing rewarding."
        },
        {
          "type": "paragraph",
          "text": "A concrete example: keep a wishlist/queue approach where your wishlist items don't become immediate starts. They become scheduled options. You'll still enjoy the fun of discovery, but the queue becomes a decision tool, not a distraction engine."
        },
        {
          "type": "paragraph",
          "text": "And if you're wondering how this connects to writers: it connects because your brain needs uninterrupted reading time to notice craft on the page\u2014structure, escalation, character turns, the way genre fiction handles tension. If you keep interrupting with catalog scrolling, your craft attention never fully lands."
        },
        {
          "type": "paragraph",
          "text": "You can't reverse engineer what you only sampled for ten minutes."
        }
      ],
      "image": null
    },
    {
      "section_id": "h2_track_what_you_read_for_writing",
      "heading": "How to track what you read for writing (so it becomes usable insight)",
      "heading_slug": "how-to-track-what-you-read-for-writing-so-it-becomes-usable-insight",
      "keyword_key": "h2_track_what_you_read_for_writing",
      "keywords": [
        "writing leverage",
        "notes",
        "pattern-spotting",
        "reverse engineer",
        "private journal",
        "clarity",
        "insight",
        "revision fuel",
        "craft takeaways",
        "hindsight"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Tracking is where most people go wrong. Either they track too little (\"I read three books!\") or they track like it's a college course (spreadsheets with categories that no one revisits)."
        },
        {
          "type": "paragraph",
          "text": "The fix is to track for *writing*, not for guilt."
        },
        {
          "type": "paragraph",
          "text": "If your goal is to become better at drafting, you need notes that help you see patterns. You also need to avoid drowning in documentation."
        },
        {
          "type": "paragraph",
          "text": "Here's **how to track what you read for writing** in a way that fits writers' reality:"
        },
        {
          "type": "subheading",
          "text": "Keep a lightweight log (3\u20136 sentences)"
        },
        {
          "type": "paragraph",
          "text": "After each finished read, write:"
        },
        {
          "type": "list",
          "items": [
            "What the book promised (in your own words)",
            "What actually happened (one-line plot structure recap)",
            "The character engine (what changed, and what forced it)",
            "One craft detail you can steal responsibly (scene construction, pacing choice, reveal timing, POV discipline)",
            "One moment you'd like to copy into your draft\u2014if you had the nerve",
            "One weakness you can name (so you don't repeat it)"
          ]
        },
        {
          "type": "paragraph",
          "text": "That's it. No award ceremonies. No \"reading journal\" cosplay."
        },
        {
          "type": "subheading",
          "text": "Optional: private notes for harsher critique"
        },
        {
          "type": "paragraph",
          "text": "If you want deeper analysis, use a private space where you can be frank about what isn't working. Write the ugly version: \"The middle drags.\" \"The stakes don't escalate.\" \"The ending solves a problem the first half never raised.\" This is signal, not sentiment."
        },
        {
          "type": "subheading",
          "text": "Reverse engineer book recommendations from comps you study"
        },
        {
          "type": "paragraph",
          "text": "This is the secret bridge to writing: after you log craft moments, you look back and ask what makes similar stories work. When you find a novel that nails the thing you're trying to pull off, you're holding a book recommendation you can hand to readers of your own work eventually."
        },
        {
          "type": "paragraph",
          "text": "Are the chapters short? Is the protagonist forced into choices? Is the book obsessed with cause-and-effect? Does it keep landing consequences after every attempt?"
        },
        {
          "type": "paragraph",
          "text": "That's **how to track what you read for writing** in a way that gives you a writer's toolkit instead of just memories."
        },
        {
          "type": "paragraph",
          "text": "And if you're the kind of writer who reads for craft but keeps losing it later\u2014yeah, this is your moment to stop trusting vibes. Notes turn \"I liked it\" into \"I know why it worked.\""
        },
        {
          "type": "paragraph",
          "text": "Also, concrete tie-in to the industry: when you're writing a book that belongs in a slush pile conversation, you're always building invisible comparables. Tracking helps you do it with less guessing. You start writing like someone who has actually studied the genre fiction mechanics, not just consumed the glossy surface."
        },
        {
          "type": "blockquote",
          "text": "\"Track your reads so they become craft insights, not just memories.\" \u2014because your future draft deserves receipts"
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_43/day_593/your-tbr-isn-t-for-browsing-it-s-for-finishing-so-your-writing-learns-something/blog/blog_section_image_writing_leverage_notes_blog_section_landscape_9ee59580eb18.jpeg",
        "alt": "How to track what you read for writing (so it becomes usable insight)",
        "width": 4272,
        "height": 2848,
        "creator": "jessica olivella",
        "creatorUrl": "https://www.pexels.com/@jessica-olivella-555697728",
        "provider": "pexels",
        "role": "section"
      }
    },
    {
      "section_id": "h2_genre_fiction_depth_without_stagnation",
      "heading": "Reading goals, genre fiction, and the \"breadth vs depth\" trap",
      "heading_slug": "reading-goals-genre-fiction-and-the-breadth-vs-depth-trap",
      "keyword_key": "h2_genre_fiction_depth_without_stagnation",
      "keywords": [
        "genre fiction",
        "depth",
        "breadth",
        "classics",
        "current popular titles",
        "comparisons",
        "envy",
        "balance",
        "curiosity",
        "reading habits",
        "comps"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Writers want two things at once:"
        },
        {
          "type": "paragraph",
          "text": "1) breadth\u2014enough reading to stay fluent in the larger ecosystem, and 2) depth\u2014enough repetition to learn the genre's real moving parts."
        },
        {
          "type": "paragraph",
          "text": "The problem is that the \"compare yourself to shiny examples in the same space\" instinct makes breadth feel like competition. Then genre focus collapses into envy and frantic starting."
        },
        {
          "type": "paragraph",
          "text": "So here's **how to focus on one genre while reading** without turning your reading goals into a spreadsheet prison:"
        },
        {
          "type": "subheading",
          "text": "Use reading goals for count, not for mood"
        },
        {
          "type": "paragraph",
          "text": "For **reading goals for writers how many books**, decide a number based on your actual reading mix. If you mostly read shorter categories, your goal can be bigger. If you keep picking brick-thick books, scale down. The point is realism so the goal stays doable, not impressive."
        },
        {
          "type": "paragraph",
          "text": "A contrarian mindset helps here: a realistic goal that you finish beats an unrealistic goal that humiliates you."
        },
        {
          "type": "subheading",
          "text": "Stay current inside the lane"
        },
        {
          "type": "paragraph",
          "text": "Balance classics with current popular titles, but don't treat \"classics-only\" as genre education. For writing, currency matters\u2014because pacing trends, audience expectations, and what editors see as \"normal\" inside genre fiction shift over time."
        },
        {
          "type": "paragraph",
          "text": "So the breadth component is partly knowledge, partly calibration. You keep your genre fiction lane by reading enough recent examples to understand what readers currently want."
        },
        {
          "type": "subheading",
          "text": "Build depth through repeats, not through random detours"
        },
        {
          "type": "paragraph",
          "text": "If genre fiction is your lane, then the books in your active queue should share enough DNA that your craft comparison is meaningful. It's how you avoid the \"everything is different so nothing teaches me\" feeling."
        },
        {
          "type": "paragraph",
          "text": "That also helps with the second pain point: balancing breadth and genre fiction while writing and comparing. When your queue is structured, you stop treating each book like a new life crisis and start treating it like study."
        },
        {
          "type": "subheading",
          "text": "Leave wiggle room for spontaneous reading\u2014but don't let it become the system"
        },
        {
          "type": "paragraph",
          "text": "The goal is joy. If you delete all spontaneity, you burn out and stop wanting to read at all, which is the quickest way to kill a reading habit."
        },
        {
          "type": "paragraph",
          "text": "But wiggle room needs boundaries. Here's a simple rule: spontaneous picks can happen as long as they don't blow up your active queue. One spontaneous book per cycle, and then you return to your lane."
        },
        {
          "type": "paragraph",
          "text": "That's how you keep wonder alive while still honoring the work you wanted reading to do for your writing."
        },
        {
          "type": "paragraph",
          "text": "And yes: this is exactly the kind of contrarian, writer-outcome-first workflow WQH leans into. Build your system to connect your reading life to craft learning\u2014consistently\u2014so you actually get better at the writing you're trying to ship. That's the whole point."
        },
        {
          "type": "paragraph",
          "text": "If your system doesn't make it easier to finish books, it's just another productivity costume."
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_43/day_593/your-tbr-isn-t-for-browsing-it-s-for-finishing-so-your-writing-learns-something/blog/blog_section_image_genre_fiction_depth_blog_section_landscape_1b78b56a22d4.gif",
        "alt": "Reading goals, genre fiction, and the \"breadth vs depth\" trap",
        "width": 226,
        "height": 200,
        "creator": "Thestrongtoothbrush",
        "creatorUrl": "https://giphy.com/gifs/goofball-6767-676767-XMMUWcz4XtDTNgZj22",
        "provider": "giphy",
        "role": "section"
      }
    }
  ],
  "closingImage": {
    "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_43/day_593/your-tbr-isn-t-for-browsing-it-s-for-finishing-so-your-writing-learns-something/blog/blog_section_image_hands_on_hips_fist_pump_blog_section_landscape_7ef062b5e122.jpeg",
    "alt": "blog section image \u00b7 hands on hips fist pump",
    "width": 6000,
    "height": 4000,
    "creator": "Mario Am\u00e9",
    "creatorUrl": "https://www.pexels.com/@imperioame",
    "provider": "pexels",
    "role": "section"
  },
  "alsoLike": [
    {
      "title": "5 ways to build a compelling novel concept with a real kicker (not just a plot twist)",
      "url": "https://writequeryhook.com/blog/5-ways-to-build-a-compelling-novel-concept-with-a-real-kicker-not-just-a-plot"
    },
    {
      "title": "5 tips self-published authors use to turn early readers into real publishing success",
      "url": "https://writequeryhook.com/blog/5-tips-self-published-authors-use-to-turn-early-readers-into-real-publishing"
    },
    {
      "title": "5 tips for copyrighting a book: what to protect, and whether to register",
      "url": "https://writequeryhook.com/blog/5-tips-for-copyrighting-a-book-what-to-protect-and-whether-to-register"
    },
    {
      "title": "How to word count for novels and children's books (the definitive \"how long should it be?\" method)",
      "url": "https://writequeryhook.com/blog/how-to-word-count-for-novels-and-children-s-books-the-definitive-how-long"
    }
  ],
  "alsoLikeAfterIndex": 2,
  "faq": [
    {
      "question": "How can a writer set a reading goal without it feeling unrealistic?",
      "answer": "Choose a yearly goal that matches the actual reading mix you already live in. If the types of books you gravitate toward usually take less or more time, adjust the number so it stays doable\u2014otherwise you'll associate the goal with failure instead of progress."
    },
    {
      "question": "What's the best way to balance reading widely with reading deeply in one genre?",
      "answer": "Keep a lane for genre fiction depth while still reading widely enough to stay fluent in the broader literary context. That means you're not only leaning on classics; you're also keeping up with current and popular examples in your genre so your comparisons stay relevant to what readers expect now."
    },
    {
      "question": "How do you prevent endless browsing from becoming procrastination?",
      "answer": "Use a wishlist/queue approach so titles you like don't instantly become \"start now.\" The system should minimize browsing and create friction around choosing and starting\u2014so your reading habits shift toward actually reading instead of checking."
    },
    {
      "question": "What should you track after reading to make it useful for writing?",
      "answer": "Log a few sentences about what you thought, what happened, and the craft details you can reuse. If you want, add deeper private notes for harsher critiques. Over time, you can use those notes to discover book recommendations you'd want to share with readers who love what you write."
    },
    {
      "question": "Should you organize your TBR so tightly that you lose fun reading?",
      "answer": "No. Leave wiggle room for spontaneous picks and enjoyment. Wonder sustains motivation, and long-term writing growth needs you to keep liking the experience\u2014not only \"performing\" reading."
    }
  ],
  "closingBlocks": [
    {
      "type": "paragraph",
      "text": "Fix your TBR by fixing the *behavior loop*: fewer browsing windows, fewer active titles, clearer start triggers, and notes that turn reading into craft."
    },
    {
      "type": "paragraph",
      "text": "Do that, and your reading goals stop being a list of guilt. They become a finish line you can actually cross\u2014one book at a time\u2014while your genre fiction understanding gets sharper in the dark between drafts."
    },
    {
      "type": "paragraph",
      "text": "Open the queue. Pick the lane book. Give it the first chapter, today."
    }
  ],
  "relatedLinks": [
    {
      "title": "5 ways to build a compelling novel concept with a real kicker (not just a plot twist)",
      "url": "https://writequeryhook.com/blog/5-ways-to-build-a-compelling-novel-concept-with-a-real-kicker-not-just-a-plot"
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
      "@id": "https://writequeryhook.com/blog/your-tbr-isn-t-for-browsing-it-s-for-finishing-so-your-writing-learns-something#breadcrumb",
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
          "name": "Your TBR Isn't for Browsing\u2014It's for Finishing (So Your Writing Learns Something)",
          "item": "https://writequeryhook.com/blog/your-tbr-isn-t-for-browsing-it-s-for-finishing-so-your-writing-learns-something"
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": "https://writequeryhook.com/blog/your-tbr-isn-t-for-browsing-it-s-for-finishing-so-your-writing-learns-something#webpage",
      "url": "https://writequeryhook.com/blog/your-tbr-isn-t-for-browsing-it-s-for-finishing-so-your-writing-learns-something",
      "name": "Your TBR Isn't for Browsing\u2014It's for Finishing (So Your Writing Learns Something)",
      "isPartOf": {
        "@id": "https://writequeryhook.com/#website"
      },
      "inLanguage": "en-US",
      "primaryImageOfPage": {
        "@id": "https://writequeryhook.com/blog/your-tbr-isn-t-for-browsing-it-s-for-finishing-so-your-writing-learns-something#primaryimage"
      },
      "breadcrumb": {
        "@id": "https://writequeryhook.com/blog/your-tbr-isn-t-for-browsing-it-s-for-finishing-so-your-writing-learns-something#breadcrumb"
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
      "@id": "https://writequeryhook.com/blog/your-tbr-isn-t-for-browsing-it-s-for-finishing-so-your-writing-learns-something#article",
      "isPartOf": {
        "@id": "https://writequeryhook.com/blog/your-tbr-isn-t-for-browsing-it-s-for-finishing-so-your-writing-learns-something#webpage"
      },
      "mainEntityOfPage": "https://writequeryhook.com/blog/your-tbr-isn-t-for-browsing-it-s-for-finishing-so-your-writing-learns-something",
      "headline": "Your TBR Isn't for Browsing\u2014It's for Finishing (So Your Writing Learns Something)",
      "alternativeHeadline": "Your TBR Isn\u2019t for Browsing\u2014It\u2019s for Finishing (So Your Writing Learns Something)",
      "description": "I have a theory, and I'm putting it on the table before we pretend this is \"productivity\": browsing isn't reading. Browsing is what you do while your reading life waits in the lobby, holding a clipboard and wondering if today is its day.",
      "wordCount": 2328,
      "timeRequired": "PT12M",
      "articleSection": "Querying",
      "keywords": [
        "industry literacy",
        "craft",
        "tools & resources",
        "contrarian",
        "finish-line",
        "browsing trap",
        "queue",
        "genre depth",
        "accountability",
        "craft notes",
        "reading progress",
        "discipline"
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
        "@id": "https://writequeryhook.com/blog/your-tbr-isn-t-for-browsing-it-s-for-finishing-so-your-writing-learns-something#primaryimage"
      },
      "datePublished": "2027-10-26",
      "dateModified": "2027-10-26",
      "mentions": [
        {
          "@type": "WebPage",
          "name": "5 ways to build a compelling novel concept with a real kicker (not just a plot twist)",
          "url": "https://writequeryhook.com/blog/5-ways-to-build-a-compelling-novel-concept-with-a-real-kicker-not-just-a-plot"
        },
        {
          "@type": "WebPage",
          "name": "5 tips self-published authors use to turn early readers into real publishing success",
          "url": "https://writequeryhook.com/blog/5-tips-self-published-authors-use-to-turn-early-readers-into-real-publishing"
        },
        {
          "@type": "WebPage",
          "name": "5 tips for copyrighting a book: what to protect, and whether to register",
          "url": "https://writequeryhook.com/blog/5-tips-for-copyrighting-a-book-what-to-protect-and-whether-to-register"
        },
        {
          "@type": "WebPage",
          "name": "How to word count for novels and children's books (the definitive \"how long should it be?\" method)",
          "url": "https://writequeryhook.com/blog/how-to-word-count-for-novels-and-children-s-books-the-definitive-how-long"
        }
      ]
    },
    {
      "@type": "ImageObject",
      "@id": "https://writequeryhook.com/blog/your-tbr-isn-t-for-browsing-it-s-for-finishing-so-your-writing-learns-something#primaryimage",
      "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_43/day_593/your-tbr-isn-t-for-browsing-it-s-for-finishing-so-your-writing-learns-something/blog/blog_hero_catalog_scrolling_dread_blog_hero_landscape_8c237d102b5b.jpeg",
      "width": 6000,
      "height": 4000,
      "caption": "blog hero \u00b7 catalog scrolling dread",
      "creditText": "Felicity Tai",
      "author": {
        "@type": "Person",
        "name": "Felicity Tai",
        "url": "https://www.pexels.com/@felicity-tai"
      },
      "@context": "https://schema.org"
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": "https://writequeryhook.com/blog/your-tbr-isn-t-for-browsing-it-s-for-finishing-so-your-writing-learns-something#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How can a writer set a reading goal without it feeling unrealistic?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Choose a yearly goal that matches the actual reading mix you already live in. If the types of books you gravitate toward usually take less or more time, adjust the number so it stays doable\u2014otherwise you'll associate the goal with failure instead of progress."
          }
        },
        {
          "@type": "Question",
          "name": "What's the best way to balance reading widely with reading deeply in one genre?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Keep a lane for genre fiction depth while still reading widely enough to stay fluent in the broader literary context. That means you're not only leaning on classics; you're also keeping up with current and popular examples in your genre so your comparisons stay relevant to what readers expect now."
          }
        },
        {
          "@type": "Question",
          "name": "How do you prevent endless browsing from becoming procrastination?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Use a wishlist/queue approach so titles you like don't instantly become \"start now.\" The system should minimize browsing and create friction around choosing and starting\u2014so your reading habits shift toward actually reading instead of checking."
          }
        },
        {
          "@type": "Question",
          "name": "What should you track after reading to make it useful for writing?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Log a few sentences about what you thought, what happened, and the craft details you can reuse. If you want, add deeper private notes for harsher critiques. Over time, you can use those notes to discover book recommendations you'd want to share with readers who love what you write."
          }
        },
        {
          "@type": "Question",
          "name": "Should you organize your TBR so tightly that you lose fun reading?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. Leave wiggle room for spontaneous picks and enjoyment. Wonder sustains motivation, and long-term writing growth needs you to keep liking the experience\u2014not only \"performing\" reading."
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
