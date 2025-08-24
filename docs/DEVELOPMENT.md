
# Guia de Desenvolvimento - Sistema LYTEC 💻

## Índice

1. [Configuração do Ambiente](#configuração-do-ambiente)
2. [**Desenvolvimento com Modo Offline**](#desenvolvimento-com-modo-offline) 🔄 **NOVO**
3. [Estrutura e Convenções](#estrutura-e-convenções)
4. [Padrões de Código](#padrões-de-código)
5. [Banco de Dados](#banco-de-dados)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

## Configuração do Ambiente

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Git
- VS Code (recomendado)

### Setup Inicial
```bash
# Clone do repositório
git clone <repository-url>
cd lytec-system

# Instalação de dependências
npm install

# Configuração das variáveis de ambiente
cp .env.example .env.local

# Configurar variáveis no .env.local
VITE_SUPABASE_URL=https://zczirljepectqohlloua.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Executar em modo desenvolvimento
npm run dev
```

### Extensões VS Code Recomendadas
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-json",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-eslint"
  ]
}
```

### Configuração do TypeScript
```json
// tsconfig.json - principais configurações
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Desenvolvimento com Modo Offline 🔄

### Arquitetura de Desenvolvimento Offline

#### 1. **Estrutura de Arquivos Offline**
```
src/
├── hooks/
│   ├── useConnectionStatus.ts      # Monitor de conectividade
│   ├── useOfflineSync.ts          # Engine de sincronização  
│   ├── useApontamentoEquipeOffline.ts
│   ├── useApontamentoCaminhoesOffline.ts
│   └── use[Modulo]Offline.ts      # Padrão para novos módulos
├── utils/
│   └── salvarOffline.ts           # Utilitários de armazenamento
├── components/
│   ├── offline/
│   │   ├── OfflineStatusIndicator.tsx
│   │   └── ConnectionMonitor.tsx
│   └── [modulo]/
│       └── [Modulo]FormOffline.tsx # Forms com suporte offline
└── types/
    └── offline.ts                 # Types para funcionalidade offline
```

#### 2. **Padrão para Implementar Novo Módulo Offline**

**Passo 1: Criar Hook Offline**
```typescript
// src/hooks/use[Modulo]Offline.ts
import { useState } from 'react';
import { useConnectionStatus } from './useConnectionStatus';
import { useToast } from './use-toast';
import { salvarApontamentoOffline } from '@/utils/salvarOffline';
import { create[Modulo] } from '@/services/[modulo]Service';
import { useAuth } from './useAuth';

export const use[Modulo]Offline = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { isSupabaseConnected } = useConnectionStatus();
  const { toast } = useToast();
  const { userId } = useAuth();

  const submit[Modulo] = async (formData: any, onSuccess?: () => void) => {
    setIsLoading(true);
    
    try {
      if (isSupabaseConnected) {
        // Online: Enviar direto para Supabase
        console.log('📡 Enviando [modulo] online...');
        await create[Modulo](formData);
        
        toast({
          title: "[Modulo] registrado",
          description: "[Modulo] salvo com sucesso",
          variant: "default"
        });
      } else {
        // Offline: Salvar no localStorage
        console.log('📵 Salvando [modulo] offline...');
        
        salvarApontamentoOffline('[tipo_modulo]', formData, userId);
        
        toast({
          title: "Salvo offline",
          description: "[Modulo] será sincronizado quando a internet voltar",
          variant: "default"
        });
      }
      
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao submeter [modulo]:', error);
      
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao salvar [modulo]",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    submit[Modulo],
    isLoading,
    isOffline: !isSupabaseConnected
  };
};
```

**Passo 2: Adicionar Tipo no salvarOffline.ts**
```typescript
// src/utils/salvarOffline.ts
export type TipoApontamento = 
  | 'apontamento_equipe'
  | 'apontamento_caminhoes'
  | 'registro_aplicacao'
  | 'registro_cargas'
  | 'chamados_os'
  | 'ordens_servico'
  | '[novo_tipo_modulo]'; // ⭐ ADICIONAR AQUI

export const TIPOS_APONTAMENTO: Record<TipoApontamento, ConfigTipoApontamento> = {
  // ... tipos existentes
  '[novo_tipo_modulo]': {
    tabela: 'bd_[tabela_modulo]',
    chaveLocalStorage: 'offline_[modulo]',
    nomeExibicao: '[Nome Exibição do Módulo]'
  }
};
```

**Passo 3: Adaptar Componente de Formulário**
```typescript
// src/components/[modulo]/[Modulo]FormOffline.tsx
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { use[Modulo]Offline } from '@/hooks/use[Modulo]Offline';

const [Modulo]FormOffline = ({ isOpen, onClose, onSuccess }) => {
  const { isSupabaseConnected } = useConnectionStatus();
  const { submit[Modulo], isLoading, isOffline } = use[Modulo]Offline();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Novo [Módulo]
            {/* Indicador de status */}
            {isOffline && (
              <div className="flex items-center gap-1 text-orange-600">
                <WifiOff className="h-4 w-4" />
                <span className="text-sm">Offline</span>
              </div>
            )}
            {isSupabaseConnected && (
              <div className="flex items-center gap-1 text-green-600">
                <Wifi className="h-4 w-4" />
                <span className="text-sm">Online</span>
              </div>
            )}
          </DialogTitle>
          
          <DialogDescription>
            {isOffline && (
              <div className="mt-2 text-orange-600 text-sm">
                Modo offline ativo - dados serão sincronizados automaticamente
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Alert de modo offline */}
        {isOffline && (
          <Alert>
            <WifiOff className="h-4 w-4" />
            <AlertTitle>Modo Offline</AlertTitle>
            <AlertDescription>
              O [módulo] será salvo localmente e sincronizado quando a conexão for restaurada.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit[Modulo])}>
            {/* Campos do formulário */}
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                    {isOffline ? "Salvando offline..." : "Salvando..."}
                  </>
                ) : (
                  `Salvar [Módulo] ${isOffline ? "(Offline)" : ""}`
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
```

#### 3. **Testando Funcionalidade Offline**

**Simular Modo Offline no Navegador:**
```javascript
// Console do navegador (F12)
// 1. Simular offline
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: false
});
window.dispatchEvent(new Event('offline'));

// 2. Simular online
Object.defineProperty(navigator, 'onLine', {
  writable: true, 
  value: true
});
window.dispatchEvent(new Event('online'));
```

**DevTools Network Tab:**
```
1. F12 > Network tab
2. Checkbox "Offline" para simular perda de conexão
3. Testar formulários em modo offline
4. Desmarcar "Offline" para simular reconexão
5. Verificar sincronização automática
```

**Verificar localStorage:**
```javascript
// Console do navegador - verificar dados offline
Object.keys(localStorage).filter(key => key.startsWith('offline_'))
  .forEach(key => {
    const data = JSON.parse(localStorage.getItem(key) || '[]');
    console.log(`${key}: ${data.length} registros`);
  });
```

#### 4. **Debugging Modo Offline**

**Logs Estruturados:**
```typescript
// Padrão de logs para debugging offline
const logOfflineOperation = (operation: string, type: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`🔄 [${timestamp}] OFFLINE ${operation.toUpperCase()}: ${type}`, data);
};

// Uso:
logOfflineOperation('save', 'apontamento_equipe', formData);
logOfflineOperation('sync', 'apontamento_caminhoes', { count: 3 });
logOfflineOperation('error', 'registro_aplicacao', error.message);
```

**Monitoramento de Estado:**
```typescript
// Hook para debugging estado offline
export const useOfflineDebug = () => {
  const { isOnline, isSupabaseConnected } = useConnectionStatus();
  const { syncStatus } = useOfflineSync();
  
  useEffect(() => {
    console.log('🌐 Connection Status:', {
      isOnline,
      isSupabaseConnected,
      pendingCount: syncStatus.pendingCount,
      lastSync: syncStatus.lastSync
    });
  }, [isOnline, isSupabaseConnected, syncStatus]);
};
```

### Fluxo de Desenvolvimento Offline

#### Cenário 1: Desenvolvendo Nova Funcionalidade
```
1. Implementar versão online normal ✓
2. Criar hook offline seguindo padrão ✓  
3. Adicionar tipo no salvarOffline.ts ✓
4. Adaptar componente form com indicadores ✓
5. Testar modo offline no navegador ✓
6. Testar sincronização automática ✓
7. Verificar logs e error handling ✓
```

#### Cenário 2: Debugging Problemas de Sync
```
1. Verificar logs do console ✓
2. Inspecionar localStorage (F12 > Application) ✓
3. Simular reconexão ✓
4. Verificar network requests ✓
5. Testar sincronização manual ✓
6. Validar limpeza de cache ✓
```

## Estrutura e Convenções

### Estrutura de Pastas
```
src/
├── components/
│   ├── ui/              # Componentes base do shadcn/ui
│   ├── layout/          # Components de layout (header, sidebar)
│   ├── offline/         # Components específicos para offline ⭐
│   └── [domain]/        # Components agrupados por domínio
├── hooks/
│   ├── offline/         # Hooks para funcionalidade offline ⭐
│   └── [domain]/        # Hooks agrupados por domínio
├── pages/               # Páginas/rotas da aplicação
├── services/            # Camada de serviços/API
├── utils/               # Funções utilitárias
├── types/               # Definições de tipos TypeScript
├── lib/                 # Configurações e utilities
└── integrations/        # Integrações externas (Supabase, etc)
```

### Convenções de Nomenclatura

#### Arquivos e Pastas
```
PascalCase:    Component.tsx, Service.ts
camelCase:     utils.ts, hooks.ts
kebab-case:    multi-word-folder/
```

#### Componentes
```typescript
// PascalCase para componentes
export const UserProfile = () => {};
export const DataTable = () => {};

// Props interface com sufixo Props
interface UserProfileProps {
  userId: string;
  onEdit?: () => void;
}
```

#### Hooks
```typescript
// Prefixo use + PascalCase
export const useUserData = () => {};
export const useFormValidation = () => {};

// Hooks offline com sufixo Offline ⭐
export const useApontamentoEquipeOffline = () => {};
export const useRegistroAplicacaoOffline = () => {};
```

#### Services
```typescript
// camelCase + Service suffix
export const userService = {};
export const apontamentoEquipeService = {};
```

### Organização de Imports
```typescript
// 1. React e bibliotecas externas
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Componentes UI
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

// 3. Hooks customizados
import { useAuth } from '@/hooks/useAuth';
import { useConnectionStatus } from '@/hooks/useConnectionStatus'; // ⭐

// 4. Services e utils
import { userService } from '@/services/userService';
import { formatDate } from '@/utils/formatters';

// 5. Types
import type { User } from '@/types/user';
```

## Padrões de Código

### Componentes React

#### Estrutura Padrão
```typescript
// Imports organizados
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useConnectionStatus } from '@/hooks/useConnectionStatus'; // ⭐

// Interface das props
interface ComponentProps {
  id: string;
  onSave?: () => void;
}

// Componente principal
export const Component: React.FC<ComponentProps> = ({ id, onSave }) => {
  // 1. State hooks
  const [isLoading, setIsLoading] = useState(false);
  
  // 2. Data fetching hooks
  const { data, isLoading: isDataLoading } = useQuery(...);
  
  // 3. Custom hooks
  const { isSupabaseConnected } = useConnectionStatus(); // ⭐
  
  // 4. Event handlers
  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Lógica de save
      onSave?.();
    } finally {
      setIsLoading(false);
    }
  };
  
  // 5. Effects
  useEffect(() => {
    // Side effects
  }, []);
  
  // 6. Early returns
  if (isDataLoading) return <div>Loading...</div>;
  
  // 7. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

// Default export
export default Component;
```

#### Padrão para Forms com Offline ⭐
```typescript
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useModuleOffline } from '@/hooks/useModuleOffline';

export const OfflineForm = ({ isOpen, onClose, onSuccess }) => {
  const { isSupabaseConnected } = useConnectionStatus();
  const { submitData, isLoading, isOffline } = useModuleOffline();
  
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {...}
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle className="flex items-center gap-2">
          Título do Form
          {/* Indicador de status */}
          {isOffline && <WifiOff className="h-4 w-4 text-orange-600" />}
          {isSupabaseConnected && <Wifi className="h-4 w-4 text-green-600" />}
        </DialogTitle>
        
        {/* Alert modo offline */}
        {isOffline && (
          <Alert>
            <WifiOff className="h-4 w-4" />
            <AlertTitle>Modo Offline</AlertTitle>
            <AlertDescription>
              Dados serão sincronizados automaticamente
            </AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(data => submitData(data, onSuccess))}>
            {/* Campos do form */}
            
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : `Salvar ${isOffline ? "(Offline)" : ""}`}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
```

### Custom Hooks

#### Padrão Geral
```typescript
export const useCustomHook = (params?: HookParams) => {
  // State interno
  const [state, setState] = useState(initialState);
  
  // Dependências
  const { data } = useQuery(...);
  
  // Funções expostas
  const doSomething = useCallback(async () => {
    // Lógica
  }, [dependencies]);
  
  // Effects
  useEffect(() => {
    // Side effects
  }, []);
  
  // Return object tipado
  return {
    state,
    doSomething,
    isLoading: query.isLoading,
  };
};
```

#### Padrão Hook Offline ⭐
```typescript
export const useModuleOffline = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { isSupabaseConnected } = useConnectionStatus();
  const { toast } = useToast();
  const { userId } = useAuth();

  const submitData = async (formData: any, onSuccess?: () => void) => {
    setIsLoading(true);
    
    try {
      if (isSupabaseConnected) {
        // Online path
        await onlineService(formData);
        toast({ title: "Sucesso", variant: "default" });
      } else {
        // Offline path
        salvarApontamentoOffline(type, formData, userId);
        toast({ title: "Salvo offline", variant: "default" });
      }
      
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    submitData,
    isLoading,
    isOffline: !isSupabaseConnected
  };
};
```

### Services

#### Padrão CRUD
```typescript
// Tipagem das operações
interface CreateData {
  name: string;
  email: string;
}

interface UpdateData extends Partial<CreateData> {
  id: string;
}

interface Filters {
  name?: string;
  status?: string;
}

// Service object
export const entityService = {
  async getAll(filters?: Filters): Promise<Entity[]> {
    const query = supabase.from('entities').select('*');
    
    if (filters?.name) {
      query.ilike('name', `%${filters.name}%`);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Entity> {
    const { data, error } = await supabase
      .from('entities')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(data: CreateData): Promise<Entity> {
    const { data: created, error } = await supabase
      .from('entities')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return created;
  },

  async update(data: UpdateData): Promise<Entity> {
    const { id, ...updateData } = data;
    
    const { data: updated, error } = await supabase
      .from('entities')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return updated;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('entities')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};
```

### Error Handling

#### Try-Catch Padrão
```typescript
const handleAction = async () => {
  try {
    setIsLoading(true);
    await riskyOperation();
    
    toast({
      title: "Sucesso",
      description: "Operação realizada com sucesso",
    });
  } catch (error) {
    console.error('Error in handleAction:', error);
    
    toast({
      title: "Erro",
      description: error instanceof Error ? error.message : "Erro desconhecido",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};
```

#### Error Boundary
```typescript
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">Algo deu errado</h2>
            <p className="text-muted-foreground mb-4">
              Ocorreu um erro inesperado. Tente recarregar a página.
            </p>
            <Button onClick={() => window.location.reload()}>
              Recarregar Página
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Banco de Dados

### Migrations
```sql
-- Padrão para migrations
-- Sempre usar IF NOT EXISTS para evitar erros
CREATE TABLE IF NOT EXISTS bd_nova_tabela (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE bd_nova_tabela ENABLE ROW LEVEL SECURITY;

-- Criar políticas
CREATE POLICY "Users can view own data" 
ON bd_nova_tabela FOR SELECT 
USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bd_nova_tabela_updated_at 
  BEFORE UPDATE ON bd_nova_tabela 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### RLS Policies
```sql
-- Padrões de políticas RLS

-- 1. Acesso por empresa
CREATE POLICY "Users access own company data" 
ON bd_funcionarios FOR ALL 
USING (
  empresa_id IN (
    SELECT empresa_id 
    FROM profiles 
    WHERE id = auth.uid()
  )
);

-- 2. Acesso próprio (dados do usuário)
CREATE POLICY "Users access own data" 
ON bd_apontamento_equipe FOR ALL 
USING (auth.uid() = created_by);

-- 3. Acesso por role
CREATE POLICY "Admins access all data" 
ON bd_empresas FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('SuperAdm', 'AdmLogistica')
  )
);
```

### Queries Complexas
```sql
-- Padrão para queries com joins
SELECT 
  f.id,
  f.nome_completo,
  e.nome_empresa,
  d.nome_departamento,
  fu.nome_funcao
FROM bd_funcionarios f
LEFT JOIN bd_empresas e ON f.empresa_id = e.id
LEFT JOIN bd_departamentos d ON f.departamento_id = d.id  
LEFT JOIN bd_funcoes fu ON f.funcao_id = fu.id
WHERE f.status = 'Ativo'
ORDER BY f.nome_completo;

-- Views para queries frequentes
CREATE OR REPLACE VIEW vw_funcionarios_completo AS
SELECT 
  f.*,
  e.nome_empresa,
  d.nome_departamento,
  fu.nome_funcao
FROM bd_funcionarios f
LEFT JOIN bd_empresas e ON f.empresa_id = e.id
LEFT JOIN bd_departamentos d ON f.departamento_id = d.id
LEFT JOIN bd_funcoes fu ON f.funcao_id = fu.id;
```

## Testing

### Configuração Jest
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
};
```

### Testing Utils
```typescript
// src/test/utils.tsx
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

// Mock do useConnectionStatus para testes offline ⭐
export const mockConnectionStatus = (isOnline = true, isSupabaseConnected = true) => {
  jest.mock('@/hooks/useConnectionStatus', () => ({
    useConnectionStatus: () => ({
      isOnline,
      isSupabaseConnected,
      lastCheck: new Date()
    })
  }));
};

// Wrapper para testes
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

export const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </QueryClientProvider>
  );
};
```

### Testes de Componentes
```typescript
// Component.test.tsx
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders, mockConnectionStatus } from '@/test/utils';
import { Component } from './Component';

describe('Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render correctly', () => {
    renderWithProviders(<Component />);
    expect(screen.getByText('Component Title')).toBeInTheDocument();
  });

  it('should handle offline mode correctly', () => {
    // Mock modo offline ⭐
    mockConnectionStatus(false, false);
    
    renderWithProviders(<Component />);
    
    // Verificar indicadores offline
    expect(screen.getByText('Offline')).toBeInTheDocument();
    expect(screen.getByTestId('wifi-off-icon')).toBeInTheDocument();
  });

  it('should save data offline when disconnected', async () => {
    mockConnectionStatus(false, false);
    
    renderWithProviders(<Component />);
    
    // Preencher form
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Test' } });
    fireEvent.click(screen.getByText('Salvar'));
    
    // Verificar se foi salvo no localStorage
    await waitFor(() => {
      const offlineData = localStorage.getItem('offline_test_data');
      expect(offlineData).toBeTruthy();
    });
  });
});
```

### Testes de Hooks Offline ⭐
```typescript
// useModuleOffline.test.ts
import { renderHook, act } from '@testing-library/react';
import { useModuleOffline } from '@/hooks/useModuleOffline';
import { mockConnectionStatus } from '@/test/utils';

describe('useModuleOffline', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should save data offline when disconnected', async () => {
    mockConnectionStatus(false, false);
    
    const { result } = renderHook(() => useModuleOffline());
    
    await act(async () => {
      await result.current.submitData({ name: 'Test' });
    });
    
    expect(result.current.isOffline).toBe(true);
    expect(localStorage.getItem('offline_module_data')).toBeTruthy();
  });

  it('should send data online when connected', async () => {
    mockConnectionStatus(true, true);
    
    const mockService = jest.fn().mockResolvedValue({});
    
    const { result } = renderHook(() => useModuleOffline());
    
    await act(async () => {
      await result.current.submitData({ name: 'Test' });
    });
    
    expect(result.current.isOffline).toBe(false);
    expect(mockService).toHaveBeenCalledWith({ name: 'Test' });
  });
});
```

### Testes de Sincronização ⭐
```typescript
// syncOffline.test.ts
import { sincronizarTodos } from '@/hooks/useOfflineSync';
import { mockConnectionStatus } from '@/test/utils';

describe('Offline Sync', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should sync offline data when connection restored', async () => {
    // Setup dados offline
    const offlineData = [
      { id: 'temp_1', data: { name: 'Test 1' }, tentativas: 0 },
      { id: 'temp_2', data: { name: 'Test 2' }, tentativas: 0 }
    ];
    localStorage.setItem('offline_module_data', JSON.stringify(offlineData));
    
    // Mock conexão restaurada
    mockConnectionStatus(true, true);
    
    // Mock serviço de API
    const mockInsert = jest.fn().mockResolvedValue({});
    
    // Executar sincronização
    await sincronizarTodos();
    
    // Verificar se dados foram enviados
    expect(mockInsert).toHaveBeenCalledTimes(2);
    
    // Verificar se cache foi limpo
    expect(localStorage.getItem('offline_module_data')).toBeNull();
  });

  it('should handle sync errors gracefully', async () => {
    const offlineData = [
      { id: 'temp_1', data: { name: 'Test' }, tentativas: 0 }
    ];
    localStorage.setItem('offline_module_data', JSON.stringify(offlineData));
    
    mockConnectionStatus(true, true);
    
    // Mock erro na API
    const mockInsert = jest.fn().mockRejectedValue(new Error('API Error'));
    
    await sincronizarTodos();
    
    // Verificar se incrementou tentativas
    const updatedData = JSON.parse(localStorage.getItem('offline_module_data') || '[]');
    expect(updatedData[0].tentativas).toBe(1);
  });
});
```

## Deployment

### Build para Produção
```bash
# Verificar variáveis de ambiente
npm run type-check

# Build otimizado
npm run build

# Preview local do build
npm run preview
```

### Variáveis de Ambiente
```bash
# .env.production
VITE_SUPABASE_URL=https://zczirljepectqohlloua.supabase.co
VITE_SUPABASE_ANON_KEY=production_anon_key
VITE_APP_VERSION=1.0.0
```

### Checklist de Deploy
```
□ Testes passando
□ Build sem erros
□ Variáveis de ambiente configuradas
□ Migrações de DB aplicadas
□ RLS policies verificadas
□ Funcionalidade offline testada ⭐
□ Indicadores de conexão funcionando ⭐
□ Sincronização testada em produção ⭐
```

## Troubleshooting

### Problemas Comuns

#### "Module not found"
```bash
# Verificar path alias no tsconfig.json
# Verificar se arquivo existe
# Restart do dev server
npm run dev
```

#### "Type errors"
```bash
# Verificar imports
# Executar type check
npm run type-check

# Gerar tipos do Supabase
npx supabase gen types typescript --project-id zczirljepectqohlloua > src/integrations/supabase/types.ts
```

#### "Build falha"
```bash
# Limpar cache
rm -rf node_modules/.vite
rm -rf dist

# Reinstalar dependências
npm ci

# Build novamente
npm run build
```

#### Problemas de Sincronização Offline ⭐
```javascript
// Debug no console
// 1. Verificar status de conexão
console.log('Navigator online:', navigator.onLine);

// 2. Verificar dados offline
Object.keys(localStorage).filter(k => k.startsWith('offline_'))
  .forEach(key => console.log(key, localStorage.getItem(key)));

// 3. Forçar verificação de conexão
// No console do navegador
checkConnectionStatus();

// 4. Limpar cache offline (último recurso)
Object.keys(localStorage).filter(k => k.startsWith('offline_'))
  .forEach(key => localStorage.removeItem(key));
```

### Logs de Debug
```typescript
// Ativar logs detalhados
const DEBUG = import.meta.env.DEV;

export const debugLog = (message: string, data?: any) => {
  if (DEBUG) {
    console.log(`🐛 [DEBUG] ${message}`, data);
  }
};

// Logs específicos para offline ⭐
export const offlineLog = (operation: string, type: string, data?: any) => {
  if (DEBUG) {
    const timestamp = new Date().toISOString();
    console.log(`🔄 [${timestamp}] OFFLINE ${operation.toUpperCase()}: ${type}`, data);
  }
};
```

### Performance Monitoring
```typescript
// Monitorar performance
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  
  console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`);
  
  if (end - start > 100) {
    console.warn(`🐌 Slow operation: ${name} took ${(end - start).toFixed(2)}ms`);
  }
};
```

---

**Versão do Guia**: 3.0  
**Última Atualização**: Janeiro 2025  
**Novidades**: Padrões completos para desenvolvimento offline, testes de sincronização e debugging avançado

