
import React from "react";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Loader2, Trash } from "lucide-react";
import { Departamento } from "@/types/departamento";
import { usePagination } from "@/hooks/usePagination";
import TablePagination from "@/components/ui/table-pagination";

interface DepartamentoTableProps {
  departamentos: Departamento[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onEdit: (departamento: Departamento) => void;
  onView: (departamento: Departamento) => void;
  onDelete: (departamento: Departamento) => void;
}

const DepartamentoTable: React.FC<DepartamentoTableProps> = ({
  departamentos,
  isLoading,
  isError,
  onEdit,
  onView,
  onDelete
}) => {
  const pagination = usePagination(departamentos || [], { pageSize: 10 });

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Empresa</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    <div className="flex justify-center items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Carregando...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                    Erro ao carregar os dados. Tente novamente.
                  </TableCell>
                </TableRow>
              ) : departamentos && departamentos.length > 0 ? (
                pagination.paginatedData.map((departamento) => (
                  <TableRow key={departamento.id}>
                    <TableCell>{departamento.empresa?.nome_empresa || 'N/A'}</TableCell>
                    <TableCell 
                      className="font-medium cursor-pointer hover:text-primary"
                      onClick={() => onView(departamento)}
                    >
                      {departamento.nome_departamento}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(departamento)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onView(departamento)}
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(departamento)}
                          title="Excluir"
                          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                    Nenhum departamento encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {departamentos && departamentos.length > 0 && (
          <div className="mt-4">
            <TablePagination pagination={pagination} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartamentoTable;
