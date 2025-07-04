import { useAgentMatches } from "../../context/agent-matches-context";
import { useRef } from "react";
import AgentMatchesInner from "./agent-matches-inner";
import PayWall from "../../components/pay-wall";

declare global {
  interface Window {
    isScrollLocked?: boolean;
    lastTouchY?: number;
  }
}

export const AgentMatchesPaywall = () => {
  const { matches, isLoading } = useAgentMatches();
  const gridRef = useRef<HTMLDivElement>(null);

  return (
    <div className="pt-12 min-h-[700px]">
      <AgentMatchesInner
        matches={matches}
        gridRef={gridRef}
        hasProPlan={false}
        isLoading={isLoading}
      />
      <PayWall
        gridRef={gridRef}
        resultLength={matches.length}
        title="Your first three agent matches are free"
      />
    </div>
  );
};

export default AgentMatchesPaywall;
