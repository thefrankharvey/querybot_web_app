import { SignIn } from "@clerk/nextjs";

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
    <div className="pt-16 flex justify-center items-center">
      <SignIn
        forceRedirectUrl={redirectUrl ?? undefined}
        fallbackRedirectUrl="/home"
        appearance={{
          elements: {
            formButtonPrimary: {
              fontSize: 16,
              padding: "16px",
              textTransform: "none",
              backgroundColor: "#1c4a4e",
              fontWeight: "semibold",
              border: "none",
              color: "white",
              "&:hover, &:focus, &:active": {
                color: "white",
                backgroundColor: "#1c4a4e",
              },
            },
            formFieldInput: {
              padding: "27px 20px",
            },
            socialButtonsBlockButton: {
              padding: "18px 20px",
            },
          },
        }}
      />
    </div>
  );
}
