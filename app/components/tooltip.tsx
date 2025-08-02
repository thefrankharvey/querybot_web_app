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
  contentClass?: string;
  asChild?: boolean;
}

const TooltipComponent = ({
  children,
  content,
  className,
  contentClass,
  asChild = false,
}: TooltipProps) => {
  return (
    <Tooltip>
      <TooltipTrigger className={className} asChild={asChild}>
        {children}
      </TooltipTrigger>
      <TooltipContent className={cn("max-w-xs w-[300px]", contentClass)}>
        <p className="text-sm p-4">{content}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default TooltipComponent;
