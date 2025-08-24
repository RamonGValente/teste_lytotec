
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
import { ProgramacaoEntregaWithItems } from "@/types/programacaoEntrega";

interface DeleteProgramacaoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  programacao: ProgramacaoEntregaWithItems | null;
}

const DeleteProgramacaoDialog: React.FC<DeleteProgramacaoDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  programacao,
}) => {
  if (!programacao) return null;
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Programação de Entrega</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir esta programação de entrega?
            {programacao.requisicao?.numero && (
              <span className="block mt-2 font-semibold">
                Requisição: {programacao.requisicao.numero}
              </span>
            )}
            {programacao.centro_custo?.nome_centro_custo && (
              <span className="block mt-1">
                Centro de Custo: {programacao.centro_custo.nome_centro_custo}
              </span>
            )}
            <span className="block mt-4 text-destructive font-medium">
              Esta ação não pode ser desfeita.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                Excluindo...
              </>
            ) : (
              "Excluir"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteProgramacaoDialog;
