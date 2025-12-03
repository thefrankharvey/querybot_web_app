import { useClerkUser } from "@/app/hooks/use-clerk-user";
import { getFromLocalStorage } from "@/app/utils";
import { Newspaper, NotebookPen, ScanSearch } from "lucide-react";
import Link from "next/link";

export const ActionCards = () => {
  const { isSubscribed, isLoading } = useClerkUser();
  const hasAgentMatches = getFromLocalStorage("agent_matches");

  const actionCardData = [
    {
      title: "Smart Match",
      link: "/smart-match",
      icon: <ScanSearch className="w-4 h-4" />,
    },
    {
      title: "Dispatch",
      link: "/slush-feed",
      icon: <Newspaper className="w-4 h-4" />,
    },
    {
      title: "Blog",
      link: "/blog",
      icon: <NotebookPen className="w-4 h-4" />,
    },
  ];

  if (isSubscribed && hasAgentMatches && !isLoading) {
    actionCardData.push({
      title: "Previous Matches",
      link: "/agent-matches",
      icon: <ScanSearch className="w-4 h-4" />,
    });
  }

  return (
    <div
      className="grid gap-4 pb-4"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
    >
      {actionCardData.map((card, index) => (
        <div
          key={index}
          className="flex flex-col items-center justify-center gap-2 bg-white rounded-lg p-4 py-8 shadow-sm hover:cursor-pointer hover:shadow-lg transition-all duration-300"
        >
          <Link href={card.link}>
            <div className="flex items-center gap-2">
              <div>{card.icon}</div>
              <div className="text-lg font-medium text-black">{card.title}</div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
};
