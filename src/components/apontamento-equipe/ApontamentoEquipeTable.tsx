
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileEdit, Eye, Trash2, Users, Star } from "lucide-react";
import { ApontamentoEquipe } from "@/types/apontamentoEquipe";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate } from "@/lib/utils";
import { usePagination } from "@/hooks/usePagination";
import TablePagination from "@/components/ui/table-pagination";

interface ApontamentoEquipeSummary {
  equipe_id: string;
  equipe_nome: string;
  data_registro: string;
  encarregado: string;
  apontador: string;
  presenca_percentage: number;
  total_colaboradores: number;
  colaboradores: ApontamentoEquipe[];
}

interface ApontamentoEquipeTableProps {
  apontamentos: ApontamentoEquipeSummary[];
  onViewDetails: (apontamento: ApontamentoEquipe) => void;
  onEdit: (apontamento: ApontamentoEquipe) => void;
  onDelete: (apontamento: ApontamentoEquipe) => void;
  onViewEquipe: (equipeId: string) => void;
  onAvaliarColaborador?: (colaboradorId: string, nomeColaborador: string, equipeId: string) => void;
  avaliacaoStatusMap?: Map<string, {canCreate: boolean, daysRemaining: number}>;
}

const ApontamentoEquipeTable: React.FC<ApontamentoEquipeTableProps> = ({
  apontamentos,
  onViewDetails,
  onEdit,
  onDelete,
  onViewEquipe,
  onAvaliarColaborador,
  avaliacaoStatusMap = new Map()
}) => {
  const pagination = usePagination(apontamentos, { pageSize: 10 });

  if (apontamentos.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        Nenhum apontamento encontrado.
      </div>
    );
  }

  // Mobile view - cards
  const MobileCards = () => {
    return (
      <div className="space-y-4 md:hidden">
        {pagination.paginatedData.map((apontamento) => {
          // Choose first collaborator for the row actions
          const firstColaborador = apontamento.colaboradores[0];
          const colaboradorId = firstColaborador.colaborador_id || '';
          
          // Check evaluation status for this collaborator
          const avaliacaoStatus = avaliacaoStatusMap.get(colaboradorId);
          const canCreateAvaliacao = avaliacaoStatus?.canCreate ?? true;
          const daysRemaining = avaliacaoStatus?.daysRemaining ?? 0;
          
          return (
            <Card key={`${apontamento.equipe_id}-${apontamento.data_registro}`} 
              className="p-4 shadow-sm bg-white border-slate-200">
              <div className="space-y-2.5 text-sm">
                <div className="flex flex-col xs:flex-row xs:justify-between gap-1.5">
                  <div className="text-gray-700">
                    <span className="font-medium">Data:</span>{" "}
                    {formatDate(apontamento.data_registro)}
                  </div>
                  
                  <div>
                    <span 
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        apontamento.presenca_percentage === 100 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : apontamento.presenca_percentage >= 75
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          : apontamento.presenca_percentage >= 50
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                      }`}
                    >
                      {apontamento.presenca_percentage}%
                    </span>
                  </div>
                </div>

                <div className="min-w-0 truncate max-w-full">
                  <Button 
                    variant="link" 
                    className="p-0 h-auto font-normal text-foreground truncate max-w-full whitespace-nowrap overflow-hidden text-ellipsis"
                    onClick={() => onViewEquipe(apontamento.equipe_id)}
                  >
                    <span className="font-medium">Equipe:</span>{" "}
                    {apontamento.equipe_nome}
                  </Button>
                </div>

                <div className="flex justify-between items-center pt-2 border-t mt-1">
                  <div className="text-xs text-muted-foreground">
                    {apontamento.total_colaboradores} colaborador(es)
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewDetails(firstColaborador)}
                      aria-label="Ver detalhes"
                      title="Ver detalhes"
                      className="h-8 w-8"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(firstColaborador)}
                      aria-label="Editar apontamento"
                      title="Editar apontamento"
                      className="h-8 w-8"
                    >
                      <FileEdit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(firstColaborador)}
                      aria-label="Excluir apontamento"
                      title="Excluir apontamento"
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {onAvaliarColaborador && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onAvaliarColaborador(
                                colaboradorId,
                                firstColaborador.nome_colaborador,
                                apontamento.equipe_id
                              )}
                              aria-label="Avaliar desempenho"
                              disabled={!canCreateAvaliacao}
                              className={`h-8 w-8 ${!canCreateAvaliacao ? "opacity-50" : ""}`}
                            >
                              <Star className="h-4 w-4 text-amber-500" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {canCreateAvaliacao 
                              ? "Avaliar desempenho" 
                              : `Próxima avaliação possível em ${daysRemaining} dia(s).`}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  // Desktop view - table
  const DesktopTable = () => {
    return (
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Encarregado</TableHead>
              <TableHead>Apontador</TableHead>
              <TableHead>Equipe</TableHead>
              <TableHead>Presença (%)</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagination.paginatedData.map((apontamento) => {
              // Choose first collaborator for the row actions
              const firstColaborador = apontamento.colaboradores[0];
              const colaboradorId = firstColaborador.colaborador_id || '';
              
              // Check evaluation status for this collaborator
              const avaliacaoStatus = avaliacaoStatusMap.get(colaboradorId);
              const canCreateAvaliacao = avaliacaoStatus?.canCreate ?? true;
              const daysRemaining = avaliacaoStatus?.daysRemaining ?? 0;
              
              return (
                <TableRow key={`${apontamento.equipe_id}-${apontamento.data_registro}`}>
                  <TableCell>
                    {formatDate(apontamento.data_registro)}
                  </TableCell>
                  <TableCell>{apontamento.encarregado}</TableCell>
                  <TableCell>{apontamento.apontador}</TableCell>
                  <TableCell>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto font-normal text-foreground"
                      onClick={() => onViewEquipe(apontamento.equipe_id)}
                    >
                      {apontamento.equipe_nome}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <span 
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        apontamento.presenca_percentage === 100 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : apontamento.presenca_percentage >= 75
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          : apontamento.presenca_percentage >= 50
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                      }`}
                    >
                      {apontamento.presenca_percentage}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewDetails(firstColaborador)}
                        aria-label="Ver detalhes"
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(firstColaborador)}
                        aria-label="Editar apontamento"
                        title="Editar apontamento"
                      >
                        <FileEdit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(firstColaborador)}
                        aria-label="Excluir apontamento"
                        title="Excluir apontamento"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {onAvaliarColaborador && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onAvaliarColaborador(
                                  colaboradorId,
                                  firstColaborador.nome_colaborador,
                                  apontamento.equipe_id
                                )}
                                aria-label="Avaliar desempenho"
                                disabled={!canCreateAvaliacao}
                                className={!canCreateAvaliacao ? "opacity-50" : ""}
                              >
                                <Star className="h-4 w-4 text-amber-500" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {canCreateAvaliacao 
                                ? "Avaliar desempenho" 
                                : `Próxima avaliação possível em ${daysRemaining} dia(s).`}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <MobileCards />
      <DesktopTable />
      
      {apontamentos.length > 0 && (
        <TablePagination pagination={pagination} />
      )}
    </div>
  );
};

export default ApontamentoEquipeTable;
