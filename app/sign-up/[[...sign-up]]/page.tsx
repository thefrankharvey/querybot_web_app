import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="pt-16 flex flex-col gap-10 justify-center items-center">
      <h1 className="text-2xl text-center flex flex-col gap-2 items-center">
        Sign up for free and get access to our newsletter!
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
