
import React from "react";
import { ListaProgramacaoEntrega } from "@/types/programacaoEntrega";
import { Table, TableBody } from "@/components/ui/table";
import EntregaTableHeader from "./table/EntregaTableHeader";
import EntregaTableRow from "./table/EntregaTableRow";
import EmptyEntregasMessage from "./table/EmptyEntregasMessage";
import { usePagination } from "@/hooks/usePagination";
import TablePagination from "@/components/ui/table-pagination";

interface EntregasTableProps {
  entregas: ListaProgramacaoEntrega[];
  onEntregaClick: (entrega: ListaProgramacaoEntrega) => void;
}

const EntregasTable: React.FC<EntregasTableProps> = ({ entregas, onEntregaClick }) => {
  const pagination = usePagination(entregas, { pageSize: 10 });

  if (entregas.length === 0) {
    return <EmptyEntregasMessage />;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <EntregaTableHeader />
          <TableBody>
            {pagination.paginatedData.map((entrega) => (
              <EntregaTableRow 
                key={entrega.id}
                entrega={entrega}
                onEntregaClick={onEntregaClick}
              />
            ))}
          </TableBody>
        </Table>
      </div>
      
      {entregas.length > 0 && (
        <TablePagination pagination={pagination} />
      )}
    </div>
  );
};

export default EntregasTable;
