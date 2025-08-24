
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
import { Usina } from "@/types/usina";

interface DeleteUsinaDialogProps {
  isOpen: boolean;
  isDeleting: boolean;
  usina: Usina | null;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteUsinaDialog: React.FC<DeleteUsinaDialogProps> = ({
  isOpen,
  isDeleting,
  usina,
  onClose,
  onConfirm,
}) => {
  if (!usina) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Usina</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a usina "{usina.nome_usina}"?
            <br />
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteUsinaDialog;
