"use client";

import { UsersIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/app/ui-primitives/button";
import { Spinner } from "@/app/ui-primitives/spinner";
import { useClerkUser } from "@/app/hooks/use-clerk-user";
import { useAgentMatches } from "../context/agent-matches-context";

export function PreviousAgentMatchesButton({
  className,
  label = "Previous Agent Matches",
  showIcon = false,
  variant = "default",
}: {
  className?: string;
  label?: string;
  showIcon?: boolean;
  variant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const router = useRouter();
  const { isSubscribed } = useClerkUser();
  const {
    formData,
    matches,
    previousSearchStatus,
    refreshPreviousAgentMatches,
  } = useAgentMatches();

  if (matches.length === 0) {
    return null;
  }

  const isRefreshing = previousSearchStatus !== "idle";

  const handleClick = () => {
    void refreshPreviousAgentMatches(isSubscribed);
    router.push(formData ? "/agent-matches" : "/smart-match");
  };

  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      disabled={isRefreshing}
      aria-busy={isRefreshing}
      onClick={handleClick}
    >
      {isRefreshing ? (
        <Spinner data-icon="inline-start" className="text-current" />
      ) : showIcon ? (
        <UsersIcon data-icon="inline-start" />
      ) : null}
      {isRefreshing ? "Refreshing Agent Matches…" : label}
    </Button>
  );
}
