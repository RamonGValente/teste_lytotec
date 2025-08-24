
import React from "react";
import { Shield, Users, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { RhSecurityContext } from "@/hooks/dashboard/useRhSecurity";

interface RhSecurityIndicatorProps {
  securityContext: RhSecurityContext;
}

export default function RhSecurityIndicator({ securityContext }: RhSecurityIndicatorProps) {
  if (securityContext.isLoading) {
    return (
      <Card className="p-3 bg-gray-50 border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Shield className="h-4 w-4" />
          <span>Carregando contexto de segurança...</span>
        </div>
      </Card>
    );
  }

  if (securityContext.canViewAllData) {
    return (
      <Card className="p-3 bg-green-50 border-green-200">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-800 font-medium">
            Dashboard RH - Acesso Global
          </span>
          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
            SuperAdm
          </Badge>
        </div>
        <p className="text-xs text-green-600 mt-1">
          Visualizando dados de todos os departamentos da empresa
        </p>
      </Card>
    );
  }

  if (securityContext.departamentoNome) {
    return (
      <Card className="p-3 bg-blue-50 border-blue-200">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-blue-600" />
          <span className="text-sm text-blue-800 font-medium">
            Dashboard RH - {securityContext.departamentoNome}
          </span>
          <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
            Por Setor
          </Badge>
        </div>
        <p className="text-xs text-blue-600 mt-1">
          Visualizando dados filtrados apenas para seu departamento
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-3 bg-yellow-50 border-yellow-200">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <span className="text-sm text-yellow-800 font-medium">
          Dashboard RH - Acesso Restrito
        </span>
        <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">
          Sem Departamento
        </Badge>
      </div>
      <p className="text-xs text-yellow-600 mt-1">
        Funcionário não vinculado a departamento - acesso limitado
      </p>
    </Card>
  );
}
