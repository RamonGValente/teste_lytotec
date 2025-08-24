
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
import { Veiculo } from "@/types/veiculo";

interface DeleteVeiculoDialogProps {
  isOpen: boolean;
  isDeleting: boolean;
  veiculo: Veiculo | null;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteVeiculoDialog: React.FC<DeleteVeiculoDialogProps> = ({
  isOpen,
  isDeleting,
  veiculo,
  onClose,
  onConfirm,
}) => {
  if (!veiculo) {
    return null;
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir {veiculo.tipo_veiculo}</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o {veiculo.tipo_veiculo.toLowerCase()}{' '}
            <span className="font-semibold">
              {veiculo.placa ? `${veiculo.marca} ${veiculo.modelo} - Placa ${veiculo.placa}` : 
                `${veiculo.marca} ${veiculo.modelo}` }
            </span>
            ?
            <br />
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
          >
            {isDeleting ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteVeiculoDialog;
