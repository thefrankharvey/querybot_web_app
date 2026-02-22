"use client";

import Link from "next/link";
import { AgentMatch } from "@/app/types";
import {
  QUERY_DASH_COLUMNS,
  isQueryDashColumnId,
} from "@/app/(app)/query-dashboard/components/kanban-config";
import { FIRST_COLUMN_ID } from "@/app/(app)/query-dashboard/components/kanban-ordering";
import AnimatedCount from "./animated-count";

export interface QueryDashboardStatsProps {
  agentsList: AgentMatch[] | undefined;
}

export default function QueryDashboardStats({
  agentsList,
}: QueryDashboardStatsProps) {
  const countsByColumn = new Map<string, number>();

  for (const column of QUERY_DASH_COLUMNS) {
    countsByColumn.set(column.id, 0);
  }

  for (const agent of agentsList ?? []) {
    const rawColumn = agent.column_name ?? "";
    const normalizedColumn = isQueryDashColumnId(rawColumn)
      ? rawColumn
      : FIRST_COLUMN_ID;

    countsByColumn.set(normalizedColumn, (countsByColumn.get(normalizedColumn) ?? 0) + 1);
  }

  const visibleColumns = QUERY_DASH_COLUMNS
    .map((column) => ({
      ...column,
      count: countsByColumn.get(column.id) ?? 0,
    }))
    .filter((column) => column.count > 0);

  if (visibleColumns.length === 0) return null;

  return (
    <section className="w-full flex items-center justify-center mt-6" aria-label="Query dashboard column totals">
      <div className="flex w-full flex-col gap-3 md:flex-row md:flex-wrap md:justify-center md:gap-4">
        {visibleColumns.map((column) => (
          <Link
            key={column.id}
            href="/query-dashboard"
            className="group w-full md:w-[180px] md:flex-none rounded-lg border border-accent/50 bg-white px-3 py-3 md:px-4 md:py-4 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-accent/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            <p className="text-xs md:text-sm font-medium text-gray-600">{column.title}</p>
            <p className="mt-2 text-2xl md:text-3xl font-bold text-accent leading-none">
              <AnimatedCount value={column.count} />
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
