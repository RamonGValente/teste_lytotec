
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ColaboradorCard from "./ColaboradorCard";
import { UseFormReturn } from "react-hook-form";

interface ColaboradoresSectionProps {
  form: UseFormReturn<any>;
  equipeId: string;
  isLoadingMembers: boolean;
  equipeMembers: any[];
  onAvaliarColaborador?: (colaboradorId: string, nomeColaborador: string, equipeId: string) => void;
  avaliacoesCompletas: Set<string>;
  avaliacaoStatusMap: Map<string, {canCreate: boolean, daysRemaining: number}>;
  alertMessage: {
    colaboradorId: string;
    message: string;
    type: 'error' | 'info';
  } | null;
  isEditing: boolean;
}

const ColaboradoresSection: React.FC<ColaboradoresSectionProps> = ({
  form,
  equipeId,
  isLoadingMembers,
  equipeMembers,
  onAvaliarColaborador,
  avaliacoesCompletas,
  avaliacaoStatusMap,
  alertMessage,
  isEditing
}) => {
  // Helper function to get evaluation status for a collaborator
  const getAvaliacaoStatus = (colaboradorId: string | undefined) => {
    if (!colaboradorId) return { canEvaluate: false, daysRemaining: 0, isEvaluated: false };
    
    const isEvaluated = avaliacoesCompletas.has(colaboradorId);
    const avaliacaoStatus = avaliacaoStatusMap.get(colaboradorId);
    const canEvaluate = avaliacaoStatus?.canCreate ?? true;
    const daysRemaining = avaliacaoStatus?.daysRemaining ?? 0;
    
    return { canEvaluate, daysRemaining, isEvaluated };
  };

  return (
    <div>
      <h3 className="text-sm font-medium mb-4">Colaboradores</h3>
      
      {isLoadingMembers ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : equipeMembers.length > 0 ? (
        <ScrollArea className="h-[300px] border rounded-md p-4">
          <div className="space-y-5">
            {form.getValues().colaboradores.map((colaborador: any, index: number) => {
              const { canEvaluate, daysRemaining, isEvaluated } = getAvaliacaoStatus(colaborador.colaborador_id);
              
              return (
                <ColaboradorCard
                  key={index}
                  colaborador={colaborador}
                  index={index}
                  form={form}
                  onAvaliarColaborador={onAvaliarColaborador}
                  equipeId={equipeId}
                  isEvaluated={isEvaluated}
                  canEvaluate={canEvaluate}
                  daysRemaining={daysRemaining}
                  alertMessage={alertMessage}
                  isEditing={isEditing}
                />
              );
            })}
          </div>
        </ScrollArea>
      ) : equipeId ? (
        <div className="text-center py-6 text-muted-foreground">
          Esta equipe não possui membros.
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          Selecione uma equipe para ver os colaboradores.
        </div>
      )}
    </div>
  );
};

export default ColaboradoresSection;
