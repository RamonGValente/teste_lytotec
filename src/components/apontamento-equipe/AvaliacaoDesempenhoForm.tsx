
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AvaliacaoEquipeFormValues } from "@/types/apontamentoEquipe";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, Check, X, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Rating labels and colors
const ratingLabels = [
  { value: 0, label: "Muito Ruim", color: "bg-red-800 text-white", icon: <ThumbsDown className="w-4 h-4" /> },
  { value: 1, label: "Ruim", color: "bg-red-500 text-white", icon: <ThumbsDown className="w-4 h-4" /> },
  { value: 2, label: "Regular", color: "bg-orange-500 text-white", icon: <X className="w-4 h-4" /> },
  { value: 3, label: "Satisfatório", color: "bg-amber-400 text-amber-900", icon: <Check className="w-4 h-4" /> },
  { value: 4, label: "Bom", color: "bg-green-400 text-green-900", icon: <ThumbsUp className="w-4 h-4" /> },
  { value: 5, label: "Excelente", color: "bg-green-600 text-white", icon: <ThumbsUp className="w-4 h-4" /> },
];

// Form schema
const formSchema = z.object({
  colaborador_id: z.string({
    required_error: "Selecione um colaborador",
  }),
  equipe_id: z.string({
    required_error: "Selecione uma equipe",
  }),
  data_avaliacao: z.string(),
  competencia_tecnica: z.number().min(0).max(5),
  comunicacao: z.number().min(0).max(5),
  trabalho_em_equipe: z.number().min(0).max(5),
  proatividade: z.number().min(0).max(5),
  pontualidade: z.number().min(0).max(5),
  organizacao: z.number().min(0).max(5),
  anotacoes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AvaliacaoDesempenhoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AvaliacaoEquipeFormValues) => void;
  colaboradorId: string;
  equipeId: string;
  colaboradorNome: string;
  lastEvaluation?: {
    data_avaliacao: string;
    competencia_tecnica: number;
    comunicacao: number;
    trabalho_em_equipe: number;
    proatividade: number;
    pontualidade: number;
    organizacao: number;
    anotacoes?: string;
  };
  isLoading: boolean;
  canCreate: boolean;
  daysRemaining?: number;
}

const AvaliacaoDesempenhoForm: React.FC<AvaliacaoDesempenhoFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  colaboradorId,
  equipeId,
  colaboradorNome,
  lastEvaluation,
  isLoading,
  canCreate,
  daysRemaining = 0,
}) => {
  const { toast } = useToast();
  const [showAlert, setShowAlert] = useState(false);
  
  // Calculate average score for last evaluation
  const lastEvaluationAverage = lastEvaluation
    ? (
        (lastEvaluation.competencia_tecnica +
          lastEvaluation.comunicacao +
          lastEvaluation.trabalho_em_equipe +
          lastEvaluation.proatividade +
          lastEvaluation.pontualidade +
          lastEvaluation.organizacao) /
        6
      ).toFixed(1)
    : undefined;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      colaborador_id: colaboradorId,
      equipe_id: equipeId,
      data_avaliacao: format(new Date(), "yyyy-MM-dd"),
      competencia_tecnica: 3,
      comunicacao: 3,
      trabalho_em_equipe: 3,
      proatividade: 3,
      pontualidade: 3,
      organizacao: 3,
      anotacoes: "",
    },
  });

  // Reset form when opening for a new collaborator
  useEffect(() => {
    if (isOpen) {
      form.reset({
        colaborador_id: colaboradorId,
        equipe_id: equipeId,
        data_avaliacao: format(new Date(), "yyyy-MM-dd"),
        competencia_tecnica: 3,
        comunicacao: 3,
        trabalho_em_equipe: 3,
        proatividade: 3,
        pontualidade: 3,
        organizacao: 3,
        anotacoes: "", // Garantir que o campo de anotações seja limpo
      });
    }
  }, [isOpen, colaboradorId, equipeId, form]);

  // Show alert if evaluation is not available
  useEffect(() => {
    if (isOpen && !canCreate) {
      setShowAlert(true);
      
      // Auto-hide alert after 5 seconds
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, canCreate]);

  const handleFormSubmit = (values: FormValues) => {
    // Block submission if can't create
    if (!canCreate) {
      setShowAlert(true);
      toast({
        title: "Avaliação indisponível",
        description: `Uma nova avaliação para ${colaboradorNome} só pode ser realizada a cada 15 dias. Aguarde mais ${daysRemaining} dia(s).`,
        variant: "destructive"
      });
      
      // Auto-hide alert after 5 seconds
      setTimeout(() => {
        setShowAlert(false);
      }, 5000);
      
      return;
    }
    
    // Garantir que todos os valores estejam dentro do intervalo permitido (0-5)
    const validatedData: AvaliacaoEquipeFormValues = {
      colaborador_id: values.colaborador_id,
      equipe_id: values.equipe_id,
      data_avaliacao: values.data_avaliacao,
      competencia_tecnica: Math.max(0, Math.min(5, values.competencia_tecnica)),
      comunicacao: Math.max(0, Math.min(5, values.comunicacao)),
      trabalho_em_equipe: Math.max(0, Math.min(5, values.trabalho_em_equipe)),
      proatividade: Math.max(0, Math.min(5, values.proatividade)),
      pontualidade: Math.max(0, Math.min(5, values.pontualidade)),
      organizacao: Math.max(0, Math.min(5, values.organizacao)),
      anotacoes: values.anotacoes || undefined,
    };
    
    // Submit ONLY the evaluation data
    onSubmit(validatedData);
  };

  const renderRatingButtons = (fieldName: keyof FormValues, label: string) => {
    // Ensure field is one of the rating fields
    if (!['competencia_tecnica', 'comunicacao', 'trabalho_em_equipe', 
          'proatividade', 'pontualidade', 'organizacao'].includes(fieldName)) {
      return null;
    }

    return (
      <FormField
        control={form.control}
        name={fieldName}
        render={({ field }) => (
          <FormItem className="space-y-2">
            <div className="flex justify-between items-center">
              <FormLabel className="text-sm font-medium">{label}</FormLabel>
              {lastEvaluation && (
                <span className="text-xs text-muted-foreground">
                  Última avaliação: 
                  <Badge 
                    variant={ratingLabels[lastEvaluation[fieldName as keyof typeof lastEvaluation] as number]?.value >= 3 ? "success" : "destructive"}
                    className="ml-2"
                  >
                    {lastEvaluation[fieldName as keyof typeof lastEvaluation]}
                  </Badge>
                </span>
              )}
            </div>
            <FormControl>
              <div className="flex gap-1">
                {ratingLabels.map((rating) => (
                  <button
                    key={rating.value}
                    type="button"
                    className={`flex flex-col items-center p-2 rounded-md hover:bg-accent
                      ${field.value === rating.value ? rating.color : 'bg-accent/30'}`}
                    onClick={() => field.onChange(rating.value)}
                    disabled={!canCreate}
                  >
                    <span className="w-8 h-8 flex items-center justify-center rounded-full">
                      {rating.value}
                    </span>
                    <span className="text-xs mt-1">{rating.label}</span>
                  </button>
                ))}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>
            Avaliação de Desempenho
          </DialogTitle>
          <DialogDescription>
            Avalie o desempenho de {colaboradorNome} em cada um dos critérios abaixo.
          </DialogDescription>
        </DialogHeader>

        {showAlert && !canCreate && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Uma nova avaliação para {colaboradorNome} só pode ser realizada a cada 15 dias. 
              Aguarde mais {daysRemaining} dia(s).
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(handleFormSubmit)} 
            className="space-y-6"
          >
            {lastEvaluation && (
              <div className="bg-accent/30 p-4 rounded-md">
                <p className="text-sm font-medium mb-2">Última avaliação: {format(new Date(lastEvaluation.data_avaliacao), "dd/MM/yyyy", { locale: ptBR })}</p>
                <div className="flex items-center">
                  <span className="text-sm">Média geral:</span>
                  <Badge 
                    variant={Number(lastEvaluationAverage) >= 3 ? "success" : "destructive"}
                    className="ml-2"
                  >
                    {lastEvaluationAverage}
                  </Badge>
                </div>
              </div>
            )}
            
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-6">
                {renderRatingButtons("competencia_tecnica", "🏗️ Competência Técnica")}
                {renderRatingButtons("comunicacao", "💬 Comunicação")}
                {renderRatingButtons("trabalho_em_equipe", "👥 Trabalho em Equipe")}
                {renderRatingButtons("proatividade", "🚀 Proatividade")}
                {renderRatingButtons("pontualidade", "⏰ Pontualidade")}
                {renderRatingButtons("organizacao", "📋 Organização")}

                <FormField
                  control={form.control}
                  name="anotacoes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Anotações</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Registre observações ou feedbacks adicionais..."
                          className="min-h-[100px] resize-none"
                          value={field.value || ""}
                          disabled={!canCreate}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>

            <DialogFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || !canCreate} 
                className="bg-blue-500 hover:bg-blue-600"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                    Salvando Avaliação...
                  </>
                ) : (
                  "Salvar Avaliação"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AvaliacaoDesempenhoForm;
