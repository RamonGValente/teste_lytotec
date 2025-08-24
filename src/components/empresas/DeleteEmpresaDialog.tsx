
import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { Empresa } from "@/types/empresa";

interface DeleteEmpresaDialogProps {
  isOpen: boolean;
  isDeleting: boolean;
  empresa: Empresa | null;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteEmpresaDialog: React.FC<DeleteEmpresaDialogProps> = ({
  isOpen,
  isDeleting,
  empresa,
  onClose,
  onConfirm
}) => {
  if (!empresa) return null;
  
  const handleConfirm = () => {
    console.log('Delete confirmation for empresa:', empresa.id);
    onConfirm();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isDeleting && !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar exclusão</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir a empresa "{empresa?.nome_empresa}"? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="mr-2"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Excluir"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteEmpresaDialog;
