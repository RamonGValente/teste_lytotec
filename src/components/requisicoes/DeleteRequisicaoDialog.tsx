
import React, { useEffect, useState } from "react";
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
import { RequisicaoWithRuas } from "@/types/requisicao";
import { checkRequisicaoCanBeDeleted } from "@/services/requisicaoService";
import { Badge } from "@/components/ui/badge";

interface DeleteRequisicaoDialogProps {
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
  requisicao: RequisicaoWithRuas | null;
}

const DeleteRequisicaoDialog: React.FC<DeleteRequisicaoDialogProps> = ({
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
  requisicao
}) => {
  const [validationInfo, setValidationInfo] = useState<{
    canDelete: boolean;
    reason?: string;
    details: {
      totalProgramacoes: number;
      totalEntregas: number;
      totalCargas: number;
    }
  } | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    const validateDeletion = async () => {
      if (!requisicao || !isOpen) {
        setValidationInfo(null);
        return;
      }

      setIsValidating(true);
      try {
        const validation = await checkRequisicaoCanBeDeleted(requisicao.id);
        setValidationInfo(validation);
      } catch (error) {
        console.error('Error validating deletion:', error);
        setValidationInfo({
          canDelete: false,
          reason: 'Erro ao validar requisição para exclusão',
          details: { totalProgramacoes: 0, totalEntregas: 0, totalCargas: 0 }
        });
      } finally {
        setIsValidating(false);
      }
    };

    validateDeletion();
  }, [requisicao, isOpen]);

  if (!requisicao) return null;

  const { details } = validationInfo || { details: { totalProgramacoes: 0, totalEntregas: 0, totalCargas: 0 } };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="space-y-4">
              <div>
                Tem certeza que deseja excluir a requisição <strong>#{requisicao.numero}</strong>?
              </div>
              
              {isValidating ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Verificando dependências...
                </div>
              ) : validationInfo && (
                <div className="space-y-3">
                  <div>
                    <strong>Esta ação também excluirá:</strong>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li className="flex items-center gap-2">
                        <Badge variant="secondary">{details.totalProgramacoes}</Badge>
                        programação(ões) de entrega
                      </li>
                      <li className="flex items-center gap-2">
                        <Badge variant="secondary">{details.totalEntregas}</Badge>
                        item(ns) de entrega programados
                      </li>
                    </ul>
                  </div>

                  {!validationInfo.canDelete && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                      <div className="flex items-start gap-2">
                        <div className="text-destructive font-medium">⚠️ EXCLUSÃO BLOQUEADA</div>
                      </div>
                      <div className="mt-1 text-sm text-destructive">
                        Esta requisição possui <Badge variant="destructive">{details.totalCargas}</Badge> registro(s) de carga
                        e não pode ser excluída.
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Para excluir esta requisição, primeiro remova todos os registros de carga relacionados.
                      </div>
                    </div>
                  )}

                  {validationInfo.canDelete && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                      <div className="text-orange-800 font-medium text-sm">
                        ⚠️ Esta ação não pode ser desfeita
                      </div>
                      <div className="text-xs text-orange-700 mt-1">
                        Todos os dados relacionados serão permanentemente excluídos.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting || isValidating}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting || isValidating || (validationInfo && !validationInfo.canDelete)}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                Excluindo...
              </>
            ) : (
              validationInfo?.canDelete ? "Sim, excluir permanentemente" : "Exclusão bloqueada"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteRequisicaoDialog;
