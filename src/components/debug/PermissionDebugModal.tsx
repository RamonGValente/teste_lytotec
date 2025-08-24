import React, { useState } from 'react';
import { useDynamicPermissions } from '@/hooks/useDynamicPermissions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bug, Check, X, Crown, Shield, User } from 'lucide-react';
import { menuStructure } from '@/constants/menuStructure';
const PermissionDebugModal: React.FC = () => {
  const [open, setOpen] = useState(false);
  const {
    userId,
    userRole,
    isSuperAdmin,
    permissions,
    isLoading
  } = useDynamicPermissions();
  const checkItemAccess = (item: any) => {
    if (isSuperAdmin) return true;
    if (!item.requiredPermission && !item.requiredPermissions?.length) return true;
    if (item.requiredPermission) {
      return permissions.includes(item.requiredPermission);
    }
    if (item.requiredPermissions?.length) {
      return item.requiredPermissions.some((perm: string) => permissions.includes(perm));
    }
    return false;
  };
  const getRoleIcon = () => {
    if (isSuperAdmin) return Crown;
    if (userRole?.includes('Adm')) return Shield;
    return User;
  };
  const Icon = getRoleIcon();
  return <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Debug de Permissões do Sistema
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações do Usuário */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                Informações do Usuário
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div><strong>ID:</strong> {userId}</div>
              <div><strong>Função:</strong> {userRole || 'N/A'}</div>
              <div><strong>Super Admin:</strong> {isSuperAdmin ? 'Sim' : 'Não'}</div>
              <div><strong>Status:</strong> {isLoading ? 'Carregando...' : 'Carregado'}</div>
              <div><strong>Total de Permissões:</strong> {permissions.length}</div>
            </CardContent>
          </Card>

          {/* Lista de Permissões */}
          <Card>
            <CardHeader>
              <CardTitle>Permissões Ativas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {permissions.map(permission => <Badge key={permission} variant="secondary" className="text-xs">
                    {permission}
                  </Badge>)}
              </div>
            </CardContent>
          </Card>

          {/* Acesso aos Menus */}
          <Card>
            <CardHeader>
              <CardTitle>Verificação de Acesso aos Menus</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {menuStructure.map((group, groupIndex) => <div key={groupIndex} className="space-y-2">
                  <h4 className="font-semibold text-sm">{group.title}</h4>
                  <div className="grid gap-2">
                    {group.items.map((item, itemIndex) => {
                  const hasAccess = checkItemAccess(item);
                  return <div key={itemIndex} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <item.icon className="h-4 w-4" />
                            <span className="text-sm">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {hasAccess ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
                            <Badge variant={hasAccess ? "default" : "destructive"} className="text-xs">
                              {hasAccess ? 'PERMITIDO' : 'NEGADO'}
                            </Badge>
                          </div>
                        </div>;
                })}
                  </div>
                </div>)}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>;
};
export default PermissionDebugModal;