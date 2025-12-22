import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return <SignInComponent />;
}

async function SignInComponent() {
  return (
    <div className="pt-16 flex justify-center items-center">
      <SignIn
        forceRedirectUrl="/profile/saved-match"
        fallbackRedirectUrl="/profile/saved-match"
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
