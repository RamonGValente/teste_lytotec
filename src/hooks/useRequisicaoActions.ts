
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  fetchRequisicoes, 
  fetchRequisicaoById, 
  createRequisicao, 
  updateRequisicao, 
  deleteRequisicao,
  checkRequisicaoCanBeDeleted,
  exportRequisicoes
} from "@/services/requisicaoService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Requisicao, RequisicaoWithRuas, RuaRequisicao, RequisicaoFilters } from "@/types/requisicao";
import { utils, writeFile } from "xlsx";
import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const useRequisicaoActions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estado
  const [filters, setFilters] = useState<RequisicaoFilters>({});
  const [currentRequisicao, setCurrentRequisicao] = useState<RequisicaoWithRuas | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingRequisicao, setDeletingRequisicao] = useState<RequisicaoWithRuas | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [funcionarioId, setFuncionarioId] = useState<string | null>(null);
  
  // Load current user for the engineer field
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        
        if (user) {
          console.log("Current user:", user.email);
          
          // Fetch the funcionario record that matches the user's email
          const { data: funcionarios, error } = await supabase
            .from('bd_funcionarios')
            .select('id, nome_completo, email')
            .eq('email', user.email);
            
          if (funcionarios && funcionarios.length > 0) {
            setFuncionarioId(funcionarios[0].id);
            console.log("Found funcionario ID for current user:", funcionarios[0].id);
            console.log("Funcionario name:", funcionarios[0].nome_completo);
          } else {
            console.log("No funcionario record found for email:", user.email);
            
            // If no exact match, try a case-insensitive search 
            const { data: funcionariosInsensitive, error: errorInsensitive } = await supabase
              .from('bd_funcionarios')
              .select('id, nome_completo, email')
              .ilike('email', `%${user.email}%`);
              
            if (funcionariosInsensitive && funcionariosInsensitive.length > 0) {
              setFuncionarioId(funcionariosInsensitive[0].id);
              console.log("Found funcionario ID with partial match:", funcionariosInsensitive[0].id);
              console.log("Funcionario name:", funcionariosInsensitive[0].nome_completo);
            }
          }
          
          if (error) {
            console.error("Error finding funcionario record:", error);
          }
        }
      } catch (error) {
        console.error("Error loading current user:", error);
      }
    };
    
    loadUser();
  }, []);
  
  // Query to fetch requisitions with current filters
  const { 
    data: requisicoes = [], 
    isLoading, 
    isError,
    refetch
  } = useQuery({
    queryKey: ['requisicoes', filters],
    queryFn: () => {
      // Process filters to handle "_all" values
      const processedFilters = { ...filters };
      
      if (processedFilters.centro_custo_id === "_all") {
        delete processedFilters.centro_custo_id;
      }
      
      if (processedFilters.engenheiro_id === "_all") {
        delete processedFilters.engenheiro_id;
      }
      
      return fetchRequisicoes(processedFilters);
    },
  });
  
  // Mutation to delete a requisition with validation
  const { mutate: deleteMutation, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      // First validate if deletion is allowed
      const validation = await checkRequisicaoCanBeDeleted(id);
      
      if (!validation.canDelete) {
        throw new Error(validation.reason || 'Não é possível excluir esta requisição');
      }
      
      // Proceed with deletion
      return deleteRequisicao(id);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['requisicoes'] });
      toast({
        title: "Requisição excluída",
        description: "A requisição e todos os seus dados relacionados foram excluídos com sucesso.",
      });
      setIsDeleteModalOpen(false);
      setDeletingRequisicao(null);
    },
    onError: (error) => {
      console.error('Error deleting requisicao:', error);
      toast({
        title: "Não foi possível excluir a requisição",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive",
      });
    }
  });
  
  // Reset filters
  const resetFilters = () => {
    setFilters({});
  };
  
  // Handle filter change
  const handleFilterChange = (name: keyof RequisicaoFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Open form modal for creating or editing
  const openFormModal = async (requisicao?: Requisicao) => {
    if (requisicao) {
      try {
        const fullRequisicao = await fetchRequisicaoById(requisicao.id);
        setCurrentRequisicao(fullRequisicao);
      } catch (error) {
        toast({
          title: "Erro ao carregar requisição",
          description: `Ocorreu um erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
          variant: "destructive",
        });
        return;
      }
    } else {
      // Initialize empty requisition for new record with funcionario ID 
      setCurrentRequisicao({
        id: '',
        numero: '',
        centro_custo_id: '',
        engenheiro_id: funcionarioId || '',
        data_requisicao: new Date().toISOString().split('T')[0],
        ruas: []
      });
    }
    
    setIsFormModalOpen(true);
  };
  
  // Open details modal
  const openDetailsModal = async (requisicao: Requisicao) => {
    try {
      const fullRequisicao = await fetchRequisicaoById(requisicao.id);
      setCurrentRequisicao(fullRequisicao);
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
  const confirmDelete = (requisicao: Requisicao) => {
    setDeletingRequisicao(requisicao as RequisicaoWithRuas);
    setIsDeleteModalOpen(true);
  };
  
  // Handle delete
  const handleDelete = () => {
    if (deletingRequisicao) {
      deleteMutation(deletingRequisicao.id);
    }
  };
  
  // Export to Excel
  const exportToExcel = async () => {
    try {
      const data = await exportRequisicoes(filters);
      
      // Create workbook and worksheet
      const workbook = utils.book_new();
      const worksheet = utils.json_to_sheet(data);
      
      // Add worksheet to workbook
      utils.book_append_sheet(workbook, worksheet, "Requisições");
      
      // Generate filename with current date
      const now = new Date();
      const filename = `requisicoes_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.xlsx`;
      
      // Write workbook and trigger download
      writeFile(workbook, filename);
      
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
    currentRequisicao,
    isFormModalOpen,
    isDetailsModalOpen,
    isImportModalOpen,
    isDeleteModalOpen,
    deletingRequisicao,
    isDeleting,
    requisicoes,
    isLoading,
    isError,
    currentUser,
    funcionarioId,
    
    // Ações
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
    exportToExcel
  };
};
