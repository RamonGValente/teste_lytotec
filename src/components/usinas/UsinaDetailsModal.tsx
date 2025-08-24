
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Usina } from "@/types/usina";

interface UsinaDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  usina: Usina | null;
}

const UsinaDetailsModal: React.FC<UsinaDetailsModalProps> = ({
  isOpen,
  onClose,
  usina,
}) => {
  if (!usina) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Detalhes da Usina</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nome da Usina</p>
              <p className="text-lg">{usina.nome_usina}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Produção Total</p>
              <p className="text-lg">{usina.producao_total || "Não informado"}</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Endereço</p>
            <p className="text-lg">{usina.endereco || "Não informado"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Telefone</p>
            <p className="text-lg">{usina.telefone || "Não informado"}</p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UsinaDetailsModal;
