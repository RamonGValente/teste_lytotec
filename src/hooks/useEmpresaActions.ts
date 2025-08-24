
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { getEmpresas, deleteEmpresa } from "@/services/empresaService";
import { Empresa, EmpresaFilterParams } from "@/types/empresa";

export function useEmpresaActions() {
  const { toast } = useToast();
  const [filters, setFilters] = useState<EmpresaFilterParams>({});
  const [currentEmpresa, setCurrentEmpresa] = useState<Empresa | undefined>(undefined);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingEmpresa, setDeletingEmpresa] = useState<Empresa | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data: empresas,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['empresas', filters],
    queryFn: () => getEmpresas(filters),
  });

  const handleFilterChange = (key: keyof EmpresaFilterParams, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({});
  };

  const openFormModal = (empresa?: Empresa) => {
    setCurrentEmpresa(empresa);
    setIsFormModalOpen(true);
  };

  const openDetailsModal = (empresa: Empresa) => {
    setCurrentEmpresa(empresa);
    setIsDetailsModalOpen(true);
  };

  const confirmDelete = (empresa: Empresa) => {
    setDeletingEmpresa(empresa);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingEmpresa) return;
    
    try {
      setIsDeleting(true);
      console.log('Deleting empresa:', deletingEmpresa);
      
      await deleteEmpresa(deletingEmpresa.id);
      
      // Close the modal and reset state first
      setIsDeleteModalOpen(false);
      
      toast({
        title: "Empresa excluída",
        description: `A empresa "${deletingEmpresa.nome_empresa}" foi excluída com sucesso.`
      });
      
      // After a short delay, reset the state and refetch data
      setTimeout(() => {
        setDeletingEmpresa(null);
        setIsDeleting(false);
        refetch();
      }, 500);
      
    } catch (error) {
      console.error("Erro ao excluir empresa:", error);
      setIsDeleting(false);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao excluir a empresa.",
        variant: "destructive"
      });
    }
  };

  const exportToExcel = () => {
    if (!empresas || empresas.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há empresas para exportar.",
        variant: "destructive"
      });
      return;
    }
    
    const exportData = empresas.map(empresa => ({
      'Nome da Empresa': empresa.nome_empresa,
      'CNPJ': empresa.cnpj,
      'Telefone': empresa.telefone || 'Não informado',
      'Situação': empresa.situacao
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Empresas");
    
    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `empresas_${date}.xlsx`);
    
    toast({
      title: "Exportação concluída",
      description: "Os dados foram exportados com sucesso."
    });
  };

  return {
    // State
    filters,
    currentEmpresa,
    isFormModalOpen,
    isDetailsModalOpen,
    isImportModalOpen,
    isDeleteModalOpen,
    deletingEmpresa,
    isDeleting,
    empresas,
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
    exportToExcel
  };
}

// Add XLSX import
import * as XLSX from 'xlsx';
