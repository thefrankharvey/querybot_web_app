import { useAgentMatches } from "../../context/agent-matches-context";
import { useRef } from "react";
import AgentMatchesInner from "./agent-matches-inner";
import PayWall from "@/app/components/pay-wall";

declare global {
  interface Window {
    isScrollLocked?: boolean;
    lastTouchY?: number;
  }
}

export const AgentMatchesPaywall = () => {
  const { matches, isLoading, sheetTaskId, spreadsheetUrl } = useAgentMatches();
  const gridRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <AgentMatchesInner
        matches={matches}
        gridRef={gridRef}
        isSubscribed={false}
        isLoading={isLoading}
        sheetTaskId={sheetTaskId || ""}
        spreadsheetUrl={spreadsheetUrl}
      />
      <PayWall
        gridRef={gridRef}
        resultLength={matches.length}
        title="Your first three agent matches are free"
      />
    </>
  );
};

export default AgentMatchesPaywall;
