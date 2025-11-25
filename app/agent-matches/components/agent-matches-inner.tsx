import { ArrowLeft } from "lucide-react";
import { AgentMatch } from "../../context/agent-matches-context";
import { AgentCards } from "../../components/agent-cards";
import Link from "next/link";
import { Button } from "@/app/ui-primitives/button";
import ExplanationBlock from "./explanation-block";

export const AgentMatchesInner = ({
  matches,
  isSubscribed,
  gridRef,
  isLoading,
  handleCSVDownload,
}: {
  matches: AgentMatch[];
  isSubscribed: boolean;
  gridRef?: React.RefObject<HTMLDivElement | null>;
  isLoading: boolean;
  handleCSVDownload?: () => void;
}) => {
  return (
    <>
      <h1 className="text-4xl md:text-[32px] font-extrabold leading-tight mb-8 text-accent">
        Agent matches
      </h1>
      <div>
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-4">
          <Link
            href="/smart-match"
            className="flex items-center gap-2 hover:text-accent transition-colors duration-300"
          >
            <ArrowLeft className="w-6 h-6" />
            <h2 className="text-md font-medium">Back</h2>
          </Link>
          <div className="flex flex-col mt-8 mb-8 md:mb-0 md:mt-0 md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
            <ExplanationBlock />
            {isSubscribed && (
              <Button
                onClick={handleCSVDownload}
                className="cursor-pointer text-sm p-6 w-full md:w-auto shadow-lg hover:shadow-xl"
              >
                Download page results
              </Button>
            )}
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
              isSubscribed={isSubscribed}
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
