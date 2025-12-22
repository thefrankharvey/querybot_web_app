import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="pt-16 flex flex-col gap-10 justify-center items-center">
      <h1 className="text-2xl text-accent text-center w-[60%] mx-auto leading-normal">
        Sign up for free and get access to{" "}
        <span className="font-semibold">Smart Match</span>,{" "}
        <span className="font-semibold">Dispatch</span> and our industry leading
        news letter, <span className="font-semibold">Slushwire</span>!
      </h1>
      <SignUp
        forceRedirectUrl="/profile/saved-match"
        fallbackRedirectUrl="/profile/saved-match"
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
