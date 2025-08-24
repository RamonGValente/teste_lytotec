
# Documentação Técnica - Sistema de Gestão Integrada 🔧

## Índice

1. [Arquitetura Geral](#arquitetura-geral)
2. [**Progressive Web App (PWA)**](#progressive-web-app-pwa) 📱 **NOVO**
3. [**Arquitetura Offline e Sincronização**](#arquitetura-offline-e-sincronização) 🔄 **EXPANDIDO**
4. [Tecnologias Utilizadas](#tecnologias-utilizadas)
5. [Estrutura do Projeto](#estrutura-do-projeto)
6. [Padrões de Desenvolvimento](#padrões-de-desenvolvimento)
7. [Sistema de Autenticação](#sistema-de-autenticação)
8. [Gestão de Estado](#gestão-de-estado)
9. [API e Banco de Dados](#api-e-banco-de-dados)
10. [Componentes UI](#componentes-ui)
11. [Performance e Otimizações](#performance-e-otimizações)
12. [Segurança](#segurança)
13. [Monitoramento](#monitoramento)

## Arquitetura Geral

### Visão Geral
O sistema é uma **Progressive Web Application (PWA)** construída com React, TypeScript e Vite, conectada ao Supabase como backend. A partir da versão 3.0, inclui **capacidade offline completa** com sincronização automática e funcionalidades nativas de aplicativo móvel.

### Stack Principal
```
Frontend:  React 18 + TypeScript + Vite + Tailwind CSS
Backend:   Supabase (PostgreSQL + Auth + Storage + Realtime)
UI:        Shadcn/UI + Radix UI + Lucide Icons
State:     TanStack Query + React Hook Form + Zustand
PWA:       Vite PWA Plugin + Service Worker + Web App Manifest ⭐ NOVO
Offline:   localStorage + Service Worker + Background Sync ⭐ EXPANDIDO
```

### Fluxo de Dados
```
User Input → React Hook Form → Validation → 
→ Connection Check → [Online: Supabase | Offline: localStorage] →
→ TanStack Query Cache → UI Update → Background Sync (if offline) →
→ PWA Update Check → Service Worker Cache Management
```

## Progressive Web App (PWA) 📱

### Visão Geral da Arquitetura PWA
O sistema implementa uma **PWA completa** que oferece experiência nativa em dispositivos móveis e desktop, com capacidades offline, instalação, notificações e atualizações automáticas.

### Componentes PWA Principais

#### 1. **Configuração Vite PWA**
```typescript
// vite.config.ts - Configuração PWA
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',           // Atualizações automáticas
      injectRegister: 'auto',               // Registro automático do SW
      strategies: 'injectManifest',         // Service Worker customizado
      srcDir: 'src',
      filename: 'sw.ts',                    // Service Worker TypeScript
      injectManifest: {
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10 MB
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}']
      },
      manifest: {
        name: 'Lytorânea Construtora - Sistema ERP',
        short_name: 'LYTOTEC ERP',
        description: 'Sistema ERP completo para gestão de empresas de construção civil',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',              // Fullscreen app experience
        display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        id: 'app.lytotec.erp',
        launch_handler: {
          client_mode: 'focus-existing'     // Foco em instância existente
        }
      }
    })
  ]
});
```

#### 2. **Service Worker Customizado**
```typescript
// src/sw.ts - Service Worker com estratégias de cache
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

// Estratégias de Cache Implementadas:

// 1. Cache First para assets estáticos (JS, CSS, imagens)
registerRoute(
  ({ request }) => request.destination === 'script' || 
                   request.destination === 'style' ||
                   request.destination === 'image',
  new CacheFirst({
    cacheName: 'static-assets-v1',
    plugins: [/* cache plugins */]
  })
);

// 2. Network First para API calls
registerRoute(
  ({ url }) => url.origin.includes('supabase.co'),
  new NetworkFirst({
    cacheName: 'api-cache-v1',
    plugins: [/* network plugins */]
  })
);

// 3. Stale While Revalidate para fontes
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com',
  new StaleWhileRevalidate({
    cacheName: 'fonts-cache-v1'
  })
);
```

#### 3. **Web App Manifest**
```json
// public/manifest.json - Configuração do aplicativo
{
  "name": "Lytorânea Construtora - Sistema ERP",
  "short_name": "LYTOTEC ERP",
  "description": "Sistema ERP completo para gestão de empresas de construção civil",
  "theme_color": "#3b82f6",
  "background_color": "#ffffff",
  "display": "standalone",
  "scope": "/",
  "start_url": "/",
  "icons": [
    {
      "src": "icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "icons/maskable-icon-192x192.png",
      "sizes": "192x192", 
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

### Funcionalidades PWA Implementadas

#### 1. **Instalação da Aplicação**
```typescript
// src/components/pwa/PWAInstallBanner.tsx
export const PWAInstallBanner = () => {
  const { canInstall, install, isInstalled } = usePWAInstall();

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Smartphone className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="font-semibold">Instalar App</h3>
              <p className="text-sm text-muted-foreground">
                Acesse offline e tenha uma experiência nativa
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button size="sm" onClick={install}>
              Instalar
            </Button>
            <Button size="sm" variant="outline" onClick={dismiss}>
              Agora não
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
```

#### 2. **Notificações de Atualização**
```typescript
// src/components/pwa/PWAUpdateNotification.tsx
export const PWAUpdateNotification = () => {
  const { needRefresh, updateServiceWorker } = usePWAUpdate();

  if (!needRefresh) return null;

  return (
    <Alert className="fixed top-4 left-4 right-4 z-50">
      <RefreshCw className="h-4 w-4" />
      <AlertTitle>Nova versão disponível</AlertTitle>
      <AlertDescription>
        Uma nova versão do app está disponível. Clique para atualizar.
      </AlertDescription>
      <Button onClick={updateServiceWorker} size="sm" className="mt-2">
        Atualizar Agora
      </Button>
    </Alert>
  );
};
```

#### 3. **Indicador de Status Offline**
```typescript
// src/components/pwa/OfflineIndicator.tsx
export const OfflineIndicator = () => {
  const { isOnline, isSupabaseConnected } = useConnectionStatus();
  const { syncStatus, sincronizarTodos } = useOfflineSync();

  return (
    <div className="fixed top-4 right-4 z-50">
      <Alert className={`border-${isOnline ? 'green' : 'orange'}-200`}>
        <div className="flex items-center gap-2">
          {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
          <Badge variant={isOnline ? "default" : "destructive"}>
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
        </div>
        
        {syncStatus.pendingCount > 0 && (
          <div className="mt-2">
            <p className="text-sm">
              {syncStatus.pendingCount} itens aguardando sincronização
            </p>
            <Button size="sm" onClick={sincronizarTodos}>
              Sincronizar Agora
            </Button>
          </div>
        )}
      </Alert>
    </div>
  );
};
```

### Hooks PWA Customizados

#### 1. **usePWAInstall Hook**
```typescript
// src/hooks/usePWAInstall.ts
export const usePWAInstall = () => {
  const [canInstall, setCanInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setCanInstall(false);
      setDeferredPrompt(null);
    }
  };

  return { canInstall, install, isInstalled: !canInstall && !deferredPrompt };
};
```

#### 2. **usePWAUpdate Hook**
```typescript
// src/hooks/usePWAUpdate.ts
export const usePWAUpdate = () => {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [updateServiceWorker, setUpdateServiceWorker] = useState<() => void>(() => {});

  useEffect(() => {
    const updateAvailable = (event: CustomEvent) => {
      setNeedRefresh(true);
      setUpdateServiceWorker(() => () => {
        event.detail?.updateServiceWorker?.();
        setNeedRefresh(false);
      });
    };

    document.addEventListener('pwa-update-available', updateAvailable);
    
    return () => {
      document.removeEventListener('pwa-update-available', updateAvailable);
    };
  }, []);

  return { needRefresh, updateServiceWorker };
};
```

## Arquitetura Offline e Sincronização 🔄

### Visão Geral da Arquitetura Offline
O sistema implementa uma **arquitetura híbrida online/offline** que permite operação contínua independente da conectividade, com sincronização automática e transparente para o usuário.

### Componentes Principais

#### 1. **Connection Status Manager**
```typescript
// src/hooks/useConnectionStatus.ts
interface ConnectionStatus {
  isOnline: boolean;           // Status do navegador
  isSupabaseConnected: boolean; // Conexão real com Supabase
  lastCheck: Date;             // Última verificação
}

// Arquitetura de Verificação:
Navigator.onLine → Basic Check → Supabase Ping → Real Status

export const useConnectionStatus = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isOnline: navigator.onLine,
    isSupabaseConnected: false,
    lastCheck: new Date()
  });

  const checkSupabaseConnection = async (): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .select('count', { count: 'exact', head: true });
      return !error;
    } catch {
      return false;
    }
  };

  // Verificação periódica a cada 30 segundos
  useEffect(() => {
    const intervalId = setInterval(updateConnectionStatus, 30000);
    return () => clearInterval(intervalId);
  }, []);

  return { ...connectionStatus, refresh: updateConnectionStatus };
};
```

#### 2. **Offline Storage Layer**
```typescript
// src/utils/salvarOffline.ts
// LocalStorage Schema:
interface DadosOffline {
  id: string;           // temp_uuid_timestamp
  timestamp: string;    // ISO date de criação
  data: any;           // Dados do formulário original
  tentativas: number;   // 0-3 tentativas de sync
  erro?: string;       // Último erro encontrado
  usuario_id?: string; // ID do usuário para auditoria
}

// Mapeamento de tipos para configurações
export const TIPOS_APONTAMENTO = {
  apontamento_equipe: {
    tabela: 'bd_apontamento_equipe',
    chaveLocalStorage: 'offline_apontamento_equipe',
    nomeExibicao: 'Apontamento de Equipe'
  },
  apontamento_caminhoes: {
    tabela: 'bd_apontamento_caminhoes',
    chaveLocalStorage: 'offline_apontamento_caminhoes', 
    nomeExibicao: 'Apontamento de Caminhões'
  },
  registro_aplicacao: {
    tabela: 'bd_registros_aplicacao',
    chaveLocalStorage: 'offline_registro_aplicacao',
    nomeExibicao: 'Registro de Aplicação'
  }
} as const;

export type TipoApontamento = keyof typeof TIPOS_APONTAMENTO;
```

#### 3. **Synchronization Engine**
```typescript
// src/hooks/useOfflineSync.ts
// Sync Flow Architecture:
// [Connection Detected] → [Enumerate Pending] → [Process Each Type] →
// → [Validate Data] → [Send to Supabase] → [Handle Response] →
// → [Update Status] → [Clean Cache] → [Notify User]

export const useOfflineSync = () => {
  const { isSupabaseConnected } = useConnectionStatus();
  const { toast } = useToast();
  
  const sincronizarTipo = async (tipo: TipoApontamento) => {
    const config = TIPOS_APONTAMENTO[tipo];
    const dados = obterDadosOffline(tipo);
    
    let sucessos = 0;
    let erros = 0;
    
    for (const item of dados) {
      try {
        const { id, timestamp, tentativas, erro, usuario_id, ...dadosLimpos } = item;
        const dadosParaInserir = dadosLimpos.data;
        
        // Remover campos que podem conflitar
        delete dadosParaInserir.id;
        
        const { error } = await supabase
          .from(config.tabela)
          .insert(dadosParaInserir);

        if (error) {
          incrementarTentativas(tipo, item.id, error.message);
          erros++;
        } else {
          limparDadosOffline(tipo, [item.id]);
          sucessos++;
        }
      } catch (error) {
        incrementarTentativas(tipo, item.id, String(error));
        erros++;
      }
    }
    
    return { sucessos, erros };
  };

  return { sincronizarTodos, sincronizarTipo, syncStatus };
};
```

#### 4. **Background Sync API Integration**
```typescript
// src/types/background-sync.d.ts
interface SyncManager {
  register(tag: string): Promise<void>;
  getTags(): Promise<string[]>;
}

interface ServiceWorkerRegistration {
  sync: SyncManager;
}

// Service Worker Background Sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-data') {
    event.waitUntil(syncOfflineData());
  }
});

// Registration in main thread
const registerBackgroundSync = async () => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    if ('sync' in registration) {
      await registration.sync.register('sync-offline-data');
    }
  }
};
```

### Hooks Offline para Módulos Específicos

#### 1. **useApontamentoEquipeOffline**
```typescript
// src/hooks/useApontamentoEquipeOffline.ts
export const useApontamentoEquipeOffline = () => {
  const { isSupabaseConnected } = useConnectionStatus();
  const { toast } = useToast();
  const { user } = useAuth();

  const submitApontamento = async (formData: any, onSuccess?: () => void) => {
    if (isSupabaseConnected) {
      // Online: Direct to Supabase
      const { error } = await supabase
        .from('bd_apontamento_equipe')
        .insert(formData);
        
      if (error) throw error;
      
      toast({
        title: "Apontamento registrado",
        description: "Dados salvos com sucesso",
        variant: "default"
      });
    } else {
      // Offline: Save to localStorage
      salvarApontamentoOffline('apontamento_equipe', formData, user?.id);
      
      toast({
        title: "Salvo offline",
        description: "Dados serão sincronizados quando a conexão for restaurada",
        variant: "default"
      });
    }
    
    onSuccess?.();
  };

  return {
    submitApontamento,
    isOffline: !isSupabaseConnected
  };
};
```

#### 2. **useApontamentoCaminhoesOffline**
```typescript
// src/hooks/useApontamentoCaminhoesOffline.ts
export const useApontamentoCaminhoesOffline = () => {
  const { isSupabaseConnected } = useConnectionStatus();
  const { toast } = useToast();
  const { user } = useAuth();

  const submitApontamento = async (formData: any, onSuccess?: () => void) => {
    if (isSupabaseConnected) {
      const { error } = await supabase
        .from('bd_apontamento_caminhoes')
        .insert(formData);
        
      if (error) throw error;
      
      toast({
        title: "Apontamento de caminhões registrado",
        variant: "default"
      });
    } else {
      salvarApontamentoOffline('apontamento_caminhoes', formData, user?.id);
      
      toast({
        title: "Salvo offline",
        description: "Apontamento será sincronizado automaticamente",
        variant: "default"
      });
    }
    
    onSuccess?.();
  };

  return { submitApontamento, isOffline: !isSupabaseConnected };
};
```

#### 3. **useRegistroAplicacaoOffline**
```typescript
// src/hooks/useRegistroAplicacaoOffline.ts
export const useRegistroAplicacaoOffline = () => {
  const { isSupabaseConnected } = useConnectionStatus();
  const { toast } = useToast();
  const { user } = useAuth();

  const submitRegistro = async (formData: any, onSuccess?: () => void) => {
    if (isSupabaseConnected) {
      const { error } = await supabase
        .from('bd_registros_aplicacao')
        .insert(formData);
        
      if (error) throw error;
      
      toast({
        title: "Registro de aplicação salvo",
        variant: "default"
      });
    } else {
      salvarApontamentoOffline('registro_aplicacao', formData, user?.id);
      
      toast({
        title: "Salvo offline",
        description: "Registro será sincronizado quando possível",
        variant: "default"
      });
    }
    
    onSuccess?.();
  };

  return { submitRegistro, isOffline: !isSupabaseConnected };
};
```

### Sistema de Cache Inteligente

#### 1. **useOfflineData Hook**
```typescript
// src/hooks/useOfflineData.ts
export const useOfflineData = <T>({
  key,
  fetcher,
  enabled = true,
  staleTime = 5 * 60 * 1000 // 5 minutes
}: OfflineDataOptions) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState(false);
  const { isSupabaseConnected } = useConnectionStatus();

  // Cache data in Service Worker
  const cacheData = useCallback(async (data: T) => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_DATA',
        key,
        data: { value: data, timestamp: Date.now() }
      });
    }
    
    // Fallback to localStorage
    try {
      localStorage.setItem(`offline_${key}`, JSON.stringify({
        value: data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Failed to cache in localStorage:', error);
    }
  }, [key]);

  // Fetch fresh data or use cache
  const fetchData = useCallback(async () => {
    if (!enabled) return;
    
    try {
      if (isSupabaseConnected) {
        // Online: fetch fresh data
        const freshData = await fetcher();
        setData(freshData);
        setIsStale(false);
        await cacheData(freshData);
      } else {
        // Offline: use cached data
        const cached = await getCachedData();
        if (cached) {
          const isDataStale = Date.now() - cached.timestamp > staleTime;
          setData(cached.value);
          setIsStale(isDataStale);
        }
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, enabled, isSupabaseConnected, staleTime]);

  return { data, isLoading, error, isStale, isOffline: !isSupabaseConnected, refresh: fetchData };
};
```

#### 2. **offlineQueries Utilities**
```typescript
// src/utils/offlineQueries.ts
export const offlineQueries = {
  // Funcionários
  funcionarios: () => useOfflineQuery(
    'funcionarios',
    async () => {
      const { data, error } = await supabase
        .from('bd_funcionarios')
        .select('*')
        .eq('status', 'Ativo')
        .order('nome_completo');
      
      if (error) throw error;
      return data;
    },
    { staleTime: 10 * 60 * 1000 } // 10 minutos
  ),

  // Equipes
  equipes: () => useOfflineQuery(
    'equipes',
    async () => {
      const { data, error } = await supabase
        .from('bd_equipes')
        .select(`
          *,
          apontador:apontador_id(id, nome_completo),
          encarregado:encarregado_id(id, nome_completo)
        `)
        .order('nome_equipe');
      
      if (error) throw error;
      return data;
    },
    { staleTime: 15 * 60 * 1000 } // 15 minutos
  ),

  // Centros de Custo
  centrosCusto: () => useOfflineQuery(
    'centros-custo',
    async () => {
      const { data, error } = await supabase
        .from('bd_centros_custo')
        .select('*')
        .eq('situacao', 'Ativo')
        .order('nome_centro_custo');
      
      if (error) throw error;
      return data;
    },
    { staleTime: 30 * 60 * 1000 } // 30 minutos
  )
};

// Função para pré-carregar dados essenciais
export const preloadEssentialData = async () => {
  console.log('🔄 Pré-carregando dados essenciais...');
  
  const promises = [
    supabase.from('bd_funcionarios').select('*').eq('status', 'Ativo'),
    supabase.from('bd_equipes').select('*'),
    supabase.from('bd_centros_custo').select('*').eq('situacao', 'Ativo'),
    supabase.from('bd_caminhoes_equipamentos').select('*'),
    supabase.from('bd_usinas').select('*')
  ];

  try {
    const results = await Promise.allSettled(promises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    console.log(`✅ Pré-carregamento concluído: ${successful}/${promises.length} queries`);
  } catch (error) {
    console.error('Erro no pré-carregamento:', error);
  }
};
```

### Padrões de Implementação Offline

#### 1. **Component Pattern para Forms Offline**
```typescript
// Padrão para componentes com suporte offline
const OfflineAwareForm = () => {
  const { isSupabaseConnected } = useConnectionStatus();
  const { submitData, isOffline } = useModuleOffline();

  return (
    <Dialog>
      <DialogTitle className="flex items-center gap-2">
        Formulário
        {isOffline && <WifiOff className="h-4 w-4 text-orange-600" />}
        {isSupabaseConnected && <Wifi className="h-4 w-4 text-green-600" />}
      </DialogTitle>
      
      {isOffline && (
        <Alert>
          <AlertTitle>Modo Offline</AlertTitle>
          <AlertDescription>
            Dados serão sincronizados automaticamente quando a conexão for restaurada.
          </AlertDescription>
        </Alert>
      )}
      
      <Button type="submit">
        Salvar {isOffline && "(Offline)"}
      </Button>
    </Dialog>
  );
};
```

#### 2. **Error Handling & Recovery**
```typescript
// Classificação e tratamento de erros de sincronização
enum SyncErrorType {
  NETWORK_ERROR = 'network',
  AUTH_ERROR = 'auth',
  VALIDATION_ERROR = 'validation',
  SERVER_ERROR = 'server',
  QUOTA_ERROR = 'quota'
}

const recoveryStrategies = {
  [SyncErrorType.AUTH_ERROR]: async () => {
    await supabase.auth.refreshSession();
    return true; // Pode tentar novamente
  },
  
  [SyncErrorType.NETWORK_ERROR]: async () => {
    return false; // Aguardar reconexão
  },
  
  [SyncErrorType.VALIDATION_ERROR]: async (data) => {
    const correctedData = autoCorrectData(data);
    return !!correctedData;
  },
  
  [SyncErrorType.QUOTA_ERROR]: async () => {
    await forceCleanupCache();
    return true;
  }
};
```

### Performance e Otimizações

#### 1. **Chunking Strategy no Vite**
```typescript
// vite.config.ts - Otimizações de build
export default defineConfig({
  build: {
    sourcemap: true,
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          charts: ['recharts'],
          supabase: ['@supabase/supabase-js'],
          xlsx: ['xlsx'],
          'react-query': ['@tanstack/react-query'],
          'date-utils': ['date-fns', 'date-fns-tz'],
          'forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'routing': ['react-router-dom'],
          'lucide': ['lucide-react']
        }
      }
    }
  }
});
```

#### 2. **Service Worker Cache Strategies**
```typescript
// src/sw.ts - Estratégias de cache otimizadas
// Cache names com versionamento
const DATA_CACHE = 'lytotec-data-v1';
const API_CACHE = 'lytotec-api-v1';
const NAVIGATION_CACHE = 'lytotec-navigation-v1';
const LARGE_FILES_CACHE = 'lytotec-large-files-v1';

// Cache para arquivos JavaScript grandes
registerRoute(
  ({ url, request }) => 
    request.destination === 'script' && 
    url.pathname.includes('/assets/') && 
    url.pathname.endsWith('.js'),
  new CacheFirst({
    cacheName: LARGE_FILES_CACHE,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 7, // 7 dias
        purgeOnQuotaError: true
      })
    ]
  })
);

// Cache para chamadas API com Network First
registerRoute(
  ({ url }) => url.origin === 'https://zczirljepectqohlloua.supabase.co',
  new NetworkFirst({
    cacheName: API_CACHE,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 500,
        maxAgeSeconds: 60 * 60 * 24, // 24 horas
        purgeOnQuotaError: true
      })
    ]
  })
);
```

#### 3. **Preload Strategy**
```typescript
// src/main.tsx - Inicialização otimizada
const initializeApp = async () => {
  // Register service worker
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        type: 'module'
      });
      
      console.log('🚀 Service Worker registered successfully');
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      
      // Preload essential data for offline use
      setTimeout(() => {
        preloadEssentialData();
      }, 2000); // Delay para não bloquear renderização inicial
      
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
    }
  }
};
```

## Tecnologias Utilizadas

### Frontend Core
- **React 18**: Framework principal com Concurrent Features
- **TypeScript**: Tipagem estática e developer experience
- **Vite**: Build tool e dev server com PWA plugin
- **React Router DOM**: Roteamento client-side

### PWA & Offline ⭐ NOVO
- **Vite PWA Plugin**: Plugin para geração automática de PWA
- **Workbox**: Service Worker libraries para cache strategies
- **Web App Manifest**: Configuração de aplicativo nativo
- **Background Sync API**: Sincronização em segundo plano

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/UI**: Componentes pré-construídos
- **Radix UI**: Primitivos acessíveis
- **Lucide React**: Ícones SVG

### Estado e Dados
- **TanStack Query**: Cache e sincronização de dados server-side
- **React Hook Form**: Gerenciamento de formulários
- **Zod**: Validação de schemas
- **Zustand**: Estado global leve (para UI state)

### Backend & Database
- **Supabase**: Backend-as-a-Service
  - PostgreSQL database
  - Authentication & Authorization
  - Real-time subscriptions
  - File storage
  - Row Level Security (RLS)

### Utilities
- **Date-fns**: Manipulação de datas
- **React Perfect Scrollbar**: Scrollbars customizadas
- **Recharts**: Gráficos e visualizações
- **XLSX**: Exportação Excel
- **jsPDF**: Geração de PDFs

## Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base (shadcn/ui)
│   ├── layout/         # Layout components
│   ├── pwa/            # Componentes PWA ⭐ NOVO
│   │   ├── PWAInstallBanner.tsx
│   │   ├── PWAUpdateNotification.tsx
│   │   └── OfflineIndicator.tsx
│   ├── offline/        # Componentes offline ⭐ NOVO
│   │   └── OfflineStatusIndicator.tsx
│   └── [modules]/      # Componentes específicos por módulo
├── hooks/              # Custom hooks
│   ├── usePWAInstall.ts          ⭐ NOVO
│   ├── usePWAUpdate.ts           ⭐ NOVO
│   ├── useConnectionStatus.ts    ⭐ NOVO
│   ├── useOfflineSync.ts         ⭐ NOVO
│   ├── useOfflineData.ts         ⭐ NOVO
│   ├── useApontamentoEquipeOffline.ts    ⭐ NOVO
│   ├── useApontamentoCaminhoesOffline.ts ⭐ NOVO
│   ├── useRegistroAplicacaoOffline.ts    ⭐ NOVO
│   └── [outros-hooks]
├── pages/              # Páginas da aplicação
├── services/           # Serviços de API
├── utils/              # Utilitários
│   ├── salvarOffline.ts         ⭐ NOVO
│   ├── offlineQueries.ts        ⭐ NOVO
│   └── [other-utils]
├── types/              # Definições TypeScript
│   ├── background-sync.d.ts     ⭐ NOVO
│   ├── service-worker.d.ts      ⭐ NOVO
│   └── [other-types]
├── contexts/           # React Contexts
├── sw.ts               # Service Worker customizado ⭐ NOVO
└── integrations/       # Configurações de terceiros
    └── supabase/       # Cliente e tipos Supabase
```

### Arquivos PWA Específicos ⭐ NOVO
```
public/
├── manifest.json               # Web App Manifest
├── browserconfig.xml          # Configuração IE/Edge
├── sw.js                      # Service Worker compilado
└── icons/                     # Ícones PWA
    ├── icon-48x48.png
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-144x144.png
    ├── icon-192x192.png
    ├── icon-512x512.png
    ├── maskable-icon-192x192.png
    └── maskable-icon.png
```

## Padrões de Desenvolvimento

### Organização de Componentes
```typescript
// Estrutura padrão de componente
interface ComponentProps {
  // Props tipadas
}

const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // 1. Hooks de estado
  // 2. Hooks de data fetching
  // 3. Hooks customizados (incluindo offline)
  // 4. Event handlers
  // 5. Derived state/computed values
  // 6. Effects
  
  return (
    // JSX
  );
};

export default Component;
```

### Custom Hooks Pattern
```typescript
// Hook para operações CRUD com suporte offline
export const useEntityOperations = () => {
  const queryClient = useQueryClient();
  const { isSupabaseConnected } = useConnectionStatus();
  
  const createMutation = useMutation({
    mutationFn: createEntity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities'] });
    },
  });
  
  return {
    create: createMutation.mutate,
    isCreating: createMutation.isPending,
    isOffline: !isSupabaseConnected
  };
};
```

### Service Layer Pattern
```typescript
// Serviços de API centralizados
export const entityService = {
  async getAll(filters?: EntityFilters): Promise<Entity[]> {
    const { data, error } = await supabase
      .from('entities')
      .select('*')
      .match(filters || {});
    
    if (error) throw error;
    return data;
  },
  
  async create(entity: CreateEntityData): Promise<Entity> {
    const { data, error } = await supabase
      .from('entities')
      .insert(entity)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
```

## Sistema de Autenticação

### Configuração Supabase Auth
```typescript
// Cliente Supabase configurado
export const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

// Hook de autenticação
export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);
  
  return {
    session,
    user: session?.user || null,
    isAuthenticated: !!session,
  };
};
```

### Proteção de Rotas
```typescript
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
};
```

### Row Level Security (RLS)
```sql
-- Exemplo de política RLS
CREATE POLICY "Users can view own company data" 
ON funcionarios 
FOR SELECT 
USING (
  empresa_id IN (
    SELECT empresa_id 
    FROM profiles 
    WHERE id = auth.uid()
  )
);
```

## Gestão de Estado

### TanStack Query para Server State
```typescript
// Configuração do Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (error) => {
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive",
        });
      },
    },
  },
});

// Hook de query tipado
export const useFuncionarios = (filters?: FuncionarioFilters) => {
  return useQuery({
    queryKey: ['funcionarios', filters],
    queryFn: () => funcionarioService.getAll(filters),
    enabled: !!filters,
  });
};
```

### React Hook Form para Form State
```typescript
// Schema de validação com Zod
const funcionarioSchema = z.object({
  nome_completo: z.string().min(1, "Nome é obrigatório"),
  cpf: z.string().regex(/^\d{11}$/, "CPF deve ter 11 dígitos"),
  email: z.string().email("Email inválido").optional(),
});

type FuncionarioFormValues = z.infer<typeof funcionarioSchema>;

// Uso no componente
const FuncionarioForm = () => {
  const form = useForm<FuncionarioFormValues>({
    resolver: zodResolver(funcionarioSchema),
    defaultValues: {
      nome_completo: "",
      cpf: "",
      email: "",
    },
  });
  
  const onSubmit = (data: FuncionarioFormValues) => {
    // Submit logic
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </Form>
  );
};
```

### Zustand para UI State
```typescript
// Store para estado da UI
interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  theme: 'light',
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setTheme: (theme) => set({ theme }),
}));
```

## API e Banco de Dados

### Database Schema
```sql
-- Estrutura base das tabelas
CREATE TABLE bd_empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_empresa VARCHAR NOT NULL,
  cnpj VARCHAR UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bd_funcionarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES bd_empresas(id),
  nome_completo VARCHAR NOT NULL,
  cpf VARCHAR UNIQUE,
  email VARCHAR,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS habilitado
ALTER TABLE bd_funcionarios ENABLE ROW LEVEL SECURITY;
```

### Query Patterns
```typescript
// Pattern para queries complexas
export const getFuncionariosWithDetails = async (filters: any) => {
  const query = supabase
    .from('bd_funcionarios')
    .select(`
      *,
      empresa:bd_empresas(nome_empresa),
      departamento:bd_departamentos(nome_departamento),
      funcao:bd_funcoes(nome_funcao)
    `);
  
  // Aplicar filtros condicionalmente
  if (filters.empresa_id) {
    query.eq('empresa_id', filters.empresa_id);
  }
  
  if (filters.search) {
    query.ilike('nome_completo', `%${filters.search}%`);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
};
```

### Real-time Subscriptions
```typescript
// Subscrições para updates em tempo real
export const useRealtimeFuncionarios = () => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const channel = supabase
      .channel('funcionarios-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bd_funcionarios' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};
```

## Componentes UI

### Design System
```typescript
// Tema base usando CSS Variables
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
}

// Componentes base tipados
interface ButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
```

### Compound Components Pattern
```typescript
// Pattern para componentes complexos
const DataTable = {
  Root: ({ children, ...props }) => (
    <div className="rounded-md border" {...props}>
      {children}
    </div>
  ),
  
  Header: ({ children }) => (
    <div className="border-b px-4 py-3">
      {children}
    </div>
  ),
  
  Body: ({ children }) => (
    <div className="divide-y">
      {children}
    </div>
  ),
  
  Row: ({ children, ...props }) => (
    <div className="flex items-center px-4 py-3" {...props}>
      {children}
    </div>
  ),
};
```

## Performance e Otimizações

### Code Splitting
```typescript
// Lazy loading de páginas
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Funcionarios = lazy(() => import('./pages/Funcionarios'));

// Wrapper com Suspense
const App = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/funcionarios" element={<Funcionarios />} />
    </Routes>
  </Suspense>
);
```

### Memoization
```typescript
// Componentes memoizados
const FuncionarioCard = React.memo(({ funcionario }) => {
  return (
    <Card>
      <h3>{funcionario.nome_completo}</h3>
      <p>{funcionario.email}</p>
    </Card>
  );
});

// Values memoizados
const ExpensiveComponent = () => {
  const expensiveValue = useMemo(() => {
    return heavyCalculation(data);
  }, [data]);
  
  const handleClick = useCallback((id: string) => {
    // Event handler logic
  }, [dependency]);
  
  return <div>{expensiveValue}</div>;
};
```

### Virtual Scrolling
```typescript
// Para listas grandes
import { FixedSizeList as List } from 'react-window';

const VirtualizedTable = ({ items }) => (
  <List
    height={600}
    itemCount={items.length}
    itemSize={50}
    width="100%"
  >
    {({ index, style }) => (
      <div style={style}>
        <FuncionarioRow funcionario={items[index]} />
      </div>
    )}
  </List>
);
```

## Segurança

### Input Sanitization
```typescript
// Sanitização de inputs
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '');
};

// Validação rigorosa com Zod
const userInputSchema = z.object({
  name: z.string().min(1).max(100).regex(/^[a-zA-ZÀ-ÿ\s]+$/),
  email: z.string().email().max(255),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/),
});
```

### CSRF Protection
```typescript
// Headers de segurança
const secureHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};
```

### Environment Variables
```bash
# Variáveis de ambiente seguras
VITE_SUPABASE_URL=https://project.supabase.co
VITE_SUPABASE_ANON_KEY=public_key_only
# Nunca expor service_role_key no frontend
```

## Monitoramento

### Error Tracking
```typescript
// Error boundaries para captura de erros
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Enviar para serviço de monitoramento
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    
    return this.props.children;
  }
}
```

### Performance Monitoring
```typescript
// Métricas de performance
export const trackPerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  
  console.log(`${name} took ${end - start} milliseconds`);
  
  if (end - start > 1000) {
    console.warn(`Slow operation detected: ${name}`);
  }
};
```

### User Analytics
```typescript
// Tracking de eventos de usuário
export const trackEvent = (event: string, properties?: any) => {
  console.log('Event:', event, properties);
  // Em produção, integrar com serviço de analytics
};

// Uso nos componentes
const handleFormSubmit = () => {
  trackEvent('form_submitted', { form_type: 'funcionario' });
  // ... lógica do submit
};
```

## Testing Strategy ⭐ NOVO

### PWA Testing
```typescript
// Testes de funcionalidade PWA
describe('PWA Functionality', () => {
  test('should register service worker', async () => {
    const registration = await navigator.serviceWorker.register('/sw.js');
    expect(registration.active).toBeTruthy();
  });

  test('should show install banner when criteria met', async () => {
    // Mock beforeinstallprompt event
    const installEvent = new Event('beforeinstallprompt');
    window.dispatchEvent(installEvent);
    
    expect(screen.getByText('Instalar App')).toBeInTheDocument();
  });

  test('should cache assets in service worker', async () => {
    const cache = await caches.open('static-assets-v1');
    const cachedResponse = await cache.match('/assets/main.js');
    expect(cachedResponse).toBeTruthy();
  });
});
```

### Offline Testing
```typescript
// Utilities para testes de conectividade
export const mockOfflineMode = () => {
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: false
  });
  
  jest.spyOn(supabase, 'from').mockImplementation(() => {
    throw new Error('Network error');
  });
};

export const mockOnlineMode = () => {
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: true
  });
  
  jest.restoreAllMocks();
};

describe('Offline Functionality', () => {
  beforeEach(() => {
    localStorage.clear();
    mockOfflineMode();
  });

  test('should save data offline when no connection', async () => {
    const formData = { nome: 'Test', equipe_id: 'uuid' };
    
    await submitApontamento(formData);
    
    const offlineData = localStorage.getItem('offline_apontamento_equipe');
    expect(JSON.parse(offlineData)).toHaveLength(1);
  });

  test('should sync data when connection restored', async () => {
    // Setup offline data
    const offlineData = [{ id: 'temp_1', data: { nome: 'Test' } }];
    localStorage.setItem('offline_apontamento_equipe', JSON.stringify(offlineData));
    
    // Restore connection
    mockOnlineMode();
    
    // Trigger sync
    await sincronizarTodos();
    
    // Verify data was sent and cleaned
    expect(mockSupabaseInsert).toHaveBeenCalled();
    expect(localStorage.getItem('offline_apontamento_equipe')).toBeNull();
  });
});
```

### Performance Testing
```typescript
// Testes de performance específicos para PWA
describe('PWA Performance', () => {
  test('should load initial page within 3 seconds', async () => {
    const startTime = performance.now();
    
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
    
    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(3000);
  });

  test('should cache API responses for offline use', async () => {
    const apiCall = () => supabase.from('funcionarios').select('*');
    
    // First call - should cache
    await apiCall();
    
    // Mock offline
    mockOfflineMode();
    
    // Second call - should use cache
    const cachedData = await apiCall();
    expect(cachedData).toBeTruthy();
  });
});
```

## Debugging & Tools ⭐ NOVO

### PWA Debug Tools
```typescript
// Debug utilities para PWA
export const PWADebugTools = {
  // Verificar status do Service Worker
  checkServiceWorker: async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      console.log('SW Registration:', registration);
      console.log('SW State:', registration?.active?.state);
    }
  },

  // Listar caches disponíveis
  listCaches: async () => {
    const cacheNames = await caches.keys();
    console.log('Available caches:', cacheNames);
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      console.log(`Cache ${cacheName}:`, requests.map(r => r.url));
    }
  },

  // Verificar dados offline
  checkOfflineData: () => {
    const offlineKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('offline_')
    );
    
    console.log('Offline data:', offlineKeys.map(key => ({
      key,
      data: JSON.parse(localStorage.getItem(key) || '[]')
    })));
  },

  // Simular modo offline
  simulateOffline: () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false
    });
    
    window.dispatchEvent(new Event('offline'));
    console.log('Offline mode simulated');
  },

  // Restaurar modo online
  simulateOnline: () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    });
    
    window.dispatchEvent(new Event('online'));
    console.log('Online mode restored');
  }
};

// Expor no window para debug em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  (window as any).PWADebug = PWADebugTools;
}
```

### Console Commands para Debug
```typescript
// Comandos disponíveis no console do navegador:
/*
// Verificar Service Worker
await PWADebug.checkServiceWorker()

// Listar todos os caches
await PWADebug.listCaches()

// Ver dados offline
PWADebug.checkOfflineData()

// Simular offline/online
PWADebug.simulateOffline()
PWADebug.simulateOnline()

// Forçar sincronização
syncOfflineData()

// Limpar cache específico
await caches.delete('lytotec-api-v1')

// Limpar todos os dados offline
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('offline_')) {
    localStorage.removeItem(key)
  }
})
*/
```

---

**Versão da Documentação**: 4.0  
**Última Atualização**: Janeiro 2025  
**Novidades**: Arquitetura PWA completa, funcionalidades offline expandidas, estratégias de cache otimizadas, testes e debugging avançados
