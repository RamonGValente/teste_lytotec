import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useUserDataAccess } from "@/hooks/useUserDataAccess";
import { 
  fetchApontamentos,
  getApontamentoById,
  createApontamentoEquipe,
  updateApontamentoEquipe,
  deleteApontamentoEquipe,
  exportApontamentoAndAvaliacoes
} from "@/services/apontamentoEquipeService";
import { 
  ApontamentoEquipe, 
  ApontamentoEquipeFilters,
  ApontamentoEquipeApiData
} from "@/types/apontamentoEquipe";
import { format } from "date-fns";

const normalizeDate = (date: Date | string): string => {
  if (typeof date === 'string') {
    if (date.includes('T')) {
      const dateObj = new Date(date);
      return format(dateObj, "yyyy-MM-dd");
    }
    return date; // Already in yyyy-MM-dd format
  }
  
  const normalizedDate = new Date(date);
  normalizedDate.setHours(12, 0, 0, 0);
  return format(normalizedDate, "yyyy-MM-dd");
};

export const useApontamentoEquipe = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get user data access control
  const { allowedTeamIds, userRole, canAccessAllTeams, isLoading: accessLoading } = useUserDataAccess();
  
  const [filters, setFilters] = useState<ApontamentoEquipeFilters>({
    // Remover filtro padrão de data para mostrar todos os dados
  });
  const [currentApontamento, setCurrentApontamento] = useState<ApontamentoEquipe | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingApontamento, setDeletingApontamento] = useState<ApontamentoEquipe | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { 
    data: apontamentos = [], 
    isLoading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ['apontamentos', filters, allowedTeamIds],
    queryFn: () => fetchApontamentos(filters, allowedTeamIds),
    enabled: !accessLoading && allowedTeamIds.length >= 0, // Allow empty array (no access)
  });
  
  const groupedApontamentos = useMemo(() => {
    const groups: Record<string, ApontamentoEquipe[]> = {};
    
    apontamentos.forEach(apontamento => {
      const key = `${apontamento.equipe_id}-${apontamento.data_registro}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(apontamento);
    });
    
    return Object.values(groups);
  }, [apontamentos]);
  
  const apontamentoSummaries = useMemo(() => {
    return groupedApontamentos.map(group => {
      const first = group[0];
      const presencaPercentage = Math.round((group.filter(a => a.presente).length / group.length) * 100);
      
      return {
        equipe_id: first.equipe_id,
        equipe_nome: first.equipe?.nome_equipe || 'N/A',
        data_registro: first.data_registro,
        encarregado: first.equipe?.encarregado?.nome_completo || 'N/A',
        apontador: first.equipe?.apontador?.nome_completo || 'N/A',
        presenca_percentage: presencaPercentage,
        total_colaboradores: group.length,
        colaboradores: group
      };
    });
  }, [groupedApontamentos]);
  
  const createMutation = useMutation({
    mutationFn: async (data: ApontamentoEquipeApiData) => {
      console.log("🔄 Creating apontamento with normalized data:", data);
      const result = await createApontamentoEquipe(data);
      return Array.isArray(result) ? result[0] : result;
    },
    onSuccess: () => {
      console.log("✅ Apontamento created successfully");
      queryClient.invalidateQueries({ queryKey: ['apontamentos'] });
      toast({
        title: "Apontamento criado",
        description: "Apontamento de equipe criado com sucesso"
      });
      setIsFormModalOpen(false);
    },
    onError: (error: any) => {
      console.error("❌ Error creating apontamento:", error);
      
      let errorMessage = "Houve um erro ao criar o apontamento de equipe";
      
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
        variant: "destructive"
      });
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: (data: ApontamentoEquipeApiData) => {
      console.log("🔄 Updating apontamento with normalized data:", data);
      
      console.log(`Updating apontamento for team ${data.equipe_id} on date ${data.data_registro}`);
      
      return updateApontamentoEquipe(data.equipe_id, data.data_registro, data);
    },
    onSuccess: () => {
      console.log("✅ Apontamento updated successfully");
      queryClient.invalidateQueries({ queryKey: ['apontamentos'] });
      toast({
        title: "Apontamento atualizado",
        description: "Apontamento de equipe atualizado com sucesso"
      });
      setIsFormModalOpen(false);
    },
    onError: (error: any) => {
      console.error("❌ Error updating apontamento:", error);
      
      let errorMessage = "Houve um erro ao atualizar o apontamento de equipe";
      
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
        variant: "destructive"
      });
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      console.log("🔄 Deleting apontamento:", id);
      console.log("🔍 Current user role:", userRole);
      console.log("🔍 User authenticated:", !!allowedTeamIds);
      return deleteApontamentoEquipe(id);
    },
    onSuccess: () => {
      console.log("✅ Apontamento deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['apontamentos'] });
      toast({
        title: "Apontamento excluído",
        description: "Apontamento de equipe excluído com sucesso"
      });
      setIsDeleteModalOpen(false);
      setDeletingApontamento(null);
      setIsDeleting(false);
    },
    onError: (error: any) => {
      console.error("❌ Error deleting apontamento:", error);
      console.error("❌ Full error object:", JSON.stringify(error, null, 2));
      
      let errorMessage = "Houve um erro ao excluir o apontamento de equipe";
      
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
        variant: "destructive"
      });
      setIsDeleting(false);
    }
  });
  
  const handleFilterChange = useCallback((filterName: keyof ApontamentoEquipeFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  }, [setFilters]);
  
  const resetFilters = useCallback(() => {
    setFilters({});
  }, [setFilters]);
  
  const openFormModal = useCallback((apontamento?: ApontamentoEquipe) => {
    if (apontamento) {
      setCurrentApontamento(apontamento);
    } else {
      setCurrentApontamento(null);
    }
    setIsFormModalOpen(true);
  }, []);
  
  const openDetailsModal = useCallback((apontamento: ApontamentoEquipe) => {
    setCurrentApontamento(apontamento);
    setIsDetailsModalOpen(true);
  }, [setCurrentApontamento, setIsDetailsModalOpen]);
  
  const confirmDelete = useCallback((apontamento: ApontamentoEquipe) => {
    setDeletingApontamento(apontamento);
    setIsDeleteModalOpen(true);
  }, [setDeletingApontamento, setIsDeleteModalOpen]);
  
  const handleDelete = useCallback(() => {
    if (!deletingApontamento?.id) {
      console.error("❌ No apontamento to delete or missing ID");
      toast({
        title: "Erro",
        description: "Nenhum apontamento selecionado para exclusão",
        variant: "destructive"
      });
      return;
    }
    
    console.log("🗑️ Starting delete process for apontamento:", deletingApontamento.id);
    console.log("🔍 Deleting apontamento details:", {
      id: deletingApontamento.id,
      equipe: deletingApontamento.equipe?.nome_equipe,
      data: deletingApontamento.data_registro
    });
    
    setIsDeleting(true);
    
    // Use mutate instead of mutateAsync for better error handling
    deleteMutation.mutate(deletingApontamento.id, {
      onSettled: () => {
        // This will run regardless of success or error
        setIsDeleting(false);
      }
    });
  }, [deletingApontamento, deleteMutation, toast]);
  
  const handleExport = useCallback(() => {
    try {
      exportApontamentoAndAvaliacoes(filters);
      toast({
        title: "Exportação concluída",
        description: "Apontamentos e avaliações exportados com sucesso",
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar os dados",
        variant: "destructive",
      });
    }
  }, [filters, toast]);
  
  return {
    filters,
    currentApontamento,
    isFormModalOpen,
    isDetailsModalOpen,
    isDeleteModalOpen,
    deletingApontamento,
    isDeleting,
    
    apontamentos,
    apontamentoSummaries,
    isLoading: isLoading || accessLoading,
    isError,
    
    // Access control data
    allowedTeamIds,
    userRole,
    canAccessAllTeams,
    
    setFilters,
    setIsFormModalOpen,
    setIsDetailsModalOpen,
    setIsDeleteModalOpen,
    
    handleFilterChange,
    resetFilters,
    openFormModal,
    openDetailsModal,
    confirmDelete,
    handleDelete,
    handleExport,
    refetch,
    createMutation,
    updateMutation
  };
};
