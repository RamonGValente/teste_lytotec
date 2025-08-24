
import React from "react";
import ProgramacaoEntregaFilters from "./ProgramacaoEntregaFilters";
import ProgramacaoEntregaTable from "./ProgramacaoEntregaTable";
import ProgramacaoEntregaHeaderActions from "./ProgramacaoEntregaHeaderActions";
import ProgramacaoEntregaFormModal from "./ProgramacaoEntregaFormModal";
import DeleteProgramacaoDialog from "./DeleteProgramacaoDialog";
import ProgramacaoEntregaDetailsModal from "./ProgramacaoEntregaDetailsModal";
import { useProgramacaoEntregaActions } from "@/hooks/useProgramacaoEntregaActions";

const ProgramacaoEntregaPage: React.FC = () => {
  const {
    programacoes,
    isLoading,
    isError,
    filters,
    currentProgramacao,
    isFormModalOpen,
    isDetailsModalOpen,
    isDeleteModalOpen,
    deletingProgramacao,
    isDeleting,
    setIsFormModalOpen,
    setIsDetailsModalOpen,
    setIsDeleteModalOpen,
    handleFilterChange,
    resetFilters,
    openFormModal,
    openDetailsModal,
    confirmDelete,
    handleDelete,
    exportToExcel,
    refetch
  } = useProgramacaoEntregaActions();

  const handleModalSuccess = async () => {
    await refetch();
    setIsFormModalOpen(false);
  };

  if (isError) {
    return (
      <div className="container py-6">
        <div className="rounded-lg bg-destructive/15 p-4 text-destructive">
          Erro ao carregar dados. Por favor, tente novamente mais tarde.
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Programação de Entrega</h1>
        <ProgramacaoEntregaHeaderActions 
          onNewClick={() => openFormModal()} 
          onExport={exportToExcel}
        />
      </div>

      <ProgramacaoEntregaFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={resetFilters}
      />

      <ProgramacaoEntregaTable 
        programacoes={programacoes}
        isLoading={isLoading}
        onView={openDetailsModal}
        onEdit={openFormModal}
        onDelete={confirmDelete}
      />

      {/* Modals and Dialogs */}
      <ProgramacaoEntregaFormModal 
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={handleModalSuccess}
        programacao={currentProgramacao}
      />

      <ProgramacaoEntregaDetailsModal 
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        programacao={currentProgramacao}
      />

      <DeleteProgramacaoDialog 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        programacao={deletingProgramacao}
      />
    </div>
  );
};

export default ProgramacaoEntregaPage;
