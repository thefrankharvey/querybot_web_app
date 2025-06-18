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
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <Link href="/query-form" className="flex items-center gap-2">
            <ArrowLeft className="w-8 h-8" />
            <h2 className="text-2xl">Back</h2>
          </Link>
          <div className="flex flex-col mt-8 mb-8 md:mb-0 md:mt-0 md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
            <ExplanationBlock />
            <Button
              onClick={handleCSVDownload}
              className="cursor-pointer text-lg p-6 font-semibold w-full md:w-auto"
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
