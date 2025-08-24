
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Trash2 } from "lucide-react";
import { CentroCusto } from "@/types/centroCusto";
import { Badge } from "@/components/ui/badge";
import { usePagination } from "@/hooks/usePagination";
import TablePagination from "@/components/ui/table-pagination";

interface CentroCustoDesktopTableProps {
  centrosCusto: CentroCusto[];
  onEdit: (centroCusto: CentroCusto) => void;
  onView: (centroCusto: CentroCusto) => void;
  onDelete: (centroCusto: CentroCusto) => void;
}

const CentroCustoDesktopTable: React.FC<CentroCustoDesktopTableProps> = ({
  centrosCusto,
  onEdit,
  onView,
  onDelete
}) => {
  const pagination = usePagination(centrosCusto, { pageSize: 10 });

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nome do Centro de Custo</TableHead>
              <TableHead>CNPJ Vinculado</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagination.paginatedData.map((centroCusto) => (
              <TableRow key={centroCusto.id}>
                <TableCell>
                  <Badge variant="outline" className="font-mono">
                    {centroCusto.codigo_centro_custo}
                  </Badge>
                </TableCell>
                <TableCell 
                  className="font-medium cursor-pointer hover:text-primary"
                  onClick={() => onView(centroCusto)}
                >
                  {centroCusto.nome_centro_custo}
                </TableCell>
                <TableCell>{centroCusto.cnpj_vinculado || "Não informado"}</TableCell>
                <TableCell>{centroCusto.telefone || "Não informado"}</TableCell>
                <TableCell>
                  <Badge 
                    variant={centroCusto.situacao === "Ativo" ? "default" : "secondary"}
                    className={centroCusto.situacao === "Ativo" ? "bg-green-100 text-green-800" : ""}
                  >
                    {centroCusto.situacao}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(centroCusto)}
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(centroCusto)}
                      title="Visualizar"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(centroCusto)}
                      title="Excluir"
                      className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {centrosCusto.length > 0 && (
        <TablePagination pagination={pagination} />
      )}
    </div>
  );
};

export default CentroCustoDesktopTable;
