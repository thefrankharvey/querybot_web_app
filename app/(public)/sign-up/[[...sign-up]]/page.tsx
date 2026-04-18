import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";

import { AuthPageShell } from "../../components/auth-page-shell";

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
        appearance={{
          elements: {
            rootBox: "w-full overflow-hidden rounded-[28px] border border-gray-200 shadow-xl",
            card: {
              width: "100%",
              borderRadius: "28px",
              border: "1px solid rgba(28, 74, 78, 0.10)",
              backgroundColor: "rgba(255, 255, 255, 0.92)",
              boxShadow: "0 28px 80px rgba(24, 44, 69, 0.12)",
              padding: "32px",
            },
            headerTitle: {
              color: "#1c4a4e",
              fontSize: "1.5rem",
              fontWeight: "600",
              letterSpacing: "-0.02em",
            },
            headerSubtitle: {
              color: "rgba(28, 74, 78, 0.68)",
              fontSize: "0.95rem",
            },
            formButtonPrimary: {
              fontSize: "1rem",
              minHeight: "52px",
              borderRadius: "999px",
              textTransform: "none",
              backgroundColor: "#1c4a4e",
              fontWeight: "600",
              border: "1px solid #1c4a4e",
              color: "white",
              boxShadow: "0 18px 36px rgba(28, 74, 78, 0.18)",
              "&:hover, &:focus, &:active": {
                color: "white",
                backgroundColor: "#163b3e",
              },
              "&:focus-visible": {
                boxShadow: "0 0 0 4px rgba(28, 74, 78, 0.18)",
              },
            },
            formFieldLabel: {
              color: "#1c4a4e",
              fontSize: "0.92rem",
              fontWeight: "600",
              marginBottom: "0.5rem",
            },
            formFieldInput: {
              minHeight: "54px",
              borderRadius: "16px",
              border: "1px solid rgba(28, 74, 78, 0.16)",
              backgroundColor: "rgba(251, 250, 247, 0.98)",
              padding: "0 18px",
              boxShadow: "inset 0 1px 2px rgba(24, 44, 69, 0.04)",
              "&:focus": {
                borderColor: "#1c4a4e",
                boxShadow: "0 0 0 4px rgba(28, 74, 78, 0.12)",
              },
            },
            socialButtonsBlockButton: {
              minHeight: "54px",
              borderRadius: "16px",
              border: "1px solid rgba(28, 74, 78, 0.12)",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              boxShadow: "0 10px 30px rgba(24, 44, 69, 0.06)",
              "&:hover": {
                backgroundColor: "rgba(247, 246, 242, 0.98)",
              },
            },
            socialButtonsBlockButtonText: {
              color: "#1c4a4e",
              fontWeight: "500",
            },
            dividerLine: {
              backgroundColor: "rgba(28, 74, 78, 0.10)",
            },
            dividerText: {
              color: "rgba(28, 74, 78, 0.55)",
              fontSize: "0.8rem",
            },
            footerActionText: {
              color: "rgba(28, 74, 78, 0.72)",
            },
            footerActionLink: {
              color: "#1c4a4e",
              fontWeight: "600",
            },
            formFieldAction: {
              color: "#1c4a4e",
              fontWeight: "500",
            },
          },
        }}
      />
    </AuthPageShell>
  );
}
