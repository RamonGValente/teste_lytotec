
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RegistroAplicacao } from '@/types/registroAplicacao';
import RegistroAplicacaoForm from './RegistroAplicacaoForm';

interface RegistroAplicacaoEditModalProps {
  registro: RegistroAplicacao;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RegistroAplicacaoEditModal: React.FC<RegistroAplicacaoEditModalProps> = ({
  registro,
  isOpen,
  onClose,
  onSuccess,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Registro de Aplicação</DialogTitle>
          <DialogDescription>
            Modifique os dados do registro de aplicação
          </DialogDescription>
        </DialogHeader>

        {/* Pass the existing registro data for editing */}
        <RegistroAplicacaoForm
          entrega={registro.lista_entrega}
          isOpen={true}  
          onClose={onClose}
          onSuccess={onSuccess}
          existingRegistro={registro}
        />
      </DialogContent>
    </Dialog>
  );
};
