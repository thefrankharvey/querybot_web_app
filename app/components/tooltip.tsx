import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/app/ui-primitives/tooltip";

import React from "react";
import { cn } from "../utils";

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  className?: string;
}

const TooltipComponent = ({ children, content, className }: TooltipProps) => {
  return (
    <Tooltip>
      <TooltipTrigger className={className}>{children}</TooltipTrigger>
      <TooltipContent className={cn("max-w-xs w-[300px]")}>
        <p className="text-sm p-4">{content}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default TooltipComponent;
