
import React from "react";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FuncaoPermissao, FuncaoPermissaoFilter } from "@/types/permissao";
import { usePagination } from "@/hooks/usePagination";
import TablePagination from "@/components/ui/table-pagination";

interface FuncaoPermissaoTableProps {
  funcoesPermissao: FuncaoPermissao[];
  isLoading: boolean;
  onEdit: (funcaoPermissao: FuncaoPermissao) => void;
  onDelete: (funcaoPermissao: FuncaoPermissao) => void;
  filters: FuncaoPermissaoFilter;
  onFilterChange: (name: string, value: any) => void;
  onResetFilters: () => void;
}

const FuncaoPermissaoTable: React.FC<FuncaoPermissaoTableProps> = ({
  funcoesPermissao,
  isLoading,
  onEdit,
  onDelete,
  filters,
  onFilterChange,
  onResetFilters
}) => {
  const pagination = usePagination(funcoesPermissao, { pageSize: 10 });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onFilterChange(name, value);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="nome_funcao" className="text-sm font-medium">
              Nome da Função
            </label>
            <Input
              id="nome_funcao"
              name="nome_funcao"
              value={filters.nome_funcao || ""}
              onChange={handleInputChange}
              placeholder="Filtrar por nome da função"
              className="mt-1"
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={onResetFilters}
              className="w-full"
            >
              Limpar Filtros
            </Button>
          </div>
        </div>
      </Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome da Função</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Permissões</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : pagination.paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  Nenhuma função encontrada
                </TableCell>
              </TableRow>
            ) : (
              pagination.paginatedData.map((funcaoPermissao) => (
                <TableRow key={funcaoPermissao.id}>
                  <TableCell>{funcaoPermissao.nome_funcao}</TableCell>
                  <TableCell>{funcaoPermissao.descricao || "-"}</TableCell>
                  <TableCell>
                    {funcaoPermissao.permissoes.length} permissões
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(funcaoPermissao)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(funcaoPermissao)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Excluir</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {funcoesPermissao.length > 0 && (
        <TablePagination pagination={pagination} />
      )}
    </div>
  );
};

export default FuncaoPermissaoTable;
