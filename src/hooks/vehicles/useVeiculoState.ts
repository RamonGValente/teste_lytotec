
import { useState } from "react";
import { Veiculo, VeiculoFilterParams } from "@/types/veiculo";

export const useVeiculoState = (initialSituacaoFilter?: string | null) => {
  // State management
  const [filters, setFilters] = useState<VeiculoFilterParams>(() => {
    const initialFilters: VeiculoFilterParams = {};
    if (initialSituacaoFilter) {
      initialFilters.situacao = initialSituacaoFilter;
    }
    return initialFilters;
  });
  const [currentVeiculo, setCurrentVeiculo] = useState<Veiculo | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingVeiculo, setDeletingVeiculo] = useState<Veiculo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  // Filter handling
  const handleFilterChange = (name: keyof VeiculoFilterParams, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({});
  };

  // Modal management
  const openFormModal = (veiculo?: Veiculo) => {
    setCurrentVeiculo(veiculo || null);
    setCurrentImage(veiculo?.imagem_url || null);
    setIsFormModalOpen(true);
  };

  const openDetailsModal = (veiculo: Veiculo) => {
    setCurrentVeiculo(veiculo);
    setIsDetailsModalOpen(true);
  };

  const confirmDelete = (veiculo: Veiculo) => {
    setDeletingVeiculo(veiculo);
    setIsDeleteModalOpen(true);
  };

  return {
    // State
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
    
    // Actions
    setFilters,
    setCurrentVeiculo,
    setIsFormModalOpen,
    setIsDetailsModalOpen,
    setIsImportModalOpen,
    setIsDeleteModalOpen,
    setDeletingVeiculo,
    setIsSubmitting,
    setIsImporting,
    setCurrentImage,
    handleFilterChange,
    resetFilters,
    openFormModal,
    openDetailsModal,
    confirmDelete,
  };
};
