import { ArrowLeft } from "lucide-react";
import { AgentMatch } from "../../context/agent-matches-context";
import { AgentCards } from "../../components/agent-cards";
import Link from "next/link";
import { Button } from "@/app/ui-primitives/button";
import ExplanationBlock from "./explanation-block";

export const AgentMatchesInner = ({
  matches,
  hasProPlan,
  gridRef,
  isLoading,
  handleCSVDownload,
}: {
  matches: AgentMatch[];
  hasProPlan: boolean;
  gridRef?: React.RefObject<HTMLDivElement | null>;
  isLoading: boolean;
  handleCSVDownload?: () => void;
}) => {
  return (
    <>
      <h1 className="text-4xl md:text-[40px] font-extrabold leading-tight mb-8">
        Agent matches
      </h1>
      <div>
        <div className="flex justify-between items-center mb-6">
          <Link href="/query-form" className="flex items-center gap-2">
            <ArrowLeft className="w-8 h-8" />
            <h2 className="text-2xl">Back</h2>
          </Link>
          <div className="flex items-center gap-4">
            <ExplanationBlock />
            <Button
              onClick={handleCSVDownload}
              className="cursor-pointer text-lg p-6 font-semibold"
            >
              Download page results
            </Button>
          </div>
        </div>
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          ref={gridRef}
        >
          {matches.map((match, index: number) => (
            <AgentCards
              key={index}
              agent={match}
              index={index}
              hasProPlan={hasProPlan}
              isLoading={isLoading}
              id={`agent-${index}`}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default AgentMatchesInner;
