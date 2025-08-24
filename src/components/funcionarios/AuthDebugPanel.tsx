import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { debugUserAuth } from '@/services/funcionarioService';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, User, Shield, Database } from 'lucide-react';

const AuthDebugPanel: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user, userId, isLoading } = useAuth();

  const handleDebugAuth = async () => {
    setLoading(true);
    try {
      const info = await debugUserAuth();
      setDebugInfo(info);
      console.log('🔐 Debug info:', info);
    } catch (error) {
      console.error('❌ Erro ao fazer debug:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      handleDebugAuth();
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Carregando Autenticação...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Debug de Autenticação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Frontend Auth Status */}
        <div className="space-y-2">
          <h3 className="font-semibold flex items-center gap-2">
            <User className="h-4 w-4" />
            Frontend Auth (useAuth)
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant={isAuthenticated ? "default" : "destructive"}>
                {isAuthenticated ? "Autenticado" : "Não Autenticado"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">User ID:</span>
              <span className="text-sm font-mono">{userId || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Email:</span>
              <span className="text-sm">{user?.email || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Database Auth Status */}
        {debugInfo && (
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Database className="h-4 w-4" />
              Database Auth (RLS)
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Session:</span>
                <Badge variant={debugInfo.session_exists ? "default" : "destructive"}>
                  {debugInfo.session_exists ? "Ativa" : "Inativa"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">SuperAdmin:</span>
                <Badge variant={debugInfo.is_super_admin ? "default" : "secondary"}>
                  {debugInfo.is_super_admin ? "Sim" : "Não"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Perfil:</span>
                <Badge variant={debugInfo.profile_exists ? "default" : "destructive"}>
                  {debugInfo.profile_exists ? "Existe" : "Não Existe"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Função:</span>
                <span className="text-sm">{debugInfo.user_role || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Pode Excluir:</span>
                <Badge variant={debugInfo.can_delete_funcionarios ? "default" : "destructive"}>
                  {debugInfo.can_delete_funcionarios ? "Sim" : "Não"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">DB User ID:</span>
                <span className="text-sm font-mono">{debugInfo.user_id || "N/A"}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center pt-4">
          <Button 
            onClick={handleDebugAuth} 
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4" />
                Verificar Autenticação
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthDebugPanel;