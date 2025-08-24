
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Departamento } from "@/types/departamento";

interface DepartamentoDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  departamento: Departamento | null;
}

const DepartamentoDetailsModal: React.FC<DepartamentoDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  departamento 
}) => {
  if (!departamento) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Departamento</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">Empresa:</span>
            <span className="col-span-3">{departamento.empresa?.nome_empresa || "N/A"}</span>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">Departamento:</span>
            <span className="col-span-3">{departamento.nome_departamento}</span>
          </div>
          
          {departamento.created_at && (
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Criado em:</span>
              <span className="col-span-3">
                {new Date(departamento.created_at).toLocaleString('pt-BR')}
              </span>
            </div>
          )}
          
          {departamento.updated_at && (
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Atualizado em:</span>
              <span className="col-span-3">
                {new Date(departamento.updated_at).toLocaleString('pt-BR')}
              </span>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DepartamentoDetailsModal;
