"use client";

import { useClerkUser } from "@/app/hooks/use-clerk-user";
import { ExternalLinkIcon, ScanSearch } from "lucide-react";
import Link from "next/link";
import { PreviousAgentMatchesButton } from "../(app)/components/previous-agent-matches-button";

export const ActionCards = () => {
  const { isLoading } = useClerkUser();

  const actionCardData = [
    {
      title: "Find Agents",
      link: "/smart-match",
      icon: <ScanSearch className="w-4 h-4" />,
    },
    {
      title: "Free Query Spreadsheet",
      href: "https://docs.google.com/spreadsheets/u/4/d/17yQjT-helZqZF1kdF7UzUQYFdNRwrAvGc8Dm2Inbahw/edit?gid=419639381#gid=419639381",
      icon: <ExternalLinkIcon className="w-4 h-4" />,
    },
  ];

  return (
    <div
      className="grid gap-4 pb-4"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
    >
      {actionCardData.map((card, index) => (
        <div
          key={index}
          className="flex flex-col items-center justify-center gap-2 bg-white border border-accent/20 rounded-lg p-4 py-8 shadow-sm hover:cursor-pointer hover:shadow-xl transition-all duration-300"
        >
          {card.link && (
            <Link href={card.link}>
              <div className="flex items-center gap-2">
                <div>{card.icon}</div>
                <div className="text-lg font-medium text-black">{card.title}</div>
              </div>
            </Link>
          )}
          {card.href &&
            (<a href={card.href} target="_blank" rel="noopener noreferrer">
              <div className="flex items-center gap-2">
                <div>{card.icon}</div>
                <div className="text-lg font-medium text-black">{card.title}</div>
              </div>
            </a>)
          }
        </div>
      ))}
      {!isLoading ? (
        <PreviousAgentMatchesButton
          showIcon
          variant="secondary"
          className="h-auto w-full rounded-lg p-4 py-8 text-lg font-medium shadow-sm transition-all duration-300 hover:shadow-xl"
        />
      ) : null}
    </div>
  );
};
