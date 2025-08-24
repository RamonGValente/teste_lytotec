
# Guia de Troubleshooting 🔧

## Problemas Comuns e Soluções

### 🔐 Autenticação e Login

#### Problema: "Não consigo fazer login"
**Sintomas:**
- Email e senha não funcionam
- Erro "Invalid login credentials"
- Tela fica carregando indefinidamente

**Soluções:**
1. **Verificar credenciais**:
   ```bash
   # Confirme se o email está correto
   # Teste com "esqueci minha senha"
   ```

2. **Verificar configuração do Supabase**:
   ```javascript
   // Verificar se as variáveis estão corretas
   console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
   console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY);
   ```

3. **Limpar cache do navegador**:
   ```bash
   # Chrome: Ctrl+Shift+R (força refresh)
   # Firefox: Ctrl+F5
   # Ou limpar localStorage manualmente
   localStorage.clear();
   ```

4. **Verificar Status do Supabase**:
   - Acesse [status.supabase.com](https://status.supabase.com)
   - Verifique se há interrupções no serviço

#### Problema: "Token expirado" ou "Unauthorized"
**Soluções:**
1. **Renovar sessão**:
   ```typescript
   const { data, error } = await supabase.auth.refreshSession();
   if (error) {
     // Redirecionar para login
     window.location.href = '/login';
   }
   ```

2. **Verificar configuração de token**:
   ```typescript
   // No Supabase Dashboard > Authentication > Settings
   // JWT expiry: 3600 (1 hora é o padrão)
   // Refresh token expiry: 604800 (7 dias)
   ```

#### Problema: "Email não confirmado"
**Soluções:**
1. **Reenviar email de confirmação**:
   ```typescript
   const { error } = await supabase.auth.resend({
     type: 'signup',
     email: 'user@example.com'
   });
   ```

2. **Desabilitar confirmação de email** (apenas desenvolvimento):
   ```sql
   -- No Supabase Dashboard > Authentication > Settings
   -- Enable email confirmations: OFF
   ```

### 🔄 Modo Offline e Sincronização **NOVO**

#### Problema: "Dados não sincronizando"
**Sintomas:**
- Indicador mostra dados pendentes há muito tempo
- Botão "Sincronizar agora" não funciona
- Dados permanecem no localStorage
- Contagem de pendentes não diminui

**Soluções Detalhadas:**

1. **Verificar Status de Conexão**:
   ```javascript
   // Verificar se indicador está verde
   // Canto superior direito da tela deve mostrar:
   // 🟢 Online (ideal)
   // 🟡 Conectando... (aguardar)
   // 🔴 Offline (problema de rede)
   ```

2. **Testar Conectividade Real**:
   ```javascript
   // No console do navegador (F12)
   fetch('https://zczirljepectqohlloua.supabase.co/rest/v1/')
     .then(r => console.log('Supabase OK:', r.status))
     .catch(e => console.log('Supabase Error:', e));
   ```

3. **Verificar Dados Pendentes**:
   ```javascript
   // No console do navegador (F12)
   // Verificar o que está no cache offline
   console.log('Apontamentos Equipe:', localStorage.getItem('offline_apontamento_equipe'));
   console.log('Apontamentos Caminhões:', localStorage.getItem('offline_apontamento_caminhoes'));
   console.log('Registro Aplicação:', localStorage.getItem('offline_registro_aplicacao'));
   console.log('Registro Cargas:', localStorage.getItem('offline_registro_cargas'));
   console.log('Chamados OS:', localStorage.getItem('offline_chamados_os'));
   ```

4. **Forçar Sincronização Manual**:
   ```typescript
   // Aguardar até 2 minutos antes de tentar manual
   // Clicar apenas uma vez no botão "Sincronizar agora"
   // Aguardar toast de confirmação
   // Verificar se contagem diminuiu
   ```

5. **Verificar Logs de Erro**:
   ```javascript
   // Console (F12) > procurar mensagens vermelhas
   // Procurar por:
   // "Erro ao sincronizar"
   // "Permission denied"
   // "Network error"
   // "Invalid token"
   ```

#### Problema: "Sincronização falhando com erro de permissão"
**Sintomas:**
- Console mostra "Permission denied for table"
- Toast de erro: "Erro na sincronização"
- Logs mostram problema de autenticação

**Soluções:**
1. **Renovar Autenticação**:
   ```typescript
   // Fazer logout completo
   await supabase.auth.signOut();
   
   // Limpar session storage
   sessionStorage.clear();
   
   // Fazer login novamente
   // Tentar sincronização
   ```

2. **Verificar Token de Acesso**:
   ```javascript
   // No console (F12)
   supabase.auth.getSession().then(({ data }) => {
     console.log('Session válida:', !!data.session);
     console.log('Expires at:', new Date(data.session?.expires_at * 1000));
   });
   ```

3. **Verificar Políticas RLS**:
   ```sql
   -- Verificar se usuário tem acesso às tabelas
   SELECT schemaname, tablename, policyname 
   FROM pg_policies 
   WHERE tablename IN (
     'bd_apontamento_equipe',
     'bd_registro_apontamento_cam_equipa',
     'bd_registro_apontamento_aplicacao',
     'bd_registro_cargas',
     'bd_chamados_os'
   );
   ```

#### Problema: "Dados duplicados após sincronização"
**Sintomas:**
- Registros aparecem duplicados no sistema
- Múltiplas entradas para o mesmo apontamento
- IDs diferentes para dados idênticos

**Diagnóstico:**
```javascript
// Verificar se há IDs temporários duplicados
const equipeData = JSON.parse(localStorage.getItem('offline_apontamento_equipe') || '[]');
const ids = equipeData.map(item => item.id);
const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
console.log('IDs duplicados:', duplicateIds);
```

**Prevenção:**
- Sistema gera IDs únicos com uuid
- Validação antes da inserção
- Raramente ocorre devido às proteções

**Solução:**
```typescript
// Se detectar duplicatas, contatar suporte
// NÃO limpar cache manualmente
// Aguardar correção automática
```

#### Problema: "Cache offline ocupando muito espaço"
**Sintomas:**
- Navegador lento
- Erro "Quota exceeded"
- Milhares de registros pendentes
- Sistema não consegue salvar novos dados

**Diagnóstico:**
```javascript
// Verificar tamanho do localStorage
let totalSize = 0;
for (const key in localStorage) {
  if (key.startsWith('offline_')) {
    const size = localStorage.getItem(key).length;
    console.log(`${key}: ${(size / 1024).toFixed(2)} KB`);
    totalSize += size;
  }
}
console.log(`Total offline: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
```

**Soluções:**
1. **Sincronização Prioritária**:
   ```typescript
   // Conectar à internet imediatamente
   // Aguardar sincronização automática completa
   // Cache será limpo após sucesso
   ```

2. **Limpeza Seletiva** (cuidado):
   ```javascript
   // APENAS se orientado pelo suporte
   // Limpar apenas dados já sincronizados
   localStorage.removeItem('offline_apontamento_equipe');
   // NUNCA use localStorage.clear() sem orientação
   ```

#### Problema: "Indicador de conexão incorreto"
**Sintomas:**
- Mostra online mas não sincroniza
- Mostra offline mas internet funciona
- Status inconsistente

**Soluções:**
1. **Refresh do Status**:
   ```typescript
   // Recarregar página (Ctrl+F5)
   // Aguardar 30 segundos para verificação automática
   // Observar mudanças no indicador
   ```

2. **Teste Manual de Conectividade**:
   ```javascript
   // Console (F12)
   navigator.onLine // true/false - status do navegador
   
   // Teste real com Supabase
   fetch('https://zczirljepectqohlloua.supabase.co/rest/v1/', {
     headers: {
       'apikey': 'sua-api-key'
     }
   }).then(r => console.log('Real status:', r.ok));
   ```

### 🗄️ Banco de Dados

#### Problema: "Cannot read properties of null"
**Sintomas:**
- Erro ao carregar dados
- Componentes não renderizam
- Console mostra null/undefined

**Soluções:**
1. **Verificar RLS (Row Level Security)**:
   ```sql
   -- Verificar se as políticas RLS estão corretas
   SELECT schemaname, tablename, policyname, roles, cmd, qual 
   FROM pg_policies 
   WHERE tablename = 'sua_tabela';
   ```

2. **Adicionar verificações de null**:
   ```typescript
   // ❌ Problemático
   const name = user.profile.name;
   
   // ✅ Seguro
   const name = user?.profile?.name || 'Nome não informado';
   ```

3. **Usar optional chaining**:
   ```typescript
   const equipments = data?.equipments?.map(item => ({
     id: item.id,
     name: item.name || 'Sem nome'
   })) || [];
   ```

#### Problema: "Foreign key violation"
**Sintomas:**
- Erro ao salvar dados
- Violação de chave estrangeira
- "Key (campo_id)=(uuid) is not present in table"

**Soluções:**
1. **Verificar se o registro pai existe**:
   ```typescript
   // Antes de criar funcionário, verificar se empresa existe
   const { data: empresa } = await supabase
     .from('bd_empresas')
     .select('id')
     .eq('id', empresaId)
     .single();
   
   if (!empresa) {
     throw new Error('Empresa não encontrada');
   }
   ```

2. **Usar transações para inserções complexas**:
   ```typescript
   const { error } = await supabase.rpc('create_funcionario_with_validations', {
     funcionario_data: data,
     empresa_id: empresaId
   });
   ```

#### Problema: "Permission denied for table"
**Soluções:**
1. **Verificar políticas RLS**:
   ```sql
   -- Criar política para leitura
   CREATE POLICY "Users can view own company data" 
   ON bd_funcionarios FOR SELECT 
   USING (empresa_id IN (
     SELECT empresa_id 
     FROM profiles 
     WHERE id = auth.uid()
   ));
   ```

2. **Verificar se o usuário está autenticado**:
   ```typescript
   const { data: { user } } = await supabase.auth.getUser();
   if (!user) {
     throw new Error('Usuário não autenticado');
   }
   ```

### 📊 Interface e Componentes

#### Problema: "Formulário não salva"
**Sintomas:**
- Botão salvar não funciona
- Dados não são enviados
- Validações não passam

**Soluções:**
1. **Verificar validações**:
   ```typescript
   // Verificar se há erros de validação
   console.log('Form errors:', form.formState.errors);
   console.log('Form values:', form.getValues());
   console.log('Form valid:', form.formState.isValid);
   ```

2. **Verificar campos obrigatórios**:
   ```typescript
   const schema = z.object({
     nome: z.string().min(1, 'Nome é obrigatório'), // ✅
     email: z.string().email('Email inválido').optional(), // ✅
   });
   ```

3. **Verificar handler de submit**:
   ```typescript
   // ❌ Incorreto
   <form onSubmit={handleSubmit}>
   
   // ✅ Correto
   <form onSubmit={form.handleSubmit(onSubmit)}>
   ```

#### Problema: "Formulário salva offline mas não mostra indicação"
**Sintomas:**
- Dados salvos mas usuário não sabe que está offline
- Sem feedback visual sobre modo offline
- Confusão sobre status de sincronização

**Soluções:**
1. **Verificar Componente de Status**:
   ```typescript
   // Verificar se OfflineStatusIndicator está renderizando
   // Deve aparecer no canto superior direito quando offline
   // ou quando há dados pendentes
   ```

2. **Verificar Toast Messages**:
   ```typescript
   // Deve aparecer toast com uma das mensagens:
   // "Apontamento registrado" (online)
   // "Salvo offline" (offline)
   // "X registros sincronizados" (após sync)
   ```

3. **Verificar Indicadores no Formulário**:
   ```typescript
   // Modal deve mostrar:
   // - Ícone Wi-Fi no título
   // - Mensagem sobre modo offline
   // - Texto "(Offline)" no botão
   ```

#### Problema: "Imagens não carregam"
**Sintomas:**
- Fotos não aparecem
- Erro 404 nas imagens
- Upload não funciona

**Soluções:**
1. **Verificar configuração do Storage**:
   ```sql
   -- Verificar bucket existence
   SELECT name, public FROM storage.buckets;
   ```

2. **Configurar políticas do Storage**:
   ```sql
   -- Política para upload
   CREATE POLICY "Users can upload images" 
   ON storage.objects FOR INSERT 
   WITH CHECK (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);
   
   -- Política para visualização
   CREATE POLICY "Images are publicly viewable" 
   ON storage.objects FOR SELECT 
   USING (bucket_id = 'images');
   ```

3. **Verificar formato e tamanho do arquivo**:
   ```typescript
   const validateFile = (file: File) => {
     const maxSize = 5 * 1024 * 1024; // 5MB
     const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
     
     if (file.size > maxSize) {
       throw new Error('Arquivo muito grande (máximo 5MB)');
     }
     
     if (!allowedTypes.includes(file.type)) {
       throw new Error('Formato não suportado');
     }
   };
   ```

#### Problema: "Dados não atualizam em tempo real"
**Soluções:**
1. **Invalidar queries após mutations**:
   ```typescript
   const createMutation = useMutation({
     mutationFn: createFuncionario,
     onSuccess: () => {
       // Invalidar cache para atualizar lista
       queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
     },
   });
   ```

2. **Usar Supabase Realtime**:
   ```typescript
   useEffect(() => {
     const channel = supabase
       .channel('funcionarios-changes')
       .on('postgres_changes', 
         { event: '*', schema: 'public', table: 'bd_funcionarios' },
         (payload) => {
           queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
         }
       )
       .subscribe();

     return () => {
       supabase.removeChannel(channel);
     };
   }, []);
   ```

### 🚛 Módulos Específicos

#### Problema: "Cálculo de espessura incorreto"
**Sintomas:**
- Espessura muito alta ou muito baixa
- Valores negativos
- NaN nos cálculos

**Soluções:**
1. **Verificar fórmula**:
   ```typescript
   // Fórmula correta: espessura = (massa / área) / densidade * 100
   const calculateEspessura = (massa: number, area: number, densidade = 2.4) => {
     if (area <= 0) return 0;
     return (massa / area) / densidade * 100;
   };
   ```

2. **Validar inputs**:
   ```typescript
   const validateInputs = (comprimento: number, largura: number, massa: number) => {
     if (comprimento <= 0) throw new Error('Comprimento deve ser maior que 0');
     if (largura <= 0) throw new Error('Largura deve ser maior que 0');
     if (massa <= 0) throw new Error('Massa deve ser maior que 0');
   };
   ```

3. **Adicionar limites de validação**:
   ```typescript
   const schema = z.object({
     comprimento: z.number().min(0.1).max(1000),
     largura: z.number().min(0.1).max(50),
     massa: z.number().min(0.001).max(50),
   }).refine((data) => {
     const area = data.comprimento * data.largura;
     const espessura = (data.massa / area) / 2.4 * 100;
     return espessura >= 3 && espessura <= 15;
   }, {
     message: 'Espessura deve estar entre 3cm e 15cm',
   });
   ```

#### Problema: "Massa remanescente negativa"
**Soluções:**
1. **Adicionar validação**:
   ```typescript
   const validateMassaAplicada = (massaAplicada: number, massaRemanescente: number) => {
     if (massaAplicada > massaRemanescente) {
       throw new Error(`Massa aplicada (${massaAplicada}t) excede massa remanescente (${massaRemanescente}t)`);
     }
   };
   ```

2. **Usar função do banco para cálculo**:
   ```sql
   CREATE OR REPLACE FUNCTION calcular_massa_remanescente(entrega_id UUID)
   RETURNS NUMERIC AS $$
   -- Implementação da função
   $$;
   ```

#### Problema: "Veículo não aparece na lista"
**Soluções:**
1. **Verificar status do veículo**:
   ```typescript
   const { data: veiculos } = await supabase
     .from('bd_caminhoes_equipamentos')
     .select('*')
     .eq('situacao', 'Disponível') // Filtrar apenas disponíveis
     .order('placa');
   ```

2. **Verificar conflitos de programação**:
   ```typescript
   const checkVeiculoDisponivel = async (veiculoId: string, dataEntrega: string) => {
     const { data: conflitos } = await supabase
       .from('bd_lista_programacao_entrega')
       .select('id')
       .eq('caminhao_id', veiculoId)
       .eq('data_entrega', dataEntrega)
       .neq('status', 'Cancelada');
     
     return conflitos?.length === 0;
   };
   ```

### 📱 Performance e Navegador

#### Problema: "Aplicação lenta"
**Sintomas:**
- Carregamento demorado
- Interface travando
- Scroll pesado

**Soluções:**
1. **Verificar queries desnecessárias**:
   ```typescript
   // ❌ Re-fetch desnecessário
   useEffect(() => {
     fetchData();
   }, [someState]); // someState muda frequentemente
   
   // ✅ Memoizar dependencies
   const memoizedDependency = useMemo(() => someState, [someState.id]);
   useEffect(() => {
     fetchData();
   }, [memoizedDependency]);
   ```

2. **Implementar paginação**:
   ```typescript
   const usePaginatedData = (pageSize = 20) => {
     const [page, setPage] = useState(1);
     
     const { data, isLoading } = useQuery({
       queryKey: ['data', page],
       queryFn: () => fetchData(page, pageSize),
     });
     
     return { data, isLoading, page, setPage };
   };
   ```

3. **Verificar cache offline excessivo**:
   ```javascript
   // Verificar se localStorage está muito grande
   let totalSize = 0;
   for (let key in localStorage) {
     totalSize += localStorage.getItem(key).length;
   }
   console.log('LocalStorage size:', (totalSize / 1024 / 1024).toFixed(2), 'MB');
   
   // Se > 10MB, sincronizar dados pendentes urgentemente
   ```

4. **Virtualizar listas grandes**:
   ```typescript
   import { FixedSizeList as List } from 'react-window';
   
   const VirtualizedList = ({ items }) => (
     <List
       height={600}
       itemCount={items.length}
       itemSize={50}
     >
       {({ index, style }) => (
         <div style={style}>
           {items[index].name}
         </div>
       )}
     </List>
   );
   ```

#### Problema: "Memory leak" ou "Componente continua executando após unmount"
**Soluções:**
1. **Limpar subscriptions**:
   ```typescript
   useEffect(() => {
     const subscription = supabase
       .channel('changes')
       .on('postgres_changes', handler)
       .subscribe();
     
     return () => {
       supabase.removeChannel(subscription); // ✅ Cleanup
     };
   }, []);
   ```

2. **Cancelar requests pendentes**:
   ```typescript
   useEffect(() => {
     const abortController = new AbortController();
     
     const fetchData = async () => {
       try {
         const response = await fetch('/api/data', {
           signal: abortController.signal
         });
         // Process response
       } catch (error) {
         if (error.name !== 'AbortError') {
           console.error(error);
         }
       }
     };
     
     fetchData();
     
     return () => {
       abortController.abort(); // ✅ Cancel request
     };
   }, []);
   ```

### 🔧 Desenvolvimento

#### Problema: "Hot reload não funciona"
**Soluções:**
1. **Verificar configuração do Vite**:
   ```typescript
   // vite.config.ts
   export default defineConfig({
     server: {
       host: true, // Permite acesso externo
       port: 5173,
       watch: {
         usePolling: true, // Para WSL/Docker
       }
     }
   });
   ```

2. **Verificar extensões do arquivo**:
   ```bash
   # Certificar que arquivos têm extensão correta
   Component.tsx # ✅ React component
   utils.ts      # ✅ TypeScript utility
   ```

#### Problema: "Erros de TypeScript"
**Soluções:**
1. **Verificar imports**:
   ```typescript
   // ❌ Import incorreto
   import { Component } from './Component';
   
   // ✅ Import correto
   import { Component } from './Component.tsx';
   // ou
   import Component from './Component';
   ```

2. **Adicionar types quando necessário**:
   ```typescript
   // Para libraries sem types
   declare module 'library-without-types' {
     export function someFunction(): void;
   }
   ```

#### Problema: "Build falha"
**Soluções:**
1. **Verificar variáveis de ambiente**:
   ```bash
   # .env.production
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-production-key
   ```

2. **Verificar imports dinâmicos**:
   ```typescript
   // ❌ Pode falhar no build
   const module = await import(`./modules/${moduleName}`);
   
   // ✅ Imports explícitos
   const modules = {
     'module1': () => import('./modules/Module1'),
     'module2': () => import('./modules/Module2'),
   };
   const module = await modules[moduleName]();
   ```

## Ferramentas de Debug

### Console do Navegador

#### Verificar Erros JavaScript
```javascript
// Abrir DevTools (F12)
// Aba Console
// Verificar erros vermelhos
console.error('Error details:', error);
```

#### Network Tab
```javascript
// Verificar requests falhas
// Status codes diferentes de 200-299
// Requests muito lentos (>2s)
// Headers incorretos
```

#### Application Tab
```javascript
// Verificar localStorage (especialmente dados offline)
localStorage.getItem('offline_apontamento_equipe');
localStorage.getItem('offline_apontamento_caminhoes');
localStorage.getItem('offline_registro_aplicacao');
localStorage.getItem('offline_registro_cargas');
localStorage.getItem('offline_chamados_os');

// Verificar sessionStorage
sessionStorage.getItem('app-state');

// Verificar cookies
document.cookie;
```

### Supabase Dashboard

#### Logs de Autenticação
```bash
# Dashboard > Authentication > Users
# Verificar último login
# Verificar email confirmado
# Verificar metadata do usuário
```

#### SQL Editor
```sql
-- Testar queries diretamente
SELECT * FROM bd_funcionarios LIMIT 5;

-- Verificar contadores
SELECT COUNT(*) FROM bd_registro_aplicacao WHERE status = 'Ativa';

-- Verificar relacionamentos
SELECT f.nome_completo, e.nome_empresa 
FROM bd_funcionarios f 
LEFT JOIN bd_empresas e ON f.empresa_id = e.id;
```

#### Logs de API
```bash
# Dashboard > Settings > API
# Verificar logs de requests
# Identificar patterns de erro
# Verificar rate limiting
```

### React Developer Tools

#### Component Tree
```javascript
// Instalar extensão React Developer Tools
// Verificar props passadas
// Verificar state interno
// Identificar re-renders desnecessários
```

#### Profiler
```javascript
// Usar Profiler tab
// Identificar componentes lentos
// Verificar flame graphs
// Otimizar componentes pesados
```

## Scripts de Diagnóstico

### Verificação de Saúde do Sistema

```typescript
// src/utils/healthCheck.ts
export const healthCheck = async () => {
  const checks = {
    supabase: false,
    auth: false,
    database: false,
    storage: false,
    offline: false,
  };
  
  try {
    // Verificar conexão Supabase
    const { error: connectionError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    
    checks.supabase = !connectionError;
    
    // Verificar autenticação
    const { data: { session } } = await supabase.auth.getSession();
    checks.auth = !!session;
    
    // Verificar database
    const { error: dbError } = await supabase
      .from('bd_empresas')
      .select('id')
      .limit(1);
    
    checks.database = !dbError;
    
    // Verificar storage
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
    checks.storage = !storageError && buckets.length > 0;
    
    // Verificar cache offline
    let offlineSize = 0;
    for (const key in localStorage) {
      if (key.startsWith('offline_')) {
        offlineSize += localStorage.getItem(key).length;
      }
    }
    checks.offline = offlineSize < 10 * 1024 * 1024; // < 10MB OK
    
  } catch (error) {
    console.error('Health check failed:', error);
  }
  
  return checks;
};

// Uso
const runHealthCheck = async () => {
  const health = await healthCheck();
  console.log('System Health:', health);
  
  Object.entries(health).forEach(([service, status]) => {
    console.log(`${service}: ${status ? '✅' : '❌'}`);
  });
};
```

### Verificação de Cache Offline **NOVO**

```typescript
// src/utils/offlineHealthCheck.ts
export const offlineHealthCheck = () => {
  const checks = {
    totalSize: 0,
    itemCount: 0,
    oldestItem: null,
    newestItem: null,
    byType: {},
  };
  
  const offlineTypes = [
    'offline_apontamento_equipe',
    'offline_apontamento_caminhoes', 
    'offline_registro_aplicacao',
    'offline_registro_cargas',
    'offline_chamados_os',
    'offline_ordens_servico'
  ];
  
  offlineTypes.forEach(type => {
    const data = localStorage.getItem(type);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        const size = data.length;
        const count = parsed.length;
        
        checks.totalSize += size;
        checks.itemCount += count;
        checks.byType[type] = { size, count, items: parsed };
        
        // Encontrar mais antigo e mais novo
        parsed.forEach(item => {
          const timestamp = new Date(item.timestamp);
          if (!checks.oldestItem || timestamp < new Date(checks.oldestItem.timestamp)) {
            checks.oldestItem = item;
          }
          if (!checks.newestItem || timestamp > new Date(checks.newestItem.timestamp)) {
            checks.newestItem = item;
          }
        });
      } catch (error) {
        console.error(`Erro ao analisar ${type}:`, error);
      }
    }
  });
  
  return checks;
};

// Relatório detalhado
const generateOfflineReport = () => {
  const health = offlineHealthCheck();
  
  console.log('📊 RELATÓRIO DE CACHE OFFLINE:');
  console.log(`Total de registros: ${health.itemCount}`);
  console.log(`Tamanho total: ${(health.totalSize / 1024 / 1024).toFixed(2)} MB`);
  
  if (health.oldestItem) {
    console.log(`Mais antigo: ${health.oldestItem.timestamp}`);
  }
  if (health.newestItem) {
    console.log(`Mais recente: ${health.newestItem.timestamp}`);
  }
  
  console.log('\n📋 Por tipo:');
  Object.entries(health.byType).forEach(([type, info]) => {
    console.log(`${type}: ${info.count} registros (${(info.size / 1024).toFixed(2)} KB)`);
  });
  
  // Alertas
  if (health.totalSize > 5 * 1024 * 1024) {
    console.warn('⚠️ Cache offline muito grande (>5MB)');
  }
  
  if (health.itemCount > 1000) {
    console.warn('⚠️ Muitos registros pendentes (>1000)');
  }
  
  if (health.oldestItem) {
    const ageHours = (Date.now() - new Date(health.oldestItem.timestamp)) / (1000 * 60 * 60);
    if (ageHours > 24) {
      console.warn(`⚠️ Registros antigos pendentes (${ageHours.toFixed(1)}h)`);
    }
  }
  
  return health;
};
```

### Verificação de Performance

```typescript
// src/utils/performanceCheck.ts
export const performanceCheck = () => {
  // Timing de carregamento
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  const metrics = {
    loadTime: navigation.loadEventEnd - navigation.loadEventStart,
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    ttfb: navigation.responseStart - navigation.requestStart, // Time to First Byte
    networkTime: navigation.responseEnd - navigation.requestStart,
  };
  
  console.log('Performance Metrics:', metrics);
  
  // Alertas para métricas ruins
  if (metrics.loadTime > 3000) {
    console.warn('⚠️ Load time muito alto:', metrics.loadTime + 'ms');
  }
  
  if (metrics.ttfb > 500) {
    console.warn('⚠️ TTFB muito alto:', metrics.ttfb + 'ms');
  }
  
  return metrics;
};
```

## FAQ - Perguntas Frequentes

### "Por que meus dados não aparecem?"
1. Verificar se há políticas RLS bloqueando
2. Verificar se o usuário está autenticado
3. Verificar se há dados na tabela
4. Verificar filtros aplicados

### "Como resetar o sistema?"
```typescript
// Limpar cache do React Query
queryClient.clear();

// Limpar localStorage (CUIDADO: remove dados offline)
localStorage.clear();

// Fazer logout
await supabase.auth.signOut();

// Recarregar página
window.location.reload();
```

### "Como funciona o modo offline?" **NOVO**
- **Detecção automática**: Sistema monitora conexão constantemente
- **Salvamento local**: Dados ficam no localStorage do navegador
- **Sincronização automática**: Quando conexão volta, dados são enviados
- **Feedback visual**: Indicadores e toasts informam status
- **Zero perda**: Impossível perder dados, mesmo fechando navegador

### "Posso trabalhar totalmente offline?" **NOVO**
- **✅ SIM**: Apontamentos, registros, chamados
- **❌ NÃO**: Consultas que precisam buscar novos dados
- **⚠️ LIMITADO**: Apenas dados já carregados na sessão
- **💡 DICA**: Carregue dados importantes antes de ficar offline

### "Como saber se dados foram sincronizados?" **NOVO**
```typescript
// Indicadores visuais:
// 1. Contagem de pendentes no canto superior direito
// 2. Toast "X registros sincronizados com sucesso"
// 3. Contagem zera quando tudo sincronizado

// Verificação manual:
console.log('Dados pendentes:', localStorage.getItem('offline_apontamento_equipe'));
// Se retornar null ou [], não há dados pendentes
```

### "Como reportar um bug?"
1. **Reproduzir o problema** consistentemente
2. **Coletar informações**:
   - URL onde ocorreu
   - Ações que levaram ao erro
   - Mensagem de erro exata
   - Screenshots/videos
   - Console logs (F12 → Console)
   - **NOVO**: Status de conexão no momento do erro
   - **NOVO**: Dados offline pendentes (se aplicável)
3. **Informações do ambiente**:
   - Navegador e versão
   - Sistema operacional
   - Tamanho da tela
   - **NOVO**: Status de conectividade (WiFi/4G/etc)
4. **Enviar para suporte** com todas as informações

### "Como fazer backup dos dados?"
```typescript
// Exportar dados importantes
const exportData = async () => {
  const { data: funcionarios } = await supabase
    .from('bd_funcionarios')
    .select('*');
  
  const { data: veiculos } = await supabase
    .from('bd_caminhoes_equipamentos')
    .select('*');
  
  // NOVO: Incluir dados offline pendentes
  const offlineData = {};
  const offlineTypes = ['offline_apontamento_equipe', 'offline_apontamento_caminhoes'];
  offlineTypes.forEach(type => {
    const data = localStorage.getItem(type);
    if (data) offlineData[type] = JSON.parse(data);
  });
  
  const backup = {
    timestamp: new Date().toISOString(),
    funcionarios,
    veiculos,
    offlineData, // NOVO
  };
  
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json'
  });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup-${Date.now()}.json`;
  a.click();
};
```

## Contato para Suporte

### Informações para Incluir
Ao entrar em contato com o suporte, sempre inclua:

1. **URL completa** onde o problema ocorre
2. **Usuário logado** (email)
3. **Navegador e versão** (Chrome 120, Firefox 115, etc.)
4. **Sistema operacional** (Windows 11, macOS 14, Ubuntu 22.04)
5. **Passos detalhados** para reproduzir o problema
6. **Screenshots** ou vídeos do problema
7. **Console logs** (F12 → Console → screenshot dos erros)
8. **Horário aproximado** quando o problema ocorreu
9. **Status de conexão** no momento do erro ⭐ **NOVO**
10. **Dados offline pendentes** (se aplicável) ⭐ **NOVO**

### Template para Reportar Problemas Offline ⭐ **NOVO**

```
**Descrição do Problema:**
[Descreva o que está acontecendo com sincronização/offline]

**Status de Conexão:**
- Indicador mostrava: [🟢 Online / 🟡 Conectando / 🔴 Offline]
- Internet funcionando: [Sim/Não - outros sites carregam?]
- Supabase funcionando: [Verificar em outros módulos]

**Dados Offline:**
- Registros pendentes: [Número mostrado no indicador]
- Tipos de dados: [Equipe/Caminhões/Aplicação/etc]
- Há quanto tempo pendentes: [Última sincronização]

**Console Logs:**
[F12 > Console > procurar mensagens sobre sincronização]

**Ações Realizadas:**
1. [Descreva tentativas de sincronização]
2. [Botão "Sincronizar agora" funcionou?]
3. [Logout/login resolveu?]

**Ambiente:**
- URL: https://sistema.exemplo.com
- Usuário: usuario@empresa.com
- Navegador: Chrome 120.0.6099.71
- SO: Windows 11
- Rede: WiFi/4G/Cabo
- Timestamp: 2024-01-15 14:30:00

**Screenshots/Logs:**
[Anexar imagens do indicador de status e logs do console]
```

### Template para Reportar Problemas Gerais

```
**Descrição do Problema:**
[Descreva o que está acontecendo]

**Passos para Reproduzir:**
1. Vá para...
2. Clique em...
3. Preencha...
4. Observe que...

**Comportamento Esperado:**
[O que deveria acontecer]

**Comportamento Atual:**
[O que realmente acontece]

**Ambiente:**
- URL: https://sistema.exemplo.com
- Usuário: usuario@empresa.com
- Navegador: Chrome 120.0.6099.71
- SO: Windows 11
- Timestamp: 2024-01-15 14:30:00

**Screenshots/Logs:**
[Anexar imagens e logs do console]
```

---

**Este guia de troubleshooting foi atualizado com informações completas sobre o novo modo offline e sincronização automática.**

**Versão**: 3.0  
**Última Atualização**: Janeiro 2025  
**Novidades**: Troubleshooting completo para modo offline e sincronização

