
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Trash } from "lucide-react";
import { Usina } from "@/types/usina";
import { usePagination } from "@/hooks/usePagination";
import TablePagination from "@/components/ui/table-pagination";

interface UsinaTableProps {
  usinas: Usina[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onEdit: (usina: Usina) => void;
  onView: (usina: Usina) => void;
  onDelete: (usina: Usina) => void;
}

const UsinaTable: React.FC<UsinaTableProps> = ({
  usinas,
  isLoading,
  isError,
  onEdit,
  onView,
  onDelete,
}) => {
  const pagination = usePagination(usinas || [], { pageSize: 10 });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="text-center text-destructive">
          <p className="text-lg font-medium">Erro ao carregar dados</p>
          <p className="text-sm text-muted-foreground">Tente novamente mais tarde.</p>
        </div>
      </div>
    );
  }

  if (!usinas || usinas.length === 0) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="text-center">
          <p className="text-lg font-medium">Nenhuma usina encontrada</p>
          <p className="text-sm text-muted-foreground">Tente ajustar os filtros ou cadastre uma nova usina.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome da Usina</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagination.paginatedData.map((usina) => (
              <TableRow key={usina.id}>
                <TableCell 
                  className="font-medium cursor-pointer hover:text-primary"
                  onClick={() => onView(usina)}
                >
                  {usina.nome_usina}
                </TableCell>
                <TableCell>{usina.endereco || 'N/A'}</TableCell>
                <TableCell>{usina.telefone || 'N/A'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onView(usina)}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Visualizar</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(usina)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(usina)}>
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Excluir</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {usinas.length > 0 && (
        <TablePagination pagination={pagination} />
      )}
    </div>
  );
};

export default UsinaTable;
