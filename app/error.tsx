"use client";

import { Frown } from "lucide-react";

const Error = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Frown className="w-16 h-16" />
      <h1 className="text-4xl font-bold">Error</h1>
      <p className="text-lg">Something went wrong</p>
    </div>
  );
};

export default Error;
