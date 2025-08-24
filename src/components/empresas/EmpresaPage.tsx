
import React from "react";
import { Building2 } from "lucide-react";
import { useEmpresaActions } from "@/hooks/useEmpresaActions";
import { useEmpresaAdmin } from "@/hooks/useEmpresaAdmin";
import EmpresaFormModal from "./EmpresaFormModal";
import EmpresaDetailsModal from "./EmpresaDetailsModal";
import ImportEmpresasModal from "./ImportEmpresasModal";
import EmpresaFilters from "./EmpresaFilters";
import EmpresaTable from "./EmpresaTable";
import DeleteEmpresaDialog from "./DeleteEmpresaDialog";
import EmpresaHeaderActions from "./EmpresaHeaderActions";

const EmpresaPage: React.FC = () => {
  // Use null instead of string for the user parameter
  const { isAdmin } = useEmpresaAdmin(null);
  
  const {
    // Estado
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
  } = useEmpresaActions();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Cadastro de Empresas</h1>
        </div>
        
        <EmpresaHeaderActions 
          onNewEmpresa={() => openFormModal()}
          onExport={exportToExcel}
          onImport={() => setIsImportModalOpen(true)}
        />
      </div>
      
      <EmpresaFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={resetFilters}
      />
      
      <EmpresaTable 
        empresas={empresas}
        isLoading={isLoading}
        isError={isError}
        onEdit={openFormModal}
        onView={openDetailsModal}
        onDelete={confirmDelete}
      />
      
      <EmpresaFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={() => refetch()}
        empresa={currentEmpresa}
      />
      
      <EmpresaDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        empresa={currentEmpresa}
      />
      
      <ImportEmpresasModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => refetch()}
      />
      
      <DeleteEmpresaDialog
        isOpen={isDeleteModalOpen}
        isDeleting={isDeleting}
        empresa={deletingEmpresa}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default EmpresaPage;
