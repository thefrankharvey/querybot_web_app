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
    <section
      className="mt-7 flex w-full items-center justify-center"
      aria-label="Query dashboard column totals"
    >
      <div className="w-full">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent/58">
            Dashboard activity
          </p>
          <h3 className="mt-2 font-serif text-[28px] leading-tight text-accent md:text-[32px]">
            A quick view of where your saved matches stand.
          </h3>
          <p className="mt-2 text-sm leading-6 text-accent/68">
            Review notes and move submissions forward in Query Dashboard.
          </p>
        </div>

        <div className="mt-5 grid w-full gap-3 md:grid-cols-2 xl:grid-cols-4">
          {visibleColumns.map((column) => (
            <Link
              key={column.id}
              href="/query-dashboard"
              className="group rounded-[24px] border border-white/90 bg-white/88 p-4 shadow-[0_18px_44px_rgba(24,44,69,0.08)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_24px_56px_rgba(24,44,69,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent/54">
                {column.title}
              </p>
              <p className="mt-3 text-4xl font-bold leading-none text-accent md:text-[40px]">
                <AnimatedCount value={column.count} />
              </p>
              <p className="mt-3 text-sm font-semibold text-accent">
                Open Query Dashboard
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
