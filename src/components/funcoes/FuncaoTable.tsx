
import React from "react";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Loader2, Trash } from "lucide-react";
import { Funcao } from "@/types/funcao";
import { usePagination } from "@/hooks/usePagination";
import TablePagination from "@/components/ui/table-pagination";

interface FuncaoTableProps {
  funcoes: Funcao[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onEdit: (funcao: Funcao) => void;
  onView: (funcao: Funcao) => void;
  onDelete: (funcao: Funcao) => void;
}

const FuncaoTable: React.FC<FuncaoTableProps> = ({
  funcoes,
  isLoading,
  isError,
  onEdit,
  onView,
  onDelete
}) => {
  const pagination = usePagination(funcoes || [], { pageSize: 10 });

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-full">Nome da Função</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={2} className="h-24 text-center">
                    <div className="flex justify-center items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Carregando...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                    Erro ao carregar os dados. Tente novamente.
                  </TableCell>
                </TableRow>
              ) : funcoes && funcoes.length > 0 ? (
                pagination.paginatedData.map((funcao) => (
                  <TableRow key={funcao.id}>
                    <TableCell 
                      className="font-medium cursor-pointer hover:text-primary"
                      onClick={() => onView(funcao)}
                    >
                      {funcao.nome_funcao}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(funcao)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onView(funcao)}
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(funcao)}
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
                  <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                    Nenhuma função encontrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {funcoes && funcoes.length > 0 && (
          <div className="mt-4">
            <TablePagination pagination={pagination} />
          </div>
        )}
      </div>
    </div>
  );
};

export default FuncaoTable;
