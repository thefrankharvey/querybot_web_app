"use client";

import { Frown } from "lucide-react";
import { Button } from "./ui-primitives/button";
import { useRouter } from "next/navigation";
const Error = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Frown className="w-16 h-16" />
      <h1 className="text-4xl font-bold text-accent">Error</h1>
      <p className="text-lg text-accent">Something went wrong</p>
      <Button
        variant="default"
        className="text-lg text-accent"
        onClick={() => {
          router.push("/");
        }}
      >
        Go to home page
      </Button>
    </div>
  );
};

export default Error;
