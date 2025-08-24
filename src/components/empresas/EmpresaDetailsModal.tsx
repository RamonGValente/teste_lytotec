
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Empresa } from "@/types/empresa";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, X } from "lucide-react";

interface EmpresaDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  empresa?: Empresa;
}

const EmpresaDetailsModal: React.FC<EmpresaDetailsModalProps> = ({ isOpen, onClose, empresa }) => {
  if (!empresa) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch (error) {
      return "Data inválida";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Detalhes da Empresa</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="flex flex-col">
            <div className="grid grid-cols-4 gap-4 py-2 border-b">
              <span className="font-medium text-muted-foreground col-span-1">Nome:</span>
              <span className="col-span-3">{empresa.nome_empresa}</span>
            </div>
            
            <div className="grid grid-cols-4 gap-4 py-2 border-b">
              <span className="font-medium text-muted-foreground col-span-1">CNPJ:</span>
              <span className="col-span-3">{empresa.cnpj}</span>
            </div>
            
            <div className="grid grid-cols-4 gap-4 py-2 border-b">
              <span className="font-medium text-muted-foreground col-span-1">Telefone:</span>
              <span className="col-span-3">{empresa.telefone || "Não informado"}</span>
            </div>
            
            <div className="grid grid-cols-4 gap-4 py-2 border-b">
              <span className="font-medium text-muted-foreground col-span-1">Situação:</span>
              <span className="col-span-3 flex items-center">
                {empresa.situacao === 'Ativa' ? (
                  <>
                    <Check className="mr-1 h-4 w-4 text-green-500" />
                    <span>Ativa</span>
                  </>
                ) : (
                  <>
                    <X className="mr-1 h-4 w-4 text-red-500" />
                    <span>Inativa</span>
                  </>
                )}
              </span>
            </div>
            
            <div className="grid grid-cols-4 gap-4 py-2 border-b">
              <span className="font-medium text-muted-foreground col-span-1">Criado em:</span>
              <span className="col-span-3">{formatDate(empresa.created_at)}</span>
            </div>
            
            <div className="grid grid-cols-4 gap-4 py-2">
              <span className="font-medium text-muted-foreground col-span-1">Atualizado em:</span>
              <span className="col-span-3">{formatDate(empresa.updated_at)}</span>
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

export default EmpresaDetailsModal;
