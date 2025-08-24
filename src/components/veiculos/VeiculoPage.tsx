
import React, { useState } from "react";
import { Truck } from "lucide-react";
import { useVeiculoActions } from "@/hooks/useVeiculoActions";
import VeiculoFilters from "./VeiculoFilters";
import VeiculoTable from "./VeiculoTable";
import VeiculoFormModal from "./VeiculoFormModal";
import VeiculoDetailsModal from "./VeiculoDetailsModal";
import ImportVeiculosModal from "./ImportVeiculosModal";
import DeleteVeiculoDialog from "./DeleteVeiculoDialog";
import VeiculoHeaderActions from "./VeiculoHeaderActions";
import { VeiculoFormData } from "@/types/veiculo";

const VeiculoPage: React.FC = () => {
  const [isSuccessMessageVisible, setIsSuccessMessageVisible] = useState(false);
  
  const {
    veiculos,
    isLoading,
    isError,
    currentVeiculo,
    filters,
    isFormModalOpen,
    isDetailsModalOpen,
    isDeleteModalOpen,
    isImportModalOpen,
    deletingVeiculo,
    departamentosDropdown,
    empresasDropdown,
    openFormModal,
    openDetailsModal,
    confirmDelete,
    setIsImportModalOpen,
    setIsFormModalOpen,
    setIsDetailsModalOpen,
    setIsDeleteModalOpen,
    handleFilterChange,
    resetFilters,
    exportToExcel,
    refetch,
    handleDelete,
    handleSaveVeiculo,
    handleImport
  } = useVeiculoActions();

  const handleImportSuccess = async () => {
    await refetch();
    setIsImportModalOpen(false);
    
    setIsSuccessMessageVisible(true);
    setTimeout(() => {
      setIsSuccessMessageVisible(false);
    }, 5000);
  };

  // This wrapper function ensures we return the proper Promise structure
  const handleImportWrapper = async (veiculos: VeiculoFormData[]): Promise<{ success: any[]; errors: any[] }> => {
    try {
      const result = await handleImport(veiculos);
      return result;
    } catch (error) {
      console.error("Error in import wrapper:", error);
      return { success: [], errors: [{ message: error instanceof Error ? error.message : "Unknown error during import" }] };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Truck className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Cadastro de C/E</h1>
        </div>
        
        <VeiculoHeaderActions 
          onExport={exportToExcel}
          onImport={() => setIsImportModalOpen(true)}
          onNewClick={() => openFormModal()}
        />
      </div>
      
      {isSuccessMessageVisible && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">Importação concluída com sucesso!</span>
        </div>
      )}
      
      <VeiculoFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={resetFilters}
        isLoading={isLoading}
        totalVeiculos={veiculos?.length || 0}
        departamentos={departamentosDropdown}
        empresas={empresasDropdown}
      />
      
      <VeiculoTable 
        veiculos={veiculos}
        isLoading={isLoading}
        isError={isError}
        onEdit={openFormModal}
        onView={openDetailsModal}
        onDelete={confirmDelete}
      />
      
      <VeiculoFormModal 
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        veiculo={currentVeiculo}
        onSuccess={refetch}
        onSave={handleSaveVeiculo}
        departamentos={departamentosDropdown || []}
        empresas={empresasDropdown || []}
      />
      
      <VeiculoDetailsModal 
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        veiculo={currentVeiculo}
      />
      
      <DeleteVeiculoDialog 
        isOpen={isDeleteModalOpen}
        isDeleting={false}
        veiculo={deletingVeiculo || currentVeiculo}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
      
      <ImportVeiculosModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportWrapper}
        onSuccess={handleImportSuccess}
      />
    </div>
  );
};

export default VeiculoPage;
