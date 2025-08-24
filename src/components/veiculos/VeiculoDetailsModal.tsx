
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Truck } from "lucide-react";
import { Veiculo } from "@/types/veiculo";

interface VeiculoDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  veiculo: Veiculo | null;
}

const VeiculoDetailsModal: React.FC<VeiculoDetailsModalProps> = ({ isOpen, onClose, veiculo }) => {
  if (!veiculo) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detalhes do {veiculo.tipo_veiculo}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 flex flex-col items-center">
            <Avatar className="h-32 w-32">
              {veiculo.imagem_url ? (
                <AvatarImage src={veiculo.imagem_url} alt={veiculo.placa || "Veículo"} />
              ) : (
                <AvatarFallback className="bg-primary-50">
                  <Truck className="h-16 w-16 text-primary" />
                </AvatarFallback>
              )}
            </Avatar>
            
            <div className="text-center mt-2">
              <p className="text-lg font-bold">{veiculo.placa || "Sem placa"}</p>
              <p className="text-sm text-gray-500">{veiculo.marca} {veiculo.modelo}</p>
            </div>
          </div>
          
          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Tipo</p>
                <p className="text-sm">{veiculo.tipo_veiculo}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Cor</p>
                <p className="text-sm">{veiculo.cor || "Não informado"}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Motor</p>
                <p className="text-sm">{veiculo.motor || "Não informado"}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Ano de Fabricação</p>
                <p className="text-sm">{veiculo.ano_fabricacao || "Não informado"}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Combustível</p>
                <p className="text-sm">{veiculo.tipo_combustivel || "Não informado"}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Status IPVA</p>
                <p className="text-sm">{veiculo.status_ipva || "Não informado"}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Situação</p>
                <p className="text-sm">{veiculo.situacao || "Não informado"}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Capacidade</p>
                <p className="text-sm">{veiculo.capacidade || "Não informado"}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Aluguel</p>
                <p className="text-sm">{veiculo.aluguel || "Não informado"}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Departamento</p>
                <p className="text-sm">{veiculo.nome_departamento || "Não informado"}</p>
              </div>
            </div>
            
            {veiculo.observacoes && (
              <div>
                <p className="text-sm font-medium text-gray-500">Observações</p>
                <p className="text-sm">{veiculo.observacoes}</p>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VeiculoDetailsModal;
