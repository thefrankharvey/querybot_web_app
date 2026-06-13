import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";

import { AuthPageShell } from "../../components/auth-page-shell";
import { clerkAuthAppearance } from "../../components/clerk-auth-appearance";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to Write Query Hook to continue your query workflow.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/sign-in" },
};

type SignInPageProps = {
  searchParams?: Promise<{
    redirect_url?: string | string[];
  }>;
};

export default async function Page({ searchParams }: SignInPageProps) {
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

  return <SignInComponent redirectUrl={safeRedirectUrl} />;
}

async function SignInComponent({ redirectUrl }: { redirectUrl: string | null }) {
  return (
    <AuthPageShell
      title="Welcome back."
      description="Sign in to continue your query workflow."
      authPrompt="New here?"
      authLinkHref="/sign-up"
      authLinkLabel="Create an account"
    >
      <SignIn
        forceRedirectUrl={redirectUrl ?? "/home"}
        fallbackRedirectUrl="/home"
        appearance={clerkAuthAppearance}
      />
    </AuthPageShell>
  );
}
