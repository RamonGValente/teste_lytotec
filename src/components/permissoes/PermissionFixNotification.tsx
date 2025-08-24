import React from "react";
import { Check, AlertTriangle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface PermissionFixNotificationProps {
  onRefresh?: () => void;
}

const PermissionFixNotification: React.FC<PermissionFixNotificationProps> = ({ onRefresh }) => {
  const [isVisible, setIsVisible] = React.useState(true);

  if (!isVisible) return null;

  return (
    <Alert className="mb-4 border-green-200 bg-green-50">
      <Check className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-800">
        <div className="flex items-center justify-between">
          <div>
            <strong>Sistema de permissões corrigido!</strong>
            <p className="text-sm mt-1">
              • Remoção de funções agora funciona corretamente<br/>
              • Atribuição de novas funções implementada<br/>
              • Duplicações removidas da base de dados<br/>
              • Validações de segurança adicionadas
            </p>
          </div>
          <div className="flex gap-2 ml-4">
            {onRefresh && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onRefresh}
                className="text-green-700 border-green-300 hover:bg-green-100"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Atualizar
              </Button>
            )}
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setIsVisible(false)}
              className="text-green-700 hover:bg-green-100"
            >
              Dispensar
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default PermissionFixNotification;