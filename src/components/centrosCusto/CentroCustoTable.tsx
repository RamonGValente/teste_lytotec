
import React from "react";
import { Loader2 } from "lucide-react";
import { CentroCusto } from "@/types/centroCusto";
import { useIsMobile } from "@/hooks/use-mobile";
import CentroCustoDesktopTable from "./table/CentroCustoDesktopTable";
import CentroCustoMobileCards from "./table/CentroCustoMobileCards";
import TableLoadingState from "./table/TableLoadingState";
import TableErrorState from "./table/TableErrorState";
import TableEmptyState from "./table/TableEmptyState";

interface CentroCustoTableProps {
  centrosCusto: CentroCusto[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onEdit: (centroCusto: CentroCusto) => void;
  onView: (centroCusto: CentroCusto) => void;
  onDelete: (centroCusto: CentroCusto) => void;
}

const CentroCustoTable: React.FC<CentroCustoTableProps> = ({
  centrosCusto,
  isLoading,
  isError,
  onEdit,
  onView,
  onDelete
}) => {
  const isMobile = useIsMobile();

  if (isLoading) {
    return <TableLoadingState />;
  }

  if (isError) {
    return <TableErrorState />;
  }

  if (!centrosCusto || centrosCusto.length === 0) {
    return <TableEmptyState />;
  }

  return isMobile ? (
    <CentroCustoMobileCards 
      centrosCusto={centrosCusto} 
      onEdit={onEdit} 
      onView={onView} 
      onDelete={onDelete} 
    />
  ) : (
    <CentroCustoDesktopTable 
      centrosCusto={centrosCusto} 
      onEdit={onEdit} 
      onView={onView} 
      onDelete={onDelete} 
    />
  );
};

export default CentroCustoTable;
