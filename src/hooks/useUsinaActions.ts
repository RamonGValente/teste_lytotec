
import { useState } from "react";
import { Usina, UsinaFilters } from "@/types/usina";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  fetchUsinas, 
  fetchUsinaById, 
  createUsina, 
  updateUsina, 
  deleteUsina,
  exportUsinasToExcel,
  importUsinas
} from "@/services/usinaService";

export const useUsinaActions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State
  const [filters, setFilters] = useState<UsinaFilters>({});
  const [currentUsina, setCurrentUsina] = useState<Usina | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deletingUsina, setDeletingUsina] = useState<Usina | null>(null);

  // Queries
  const { 
    data: usinas, 
    isLoading, 
    isError,
    refetch
  } = useQuery({
    queryKey: ["usinas", filters],
    queryFn: () => fetchUsinas(filters),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: Omit<Usina, "id" | "created_at" | "updated_at">) => createUsina(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usinas"] });
      toast({
        title: "Usina criada",
        description: "Usina criada com sucesso!",
      });
      setIsFormModalOpen(false);
    },
    onError: (error: any) => {
      console.error("Error creating usina:", error);
      let errorMessage = "Erro ao criar usina.";
      
      if (error.message?.includes("violates unique constraint")) {
        errorMessage = "Já existe uma usina com esse nome.";
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Usina> }) => updateUsina(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usinas"] });
      toast({
        title: "Usina atualizada",
        description: "Usina atualizada com sucesso!",
      });
      setIsFormModalOpen(false);
    },
    onError: (error: any) => {
      console.error("Error updating usina:", error);
      let errorMessage = "Erro ao atualizar usina.";
      
      if (error.message?.includes("violates unique constraint")) {
        errorMessage = "Já existe uma usina com esse nome.";
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUsina(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usinas"] });
      toast({
        title: "Usina excluída",
        description: "Usina excluída com sucesso!",
      });
      setIsDeleteModalOpen(false);
    },
    onError: (error) => {
      console.error("Error deleting usina:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir usina.",
        variant: "destructive",
      });
    },
  });

  const importMutation = useMutation({
    mutationFn: (usinas: Partial<Usina>[]) => importUsinas(usinas),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["usinas"] });
      
      if (result.success) {
        toast({
          title: "Importação concluída",
          description: `${result.imported} usinas importadas com sucesso! ${result.skipped} ignoradas.`,
        });
        setIsImportModalOpen(false);
      } else {
        toast({
          title: "Importação falhou",
          description: result.message,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error("Error importing usinas:", error);
      toast({
        title: "Erro",
        description: "Erro ao importar usinas.",
        variant: "destructive",
      });
    },
  });

  // Actions
  const handleFilterChange = (key: keyof UsinaFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({});
  };

  const openFormModal = (usina?: Usina) => {
    if (usina) {
      setCurrentUsina(usina);
    } else {
      setCurrentUsina(null);
    }
    setIsFormModalOpen(true);
  };

  const openDetailsModal = (usina: Usina) => {
    setCurrentUsina(usina);
    setIsDetailsModalOpen(true);
  };

  const confirmDelete = (usina: Usina) => {
    setDeletingUsina(usina);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (deletingUsina) {
      deleteMutation.mutate(deletingUsina.id);
    }
  };

  const exportToExcel = () => {
    if (usinas && usinas.length > 0) {
      exportUsinasToExcel(usinas);
    } else {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há usinas para exportar.",
        variant: "destructive",
      });
    }
  };

  return {
    // State
    filters,
    currentUsina,
    isFormModalOpen,
    isDetailsModalOpen,
    isImportModalOpen,
    isDeleteModalOpen,
    deletingUsina,
    usinas,
    isLoading,
    isError,
    isDeleting: deleteMutation.isPending,
    isImporting: importMutation.isPending,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    
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
    exportToExcel,
    
    // Mutations
    createUsina: createMutation.mutate,
    updateUsina: (id: string, data: Partial<Usina>) => updateMutation.mutate({ id, data }),
    importUsinas: importMutation.mutate
  };
};
