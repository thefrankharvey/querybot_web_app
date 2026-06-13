export type QueryDashboardWalkthroughPlacement =
  | "bottom"
  | "left"
  | "right"
  | "top";

export type QueryDashboardWalkthroughStep = {
  body: string;
  id: string;
  preferredPlacement: QueryDashboardWalkthroughPlacement;
  targetSelector: string;
  title: string;
};

export const QUERY_DASHBOARD_WALKTHROUGH_STORAGE_KEY =
  "wqh_query_dashboard_walkthrough:v1:completed";

export const QUERY_DASHBOARD_WALKTHROUGH_STEPS = [
  {
    body: "Use Fit Rating to narrow this column to agents with a specific match strength.",
    id: "fit-rating-filter",
    preferredPlacement: "right",
    targetSelector: '[data-tour-target="query-dashboard-filter-fit-rating"]',
    title: "Filter By Fit Rating",
  },
  {
    body: "Use Query Letter to focus on agents whose query letters are ready, not ready, or all saved agents.",
    id: "query-letter-filter",
    preferredPlacement: "right",
    targetSelector: '[data-tour-target="query-dashboard-filter-query-letter"]',
    title: "Filter By Query Letter",
  },
  {
    body: "Move agent cards across columns as you progress through your query process, from research to submissions and responses.",
    id: "agent-card",
    preferredPlacement: "right",
    targetSelector: '[data-tour-target="query-dashboard-first-card"]',
    title: "Track Query Progress",
  },
  {
    body: "Fit Rating summarizes how strong this agent match is for the selected project.",
    id: "modal-fit-rating",
    preferredPlacement: "right",
    targetSelector: '[data-tour-target="query-dashboard-modal-fit-rating"]',
    title: "Fit Rating",
  },
  {
    body: "Project Name shows which project this agent is tied to, so you can manage matches across multiple queries.",
    id: "modal-project-name",
    preferredPlacement: "left",
    targetSelector: '[data-tour-target="query-dashboard-modal-project-name"]',
    title: "Project Name",
  },
  {
    body: "Use the Query Letter toggle to track whether this agent has a ready-to-send query letter.",
    id: "modal-query-letter-toggle",
    preferredPlacement: "right",
    targetSelector: '[data-tour-target="query-dashboard-modal-query-letter-toggle"]',
    title: "Query Letter Ready",
  },
] as const satisfies readonly QueryDashboardWalkthroughStep[];

export type QueryDashboardWalkthroughStepId =
  (typeof QUERY_DASHBOARD_WALKTHROUGH_STEPS)[number]["id"];
