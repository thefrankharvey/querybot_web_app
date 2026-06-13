export type SmartMatchWalkthroughPlacement =
  | "bottom"
  | "left"
  | "right"
  | "top";

export type SmartMatchWalkthroughStep = {
  body: string;
  id: string;
  preferredPlacement: SmartMatchWalkthroughPlacement;
  targetSelector: string;
  title: string;
};

export const SMART_MATCH_WALKTHROUGH_STORAGE_KEY =
  "wqh_smart_match_walkthrough:v1:completed";

export const SMART_MATCH_WALKTHROUGH_STEPS = [
  {
    body: "Use this toggle to tell Smart Match whether your project is fiction or nonfiction so the form can match the right agents for your work.",
    id: "fiction-toggle",
    preferredPlacement: "right",
    targetSelector: '[data-tour-target="smart-match-fiction-toggle"]',
    title: "Fiction Or Nonfiction",
  },
  {
    body: "Open a metric dropdown and start typing to search the list. Choose the closest match for that part of your project.",
    id: "genre-dropdown",
    preferredPlacement: "right",
    targetSelector: '[data-tour-target="smart-match-genre-dropdown"]',
    title: "Add Your Metrics",
  },
  {
    body: "If you can't find your specific genre, subgenre, format, or another option in a dropdown list, you can add it by clicking here.",
    id: "genre-plus",
    preferredPlacement: "right",
    targetSelector: '[data-tour-target="smart-match-genre-plus"]',
    title: "Add A Custom Option",
  },
  {
    body: "Use Add Comp to include another comparable title that helps describe your market and audience.",
    id: "add-comp",
    preferredPlacement: "top",
    targetSelector: '[data-tour-target="smart-match-add-comp"]',
    title: "Add Comparable Titles",
  },
  {
    body: "Use Remove Comp to delete a comparable title field you no longer need.",
    id: "remove-comp",
    preferredPlacement: "top",
    targetSelector: '[data-tour-target="smart-match-remove-comp"]',
    title: "Remove Comparable Titles",
  },
] as const satisfies readonly SmartMatchWalkthroughStep[];

export type SmartMatchWalkthroughStepId =
  (typeof SMART_MATCH_WALKTHROUGH_STEPS)[number]["id"];
