"use client";

import { Copy } from "lucide-react";
import React, { useState } from "react";
import TooltipComponent from "./tooltip";

const CopyToClipboard = ({ text }: { text: string }) => {
  const [showCopied, setShowCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <TooltipComponent
      content={showCopied ? "Copied!" : "Copy to clipboard"}
      className="w-full"
    >
      <div
        className="cursor-pointer flex items-center gap-2"
        onClick={handleCopy}
      >
        <div className="flex items-center gap-1">{text}</div>
        <Copy className="w-4 h-4" />
      </div>
    </TooltipComponent>
  );
};

export default CopyToClipboard;
