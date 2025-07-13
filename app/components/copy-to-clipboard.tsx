"use client";

import { Copy } from "lucide-react";
import React, { useState } from "react";

const CopyToClipboard = ({ text }: { text: string }) => {
  const [showCopied, setShowCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <div className="relative inline-block">
      {showCopied && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-4 bg-primary text-white text-xs rounded-md shadow-lg z-50 whitespace-nowrap">
          Copied!
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary"></div>
        </div>
      )}
      <div
        className="cursor-pointer flex items-center gap-2 hover:text-accent transition-all duration-300 no-underline"
        onClick={handleCopy}
      >
        <div className="flex items-center gap-1">{text}</div>
        <Copy className="w-4 h-4" />
      </div>
    </div>
  );
};

export default CopyToClipboard;
