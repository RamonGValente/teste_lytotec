
import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2, Droplets, Clock } from "lucide-react";
import { ApontamentoCaminhao } from "@/services/apontamentoCaminhoesService";
import { cn } from "@/lib/utils";
import { formatBrazilianDateForDisplay } from "@/utils/timezoneUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePagination } from "@/hooks/usePagination";
import TablePagination from "@/components/ui/table-pagination";

interface ApontamentoCaminhoesTableProps {
  apontamentos: ApontamentoCaminhao[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

const ApontamentoCaminhoesTable: React.FC<ApontamentoCaminhoesTableProps> = ({
  apontamentos,
  onView,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const isMobile = useIsMobile();
  const pagination = usePagination(apontamentos, { pageSize: 10 });

  // Function to format date consistently using formatBrazilianDateForDisplay
  const formatApontamentoDate = (dateString: string) => {
    try {
      return formatBrazilianDateForDisplay(dateString);
    } catch (error) {
      console.error("Error formatting apontamento date:", error, "for date:", dateString);
      return dateString;
    }
  };

  // Empty state component
  const EmptyState = () => (
    <TableRow>
      <TableCell 
        colSpan={isMobile ? 3 : 7} 
        className="h-24 text-center"
      >
        <div className="flex flex-col items-center justify-center py-6">
          <p className="text-gray-500 mb-1">Nenhum registro encontrado.</p>
          <p className="text-sm text-gray-400">
            {isMobile ? "Tente ajustar os filtros avançados." : "Tente ajustar os filtros de busca."}
          </p>
        </div>
      </TableCell>
    </TableRow>
  );

  // Loading state component
  const LoadingState = () => (
    <TableRow>
      <TableCell 
        colSpan={isMobile ? 3 : 7} 
        className="h-24 text-center"
      >
        Carregando...
      </TableCell>
    </TableRow>
  );

  // Mobile card view
  if (isMobile) {
    return (
      <div className="space-y-4">
        {isLoading ? (
          <div className="rounded-lg border p-4 text-center">Carregando...</div>
        ) : pagination.paginatedData.length === 0 ? (
          <div className="rounded-lg border p-6 text-center">
            <p className="text-gray-500 mb-1">Nenhum registro encontrado.</p>
            <p className="text-sm text-gray-400">Tente ajustar os filtros avançados.</p>
          </div>
        ) : (
          pagination.paginatedData.map((apontamento) => (
            <div 
              key={apontamento.id} 
              className="rounded-lg border shadow-sm p-4 bg-white"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="font-medium">
                    {apontamento.data
                      ? formatApontamentoDate(apontamento.data)
                      : "-"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {apontamento.nome_operador || "Operador não especificado"}
                  </div>
                </div>
                
                <div className="font-semibold text-gray-800">
                  {apontamento.veiculo_identificacao || "-"}
                </div>
                
                <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 pt-2 text-sm">
                  <div className="flex items-center">
                    <Droplets className="h-4 w-4 text-blue-500 mr-1.5" />
                    <span className="text-gray-700">
                      {apontamento.abastecimento ? `${apontamento.abastecimento}L` : "-"}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-green-500 mr-1.5" />
                    <span className="text-gray-700">
                      {apontamento.horimetro_inicial || "-"}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-amber-500 mr-1.5" />
                    <span className="text-gray-700">
                      {apontamento.horimetro_final || "-"}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-1 pt-2 border-t mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(apontamento.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(apontamento.id)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(apontamento.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
        
        {apontamentos.length > 0 && (
          <TablePagination pagination={pagination} />
        )}
      </div>
    );
  }

  // Desktop table view
  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Data</TableHead>
              <TableHead className="min-w-[200px]">Caminhão/Equipamento</TableHead>
              <TableHead className="min-w-[150px]">Operador</TableHead>
              <TableHead className="text-center">Abastecimento (L)</TableHead>
              <TableHead className="text-center">Horímetro Inicial</TableHead>
              <TableHead className="text-center">Horímetro Final</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <LoadingState />
            ) : pagination.paginatedData.length === 0 ? (
              <EmptyState />
            ) : (
              pagination.paginatedData.map((apontamento) => (
                <TableRow key={apontamento.id}>
                  <TableCell className="font-medium">
                    {apontamento.data
                      ? formatApontamentoDate(apontamento.data)
                      : "-"}
                  </TableCell>
                  <TableCell>{apontamento.veiculo_identificacao || "-"}</TableCell>
                  <TableCell>{apontamento.nome_operador || "-"}</TableCell>
                  <TableCell className="text-center">
                    {apontamento.abastecimento || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {apontamento.horimetro_inicial || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {apontamento.horimetro_final || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(apontamento.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(apontamento.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(apontamento.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {apontamentos.length > 0 && (
        <TablePagination pagination={pagination} />
      )}
    </div>
  );
};

export default ApontamentoCaminhoesTable;
