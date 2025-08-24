
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";

const EmptyEntregasMessage: React.FC = () => {
  return (
    <TableRow>
      <TableCell colSpan={8} className="h-24 text-center">
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-muted-foreground text-lg">
            Nenhuma entrega encontrada
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            Não há entregas programadas para esta data.
          </p>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default EmptyEntregasMessage;
