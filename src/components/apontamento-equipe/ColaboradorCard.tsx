
import React from "react";
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { User, Clock, ThumbsUp, CheckCircle2, Lock, Star, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";

interface ColaboradorCardProps {
  colaborador: {
    colaborador_id?: string;
    nome_colaborador: string;
    hora_inicio?: string;
    hora_fim?: string;
    presente: boolean;
  };
  index: number;
  form: UseFormReturn<any>;
  onAvaliarColaborador?: (colaboradorId: string, nomeColaborador: string, equipeId: string) => void;
  equipeId: string;
  isEvaluated: boolean;
  canEvaluate: boolean;
  daysRemaining: number;
  alertMessage: {
    colaboradorId: string;
    message: string;
    type: 'error' | 'info';
  } | null;
  isEditing: boolean;
}

const ColaboradorCard: React.FC<ColaboradorCardProps> = ({
  colaborador,
  index,
  form,
  onAvaliarColaborador,
  equipeId,
  isEvaluated,
  canEvaluate,
  daysRemaining,
  alertMessage,
  isEditing
}) => {
  const colaboradorId = colaborador.colaborador_id;
  const isAlertShown = alertMessage && alertMessage.colaboradorId === colaboradorId;

  const handleAvaliacaoClick = (e: React.MouseEvent) => {
    // Previne a propagação do evento para evitar que o form seja submetido
    e.preventDefault();
    e.stopPropagation();
    
    if (!colaboradorId) return;
    if (onAvaliarColaborador) {
      onAvaliarColaborador(colaboradorId, colaborador.nome_colaborador, equipeId);
    }
  };

  return (
    <div 
      className={cn(
        "p-4 rounded-md shadow-sm border", 
        isEvaluated ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800" : 
        !canEvaluate ? "bg-gray-50 border-gray-200 dark:bg-gray-800/20 dark:border-gray-800" :
        "bg-accent/20 border-accent/30"
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <span className="text-base font-bold">{colaborador.nome_colaborador}</span>
          {isEvaluated && (
            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 rounded-full flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Avaliado
            </span>
          )}
          {!isEvaluated && !canEvaluate && (
            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 rounded-full flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Aguardando período ({daysRemaining} dias)
            </span>
          )}
        </div>
        {onAvaliarColaborador && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isEvaluated ? "ghost" : "secondary"}
                  size="sm"
                  onClick={handleAvaliacaoClick}
                  type="button" // Importante: defina como "button" para evitar submissão do form
                  aria-label="Avaliar desempenho"
                  className={cn(
                    "min-w-[100px]",
                    isEvaluated 
                      ? "text-green-600 hover:text-green-700 hover:bg-green-100 bg-green-100 hover:bg-green-200" 
                      : !canEvaluate 
                        ? "bg-gray-100 text-gray-500" 
                        : "bg-amber-100 hover:bg-amber-200 text-amber-800"
                  )}
                >
                  {isEvaluated ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
                      Avaliado
                    </>
                  ) : !canEvaluate ? (
                    <>
                      <Lock className="h-4 w-4 mr-1 text-gray-500" />
                      Bloqueado
                    </>
                  ) : (
                    <>
                      <Star className="h-4 w-4 mr-1 text-amber-500" />
                      Avaliar
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isEvaluated 
                  ? "Colaborador já avaliado" 
                  : canEvaluate 
                    ? "Avaliar desempenho" 
                    : `Próxima avaliação disponível em ${daysRemaining} dia(s).`}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      {isAlertShown && (
        <Alert variant={alertMessage?.type === 'error' ? "destructive" : "default"} className="mb-3">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{alertMessage?.message}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
        <FormField
          control={form.control}
          name={`colaboradores.${index}.presente`}
          render={({ field }) => (
            <FormItem className="flex items-center space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="w-5 h-5"
                  disabled={false}
                />
              </FormControl>
              <span className="text-sm font-medium">Presente</span>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name={`colaboradores.${index}.hora_inicio`}
          render={({ field }) => {
            const presente = form.getValues().colaboradores[index]?.presente;
            
            return (
              <FormItem>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <FormControl>
                    <Input
                      {...field}
                      type="time"
                      placeholder="Hora início"
                      disabled={!presente}
                      className={!presente ? "opacity-50" : ""}
                    />
                  </FormControl>
                </div>
              </FormItem>
            );
          }}
        />
        
        <FormField
          control={form.control}
          name={`colaboradores.${index}.hora_fim`}
          render={({ field }) => {
            const presente = form.getValues().colaboradores[index]?.presente;
            
            return (
              <FormItem>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <FormControl>
                    <Input
                      {...field}
                      type="time"
                      placeholder="Hora fim"
                      disabled={!presente}
                      className={!presente ? "opacity-50" : ""}
                    />
                  </FormControl>
                </div>
              </FormItem>
            );
          }}
        />
      </div>
    </div>
  );
};

export default ColaboradorCard;
