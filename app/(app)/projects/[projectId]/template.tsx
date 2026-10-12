import type { ReactNode } from "react";

export default function ProjectViewTemplate({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="project-view-panel flex min-h-0 flex-1 flex-col">
      {children}
    </div>
  );
}
