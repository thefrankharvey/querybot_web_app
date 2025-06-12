import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/app/ui-primitives/tooltip";

import React from "react";

interface TooltipProps {
  children: React.ReactNode;
  content: string;
}

const TooltipComponent = ({ children, content }: TooltipProps) => {
  return (
    <Tooltip>
      <TooltipTrigger>{children}</TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p className="text-sm w-[300px] p-4">{content}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default TooltipComponent;
