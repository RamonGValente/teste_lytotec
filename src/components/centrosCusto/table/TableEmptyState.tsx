
import React from "react";
import { useIsSmallScreen } from "@/hooks/use-mobile";

const TableEmptyState: React.FC = () => {
  const isSmallScreen = useIsSmallScreen();
  
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 sm:p-6">
      <div className="flex justify-center items-center h-16 sm:h-24 text-muted-foreground text-xs sm:text-sm">
        Nenhum centro de custo encontrado
      </div>
    </div>
  );
};

export default TableEmptyState;
