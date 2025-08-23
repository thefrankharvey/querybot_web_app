import { SignIn } from "@clerk/nextjs";

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return <SignInComponent searchParams={searchParams} />;
}

async function SignInComponent({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const redirectUrl =
    typeof params?.redirectUrl === "string"
      ? params.redirectUrl
      : "/subscription";

  return (
    <div className="pt-16 flex justify-center items-center">
      <SignIn
        forceRedirectUrl={redirectUrl}
        appearance={{
          elements: {
            formButtonPrimary: {
              fontSize: 16,
              padding: "16px",
              textTransform: "none",
              backgroundColor: "#F77AE8",
              fontWeight: "semibold",
              border: "none",
              color: "black",
              "&:hover, &:focus, &:active": {
                color: "white",
                backgroundColor: "#F77AE8",
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
