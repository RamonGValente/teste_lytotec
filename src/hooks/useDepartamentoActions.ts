
import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Departamento, DepartamentoFilter } from "@/types/departamento";
import { 
  fetchDepartamentos, 
  deleteDepartamento, 
  exportToExcel as exportService
} from "@/services/departamentoService";
import { useToast } from "./use-toast";

export function useDepartamentoActions() {
  const [filters, setFilters] = useState<DepartamentoFilter>({});
  const [currentDepartamento, setCurrentDepartamento] = useState<Departamento | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingDepartamento, setDeletingDepartamento] = useState<Departamento | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para buscar departamentos
  const { 
    data: departamentos, 
    isLoading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ['departamentos', filters],
    queryFn: () => fetchDepartamentos(filters)
  });

  // Mutation para excluir departamento
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDepartamento(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departamentos'] });
      toast({
        title: "Departamento excluído",
        description: "O departamento foi excluído com sucesso."
      });
      setIsDeleteModalOpen(false);
      setDeletingDepartamento(null);
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

  const openFormModal = useCallback((departamento?: Departamento) => {
    setCurrentDepartamento(departamento || null);
    setIsFormModalOpen(true);
  }, []);

  const openDetailsModal = useCallback((departamento: Departamento) => {
    setCurrentDepartamento(departamento);
    setIsDetailsModalOpen(true);
  }, []);

  const confirmDelete = useCallback((departamento: Departamento) => {
    setDeletingDepartamento(departamento);
    setIsDeleteModalOpen(true);
  }, []);

  const handleDelete = useCallback(() => {
    if (deletingDepartamento) {
      setIsDeleting(true);
      deleteMutation.mutate(deletingDepartamento.id);
    }
  }, [deletingDepartamento, deleteMutation]);

  const exportToExcel = useCallback(() => {
    if (departamentos && departamentos.length > 0) {
      exportService(departamentos);
      toast({
        title: "Exportação concluída",
        description: "Os dados foram exportados com sucesso."
      });
    } else {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há departamentos para exportar.",
        variant: "destructive"
      });
    }
  }, [departamentos, toast]);

  return {
    // Estado
    filters,
    currentDepartamento,
    isFormModalOpen,
    isDetailsModalOpen,
    isImportModalOpen,
    isDeleteModalOpen,
    deletingDepartamento,
    isDeleting,
    departamentos,
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
    exportToExcel
  };
}
