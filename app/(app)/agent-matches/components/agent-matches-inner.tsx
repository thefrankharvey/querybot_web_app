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
    <>
      <h1 className="text-4xl md:text-[32px] font-semibold leading-tight mb-5 text-accent md:pt-6 pt-0">
        {totalAgents ? `${totalAgents} Agent matches` : "Agent matches"}
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
            {onSaveAllAgents && (
              <Button
                onClick={onSaveAllAgents}
                disabled={isSavingAll || isLoading || matches.length === 0}
                className="cursor-pointer text-sm p-2 px-4 w-full md:w-auto shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <div className="flex items-center gap-2">
                  {isSavingAll ? <Spinner className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  <span>Save All Agents</span>
                </div>
              </Button>
            )}
            <a
              href={spreadsheetUrl || undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto"
              onClick={(e) => {
                if (sheetStatus === "pending" || !spreadsheetUrl || isLoading) e.preventDefault();
              }}
            >
              <Button
                disabled={sheetStatus === "pending" || !spreadsheetUrl || isLoading}
                className="cursor-pointer text-sm p-2 px-4 w-full md:w-auto shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <div className="flex items-center gap-2">
                  {sheetStatus === "pending" || !spreadsheetUrl || isLoading ? <Spinner className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                  <span>Query Spreadsheet</span>
                </div>
              </Button>
            </a>
            {/* <ExplanationBlock /> */}
          </div>
        </div>
        {matches && matches.length > 0 ? (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            ref={gridRef}
          >
            {matches.map((match, index: number) => (
              <AgentMatchCard
                key={index}
                agent={match}
                index={index}
                isSubscribed={isSubscribed}
                isLoading={isLoading}
                id={`agent-${index}`}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full w-full mx-auto mt-60">
            {isLoading ? (
              <ProgressBar isSuccess={isSuccess} onComplete={() => { }} />
            ) : (
              <>
                <p className="text-accent text-center text-xl font-semibold">
                  No matches found!
                </p>
                <p className="text-accent text-center text-xl font-semibold">
                  Try adjusting the filters or a new search.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default AgentMatchesInner;
