import type { Metadata } from "next";

import { AuthPageShell } from "../../../components/auth-page-shell";
import {
  buildAgentCompleteAuthPath,
  getSafeAgentRedirectPath,
} from "../../auth-redirects";
import { AgentSignUp } from "./agent-sign-up";

export const metadata: Metadata = {
  title: "Agent Sign Up",
  description:
    "Create your Write Query Hook literary agent account to review opportunities built for your side of the query process.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/literary-agents/sign-up" },
};

const AGENT_SIGN_UP_PROOF_ITEMS = [
  "Agent-only workspace",
  "Query workflow tools",
  "Writer-facing context",
];

type AgentSignUpPageProps = {
  searchParams?: Promise<{
    redirect_url?: string | string[];
  }>;
};

export default async function Page({ searchParams }: AgentSignUpPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const safeRedirectUrl = getSafeAgentRedirectPath(params?.redirect_url);
  const completeAuthPath = buildAgentCompleteAuthPath(safeRedirectUrl);

  return (
    <AuthPageShell
      eyebrow="Literary agent workflow"
      title="Create your agent workspace."
      description="Sign up for a literary-agent view of Write Query Hook, built to keep your side of the submission process focused and separate."
      proofItems={AGENT_SIGN_UP_PROOF_ITEMS}
      authPrompt="Already have an agent account?"
      authLinkHref="/literary-agents/sign-in"
      authLinkLabel="Sign in"
    >
      <AgentSignUp completeAuthPath={completeAuthPath} />
    </AuthPageShell>
  );
}
