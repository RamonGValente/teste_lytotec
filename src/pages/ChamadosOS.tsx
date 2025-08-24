
import React, { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { FileDown, Plus } from "lucide-react";
import { useChamadosOS } from "@/hooks/useChamadosOS";
import ChamadosFilters from "@/components/chamados-os/ChamadosFilters";
import ChamadosTable from "@/components/chamados-os/ChamadosTable";
import ChamadosForm from "@/components/chamados-os/ChamadosForm";
import ChamadosDetailsModal from "@/components/chamados-os/ChamadosDetailsModal";
import DeleteChamadosDialog from "@/components/chamados-os/DeleteChamadosDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ChamadosOS: React.FC = () => {
  const [veiculosDropdown, setVeiculosDropdown] = useState<{ id: string; label: string }[]>([]);
  const [centrosCustoDropdown, setCentrosCustoDropdown] = useState<{ id: string; label: string, codigo_centro_custo?: string }[]>([]);
  const { toast } = useToast();
  
  const {
    chamados,
    isLoading,
    isError,
    errorMessage,
    currentUser,
    currentChamado,
    isFormModalOpen,
    setIsFormModalOpen,
    isDetailsModalOpen, 
    setIsDetailsModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    handleOpenFormModal,
    handleOpenDetailsModal,
    handleOpenDeleteModal,
    handleCreateOrUpdateChamado,
    handleDeleteChamado,
    handleApplyFilters,
    handleClearFilters,
    handleExportToExcel,
    handleConvertToOS
  } = useChamadosOS();

  useEffect(() => {
    const loadDropdownOptions = async () => {
      try {
        const { data: veiculos, error: veiculosError } = await supabase
          .from('bd_caminhoes_equipamentos')
          .select('id, placa, tipo_veiculo, marca, modelo');
        
        if (veiculosError) {
          console.error('Error loading veículos:', veiculosError);
        } else if (veiculos) {
          setVeiculosDropdown(
            veiculos.map(veiculo => ({
              id: veiculo.id,
              label: `${veiculo.placa || ''} ${veiculo.marca || ''} ${veiculo.modelo || ''}`.trim()
            }))
          );
        }
        
        const { data: centrosCusto, error: centrosCustoError } = await supabase
          .from('bd_centros_custo')
          .select('id, codigo_centro_custo, nome_centro_custo');
        
        if (centrosCustoError) {
          console.error('Error loading centros de custo:', centrosCustoError);
        } else if (centrosCusto) {
          setCentrosCustoDropdown(
            centrosCusto.map(centro => ({
              id: centro.id,
              codigo_centro_custo: centro.codigo_centro_custo,
              label: `${centro.codigo_centro_custo} - ${centro.nome_centro_custo}`
            }))
          );
        }
      } catch (error) {
        console.error('Error loading dropdown options:', error);
      }
    };
    
    loadDropdownOptions();
  }, []);

  // Handle conversion to OS from this screen
  const handleConvertChamadoToOS = (chamado) => {
    if (!currentUser) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado. Faça login novamente.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if the chamado has already been converted
    if (chamado.status !== 'Aberto') {
      toast({
        title: "Aviso",
        description: `Chamado #${chamado.numero_chamado} já foi convertido ou está em processamento.`,
        variant: "default"
      });
      return;
    }
    
    try {
      handleConvertToOS(chamado.id, currentUser.id);
      toast({
        title: "Chamado convertido",
        description: `Chamado #${chamado.numero_chamado} foi convertido para OS com sucesso.`,
        variant: "default"
      });
    } catch (error) {
      console.error("Error converting chamado:", error);
      toast({
        title: "Erro na conversão",
        description: "Ocorreu um erro ao converter o chamado para OS.",
        variant: "destructive"
      });
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-4 sm:mb-0">
            Chamados para Ordem de Serviço
          </h1>
          <div className="flex space-x-2">
            <Button 
              onClick={() => handleOpenFormModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Chamado
            </Button>
            
            <Button 
              onClick={handleExportToExcel}
              variant="outline" 
              className="border-green-200 text-green-700 hover:bg-green-50"
            >
              <FileDown className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        <ChamadosFilters
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          veiculosOptions={veiculosDropdown}
          isLoading={isLoading}
        />

        <ChamadosTable
          chamados={chamados}
          onView={handleOpenDetailsModal}
          onEdit={handleOpenFormModal}
          onDelete={handleOpenDeleteModal}
          onConvertToOS={handleConvertChamadoToOS}
          isLoading={isLoading}
          isError={isError}
          errorMessage={errorMessage}
        />
      </div>

      <ChamadosForm
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleCreateOrUpdateChamado}
        currentChamado={currentChamado}
        veiculosOptions={veiculosDropdown}
        centrosCustoOptions={centrosCustoDropdown}
        isLoading={isLoading}
        currentUser={currentUser}
      />

      <ChamadosDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        chamado={currentChamado}
        isLoading={isLoading}
      />

      <DeleteChamadosDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteChamado}
        chamado={currentChamado}
        isLoading={isLoading}
      />
    </MainLayout>
  );
};

export default ChamadosOS;
