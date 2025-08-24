
import React, { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { FileDown, Wrench, CheckCircle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useOrdemServico } from "@/hooks/useOrdemServico";
import OsFilters from "@/components/ordens-servico/OsFilters";
import ChamadosOsTable from "@/components/ordens-servico/ChamadosOsTable";
import OrdensServicoTable from "@/components/ordens-servico/OrdensServicoTable";
import ChamadoDetailsModal from "@/components/ordens-servico/ChamadoDetailsModal";
import OsDetailsModal from "@/components/ordens-servico/OsDetailsModal";
import OsForm from "@/components/ordens-servico/OsForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const GestaoOrdemServico: React.FC = () => {
  const [veiculosDropdown, setVeiculosDropdown] = useState<{ id: string; label: string }[]>([]);
  const [departamentosDropdown, setDepartamentosDropdown] = useState<{ id: string; label: string }[]>([]);
  const { toast } = useToast();
  
  const {
    openChamados,
    ordensServico,
    isLoading,
    isError,
    errorMessage,
    currentUser,
    currentOs,
    currentChamado,
    materials,
    laborItems,
    movements,
    isOsModalOpen,
    setIsOsModalOpen,
    isDetailsModalOpen, 
    setIsDetailsModalOpen,
    isChamadoModalOpen,
    setIsChamadoModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    activeTab,
    handleTabChange,
    handleOpenChamadoDetails,
    handleOpenOsModal,
    handleOpenDetailsModal,
    handleConvertToOs,
    handleUpdateOs,
    handleSaveMaterial,
    handleDeleteMaterial,
    handleSaveMaoDeObra,
    handleDeleteMaoDeObra,
    handleApplyChamadoFilters,
    handleApplyOsFilters,
    handleClearFilters,
    handleExportToExcel,
    handleGeneratePdf,
    handleFinishOs
  } = useOrdemServico();

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
        
        const { data: departamentos, error: deptError } = await supabase
          .from('bd_departamentos')
          .select('id, nome_departamento');
        
        if (deptError) {
          console.error('Error loading departamentos:', deptError);
        } else if (departamentos) {
          setDepartamentosDropdown(
            departamentos.map(dept => ({
              id: dept.id,
              label: dept.nome_departamento
            }))
          );
        }
      } catch (error) {
        console.error('Error loading dropdown options:', error);
      }
    };
    
    loadDropdownOptions();
  }, []);

  const handleDirectConversion = (chamado: any) => {
    if (!currentUser) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado. Faça login novamente.",
        variant: "destructive"
      });
      return;
    }
    
    if (chamado.status !== 'Aberto') {
      toast({
        title: "Aviso",
        description: `Chamado #${chamado.numero_chamado} já foi convertido ou está em processamento.`,
        variant: "default"
      });
      return;
    }
    
    const tipoFalha = chamado.tipo_falha || 'Mecânica';
    
    handleConvertToOs(chamado.id, { tipo_falha: tipoFalha });
    
    toast({
      title: "Chamado convertido",
      description: `Chamado #${chamado.numero_chamado} foi convertido para OS com sucesso.`,
      variant: "default"
    });
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-4 sm:mb-0">
            Gestão de Ordens de Serviço
          </h1>
          <div className="flex space-x-2">
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

        <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chamados">Chamados para Conversão</TabsTrigger>
            <TabsTrigger value="ordens">Ordens de Serviço</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chamados" className="mt-6">
            <OsFilters
              onApplyFilters={handleApplyChamadoFilters}
              onClearFilters={handleClearFilters}
              veiculosOptions={veiculosDropdown}
              isLoading={isLoading}
              showStatusFilter={false}
              showPriorityFilter={true}
            />
            
            <ChamadosOsTable
              chamados={openChamados}
              onConvert={handleDirectConversion}
              onView={handleOpenChamadoDetails}
              isLoading={isLoading}
              isError={isError}
              errorMessage={errorMessage}
            />
          </TabsContent>
          
          <TabsContent value="ordens" className="mt-6">
            <OsFilters
              onApplyFilters={handleApplyOsFilters}
              onClearFilters={handleClearFilters}
              veiculosOptions={veiculosDropdown}
              isLoading={isLoading}
              showStatusFilter={true}
              showPriorityFilter={true}
            />
            
            <OrdensServicoTable
              ordensServico={ordensServico}
              onView={handleOpenDetailsModal}
              onEdit={handleOpenOsModal}
              isLoading={isLoading}
              isError={isError}
              errorMessage={errorMessage}
            />
          </TabsContent>
        </Tabs>
      </div>

      <ChamadoDetailsModal
        isOpen={isChamadoModalOpen}
        onClose={() => setIsChamadoModalOpen(false)}
        onConvert={handleDirectConversion}
        chamado={currentChamado}
        isLoading={isLoading}
      />

      <OsDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        os={currentOs}
        materials={materials}
        laborItems={laborItems}
        movements={movements}
        isLoading={isLoading}
        onGeneratePdf={handleGeneratePdf}
      />

      <OsForm
        isOpen={isOsModalOpen}
        onClose={() => setIsOsModalOpen(false)}
        onSubmit={handleUpdateOs}
        onSaveMaterial={handleSaveMaterial}
        onDeleteMaterial={handleDeleteMaterial}
        onSaveMaoDeObra={handleSaveMaoDeObra}
        onDeleteMaoDeObra={handleDeleteMaoDeObra}
        onFinishOs={handleFinishOs}
        onGeneratePdf={handleGeneratePdf}
        currentOs={currentOs}
        materials={materials}
        laborItems={laborItems}
        isLoading={isLoading}
        currentUser={currentUser}
        departamentosOptions={departamentosDropdown}
      />
    </MainLayout>
  );
};

export default GestaoOrdemServico;
