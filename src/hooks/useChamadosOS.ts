import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  fetchChamados, 
  createChamado, 
  updateChamado, 
  deleteChamado,
  getChamadoById,
  exportChamadosToExcel
} from "@/services/chamadosService";
import { updateChamadoStatus } from "@/services/ordemServicoService";
import { ChamadoOS, ChamadoFilterParams } from "@/types/chamadoOS";
import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const useChamadosOS = () => {
  const [chamados, setChamados] = useState<ChamadoOS[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [currentChamado, setCurrentChamado] = useState<ChamadoOS | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<ChamadoFilterParams>({});
  const { toast } = useToast();
  
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const user = await getCurrentUser();
        
        if (user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (error) {
            console.error("Error loading user profile:", error);
            setCurrentUser(user);
          } else {
            setCurrentUser({
              ...user,
              ...profile
            });
          }
        }
      } catch (error) {
        console.error("Error loading current user:", error);
      }
    };
    
    loadCurrentUser();
  }, []);
  
  const loadChamados = async (filters: ChamadoFilterParams = {}) => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage("");
    
    try {
      const data = await fetchChamados(filters);
      setChamados(data);
      setCurrentFilters(filters);
    } catch (error) {
      console.error("Error loading chamados:", error);
      setIsError(true);
      setErrorMessage("Ocorreu um erro ao buscar os dados. Tente novamente.");
      
      toast({
        title: "Erro ao carregar chamados",
        description: "Ocorreu um erro ao buscar os dados. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadChamados();
  }, []);
  
  const handleOpenFormModal = (chamado?: ChamadoOS) => {
    if (chamado) {
      setCurrentChamado(chamado);
    } else {
      setCurrentChamado(null);
    }
    setIsFormModalOpen(true);
  };
  
  const handleOpenDetailsModal = async (chamadoId: string) => {
    setIsLoading(true);
    try {
      const chamado = await getChamadoById(chamadoId);
      setCurrentChamado(chamado);
      setIsDetailsModalOpen(true);
    } catch (error) {
      console.error("Error fetching chamado details:", error);
      toast({
        title: "Erro ao buscar detalhes",
        description: "Não foi possível carregar os detalhes do chamado.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOpenDeleteModal = (chamado: ChamadoOS) => {
    setCurrentChamado(chamado);
    setIsDeleteModalOpen(true);
  };
  
  const handleCreateOrUpdateChamado = async (
    formData: any, 
    photoFiles?: File[]
  ) => {
    setIsLoading(true);
    try {
      if (currentChamado) {
        const updated = await updateChamado(
          currentChamado.id,
          formData,
          photoFiles
        );
        
        setChamados(prev => 
          prev.map(item => item.id === updated.id ? updated : item)
        );
        
        toast({
          title: "Chamado atualizado",
          description: `Chamado #${updated.numero_chamado} foi atualizado com sucesso.`
        });
      } else {
        const created = await createChamado(
          {
            ...formData,
            solicitante_id: currentUser.id
          },
          photoFiles
        );
        
        setChamados(prev => [created, ...prev]);
        
        toast({
          title: "Chamado criado",
          description: `Chamado #${created.numero_chamado} foi criado com sucesso.`
        });
      }
      
      setIsFormModalOpen(false);
    } catch (error) {
      console.error("Error saving chamado:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar o chamado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteChamado = async () => {
    if (!currentChamado) return;
    
    setIsLoading(true);
    try {
      await deleteChamado(currentChamado.id);
      
      setChamados(prev => 
        prev.filter(item => item.id !== currentChamado.id)
      );
      
      toast({
        title: "Chamado excluído",
        description: `Chamado #${currentChamado.numero_chamado} foi excluído com sucesso.`
      });
      
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting chamado:", error);
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir o chamado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleApplyFilters = (filters: ChamadoFilterParams) => {
    loadChamados(filters);
  };
  
  const handleClearFilters = () => {
    loadChamados({});
  };
  
  const handleExportToExcel = async () => {
    setIsLoading(true);
    try {
      const blob = await exportChamadosToExcel(currentFilters);
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `chamados-os-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Exportação concluída",
        description: "Os dados foram exportados com sucesso."
      });
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar os dados. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleConvertToOS = async (chamadoId: string, userId: string) => {
    setIsLoading(true);
    try {
      await updateChamadoStatus(chamadoId, 'Convertido para OS');
      
      setChamados(prev => 
        prev.map(item => 
          item.id === chamadoId 
            ? { ...item, status: 'Convertido para OS' } 
            : item
        )
      );
      
      toast({
        title: "Chamado convertido",
        description: "O chamado foi convertido para OS com sucesso."
      });
    } catch (error) {
      console.error("Error converting chamado to OS:", error);
      setIsError(true);
      setErrorMessage("Ocorreu um erro ao converter o chamado para OS. Tente novamente.");
      
      toast({
        title: "Erro na conversão",
        description: "Ocorreu um erro ao converter o chamado para OS. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    chamados,
    isLoading,
    isError,
    errorMessage,
    currentUser,
    currentChamado,
    isFormModalOpen,
    setIsFormModalOpen,
    isDetailsModalOpen, 
    setIsDetailsModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    handleOpenFormModal,
    handleOpenDetailsModal,
    handleOpenDeleteModal,
    handleCreateOrUpdateChamado,
    handleDeleteChamado,
    handleApplyFilters,
    handleClearFilters,
    handleExportToExcel,
    handleConvertToOS
  };
};
