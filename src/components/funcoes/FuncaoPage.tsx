
import React from "react";
import { Briefcase } from "lucide-react";
import { useFuncaoActions } from "@/hooks/useFuncaoActions";
import FuncaoFormModal from "./FuncaoFormModal";
import FuncaoDetailsModal from "./FuncaoDetailsModal";
import ImportFuncoesModal from "./ImportFuncoesModal";
import FuncaoFilters from "./FuncaoFilters";
import FuncaoTable from "./FuncaoTable";
import DeleteFuncaoDialog from "./DeleteFuncaoDialog";
import FuncaoHeaderActions from "./FuncaoHeaderActions";

const FuncaoPage: React.FC = () => {
  const {
    // Estado
    filters,
    currentFuncao,
    isFormModalOpen,
    isDetailsModalOpen,
    isImportModalOpen,
    isDeleteModalOpen,
    deletingFuncao,
    isDeleting,
    funcoes,
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
  } = useFuncaoActions();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Cadastro de Funções</h1>
        </div>
        
        <FuncaoHeaderActions 
          onNewFuncao={() => openFormModal()}
          onExport={exportToExcel}
          onImport={() => setIsImportModalOpen(true)}
        />
      </div>
      
      <FuncaoFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={resetFilters}
      />
      
      <FuncaoTable 
        funcoes={funcoes}
        isLoading={isLoading}
        isError={isError}
        onEdit={openFormModal}
        onView={openDetailsModal}
        onDelete={confirmDelete}
      />
      
      <FuncaoFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={() => refetch()}
        funcao={currentFuncao || undefined}
      />
      
      <FuncaoDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        funcao={currentFuncao}
      />
      
      <ImportFuncoesModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => refetch()}
      />
      
      <DeleteFuncaoDialog
        isOpen={isDeleteModalOpen}
        isDeleting={isDeleting}
        funcao={deletingFuncao}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default FuncaoPage;
