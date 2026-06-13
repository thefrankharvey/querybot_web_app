import { currentUser } from "@clerk/nextjs/server";

import { getAccountMetadata } from "@/lib/clerk-metadata";

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

      <section className="glass-panel-strong flex flex-col gap-6 p-6 md:p-10">
        <div className="flex flex-col gap-3">
          <h2 className="font-serif text-2xl text-accent">
            Your agent view is ready.
          </h2>
          <p className="max-w-2xl text-base leading-7 text-accent/72">
            This is the first version of the literary-agent side of Write Query
            Hook. Your account is separate from the writer workspace, and the
            navigation here will grow around agent-specific workflows.
          </p>
        </div>

        {agentId ? (
          <div className="rounded-[20px] border border-accent/10 bg-white/70 px-4 py-3 text-sm text-accent/72">
            Temporary agent ID:{" "}
            <span className="font-mono text-accent">{agentId}</span>
          </div>
        ) : null}
      </section>
    </div>
  );
}
