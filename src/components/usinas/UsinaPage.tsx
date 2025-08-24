
import React from "react";
import { Factory } from "lucide-react";
import { useUsinaActions } from "@/hooks/useUsinaActions";
import UsinaFormModal from "./UsinaFormModal";
import UsinaDetailsModal from "./UsinaDetailsModal";
import ImportUsinasModal from "./ImportUsinasModal";
import UsinaFilters from "./UsinaFilters";
import UsinaTable from "./UsinaTable";
import DeleteUsinaDialog from "./DeleteUsinaDialog";
import UsinaHeaderActions from "./UsinaHeaderActions";
import { Usina } from "@/types/usina";

const UsinaPage: React.FC = () => {
  const {
    // State
    filters,
    currentUsina,
    isFormModalOpen,
    isDetailsModalOpen,
    isImportModalOpen,
    isDeleteModalOpen,
    deletingUsina,
    isDeleting,
    usinas,
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
    exportToExcel,
    
    // Mutations
    createUsina,
    updateUsina,
    importUsinas
  } = useUsinaActions();

  // Função para garantir que o manipulador de save retorne Promise<void>
  const handleSave = async (id: string | undefined, data: Partial<Usina>): Promise<void> => {
    if (id) {
      await updateUsina(id, data);
      return;
    } else {
      await createUsina({
        nome_usina: data.nome_usina as string,
        endereco: data.endereco,
        producao_total: data.producao_total,
        telefone: data.telefone
      });
      return;
    }
  };

  // Garantir que handleDelete retorne Promise<void>
  const handleDeleteWithPromise = async (): Promise<void> => {
    await handleDelete();
    return;
  };

  // Garantir que importUsinas retorne Promise<void>
  const handleImport = async (usinas: any[]): Promise<void> => {
    await importUsinas(usinas);
    return;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Factory className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Cadastro de Usinas</h1>
        </div>
        
        <UsinaHeaderActions 
          onNewUsina={() => openFormModal()}
          onExport={exportToExcel}
          onImport={() => setIsImportModalOpen(true)}
        />
      </div>
      
      <UsinaFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={resetFilters}
      />
      
      <UsinaTable 
        usinas={usinas || []}
        isLoading={isLoading}
        isError={isError}
        onEdit={openFormModal}
        onView={openDetailsModal}
        onDelete={confirmDelete}
      />
      
      <UsinaFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={() => refetch()}
        usina={currentUsina || undefined}
        onSave={handleSave}
      />
      
      <UsinaDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        usina={currentUsina}
      />
      
      <ImportUsinasModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => refetch()}
        onImport={handleImport}
      />
      
      <DeleteUsinaDialog
        isOpen={isDeleteModalOpen}
        isDeleting={isDeleting}
        usina={deletingUsina}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteWithPromise}
      />
    </div>
  );
};

export default UsinaPage;
