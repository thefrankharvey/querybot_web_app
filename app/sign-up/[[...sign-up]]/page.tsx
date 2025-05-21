import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="pt-30 flex justify-center items-center">
      <SignUp forceRedirectUrl="/subscription" />
    </div>
  );
}
