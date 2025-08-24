
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface PermissaoHeaderActionsProps {
  onNewPermissao: () => void;
  onNewFuncaoPermissao: () => void;
}

const PermissaoHeaderActions: React.FC<PermissaoHeaderActionsProps> = ({
  onNewPermissao,
  onNewFuncaoPermissao
}) => {
  return (
    <div className="flex gap-2">
      <Button onClick={onNewPermissao} className="gap-1">
        <Plus className="h-4 w-4" />
        Nova Permissão
      </Button>
      <Button onClick={onNewFuncaoPermissao} className="gap-1">
        <Plus className="h-4 w-4" />
        Nova Função
      </Button>
    </div>
  );
};

export default PermissaoHeaderActions;
