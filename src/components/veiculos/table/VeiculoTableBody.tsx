
import React from "react";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Veiculo } from "@/types/veiculo";
import { flexRender } from "@tanstack/react-table";
import type { ColumnDef, Row } from "@tanstack/react-table";

interface VeiculoTableBodyProps {
  isLoading: boolean;
  isError: boolean;
  veiculos: Veiculo[];
  columns: ColumnDef<Veiculo>[];
  rows: Row<Veiculo>[];
}

const VeiculoTableBody: React.FC<VeiculoTableBodyProps> = ({
  isLoading,
  isError,
  veiculos,
  columns,
  rows
}) => {
  if (isLoading) {
    return (
      <TableBody>
        {Array.from({ length: 5 }).map((_, index) => (
          <TableRow key={index}>
            {columns.map((column, i) => (
              <TableCell key={i}>
                <Skeleton className="h-4 w-full" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    );
  }

  if (isError) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={columns.length} className="text-center">
            Erro ao carregar os dados.
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  if (veiculos.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={columns.length} className="text-center">
            Nenhum veículo encontrado.
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {rows.map((row) => (
        <TableRow key={row.id}>
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
};

export default VeiculoTableBody;
