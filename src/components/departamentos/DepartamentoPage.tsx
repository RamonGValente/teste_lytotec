
import React from "react";
import { Folders } from "lucide-react";
import { useDepartamentoActions } from "@/hooks/useDepartamentoActions";
import DepartamentoFormModal from "./DepartamentoFormModal";
import DepartamentoDetailsModal from "./DepartamentoDetailsModal";
import ImportDepartamentosModal from "./ImportDepartamentosModal";
import DepartamentoFilters from "./DepartamentoFilters";
import DepartamentoTable from "./DepartamentoTable";
import DeleteDepartamentoDialog from "./DeleteDepartamentoDialog";
import DepartamentoHeaderActions from "./DepartamentoHeaderActions";

const DepartamentoPage: React.FC = () => {
  const {
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
  } = useDepartamentoActions();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Folders className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Cadastro de Departamentos</h1>
        </div>
        
        <DepartamentoHeaderActions 
          onNewDepartamento={() => openFormModal()}
          onExport={exportToExcel}
          onImport={() => setIsImportModalOpen(true)}
        />
      </div>
      
      <DepartamentoFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={resetFilters}
      />
      
      <DepartamentoTable 
        departamentos={departamentos}
        isLoading={isLoading}
        isError={isError}
        onEdit={openFormModal}
        onView={openDetailsModal}
        onDelete={confirmDelete}
      />
      
      <DepartamentoFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={() => refetch()}
        departamento={currentDepartamento || undefined}
      />
      
      <DepartamentoDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        departamento={currentDepartamento}
      />
      
      <ImportDepartamentosModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => refetch()}
      />
      
      <DeleteDepartamentoDialog
        isOpen={isDeleteModalOpen}
        isDeleting={isDeleting}
        departamento={deletingDepartamento}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default DepartamentoPage;
