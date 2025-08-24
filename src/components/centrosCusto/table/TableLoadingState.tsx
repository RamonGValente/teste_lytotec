
import React from "react";
import { Loader2 } from "lucide-react";

const TableLoadingState: React.FC = () => {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <div className="flex justify-center items-center h-24">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Carregando...</span>
      </div>
    </div>
  );
};

export default TableLoadingState;
