import React, { useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Wifi, WifiOff } from "lucide-react";
import { ApontamentoEquipe, ApontamentoEquipeApiData, ApontamentoEquipeFormValues } from "@/types/apontamentoEquipe";
import { Equipe } from "@/types/equipe";
import { useApontamentoEquipeForm } from "@/hooks/useApontamentoEquipeForm";
import { useApontamentoEquipeOffline } from "@/hooks/useApontamentoEquipeOffline";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";
import { format } from "date-fns";
import ApontamentoFormHeader from "./ApontamentoFormHeader";
import ApontamentoFormAlerts from "./ApontamentoFormAlerts";
import ColaboradoresSection from "./ColaboradoresSection";

interface ApontamentoEquipeFormOfflineProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentApontamento: ApontamentoEquipe | null;
  equipes: Equipe[];
  isLoading: boolean;
  onAvaliarColaborador?: (colaboradorId: string, nomeColaborador: string, equipeId: string) => void;
  canCreateAvaliacao?: boolean;
  daysRemainingForEvaluation?: number;
  avaliacaoStatusMap?: Map<string, {canCreate: boolean, daysRemaining: number}>;
  isAvaliacaoObrigatoria?: boolean;
}

const ApontamentoEquipeFormOffline: React.FC<ApontamentoEquipeFormOfflineProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentApontamento,
  equipes,
  isLoading: externalLoading,
  onAvaliarColaborador,
  avaliacaoStatusMap = new Map(),
  isAvaliacaoObrigatoria = false
}) => {
  const { isSupabaseConnected } = useConnectionStatus();
  const { submitApontamento, isLoading: offlineLoading, isOffline } = useApontamentoEquipeOffline();
  
  // Create a wrapper function to convert FormValues to ApiData
  const handleFormSubmit = (data: ApontamentoEquipeFormValues) => {
    // Convert FormValues to ApiData
    const apiData: ApontamentoEquipeApiData = {
      ...data,
      data_registro: format(data.data_registro, "yyyy-MM-dd")
    };
    
    submitApontamento(apiData, onSuccess);
  };
  
  const {
    form,
    handleFormSubmit: formSubmitHandler,
    equipeMembers,
    isLoadingMembers,
    apontamentoExistente,
    avaliacoesPendentes,
    avaliacoesCompletas,
    todosColaboradoresAvaliados,
    alertMessage,
    loadEquipeMembers,
    loadExistingApontamento,
    apontamentosCarregados,
    loadingEquipeError
  } = useApontamentoEquipeForm({
    currentApontamento,
    onSubmit: handleFormSubmit, // Pass the wrapper function
    avaliacaoStatusMap,
    isAvaliacaoObrigatoria
  });

  const isEditing = !!currentApontamento;
  const isLoading = externalLoading || offlineLoading;
  
  useEffect(() => {
    if (isOpen) {
      const setupForm = async () => {
        try {
          if (currentApontamento) {
            console.log("Modal de edição aberto para apontamento:", currentApontamento);
            
            let dateObject: Date;
            if (typeof currentApontamento.data_registro === 'string') {
              const [year, month, day] = currentApontamento.data_registro.split('-').map(Number);
              dateObject = new Date(year, month - 1, day, 12, 0, 0);
            } else {
              dateObject = new Date(currentApontamento.data_registro);
              dateObject.setHours(12, 0, 0, 0);
            }
            
            form.reset({
              equipe_id: currentApontamento.equipe_id,
              data_registro: dateObject,
              colaboradores: []
            });
            
            await loadEquipeMembers(currentApontamento.equipe_id);
            await loadExistingApontamento(
              currentApontamento.equipe_id, 
              dateObject
            );
          }
        } catch (error) {
          console.error("Erro ao configurar o formulário:", error);
        }
      };
      
      setupForm();
    }
  }, [isOpen, currentApontamento, form, loadEquipeMembers, loadExistingApontamento]);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'equipe_id' && value.equipe_id) {
        console.log("Equipe ID changed, loading members:", value.equipe_id);
        loadEquipeMembers(value.equipe_id);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, loadEquipeMembers]);

  useEffect(() => {
    if (isEditing && apontamentosCarregados) {
      console.log("Verificando colaboradores do apontamento carregados:", form.getValues().colaboradores);
    }
  }, [isEditing, apontamentosCarregados, form]);

  // Validação simplificada para permitir salvamento básico
  const canSaveBasicAppointment = () => {
    const formValues = form.getValues();
    const colaboradoresPresentes = formValues.colaboradores?.filter(col => col.presente) || [];
    
    return (
      formValues.equipe_id && 
      colaboradoresPresentes.length > 0 &&
      !isLoading && 
      !isLoadingMembers && 
      !loadingEquipeError &&
      !(apontamentoExistente && !currentApontamento)
    );
  };

  const isButtonDisabled = !canSaveBasicAppointment();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {currentApontamento ? "Editar Apontamento" : "Novo Apontamento"}
            {isOffline && (
              <div className="flex items-center gap-1 text-orange-600">
                <WifiOff className="h-4 w-4" />
                <span className="text-sm">Offline</span>
              </div>
            )}
            {isSupabaseConnected && (
              <div className="flex items-center gap-1 text-green-600">
                <Wifi className="h-4 w-4" />
                <span className="text-sm">Online</span>
              </div>
            )}
          </DialogTitle>
          <DialogDescription>
            {currentApontamento 
              ? "Edite os dados de presença e horários dos colaboradores" 
              : "Registre a presença e horários dos colaboradores da equipe"}
            {isOffline && (
              <div className="mt-2 text-orange-600 text-sm">
                Modo offline ativo - dados serão sincronizados automaticamente quando a conexão for restaurada
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(formSubmitHandler)} className="space-y-6">
            <ApontamentoFormHeader 
              form={form} 
              equipes={equipes} 
              isLoading={isLoading} 
              isEditing={isEditing} 
            />
            
            {loadingEquipeError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>
                  {loadingEquipeError}
                </AlertDescription>
              </Alert>
            )}
            
            {isOffline && (
              <Alert>
                <WifiOff className="h-4 w-4" />
                <AlertTitle>Modo Offline</AlertTitle>
                <AlertDescription>
                  Você está offline. O apontamento será salvo localmente e sincronizado automaticamente quando a conexão for restaurada.
                </AlertDescription>
              </Alert>
            )}
            
            <ApontamentoFormAlerts 
              apontamentoExistente={!!apontamentoExistente} 
              isEditing={isEditing} 
              avaliacoesPendentes={avaliacoesPendentes} 
            />
            
            <Separator />
            
            <ColaboradoresSection 
              form={form}
              equipeId={form.getValues().equipe_id}
              isLoadingMembers={isLoadingMembers}
              equipeMembers={equipeMembers}
              onAvaliarColaborador={onAvaliarColaborador}
              avaliacoesCompletas={avaliacoesCompletas}
              avaliacaoStatusMap={avaliacaoStatusMap}
              alertMessage={alertMessage}
              isEditing={isEditing}
            />

            <DialogFooter className="sm:justify-between flex-col sm:flex-row gap-3 mt-6 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="w-full sm:w-auto h-12 sm:h-10">
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isButtonDisabled}
                className="bg-blue-500 hover:bg-blue-600 w-full sm:w-auto h-12 sm:h-10"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                    {isOffline ? "Salvando offline..." : "Salvando..."}
                  </>
                ) : (
                  `Salvar Apontamento ${isOffline ? "(Offline)" : ""}`
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ApontamentoEquipeFormOffline;
