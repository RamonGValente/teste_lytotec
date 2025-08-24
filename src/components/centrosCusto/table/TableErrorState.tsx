
import React from "react";
import { useIsSmallScreen } from "@/hooks/use-mobile";

const TableErrorState: React.FC = () => {
  const isSmallScreen = useIsSmallScreen();
  
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 sm:p-6">
      <div className="flex justify-center items-center h-16 sm:h-24 text-destructive text-xs sm:text-sm">
        Ocorreu um erro ao carregar os dados. Tente novamente.
      </div>
    </div>
  );
};

export default TableErrorState;
