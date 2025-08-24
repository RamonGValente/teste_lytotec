import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import MainLayout from "@/components/layout/MainLayout";
import ApontamentoEquipeFilters from "@/components/apontamento-equipe/ApontamentoEquipeFilters";
import ApontamentoEquipeFilterDrawer from "@/components/apontamento-equipe/ApontamentoEquipeFilterDrawer";
import ApontamentoEquipeTable from "@/components/apontamento-equipe/ApontamentoEquipeTable";
import ApontamentoEquipeForm from "@/components/apontamento-equipe/ApontamentoEquipeForm";
import ApontamentoEquipeDetailsModal from "@/components/apontamento-equipe/ApontamentoEquipeDetailsModal";
import DeleteApontamentoEquipeDialog from "@/components/apontamento-equipe/DeleteApontamentoEquipeDialog";
import AvaliacaoDesempenhoForm from "@/components/apontamento-equipe/AvaliacaoDesempenhoForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Plus, Users, Shield, AlertCircle } from "lucide-react";
import { useApontamentoEquipe } from "@/hooks/useApontamentoEquipe";
import { fetchEquipes } from "@/services/equipe/fetchEquipes";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  AvaliacaoEquipe, 
  AvaliacaoEquipeFormValues,
  ApontamentoEquipeApiData
} from "@/types/apontamentoEquipe";
import { 
  getLastAvaliacaoForColaborador, 
  createAvaliacaoEquipe,
  canCreateAvaliacaoForColaborador,
  checkAvaliacaoObrigatoria
} from "@/services/apontamentoEquipeService";

const ApontamentoEquipe: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAvaliacaoModalOpen, setIsAvaliacaoModalOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [selectedColaborador, setSelectedColaborador] = useState<{
    id: string;
    nome: string;
    equipeId: string;
  } | null>(null);
  const [lastAvaliacaoData, setLastAvaliacaoData] = useState<AvaliacaoEquipe | null>(null);
  
  const [avaliacaoStatusMap, setAvaliacaoStatusMap] = useState<
    Map<string, {canCreate: boolean, daysRemaining: number}>
  >(new Map());
  
  const [isAvaliacaoObrigatoria, setIsAvaliacaoObrigatoria] = useState(false);
  
  const {
    apontamentos,
    apontamentoSummaries,
    isLoading,
    isFormModalOpen,
    setIsFormModalOpen,
    isDetailsModalOpen,
    setIsDetailsModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    deletingApontamento,
    isDeleting,
    currentApontamento,
    filters,
    handleFilterChange,
    resetFilters,
    openFormModal,
    openDetailsModal,
    confirmDelete,
    handleDelete,
    handleExport,
    createMutation,
    updateMutation,
    allowedTeamIds,
    userRole,
    canAccessAllTeams
  } = useApontamentoEquipe();

  // Fetch only allowed teams
  const { data: allEquipes = [] } = useQuery({
    queryKey: ['equipes'],
    queryFn: () => fetchEquipes(),
    enabled: allowedTeamIds.length >= 0,
  });

  // Filter teams based on user access
  const equipes = React.useMemo(() => {
    if (canAccessAllTeams) {
      return allEquipes;
    }
    return allEquipes.filter(equipe => allowedTeamIds.includes(equipe.id));
  }, [allEquipes, allowedTeamIds, canAccessAllTeams]);

  const createAvaliacaoMutation = useMutation({
    mutationFn: (data: AvaliacaoEquipeFormValues) => createAvaliacaoEquipe(data),
    onSuccess: () => {
      toast({
        title: "Avaliação registrada",
        description: "A avaliação de desempenho foi registrada com sucesso."
      });
      
      setIsAvaliacaoModalOpen(false);
      
      if (selectedColaborador) {
        updateAvaliacaoStatusForColaborador(selectedColaborador.id);
        
        const event = new CustomEvent('avaliacaoConcluida', { 
          detail: { colaboradorId: selectedColaborador.id } 
        });
        document.dispatchEvent(event);
      }
    },
    onError: (error: any) => {
      console.error("Error creating avaliação:", error);
      toast({
        title: "Erro ao registrar avaliação",
        description: error.message || "Houve um erro ao registrar a avaliação de desempenho.",
        variant: "destructive"
      });
    }
  });

  const handleViewEquipe = (equipeId: string) => {
    navigate(`/gestao-rh/equipes?id=${equipeId}`);
  };

  const updateAvaliacaoStatusForColaborador = async (colaboradorId: string) => {
    if (!colaboradorId) return;
    
    try {
      const status = await canCreateAvaliacaoForColaborador(colaboradorId);
      
      setAvaliacaoStatusMap(prev => {
        const newMap = new Map(prev);
        newMap.set(colaboradorId, {
          canCreate: status.canCreate,
          daysRemaining: status.daysRemaining
        });
        return newMap;
      });
      
      return status;
    } catch (error) {
      console.error("Error checking evaluation status:", error);
      return null;
    }
  };

  const handleAvaliarColaborador = async (colaboradorId: string, nomeColaborador: string, equipeId: string) => {
    if (!colaboradorId) {
      toast({
        title: "Erro",
        description: "ID do colaborador não disponível.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      let avaliacaoStatus = avaliacaoStatusMap.get(colaboradorId);
      
      if (!avaliacaoStatus) {
        avaliacaoStatus = await updateAvaliacaoStatusForColaborador(colaboradorId);
      }
      
      const lastAvaliacao = await getLastAvaliacaoForColaborador(colaboradorId);
      setLastAvaliacaoData(lastAvaliacao as any);
      
      setSelectedColaborador({
        id: colaboradorId,
        nome: nomeColaborador,
        equipeId: equipeId
      });
      
      setIsAvaliacaoModalOpen(true);
    } catch (error) {
      console.error("Error preparing for avaliação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível preparar a avaliação.",
        variant: "destructive"
      });
    }
  };

  const checkAvaliacaoStatusForAllColaboradores = async () => {
    if (!apontamentos?.length) return;
    
    const uniqueColaboradorIds = new Set<string>();
    
    apontamentos.forEach(apontamento => {
      if (apontamento.colaborador_id) {
        uniqueColaboradorIds.add(apontamento.colaborador_id);
      }
    });
    
    for (const colaboradorId of uniqueColaboradorIds) {
      await updateAvaliacaoStatusForColaborador(colaboradorId);
    }
    
    try {
      const isObrigatoria = await checkAvaliacaoObrigatoria();
      setIsAvaliacaoObrigatoria(isObrigatoria);
    } catch (error) {
      console.error("Error checking if evaluation is mandatory:", error);
    }
  };

  useEffect(() => {
    checkAvaliacaoStatusForAllColaboradores();
  }, [apontamentos]);

  const handleSubmitAvaliacao = (data: AvaliacaoEquipeFormValues) => {
    createAvaliacaoMutation.mutate(data);
  };

  const formattedDate = format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  const handleApplyFilters = (newFilters: any) => {
    Object.entries(newFilters).forEach(([key, value]) => {
      handleFilterChange(key as any, value);
    });
  };

  const canCreateApontamento = ['SuperAdm', 'AdmRH', 'Apontador', 'Encarregado'].includes(userRole || '');

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-6">
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6 px-4 md:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Apontamento de Equipe</h1>
            <p className="text-muted-foreground">
              Registre a presença e o desempenho dos colaboradores por equipe.
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto flex-row justify-end">
            {canCreateApontamento && equipes.length > 0 && (
              <Button 
                onClick={() => openFormModal()} 
                className="bg-blue-600 hover:bg-blue-700 text-white h-8 sm:h-10 px-2 sm:px-4 text-sm"
                size="xs"
              >
                <Plus className="mr-2 h-4 w-4" />
                <span>Novo Apontamento</span>
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={handleExport} 
              className="h-8 sm:h-10 px-2 sm:px-4 text-sm"
              size="xs"
              disabled={apontamentos.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              <span>Exportar</span>
            </Button>
          </div>
        </div>

        {/* Security Status Alert */}
        <Alert className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800">
          <Shield className="h-4 w-4" />
          <AlertTitle>Controle de Acesso Ativo</AlertTitle>
          <AlertDescription>
            <div className="flex flex-col gap-1">
              <span>Role: <strong>{userRole}</strong></span>
              <span>Acesso: {canAccessAllTeams ? 'Todas as equipes' : `${allowedTeamIds.length} equipes permitidas`}</span>
              <span>Controle: <strong>Aplicado por equipe</strong> - Dados filtrados automaticamente</span>
            </div>
          </AlertDescription>
        </Alert>

        {/* No Access Warning */}
        {allowedTeamIds.length === 0 && !canAccessAllTeams && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Sem Acesso a Equipes</AlertTitle>
            <AlertDescription>
              Você não tem permissão para acessar nenhuma equipe. Entre em contato com o administrador para solicitar as permissões necessárias.
            </AlertDescription>
          </Alert>
        )}

        {equipes.length > 0 && (
          <>
            {isAvaliacaoObrigatoria && (
              <Alert className="bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                <AlertTitle>Avaliação de desempenho obrigatória</AlertTitle>
                <AlertDescription>
                  Hoje é dia de avaliação obrigatória! Todos os colaboradores presentes precisam ser avaliados.
                </AlertDescription>
              </Alert>
            )}

            <ApontamentoEquipeFilters 
              onFilter={(newFilters) => {
                Object.entries(newFilters).forEach(([key, value]) => {
                  handleFilterChange(key as any, value);
                });
              }}
              equipes={equipes}
              isLoading={isLoading}
              onOpenMobileFilters={() => setIsFilterDrawerOpen(true)}
            />

            <ApontamentoEquipeFilterDrawer
              isOpen={isFilterDrawerOpen}
              onClose={() => setIsFilterDrawerOpen(false)}
              onApplyFilters={handleApplyFilters}
              onClearFilters={resetFilters}
              equipes={equipes}
              isLoading={isLoading}
            />

            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <CardTitle className="text-xl">Apontamentos de Equipe</CardTitle>
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium capitalize text-sm">{formattedDate}</span>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <ApontamentoEquipeTable 
                    apontamentos={apontamentoSummaries} 
                    onViewDetails={openDetailsModal}
                    onEdit={openFormModal}
                    onDelete={confirmDelete}
                    onViewEquipe={handleViewEquipe}
                    onAvaliarColaborador={handleAvaliarColaborador}
                    avaliacaoStatusMap={avaliacaoStatusMap}
                  />
                )}
              </CardContent>
            </Card>
          </>
        )}

        <ApontamentoEquipeForm 
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSubmit={(data: ApontamentoEquipeApiData) => currentApontamento ? updateMutation.mutate(data) : createMutation.mutate(data)}
          currentApontamento={currentApontamento}
          equipes={equipes}
          isLoading={createMutation.isPending || updateMutation.isPending}
          onAvaliarColaborador={handleAvaliarColaborador}
          avaliacaoStatusMap={avaliacaoStatusMap}
          isAvaliacaoObrigatoria={isAvaliacaoObrigatoria}
        />

        {currentApontamento && (
          <ApontamentoEquipeDetailsModal 
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            apontamento={currentApontamento}
            apontamentosList={apontamentos.filter(a => 
              a.equipe_id === currentApontamento.equipe_id && 
              a.data_registro === currentApontamento.data_registro
            )}
          />
        )}

        <DeleteApontamentoEquipeDialog 
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          apontamento={deletingApontamento}
          onDelete={handleDelete}
          isDeleting={isDeleting}
        />

        {selectedColaborador && (
          <AvaliacaoDesempenhoForm
            isOpen={isAvaliacaoModalOpen}
            onClose={() => setIsAvaliacaoModalOpen(false)}
            onSubmit={handleSubmitAvaliacao}
            colaboradorId={selectedColaborador.id}
            equipeId={selectedColaborador.equipeId}
            colaboradorNome={selectedColaborador.nome}
            lastEvaluation={lastAvaliacaoData ? {
              data_avaliacao: lastAvaliacaoData.data_avaliacao,
              competencia_tecnica: lastAvaliacaoData.competencia_tecnica,
              comunicacao: lastAvaliacaoData.comunicacao,
              trabalho_em_equipe: lastAvaliacaoData.trabalho_em_equipe,
              proatividade: lastAvaliacaoData.proatividade,
              pontualidade: lastAvaliacaoData.pontualidade,
              organizacao: lastAvaliacaoData.organizacao,
              anotacoes: lastAvaliacaoData.anotacoes
            } : undefined}
            isLoading={createAvaliacaoMutation.isPending}
            canCreate={avaliacaoStatusMap.get(selectedColaborador.id)?.canCreate ?? true}
            daysRemaining={avaliacaoStatusMap.get(selectedColaborador.id)?.daysRemaining ?? 0}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default ApontamentoEquipe;
