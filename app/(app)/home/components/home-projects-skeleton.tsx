import SubscriberEmpty from "./subscriber-empty";
import ProjectDashboardOverview from "./project-dashboard-overview";

export default function HomeProjectsSkeleton() {
  return (
    <div role="status" aria-label="Loading your projects" className="w-full">
      <SubscriberEmpty isLoading showSmartMatchPrompt={false} />
      <ProjectDashboardOverview isLoading projectSummaries={[]} />
    </div>
  );
}
