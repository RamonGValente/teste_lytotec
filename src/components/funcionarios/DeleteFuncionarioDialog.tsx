
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

export interface DeleteFuncionarioDialogProps {
  isOpen: boolean;
  isDeleting: boolean;
  funcionarioId?: string;
  funcionarioNome?: string;
  onClose: () => void;
  onConfirm: () => void;
  errorMessage?: string;
}

const DeleteFuncionarioDialog: React.FC<DeleteFuncionarioDialogProps> = ({
  isOpen,
  isDeleting,
  funcionarioId,
  funcionarioNome,
  onClose,
  onConfirm,
  errorMessage
}) => {
  if (!funcionarioId) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            {errorMessage ? (
              <div className="text-destructive font-medium mb-2">{errorMessage}</div>
            ) : (
              <>
                Tem certeza que deseja excluir o funcionário{" "}
                <span className="font-semibold">{funcionarioNome}</span>? Esta ação não pode ser desfeita.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          {!errorMessage && (
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
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteFuncionarioDialog;
