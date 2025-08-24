
import { useCallback } from "react";
import { useEquipeState } from "./useEquipeState";
import { useEquipeQueries } from "./useEquipeQueries";
import { useEquipeExcel } from "./useEquipeExcel";
import { useEquipeImport } from "./useEquipeImport";
import { useToast } from "./use-toast";
import { Equipe, EquipeFilter } from "@/types/equipe";

export function useEquipeActions() {
  const { toast } = useToast();
  
  // Get all state management from useEquipeState
  const equipeState = useEquipeState();
  const { 
    filters, 
    setFilters, 
    currentEquipe, 
    setCurrentEquipe,
    isFormModalOpen,
    setIsFormModalOpen,
    isDetailsModalOpen,
    setIsDetailsModalOpen,
    isImportModalOpen,
    setIsImportModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    deletingEquipe,
    setDeletingEquipe,
    isDeleting,
    setIsDeleting
  } = equipeState;
  
  // Get queries and mutations from useEquipeQueries
  const { 
    equipes, 
    isLoading, 
    isError, 
    refetch,
    encarregados,
    apontadores,
    allFuncionarios,
    deleteEquipeMutation
  } = useEquipeQueries(filters);
  
  // Get Excel functionality
  const { exportToExcel } = useEquipeExcel();
  
  // Get import functionality
  const { handleImport } = useEquipeImport(() => {
    setIsImportModalOpen(false);
    refetch();
  });
  
  // Filter handlers
  const handleFilterChange = useCallback((filterName: keyof EquipeFilter, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  }, [setFilters]);
  
  const resetFilters = useCallback(() => {
    setFilters({});
  }, [setFilters]);
  
  // Modal handlers
  const openFormModal = useCallback((equipe?: Equipe) => {
    setCurrentEquipe(equipe || null);
    setIsFormModalOpen(true);
  }, [setCurrentEquipe, setIsFormModalOpen]);
  
  const openDetailsModal = useCallback((equipe: Equipe) => {
    setCurrentEquipe(equipe);
    setIsDetailsModalOpen(true);
  }, [setCurrentEquipe, setIsDetailsModalOpen]);
  
  // Delete handlers
  const confirmDelete = useCallback((equipe: Equipe) => {
    setDeletingEquipe(equipe);
    setIsDeleteModalOpen(true);
  }, [setDeletingEquipe, setIsDeleteModalOpen]);
  
  const handleDelete = useCallback(async () => {
    if (!deletingEquipe) return;
    
    try {
      setIsDeleting(true);
      
      await deleteEquipeMutation.mutateAsync(deletingEquipe.id);
      
      toast({
        title: "Equipe excluída",
        description: "A equipe foi excluída com sucesso."
      });
      
      setIsDeleteModalOpen(false);
      setDeletingEquipe(null);
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao excluir a equipe.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  }, [deletingEquipe, deleteEquipeMutation, setIsDeleteModalOpen, setDeletingEquipe, setIsDeleting, toast]);
  
  return {
    // State
    ...equipeState,
    
    // Data
    equipes,
    isLoading,
    isError,
    encarregados,
    apontadores,
    allFuncionarios,
    
    // Actions
    handleFilterChange,
    resetFilters,
    openFormModal,
    openDetailsModal,
    confirmDelete,
    handleDelete,
    refetch,
    exportToExcel,
    handleImport
  };
}
