import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";

import { AuthPageShell } from "../../components/auth-page-shell";
import { clerkAuthAppearance } from "../../components/clerk-auth-appearance";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Create your Write Query Hook account to match agents, track queries, and stay current on MSWLs and agent openings.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/sign-up" },
};

const SIGN_UP_PROOF_ITEMS = [
  "3,300+ agents",
  "Save matches in one click",
  "Track multiple projects",
];

type SignUpPageProps = {
  searchParams?: Promise<{
    redirect_url?: string | string[];
  }>;
};

export default async function Page({ searchParams }: SignUpPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const redirectParam = params?.redirect_url;
  const redirectUrl = Array.isArray(redirectParam)
    ? redirectParam[0]
    : redirectParam;
  const safeRedirectUrl =
    redirectUrl &&
      redirectUrl.startsWith("/") &&
      !redirectUrl.startsWith("//")
      ? redirectUrl
      : null;

  return (
    <AuthPageShell
      title="Start querying smarter."
      description="Find the right agents faster, track every submission in one place, and stay current without managing the process by hand."
      proofItems={SIGN_UP_PROOF_ITEMS}
      authPrompt="Already have an account?"
      authLinkHref="/sign-in"
      authLinkLabel="Sign in"
    >
      <SignUp
        forceRedirectUrl={safeRedirectUrl ?? "/home"}
        fallbackRedirectUrl="/home"
        unsafeMetadata={{
          accountType: "writer",
        }}
        appearance={clerkAuthAppearance}
      />
    </AuthPageShell>
  );
}
