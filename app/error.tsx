"use client";

import { Frown } from "lucide-react";
import { Button } from "./ui-primitives/button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const Error = ({ error, reset }: ErrorProps) => {
  const router = useRouter();

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("App error boundary caught error:", error);
    }
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex items-center gap-4">
        <Frown className="w-16 h-16 text-accent" />
        <div>
          <h1 className="text-4xl font-bold text-accent">Error</h1>
          <p className="text-lg text-accent">Something went wrong</p>
        </div>
      </div>
      {error?.digest && (
        <p className="mt-4 text-xs text-muted-foreground">
          Error ID: <code className="font-mono">{error.digest}</code>
        </p>
      )}
      <div className="mt-6 ml-18 flex gap-3">
        <Button variant="outline" className="text-lg" size="lg" onClick={reset}>
          Try again
        </Button>
        <Button
          variant="default"
          className="text-lg"
          size="lg"
          onClick={() => {
            router.push("/");
          }}
        >
          Go to home page
        </Button>
      </div>
    </div>
  );
};

export default Error;
