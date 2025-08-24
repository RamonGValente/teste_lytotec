
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
import { Loader2 } from "lucide-react";
import { Funcao } from "@/types/funcao";

interface DeleteFuncaoDialogProps {
  isOpen: boolean;
  isDeleting: boolean;
  funcao: Funcao | null;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteFuncaoDialog: React.FC<DeleteFuncaoDialogProps> = ({
  isOpen,
  isDeleting,
  funcao,
  onClose,
  onConfirm
}) => {
  if (!funcao) return null;
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Função</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a função <strong>{funcao.nome_funcao}</strong>?
            <br />
            Esta ação não poderá ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Sim, Excluir"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteFuncaoDialog;
