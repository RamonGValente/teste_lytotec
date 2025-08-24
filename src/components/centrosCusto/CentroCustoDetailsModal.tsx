
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CentroCusto } from "@/types/centroCusto";
import { Badge } from "@/components/ui/badge";

interface CentroCustoDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  centroCusto: CentroCusto | null;
}

const CentroCustoDetailsModal: React.FC<CentroCustoDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  centroCusto 
}) => {
  if (!centroCusto) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Centro de Custo</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Código</Label>
              <div className="rounded-md border p-2 mt-1 bg-muted/50">
                {centroCusto.codigo_centro_custo}
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Situação</Label>
              <div className="rounded-md border p-2 mt-1 bg-muted/50 flex items-center">
                <Badge 
                  variant={centroCusto.situacao === "Ativo" ? "default" : "secondary"}
                  className={centroCusto.situacao === "Ativo" ? "bg-green-500 hover:bg-green-500/90" : "bg-gray-500 hover:bg-gray-500/90"}
                >
                  {centroCusto.situacao}
                </Badge>
              </div>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Nome do Centro de Custo</Label>
            <div className="rounded-md border p-2 mt-1 bg-muted/50">
              {centroCusto.nome_centro_custo}
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium">CNPJ Vinculado</Label>
            <div className="rounded-md border p-2 mt-1 bg-muted/50">
              {centroCusto.cnpj_vinculado || "Não informado"}
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Telefone</Label>
            <div className="rounded-md border p-2 mt-1 bg-muted/50">
              {centroCusto.telefone || "Não informado"}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Data de Criação</Label>
              <div className="rounded-md border p-2 mt-1 bg-muted/50">
                {centroCusto.created_at ? new Date(centroCusto.created_at).toLocaleDateString('pt-BR') : "N/A"}
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Última Atualização</Label>
              <div className="rounded-md border p-2 mt-1 bg-muted/50">
                {centroCusto.updated_at ? new Date(centroCusto.updated_at).toLocaleDateString('pt-BR') : "N/A"}
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CentroCustoDetailsModal;
