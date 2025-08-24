import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  fetchOpenChamados,
  fetchOrdensServico,
  getOrdemServicoById,
  convertChamadoToOs,
  updateOrdemServico,
  getMaterialsByOsId,
  getMaoDeObraByOsId,
  getMovimentacoesByOsId,
  saveMaterial,
  deleteMaterial,
  saveMaoDeObra,
  deleteMaoDeObra,
  exportOsToExcel,
  getChamadoById,
  updateChamadoStatus,
  finishOrdemServico,
  generateOsPdf
} from "@/services/ordemServicoService";
import { OrdemServico, Material, MaoDeObra, Movimentacao, OsFilterParams } from "@/types/ordemServico";
import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const useOrdemServico = () => {
  const [openChamados, setOpenChamados] = useState<any[]>([]);
  const [ordensServico, setOrdensServico] = useState<OrdemServico[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [currentOs, setCurrentOs] = useState<OrdemServico | null>(null);
  const [currentChamado, setCurrentChamado] = useState<any | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isOsModalOpen, setIsOsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [isChamadoModalOpen, setIsChamadoModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<OsFilterParams>({});
  const [activeTab, setActiveTab] = useState<string>("chamados");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [laborItems, setLaborItems] = useState<MaoDeObra[]>([]);
  const [movements, setMovements] = useState<Movimentacao[]>([]);
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
  
  const loadOpenChamados = async (filters: OsFilterParams = {}) => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage("");
    
    try {
      console.log("Loading open chamados with filters:", filters);
      const data = await fetchOpenChamados(filters);
      console.log("Loaded open chamados:", data);
      setOpenChamados(data);
      setCurrentFilters(filters);
    } catch (error) {
      console.error("Error loading open chamados:", error);
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
  
  const loadOrdensServico = async (filters: OsFilterParams = {}) => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage("");
    
    try {
      const data = await fetchOrdensServico(filters);
      setOrdensServico(data);
      setCurrentFilters(filters);
    } catch (error) {
      console.error("Error loading ordens de serviço:", error);
      setIsError(true);
      setErrorMessage("Ocorreu um erro ao buscar os dados. Tente novamente.");
      
      toast({
        title: "Erro ao carregar ordens de serviço",
        description: "Ocorreu um erro ao buscar os dados. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (activeTab === "chamados") {
      loadOpenChamados({});
    } else {
      loadOrdensServico({});
    }
  }, [activeTab]);
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentFilters({});
  };
  
  const handleOpenChamadoDetails = async (chamado: any) => {
    setIsLoading(true);
    try {
      const detailedChamado = await getChamadoById(chamado.id);
      setCurrentChamado(detailedChamado);
      setIsChamadoModalOpen(true);
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
  
  const handleOpenOsModal = async (os?: OrdemServico) => {
    if (os) {
      await loadOsDetails(os.id);
    } else {
      setCurrentOs(null);
      setMaterials([]);
      setLaborItems([]);
      setMovements([]);
    }
    setIsOsModalOpen(true);
  };
  
  const loadOsDetails = async (osId: string) => {
    setIsLoading(true);
    try {
      const [os, materials, labor, movements] = await Promise.all([
        getOrdemServicoById(osId),
        getMaterialsByOsId(osId),
        getMaoDeObraByOsId(osId),
        getMovimentacoesByOsId(osId)
      ]);
      
      setCurrentOs(os);
      setMaterials(materials);
      setLaborItems(labor);
      setMovements(movements);
    } catch (error) {
      console.error("Error loading OS details:", error);
      toast({
        title: "Erro ao carregar detalhes",
        description: "Não foi possível carregar os detalhes da ordem de serviço.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOpenDetailsModal = async (osId: string) => {
    setIsLoading(true);
    try {
      await loadOsDetails(osId);
      setIsDetailsModalOpen(true);
    } catch (error) {
      console.error("Error fetching OS details:", error);
      toast({
        title: "Erro ao buscar detalhes",
        description: "Não foi possível carregar os detalhes da ordem de serviço.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleConvertToOs = async (chamadoId: string, osData?: Partial<OrdemServico>) => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const newOs = await convertChamadoToOs(chamadoId, currentUser.id, osData);
      
      await updateChamadoStatus(chamadoId, 'OS em Andamento');
      
      toast({
        title: "Chamado convertido",
        description: "O chamado foi convertido para Ordem de Serviço com sucesso."
      });
      
      await loadOpenChamados(currentFilters);
      
      setIsDetailsModalOpen(false);
    } catch (error) {
      console.error("Error converting chamado to OS:", error);
      toast({
        title: "Erro na conversão",
        description: "Ocorreu um erro ao converter o chamado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdateOs = async (osData: Partial<OrdemServico>, motivo: string) => {
    if (!currentOs || !currentUser) return;
    
    setIsLoading(true);
    try {
      const updated = await updateOrdemServico(
        currentOs.id,
        osData,
        currentUser.id,
        motivo
      );
      
      await loadOsDetails(currentOs.id);
      loadOrdensServico(currentFilters);
      
      toast({
        title: "OS atualizada",
        description: `OS ${updated.numero_chamado} foi atualizada com sucesso.`
      });
    } catch (error) {
      console.error("Error updating OS:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao atualizar a OS. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveMaterial = async (material: Partial<Material>) => {
    if (!currentOs) return;
    
    setIsLoading(true);
    try {
      const savedMaterial = await saveMaterial({
        ...material,
        os_id: currentOs.id
      });
      
      setMaterials(prev => {
        const index = prev.findIndex(m => m.id === savedMaterial.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = savedMaterial;
          return updated;
        }
        return [...prev, savedMaterial];
      });
      
      toast({
        title: "Material salvo",
        description: "Material adicionado/atualizado com sucesso."
      });
    } catch (error) {
      console.error("Error saving material:", error);
      toast({
        title: "Erro ao salvar material",
        description: "Ocorreu um erro ao salvar o material. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteMaterial = async (materialId: string) => {
    setIsLoading(true);
    try {
      await deleteMaterial(materialId);
      
      setMaterials(prev => prev.filter(m => m.id !== materialId));
      
      toast({
        title: "Material excluído",
        description: "Material excluído com sucesso."
      });
    } catch (error) {
      console.error("Error deleting material:", error);
      toast({
        title: "Erro ao excluir material",
        description: "Ocorreu um erro ao excluir o material. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveMaoDeObra = async (maoDeObra: Partial<MaoDeObra>) => {
    if (!currentOs) return;
    
    setIsLoading(true);
    try {
      const savedMaoDeObra = await saveMaoDeObra({
        ...maoDeObra,
        os_id: currentOs.id
      });
      
      setLaborItems(prev => {
        const index = prev.findIndex(m => m.id === savedMaoDeObra.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = savedMaoDeObra;
          return updated;
        }
        return [...prev, savedMaoDeObra];
      });
      
      toast({
        title: "Mão de obra salva",
        description: "Mão de obra adicionada/atualizada com sucesso."
      });
    } catch (error) {
      console.error("Error saving labor:", error);
      toast({
        title: "Erro ao salvar mão de obra",
        description: "Ocorreu um erro ao salvar a mão de obra. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteMaoDeObra = async (maoDeObraId: string) => {
    setIsLoading(true);
    try {
      await deleteMaoDeObra(maoDeObraId);
      
      setLaborItems(prev => prev.filter(m => m.id !== maoDeObraId));
      
      toast({
        title: "Mão de obra excluída",
        description: "Mão de obra excluída com sucesso."
      });
    } catch (error) {
      console.error("Error deleting labor:", error);
      toast({
        title: "Erro ao excluir mão de obra",
        description: "Ocorreu um erro ao excluir a mão de obra. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFinishOs = async (osId: string) => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      await finishOrdemServico(osId, currentUser.id);
      
      toast({
        title: "OS encerrada",
        description: "A ordem de serviço foi encerrada com sucesso."
      });
      
      await loadOsDetails(osId);
      loadOrdensServico(currentFilters);
      
      setIsOsModalOpen(false);
    } catch (error) {
      console.error("Error finishing OS:", error);
      toast({
        title: "Erro ao encerrar OS",
        description: "Ocorreu um erro ao encerrar a ordem de serviço. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGeneratePdf = async (osId: string) => {
    setIsLoading(true);
    try {
      await generateOsPdf(osId);
      
      toast({
        title: "PDF gerado",
        description: "O PDF da ordem de serviço foi gerado com sucesso."
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro ao gerar o PDF. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleApplyChamadoFilters = (filters: OsFilterParams) => {
    loadOpenChamados(filters);
  };
  
  const handleApplyOsFilters = (filters: OsFilterParams) => {
    loadOrdensServico(filters);
  };
  
  const handleClearFilters = () => {
    if (activeTab === "chamados") {
      loadOpenChamados({});
    } else {
      loadOrdensServico({});
    }
  };
  
  const handleExportToExcel = async () => {
    setIsLoading(true);
    try {
      const blob = await exportOsToExcel(currentFilters);
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ordens-servico-${new Date().toISOString().slice(0, 10)}.csv`;
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
  
  return {
    openChamados,
    ordensServico,
    isLoading,
    isError,
    errorMessage,
    currentUser,
    currentOs,
    currentChamado,
    materials,
    laborItems,
    movements,
    isOsModalOpen,
    setIsOsModalOpen,
    isDetailsModalOpen, 
    setIsDetailsModalOpen,
    isConvertModalOpen,
    setIsConvertModalOpen,
    isChamadoModalOpen,
    setIsChamadoModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    activeTab,
    handleTabChange,
    handleOpenChamadoDetails,
    handleOpenOsModal,
    handleOpenDetailsModal,
    handleConvertToOs,
    handleUpdateOs,
    handleSaveMaterial,
    handleDeleteMaterial,
    handleSaveMaoDeObra,
    handleDeleteMaoDeObra,
    handleApplyChamadoFilters,
    handleApplyOsFilters,
    handleClearFilters,
    handleExportToExcel,
    handleFinishOs,
    handleGeneratePdf
  };
};
