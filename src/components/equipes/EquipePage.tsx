
import React, { useState } from "react";
import { Users } from "lucide-react";
import { useEquipeActions } from "@/hooks/useEquipeActions";
import EquipeFormModal from "./EquipeFormModal";
import EquipeDetailsModal from "./EquipeDetailsModal";
import ImportEquipesModal from "./ImportEquipesModal";
import TransferMembersModal from "./TransferMembersModal";
import EquipeFilters from "./EquipeFilters";
import EquipeTable from "./EquipeTable";
import DeleteEquipeDialog from "./DeleteEquipeDialog";
import EquipeHeaderActions from "./EquipeHeaderActions";

const EquipePage: React.FC = () => {
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedEquipeForTransfer, setSelectedEquipeForTransfer] = useState(null);

  const {
    // Estado
    filters,
    currentEquipe,
    isFormModalOpen,
    isDetailsModalOpen,
    isImportModalOpen,
    isDeleteModalOpen,
    deletingEquipe,
    isDeleting,
    
    // Dados
    equipes,
    isLoading,
    isError,
    encarregados,
    apontadores,
    allFuncionarios,
    
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
  } = useEquipeActions();

  const handleOpenTransferModal = (equipe) => {
    setSelectedEquipeForTransfer(equipe);
    setTransferModalOpen(true);
  };

  const handleCloseTransferModal = () => {
    setTransferModalOpen(false);
    setSelectedEquipeForTransfer(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Cadastro de Equipes</h1>
        </div>
        
        <EquipeHeaderActions 
          onNewEquipe={() => openFormModal()}
          onExport={() => exportToExcel(equipes)}
          onImport={() => setIsImportModalOpen(true)}
        />
      </div>
      
      <EquipeFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={resetFilters}
        encarregados={encarregados}
        apontadores={apontadores}
      />
      
      <EquipeTable 
        equipes={equipes}
        isLoading={isLoading}
        isError={isError}
        onEdit={openFormModal}
        onView={openDetailsModal}
        onDelete={confirmDelete}
        onTransfer={handleOpenTransferModal}
      />
      
      <EquipeFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={() => refetch()}
        equipe={currentEquipe || undefined}
        encarregados={encarregados}
        apontadores={apontadores}
        allFuncionarios={allFuncionarios}
      />
      
      <EquipeDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        equipe={currentEquipe}
      />
      
      <ImportEquipesModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => refetch()}
      />

      {selectedEquipeForTransfer && (
        <TransferMembersModal
          isOpen={transferModalOpen}
          onClose={handleCloseTransferModal}
          sourceEquipe={selectedEquipeForTransfer}
          allEquipes={equipes}
          allFuncionarios={allFuncionarios}
        />
      )}
      
      <DeleteEquipeDialog
        isOpen={isDeleteModalOpen}
        isDeleting={isDeleting}
        equipe={deletingEquipe}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default EquipePage;
