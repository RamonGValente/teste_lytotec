import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ApontamentoCaminhao, ApontamentoInspecao } from "@/services/apontamentoCaminhoesService";
import { Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { formatBrazilianDateForDisplay } from "@/utils/timezoneUtils";

interface ApontamentoCaminhoesDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apontamento: ApontamentoCaminhao | null;
  inspecao: ApontamentoInspecao | null;
  isLoading: boolean;
}

const ApontamentoCaminhoesDetailsModal: React.FC<ApontamentoCaminhoesDetailsModalProps> = ({
  isOpen,
  onClose,
  apontamento,
  inspecao,
  isLoading
}) => {
  const [activeTab, setActiveTab] = useState('dados');
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className={cn("sm:max-w-[600px]", isMobile ? "p-3 w-[95vw] mx-auto" : "")}>
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!apontamento) {
    return null;
  }

  const isVehicleTruck = 
    apontamento.veiculo_identificacao?.toLowerCase().includes('caminhão') ||
    (apontamento.veiculo_identificacao?.includes('-') && apontamento.veiculo_identificacao?.includes(' '));

  const getHorimetroLabel = (isFinal = false) => {
    if (isVehicleTruck) {
      return isFinal ? "Hodômetro Final (KM)" : "Hodômetro Inicial (KM)"; 
    }
    return isFinal ? "Horímetro Final" : "Horímetro Inicial";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("sm:max-w-[700px]", isMobile ? "p-3 w-[95vw] mx-auto" : "")}>
        <DialogHeader>
          <DialogTitle className="text-center sm:text-left">
            Detalhes do Apontamento
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="dados" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full mb-4 grid-cols-2">
            <TabsTrigger value="dados" className="text-sm">
              Dados Operacionais
            </TabsTrigger>
            <TabsTrigger value="checklist" className="text-sm">
              Checklist
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dados">
            <ScrollArea className={cn(
              "pr-4",
              isMobile ? "h-[55vh] max-h-[400px]" : "h-[400px]" 
            )}>
              <dl className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Data</dt>
                    <dd className="mt-1 text-base">
                      {formatBrazilianDateForDisplay(apontamento.data)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Operador</dt>
                    <dd className="mt-1 text-base">{apontamento.nome_operador || 'N/A'}</dd>
                  </div>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-600">Caminhão/Equipamento</dt>
                  <dd className="mt-1 text-base font-medium">{apontamento.veiculo_identificacao || 'N/A'}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-600">Centro de Custo</dt>
                  <dd className="mt-1 text-base">{apontamento.nome_centro_custo || 'N/A'}</dd>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-600">{getHorimetroLabel()}</dt>
                    <dd className="mt-1 text-base">{apontamento.horimetro_inicial || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-600">{getHorimetroLabel(true)}</dt>
                    <dd className="mt-1 text-base">{apontamento.horimetro_final || 'N/A'}</dd>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Hora Inicial</dt>
                    <dd className="mt-1 text-base">{apontamento.hora_inicial || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Hora Final</dt>
                    <dd className="mt-1 text-base">{apontamento.hora_final || 'N/A'}</dd>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Situação</dt>
                    <dd className="mt-1 text-base">{apontamento.situacao || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Abastecimento</dt>
                    <dd className="mt-1 text-base">
                      {apontamento.abastecimento ? `${apontamento.abastecimento} litros` : 'N/A'}
                    </dd>
                  </div>
                </div>
              </dl>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="checklist">
            <ScrollArea className={cn(
              "pr-4", 
              isMobile ? "h-[55vh] max-h-[400px]" : "h-[400px]"
            )}>
              {inspecao ? (
                <dl className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Documentação</dt>
                      <dd className="mt-1 text-base">{inspecao.documentacao || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Tacógrafo</dt>
                      <dd className="mt-1 text-base">{inspecao.tacografo || 'N/A'}</dd>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Sistema Elétrico</dt>
                      <dd className="mt-1 text-base">{inspecao.sistema_eletrico || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Nível Óleo</dt>
                      <dd className="mt-1 text-base">{inspecao.nivel_oleo || 'N/A'}</dd>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Nível Água</dt>
                      <dd className="mt-1 text-base">{inspecao.nivel_agua || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Nível Combustível</dt>
                      <dd className="mt-1 text-base">{inspecao.nivel_combustivel || 'N/A'}</dd>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Drenagem Tanque Ar</dt>
                      <dd className="mt-1 text-base">{inspecao.drenagem_tanque_ar || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Material Rodante</dt>
                      <dd className="mt-1 text-base">{inspecao.material_rodante || 'N/A'}</dd>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Cinto de Segurança</dt>
                      <dd className="mt-1 text-base">{inspecao.cinto_seguranca || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Material de Desgaste</dt>
                      <dd className="mt-1 text-base">{inspecao.material_desgaste || 'N/A'}</dd>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Estado dos Implementos</dt>
                      <dd className="mt-1 text-base">{inspecao.estado_implementos || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Limpeza Interna</dt>
                      <dd className="mt-1 text-base">{inspecao.limpeza_interna || 'N/A'}</dd>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Engate Reboque</dt>
                      <dd className="mt-1 text-base">{inspecao.engate_reboque || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Estado dos Equipamentos</dt>
                      <dd className="mt-1 text-base">{inspecao.estado_equipamentos || 'N/A'}</dd>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Inspeção Veicular</dt>
                      <dd className="mt-1 text-base">{inspecao.inspecao_veicular || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Material de Amarração</dt>
                      <dd className="mt-1 text-base">{inspecao.material_amarracao || 'N/A'}</dd>
                    </div>
                  </div>
                  
                  {inspecao.anotacoes && (
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Anotações</dt>
                      <dd className="mt-1 text-base">{inspecao.anotacoes}</dd>
                    </div>
                  )}
                  
                  {inspecao.fotos_avarias && inspecao.fotos_avarias.length > 0 && (
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Fotos de Avarias</dt>
                      <dd className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                        {inspecao.fotos_avarias.map((foto, index) => (
                          <div key={index} className="relative aspect-square">
                            <img
                              src={foto}
                              alt={`Foto de avaria ${index + 1}`}
                              className="object-cover rounded w-full h-full"
                            />
                          </div>
                        ))}
                      </dd>
                    </div>
                  )}
                </dl>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhum dado de checklist disponível</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end mt-4">
          <Button 
            onClick={onClose} 
            variant="outline" 
            className={cn(
              "w-full md:w-auto",
              isMobile ? "h-12 text-base" : ""
            )}
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApontamentoCaminhoesDetailsModal;
