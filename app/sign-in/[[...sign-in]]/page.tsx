import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="pt-30 flex justify-center items-center">
      <SignIn forceRedirectUrl="/subscription" />
    </div>
  );
}
