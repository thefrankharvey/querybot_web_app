import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="pt-16 flex justify-center items-center">
      {/* Sign up for and get access to our free newsletter */}
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
