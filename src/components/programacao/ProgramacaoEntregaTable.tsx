
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
import { PencilIcon, Eye, Trash2 } from "lucide-react";
import { ProgramacaoEntrega } from "@/types/programacaoEntrega";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { formatBrazilianDateForDisplay } from "@/utils/timezoneUtils";
import { usePagination } from "@/hooks/usePagination";
import TablePagination from "@/components/ui/table-pagination";

interface ProgramacaoEntregaTableProps {
  programacoes: ProgramacaoEntrega[];
  isLoading: boolean;
  onView: (programacao: ProgramacaoEntrega) => void;
  onEdit: (programacao: ProgramacaoEntrega) => void;
  onDelete: (programacao: ProgramacaoEntrega) => void;
}

const ProgramacaoEntregaTable: React.FC<ProgramacaoEntregaTableProps> = ({
  programacoes,
  isLoading,
  onView,
  onEdit,
  onDelete,
}) => {
  const pagination = usePagination(programacoes, { pageSize: 10 });

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (programacoes.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg">
        <p className="text-muted-foreground">Nenhuma programação de entrega encontrada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número da Requisição</TableHead>
                <TableHead>Centro de Custo</TableHead>
                <TableHead>Data de Entrega</TableHead>
                <TableHead className="text-right w-[120px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagination.paginatedData.map((programacao) => (
                <TableRow key={programacao.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Button 
                      variant="link" 
                      asChild 
                      className="p-0 h-auto font-medium text-primary hover:text-primary/80"
                    >
                      <Link to={`/requisicoes/cadastro?id=${programacao.requisicao_id}`}>
                        {programacao.requisicao?.numero || 'N/A'}
                      </Link>
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {programacao.centro_custo?.nome_centro_custo || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {programacao.data_entrega
                      ? formatBrazilianDateForDisplay(programacao.data_entrega)
                      : 'N/A'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(programacao)}
                        title="Visualizar"
                        className="h-8 w-8"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(programacao)}
                        title="Editar"
                        className="h-8 w-8"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(programacao)}
                        title="Excluir"
                        className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
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
      </div>
      
      {programacoes.length > 0 && (
        <TablePagination pagination={pagination} />
      )}
    </div>
  );
};

export default ProgramacaoEntregaTable;
