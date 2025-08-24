
import React from "react";
import { FileHeart } from "lucide-react";
import { useCentroCustoActions } from "@/hooks/useCentroCustoActions";
import CentroCustoFormModal from "./CentroCustoFormModal";
import CentroCustoDetailsModal from "./CentroCustoDetailsModal";
import ImportCentrosCustoModal from "./ImportCentrosCustoModal";
import CentroCustoFilters from "./CentroCustoFilters";
import CentroCustoTable from "./CentroCustoTable";
import DeleteCentroCustoDialog from "./DeleteCentroCustoDialog";
import CentroCustoHeaderActions from "./CentroCustoHeaderActions";
import { useIsMobile, useIsSmallScreen } from "@/hooks/use-mobile";

const CentroCustoPage: React.FC = () => {
  const {
    // Estado
    filters,
    currentCentroCusto,
    isFormModalOpen,
    isDetailsModalOpen,
    isImportModalOpen,
    isDeleteModalOpen,
    deletingCentroCusto,
    isDeleting,
    centrosCusto,
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
  } = useCentroCustoActions();

  const isMobile = useIsMobile();
  const isSmallScreen = useIsSmallScreen();

  return (
    <div className={`space-y-2 ${isSmallScreen ? 'space-y-2' : isMobile ? 'space-y-3' : 'sm:space-y-6'}`}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <FileHeart className={`${isSmallScreen ? 'h-4 w-4' : 'h-5 w-5 sm:h-6 sm:w-6'} text-primary`} />
          <h1 className={`${isSmallScreen ? 'text-base' : 'text-lg sm:text-2xl'} font-bold`}>
            {isSmallScreen ? 'Centros de Custo' : 'Cadastro de Centros de Custo'}
          </h1>
        </div>
        
        <CentroCustoHeaderActions 
          onNewCentroCusto={() => openFormModal()}
          onExport={exportToExcel}
          onImport={() => setIsImportModalOpen(true)}
        />
      </div>
      
      <CentroCustoFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={resetFilters}
      />
      
      <CentroCustoTable 
        centrosCusto={centrosCusto}
        isLoading={isLoading}
        isError={isError}
        onEdit={openFormModal}
        onView={openDetailsModal}
        onDelete={confirmDelete}
      />
      
      <CentroCustoFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={() => refetch()}
        centroCusto={currentCentroCusto || undefined}
      />
      
      <CentroCustoDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        centroCusto={currentCentroCusto}
      />
      
      <ImportCentrosCustoModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => refetch()}
      />
      
      <DeleteCentroCustoDialog
        isOpen={isDeleteModalOpen}
        isDeleting={isDeleting}
        centroCusto={deletingCentroCusto}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default CentroCustoPage;
