import { currentUser } from "@clerk/nextjs/server";

import { getAccountMetadata } from "@/lib/clerk-metadata";
import { AgentProfileHome } from "./agent-profile-home";

export default async function LiteraryAgentHomePage() {
  const user = await currentUser();
  const { agentId } = getAccountMetadata(user);
  const displayName =
    user?.firstName || user?.emailAddresses[0]?.emailAddress || "there";

  return (
    <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-6 pt-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent/58">
          Literary agent workspace
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight text-accent md:text-5xl">
          Welcome, {displayName}.
        </h1>
      </div>

      <AgentProfileHome initialAgentId={agentId} />
    </div>
  );
}
