import type { Metadata } from 'next';
import { Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const PAGE_DATA = {
  "slug": "how-to-fix-exposition-only-dialogue-don-t-force-leading-questions-just-to",
  "title": "How to fix exposition-only dialogue: don\u2019t force leading questions just to deliver examples",
  "description": "If your dialogue feels like two people swapping facts, the scene starts to die in the mouth.",
  "readTime": "12 min read",
  "publishedDate": "2027-01-04",
  "modifiedDate": "2027-01-04",
  "canonicalUrl": "https://writequeryhook.com/blog/how-to-fix-exposition-only-dialogue-don-t-force-leading-questions-just-to",
  "siteUrl": "https://writequeryhook.com",
  "siteName": "Write Query Hook",
  "locale": "en-US",
  "articleSection": "Querying",
  "keywords": [
    "sample pages",
    "craft",
    "revision",
    "querying",
    "contrived",
    "character goals",
    "revision pass",
    "stakes",
    "dialogue vs narrative voice",
    "exposure",
    "authenticity",
    "scene purpose"
  ],
  "author": null,
  "hero": {
    "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_17/day_234/how-to-fix-exposition-only-dialogue-don-t-force-leading-questions-just-to/blog/blog_hero_boredom_dread_blog_hero_landscape_9f87b59f06b2.jpeg?updatedAt=1782428574812",
    "alt": "blog hero \u00b7 boredom dread",
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
      "name": "How to fix exposition-only dialogue: don\u2019t force leading questions just to deliver examples",
      "item": "https://writequeryhook.com/blog/how-to-fix-exposition-only-dialogue-don-t-force-leading-questions-just-to"
    }
  ],
  "tldrBlocks": [],
  "openingBlocks": [
    {
      "type": "paragraph",
      "text": "If your dialogue feels like two people swapping facts, the scene starts to die in the mouth."
    },
    {
      "type": "paragraph",
      "text": "And it\u2019s usually not because you can\u2019t write dialogue. It\u2019s because you accidentally built an **exposition delivery** device and then asked your characters to wear it like a costume. So instead of wanting something from each other, they start performing a Q&A pattern\u2014leading questions included\u2014so you can \u201cshow\u201d the information the reader needs."
    },
    {
      "type": "paragraph",
      "text": "This is the exact failure mode behind the common symptoms: **dialogue** that\u2019s chatty but thin, **exposition** that comes out clunky, **characters** who stop feeling like humans with messy motives, and a **scene** that reads like it was assembled to carry information rather than to live through a moment."
    },
    {
      "type": "paragraph",
      "text": "Let me break down how this happens, how it shows up on the page, and how to revise it without turning the conversation into a philosophical monologue. No theory fluff\u2014just a structural autopsy."
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
            "Leading questions in **dialogue** often replace motivation with \u201cexposition\u201d function.",
            "If a character speaks only to trigger information transfer, they stop feeling human.",
            "Fix it by ensuring **every character needs clear motivations in scenes**\u2014even when goals mismatch.",
            "If the POV (or **narrative voice**) already knows the facts, deliver them directly instead of forcing dialogue.",
            "If the POV character needs to learn something, turn learning into a real **scene** with stakes and action.",
            "Before writing a conversation, ask whether the beat needs dialogue at all."
          ]
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_17/day_234/how-to-fix-exposition-only-dialogue-don-t-force-leading-questions-just-to/blog/blog_section_image_tldr_blog_section_landscape_b00f56ba4e18.gif?updatedAt=1782428575349",
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
      "section_id": "h2_exposition_only_dialogue",
      "heading": "The real problem: exposition-only dialogue (and how it kills \u201cscene\u201d life)",
      "heading_slug": "the-real-problem-exposition-only-dialogue-and-how-it-kills-scene-life",
      "keyword_key": "h2_exposition_only_dialogue",
      "keywords": [
        "frustration",
        "exposure",
        "boredom",
        "hollow",
        "exposition delivery",
        "fake Q&A",
        "brittle tone",
        "reader disengagement",
        "why is this happening?",
        "rewrite"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Here\u2019s what an exposition-only dialogue scene usually looks like when you\u2019re close enough to smell it:"
        },
        {
          "type": "list",
          "items": [
            "A character asks a question that no one with their personality would phrase that way.",
            "The other character answers with neat, complete, reader-friendly information.",
            "The conversation doesn\u2019t change anyone\u2019s next move. It doesn\u2019t cost anything. It doesn\u2019t risk humiliation or loss.",
            "After the exchange, you still need to \u201cdo the scene,\u201d which tells you the talk was never the scene\u2014it was a delivery system."
          ]
        },
        {
          "type": "paragraph",
          "text": "Like, you can almost feel the author\u2019s hand on the back of the characters\u2019 heads."
        },
        {
          "type": "blockquote",
          "text": "\u201cThe sentence isn\u2019t \u2018what they\u2019re saying.\u2019 It\u2019s \u2018what the author wants the reader to learn.\u2019 That\u2019s the swap that makes it feel fake.\u201d"
        },
        {
          "type": "paragraph",
          "text": "Notice the mechanics of the swap:"
        },
        {
          "type": "paragraph",
          "text": "1. The writer introduces a fact the reader needs (setting, rules, backstory, threat, mystery). 2. The writer invents a reason to say it out loud. 3. To make it sound organic, the writer leans on questions that steer the answers\u2014leading questions that cue the \u201ccorrect\u201d response. 4. The characters stop driving. The information drives."
        },
        {
          "type": "paragraph",
          "text": "So yes, you end up with **exposition** that arrives reliably. But it arrives like a delivery truck: parked, unloaded, then immediately irrelevant to the weather outside."
        },
        {
          "type": "subheading",
          "text": "The generalizable lesson"
        },
        {
          "type": "paragraph",
          "text": "Don\u2019t start from the information and then demand dialogue. Start from the exchange and ask whether dialogue is the *best* container."
        },
        {
          "type": "paragraph",
          "text": "A good quick audit: after any key **dialogue** exchange, ask, \u201cWhat decision did this force?\u201d If the answer is \u201cnone,\u201d you probably built a transcript, not a **scene**."
        },
        {
          "type": "paragraph",
          "text": "This matters because the brief\u2019s pain point is exactly what writers notice in revisions: you try to fix chatty dialogue by adding more description and more stakes\u2014but the problem isn\u2019t volume. It\u2019s *purpose*. The talk has the wrong job."
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_17/day_234/how-to-fix-exposition-only-dialogue-don-t-force-leading-questions-just-to/blog/blog_section_image_frustration_exposure_blog_section_landscape_009e3eafea1d.gif?updatedAt=1782428576153",
        "alt": "The real problem: exposition-only dialogue (and how it kills \u201cscene\u201d life)",
        "width": 377,
        "height": 200,
        "creator": "Giphy",
        "creatorUrl": "https://giphy.com/gifs/couple-couch-8jHZJ0m3yhX5C",
        "provider": "giphy",
        "role": "section"
      }
    },
    {
      "section_id": "h2_what_each_character_wants",
      "heading": "Every character needs clear motivations in scenes (even when the talk is about facts)",
      "heading_slug": "every-character-needs-clear-motivations-in-scenes-even-when-the-talk-is-about",
      "keyword_key": "h2_what_each_character_wants",
      "keywords": [
        "tension",
        "negotiation",
        "mismatch",
        "desire",
        "motivation",
        "pressure",
        "power",
        "active listening",
        "conflict",
        "human"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "So how do you keep the information without turning your characters into exposition mannequins?"
        },
        {
          "type": "paragraph",
          "text": "You give them wants."
        },
        {
          "type": "paragraph",
          "text": "Not \u201cthe protagonist wants X, and the scene includes Y.\u201d I mean: each character in the **dialogue** needs a goal they\u2019re trying to reach *right now*. If two people are talking, their motives should create friction, delay, misdirection, bargains, or at least uneven emphasis."
        },
        {
          "type": "paragraph",
          "text": "Intermediate revision writers often treat motivation like decoration\u2014something you can sprinkle after you\u2019ve already drafted the information exchange. That\u2019s backwards. Motivation is the steering wheel. Exposition should go where the steering wheel takes it."
        },
        {
          "type": "paragraph",
          "text": "Here\u2019s a better structure for dialogue scenes:"
        },
        {
          "type": "list",
          "items": [
            "The POV (or primary character) wants something immediate: an advantage, safety, leverage, access, permission, time.",
            "The other character wants something immediate: to protect their secret, extract a favor, test the POV, avoid blame, gain status, keep control.",
            "The information appears because it\u2019s useful to those goals\u2014or because it\u2019s fought over."
          ]
        },
        {
          "type": "paragraph",
          "text": "So the \u201canswer\u201d won\u2019t be neat. It\u2019ll be partial, delayed, defensive, threatening, strategically offered, or withheld until someone earns it."
        },
        {
          "type": "blockquote",
          "text": "\u201cConversations feel real when each person is trying to win their own argument\u2014facts show up as weapons, not as service announcements.\u201d"
        },
        {
          "type": "subheading",
          "text": "Why leading questions happen (and why you should distrust them)"
        },
        {
          "type": "paragraph",
          "text": "Leading questions feel safe because they pre-load the \u201cright\u201d answer for the reader. They let you control clarity."
        },
        {
          "type": "paragraph",
          "text": "But control is the enemy of authenticity. When you force a question into the mouth of a character, you\u2019re also forcing that character to behave like a ventriloquist dummy\u2014someone who exists to route information to the page."
        },
        {
          "type": "paragraph",
          "text": "Instead, let the character *fail to cooperate*."
        },
        {
          "type": "paragraph",
          "text": "If the POV needs knowledge, the other character\u2019s motive should decide whether that knowledge arrives easily. If the other character is guarding something, the POV should have to earn it. If the other character wants attention or advantage, the \u201cfacts\u201d should come braided with their agenda."
        },
        {
          "type": "subheading",
          "text": "The generalizable lesson"
        },
        {
          "type": "paragraph",
          "text": "When you revise **dialogue**, revise motivation first, not phrasing second."
        },
        {
          "type": "paragraph",
          "text": "If both characters have reasons to speak that conflict with each other, you can naturally avoid \u201chow to avoid leading questions in dialogue\u201d without pretending that people speak in riddles. They just don\u2019t speak as narrator-delivery systems."
        },
        {
          "type": "paragraph",
          "text": "That also addresses the pain point writers report: the scene stops feeling contrived, because the exchange becomes a clash with stakes\u2014no matter how mundane the setting is."
        }
      ],
      "image": null
    },
    {
      "section_id": "h2_turning_exposition_into_active_scene",
      "heading": "Turning exposition into an active scene (so learning has consequences)",
      "heading_slug": "turning-exposition-into-an-active-scene-so-learning-has-consequences",
      "keyword_key": "h2_turning_exposition_into_active_scene",
      "keywords": [
        "stakes",
        "investigation",
        "problem-solving",
        "forward motion",
        "dread-to-action",
        "evidence hunt",
        "momentum",
        "consequence",
        "scene engineering"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Let\u2019s talk about the best alternative to exposition-only dialogue: **turning exposition into an active scene**."
        },
        {
          "type": "paragraph",
          "text": "If the POV character needs to learn something, that learning should cost them time, risk a mistake, and force decisions. It should create forward motion: investigation, negotiation, observation, testing, arguing, paying, bargaining, running, waiting, checking."
        },
        {
          "type": "paragraph",
          "text": "Your job is to stop treating \u201cfinding out\u201d as a pause in the story. It\u2019s the story."
        },
        {
          "type": "paragraph",
          "text": "So instead of:"
        },
        {
          "type": "list",
          "items": [
            "Someone asks a leading question.",
            "Someone delivers the information in a tidy answer."
          ]
        },
        {
          "type": "paragraph",
          "text": "You do:"
        },
        {
          "type": "list",
          "items": [
            "The POV hits a problem.",
            "The POV chooses a method.",
            "The POV uncovers information with tradeoffs."
          ]
        },
        {
          "type": "paragraph",
          "text": "That tradeoff might be: \u201cWe learn it, but now we\u2019re late.\u201d Or: \u201cWe learn it, but now we\u2019re compromised.\u201d Or: \u201cWe learn it, but now the enemy knows we asked.\u201d"
        },
        {
          "type": "paragraph",
          "text": "If the scene needs the reader to understand a rule or backstory detail, you can still make the reader understand it while the POV character earns it in action."
        },
        {
          "type": "blockquote",
          "text": "\u201cBuild the stakes and action around learning the information\u2014don\u2019t build the scene only to deliver it.\u201d"
        },
        {
          "type": "subheading",
          "text": "A structural template you can use immediately"
        },
        {
          "type": "paragraph",
          "text": "When you\u2019re tempted to add leading questions, replace the conversation beat with a question the character can investigate. Like:"
        },
        {
          "type": "list",
          "items": [
            "What do they need to confirm?",
            "What would happen if they confirm the wrong thing?",
            "What evidence would they look for first?",
            "Who would interfere with their search?",
            "What does the character gain if they succeed today?"
          ]
        },
        {
          "type": "paragraph",
          "text": "Then write the investigation beat. Let the facts emerge as results of choices."
        },
        {
          "type": "paragraph",
          "text": "This is how **turning exposition into an active scene** stops being a concept and becomes a draft-level operation. You\u2019re converting \u201cauthor knows, character says\u201d into \u201ccharacter discovers, character pays.\u201d"
        },
        {
          "type": "subheading",
          "text": "The generalizable lesson"
        },
        {
          "type": "paragraph",
          "text": "When dialogue starts to feel contrived because it\u2019s forced to explain, your fix is not \u201cmake the lines sound more natural.\u201d Your fix is to change the **scene** structure: push learning into action."
        },
        {
          "type": "paragraph",
          "text": "That directly addresses another pain point from the brief: writers feel compelled to hide exposition in conversations, but it reads unnatural because the dialogue exists mainly for information transfer. Active acquisition is the antidote."
        }
      ],
      "image": null
    },
    {
      "section_id": "h2_when_to_use_narrative_voice_instead",
      "heading": "When to use narrative voice instead of dialogue (because omniscience isn\u2019t a sin)",
      "heading_slug": "when-to-use-narrative-voice-instead-of-dialogue-because-omniscience-isn-t-a-sin",
      "keyword_key": "h2_when_to_use_narrative_voice_instead",
      "keywords": [
        "clarity",
        "control",
        "perspective",
        "authorial knowledge",
        "direct delivery",
        "economy",
        "pacing",
        "voice choice",
        "clean exposition"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "There\u2019s a trap writers fall into: treating dialogue as the only acceptable delivery method."
        },
        {
          "type": "paragraph",
          "text": "Sometimes the right answer is: deliver the information directly through **narrative voice** and stop faking a conversation."
        },
        {
          "type": "paragraph",
          "text": "Rule of thumb: ask where the information \u201clives.\u201d"
        },
        {
          "type": "list",
          "items": [
            "If the POV character (or your narrative situation) already knows the information the reader needs, you don\u2019t need a character to \u201cask\u201d for it.",
            "Dialogue should be for conflict, negotiation, misunderstanding, persuasion, secrecy\u2014things that make the moment matter."
          ]
        },
        {
          "type": "paragraph",
          "text": "Trying to force dialogue when the narrative voice already has the facts often produces the exact symptom you\u2019re trying to avoid: **why dialogue feels contrived when forced**."
        },
        {
          "type": "subheading",
          "text": "A practical example of the revision move"
        },
        {
          "type": "paragraph",
          "text": "Suppose you wrote a conversation where one person explains:"
        },
        {
          "type": "list",
          "items": [
            "how a device works",
            "the history of a place",
            "the rule of a system",
            "the identity of someone important",
            "the implications of a threat"
          ]
        },
        {
          "type": "paragraph",
          "text": "If you can swap the whole exchange with a clean paragraph (or a small number of lines in narrative voice), do it. Then redeploy dialogue for what dialogue does best: push and pull, not tutorial."
        },
        {
          "type": "blockquote",
          "text": "\u201cIf your narrative voice already knows it, let it say it. Don\u2019t make characters audition for the role of your syllabus.\u201d"
        },
        {
          "type": "subheading",
          "text": "The generalizable lesson"
        },
        {
          "type": "paragraph",
          "text": "Knowing **when to use narrative voice instead of dialogue** is part of craft economy. It keeps your **scene** from turning into \u201ctwo characters performing exposition\u201d instead of \u201ctwo characters doing something under pressure.\u201d"
        },
        {
          "type": "paragraph",
          "text": "This doesn\u2019t mean dialogue is bad. It means dialogue isn\u2019t automatically the best tool for **exposition**."
        }
      ],
      "image": null
    },
    {
      "section_id": "h2_revision_recipe",
      "heading": "The revision recipe: fix your draft without losing the facts",
      "heading_slug": "the-revision-recipe-fix-your-draft-without-losing-the-facts",
      "keyword_key": "h2_revision_recipe",
      "keywords": [
        "checklist",
        "red pen",
        "tighten dialogue",
        "cut lines",
        "rewrite beats",
        "pressure test",
        "dialogue audit",
        "scene redesign",
        "validation"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Let\u2019s make this usable in the next rewrite pass."
        },
        {
          "type": "paragraph",
          "text": "Here\u2019s a fast **scene**-level checklist to apply when you suspect you\u2019re forcing leading questions to deliver examples."
        },
        {
          "type": "subheading",
          "text": "Step 1: Mark the \u201cinformation\u201d lines"
        },
        {
          "type": "paragraph",
          "text": "Take a pass and circle any dialogue where the purpose feels like:"
        },
        {
          "type": "list",
          "items": [
            "defining",
            "explaining",
            "listing rules",
            "translating history into present terms",
            "clarifying who/what/why for the reader"
          ]
        },
        {
          "type": "paragraph",
          "text": "Those are your likely exposition hooks."
        },
        {
          "type": "subheading",
          "text": "Step 2: Ask what each character wants *in the moment*"
        },
        {
          "type": "paragraph",
          "text": "For every marked exchange, write down:"
        },
        {
          "type": "list",
          "items": [
            "What does speaker A want right now?",
            "What does speaker B want right now?"
          ]
        },
        {
          "type": "paragraph",
          "text": "If either answer is \u201cspeaker A wants the reader to understand X,\u201d stop. Replace motivation with desire, leverage, avoidance, approval, safety, access\u2014something the character can pursue or be denied."
        },
        {
          "type": "paragraph",
          "text": "This is how you satisfy **every character needs clear motivations in scenes** and prevent characters from feeling like exposition conduits."
        },
        {
          "type": "subheading",
          "text": "Step 3: Decide which container the moment deserves"
        },
        {
          "type": "paragraph",
          "text": "Then choose one:"
        },
        {
          "type": "list",
          "items": [
            "If the scene can happen without dialogue, use action.",
            "If the POV character must learn the information, build the learning into **turning exposition into an active scene**.",
            "If the narrative voice can deliver it directly, use **when to use narrative voice instead of dialogue** and cut the forced conversation."
          ]
        },
        {
          "type": "subheading",
          "text": "Step 4: Replace leading questions with uncertainty"
        },
        {
          "type": "paragraph",
          "text": "If the conversation still needs to exist, remove the \u201cmagic steering\u201d question. Let questions be messy. Let answers be incomplete. Let the other character deflect, negotiate, or misunderstand\u2014not because you\u2019re being clever, but because motives create messy outcomes."
        },
        {
          "type": "subheading",
          "text": "Step 5: Re-read for contrivance signals"
        },
        {
          "type": "paragraph",
          "text": "Finally, read the revised **dialogue** with fresh eyes for this feeling:"
        },
        {
          "type": "list",
          "items": [
            "\u201cI can see the information getting loaded onto the page.\u201d",
            "\u201cThe characters are standing still while facts happen to them.\u201d"
          ]
        },
        {
          "type": "paragraph",
          "text": "If you feel that, you\u2019re probably still doing exposition delivery."
        },
        {
          "type": "paragraph",
          "text": "Cut until the **scene** starts moving again."
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
            "**Exposition** doesn\u2019t need to travel through **dialogue** just because you can write a conversation.",
            "Leading questions often mask a bigger issue: you replaced character motivation with exposition function.",
            "To avoid contrived **dialogue**, ensure every character wants something in the moment.",
            "When the POV needs info, **turning exposition into an active scene** beats \u201cask-and-answer\u201d delivery every time.",
            "Use **narrative voice** when the story position already knows the facts; don\u2019t force characters to perform your syllabus."
          ]
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_17/day_234/how-to-fix-exposition-only-dialogue-don-t-force-leading-questions-just-to/blog/blog_section_image_lessons_takeaways_blog_section_landscape_a158173bd9f0.jpeg?updatedAt=1782428576654",
        "alt": "Lessons / Takeaways",
        "width": 4752,
        "height": 3168,
        "creator": "Pixabay",
        "creatorUrl": "https://www.pexels.com/@pixabay",
        "provider": "pexels",
        "role": "section"
      }
    }
  ],
  "closingImage": null,
  "alsoLike": [
    {
      "title": "Common description mistakes that quietly wreck your pacing (and how to fix them)",
      "url": "https://writequeryhook.com/blog/common-description-mistakes-that-quietly-wreck-your-pacing-and-how-to-fix-them"
    },
    {
      "title": "Common manuscript mistakes that kill reader attention (and how to fix your desire line + deeper wish)",
      "url": "https://writequeryhook.com/blog/common-manuscript-mistakes-that-kill-reader-attention-and-how-to-fix-your"
    },
    {
      "title": "Common mistakes in medias res openings that make readers bail (and how to fix them)",
      "url": "https://writequeryhook.com/blog/common-mistakes-in-medias-res-openings-that-make-readers-bail-and-how-to-fix"
    },
    {
      "title": "5 tips for what happens on and off the page in your novel",
      "url": "https://writequeryhook.com/blog/5-tips-for-what-happens-on-and-off-the-page-in-your-novel"
    }
  ],
  "alsoLikeAfterIndex": 3,
  "faq": [
    {
      "question": "Why do leading questions in dialogue hurt a novel?",
      "answer": "They make characters feel less human because they stop pursuing their own wants and goals. Instead, they become tools for delivering exposition, which weakens the authenticity of the conversation."
    },
    {
      "question": "What should each character want during a dialogue scene?",
      "answer": "Each character needs a clear goal and coherent motivations, even if those goals only partially align with the protagonist\u2019s aims. That mismatch is part of what makes dialogue feel like a meaningful clash rather than a neat exchange."
    },
    {
      "question": "When should a writer use narrative voice to deliver exposition instead of dialogue?",
      "answer": "If the POV character or the omniscient narrative already knows the information the reader needs, it can be delivered directly. This avoids forcing contrived dialogue solely to transfer facts."
    },
    {
      "question": "If the POV character doesn\u2019t know the information yet, what\u2019s a better approach?",
      "answer": "Build the acquisition of information into a fully realized scene with stakes and active problem-solving. Instead of relying on a convenient expert to answer, consider how the character might investigate or take action to learn what they need."
    },
    {
      "question": "Is it ever okay to write conversations that contain exposition?",
      "answer": "Yes, conversations can be necessary, but the writer should think first about whether dialogue is the most engaging method. The key is to avoid constructing a scene that exists only to move information from author to reader."
    }
  ],
  "closingBlocks": [
    {
      "type": "paragraph",
      "text": "Open your draft and find the exchange where the dialogue exists mainly to deliver facts. Then do the hard swap: either give both speakers real goals that create friction, or rebuild the beat as action, or let narrative voice carry the exposition cleanly."
    },
    {
      "type": "paragraph",
      "text": "Your characters will start sounding like themselves again\u2014because you stopped making them read from your outline."
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
      "@id": "https://writequeryhook.com/blog/how-to-fix-exposition-only-dialogue-don-t-force-leading-questions-just-to#breadcrumb",
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
          "name": "How to fix exposition-only dialogue: don\u2019t force leading questions just to deliver examples",
          "item": "https://writequeryhook.com/blog/how-to-fix-exposition-only-dialogue-don-t-force-leading-questions-just-to"
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": "https://writequeryhook.com/blog/how-to-fix-exposition-only-dialogue-don-t-force-leading-questions-just-to#webpage",
      "url": "https://writequeryhook.com/blog/how-to-fix-exposition-only-dialogue-don-t-force-leading-questions-just-to",
      "name": "How to fix exposition-only dialogue: don\u2019t force leading questions just to deliver examples",
      "isPartOf": {
        "@id": "https://writequeryhook.com/#website"
      },
      "inLanguage": "en-US",
      "primaryImageOfPage": {
        "@id": "https://writequeryhook.com/blog/how-to-fix-exposition-only-dialogue-don-t-force-leading-questions-just-to#primaryimage"
      },
      "breadcrumb": {
        "@id": "https://writequeryhook.com/blog/how-to-fix-exposition-only-dialogue-don-t-force-leading-questions-just-to#breadcrumb"
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
      "@id": "https://writequeryhook.com/blog/how-to-fix-exposition-only-dialogue-don-t-force-leading-questions-just-to#article",
      "isPartOf": {
        "@id": "https://writequeryhook.com/blog/how-to-fix-exposition-only-dialogue-don-t-force-leading-questions-just-to#webpage"
      },
      "mainEntityOfPage": "https://writequeryhook.com/blog/how-to-fix-exposition-only-dialogue-don-t-force-leading-questions-just-to",
      "headline": "How to fix exposition-only dialogue: don\u2019t force leading questions just to deliver examples",
      "alternativeHeadline": "How to fix exposition-only dialogue: don\u2019t force leading questions just to deliver examples",
      "description": "If your dialogue feels like two people swapping facts, the scene starts to die in the mouth.",
      "wordCount": 2334,
      "timeRequired": "PT12M",
      "articleSection": "Querying",
      "keywords": [
        "sample pages",
        "craft",
        "revision",
        "querying",
        "contrived",
        "character goals",
        "revision pass",
        "stakes",
        "dialogue vs narrative voice",
        "exposure",
        "authenticity",
        "scene purpose"
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
        "@id": "https://writequeryhook.com/blog/how-to-fix-exposition-only-dialogue-don-t-force-leading-questions-just-to#primaryimage"
      },
      "datePublished": "2027-01-04",
      "dateModified": "2027-01-04",
      "mentions": [
        {
          "@type": "WebPage",
          "name": "Common description mistakes that quietly wreck your pacing (and how to fix them)",
          "url": "https://writequeryhook.com/blog/common-description-mistakes-that-quietly-wreck-your-pacing-and-how-to-fix-them"
        },
        {
          "@type": "WebPage",
          "name": "Common manuscript mistakes that kill reader attention (and how to fix your desire line + deeper wish)",
          "url": "https://writequeryhook.com/blog/common-manuscript-mistakes-that-kill-reader-attention-and-how-to-fix-your"
        },
        {
          "@type": "WebPage",
          "name": "Common mistakes in medias res openings that make readers bail (and how to fix them)",
          "url": "https://writequeryhook.com/blog/common-mistakes-in-medias-res-openings-that-make-readers-bail-and-how-to-fix"
        },
        {
          "@type": "WebPage",
          "name": "5 tips for what happens on and off the page in your novel",
          "url": "https://writequeryhook.com/blog/5-tips-for-what-happens-on-and-off-the-page-in-your-novel"
        }
      ]
    },
    {
      "@type": "ImageObject",
      "@id": "https://writequeryhook.com/blog/how-to-fix-exposition-only-dialogue-don-t-force-leading-questions-just-to#primaryimage",
      "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_17/day_234/how-to-fix-exposition-only-dialogue-don-t-force-leading-questions-just-to/blog/blog_hero_boredom_dread_blog_hero_landscape_9f87b59f06b2.jpeg?updatedAt=1782428574812",
      "width": 6000,
      "height": 4000,
      "caption": "blog hero \u00b7 boredom dread",
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
      "@id": "https://writequeryhook.com/blog/how-to-fix-exposition-only-dialogue-don-t-force-leading-questions-just-to#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Why do leading questions in dialogue hurt a novel?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "They make characters feel less human because they stop pursuing their own wants and goals. Instead, they become tools for delivering exposition, which weakens the authenticity of the conversation."
          }
        },
        {
          "@type": "Question",
          "name": "What should each character want during a dialogue scene?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Each character needs a clear goal and coherent motivations, even if those goals only partially align with the protagonist\u2019s aims. That mismatch is part of what makes dialogue feel like a meaningful clash rather than a neat exchange."
          }
        },
        {
          "@type": "Question",
          "name": "When should a writer use narrative voice to deliver exposition instead of dialogue?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "If the POV character or the omniscient narrative already knows the information the reader needs, it can be delivered directly. This avoids forcing contrived dialogue solely to transfer facts."
          }
        },
        {
          "@type": "Question",
          "name": "If the POV character doesn\u2019t know the information yet, what\u2019s a better approach?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Build the acquisition of information into a fully realized scene with stakes and active problem-solving. Instead of relying on a convenient expert to answer, consider how the character might investigate or take action to learn what they need."
          }
        },
        {
          "@type": "Question",
          "name": "Is it ever okay to write conversations that contain exposition?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, conversations can be necessary, but the writer should think first about whether dialogue is the most engaging method. The key is to avoid constructing a scene that exists only to move information from author to reader."
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
