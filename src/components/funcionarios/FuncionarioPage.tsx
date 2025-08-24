
import React, { useState } from "react";
import { Users, Download, Upload, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFuncionarioActions } from "@/hooks/useFuncionarioActions";
import FuncionarioTable from "./FuncionarioTable";
import FuncionarioFilters from "./FuncionarioFilters";
import FuncionarioFormModal from "./FuncionarioFormModal";
import FuncionarioDetailsModal from "./FuncionarioDetailsModal";
import FuncionarioImportModal from "./FuncionarioImportModal";
import DeleteFuncionarioDialog from "./DeleteFuncionarioDialog";
import EmailConfirmationModal from "./EmailConfirmationModal";

interface FuncionarioPageProps {
  openImageModal?: (funcionario: any) => void;
}

const FuncionarioPage: React.FC<FuncionarioPageProps> = ({ openImageModal }) => {
  const [isEmailConfirmationOpen, setIsEmailConfirmationOpen] = useState(false);
  
  const {
    filters,
    currentFuncionario,
    isFormModalOpen,
    isDetailsModalOpen,
    isImportModalOpen,
    isDeleteModalOpen,
    deletingFuncionario,
    isDeleting,
    isImporting,
    isSubmitting,
    deleteErrorMessage,
    funcionarios,
    isLoading,
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
    handleSaveFuncionario,
    refetch,
    exportToExcel,
    handleImport
  } = useFuncionarioActions();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Funcionários</h1>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEmailConfirmationOpen(true)}
            className="flex items-center gap-2"
          >
            <UserCheck className="h-4 w-4" />
            Confirmar Email
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportToExcel}
            disabled={isLoading || !funcionarios?.length}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Importar
          </Button>
          <Button onClick={() => openFormModal()}>
            Novo Funcionário
          </Button>
        </div>
      </div>

      <FuncionarioFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
      />


      <FuncionarioTable
        funcionarios={funcionarios || []}
        isLoading={isLoading}
        isError={isError}
        onEdit={openFormModal}
        onDelete={confirmDelete}
        onViewDetails={openDetailsModal}
        onRefetch={refetch}
        openImageModal={openImageModal}
      />

      <FuncionarioFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        funcionario={currentFuncionario}
        onSubmit={handleSaveFuncionario}
        isSubmitting={isSubmitting}
      />

      <FuncionarioDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        funcionario={currentFuncionario}
      />

      <FuncionarioImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        isImporting={isImporting}
      />

      <DeleteFuncionarioDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        funcionarioId={deletingFuncionario?.id}
        funcionarioNome={deletingFuncionario?.nome_completo}
        isDeleting={isDeleting}
        errorMessage={deleteErrorMessage}
      />

      <EmailConfirmationModal
        isOpen={isEmailConfirmationOpen}
        onClose={() => setIsEmailConfirmationOpen(false)}
      />
    </div>
  );
};

export default FuncionarioPage;
