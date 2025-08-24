
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface DeleteFuncaoPermissaoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  funcaoPermissaoId?: string;
  funcaoPermissaoNome?: string;
  isDeleting: boolean;
}

const DeleteFuncaoPermissaoDialog: React.FC<DeleteFuncaoPermissaoDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  funcaoPermissaoId,
  funcaoPermissaoNome,
  isDeleting,
}) => {
  if (!funcaoPermissaoId) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a função{" "}
            <span className="font-semibold">{funcaoPermissaoNome}</span>? Esta ação
            não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              onClick={onConfirm}
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
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteFuncaoPermissaoDialog;
