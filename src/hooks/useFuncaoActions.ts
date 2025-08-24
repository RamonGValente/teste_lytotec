
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Funcao, FuncaoFilter } from "@/types/funcao";
import { 
  fetchFuncoes,
  createFuncao,
  updateFuncao,
  deleteFuncao,
  exportToExcel as exportToExcelService
} from "@/services/funcaoService";
import { useToast } from "@/hooks/use-toast";

export const useFuncaoActions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State
  const [filters, setFilters] = useState<FuncaoFilter>({});
  const [currentFuncao, setCurrentFuncao] = useState<Funcao | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingFuncao, setDeletingFuncao] = useState<Funcao | null>(null);
  
  // Queries & Mutations
  const { 
    data: funcoes,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ["funcoes", filters],
    queryFn: () => fetchFuncoes(filters)
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFuncao(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funcoes"] });
      toast({
        title: "Função excluída com sucesso",
        description: "A função foi removida do sistema"
      });
      setIsDeleteModalOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir função",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Actions
  const handleFilterChange = (field: keyof FuncaoFilter, value: string) => {
    setFilters({
      ...filters,
      [field]: value
    });
  };
  
  const resetFilters = () => {
    setFilters({});
  };
  
  const openFormModal = (funcao?: Funcao) => {
    setCurrentFuncao(funcao || null);
    setIsFormModalOpen(true);
  };
  
  const openDetailsModal = (funcao: Funcao) => {
    setCurrentFuncao(funcao);
    setIsDetailsModalOpen(true);
  };
  
  const confirmDelete = (funcao: Funcao) => {
    setDeletingFuncao(funcao);
    setIsDeleteModalOpen(true);
  };
  
  const handleDelete = async () => {
    if (deletingFuncao) {
      deleteMutation.mutate(deletingFuncao.id);
    }
  };
  
  const exportToExcel = () => {
    if (funcoes && funcoes.length > 0) {
      exportToExcelService(funcoes);
      toast({
        title: "Exportação concluída",
        description: "A lista de funções foi exportada com sucesso."
      });
    } else {
      toast({
        title: "Exportação não realizada",
        description: "Não há funções para exportar.",
        variant: "destructive"
      });
    }
  };
  
  const openImportModal = () => {
    setIsImportModalOpen(true);
  };
  
  return {
    // State
    filters,
    currentFuncao,
    isFormModalOpen,
    isDetailsModalOpen,
    isImportModalOpen,
    isDeleteModalOpen,
    deletingFuncao,
    isDeleting: deleteMutation.isPending,
    funcoes,
    isLoading,
    isError,
    
    // Actions
    setIsFormModalOpen,
    setIsDetailsModalOpen,
    setIsImportModalOpen,
    setIsDeleteModalOpen,
    handleFilterChange,
    resetFilters,
    openFormModal,
    openDetailsModal,
    confirmDelete,
    handleDelete,
    refetch,
    exportToExcel,
    openImportModal
  };
};
