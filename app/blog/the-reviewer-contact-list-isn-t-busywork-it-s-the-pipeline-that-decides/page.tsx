import type { Metadata } from 'next';
import { Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const PAGE_DATA = {
  "slug": "the-reviewer-contact-list-isn-t-busywork-it-s-the-pipeline-that-decides",
  "title": "The reviewer contact list isn't busywork: it's the pipeline that decides whether reviews happen",
  "description": "TLDR",
  "readTime": "13 min read",
  "publishedDate": "2027-05-27",
  "modifiedDate": "2027-05-27",
  "canonicalUrl": "https://writequeryhook.com/blog/the-reviewer-contact-list-isn-t-busywork-it-s-the-pipeline-that-decides",
  "siteUrl": "https://writequeryhook.com",
  "siteName": "Write Query Hook",
  "locale": "en-US",
  "articleSection": "Querying",
  "keywords": [
    "after the offer",
    "submissions",
    "marketing",
    "tools & resources",
    "overwhelm",
    "accuracy",
    "fit",
    "spreadsheets",
    "review outreach",
    "galleys",
    "response",
    "reuse"
  ],
  "author": null,
  "hero": {
    "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_30/day_413/the-reviewer-contact-list-isn-t-busywork-it-s-the-pipeline-that-decides/blog/blog_hero_dread_blank_page_energy_blog_hero_landscape_d5ec823232a5.jpeg?updatedAt=1782176903007",
    "alt": "blog hero \u00b7 dread blank-page energy",
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
      "name": "The reviewer contact list isn't busywork: it's the pipeline that decides whether reviews happen",
      "item": "https://writequeryhook.com/blog/the-reviewer-contact-list-isn-t-busywork-it-s-the-pipeline-that-decides"
    }
  ],
  "tldrBlocks": [],
  "openingBlocks": [
    {
      "type": "paragraph",
      "text": "TLDR"
    },
    {
      "type": "list",
      "items": [
        "Build the reviewer contact list first, then let that accuracy dictate the pitch you write.",
        "Reuse earlier lists, but split into sections and prune aggressively\u2014dead outlets poison response rates.",
        "Find new reviewers by matching book themes to what each outlet reliably covers, not by broad \"maybe they'll like it.\"",
        "Record request requirements (galley vs digital, and copy counts when needed) so you don't ask for the wrong thing.",
        "Use a reusable pitch template and swap only a few targeted lines that prove fit to each publication audience.",
        "Low response, bounces, and silence are real; the way you document and clean your list turns that chaos into progress."
      ]
    }
  ],
  "sections": [
    {
      "section_id": "h2_turning_a_contact_list_into_tailored_pitches",
      "heading": "Opening: the ocean in my ears is the sound of \"just one more contact\"",
      "heading_slug": "opening-the-ocean-in-my-ears-is-the-sound-of-just-one-more-contact",
      "keyword_key": "h2_turning_a_contact_list_into_tailored_pitches",
      "keywords": [
        "pitch template",
        "targeted lines",
        "proof of fit",
        "response rate",
        "personalization",
        "efficiency",
        "editing",
        "clarity",
        "persistence",
        "win"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "There's a specific kind of misery that hits after an offer. Not the celebratory kind\u2014more like the part where everyone suddenly remembers the publishing schedule doesn't care about vibes."
        },
        {
          "type": "paragraph",
          "text": "You're supposed to be lining up reviews, and someone says, \"We just need a bigger reviewer list.\" Cool. Sure. Except the list feels like an infinite shoreline. Add a few dozen names. Weed some duplicates. Fix a few addresses. Discover the outlet hasn't reviewed anything relevant in two years. Cut it. Repeat until the deadline shows up wearing a mean face."
        },
        {
          "type": "paragraph",
          "text": "The frustration is usually framed as motivation\u2014*if only we worked harder, we'd get responses.* But what actually crushes teams is the endless mechanical labor: accuracy work, fit work, and format-requirement work, all at once, under a countdown clock. The reviewer contact list determines whether outreach can land. It isn't clerical busywork. It's the thing that decides whether reviews happen at all."
        },
        {
          "type": "paragraph",
          "text": "OK pause. If you're a writer doing this yourself (or you're helping as part of a team), you've probably felt the same slap of reality: you can write a pitch that sings and still fail because the contact list was wrong, outdated, or missing the submission requirements. That's not \"marketing vibes.\" That's avoidable math."
        },
        {
          "type": "paragraph",
          "text": "This deep-dive is about one narrow concept: **how publication teams create and maintain reviewer contact lists that keep outreach from turning into shouted desperation**\u2014the kind that turns into bounces, \"we don't review that format,\" and \"no longer accepting pitches.\""
        },
        {
          "type": "blockquote",
          "text": "\"A good pitch starts with a good list\u2014fit and accuracy come before persuasion.\""
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_30/day_413/the-reviewer-contact-list-isn-t-busywork-it-s-the-pipeline-that-decides/blog/blog_section_image_pitch_template_targeted_lines_blog_section_landscape_069f24349b61.gif?updatedAt=1782176905323",
        "alt": "H2: How to build a reviewer contact list that actually works",
        "width": 268,
        "height": 200,
        "creator": "Giphy",
        "creatorUrl": "https://giphy.com/gifs/rugrats-responsibility-idTKjnzYuyPYs",
        "provider": "giphy",
        "role": "section"
      }
    },
    {
      "section_id": "h2_building_from_old_lists_without_carrying_the_garbage",
      "heading": "H2: Building from old lists without carrying the garbage",
      "heading_slug": "h2-building-from-old-lists-without-carrying-the-garbage",
      "keyword_key": "h2_building_from_old_lists_without_carrying_the_garbage",
      "keywords": [
        "reuse",
        "restraint",
        "sections",
        "pruning",
        "weeding",
        "fit",
        "patience",
        "spreadsheet",
        "lifelines",
        "regret"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "The fastest way to build a reviewer contact list is also the most emotionally tempting: **start from a previous release list** and reuse what already worked."
        },
        {
          "type": "paragraph",
          "text": "That's not superstition. It's process. A team typically takes a list built for earlier publications\u2014hundreds of reviewer names, outlets, and contact details\u2014and treats it like a living asset instead of a one-off project. The trick is to avoid the classic mistake: reopening the old file and calling it \"research.\""
        },
        {
          "type": "paragraph",
          "text": "Because old lists carry rot. Outlets stop reviewing. Editors change. A publication might still exist but quietly pivot away from your genre, your themes, or your format. Even worse, some outlets remain open while their submission preferences shift into something your outreach doesn't match. The list isn't \"wrong\" in a dramatic way. It just becomes wrong in a way that quietly murders response rates."
        },
        {
          "type": "paragraph",
          "text": "So teams don't restart from scratch every time. They reuse\u2014then they **split into sections** (because lists can get huge) and **prune aggressively**."
        },
        {
          "type": "paragraph",
          "text": "Pruning here means removing contacts if any of these things is true:"
        },
        {
          "type": "list",
          "items": [
            "the outlet no longer reviews (or stopped reviewing your kind of book)",
            "the outlet no longer produces relevant content",
            "the outlet's editorial focus doesn't match the book's fit anymore"
          ]
        },
        {
          "type": "paragraph",
          "text": "This is where deadlines start pressuring your brain. You want to keep going because the list still looks incomplete. But \"incomplete\" is not the goal. \"Good enough, on time, and actually usable\" is the goal."
        },
        {
          "type": "paragraph",
          "text": "And yes, this is the part that feels endless. Like, you sit there thinking about how many names you still need, but the more useful question is: *How many names are actually capable of saying yes?* That's the real unit of work."
        },
        {
          "type": "paragraph",
          "text": "Also, if you're building for yourself, you'll learn quickly that the difference between \"a list\" and \"a list that works\" is not the number of contacts. It's the pruning discipline. Teams that treat the contact list like a messy dump end up spending their pitch-writing energy apologizing for asking the wrong thing to the wrong person."
        },
        {
          "type": "paragraph",
          "text": "This is also the hidden reason outreach gets frustrating: a contact list with garbage data creates a feedback loop where your pitches bounce, your emails land in dead inboxes, and you start believing the effort itself is cursed. It isn't cursed. Your list is. Fix the list, and the effort starts paying you back."
        }
      ],
      "image": null
    },
    {
      "section_id": "h2_finding_new_reviewers_without_guessing_the_match",
      "heading": "H2: Finding new reviewers without guessing the match",
      "heading_slug": "h2-finding-new-reviewers-without-guessing-the-match",
      "keyword_key": "h2_finding_new_reviewers_without_guessing_the_match",
      "keywords": [
        "themes",
        "audience",
        "discovery",
        "detective work",
        "wrong outlets",
        "frustration",
        "verification",
        "pattern-matching",
        "momentum",
        "deadline"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Reusing an old list gives you momentum. But lists run out. Eventually you hit the \"we've asked everyone we can find\" feeling, and you need **how to find reviewers for a book**."
        },
        {
          "type": "paragraph",
          "text": "The wrong approach is brute-force searching. You find a handful of contacts, you send identical pitches with tiny edits, and you cross your fingers. That's how you end up with a bigger spreadsheet full of outlets that don't actually publish reviews like the ones you're trying to earn."
        },
        {
          "type": "paragraph",
          "text": "The right approach is almost boring: teams search based on **the book's themes** and the **target audience**\u2014then check multiple sites until the outlet fit is real."
        },
        {
          "type": "paragraph",
          "text": "Here's the key idea: the list should grow because the team understands *what the book is about in reader terms*, not only in plot terms. Themes and audience are the search engine. If you can name the target reader clearly, you can find outlets that reliably serve that reader\u2014either through the content they already publish or the editorial mission they claim."
        },
        {
          "type": "paragraph",
          "text": "And \"check multiple sites\" matters because it's the difference between a guess and a verified match. One source might look relevant in a vacuum. Another source's archives might show they don't review contemporary genre. Another might publish essays but never book reviews. A third might take pitches from authors but only for specific formats."
        },
        {
          "type": "paragraph",
          "text": "This is also where you prevent the second pain point: discovering too late that a source doesn't review anymore or doesn't fit your genre. Teams don't just add contacts and hope. They verify the fit before a pitch letter ever gets written."
        },
        {
          "type": "paragraph",
          "text": "Like\u2014listen. If a reviewer doesn't review your type of book, you can't \"pitch harder\" your way out. You're not negotiating with a human. You're asking a gatekeeper to break their own editorial rhythm. Most won't."
        },
        {
          "type": "paragraph",
          "text": "So the list-building workflow usually looks like this:"
        },
        {
          "type": "list",
          "items": [
            "Identify the themes + target audience for the current book (plain language)",
            "Search for reviewers/outlets where that content pattern exists",
            "Add only those contacts that look like true fit",
            "Keep the growth steady (a few dozen contacts each week) so you're not scrambling at the deadline"
          ]
        },
        {
          "type": "paragraph",
          "text": "Why \"a few dozen each week\" shows up in real workflows: it's enough to keep outreach feeding, but small enough to preserve quality. Big list expansions done in a single fever session tend to be sloppy. Then you're back to bounces and dead submissions."
        },
        {
          "type": "paragraph",
          "text": "When teams get low response rates, they don't just interpret silence as rejection. They treat it as a signal that some portion of the pipeline needs cleaning\u2014often the contact list or the request requirements. That signal drives the next round of list-building work."
        },
        {
          "type": "paragraph",
          "text": "And yes, the process is slow. But it's slow in the way that prevents expensive wasted outreach."
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_30/day_413/the-reviewer-contact-list-isn-t-busywork-it-s-the-pipeline-that-decides/blog/blog_section_image_themes_audience_blog_section_landscape_11133ea43946.gif?updatedAt=1782176903947",
        "alt": "H2: Finding new reviewers without guessing the match",
        "width": 200,
        "height": 200,
        "creator": "discoveryplus",
        "creatorUrl": "https://giphy.com/gifs/id-joe-kenda-american-detective-Xl2YIvu6qR7qwyqL19",
        "provider": "giphy",
        "role": "section"
      }
    },
    {
      "section_id": "h2_recording_request_requirements_for_galleys_and_digital_copies",
      "heading": "H2: Recording request requirements for galleys and digital copies",
      "heading_slug": "h2-recording-request-requirements-for-galleys-and-digital-copies",
      "keyword_key": "h2_recording_request_requirements_for_galleys_and_digital_copies",
      "keywords": [
        "format rules",
        "galley",
        "digital copy",
        "copies needed",
        "confusion",
        "prevent-bounces",
        "checklist",
        "compliance",
        "relief",
        "precision"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Here's the pain point nobody wants to admit until it bites them: **contact-finding isn't the hardest part anymore. It's knowing what to ask for once you've found the right people.**"
        },
        {
          "type": "paragraph",
          "text": "Outreach fails when the list doesn't capture **request requirements**. That includes whether reviewers want:"
        },
        {
          "type": "list",
          "items": [
            "a physical galley",
            "a digital copy",
            "a specific number of copies (when applicable)"
          ]
        },
        {
          "type": "paragraph",
          "text": "Different sources have different submission preferences. Sometimes the requirements are clearly stated. Sometimes they're buried on a submissions page. Sometimes the only accurate information is in a recent post or author guidelines that took a minute to locate."
        },
        {
          "type": "paragraph",
          "text": "Teams verify these during research because they know what happens when you don't:"
        },
        {
          "type": "list",
          "items": [
            "you ask for the wrong format",
            "you send the right format to the wrong address",
            "you use incorrect contact details",
            "you get bounced materials and the whole process feels like shouting into a void"
          ]
        },
        {
          "type": "paragraph",
          "text": "This is where the reviewer contact list stops being a name-and-address list and becomes a **requirements spreadsheet**. The list should record the details that prevent predictable failure."
        },
        {
          "type": "paragraph",
          "text": "Understanding **how to ask for a galley or digital copy** matters because you have to match what you're asking for to what each source accepts. Some outlets take only digital submissions. Others need physical galleys. Some have stopped accepting one format entirely."
        },
        {
          "type": "paragraph",
          "text": "And it's not just format. It's the \"how\" of the request\u2014because reviewers might have submission windows, preferred methods, or specific instructions. If your list doesn't store the request requirements, you end up re-researching every time you pitch. That turns the schedule into a constant scramble."
        },
        {
          "type": "paragraph",
          "text": "Stop and notice what's happening: a missing galley requirement doesn't only waste time. It also damages the team's credibility. Even one wrong request can turn a \"maybe\" outlet into a \"no\" because you didn't follow the rules they've already published."
        },
        {
          "type": "paragraph",
          "text": "So a useful reviewer contact list includes:"
        },
        {
          "type": "list",
          "items": [
            "outlet + reviewer contact info (publicly available)",
            "fit notes (genre/themes/audience alignment)",
            "request requirements: galley vs digital, and copy counts when needed",
            "any submission instructions that influence how you pitch"
          ]
        },
        {
          "type": "paragraph",
          "text": "This is also where documentation matters. Teams often document why each source is a match\u2014not as a bureaucratic exercise, but because it directly supports tailored pitch letters."
        },
        {
          "type": "paragraph",
          "text": "The list becomes the proof stash. And when you're under pressure, proof beats memory every time."
        },
        {
          "type": "paragraph",
          "text": "One more thing: yes, you will still get low response rates. Outreach can be slow. But when failures cluster around incorrect addresses or wrong format requests, the problem isn't your artistry. Your request pipeline has gaps\u2014and those gaps are fixable."
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_30/day_413/the-reviewer-contact-list-isn-t-busywork-it-s-the-pipeline-that-decides/blog/blog_section_image_format_rules_galley_blog_section_landscape_1f0b921834d1.jpeg?updatedAt=1782176904424",
        "alt": "H2: Recording request requirements for galleys and digital copies",
        "width": 6000,
        "height": 4000,
        "creator": "Joshua Miranda",
        "creatorUrl": "https://www.pexels.com/@joshuamiranda",
        "provider": "pexels",
        "role": "section"
      }
    },
    {
      "section_id": "h2_turning_a_contact_list_into_tailored_pitches",
      "heading": "H2: Turning a contact list into tailored pitches",
      "heading_slug": "h2-turning-a-contact-list-into-tailored-pitches",
      "keyword_key": "h2_turning_a_contact_list_into_tailored_pitches",
      "keywords": [
        "pitch template",
        "targeted lines",
        "proof of fit",
        "response rate",
        "personalization",
        "efficiency",
        "editing",
        "clarity",
        "persistence",
        "win"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "At some point you'll notice a weird paradox: **pitching feels easier than contact-finding**."
        },
        {
          "type": "paragraph",
          "text": "That's not because pitches are trivial. It's because teams use a reusable template and only customize the parts that actually need tailoring. Contact list work is expensive because you're searching for people who match your fit and requirements. Pitch writing is more predictable because you can structure it."
        },
        {
          "type": "paragraph",
          "text": "Teams typically rely on a basic pitch template that includes standard book and author information, then they add **a few targeted lines** for each outlet\u2014lines that connect the book's themes to why that publication audience would care. Understanding **what to include in review pitch letters** means starting from a template and adding those specifics."
        },
        {
          "type": "paragraph",
          "text": "This is where your reviewer contact list pays rent. A list that includes fit notes and request requirements makes tailoring possible without rewriting everything from scratch."
        },
        {
          "type": "paragraph",
          "text": "If the list only stores names and emails, tailoring becomes \"guessy.\" If it stores documented match rationale, tailoring becomes specific."
        },
        {
          "type": "paragraph",
          "text": "And specificity is what agents and reviewers can read fast. They don't have time to decipher your whole worldview. If your pitch states fit clearly\u2014without over-explaining\u2014the odds improve that they'll actually respond."
        },
        {
          "type": "paragraph",
          "text": "So what does **how to tailor pitches to publication audiences** look like in practice?"
        },
        {
          "type": "list",
          "items": [
            "Start from the template (author bio snippet, book basics, comp info if used in your process\u2014whatever your team standard is)",
            "Insert targeted fit lines unique to each outlet",
            "Respect the request requirements you recorded (galley vs digital, copy counts)"
          ]
        },
        {
          "type": "paragraph",
          "text": "Then send."
        },
        {
          "type": "paragraph",
          "text": "Now, about the emotional part: when outreach doesn't get responses right away, teams go through frustration and silence. Sometimes you get bounced materials because the address is wrong or outdated. Sometimes you send repeated follow-ups to people who never had a chance to respond because your contact list wasn't clean."
        },
        {
          "type": "paragraph",
          "text": "But eventually, positive reviews begin to arrive. The team views the earlier work as worth it once tangible results show up."
        },
        {
          "type": "paragraph",
          "text": "And here's the credibility anchor: none of that requires luck. It requires **a list that is alive**\u2014reused when appropriate, pruned when necessary, expanded with verified fit, and documented with request requirements so pitches can match published preferences."
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_30/day_413/the-reviewer-contact-list-isn-t-busywork-it-s-the-pipeline-that-decides/blog/blog_section_image_pitch_template_targeted_lines_blog_section_landscape_069f24349b61.gif?updatedAt=1782176905323",
        "alt": "H2: How to build a reviewer contact list that actually works",
        "width": 268,
        "height": 200,
        "creator": "Giphy",
        "creatorUrl": "https://giphy.com/gifs/rugrats-responsibility-idTKjnzYuyPYs",
        "provider": "giphy",
        "role": "section"
      }
    },
    {
      "section_id": "h2_turning_a_contact_list_into_tailored_pitches",
      "heading": "H2: How to build a reviewer contact list that actually works",
      "heading_slug": "h2-how-to-build-a-reviewer-contact-list-that-actually-works",
      "keyword_key": "h2_turning_a_contact_list_into_tailored_pitches",
      "keywords": [
        "pitch template",
        "targeted lines",
        "proof of fit",
        "response rate",
        "personalization",
        "efficiency",
        "editing",
        "clarity",
        "persistence",
        "win"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Understanding **how to build a reviewer contact list** means treating it as a living system, not a one-time project. Start by auditing what you already have\u2014if previous releases left a list behind, that's your foundation. Split it into sections, then prune ruthlessly. Dead outlets, retired reviewers, and shifted editorial focuses all need to go."
        },
        {
          "type": "paragraph",
          "text": "Then expand strategically. The goal is a few dozen new verified contacts each week, not a fever dream of hundreds added at once. Quality over velocity. Every new contact should pass the fit test: does this outlet actually review books like yours? Does their audience match? Are their submission guidelines clear?"
        },
        {
          "type": "paragraph",
          "text": "Document everything. The list should include outlet name, reviewer contact, fit notes (genre/themes/audience alignment), and the submission format they want. This documentation becomes your pitch-writing foundation."
        },
        {
          "type": "paragraph",
          "text": "If you want to know why the reviewer contact list feels like the hardest work, it's because it's the only part of the system that has to be correct before persuasion even matters. Record the format requirements, or you'll waste time with responses that can't use your materials. Build the list with verified fit, and outreach stops feeling like a void."
        },
        {
          "type": "blockquote",
          "text": "\"Record the format requirements, or you'll waste time with responses that can't use your materials.\""
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_30/day_413/the-reviewer-contact-list-isn-t-busywork-it-s-the-pipeline-that-decides/blog/blog_section_image_pitch_template_targeted_lines_blog_section_landscape_069f24349b61.gif?updatedAt=1782176905323",
        "alt": "H2: How to build a reviewer contact list that actually works",
        "width": 268,
        "height": 200,
        "creator": "Giphy",
        "creatorUrl": "https://giphy.com/gifs/rugrats-responsibility-idTKjnzYuyPYs",
        "provider": "giphy",
        "role": "section"
      }
    }
  ],
  "closingImage": null,
  "alsoLike": [
    {
      "title": "The complete audiobook toolchain for writers: script, recording, editing, and submission",
      "url": "https://writequeryhook.com/blog/the-complete-audiobook-toolchain-for-writers-script-recording-editing-and"
    },
    {
      "title": "A publisher won't \"fix\" your manuscript for craft\u2014most changes are about control, packaging, and timelines",
      "url": "https://writequeryhook.com/blog/a-publisher-won-t-fix-your-manuscript-for-craft-most-changes-are-about-control"
    },
    {
      "title": "5 ways authors can help market their book after manuscript acceptance",
      "url": "https://writequeryhook.com/blog/5-ways-authors-can-help-market-their-book-after-manuscript-acceptance"
    },
    {
      "title": "5 tips for agent author creative team dynamics: when not to give up after long submissions",
      "url": "https://writequeryhook.com/blog/5-tips-for-agent-author-creative-team-dynamics-when-not-to-give-up-after-long"
    }
  ],
  "alsoLikeAfterIndex": 2,
  "faq": [
    {
      "question": "How do you build a reviewer contact list without starting from scratch every time?",
      "answer": "Use reuse as your starting point: take a previously used list from earlier releases, then divide it into sections because it may contain hundreds of names. After that, weed out contacts that no longer review, no longer produce relevant content, or don't match your book's fit."
    },
    {
      "question": "What's the best way to find new reviewers when the list runs low?",
      "answer": "Search using the book's themes and the audience it targets. Check multiple sites until only outlets that truly fit remain. The goal is steady list growth\u2014typically adding a few dozen contacts each week\u2014so outreach keeps moving without a frantic scramble."
    },
    {
      "question": "Why is it important to confirm whether reviewers want a galley or a digital copy?",
      "answer": "Different sources have different submission preferences, and your list needs to record what each reviewer wants\u2014and when applicable, how many copies are needed. Sometimes the right info is easy to find, sometimes it takes verification during research, but skipping it creates avoidable failure."
    },
    {
      "question": "What should you write in pitch letters to improve response chances?",
      "answer": "Use a basic pitch template with the book and author information, then add a targeted sentence or two for each outlet. Those lines should explicitly connect the book's themes to why that publication audience would care."
    },
    {
      "question": "What happens when outreach doesn't get responses right away?",
      "answer": "Expect frustration and silence, including issues like bounced materials from incorrect addresses and the need for repeated follow-ups. Eventually, positive reviews begin to arrive, and the earlier outreach work becomes worth it once the results start showing up."
    }
  ],
  "closingBlocks": [
    {
      "type": "paragraph",
      "text": "A reviewer contact list is only \"busywork\" when you treat it like decoration. Treat it like infrastructure instead: prune what's dead, verify fit, record galley vs digital requirements, and document why the pitch is tailored."
    },
    {
      "type": "paragraph",
      "text": "Then outreach stops feeling like a void and starts feeling like a system. The next time the deadline gets loud, your list won't be a pile of names\u2014it'll be a set of doors you can actually walk through."
    }
  ],
  "relatedLinks": [
    {
      "title": "Common mistakes that make your blurb fail on Amazon (and how to fix each)",
      "url": "https://writequeryhook.com/blog/common-mistakes-that-make-your-blurb-fail-on-amazon-and-how-to-fix-each"
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
      "@id": "https://writequeryhook.com/blog/the-reviewer-contact-list-isn-t-busywork-it-s-the-pipeline-that-decides#breadcrumb",
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
          "name": "The reviewer contact list isn't busywork: it's the pipeline that decides whether reviews happen",
          "item": "https://writequeryhook.com/blog/the-reviewer-contact-list-isn-t-busywork-it-s-the-pipeline-that-decides"
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": "https://writequeryhook.com/blog/the-reviewer-contact-list-isn-t-busywork-it-s-the-pipeline-that-decides#webpage",
      "url": "https://writequeryhook.com/blog/the-reviewer-contact-list-isn-t-busywork-it-s-the-pipeline-that-decides",
      "name": "The reviewer contact list isn't busywork: it's the pipeline that decides whether reviews happen",
      "isPartOf": {
        "@id": "https://writequeryhook.com/#website"
      },
      "inLanguage": "en-US",
      "primaryImageOfPage": {
        "@id": "https://writequeryhook.com/blog/the-reviewer-contact-list-isn-t-busywork-it-s-the-pipeline-that-decides#primaryimage"
      },
      "breadcrumb": {
        "@id": "https://writequeryhook.com/blog/the-reviewer-contact-list-isn-t-busywork-it-s-the-pipeline-that-decides#breadcrumb"
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
      "@id": "https://writequeryhook.com/blog/the-reviewer-contact-list-isn-t-busywork-it-s-the-pipeline-that-decides#article",
      "isPartOf": {
        "@id": "https://writequeryhook.com/blog/the-reviewer-contact-list-isn-t-busywork-it-s-the-pipeline-that-decides#webpage"
      },
      "mainEntityOfPage": "https://writequeryhook.com/blog/the-reviewer-contact-list-isn-t-busywork-it-s-the-pipeline-that-decides",
      "headline": "The reviewer contact list isn't busywork: it's the pipeline that decides whether reviews happen",
      "alternativeHeadline": "The reviewer contact list isn\u2019t busywork: it\u2019s the pipeline that decides whether reviews happen",
      "description": "TLDR",
      "wordCount": 2636,
      "timeRequired": "PT13M",
      "articleSection": "Querying",
      "keywords": [
        "after the offer",
        "submissions",
        "marketing",
        "tools & resources",
        "overwhelm",
        "accuracy",
        "fit",
        "spreadsheets",
        "review outreach",
        "galleys",
        "response",
        "reuse"
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
        "@id": "https://writequeryhook.com/blog/the-reviewer-contact-list-isn-t-busywork-it-s-the-pipeline-that-decides#primaryimage"
      },
      "datePublished": "2027-05-27",
      "dateModified": "2027-05-27",
      "mentions": [
        {
          "@type": "WebPage",
          "name": "Common mistakes that make your blurb fail on Amazon (and how to fix each)",
          "url": "https://writequeryhook.com/blog/common-mistakes-that-make-your-blurb-fail-on-amazon-and-how-to-fix-each"
        },
        {
          "@type": "WebPage",
          "name": "The complete audiobook toolchain for writers: script, recording, editing, and submission",
          "url": "https://writequeryhook.com/blog/the-complete-audiobook-toolchain-for-writers-script-recording-editing-and"
        },
        {
          "@type": "WebPage",
          "name": "A publisher won't \"fix\" your manuscript for craft\u2014most changes are about control, packaging, and timelines",
          "url": "https://writequeryhook.com/blog/a-publisher-won-t-fix-your-manuscript-for-craft-most-changes-are-about-control"
        },
        {
          "@type": "WebPage",
          "name": "5 ways authors can help market their book after manuscript acceptance",
          "url": "https://writequeryhook.com/blog/5-ways-authors-can-help-market-their-book-after-manuscript-acceptance"
        },
        {
          "@type": "WebPage",
          "name": "5 tips for agent author creative team dynamics: when not to give up after long submissions",
          "url": "https://writequeryhook.com/blog/5-tips-for-agent-author-creative-team-dynamics-when-not-to-give-up-after-long"
        }
      ]
    },
    {
      "@type": "ImageObject",
      "@id": "https://writequeryhook.com/blog/the-reviewer-contact-list-isn-t-busywork-it-s-the-pipeline-that-decides#primaryimage",
      "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_30/day_413/the-reviewer-contact-list-isn-t-busywork-it-s-the-pipeline-that-decides/blog/blog_hero_dread_blank_page_energy_blog_hero_landscape_d5ec823232a5.jpeg?updatedAt=1782176903007",
      "width": 3875,
      "height": 2848,
      "caption": "blog hero \u00b7 dread blank-page energy",
      "creditText": "Alexandro David",
      "author": {
        "@type": "Person",
        "name": "Alexandro David",
        "url": "https://www.pexels.com/@alexandro-david-871783"
      },
      "@context": "https://schema.org"
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": "https://writequeryhook.com/blog/the-reviewer-contact-list-isn-t-busywork-it-s-the-pipeline-that-decides#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How do you build a reviewer contact list without starting from scratch every time?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Use reuse as your starting point: take a previously used list from earlier releases, then divide it into sections because it may contain hundreds of names. After that, weed out contacts that no longer review, no longer produce relevant content, or don't match your book's fit."
          }
        },
        {
          "@type": "Question",
          "name": "What's the best way to find new reviewers when the list runs low?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Search using the book's themes and the audience it targets. Check multiple sites until only outlets that truly fit remain. The goal is steady list growth\u2014typically adding a few dozen contacts each week\u2014so outreach keeps moving without a frantic scramble."
          }
        },
        {
          "@type": "Question",
          "name": "Why is it important to confirm whether reviewers want a galley or a digital copy?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Different sources have different submission preferences, and your list needs to record what each reviewer wants\u2014and when applicable, how many copies are needed. Sometimes the right info is easy to find, sometimes it takes verification during research, but skipping it creates avoidable failure."
          }
        },
        {
          "@type": "Question",
          "name": "What should you write in pitch letters to improve response chances?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Use a basic pitch template with the book and author information, then add a targeted sentence or two for each outlet. Those lines should explicitly connect the book's themes to why that publication audience would care."
          }
        },
        {
          "@type": "Question",
          "name": "What happens when outreach doesn't get responses right away?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Expect frustration and silence, including issues like bounced materials from incorrect addresses and the need for repeated follow-ups. Eventually, positive reviews begin to arrive, and the earlier outreach work becomes worth it once the results start showing up."
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
