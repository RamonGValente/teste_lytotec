
import React, { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Veiculo } from "@/types/veiculo";
import TablePagination from "./TablePagination";
import VeiculoTableBody from "./table/VeiculoTableBody";
import { useVeiculoColumns } from "@/hooks/vehicles/useVeiculoColumns";

interface VeiculoTableProps {
  veiculos: Veiculo[];
  isLoading: boolean;
  isError: boolean;
  onEdit: (veiculo: Veiculo) => void;
  onView: (veiculo: Veiculo) => void;
  onDelete: (veiculo: Veiculo) => void;
}

const VeiculoTable: React.FC<VeiculoTableProps> = ({
  veiculos,
  isLoading,
  isError,
  onEdit,
  onView,
  onDelete,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const columns = useVeiculoColumns({ onView, onEdit, onDelete });

  const table = useReactTable({
    data: veiculos,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    state: {
      sorting,
      pagination,
    },
  });

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="w-[200px]">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <VeiculoTableBody 
            isLoading={isLoading}
            isError={isError}
            veiculos={veiculos}
            columns={columns}
            rows={table.getRowModel().rows}
          />
        </Table>
      </div>

      {!isLoading && !isError && veiculos.length > 0 && (
        <TablePagination table={table} />
      )}
    </div>
  );
};

export default VeiculoTable;
