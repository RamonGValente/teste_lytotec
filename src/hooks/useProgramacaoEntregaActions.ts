
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  fetchProgramacoes, 
  fetchProgramacaoById, 
  deleteProgramacao,
  downloadProgramacoesAsExcel
} from "@/services/programacaoEntregaService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProgramacaoEntrega, ProgramacaoEntregaWithItems, ProgramacaoEntregaFilters } from "@/types/programacaoEntrega";

export const useProgramacaoEntregaActions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estado
  const [filters, setFilters] = useState<ProgramacaoEntregaFilters>({});
  const [currentProgramacao, setCurrentProgramacao] = useState<ProgramacaoEntregaWithItems | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingProgramacao, setDeletingProgramacao] = useState<ProgramacaoEntregaWithItems | null>(null);
  
  // Query to fetch programacoes with current filters
  const { 
    data: programacoes = [], 
    isLoading, 
    isError,
    refetch
  } = useQuery({
    queryKey: ['programacoes', filters],
    queryFn: () => fetchProgramacoes(filters),
  });
  
  // Mutation to delete a programacao
  const { mutate: deleteMutation, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteProgramacao(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programacoes'] });
      toast({
        title: "Programação excluída",
        description: "A programação foi excluída com sucesso.",
      });
      setIsDeleteModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir programação",
        description: `Ocorreu um erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
      });
    }
  });
  
  // Reset filters
  const resetFilters = () => {
    setFilters({});
  };
  
  // Handle filter change
  const handleFilterChange = (name: keyof ProgramacaoEntregaFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Open form modal for creating or editing
  const openFormModal = async (programacao?: ProgramacaoEntrega) => {
    if (programacao) {
      try {
        const fullProgramacao = await fetchProgramacaoById(programacao.id);
        setCurrentProgramacao(fullProgramacao);
      } catch (error) {
        toast({
          title: "Erro ao carregar programação",
          description: `Ocorreu um erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
          variant: "destructive",
        });
        return;
      }
    } else {
      setCurrentProgramacao(null);
    }
    
    setIsFormModalOpen(true);
  };
  
  // Open details modal
  const openDetailsModal = async (programacao: ProgramacaoEntrega) => {
    try {
      const fullProgramacao = await fetchProgramacaoById(programacao.id);
      setCurrentProgramacao(fullProgramacao);
      setIsDetailsModalOpen(true);
    } catch (error) {
      toast({
        title: "Erro ao carregar detalhes",
        description: `Ocorreu um erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
      });
    }
  };
  
  // Confirm delete
  const confirmDelete = (programacao: ProgramacaoEntrega) => {
    setDeletingProgramacao(programacao as ProgramacaoEntregaWithItems);
    setIsDeleteModalOpen(true);
  };
  
  // Handle delete
  const handleDelete = () => {
    if (deletingProgramacao) {
      deleteMutation(deletingProgramacao.id);
    }
  };
  
  // Export to Excel
  const exportToExcel = async () => {
    try {
      await downloadProgramacoesAsExcel(filters);
      
      toast({
        title: "Exportação concluída",
        description: "Os dados foram exportados com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: `Ocorreu um erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
      });
    }
  };
  
  return {
    // Estado
    filters,
    currentProgramacao,
    isFormModalOpen,
    isDetailsModalOpen,
    isDeleteModalOpen,
    deletingProgramacao,
    isDeleting,
    programacoes,
    isLoading,
    isError,
    
    // Ações
    setIsFormModalOpen,
    setIsDetailsModalOpen,
    setIsDeleteModalOpen,
    handleFilterChange,
    resetFilters,
    openFormModal,
    openDetailsModal,
    confirmDelete,
    handleDelete,
    refetch,
    exportToExcel
  };
};
