
import { useState } from "react";
import { Veiculo, VeiculoFormData } from "@/types/veiculo";
import { useVeiculoState } from "./vehicles/useVeiculoState";
import { useVeiculoQueries } from "./vehicles/useVeiculoQueries";
import { useVeiculoMutations } from "./vehicles/useVeiculoMutations";
import { useVeiculoUtils } from "./vehicles/useVeiculoActions";
import { getEmpresasDropdown } from "@/services/veiculo";
import { useQuery } from "@tanstack/react-query";

export const useVeiculoActions = (initialSituacaoFilter?: string | null) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    filters,
    currentVeiculo,
    isFormModalOpen,
    isDetailsModalOpen,
    isImportModalOpen,
    isDeleteModalOpen,
    deletingVeiculo,
    isImporting,
    currentImage,
    setIsFormModalOpen,
    setIsDetailsModalOpen,
    setIsImportModalOpen,
    setIsDeleteModalOpen,
    setCurrentImage,
    handleFilterChange,
    resetFilters,
    openFormModal,
    openDetailsModal,
    confirmDelete,
  } = useVeiculoState(initialSituacaoFilter);

  const {
    veiculos,
    isLoading,
    isError,
    refetch,
    departamentosDropdown,
    isLoadingDepartamentos,
    marcasDropdown,
    isLoadingMarcas,
  } = useVeiculoQueries(filters);

  const { data: empresasDropdown = [], isLoading: isLoadingEmpresas } = useQuery({
    queryKey: ['empresas-dropdown'],
    queryFn: () => getEmpresasDropdown(),
  });

  const closeFormModal = () => setIsFormModalOpen(false);
  const closeDetailsModal = () => setIsDetailsModalOpen(false);
  const closeImportModal = () => setIsImportModalOpen(false);
  const closeDeleteModal = () => setIsDeleteModalOpen(false);

  const {
    createVeiculo,
    updateVeiculo,
    deleteVeiculo,
    importVeiculos,
    isCreating,
    isUpdating,
    isDeleting,
  } = useVeiculoMutations(
    undefined, // general callback
    closeFormModal, // create success
    closeFormModal, // update success
    closeDeleteModal, // delete success
    closeImportModal // import success
  );

  const { exportToExcel } = useVeiculoUtils(veiculos);

  const handleDelete = async () => {
    if (deletingVeiculo?.id) {
      return deleteVeiculo(deletingVeiculo.id);
    }
  };

  // Handle direct file import
  const handleImport = async (data: VeiculoFormData[] | File): Promise<{ success: any[]; errors: any[] }> => {
    setIsSubmitting(true);
    console.log("handleImport called with:", data instanceof File ? "File" : "Data array");
    try {
      const result = await importVeiculos(data);
      console.log("Import result:", result);
      setIsSubmitting(false);
      return result;
    } catch (error) {
      console.error("Error in handleImport:", error);
      setIsSubmitting(false);
      return { 
        success: [], 
        errors: [{ message: error instanceof Error ? error.message : "Unknown error during import" }] 
      };
    }
  };

  const handleSaveVeiculo = async (id: string | undefined, data: any) => {
    setIsSubmitting(true);
    if (id) {
      await updateVeiculo(id, data);
    } else {
      await createVeiculo(data);
    }
    setIsSubmitting(false);
  };

  return {
    filters,
    currentVeiculo,
    isFormModalOpen,
    isDetailsModalOpen,
    isImportModalOpen,
    isDeleteModalOpen,
    deletingVeiculo,
    isSubmitting,
    isImporting,
    currentImage,
    
    veiculos,
    departamentosDropdown,
    marcasDropdown,
    empresasDropdown,
    isLoading,
    isLoadingDepartamentos,
    isLoadingMarcas,
    isLoadingEmpresas,
    isError,

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
    handleImport,
    setCurrentImage,

    createVeiculo,
    updateVeiculo,
    deleteVeiculo,
    handleSaveVeiculo,
  };
};
