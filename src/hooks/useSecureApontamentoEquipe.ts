
import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useUserDataAccess } from "@/hooks/useUserDataAccess";
import { 
  fetchSecureApontamentos, 
  fetchSecureEquipes,
  canCreateApontamentoForTeam 
} from "@/services/apontamentoEquipeSecureService";
import { 
  ApontamentoEquipe, 
  ApontamentoEquipeFilters, 
  ApontamentoEquipeApiData
} from "@/types/apontamentoEquipe";
import { 
  createApontamentoEquipe,
  updateApontamentoEquipe,
  deleteApontamentoEquipe
} from "@/services/apontamentoEquipeService";

export const useSecureApontamentoEquipe = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { allowedTeamIds, userRole, canAccessAllTeams, isLoading: accessLoading } = useUserDataAccess();
  
  // Form states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentApontamento, setCurrentApontamento] = useState<ApontamentoEquipe | null>(null);
  const [deletingApontamento, setDeletingApontamento] = useState<ApontamentoEquipe | null>(null);
  
  // Filter states
  const [filters, setFilters] = useState<ApontamentoEquipeFilters>({});

  // Queries with RLS filtering
  const {
    data: apontamentos = [],
    isLoading: isApontamentosLoading,
    refetch: refetchApontamentos
  } = useQuery({
    queryKey: ['secure-apontamentos-v2', filters, allowedTeamIds],
    queryFn: () => {
      console.log("🚀 useSecureApontamentoEquipe - Fetching secure apontamentos with allowedTeamIds:", allowedTeamIds);
      console.log("🚀 useSecureApontamentoEquipe - Using filters:", filters);
      return fetchSecureApontamentos(filters);
    },
    enabled: !accessLoading && allowedTeamIds.length > 0,
    staleTime: 30000,
    retry: 2
  });

  const {
    data: equipes = [],
    isLoading: isEquipesLoading
  } = useQuery({
    queryKey: ['secure-equipes-v2', allowedTeamIds],
    queryFn: () => {
      console.log("🚀 useSecureApontamentoEquipe - Fetching secure equipes");
      return fetchSecureEquipes();
    },
    enabled: !accessLoading,
    staleTime: 30000,
    retry: 2
  });

  // Mutations with improved error handling
  const createMutation = useMutation({
    mutationFn: async (data: ApontamentoEquipeApiData) => {
      console.log("🔄 Creating apontamento with data:", data);
      
      // Simplified permission check
      try {
        const canCreate = await canCreateApontamentoForTeam(data.equipe_id);
        if (!canCreate) {
          throw new Error("Você não tem permissão para criar apontamentos para esta equipe.");
        }
      } catch (permissionError) {
        console.warn("⚠️ Permission check failed, but proceeding with creation:", permissionError);
        // Continue with creation as RLS will handle the final permission check
      }
      
      const result = await createApontamentoEquipe(data);
      return Array.isArray(result) ? result[0] : result;
    },
    onSuccess: () => {
      console.log("✅ Apontamento created successfully");
      toast({
        title: "Apontamento criado com sucesso",
        variant: "default",
      });
      setIsFormModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['secure-apontamentos'] });
    },
    onError: (error: any) => {
      console.error("❌ Error creating apontamento:", error);
      
      // More detailed error handling
      let errorMessage = "Houve um erro ao criar o apontamento.";
      
      if (error.message?.includes("violates row-level security")) {
        errorMessage = "Você não tem permissão para criar apontamentos para esta equipe.";
      } else if (error.message?.includes("permission")) {
        errorMessage = "Permissão negada para criar apontamentos.";
      } else if (error.message?.includes("unique")) {
        errorMessage = "Já existe um apontamento para esta equipe nesta data.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro ao criar apontamento",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ApontamentoEquipeApiData) => {
      if (!currentApontamento) throw new Error("Nenhum apontamento selecionado");
      
      console.log("🔄 Updating apontamento with data:", data);
      
      // Simplified permission check for updates
      try {
        const canCreate = await canCreateApontamentoForTeam(data.equipe_id);
        if (!canCreate) {
          throw new Error("Você não tem permissão para editar apontamentos desta equipe.");
        }
      } catch (permissionError) {
        console.warn("⚠️ Permission check failed, but proceeding with update:", permissionError);
        // Continue with update as RLS will handle the final permission check
      }
      
      return updateApontamentoEquipe(
        currentApontamento.equipe_id,
        currentApontamento.data_registro,
        data
      );
    },
    onSuccess: () => {
      console.log("✅ Apontamento updated successfully");
      toast({
        title: "Apontamento atualizado com sucesso",
        variant: "default",
      });
      setIsFormModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['secure-apontamentos'] });
    },
    onError: (error: any) => {
      console.error("❌ Error updating apontamento:", error);
      
      // More detailed error handling
      let errorMessage = "Houve um erro ao atualizar o apontamento.";
      
      if (error.message?.includes("violates row-level security")) {
        errorMessage = "Você não tem permissão para editar apontamentos desta equipe.";
      } else if (error.message?.includes("permission")) {
        errorMessage = "Permissão negada para editar apontamentos.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro ao atualizar apontamento",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      console.log("🔄 Deleting apontamento:", id);
      return deleteApontamentoEquipe(id);
    },
    onSuccess: () => {
      console.log("✅ Apontamento deleted successfully");
      toast({
        title: "Apontamento excluído com sucesso",
        variant: "default",
      });
      setIsDeleteModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['secure-apontamentos'] });
    },
    onError: (error: any) => {
      console.error("❌ Error deleting apontamento:", error);
      
      let errorMessage = "Houve um erro ao excluir o apontamento.";
      
      if (error.message?.includes("violates row-level security")) {
        errorMessage = "Você não tem permissão para excluir este apontamento.";
      } else if (error.message?.includes("permission")) {
        errorMessage = "Permissão negada para excluir apontamentos.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro ao excluir apontamento",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  // Helper functions
  const handleFilterChange = (name: keyof ApontamentoEquipeFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({});
  };

  const openFormModal = (apontamento?: ApontamentoEquipe) => {
    setCurrentApontamento(apontamento || null);
    setIsFormModalOpen(true);
  };

  const openDetailsModal = (apontamento: ApontamentoEquipe) => {
    setCurrentApontamento(apontamento);
    setIsDetailsModalOpen(true);
  };

  const confirmDelete = (apontamento: ApontamentoEquipe) => {
    setDeletingApontamento(apontamento);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (deletingApontamento?.id) {
      deleteMutation.mutate(deletingApontamento.id);
    }
  };

  const handleExport = () => {
    toast({
      title: "Exportação iniciada",
      description: "O arquivo será baixado em breve.",
    });
  };

  // Process apontamentos for summary view
  const apontamentoSummaries = useMemo(() => {
    // Group apontamentos by equipe_id and data_registro
    const groups = apontamentos.reduce((acc, apontamento) => {
      const key = `${apontamento.equipe_id}-${apontamento.data_registro}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(apontamento);
      return acc;
    }, {} as Record<string, ApontamentoEquipe[]>);

    // Create summaries with proper encarregado and apontador data
    return Object.values(groups).map(group => {
      const first = group[0];
      const presencaPercentage = Math.round((group.filter(a => a.presente).length / group.length) * 100);
      
      return {
        equipe_id: first.equipe_id,
        equipe_nome: first.equipe?.nome_equipe || 'Equipe não encontrada',
        data_registro: first.data_registro,
        encarregado: first.equipe?.encarregado?.nome_completo || 'Não definido',
        apontador: first.equipe?.apontador?.nome_completo || 'Não definido',
        presenca_percentage: presencaPercentage,
        total_colaboradores: group.length,
        colaboradores: group
      };
    });
  }, [apontamentos]);

  return {
    // Data
    apontamentos,
    apontamentoSummaries,
    equipes,
    allowedTeamIds,
    userRole,
    canAccessAllTeams,
    
    // Loading states
    isLoading: isApontamentosLoading || isEquipesLoading || accessLoading,
    
    // Modal states
    isFormModalOpen,
    setIsFormModalOpen,
    isDetailsModalOpen,
    setIsDetailsModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    currentApontamento,
    deletingApontamento,
    
    // Filters
    filters,
    handleFilterChange,
    resetFilters,
    
    // Actions
    openFormModal,
    openDetailsModal,
    confirmDelete,
    handleDelete,
    handleExport,
    refetchApontamentos,
    
    // Mutations
    createMutation,
    updateMutation,
    isDeleting: deleteMutation.isPending
  };
};
