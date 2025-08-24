
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
import { ApontamentoEquipe } from "@/types/apontamentoEquipe";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2 } from "lucide-react";

interface DeleteApontamentoEquipeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  apontamento: ApontamentoEquipe | null;
  onDelete: () => void;
  isDeleting: boolean;
}

const DeleteApontamentoEquipeDialog: React.FC<DeleteApontamentoEquipeDialogProps> = ({
  isOpen,
  onClose,
  apontamento,
  onDelete,
  isDeleting,
}) => {
  if (!apontamento) return null;

  const equipeNome = apontamento.equipe?.nome_equipe || "N/A";
  const dataRegistro = format(new Date(apontamento.data_registro), "dd/MM/yyyy", { locale: ptBR });

  const handleDelete = () => {
    console.log("🔄 Delete dialog - calling onDelete function");
    onDelete();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso excluirá permanentemente o apontamento da equipe{" "}
            <strong>{equipeNome}</strong> do dia <strong>{dataRegistro}</strong>.
            {isDeleting && (
              <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
                <div className="flex items-center gap-2 text-blue-700">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Processando exclusão...</span>
                </div>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Continuar"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteApontamentoEquipeDialog;
