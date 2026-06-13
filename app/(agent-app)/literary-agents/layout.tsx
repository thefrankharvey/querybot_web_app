import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getAccountMetadata } from "@/lib/clerk-metadata";
import { AgentNav } from "./components/agent-nav";

export default async function AgentAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/literary-agents/sign-in");
  }

  const user = await currentUser();
  const { accountType } = getAccountMetadata(user);

  if (accountType !== "agent") {
    redirect("/home");
  }

  return (
    <div className="ambient-page min-h-screen">
      <div className="ambient-orb-top" />
      <AgentNav />
      <main className="ambient-page-shell mx-auto w-full max-w-screen-2xl px-4 pb-16">
        {children}
      </main>
    </div>
  );
}
