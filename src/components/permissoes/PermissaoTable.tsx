
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
import { Permissao, PermissaoFilter } from "@/types/permissao";
import { usePagination } from "@/hooks/usePagination";
import TablePagination from "@/components/ui/table-pagination";

interface PermissaoTableProps {
  permissoes: Permissao[];
  isLoading: boolean;
  onEdit: (permissao: Permissao) => void;
  onDelete: (permissao: Permissao) => void;
  filters: PermissaoFilter;
  onFilterChange: (name: string, value: any) => void;
  onResetFilters: () => void;
}

const PermissaoTable: React.FC<PermissaoTableProps> = ({
  permissoes,
  isLoading,
  onEdit,
  onDelete,
  filters,
  onFilterChange,
  onResetFilters
}) => {
  const pagination = usePagination(permissoes, { pageSize: 10 });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onFilterChange(name, value);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="nome_permissao" className="text-sm font-medium">
              Nome da Permissão
            </label>
            <Input
              id="nome_permissao"
              name="nome_permissao"
              value={filters.nome_permissao || ""}
              onChange={handleInputChange}
              placeholder="Filtrar por nome"
              className="mt-1"
            />
          </div>
          <div>
            <label htmlFor="rota" className="text-sm font-medium">
              Rota
            </label>
            <Input
              id="rota"
              name="rota"
              value={filters.rota || ""}
              onChange={handleInputChange}
              placeholder="Filtrar por rota"
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
              <TableHead>Nome da Permissão</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Rota</TableHead>
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
                  Nenhuma permissão encontrada
                </TableCell>
              </TableRow>
            ) : (
              pagination.paginatedData.map((permissao) => (
                <TableRow key={permissao.id}>
                  <TableCell>{permissao.nome_permissao}</TableCell>
                  <TableCell>{permissao.descricao || "-"}</TableCell>
                  <TableCell>{permissao.rota || "-"}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(permissao)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(permissao)}
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
      
      {permissoes.length > 0 && (
        <TablePagination pagination={pagination} />
      )}
    </div>
  );
};

export default PermissaoTable;
