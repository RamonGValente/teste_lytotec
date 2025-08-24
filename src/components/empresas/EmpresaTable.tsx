
import React from "react";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, Edit, Eye, Loader2, Trash, X } from "lucide-react";
import { Empresa } from "@/types/empresa";
import { usePagination } from "@/hooks/usePagination";
import TablePagination from "@/components/ui/table-pagination";

interface EmpresaTableProps {
  empresas: Empresa[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onEdit: (empresa: Empresa) => void;
  onView: (empresa: Empresa) => void;
  onDelete: (empresa: Empresa) => void;
}

const EmpresaTable: React.FC<EmpresaTableProps> = ({
  empresas,
  isLoading,
  isError,
  onEdit,
  onView,
  onDelete
}) => {
  const pagination = usePagination(empresas || [], { pageSize: 10 });

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Nome da Empresa</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex justify-center items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Carregando...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Erro ao carregar os dados. Tente novamente.
                  </TableCell>
                </TableRow>
              ) : empresas && empresas.length > 0 ? (
                pagination.paginatedData.map((empresa) => (
                  <TableRow key={empresa.id}>
                    <TableCell 
                      className="font-medium cursor-pointer hover:text-primary"
                      onClick={() => onView(empresa)}
                    >
                      {empresa.nome_empresa}
                    </TableCell>
                    <TableCell>{empresa.cnpj}</TableCell>
                    <TableCell>{empresa.telefone || "Não informado"}</TableCell>
                    <TableCell>
                      {empresa.situacao === 'Ativa' ? (
                        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                          <Check className="mr-1 h-3 w-3" />
                          Ativa
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                          <X className="mr-1 h-3 w-3" />
                          Inativa
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(empresa)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onView(empresa)}
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(empresa)}
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
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Nenhuma empresa encontrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {empresas && empresas.length > 0 && (
          <div className="mt-4">
            <TablePagination pagination={pagination} />
          </div>
        )}
      </div>
    </div>
  );
};

export default EmpresaTable;
