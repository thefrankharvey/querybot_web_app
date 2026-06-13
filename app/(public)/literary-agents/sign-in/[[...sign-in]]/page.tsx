import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";

import { AuthPageShell } from "../../../components/auth-page-shell";
import { clerkAuthAppearance } from "../../../components/clerk-auth-appearance";
import {
  buildAgentCompleteAuthPath,
  getSafeAgentRedirectPath,
} from "../../auth-redirects";

export const metadata: Metadata = {
  title: "Agent Sign In",
  description:
    "Sign in to your Write Query Hook literary agent workspace.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/literary-agents/sign-in" },
};

type AgentSignInPageProps = {
  searchParams?: Promise<{
    redirect_url?: string | string[];
  }>;
};

export default async function Page({ searchParams }: AgentSignInPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const safeRedirectUrl = getSafeAgentRedirectPath(params?.redirect_url);
  const completeAuthPath = buildAgentCompleteAuthPath(safeRedirectUrl);

  return (
    <AuthPageShell
      eyebrow="Literary agent workflow"
      title="Welcome back."
      description="Sign in to continue from the agent side of Write Query Hook."
      authPrompt="New agent?"
      authLinkHref="/literary-agents/sign-up"
      authLinkLabel="Create an account"
    >
      <SignIn
        forceRedirectUrl={completeAuthPath}
        fallbackRedirectUrl={completeAuthPath}
        signUpForceRedirectUrl={completeAuthPath}
        signUpFallbackRedirectUrl={completeAuthPath}
        signUpUrl="/literary-agents/sign-up"
        appearance={clerkAuthAppearance}
      />
    </AuthPageShell>
  );
}
