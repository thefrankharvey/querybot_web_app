import type {
  AgentActivityLane,
  AgentActivityResponse,
  KnownQueryStatusCode,
} from "@/app/utils/message-types";

export const WRITER_AGENT_ACTIVITY_MINIMUM_SAMPLE_SIZE = 2;

type ActivityLaneBlueprint = {
  isTerminal: boolean;
  milestones: Array<{
    daysAgo: number;
    status: KnownQueryStatusCode;
  }>;
};

const WRITER_ACTIVITY_LANE_BLUEPRINTS: ActivityLaneBlueprint[] = [
  {
    isTerminal: false,
    milestones: [{ daysAgo: 2, status: "query_sent" }],
  },
  {
    isTerminal: false,
    milestones: [
      { daysAgo: 6, status: "query_sent" },
      { daysAgo: 4, status: "query_viewed" },
    ],
  },
  {
    isTerminal: false,
    milestones: [
      { daysAgo: 11, status: "query_sent" },
      { daysAgo: 9, status: "query_viewed" },
      { daysAgo: 5, status: "manuscript_requested" },
    ],
  },
  {
    isTerminal: false,
    milestones: [
      { daysAgo: 18, status: "query_sent" },
      { daysAgo: 15, status: "query_viewed" },
      { daysAgo: 12, status: "manuscript_requested" },
      { daysAgo: 8, status: "manuscript_under_review" },
    ],
  },
  {
    isTerminal: true,
    milestones: [
      { daysAgo: 26, status: "query_sent" },
      { daysAgo: 22, status: "query_viewed" },
      { daysAgo: 14, status: "rejected" },
    ],
  },
];

function getActivityDate(to: string, daysAgo: number) {
  const endDate = new Date(`${to.slice(0, 10)}T00:00:00.000Z`);
  const safeEndDate = Number.isNaN(endDate.getTime()) ? new Date() : endDate;
  const date = new Date(safeEndDate);
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

function createTestLane(
  blueprint: ActivityLaneBlueprint,
  index: number,
  scopeEnd: string,
): AgentActivityLane {
  const events = blueprint.milestones.map((milestone, milestoneIndex) => {
    const previousMilestone = blueprint.milestones[milestoneIndex - 1];

    return {
      status: milestone.status,
      rawStatus: milestone.status,
      occurredOn: getActivityDate(scopeEnd, milestone.daysAgo),
      elapsedDays: previousMilestone
        ? previousMilestone.daysAgo - milestone.daysAgo
        : null,
    };
  });
  const currentEvent = events[events.length - 1];

  return {
    laneId: `writer-activity-test-query-${index + 1}`,
    sentOn: events[0].occurredOn,
    currentStatus: currentEvent.status,
    rawCurrentStatus: currentEvent.rawStatus,
    isTerminal: blueprint.isTerminal,
    lastStatusOn: currentEvent.occurredOn,
    events,
  };
}

/**
 * Temporary deterministic data for visually checking writer-facing activity
 * states until the backend environment contains a large enough test cohort.
 */
export function withWriterAgentActivityTestData(
  activityData: AgentActivityResponse,
): AgentActivityResponse {
  const lanes = WRITER_ACTIVITY_LANE_BLUEPRINTS.map((blueprint, index) =>
    createTestLane(blueprint, index, activityData.scope.to),
  );

  return {
    ...activityData,
    privacy: {
      minimumSampleSize: WRITER_AGENT_ACTIVITY_MINIMUM_SAMPLE_SIZE,
      cohortSize: lanes.length + 1,
      detailsAvailable: true,
      suppressionReason: null,
    },
    lanes,
  };
}
