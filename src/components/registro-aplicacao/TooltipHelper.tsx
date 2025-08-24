import React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface TooltipHelperProps {
  content: string;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}

export const TooltipHelper: React.FC<TooltipHelperProps> = ({ 
  content, 
  side = "top",
  className = "h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help"
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className={className} />
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};