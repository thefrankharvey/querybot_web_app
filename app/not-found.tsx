"use client";

import { Frown } from "lucide-react";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Frown className="w-16 h-16" />
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-lg">Page not found</p>
    </div>
  );
};

export default NotFound;
