import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="pt-16 flex flex-col gap-10 justify-center items-center">
      <h1 className="md:text-4xl text-2xl text-accent md:text-center text-left md:w-[80%] w-full mx-auto leading-normal">
        Join hundreds of writers using{" "}
        <span className="font-semibold">Write Query Hook</span> to get{" "}
        <span className="font-semibold underline">out</span> of the query
        trenches and <span className="font-semibold underline">onto</span> agent
        client lists.
      </h1>
      <SignUp
        forceRedirectUrl="/saved-agents"
        fallbackRedirectUrl="/saved-agents"
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
