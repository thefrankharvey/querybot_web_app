import { ArrowLeft, Download, FolderOpen, Heart } from "lucide-react";
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
import AgentResultsWalkthrough from "./agent-results-walkthrough";
import { useEffect, useState } from "react";

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
  projectName,
  projectDashboardHref,
  onWalkthroughActiveChange,
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
  projectName?: string;
  projectDashboardHref?: string;
  onWalkthroughActiveChange?: (isActive: boolean) => void;
}) => {
  const [isDesktopViewport, setIsDesktopViewport] = useState(false);
  const isExportReady = Boolean(spreadsheetUrl);
  const isExportPreparing = sheetStatus === "creating";

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const updateDesktopViewport = () => {
      setIsDesktopViewport(mediaQuery.matches);
    };

    updateDesktopViewport();
    mediaQuery.addEventListener("change", updateDesktopViewport);

    return () => {
      mediaQuery.removeEventListener("change", updateDesktopViewport);
    };
  }, []);

  return (
    <div className="md:p-0 p-4">
      <h1 className="mb-5 text-3xl font-semibold leading-tight text-accent md:text-[32px] font-serif">
        {totalAgents ? `${totalAgents} Agent matches` : "Agent matches"}
      </h1>
      {projectName && (
        <div className="mb-5 flex flex-col gap-3 rounded-[24px] border border-accent/10 bg-white/70 px-4 py-3 text-accent shadow-[0_16px_34px_rgba(24,44,69,0.07)] backdrop-blur-sm md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-accent/72">Active project</p>
            <p className="truncate text-lg font-semibold text-accent">
              {projectName}
            </p>
          </div>
          {projectDashboardHref && (
            <Button
              asChild
              variant="secondary"
              size="sm"
              className="w-full md:w-auto"
            >
              <Link href={projectDashboardHref}>
                <FolderOpen data-icon="inline-start" />
                View Dashboard
              </Link>
            </Button>
          )}
        </div>
      )}
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
              <div
                className="w-full md:w-auto"
                data-tour-target="agent-results-status-filter"
              >
                <StatusFilter
                  value={statusFilter}
                  onValueChange={onStatusChange}
                />
              </div>
            )}
            {countryFilter && onCountryChange && (
              <div
                className="w-full md:w-auto"
                data-tour-target="agent-results-country-filter"
              >
                <CountryFilter
                  value={countryFilter}
                  onValueChange={onCountryChange}
                />
              </div>
            )}
            <div
              className="w-full md:w-auto"
              data-tour-target="agent-results-save-all"
            >
              {!isSubscribed ? (
                <TooltipComponent
                  asChild
                  className="inline-block w-full md:w-fit"
                  contentClass="text-center"
                  content="Subscribe to save all agent matches!"
                >
                  <span tabIndex={0}>
                    <Button
                      disabled={true}
                      className="w-full md:w-auto"
                    >
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-white" />
                        <span>Save All Agents</span>
                      </div>
                    </Button>
                  </span>
                </TooltipComponent>
              ) : (
                onSaveAllAgents && (
                  <Button
                    onClick={onSaveAllAgents}
                    disabled={isSavingAll || isLoading || matches.length === 0}
                    className="w-full md:w-auto"
                  >
                    <div className="flex items-center gap-2">
                      {isSavingAll ? <Spinner className="w-4 h-4 text-white" /> : <Heart className="w-4 h-4 text-white" />}
                      <span>Save All Agents</span>
                    </div>
                  </Button>
                ))}
            </div>
            <div
              className="w-full md:w-auto"
              data-tour-target="agent-results-download-excel"
            >
              {!isSubscribed ? (
                <TooltipComponent
                  asChild
                  className="inline-block w-full md:w-fit"
                  contentClass="text-center"
                  content="Subscribe to download all agent matches!"
                >
                  <span tabIndex={0}>
                    <Button
                      className="w-full md:w-auto"
                      disabled={true}
                    >
                      <div className="flex items-center gap-2">
                        <Download data-icon="inline-start" />
                        <span>Query Spreadsheet</span>
                      </div>
                    </Button>
                  </span>
                </TooltipComponent>
              ) : isExportReady ? (
                <Button asChild className="w-full md:w-auto">
                  <a href={spreadsheetUrl ?? undefined}>
                    <Download data-icon="inline-start" />
                    <span>Query Spreadsheet</span>
                  </a>
                </Button>
              ) : (
                <Button
                  disabled
                  className="w-full md:w-auto"
                  aria-live="polite"
                >
                  {isExportPreparing ? (
                    <Spinner
                      data-icon="inline-start"
                      className="text-current"
                    />
                  ) : (
                    <Download data-icon="inline-start" />
                  )}
                  <span>
                    {isExportPreparing
                      ? "Preparing Excel…"
                      : "Excel unavailable"}
                  </span>
                </Button>
              )}
            </div>
            {/* <ExplanationBlock /> */}
          </div>
        </div>
        {matches && matches.length > 0 ? (
          <div
            data-tour-target="agent-results-grid"
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
                projectName={projectName}
                tourTarget={
                  index === 0 ? "agent-results-first-card" : undefined
                }
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
      <AgentResultsWalkthrough
        enabled={isDesktopViewport && matches.length > 0 && !isLoading}
        onActiveChange={onWalkthroughActiveChange}
      />
    </div>
  );
};

export default AgentMatchesInner;
