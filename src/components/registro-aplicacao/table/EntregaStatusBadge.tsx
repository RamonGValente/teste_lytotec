
import React from "react";
import { cn } from "@/lib/utils";

interface EntregaStatusBadgeProps {
  status: string;
}

const EntregaStatusBadge: React.FC<EntregaStatusBadgeProps> = ({ status }) => {
  const statusColor = (status: string) => {
    switch (status) {
      case "Pendente": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Enviada": return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
      case "Entregue": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Cancelada": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", statusColor(status))}>
      {status}
    </span>
  );
};

export default EntregaStatusBadge;
