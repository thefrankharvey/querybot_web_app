export type HomeWalkthroughPlacement = "bottom" | "left" | "right" | "top";

export type HomeWalkthroughStep = {
  body: string;
  id: string;
  preferredPlacement?: HomeWalkthroughPlacement;
  targetSelector?: string;
  title: string;
};

export const HOME_WALKTHROUGH_STORAGE_KEY =
  "wqh_home_walkthrough:v1:completed";

export const HOME_WALKTHROUGH_STEPS = [
  {
    body: "Start here to find agents that match your project.",
    id: "smart-match-nav",
    preferredPlacement: "right",
    targetSelector: '[data-tour-target="home-walkthrough-smart-match-nav"]',
    title: "Start With Smart Match",
  },
  {
    body: "Your saved agent matches will appear here so you can track your query progress.",
    id: "query-dashboard-nav",
    preferredPlacement: "right",
    targetSelector: '[data-tour-target="home-walkthrough-query-dashboard-nav"]',
    title: "Query Dashboard",
  },
  {
    body: "Check Dispatch for all of the latest query news.",
    id: "dispatch-nav",
    preferredPlacement: "right",
    targetSelector: '[data-tour-target="home-walkthrough-dispatch-nav"]',
    title: "Dispatch",
  },
] as const satisfies readonly HomeWalkthroughStep[];
