
import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CentroCusto, CentroCustoFilter } from "@/types/centroCusto";
import { 
  fetchCentrosCusto, 
  deleteCentroCusto, 
  exportToExcel as exportService
} from "@/services/centroCustoService";
import { useToast } from "./use-toast";

export function useCentroCustoActions() {
  const [filters, setFilters] = useState<CentroCustoFilter>({});
  const [currentCentroCusto, setCurrentCentroCusto] = useState<CentroCusto | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingCentroCusto, setDeletingCentroCusto] = useState<CentroCusto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para buscar centros de custo
  const { 
    data: centrosCusto, 
    isLoading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ['centrosCusto', filters],
    queryFn: () => fetchCentrosCusto(filters)
  });

  // Mutation para excluir centro de custo
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCentroCusto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['centrosCusto'] });
      toast({
        title: "Centro de custo excluído",
        description: "O centro de custo foi excluído com sucesso."
      });
      setIsDeleteModalOpen(false);
      setDeletingCentroCusto(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsDeleting(false);
    }
  });

  // Manipuladores de eventos
  const handleFilterChange = useCallback((name: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [name]: value || undefined
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
  }, []);

  const openFormModal = useCallback((centroCusto?: CentroCusto) => {
    setCurrentCentroCusto(centroCusto || null);
    setIsFormModalOpen(true);
  }, []);

  const openDetailsModal = useCallback((centroCusto: CentroCusto) => {
    setCurrentCentroCusto(centroCusto);
    setIsDetailsModalOpen(true);
  }, []);

  const confirmDelete = useCallback((centroCusto: CentroCusto) => {
    setDeletingCentroCusto(centroCusto);
    setIsDeleteModalOpen(true);
  }, []);

  const handleDelete = useCallback(() => {
    if (deletingCentroCusto) {
      setIsDeleting(true);
      deleteMutation.mutate(deletingCentroCusto.id);
    }
  }, [deletingCentroCusto, deleteMutation]);

  const exportToExcel = useCallback(() => {
    if (centrosCusto && centrosCusto.length > 0) {
      exportService(centrosCusto);
      toast({
        title: "Exportação concluída",
        description: "Os dados foram exportados com sucesso."
      });
    } else {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há centros de custo para exportar.",
        variant: "destructive"
      });
    }
  }, [centrosCusto, toast]);

  const openImportModal = useCallback(() => {
    setIsImportModalOpen(true);
  }, []);

  return {
    // Estado
    filters,
    currentCentroCusto,
    isFormModalOpen,
    isDetailsModalOpen,
    isImportModalOpen,
    isDeleteModalOpen,
    deletingCentroCusto,
    isDeleting,
    centrosCusto,
    isLoading,
    isError,
    
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
    exportToExcel,
    openImportModal
  };
}
