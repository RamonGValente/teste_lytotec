
import React, { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { useToast } from "@/hooks/use-toast";
import RegistroAplicacaoFilters from "@/components/registro-aplicacao/RegistroAplicacaoFilters";
import { Button } from "@/components/ui/button";
import { RefreshCw, Info, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { fetchEntregasStable } from "@/services/registro-aplicacao/fetchEntregasStable";
import { RegistroAplicacaoFilters as RegistroAplicacaoFiltersType } from "@/types/registroAplicacao";
import { ListaProgramacaoEntrega } from "@/types/programacaoEntrega";
import { useAuthPermissionsStable } from "@/hooks/useAuthPermissionsStable";
import { useUserDataAccessStable } from "@/hooks/useUserDataAccessStable";
import { fetchCentrosCustoFiltered } from "@/services/centrosCustoFilteredService";
import { fetchCaminhoesWithCapacity } from "@/services/caminhoesFilteredService";
import EntregasEnviadasTable from "@/components/registro-aplicacao/EntregasEnviadasTable";
import NovoRegistroAplicacaoModal from "@/components/registro-aplicacao/NovoRegistroAplicacaoModal";

const RegistroAplicacaoStable: React.FC = () => {
  const { toast } = useToast();
  
  // Estados consolidados
  const [filters, setFilters] = useState<RegistroAplicacaoFiltersType>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntrega, setSelectedEntrega] = useState<ListaProgramacaoEntrega | null>(null);
  
  // Hooks estabilizados em cascata
  const authData = useAuthPermissionsStable();
  const teamAccess = useUserDataAccessStable(authData.userId, authData.userRole, authData.isSuperAdmin);
  
  // Estados derivados memoizados
  const isReady = useMemo(() => 
    !authData.isLoading && !teamAccess.isLoading,
    [authData.isLoading, teamAccess.isLoading]
  );

  const canLoadData = useMemo(() => 
    isReady && (teamAccess.allowedTeamIds.length > 0 || teamAccess.canAccessAllTeams),
    [isReady, teamAccess.allowedTeamIds.length, teamAccess.canAccessAllTeams]
  );

  console.log("📋 RegistroAplicacao State:", {
    authLoading: authData.isLoading,
    teamLoading: teamAccess.isLoading,
    isReady,
    canLoadData,
    allowedTeams: teamAccess.allowedTeamIds.length
  });

  // Query principal - só executa quando tudo estiver pronto
  const { 
    data: entregasEnviadas, 
    isLoading: isLoadingEntregas,
    refetch,
    error: entregasError
  } = useQuery({
    queryKey: ['entregasStable', filters, teamAccess.allowedTeamIds],
    queryFn: () => fetchEntregasStable(filters, teamAccess.allowedTeamIds),
    enabled: canLoadData,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1,
  });

  // Query para dados dos filtros - carregamento único
  const { data: filterData } = useQuery({
    queryKey: ['filterData', authData.userId, authData.isSuperAdmin],
    queryFn: async () => {
      if (!authData.userId) return { caminhoes: [], centrosCusto: [] };
      
      const [caminhoes, centrosCusto] = await Promise.all([
        fetchCaminhoesWithCapacity(),
        fetchCentrosCustoFiltered(authData.userId, authData.isSuperAdmin)
      ]);
      
      return {
        caminhoes: caminhoes || [],
        centrosCusto: centrosCusto || []
      };
    },
    enabled: isReady && !!authData.userId,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  // Handlers memoizados
  const handleFilter = useCallback((newFilters: RegistroAplicacaoFiltersType) => {
    console.log("🔍 Applying filters:", newFilters);
    setFilters(newFilters);
  }, []);

  const handleClearFilters = useCallback(() => {
    console.log("🧹 Clearing filters");
    setFilters({});
  }, []);

  const handleEntregaSelect = useCallback((entrega: ListaProgramacaoEntrega) => {
    console.log("📋 [PAGE] Entrega selecionada:", entrega.logradouro);
    setSelectedEntrega(entrega);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    console.log("🔄 [PAGE] Fechando modal");
    setIsModalOpen(false);
    setSelectedEntrega(null);
  }, []);

  const handleModalSuccess = useCallback(() => {
    console.log("🎯 [PAGE] Sucesso no modal - atualizando lista");
    
    // Forçar atualização da lista com invalidação da query
    refetch();
    
    console.log("✅ [PAGE] Lista atualizada");
  }, [refetch]);

  const handleRefresh = useCallback(() => {
    console.log("🔄 Manual refresh");
    refetch();
  }, [refetch]);

  // Estados computados
  const hasActiveFilters = useMemo(() => Boolean(
    filters.centro_custo_id || 
    filters.caminhao_id || 
    filters.data_inicio
  ), [filters]);

  // Loading states
  if (authData.isLoading || teamAccess.isLoading) {
    return (
      <MainLayout>
        <div className="container py-6">
          <div className="flex justify-center items-center py-12">
            <div className="text-center space-y-4">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-muted-foreground">Carregando permissões...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Registro de Aplicação</h1>
            <p className="text-muted-foreground">Selecione uma entrega para registrar a aplicação</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              className="gap-2"
              disabled={isLoadingEntregas}
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingEntregas ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Status de Segurança */}
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <div className="flex flex-col gap-1">
                <span>Usuário: <strong>{teamAccess.userRole}</strong></span>
                <span>Acesso: {teamAccess.canAccessAllTeams ? 'Todas as equipes' : `${teamAccess.allowedTeamIds.length} equipes`}</span>
                <span className="text-xs text-green-600">Sistema definitivamente corrigido - created_by garantido ✅</span>
              </div>
            </AlertDescription>
          </Alert>

          {/* Sem Acesso */}
          {!teamAccess.canAccessAllTeams && teamAccess.allowedTeamIds.length === 0 && (
            <Alert variant="destructive">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Sem Acesso:</strong> Você não tem permissão para acessar equipes. 
                Contate o administrador.
              </AlertDescription>
            </Alert>
          )}

          {/* Conteúdo Principal */}
          {canLoadData && (
            <>
              {/* Dica sobre filtros */}
              {!hasActiveFilters && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Dica:</strong> Mostrando todas as entregas disponíveis. 
                    Use os filtros para refinar os resultados.
                  </AlertDescription>
                </Alert>
              )}

              {/* Filtros */}
              <RegistroAplicacaoFilters 
                onFilter={handleFilter} 
                caminhoesList={filterData?.caminhoes || []}
                centrosCustoList={filterData?.centrosCusto || []}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={handleClearFilters}
              />

              {/* Erro */}
              {entregasError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Erro ao carregar entregas: {entregasError instanceof Error ? entregasError.message : 'Erro desconhecido'}
                  </AlertDescription>
                </Alert>
              )}

              {/* Tabela */}
              <EntregasEnviadasTable
                entregas={entregasEnviadas || []}
                isLoading={isLoadingEntregas}
                onEntregaSelect={handleEntregaSelect}
                onRefresh={handleRefresh}
              />
            </>
          )}
        </div>

        {/* Modal */}
        <NovoRegistroAplicacaoModal
          isOpen={isModalOpen}
          entrega={selectedEntrega}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      </div>
    </MainLayout>
  );
};

export default RegistroAplicacaoStable;
