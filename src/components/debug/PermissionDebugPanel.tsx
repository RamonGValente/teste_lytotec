
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { usePermissionDebug } from '@/hooks/usePermissionDebug';
import { Bug, TestTube, Shield, Route } from 'lucide-react';

/**
 * Painel de debug para permissões - útil para desenvolvimento e troubleshooting
 * Pode ser acessado apenas por SuperAdmins
 */
const PermissionDebugPanel: React.FC = () => {
  const [testRoute, setTestRoute] = useState('/gestao-maquinas/dashboard');
  const { runFullDiagnostic, testSpecificRoute, authPermissions } = usePermissionDebug();

  // Só mostrar para SuperAdmins ou em desenvolvimento
  if (!authPermissions.isSuperAdmin && import.meta.env.PROD) {
    return null;
  }

  return (
    <Card className="mt-6 border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Bug className="h-5 w-5" />
          Permission Debug Panel
          <span className="text-xs bg-orange-200 px-2 py-1 rounded">
            {import.meta.env.DEV ? 'DEV' : 'SUPERADMIN'}
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={runFullDiagnostic}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            Run Full Diagnostic
          </Button>
          
          <div className="flex gap-2">
            <Input
              value={testRoute}
              onChange={(e) => setTestRoute(e.target.value)}
              placeholder="/route/to/test"
              className="flex-1"
            />
            <Button
              onClick={() => testSpecificRoute(testRoute)}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <TestTube className="h-4 w-4" />
              Test
            </Button>
          </div>
        </div>
        
        <div className="text-xs text-orange-700 bg-orange-100 p-2 rounded">
          <strong>Como usar:</strong>
          <br />• "Run Full Diagnostic" - Executa análise completa das permissões
          <br />• "Test Route" - Testa acesso a uma rota específica
          <br />• Verifique o console (F12) para logs detalhados
        </div>
        
        <div className="text-xs text-gray-600">
          User: {authPermissions.userId} | Role: {authPermissions.userRole} | 
          Permissions: {authPermissions.permissions.length}
        </div>
      </CardContent>
    </Card>
  );
};

export default PermissionDebugPanel;
