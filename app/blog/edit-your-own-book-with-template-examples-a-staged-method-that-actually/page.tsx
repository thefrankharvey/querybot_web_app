import type { Metadata } from 'next';
import { Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const PAGE_DATA = {
  "slug": "edit-your-own-book-with-template-examples-a-staged-method-that-actually",
  "title": "Edit your own book with template examples: a staged method that actually catches the mistakes",
  "description": "Most drafts don't need a \"better writer.\" They need a better edit plan.",
  "readTime": "11 min read",
  "publishedDate": null,
  "modifiedDate": null,
  "canonicalUrl": "https://writequeryhook.com/blog/edit-your-own-book-with-template-examples-a-staged-method-that-actually",
  "siteUrl": "https://writequeryhook.com",
  "siteName": "Write Query Hook",
  "locale": "en-US",
  "articleSection": "Querying",
  "keywords": [
    "sample pages",
    "revision",
    "craft",
    "tools & resources",
    "stages",
    "checklist",
    "new-eyes break",
    "less panic",
    "cut to the bone",
    "scene purpose",
    "passive voice",
    "pov shifts"
  ],
  "author": null,
  "hero": {
    "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_19/day_263/edit-your-own-book-with-template-examples-a-staged-method-that-actually/blog/blog_hero_overwhelmed_blank_page_dread_blog_hero_landscape_57c6c4cf5102.jpeg?updatedAt=1781685865292",
    "alt": "blog hero \u00b7 overwhelmed blank-page dread",
    "width": 6000,
    "height": 4000,
    "creator": "Alex Green",
    "creatorUrl": "https://www.pexels.com/@alex-green",
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
      "name": "Edit your own book with template examples: a staged method that actually catches the mistakes",
      "item": "https://writequeryhook.com/blog/edit-your-own-book-with-template-examples-a-staged-method-that-actually"
    }
  ],
  "tldrBlocks": [],
  "openingBlocks": [
    {
      "type": "paragraph",
      "text": "Most drafts don't need a \"better writer.\" They need a better edit plan."
    },
    {
      "type": "paragraph",
      "text": "If you treat editing like drafting\u2014sit down, obsess for hours, fix everything you notice\u2014you end up with a manuscript that feels scrubbed to death and still has the same core problems. And if you're the kind of author who gets guilt about deleting a sentence that \"seems good,\" self-editing can turn into a chaotic pile of maybes."
    },
    {
      "type": "paragraph",
      "text": "This breakdown isn't about praising editing as a concept. It's about one practical idea: **you edit your manuscript in stages with template examples** so your brain isn't trying to do five jobs at once\u2014plot logic, character choices, scene function, prose cleanup, and the sentence-level gotchas like POV shifts and vague language."
    },
    {
      "type": "paragraph",
      "text": "We'll walk through the structure of a staged self-edit workflow, the \"template\" moves you plug into each round, and what to look for at each step. Then we'll talk about where beta readers and professional editing fit when you're ready to prepare for querying or publication."
    },
    {
      "type": "blockquote",
      "text": "\"Editing is problem-solving\u2014chip away at the draft in stages, not all at once.\""
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
            "Edit in rounds: **big picture \u2192 scene by scene \u2192 copyediting**, not all at once.",
            "Take a short break so you can read with \"new eyes\" and catch problems you literally couldn't see yesterday.",
            "Use a checklist that matches the round (plot logic checklist is not a copyediting checklist).",
            "In scene passes, confirm **purpose, pacing, transitions, dialogue function, and POV/prose consistency**.",
            "Copyediting is cut-and-dried: grammar, passive voice control, fewer adverbs in tags, remove clich\u00e9s/crutches, prevent accidental POV shifts.",
            "Get outside eyes from **beta readers**, then consider a professional editor before querying or publication."
          ]
        }
      ],
      "image": null
    },
    {
      "section_id": "h2_subject_context_what_this_staged_method_is_solving",
      "heading": "Subject context: what this staged method is solving",
      "heading_slug": "subject-context-what-this-staged-method-is-solving",
      "keyword_key": "h2_subject_context_what_this_staged_method_is_solving",
      "keywords": [],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Writers get overwhelmed because they don't know what to fix first. One paragraph looks slightly off, so they chase sentence-level wording. Then they notice pacing dragging in the next chapter. Then a character suddenly acts wrong. By the end of the day, they've changed thirty things and still can't say what's better\u2014because they never decided which problem class they were solving."
        },
        {
          "type": "paragraph",
          "text": "Worse, authors fear editing means deleting great writing. That fear turns into hoarding: you keep paragraphs that should be gone and protect lines that might be salvageable later, but not in the current draft. The trick is to separate **cutting** from **reusing**. Your \"edit\" pass isn't a funeral. It's sorting."
        },
        {
          "type": "paragraph",
          "text": "Finally: sentence-level issues are sneaky. You can catch plot problems by reading for story. But POV shifts, vague language, and passive voice? Those require a different kind of attention and a structure that tells you what to scan for. Most writers need a method they can repeat, not inspiration they can't reproduce."
        },
        {
          "type": "paragraph",
          "text": "So this breakdown is built around one structural choice: **staged editing with template examples**. Each stage narrows the job and gives you a repeatable scanning routine. Each round has a specific target, not a feeling."
        }
      ],
      "image": null
    },
    {
      "section_id": "h2_choose_stages_not_whole_sentence_level_fixes",
      "heading": "Choose stages, not whole-draft fixes",
      "heading_slug": "choose-stages-not-whole-draft-fixes",
      "keyword_key": "h2_choose_stages_not_whole_sentence_level_fixes",
      "keywords": [
        "anxiety",
        "decision",
        "triage",
        "staged editing",
        "big picture",
        "plot logic",
        "character goals",
        "conflict escalation",
        "less deleting",
        "breathe"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "The first element in this workflow is the decision to avoid one-pass perfectionism."
        },
        {
          "type": "paragraph",
          "text": "Writers treat editing like a continuation of drafting: the manuscript should \"become\" better through constant revision. But editing\u2014good editing\u2014is more like triage. You solve the highest-level problems first, because they create the conditions where sentence-level work can actually matter."
        },
        {
          "type": "paragraph",
          "text": "Here's how the staged approach changes what you notice:"
        },
        {
          "type": "list",
          "items": [
            "In the **big picture** round, you notice whether the plot escalates toward the climax, whether character goals make sense, and whether genre conventions hold.",
            "In the **scene-by-scene** round, you confirm each scene earns its page count with concrete purpose, pacing, transitions, and dialogue function.",
            "In the **copyediting** round, you remove sentence-level clutter and protect prose consistency (including accidental POV shifts)."
          ]
        },
        {
          "type": "paragraph",
          "text": "This stops your brain from \"fixing\" in the wrong order and confusing discovery with editing. If Act Two still drags and you can't trace why, the problem lives in structure, not in verb choice."
        },
        {
          "type": "subheading",
          "text": "Template example: round goals + stop rules"
        },
        {
          "type": "paragraph",
          "text": "Use this as a \"pre-flight\" before each round:"
        },
        {
          "type": "list",
          "items": [
            "**Round name:** (big picture / scene-by-scene / copyediting)",
            "**What you're solving:** one sentence",
            "**What you are NOT solving:** two sentences",
            "**Your stop rule:** when to switch rounds (not when you feel done)"
          ]
        },
        {
          "type": "paragraph",
          "text": "Example filled in for the big picture round:"
        },
        {
          "type": "list",
          "items": [
            "Round name: big picture",
            "What you're solving: whether the story holds together from beginning to end and escalates toward the climax",
            "What you are NOT solving: passive voice, adverbs in dialogue tags, line-level word choice",
            "Stop rule: when you can outline the \"cause \u2192 effect\" chain for every major scene without guessing"
          ]
        },
        {
          "type": "paragraph",
          "text": "That stop rule matters. It keeps you from staying in the wrong lane until you feel exhausted. Exhaustion is not progress."
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_19/day_263/edit-your-own-book-with-template-examples-a-staged-method-that-actually/blog/blog_section_image_anxiety_decision_blog_section_landscape_137c282b7a8c.jpeg?updatedAt=1781685865773",
        "alt": "Choose stages, not whole-draft fixes",
        "width": 4000,
        "height": 2667,
        "creator": "AI25.Studio  Studio",
        "creatorUrl": "https://www.pexels.com/@ai25studioai",
        "provider": "pexels",
        "role": "section"
      }
    },
    {
      "section_id": "h2_big_picture_edit_template_workflow",
      "heading": "Big picture editing checklist for novels: the template that saves the story",
      "heading_slug": "big-picture-editing-checklist-for-novels-the-template-that-saves-the-story",
      "keyword_key": "h2_big_picture_edit_template_workflow",
      "keywords": [
        "relief",
        "momentum",
        "plot",
        "escalation",
        "ending",
        "genre",
        "logic",
        "themes",
        "tension",
        "revision rounds"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Big picture editing is where the rest of the work becomes possible. Plot, story structure, and character come first because everything else depends on them. If you try to copyedit a story whose ending doesn't logically land, you're polishing a doorframe while the house is on fire."
        },
        {
          "type": "paragraph",
          "text": "This stage includes specific checks:"
        },
        {
          "type": "list",
          "items": [
            "**Logic and escalation** toward the climax",
            "**Genre conventions** (not copy/paste tropes\u2014conventions like pacing expectations, emotional arc patterns, or the kinds of promises readers expect)",
            "**Character goals/traits** (do they want what the story thinks they want?)",
            "**Story threads tie-up** by the ending",
            "**Emerging universal themes** for texture (the theme shouldn't feel stapled on; it should grow out of decisions and outcomes)"
          ]
        },
        {
          "type": "paragraph",
          "text": "You'll also see something writers often miss: conflict escalation isn't \"there's conflict.\" It's the shape of escalation. It gets harder, risk gets higher, stakes tighten, and the climax pays off the earlier pressure."
        },
        {
          "type": "subheading",
          "text": "Template example: big picture scan prompts"
        },
        {
          "type": "paragraph",
          "text": "Create a checklist that forces you to answer questions, not admire."
        },
        {
          "type": "paragraph",
          "text": "Use a page like this for each major section/chapter cluster:"
        },
        {
          "type": "paragraph",
          "text": "1. **Inciting event:** What kicks the story into motion? What changes immediately after? 2. **Act one pressure:** What do the characters do with the new problem? 3. **Midpoint shift:** What new information/choice forces a real turn? 4. **Escalation:** Name the three largest \"pressure rises\" from mid to climax. 5. **Climax promise:** What did the story promise earlier that the ending must satisfy? 6. **Character payoff:** Which character trait or goal causes the final conflict resolution? 7. **Theme texture:** Where does the theme show up through decisions, not speeches?"
        },
        {
          "type": "paragraph",
          "text": "If you're stuck, don't rewrite lines yet. Write marginal notes on the manuscript pages like you're the world's most stubborn line editor and you're about to make the story behave."
        },
        {
          "type": "subheading",
          "text": "What \"template examples\" should look like in practice"
        },
        {
          "type": "paragraph",
          "text": "Instead of \"Revise the plot,\" your template says what to do with it:"
        },
        {
          "type": "list",
          "items": [
            "If escalation is weak: identify the last scene where the risk is clearly higher, then rewrite the chain between now and the climax so each beat tightens consequences.",
            "If themes are absent: list two decisions the protagonist makes in Act Two that reflect the theme through action, then revise scenes until those choices carry weight."
          ]
        },
        {
          "type": "paragraph",
          "text": "Theme shows up through what a character decides to do when their values hit reality."
        }
      ],
      "image": null
    },
    {
      "section_id": "h2_scene_by_scene_novel_editing_steps_template",
      "heading": "Scene by scene novel editing steps: confirm purpose, pacing, transitions, dialogue, POV",
      "heading_slug": "scene-by-scene-novel-editing-steps-confirm-purpose-pacing-transitions-dialogue",
      "keyword_key": "h2_scene_by_scene_novel_editing_steps_template",
      "keywords": [
        "focus",
        "microscope",
        "pacing",
        "transitions",
        "dialogue function",
        "POV consistency",
        "timing",
        "scene purpose",
        "skim",
        "confirm"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "This is where you get out of \"author brain\" and into \"reader brain.\" You stop asking \"do I like this scene\" and start asking \"what does this scene do.\""
        },
        {
          "type": "paragraph",
          "text": "Each scene and chapter must have:"
        },
        {
          "type": "list",
          "items": [
            "a concrete **purpose**",
            "working **pacing** (not just faster, but motivated)",
            "functional **transitions**",
            "dialogue that serves purpose, voice, and formatting balance",
            "**POV/prose consistency** (including hidden shifts)"
          ]
        },
        {
          "type": "paragraph",
          "text": "This is also where template examples save you from skimming. When you have a checklist, you don't wander."
        },
        {
          "type": "subheading",
          "text": "Template example: scene scoring sheet"
        },
        {
          "type": "paragraph",
          "text": "For each scene, fill in:"
        },
        {
          "type": "list",
          "items": [
            "**Scene purpose (one sentence):** What changes because the scene happened?",
            "**Pacing pulse:** Where is the \"slow moment\" and why does it belong there?",
            "**Transition bridge:** What connects the end of Scene X to the start of Scene Y?",
            "**Dialogue function:** What does the dialogue *do* (reveal, decide, conceal, conflict, test a relationship)?",
            "**POV check:** Same POV character? Same tense? Any accidental head-hopping?",
            "**Prose consistency:** Any sudden shifts in diction, worldview, or focus that don't belong?",
            "**Retention test:** If you remove 10%, does the scene still explain the story's next step?"
          ]
        },
        {
          "type": "paragraph",
          "text": "When you can't answer one of those questions with specificity, the scene's structure needs work before its sentences do."
        },
        {
          "type": "subheading",
          "text": "Generalizable lesson"
        },
        {
          "type": "paragraph",
          "text": "Scene by scene novel editing steps with a template turn \"I think something is off\" into a list of fixable mechanics: purpose, pacing, transition, dialogue job, and POV/prose consistency."
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_19/day_263/edit-your-own-book-with-template-examples-a-staged-method-that-actually/blog/blog_section_image_focus_microscope_blog_section_landscape_32c775ef5cd2.gif",
        "alt": "Scene by scene novel editing steps: confirm purpose, pacing, transitions, dialogue, POV",
        "width": 304,
        "height": 200,
        "creator": "American_School_of_Guatemala",
        "creatorUrl": "https://giphy.com/gifs/American-School-of-Guatemala-cag-cagseniors-seniorscag-IxLeSDtUaZRmSiyCTf",
        "provider": "giphy",
        "role": "section"
      }
    },
    {
      "section_id": "h2_copyediting_template_for_cut_and_clean",
      "heading": "Copy edit tips passive voice adverbs: cut-and-dried cleanup",
      "heading_slug": "copy-edit-tips-passive-voice-adverbs-cut-and-dried-cleanup",
      "keyword_key": "h2_copyediting_template_for_cut_and_clean",
      "keywords": [
        "control",
        "precision",
        "grammar",
        "passive voice",
        "adverbs",
        "crutch words",
        "clich\u00e9s",
        "hidden verbs",
        "clean prose",
        "final pass"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "Copyediting isn't where you fall in love again. It's where you remove friction."
        },
        {
          "type": "paragraph",
          "text": "This final pass treats the edit as cut-and-dried fixes:"
        },
        {
          "type": "list",
          "items": [
            "grammar issues",
            "active vs. passive voice decisions (and how to spot when passive voice smothers impact)",
            "reducing adverbs\u2014especially in dialogue tags",
            "strengthening verbs",
            "removing vague words and clich\u00e9s",
            "preventing accidental POV shifts"
          ]
        },
        {
          "type": "paragraph",
          "text": "If you do copyediting too early, you'll create mechanical work around story problems that still need structural revisions. If you do it too late, you risk leaving confusing sentence-level issues for publication. The staged workflow avoids both."
        },
        {
          "type": "subheading",
          "text": "Template example: copyediting check pass"
        },
        {
          "type": "paragraph",
          "text": "Use one pass for each category so you don't mix goals:"
        },
        {
          "type": "paragraph",
          "text": "**Pass A: POV + tense stability**"
        },
        {
          "type": "list",
          "items": [
            "Scan for head-hops (POV character name disappears, perspective shifts)",
            "Scan for tense inconsistencies",
            "Mark any sentences that feel like they're \"explaining from nowhere\""
          ]
        },
        {
          "type": "paragraph",
          "text": "**Pass B: dialogue tags and adverbs**"
        },
        {
          "type": "list",
          "items": [
            "Hunt for adverbs modifying said/asked/murmured (e.g., \"said softly,\" \"asked angrily\")",
            "Replace where possible with stronger verb or action beats",
            "Keep adverbs only when they change meaning, not tone decoration"
          ]
        },
        {
          "type": "paragraph",
          "text": "**Pass C: passive voice and weak verbs**"
        },
        {
          "type": "list",
          "items": [
            "Mark passive constructions",
            "Ask: does rewriting to active make the sentence punchier?",
            "If passive stays, make sure it's intentional and not accidental"
          ]
        },
        {
          "type": "paragraph",
          "text": "**Pass D: crutch language and clich\u00e9s**"
        },
        {
          "type": "list",
          "items": [
            "Circle vague words (things like \"very,\" \"really,\" \"just,\" \"things,\" \"somehow\"\u2014use your manuscript's patterns)",
            "Flag clich\u00e9s and worn metaphors",
            "Replace with concrete specifics tied to character"
          ]
        }
      ],
      "image": {
        "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_19/day_263/edit-your-own-book-with-template-examples-a-staged-method-that-actually/blog/blog_section_image_control_precision_blog_section_landscape_fb07d9643f57.gif?updatedAt=1781685867136",
        "alt": "Copy edit tips passive voice adverbs: cut-and-dried cleanup",
        "width": 200,
        "height": 200,
        "creator": "WiseMonkeymeme",
        "creatorUrl": "https://giphy.com/gifs/WiseMonkeymeme-checklist-checking-double-check-y7f3Zgxxts5BOjgnhC",
        "provider": "giphy",
        "role": "section"
      }
    },
    {
      "section_id": "h2_beta_readers_and_professional_editor_next_steps",
      "heading": "Get beta readers and a professional editor: outside eyes for the last-mile truth",
      "heading_slug": "get-beta-readers-and-a-professional-editor-outside-eyes-for-the-last-mile-truth",
      "keyword_key": "h2_beta_readers_and_professional_editor_next_steps",
      "keywords": [
        "nervous hope",
        "outside eyes",
        "feedback",
        "refine",
        "publish-readiness",
        "editor fit",
        "query prep",
        "MSWL",
        "confidence",
        "next draft"
      ],
      "blocks": [
        {
          "type": "paragraph",
          "text": "This workflow doesn't pretend self-editing can replace outside readers. The staged plan gets the manuscript clearer, but outside eyes catch blind spots: what's confusing, what's dull, what reads differently than intended."
        },
        {
          "type": "paragraph",
          "text": "So the method ends with feedback from **beta readers** and considers professional editorial help before querying or publication."
        },
        {
          "type": "subheading",
          "text": "Template example: beta reader request + decision rules"
        },
        {
          "type": "paragraph",
          "text": "When you ask for beta reader feedback, don't ask for \"overall thoughts.\" That produces vague notes you can't turn into revision."
        },
        {
          "type": "paragraph",
          "text": "Instead, ask:"
        },
        {
          "type": "list",
          "items": [
            "Where did you lose interest (chapter/page reference)?",
            "Which character choice felt unearned or confusing?",
            "Where did the story slow down?",
            "Which scenes felt like they were \"explaining,\" not doing?",
            "Any POV moments that felt inconsistent?"
          ]
        },
        {
          "type": "paragraph",
          "text": "Decision rule template:"
        },
        {
          "type": "list",
          "items": [
            "If 2+ readers flag the same section: revise that section.",
            "If feedback is conflicting: look for your own uncertainty\u2014usually it's a craft weakness you didn't notice.",
            "If readers love a line you hated cutting: store it. Don't freeze it in place. Save it for later reuse."
          ]
        },
        {
          "type": "paragraph",
          "text": "This is also where professional editorial help can slot in. If you're preparing to query, you want enough confidence that your materials are clear, consistent, and polished for the industry gatekeeping you're about to face."
        }
      ],
      "image": null
    },
    {
      "section_id": "h2_big_picture_edit_template_workflow",
      "heading": "How to edit your own book: lessons and takeaways",
      "heading_slug": "how-to-edit-your-own-book-lessons-and-takeaways",
      "keyword_key": "h2_big_picture_edit_template_workflow",
      "keywords": [
        "relief",
        "momentum",
        "plot",
        "escalation",
        "ending",
        "genre",
        "logic",
        "themes",
        "tension",
        "revision rounds"
      ],
      "blocks": [
        {
          "type": "list",
          "items": [
            "**Stage your editing** so you're solving one category at a time: big picture first, scene mechanics next, and copyediting last.",
            "**Use template examples** that force specific answers (\"scene purpose in one sentence,\" \"escalation rises,\" \"POV stability check\").",
            "**Confirm scene function** (purpose, pacing, transitions, dialogue function, POV/prose consistency) instead of relying on whether the scene feels cool.",
            "**Treat copyediting as category scanning**\u2014passively hunting for POV shifts, adverbs in dialogue tags, vague words, clich\u00e9s, and passive voice.",
            "**Close with outside eyes**: beta readers for pattern detection, then professional editing consideration before querying or publication."
          ]
        }
      ],
      "image": null
    }
  ],
  "closingImage": null,
  "alsoLike": [
    {
      "title": "How to write compelling character interiority when other characters steal the scene (POV rules included)",
      "url": "https://writequeryhook.com/blog/how-to-write-compelling-character-interiority-when-other-characters-steal-the"
    },
    {
      "title": "Tv techniques examples: breaking down how television keeps scenes moving",
      "url": "https://writequeryhook.com/blog/tv-techniques-examples-breaking-down-how-television-keeps-scenes-moving"
    },
    {
      "title": "How to stress-test female characters: a case-study on agency, Bechdel, and point of view",
      "url": "https://writequeryhook.com/blog/how-to-stress-test-female-characters-a-case-study-on-agency-bechdel-and-point"
    },
    {
      "title": "5 tips for writing descriptions that keep the pacing sharp",
      "url": "https://writequeryhook.com/blog/5-tips-for-writing-descriptions-that-keep-the-pacing-sharp"
    }
  ],
  "alsoLikeAfterIndex": 3,
  "faq": [
    {
      "question": "How should an author approach editing differently than drafting?",
      "answer": "Editing is analytical problem-solving. Instead of trying to perfect everything while drafting-level instincts are still running, you move through staged rounds and focus on fixes that solve one problem class at a time, gradually improving a \"lumpy\" draft."
    },
    {
      "question": "When should someone start editing after finishing a first draft?",
      "answer": "Put the manuscript aside for a few days before you start. That break helps you read with \"new eyes\" so issues jump out instead of blending into your memory."
    },
    {
      "question": "What does \"big picture\" editing include?",
      "answer": "It starts with plot, story structure, and character: you check logic, escalation toward a climax, genre conventions, character goals/traits, and whether threads tie up by the ending."
    },
    {
      "question": "What should happen during the scene-by-scene edit?",
      "answer": "Authors confirm each scene and chapter has a concrete purpose, then verify pacing and timing, transitions, dialogue function/voice/formatting balance, and POV/prose consistency."
    },
    {
      "question": "What are the main focuses of the final copy edit?",
      "answer": "You switch into cut-and-dried fixes: grammar, active vs. passive voice decisions, reducing adverbs (especially in dialogue tags), stronger verbs, removing hidden verbs/crutch phrasing, cutting vague words and clich\u00e9s, and preventing accidental POV shifts."
    }
  ],
  "closingBlocks": [
    {
      "type": "paragraph",
      "text": "When you edit your own book with template examples, you stop hoping. You start checking. Then you reach the end with a manuscript that's not just \"cleaner\"\u2014it's clearer about what it's doing, why it's doing it, and where it's going. Now look at your draft and pick one round to run today."
    }
  ],
  "relatedLinks": [
    {
      "title": "How to write a good villain: the \u201chope they lose\u201d FAQ",
      "url": "https://writequeryhook.com/blog/how-to-write-a-good-villain-the-hope-they-lose-faq"
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
      "@id": "https://writequeryhook.com/blog/edit-your-own-book-with-template-examples-a-staged-method-that-actually#breadcrumb",
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
          "name": "Edit your own book with template examples: a staged method that actually catches the mistakes",
          "item": "https://writequeryhook.com/blog/edit-your-own-book-with-template-examples-a-staged-method-that-actually"
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": "https://writequeryhook.com/blog/edit-your-own-book-with-template-examples-a-staged-method-that-actually#webpage",
      "url": "https://writequeryhook.com/blog/edit-your-own-book-with-template-examples-a-staged-method-that-actually",
      "name": "Edit your own book with template examples: a staged method that actually catches the mistakes",
      "isPartOf": {
        "@id": "https://writequeryhook.com/#website"
      },
      "inLanguage": "en-US",
      "primaryImageOfPage": {
        "@id": "https://writequeryhook.com/blog/edit-your-own-book-with-template-examples-a-staged-method-that-actually#primaryimage"
      },
      "breadcrumb": {
        "@id": "https://writequeryhook.com/blog/edit-your-own-book-with-template-examples-a-staged-method-that-actually#breadcrumb"
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
      "@id": "https://writequeryhook.com/blog/edit-your-own-book-with-template-examples-a-staged-method-that-actually#article",
      "isPartOf": {
        "@id": "https://writequeryhook.com/blog/edit-your-own-book-with-template-examples-a-staged-method-that-actually#webpage"
      },
      "mainEntityOfPage": "https://writequeryhook.com/blog/edit-your-own-book-with-template-examples-a-staged-method-that-actually",
      "headline": "Edit your own book with template examples: a staged method that actually catches the mistakes",
      "alternativeHeadline": "Edit your own book with template examples: a staged method that actually catches the mistakes",
      "description": "Most drafts don't need a \"better writer.\" They need a better edit plan.",
      "wordCount": 2236,
      "timeRequired": "PT11M",
      "articleSection": "Querying",
      "keywords": [
        "sample pages",
        "revision",
        "craft",
        "tools & resources",
        "stages",
        "checklist",
        "new-eyes break",
        "less panic",
        "cut to the bone",
        "scene purpose",
        "passive voice",
        "pov shifts"
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
        "@id": "https://writequeryhook.com/blog/edit-your-own-book-with-template-examples-a-staged-method-that-actually#primaryimage"
      },
      "mentions": [
        {
          "@type": "WebPage",
          "name": "How to write a good villain: the \u201chope they lose\u201d FAQ",
          "url": "https://writequeryhook.com/blog/how-to-write-a-good-villain-the-hope-they-lose-faq"
        },
        {
          "@type": "WebPage",
          "name": "How to write compelling character interiority when other characters steal the scene (POV rules included)",
          "url": "https://writequeryhook.com/blog/how-to-write-compelling-character-interiority-when-other-characters-steal-the"
        },
        {
          "@type": "WebPage",
          "name": "Tv techniques examples: breaking down how television keeps scenes moving",
          "url": "https://writequeryhook.com/blog/tv-techniques-examples-breaking-down-how-television-keeps-scenes-moving"
        },
        {
          "@type": "WebPage",
          "name": "How to stress-test female characters: a case-study on agency, Bechdel, and point of view",
          "url": "https://writequeryhook.com/blog/how-to-stress-test-female-characters-a-case-study-on-agency-bechdel-and-point"
        },
        {
          "@type": "WebPage",
          "name": "5 tips for writing descriptions that keep the pacing sharp",
          "url": "https://writequeryhook.com/blog/5-tips-for-writing-descriptions-that-keep-the-pacing-sharp"
        }
      ]
    },
    {
      "@type": "ImageObject",
      "@id": "https://writequeryhook.com/blog/edit-your-own-book-with-template-examples-a-staged-method-that-actually#primaryimage",
      "url": "https://ik.imagekit.io/8cxvcsdnz/wqh/sprint_19/day_263/edit-your-own-book-with-template-examples-a-staged-method-that-actually/blog/blog_hero_overwhelmed_blank_page_dread_blog_hero_landscape_57c6c4cf5102.jpeg?updatedAt=1781685865292",
      "width": 6000,
      "height": 4000,
      "caption": "blog hero \u00b7 overwhelmed blank-page dread",
      "creditText": "Alex Green",
      "author": {
        "@type": "Person",
        "name": "Alex Green",
        "url": "https://www.pexels.com/@alex-green"
      },
      "@context": "https://schema.org"
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": "https://writequeryhook.com/blog/edit-your-own-book-with-template-examples-a-staged-method-that-actually#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How should an author approach editing differently than drafting?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Editing is analytical problem-solving. Instead of trying to perfect everything while drafting-level instincts are still running, you move through staged rounds and focus on fixes that solve one problem class at a time, gradually improving a \"lumpy\" draft."
          }
        },
        {
          "@type": "Question",
          "name": "When should someone start editing after finishing a first draft?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Put the manuscript aside for a few days before you start. That break helps you read with \"new eyes\" so issues jump out instead of blending into your memory."
          }
        },
        {
          "@type": "Question",
          "name": "What does \"big picture\" editing include?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "It starts with plot, story structure, and character: you check logic, escalation toward a climax, genre conventions, character goals/traits, and whether threads tie up by the ending."
          }
        },
        {
          "@type": "Question",
          "name": "What should happen during the scene-by-scene edit?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Authors confirm each scene and chapter has a concrete purpose, then verify pacing and timing, transitions, dialogue function/voice/formatting balance, and POV/prose consistency."
          }
        },
        {
          "@type": "Question",
          "name": "What are the main focuses of the final copy edit?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "You switch into cut-and-dried fixes: grammar, active vs. passive voice decisions, reducing adverbs (especially in dialogue tags), stronger verbs, removing hidden verbs/crutch phrasing, cutting vague words and clich\u00e9s, and preventing accidental POV shifts."
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
