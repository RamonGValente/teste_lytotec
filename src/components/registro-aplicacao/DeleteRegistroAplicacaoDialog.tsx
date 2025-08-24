
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { RegistroAplicacao } from '@/types/registroAplicacao';
import { supabase } from '@/integrations/supabase/client';

interface DeleteRegistroAplicacaoDialogProps {
  registro: RegistroAplicacao;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DeleteRegistroAplicacaoDialog: React.FC<DeleteRegistroAplicacaoDialogProps> = ({
  registro,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('bd_registro_apontamento_aplicacao')
        .delete()
        .eq('id', registro.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Registro de aplicação excluído com sucesso!",
      });

      onSuccess();
    } catch (error) {
      console.error('Error deleting registro aplicação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o registro de aplicação.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const logradouro = registro.logradouro_aplicado || 
                    registro.lista_entrega?.logradouro ||
                    "N/A";

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir este registro de aplicação?
            <br />
            <br />
            <strong>Logradouro:</strong> {logradouro}
            <br />
            <strong>Data:</strong> {registro.data_aplicacao ? new Date(registro.data_aplicacao).toLocaleDateString('pt-BR') : 'N/A'}
            <br />
            <br />
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
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
