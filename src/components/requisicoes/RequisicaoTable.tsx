
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Requisicao } from "@/types/requisicao";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePagination } from "@/hooks/usePagination";
import TablePagination from "@/components/ui/table-pagination";
import { formatBrazilianDateForDisplay } from "@/utils/timezoneUtils";

interface RequisicaoTableProps {
  requisicoes: any[];
  isLoading: boolean;
  isError: boolean;
  onEdit: (requisicao: Requisicao) => void;
  onView: (requisicao: Requisicao) => void;
  onDelete: (requisicao: Requisicao) => void;
}

const RequisicaoTable: React.FC<RequisicaoTableProps> = ({
  requisicoes,
  isLoading,
  isError,
  onEdit,
  onView,
  onDelete
}) => {
  const isMobile = useIsMobile();
  const pagination = usePagination(requisicoes, { pageSize: 10 });
  
  if (isError) {
    return <div className="rounded-md border border-destructive p-8 text-center">
        <p className="text-destructive">
          Ocorreu um erro ao carregar as requisições. Por favor, tente novamente.
        </p>
      </div>;
  }
  
  if (isLoading) {
    return <div className="rounded-md border p-4">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="space-y-2">
          {Array.from({
          length: 5
        }).map((_, i) => <div key={i} className="flex justify-between items-center">
              <Skeleton className="h-8 w-full" />
            </div>)}
        </div>
      </div>;
  }
  
  if (requisicoes.length === 0) {
    return <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground">
          Nenhuma requisição encontrada. Crie uma nova requisição para começar.
        </p>
      </div>;
  }

  // Renderização para mobile - Cards em vez de tabela
  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="space-y-4">
          {pagination.paginatedData.map(requisicao => <div key={requisicao.id} className="rounded-md border p-4 bg-card">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-lg cursor-pointer hover:underline" onClick={() => onView(requisicao)}>
                  {requisicao.numero}
                </h3>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => onView(requisicao)} title="Visualizar" className="h-8 w-8 p-0">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onEdit(requisicao)} title="Editar" className="h-8 w-8 p-0">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onDelete(requisicao)} title="Excluir" className="h-8 w-8 p-0">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-1 text-sm">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Centro de Custo:</span>
                  <span>{requisicao.centro_custo?.nome_centro_custo || '-'}</span>
                </div>
                
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Engenheiro:</span>
                  <span>{requisicao.engenheiro?.nome_completo || '-'}</span>
                </div>
                
                <div className="flex justify-between pb-1">
                  <span className="text-muted-foreground">Data:</span>
                  <span>
                    {formatBrazilianDateForDisplay(requisicao.data_requisicao)}
                  </span>
                </div>
              </div>
            </div>)}
        </div>
        
        {requisicoes.length > 0 && (
          <TablePagination pagination={pagination} />
        )}
      </div>
    );
  }

  // Renderização para desktop - Tabela tradicional
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Centro de Custo</TableHead>
              <TableHead>Engenheiro Responsável</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="w-[150px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagination.paginatedData.map(requisicao => <TableRow key={requisicao.id}>
                <TableCell className="font-medium cursor-pointer hover:underline" onClick={() => onView(requisicao)}>
                  {requisicao.numero}
                </TableCell>
                <TableCell>{requisicao.centro_custo?.nome_centro_custo || '-'}</TableCell>
                <TableCell>{requisicao.engenheiro?.nome_completo || '-'}</TableCell>
                <TableCell>
                  {formatBrazilianDateForDisplay(requisicao.data_requisicao)}
                </TableCell>
                <TableCell className="text-right space-x-1 py-0 px-0">
                  <Button variant="outline" size="icon" onClick={() => onView(requisicao)} title="Visualizar">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => onEdit(requisicao)} title="Editar">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => onDelete(requisicao)} title="Excluir">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>)}
          </TableBody>
        </Table>
      </div>
      
      {requisicoes.length > 0 && (
        <TablePagination pagination={pagination} />
      )}
    </div>
  );
};

export default RequisicaoTable;
