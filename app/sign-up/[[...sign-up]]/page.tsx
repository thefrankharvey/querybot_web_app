import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="pt-16 flex flex-col gap-10 justify-center items-center">
      <h1 className="text-2xl text-center flex flex-col gap-2 items-center">
        Sign up for free and get access to our weekly newsletter and blog posts!
      </h1>
      <SignUp
        forceRedirectUrl="/subscription"
        appearance={{
          elements: {
            border: "none",
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
