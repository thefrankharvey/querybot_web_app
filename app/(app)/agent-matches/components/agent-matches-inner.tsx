import { ArrowLeft, ExternalLink, Save } from "lucide-react";
import { AgentMatch, SheetStatus } from "../../context/agent-matches-context";
import AgentMatchCard from "./agent-match-card";
import Link from "next/link";
import { Button } from "@/app/ui-primitives/button";
import StatusFilter from "./status-filter";
import { Spinner } from "@/app/ui-primitives/spinner";
import CountryFilter from "./country-filter";
import { SaveAgentPayload } from "@/app/types";
import ProgressBar from "../../smart-match/components/progress-bar";
import TooltipComponent from "@/app/components/tooltip";

export const AgentMatchesInner = ({
  matches,
  totalAgents,
  isSuccess,
  isSubscribed,
  gridRef,
  isLoading,
  statusFilter,
  onStatusChange,
  countryFilter,
  onCountryChange,
  spreadsheetUrl,
  sheetStatus,
  onSaveAllAgents,
  isSavingAll,
  onSaveAgent,
  savingAgentId,
}: {
  matches: AgentMatch[];
  totalAgents: number | null;
  isSuccess: boolean;
  isSubscribed: boolean;
  gridRef?: React.RefObject<HTMLDivElement | null>;
  isLoading: boolean;
  statusFilter?: string;
  onStatusChange?: (status: string) => void;
  countryFilter?: string;
  onCountryChange?: (country: string) => void;
  sheetTaskId?: string | null;
  spreadsheetUrl?: string | null;
  sheetStatus?: SheetStatus;
  onSaveAllAgents?: () => void;
  isSavingAll?: boolean;
  onSaveAgent?: (payload: SaveAgentPayload) => void;
  savingAgentId?: string | null;
}) => {
  return (
    <div className="md:p-0 p-4">
      <h1 className="mb-5 text-3xl font-semibold leading-tight text-accent md:text-[32px] font-serif">
        {totalAgents ? `${totalAgents} Agent matches` : "Agent matches"}
      </h1>
      <div>
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-4">
          <Link
            href="/smart-match"
            className="flex items-center gap-2 text-accent/72 transition-colors duration-300 hover:text-accent"
          >
            <ArrowLeft className="w-6 h-6" />
            <h2 className="text-md font-medium">Back</h2>
          </Link>
          <div className="flex flex-col mt-8 mb-8 md:mb-0 md:mt-0 md:flex-row items-start md:items-center md:gap-4 gap-6 w-full md:w-auto">
            {statusFilter && onStatusChange && (
              <StatusFilter
                value={statusFilter}
                onValueChange={onStatusChange}
              />
            )}
            {countryFilter && onCountryChange && (
              <CountryFilter
                value={countryFilter}
                onValueChange={onCountryChange}
              />
            )}
            {!isSubscribed ? (
              <TooltipComponent
                className="w-full md:w-fit"
                contentClass="text-center"
                content="Subscribe to save all agent matches!"
              >
                <Button
                  disabled={true}
                  className="w-full md:w-auto"
                >
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4 text-white" />
                    <span>Save All Agents</span>
                  </div>
                </Button>
              </TooltipComponent>
            ) : (
              onSaveAllAgents && (
                <Button
                  onClick={onSaveAllAgents}
                  disabled={isSavingAll || isLoading || matches.length === 0}
                  className="w-full md:w-auto"
                >
                  <div className="flex items-center gap-2">
                    {isSavingAll ? <Spinner className="w-4 h-4 text-white" /> : <Save className="w-4 h-4 text-white" />}
                    <span>Save All Agents</span>
                  </div>
                </Button>
              ))}
            {!isSubscribed ? (
              <TooltipComponent
                className="w-full md:w-fit"
                contentClass="text-center"
                content="Subscribe to download all agent matches!"
              >
                <Button
                  className="w-full md:w-auto"
                  disabled={true}
                >
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-white" />
                    <span>Query Spreadsheet</span>
                  </div>
                </Button>
              </TooltipComponent>
            ) : (
              <a
                href={spreadsheetUrl || undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto"
                onClick={(e) => {
                  if (sheetStatus === "pending" || !spreadsheetUrl || isLoading)
                    e.preventDefault();
                }}
              >
                <Button
                  disabled={
                    sheetStatus === "pending" || !spreadsheetUrl || isLoading
                  }
                  className="w-full md:w-auto"
                >
                  <div className="flex items-center gap-2">
                    {sheetStatus === "pending" ||
                      !spreadsheetUrl ||
                      isLoading ? (
                      <Spinner className="w-4 h-4 text-white" />
                    ) : (
                      <ExternalLink className="w-4 h-4 text-white" />
                    )}
                    <span>Query Spreadsheet</span>
                  </div>
                </Button>
              </a>
            )}
            {/* <ExplanationBlock /> */}
          </div>
        </div>
        {matches && matches.length > 0 ? (
          <div
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            ref={gridRef}
          >
            {matches.map((match, index: number) => (
              <AgentMatchCard
                key={index}
                agent={match}
                index={index}
                onSaveAgent={onSaveAgent}
                savingAgentId={savingAgentId}
                isSubscribed={isSubscribed}
                isLoading={isLoading}
                id={`agent-${index}`}
              />
            ))}
          </div>
        ) : (
          <div className="mx-auto mt-60 flex h-full w-full flex-col items-center justify-center">
            {isLoading ? (
              <ProgressBar isSuccess={isSuccess} onComplete={() => { }} />
            ) : (
              <>
                <p className="text-center text-xl font-semibold text-accent">
                  No matches found!
                </p>
                <p className="text-center text-xl font-semibold text-accent">
                  Try adjusting the filters or a new search.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentMatchesInner;
