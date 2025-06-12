import { ArrowLeft } from "lucide-react";
import { AgentMatch } from "../../context/agent-matches-context";
import { AgentCards } from "../../components/agent-cards";
import Link from "next/link";

export const AgentMatchesInner = ({
  matches,
  hasProPlan,
  gridRef,
  isLoading,
}: {
  matches: AgentMatch[];
  hasProPlan: boolean;
  gridRef?: React.RefObject<HTMLDivElement | null>;
  isLoading: boolean;
}) => {
  return (
    <>
      <h1 className="text-4xl md:text-[40px] font-extrabold leading-tight mb-8">
        Agent matches
      </h1>
      <div>
        <Link href="/query-form" className="flex items-center gap-2 mb-4">
          <ArrowLeft className="w-8 h-8" />
          <h2 className="text-2xl">Back</h2>
        </Link>
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
