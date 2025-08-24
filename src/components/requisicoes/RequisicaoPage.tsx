
import React from "react";
import { FileText, Plus, Download } from "lucide-react";
import { useRequisicaoActions } from "@/hooks/useRequisicaoActions";
import RequisicaoFilters from "./RequisicaoFilters";
import RequisicaoTable from "./RequisicaoTable";
import RequisicaoFormModal from "./RequisicaoFormModal";
import RequisicaoDetailsModal from "./RequisicaoDetailsModal";
import ImportRequisicaoModal from "./ImportRequisicaoModal";
import DeleteRequisicaoDialog from "./DeleteRequisicaoDialog";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const RequisicaoPage: React.FC = () => {
  const {
    // Estado
    filters,
    currentRequisicao,
    isFormModalOpen,
    isDetailsModalOpen,
    isImportModalOpen,
    isDeleteModalOpen,
    deletingRequisicao,
    isDeleting,
    requisicoes,
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
  } = useRequisicaoActions();

  const isMobile = useIsMobile();

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-xl md:text-2xl font-bold">Cadastro de Requisições</h1>
        </div>
        
        <div className="flex flex-wrap gap-2 sm:flex-nowrap">
          <Button 
            onClick={() => openFormModal()}
            className="w-full sm:w-auto text-white h-10"
            size={isMobile ? "lg" : "default"}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Requisição
          </Button>
          
          <Button 
            onClick={exportToExcel} 
            variant="outline"
            className="w-full sm:w-auto h-10"
            size={isMobile ? "lg" : "default"}
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          
          <Button 
            onClick={() => setIsImportModalOpen(true)} 
            variant="outline"
            className="w-full sm:w-auto h-10"
            size={isMobile ? "lg" : "default"}
          >
            Importar
          </Button>
        </div>
      </div>
      
      <RequisicaoFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={resetFilters}
      />
      
      <RequisicaoTable 
        requisicoes={requisicoes}
        isLoading={isLoading}
        isError={isError}
        onEdit={openFormModal}
        onView={openDetailsModal}
        onDelete={confirmDelete}
      />
      
      <RequisicaoFormModal
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        onSuccess={() => refetch()}
        requisicao={currentRequisicao}
      />
      
      <RequisicaoDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        requisicao={currentRequisicao}
      />
      
      <ImportRequisicaoModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => refetch()}
      />
      
      <DeleteRequisicaoDialog
        isOpen={isDeleteModalOpen}
        isDeleting={isDeleting}
        requisicao={deletingRequisicao}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default RequisicaoPage;
