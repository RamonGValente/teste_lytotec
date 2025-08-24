
import React from "react";
import { ListaProgramacaoEntrega } from "@/types/programacaoEntrega";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Clipboard, TruckIcon, CheckCircle, Calendar, FileEdit, Eye } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatNumber } from "@/lib/utils";
import { formatBrazilianDateForDisplay } from "@/utils/timezoneUtils";
import { formatMassaDisplay } from "@/utils/massaConversionUtils";
import { usePagination } from "@/hooks/usePagination";
import TablePagination from "@/components/ui/table-pagination";

interface EntregasTableProps {
  entregas: ListaProgramacaoEntrega[];
  onEntregaClick: (entrega: ListaProgramacaoEntrega) => void;
}

const EntregasTable: React.FC<EntregasTableProps> = ({ entregas, onEntregaClick }) => {
  const pagination = usePagination(entregas, { pageSize: 10 });

  const statusColor = (status: string) => {
    switch (status) {
      case "Pendente": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Enviada": return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
      case "Entregue": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Cancelada": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  if (entregas.length === 0) {
    return (
      <div className="text-center py-6 flex flex-col items-center">
        <Calendar className="h-12 w-12 text-muted-foreground mb-2" />
        <p className="text-muted-foreground text-lg">
          Nenhuma entrega encontrada para esta data
        </p>
        <p className="text-muted-foreground text-sm mt-1">
          Tente selecionar outra data ou ajustar os filtros
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <TooltipProvider>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Centro de Custo</TableHead>
                <TableHead>Caminhão</TableHead>
                <TableHead>Quantidade (t)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagination.paginatedData.map((entrega) => (
                <TableRow key={entrega.id}>
                  <TableCell>{formatBrazilianDateForDisplay(entrega.data_entrega)}</TableCell>
                  <TableCell>{entrega.centro_custo_nome || entrega.logradouro}</TableCell>
                  <TableCell>
                    {entrega.caminhao ? 
                      `${entrega.caminhao.placa} - ${entrega.caminhao.modelo}` : 
                      "N/A"}
                  </TableCell>
                  <TableCell>
                    {formatMassaDisplay(entrega.quantidade_massa, 2)}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(entrega.status)}`}>
                      {entrega.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {entrega.status === "Pendente" ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => onEntregaClick(entrega)}
                            aria-label="Registrar carga"
                          >
                            <TruckIcon className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Registrar carga</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : entrega.status === "Enviada" ? (
                      <div className="flex justify-end">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => onEntregaClick(entrega)}
                              aria-label="Editar registro de carga"
                            >
                              <FileEdit className="h-4 w-4 text-amber-600" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar registro de carga</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    ) : entrega.status === "Entregue" ? (
                      <div className="flex justify-end gap-2" aria-label="Entrega concluída">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span><CheckCircle className="h-4 w-4 text-green-500" /></span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Entrega concluída</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEntregaClick(entrega)}
                              aria-label="Ver detalhes"
                            >
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Ver detalhes</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span><Clipboard className="h-4 w-4 text-muted-foreground" /></span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Registro cancelado</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TooltipProvider>
      
      {entregas.length > 0 && (
        <TablePagination pagination={pagination} />
      )}
    </div>
  );
};

export default EntregasTable;
