"use client";

import { Copy } from "lucide-react";
import React, { useState } from "react";
import { cn } from "../utils";

const CopyToClipboard = ({
  text,
  className,
}: {
  text: string;
  className?: string;
}) => {
  const [showCopied, setShowCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <div className={cn("relative inline-block", className)}>
      {showCopied && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-4 bg-accent text-white text-xs rounded-md shadow-lg z-50 whitespace-nowrap">
          Copied!
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-accent"></div>
        </div>
      )}
      <div
        className="cursor-pointer flex items-center gap-2 no-underline"
        onClick={handleCopy}
      >
        <div className="flex items-center gap-1">{text}</div>
        <Copy className="w-4 h-4" />
      </div>
    </div>
  );
};

export default CopyToClipboard;
