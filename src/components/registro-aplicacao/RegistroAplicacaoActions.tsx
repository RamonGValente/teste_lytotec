
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Pencil, Trash2 } from 'lucide-react';

interface RegistroAplicacaoActionsProps {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const RegistroAplicacaoActions: React.FC<RegistroAplicacaoActionsProps> = ({
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="xs"
        onClick={onView}
        className="h-8 w-8 p-0"
        title="Visualizar"
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="xs"
        onClick={onEdit}
        className="h-8 w-8 p-0"
        title="Editar"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="xs"
        onClick={onDelete}
        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
        title="Excluir"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
