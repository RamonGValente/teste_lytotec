
import React from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  footer?: React.ReactNode;
  onClick?: () => void;
  isLoading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  footer,
  onClick,
  isLoading = false
}) => {
  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">
          {isLoading ? "..." : value}
        </div>
      </CardContent>
      {footer && (
        <CardFooter className="pt-0 text-sm text-muted-foreground">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
};

export default StatsCard;
