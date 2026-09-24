import { Spinner } from "@/app/ui-primitives/spinner";

export function ProjectDashboardLoading() {
  return (
    <div className="query-dashboard-page flex min-h-[50vh] w-full items-center justify-center px-4 py-16">
      <Spinner className="size-16" aria-label="Loading project" />
    </div>
  );
}
