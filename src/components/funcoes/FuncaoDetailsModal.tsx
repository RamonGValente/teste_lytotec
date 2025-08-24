
import React from "react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Funcao } from "@/types/funcao";

interface FuncaoDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  funcao: Funcao | null;
}

const FuncaoDetailsModal: React.FC<FuncaoDetailsModalProps> = ({
  isOpen,
  onClose,
  funcao
}) => {
  if (!funcao) return null;
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Detalhes da Função</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Nome da Função</Label>
            <div className="col-span-3 font-medium">
              {funcao.nome_funcao}
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Código</Label>
            <div className="col-span-3 text-sm text-muted-foreground">
              {funcao.id}
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Criação</Label>
            <div className="col-span-3 text-sm text-muted-foreground">
              {formatDate(funcao.created_at)}
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Última atualização</Label>
            <div className="col-span-3 text-sm text-muted-foreground">
              {formatDate(funcao.updated_at)}
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

export default FuncaoDetailsModal;
