export function ProjectDashboardTitle({
  projectName,
}: {
  projectName: string;
}) {
  return (
    <span className="min-w-0 break-words">
      {projectName || "Query Dashboard"}
    </span>
  );
}
