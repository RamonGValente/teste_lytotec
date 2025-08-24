# Documentação de Segurança 🔐

## Visão Geral

O Sistema de Gestão Integrada implementa múltiplas camadas de segurança, incluindo autenticação robusta, Row Level Security (RLS), controle granular de permissões e auditoria completa.

## Índice

1. [Arquitetura de Segurança](#arquitetura-de-segurança)
2. [Autenticação](#autenticação)
3. [Row Level Security (RLS)](#row-level-security-rls)
4. [Sistema de Permissões](#sistema-de-permissões)
5. [Auditoria e Logs](#auditoria-e-logs)
6. [Proteção de Dados](#proteção-de-dados)
7. [Segurança de Rede](#segurança-de-rede)
8. [Compliance](#compliance)

## Arquitetura de Segurança

### Camadas de Proteção

#### 1. **Network Layer** (Rede)
```
Internet → Cloudflare WAF → Load Balancer → Application
         ↓
    DDoS Protection, SSL/TLS, Rate Limiting
```

#### 2. **Application Layer** (Aplicação)
```
Frontend → Authentication → Authorization → Business Logic
         ↓
    JWT Tokens, Role-based Access, Input Validation
```

#### 3. **Database Layer** (Banco)
```
API Calls → Supabase → PostgreSQL → Row Level Security
          ↓
    Connection Pooling, Query Validation, Data Encryption
```

#### 4. **Audit Layer** (Auditoria)
```
All Operations → Logging → Monitoring → Alerting
               ↓
    Activity Logs, Error Tracking, Security Events
```

### Princípios de Segurança

#### Defense in Depth
- **Múltiplas camadas** de proteção
- **Fail-safe defaults**: Negação por padrão
- **Least privilege**: Acesso mínimo necessário
- **Zero trust**: Verificação contínua

#### Secure by Design
- **Security-first**: Segurança desde o design
- **Input validation**: Validação em todas as entradas
- **Output encoding**: Codificação de saídas
- **Error handling**: Tratamento seguro de erros

## Autenticação

### Sistema de Autenticação Supabase

#### Fluxo de Login
```typescript
// 1. Credenciais do usuário
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'usuario@empresa.com',
  password: 'senha_segura'
});

// 2. Verificação de email (se necessário)
if (!data.user?.email_confirmed_at) {
  // Reenviar confirmação
  await supabase.auth.resend({
    type: 'signup',
    email: 'usuario@empresa.com'
  });
}

// 3. Criação de perfil (trigger automático)
// Trigger: on_auth_user_created
```

#### JWT Token Structure
```javascript
{
  "aud": "authenticated",
  "exp": 1625097600,
  "sub": "user-uuid",
  "email": "usuario@empresa.com",
  "role": "authenticated",
  "aal": "aal1",
  "amr": [{"method": "password", "timestamp": 1625094000}]
}
```

### Políticas de Senha

#### Requisitos Mínimos
- **Comprimento**: Mínimo 8 caracteres
- **Complexidade**: Letras, números e símbolos
- **Histórico**: Não reutilizar últimas 5 senhas
- **Expiração**: 90 dias (configurável)

#### Validação Frontend
```typescript
// src/validations/passwordSchema.ts
export const passwordSchema = z.string()
  .min(8, "Senha deve ter pelo menos 8 caracteres")
  .regex(/[A-Z]/, "Deve conter pelo menos uma letra maiúscula")
  .regex(/[a-z]/, "Deve conter pelo menos uma letra minúscula")
  .regex(/[0-9]/, "Deve conter pelo menos um número")
  .regex(/[^A-Za-z0-9]/, "Deve conter pelo menos um símbolo");
```

### Multi-Factor Authentication (MFA)

#### Implementação Futura
```typescript
// Preparação para MFA
interface MFAConfig {
  enabled: boolean;
  methods: ('totp' | 'sms' | 'email')[];
  required_for_roles: string[];
  backup_codes: boolean;
}
```

## Row Level Security (RLS)

### Políticas por Tabela

#### bd_funcionarios
```sql
-- SuperAdmin: Acesso total
CREATE POLICY "SuperAdmin full access to employees" 
ON bd_funcionarios FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND 'SuperAdm' = ANY(funcoes)
  )
);

-- AdmRH: Acesso a todos os funcionários
CREATE POLICY "AdmRH can access all employees" 
ON bd_funcionarios FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND ('AdmRH' = ANY(funcoes) OR 'Administrador' = ANY(funcoes))
  )
);

-- Usuários: Apenas próprio registro
CREATE POLICY "Users can view own record" 
ON bd_funcionarios FOR SELECT 
USING (
  email = (
    SELECT email FROM profiles 
    WHERE id = auth.uid()
  )
);
```

#### bd_equipes
```sql
-- Time leaders: Suas equipes
CREATE POLICY "Team leaders can access their teams" 
ON bd_equipes FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM bd_funcionarios f
    INNER JOIN profiles p ON f.email = p.email
    WHERE p.id = auth.uid()
    AND (
      bd_equipes.apontador_id = f.id OR 
      bd_equipes.encarregado_id = f.id
    )
    AND ('Apontador' = ANY(p.funcoes) OR 'Encarregado' = ANY(p.funcoes))
  )
);

-- Membros: Visualizar sua equipe
CREATE POLICY "Team members can view their teams" 
ON bd_equipes FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM bd_funcionarios f
    INNER JOIN profiles p ON f.email = p.email
    WHERE p.id = auth.uid()
    AND f.equipe_id = bd_equipes.id
    AND 'Operador' = ANY(p.funcoes)
  )
);
```

#### bd_apontamento_equipe
```sql
-- Baseado nas equipes acessíveis
CREATE POLICY "Team appointments access" 
ON bd_apontamento_equipe FOR ALL 
USING (
  equipe_id IN (
    SELECT DISTINCT e.id
    FROM bd_equipes e
    JOIN bd_funcionarios f ON (e.apontador_id = f.id OR e.encarregado_id = f.id)
    JOIN profiles p ON f.email = p.email
    WHERE p.id = auth.uid()
    AND ('Apontador' = ANY(p.funcoes) OR 'Encarregado' = ANY(p.funcoes))
  )
  OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND ('SuperAdm' = ANY(funcoes) OR 'AdmRH' = ANY(funcoes))
  )
);
```

### Funções de Segurança

#### Verificação de Roles
```sql
-- Função para verificar SuperAdmin
CREATE OR REPLACE FUNCTION check_is_super_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND 'SuperAdm' = ANY(funcoes)
  );
$$;

-- Função para obter role atual
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
    user_functions text[];
BEGIN
    IF check_is_super_admin(auth.uid()) THEN
        RETURN 'SuperAdm';
    END IF;
    
    SELECT funcoes INTO user_functions
    FROM profiles 
    WHERE id = auth.uid();
    
    -- Hierarquia de roles
    IF 'AdmRH' = ANY(user_functions) THEN
        RETURN 'AdmRH';
    ELSIF 'Administrador' = ANY(user_functions) THEN
        RETURN 'Administrador';
    ELSIF 'Apontador' = ANY(user_functions) THEN
        RETURN 'Apontador';
    ELSIF 'Encarregado' = ANY(user_functions) THEN
        RETURN 'Encarregado';
    ELSE
        RETURN 'user';
    END IF;
END;
$$;
```

## Sistema de Permissões

### Hierarquia de Roles

#### Definição de Roles
```typescript
// src/types/permissions.ts
export enum UserRole {
  SUPER_ADMIN = 'SuperAdm',
  ADMIN_RH = 'AdmRH',
  ADMIN_EQUIPAMENTOS = 'AdmEquipamentos',
  ADMIN_LOGISTICA = 'AdmLogistica',
  ADMIN_REQUISICOES = 'AdmRequisicoes',
  ADMINISTRATOR = 'Administrador',
  APONTADOR = 'Apontador',
  ENCARREGADO = 'Encarregado',
  ENGENHEIRO = 'Engenheiro Civil',
  OPERADOR = 'Operador',
  USER = 'user'
}
```

#### Mapeamento de Permissões
```typescript
// src/hooks/useAuthPermissions.ts
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.SUPER_ADMIN]: [
    'dashboard_view',
    'dashboard_rh_view',
    'dashboard_maquinas_view',
    'dashboard_cbuq_view',
    'gestao_rh_empresas_view',
    'gestao_rh_departamentos_view',
    'gestao_rh_centros_custo_view',
    'gestao_rh_funcoes_view',
    'gestao_rh_funcionarios_view',
    'gestao_rh_equipes_view',
    'gestao_maquinas_caminhoes_view',
    'gestao_maquinas_usinas_view',
    'gestao_maquinas_relatorio_medicao_view',
    'requisicoes_cadastro_view',
    'requisicoes_programacao_entrega_view',
    'requisicoes_registro_cargas_view',
    'requisicoes_registro_aplicacao_view',
    'requisicoes_apontamento_equipe_view',
    'requisicoes_apontamento_caminhoes_view',
    'requisicoes_chamados_os_view',
    'requisicoes_gestao_os_view',
    'admin_permissoes_view'
  ],
  
  [UserRole.APONTADOR]: [
    'dashboard_view',
    'registro_aplicacao_view',
    'programacao_entrega_view'
  ],
  
  [UserRole.ENCARREGADO]: [
    'dashboard_view',
    'registro_aplicacao_view',
    'requisicoes_apontamento_equipe_view',
    'programacao_entrega_view',
    'requisicoes_registro_aplicacao_view',
    'requisicoes_apontamento_caminhoes_view'
  ]
  // ... outros roles
};
```

### Guards de Rota

#### Proteção de Páginas
```typescript
// src/components/routing/RouteProtection.tsx
interface RouteProtectionProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredPermissions?: string[];
  requireAny?: boolean;
}

export const RouteProtection: React.FC<RouteProtectionProps> = ({
  children,
  requiredPermission,
  requiredPermissions = [],
  requireAny = true
}) => {
  const { canAccess, isLoading } = usePermissionGuard({
    requiredPermission,
    requiredPermissions,
    requireAny
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!canAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
```

#### Hook de Permissões
```typescript
// src/hooks/usePermissionGuard.ts
export const usePermissionGuard = (config: PermissionConfig) => {
  const { isSuperAdmin, permissions, isLoading } = useAuthPermissions();
  
  const canAccess = useMemo(() => {
    if (isLoading) return false;
    if (isSuperAdmin) return true;
    
    if (config.requiredPermission) {
      return permissions.includes(config.requiredPermission);
    }
    
    if (config.requiredPermissions?.length) {
      return config.requireAny
        ? config.requiredPermissions.some(p => permissions.includes(p))
        : config.requiredPermissions.every(p => permissions.includes(p));
    }
    
    return true;
  }, [isSuperAdmin, permissions, isLoading, config]);
  
  return { canAccess, isLoading };
};
```

## Auditoria e Logs

### Logging de Atividades

#### Estrutura de Logs
```typescript
// src/types/audit.ts
interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource: string;
  resource_id?: string;
  details: Record<string, any>;
  ip_address: string;
  user_agent: string;
  timestamp: string;
  success: boolean;
  error_message?: string;
}
```

#### Implementação de Auditoria
```typescript
// src/services/auditService.ts
export class AuditService {
  static async log(activity: Omit<AuditLog, 'id' | 'timestamp'>) {
    try {
      await supabase.from('audit_logs').insert({
        ...activity,
        timestamp: new Date().toISOString(),
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent
      });
    } catch (error) {
      console.error('Audit log failed:', error);
      // Não falhar operação principal por erro de auditoria
    }
  }
  
  static async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }
}
```

#### Eventos Auditados
```typescript
// Exemplos de uso
AuditService.log({
  user_id: user.id,
  action: 'CREATE',
  resource: 'funcionario',
  resource_id: newFuncionario.id,
  details: { nome: newFuncionario.nome_completo },
  success: true
});

AuditService.log({
  user_id: user.id,
  action: 'LOGIN',
  resource: 'auth',
  details: { method: 'password' },
  success: true
});

AuditService.log({
  user_id: user.id,
  action: 'DELETE',
  resource: 'apontamento',
  resource_id: apontamento.id,
  details: { data: apontamento.data_registro },
  success: false,
  error_message: 'Insufficient permissions'
});
```

### Monitoramento de Segurança

#### Detecção de Anomalias
```sql
-- Query para detectar múltiplos logins falhados
SELECT 
  user_id,
  COUNT(*) as failed_attempts,
  MAX(timestamp) as last_attempt
FROM audit_logs 
WHERE action = 'LOGIN' 
  AND success = false 
  AND timestamp > NOW() - INTERVAL '1 hour'
GROUP BY user_id 
HAVING COUNT(*) >= 5;

-- Query para detectar atividade fora do horário
SELECT 
  user_id,
  action,
  timestamp,
  ip_address
FROM audit_logs 
WHERE EXTRACT(HOUR FROM timestamp) NOT BETWEEN 6 AND 22
  AND timestamp > NOW() - INTERVAL '24 hours';
```

## Proteção de Dados

### Criptografia

#### Em Trânsito
- **TLS 1.3**: Todas as comunicações HTTPS
- **Certificate Pinning**: Prevenção MITM
- **HSTS**: Forçar HTTPS no navegador

#### Em Repouso
- **Database Encryption**: PostgreSQL com encryption at rest
- **File Storage**: Supabase Storage com criptografia
- **Backup Encryption**: Backups automaticamente criptografados

### Sanitização de Dados

#### Input Validation
```typescript
// src/validations/sanitization.ts
import DOMPurify from 'dompurify';

export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
};

export const sanitizeSQL = (query: string): string => {
  // Supabase automaticamente previne SQL injection
  // Mas validamos entrada mesmo assim
  return query.replace(/[';\\]/g, '');
};
```

#### Output Encoding
```typescript
// src/utils/encoding.ts
export const escapeHTML = (str: string): string => {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

export const escapeCSV = (str: string): string => {
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};
```

### Proteção de PII

#### Dados Pessoais Identificáveis
```typescript
// src/types/privacy.ts
interface PIIField {
  field: string;
  type: 'cpf' | 'email' | 'phone' | 'address';
  maskPattern?: string;
  requiredRole?: UserRole[];
}

const PII_FIELDS: PIIField[] = [
  { field: 'cpf', type: 'cpf', maskPattern: '***.***.***-**' },
  { field: 'email', type: 'email', maskPattern: '***@***.***' },
  { field: 'endereco_completo', type: 'address', requiredRole: ['SuperAdm', 'AdmRH'] }
];
```

#### Mascaramento de Dados
```typescript
// src/utils/privacy.ts
export const maskCPF = (cpf: string): string => {
  if (!cpf) return '';
  return cpf.replace(/(\d{3})\d{3}(\d{3})\d{2}/, '$1.***.***-**');
};

export const maskEmail = (email: string): string => {
  if (!email) return '';
  const [user, domain] = email.split('@');
  const maskedUser = user.charAt(0) + '*'.repeat(user.length - 1);
  return `${maskedUser}@${domain}`;
};
```

## Segurança de Rede

### Headers de Segurança

#### Configuração Nginx/Vercel
```nginx
# Security Headers
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://zczirljepe.supabase.co; font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com" always;
add_header Permissions-Policy "geolocation=(self), microphone=(), camera=()" always;
```

### CORS Configuration

#### Supabase Settings
```json
{
  "cors": {
    "allowed_origins": [
      "https://seu-dominio.com",
      "https://www.seu-dominio.com",
      "https://staging.seu-dominio.com"
    ],
    "allowed_methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allowed_headers": [
      "authorization", 
      "x-client-info", 
      "apikey", 
      "content-type"
    ],
    "exposed_headers": ["x-total-count"],
    "max_age": 3600,
    "allow_credentials": true
  }
}
```

### Rate Limiting

#### API Protection
```typescript
// Implementação futura com Supabase Edge Functions
export const rateLimiter = {
  requests_per_minute: 60,
  requests_per_hour: 1000,
  burst_size: 10,
  whitelist: ['admin@empresa.com'],
  blacklist: []
};
```

## Compliance

### LGPD (Lei Geral de Proteção de Dados)

#### Princípios Implementados
- **Consentimento**: Usuário autoriza coleta de dados
- **Finalidade**: Dados usados apenas para fins declarados
- **Necessidade**: Coletamos apenas dados necessários
- **Livre acesso**: Usuário pode consultar seus dados
- **Qualidade**: Dados mantidos atualizados e corretos
- **Transparência**: Usuário sabe quais dados temos
- **Segurança**: Proteção adequada dos dados
- **Prevenção**: Medidas para evitar vazamentos
- **Responsabilização**: Demonstramos conformidade

#### Direitos do Titular
```typescript
// src/services/lgpdService.ts
export class LGPDService {
  // Direito de acesso
  static async getUserData(userId: string) {
    const userData = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    return userData;
  }
  
  // Direito de retificação
  static async updateUserData(userId: string, updates: any) {
    return await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
  }
  
  // Direito de exclusão
  static async deleteUserData(userId: string) {
    // Anonimizar ao invés de deletar (para manter integridade)
    return await supabase
      .from('profiles')
      .update({
        nome_completo: 'Usuário Removido',
        email: null,
        imagem_url: null,
        deleted_at: new Date().toISOString()
      })
      .eq('id', userId);
  }
  
  // Direito de portabilidade
  static async exportUserData(userId: string) {
    // Exportar todos os dados do usuário em formato JSON
    const userData = await this.getUserData(userId);
    return JSON.stringify(userData, null, 2);
  }
}
```

### Políticas de Retenção

#### Retenção de Dados
```sql
-- Dados operacionais: 7 anos
-- Logs de auditoria: 5 anos
-- Dados pessoais: Até solicitação de exclusão

-- Procedure para limpeza automática
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Remover logs antigos (> 5 anos)
  DELETE FROM audit_logs 
  WHERE timestamp < NOW() - INTERVAL '5 years';
  
  -- Anonimizar dados de usuários deletados (> 1 ano)
  UPDATE profiles 
  SET 
    nome_completo = 'Dados Removidos',
    email = NULL,
    imagem_url = NULL
  WHERE deleted_at IS NOT NULL 
    AND deleted_at < NOW() - INTERVAL '1 year';
END;
$$;
```

## Incident Response

### Plano de Resposta

#### Classificação de Incidentes
1. **Baixo**: Tentativa de acesso não autorizado
2. **Médio**: Vazamento de dados não sensíveis
3. **Alto**: Vazamento de dados pessoais
4. **Crítico**: Comprometimento de sistema

#### Procedimentos
```typescript
// src/services/incidentResponse.ts
export class IncidentResponse {
  static async reportIncident(incident: SecurityIncident) {
    // 1. Log do incidente
    await this.logIncident(incident);
    
    // 2. Notificar equipe de segurança
    await this.notifySecurityTeam(incident);
    
    // 3. Aplicar contenção se necessário
    if (incident.severity >= IncidentSeverity.HIGH) {
      await this.applyContainment(incident);
    }
    
    // 4. Iniciar investigação
    await this.initiateInvestigation(incident);
  }
  
  private static async applyContainment(incident: SecurityIncident) {
    switch (incident.type) {
      case 'unauthorized_access':
        // Revogar tokens do usuário
        await this.revokeUserTokens(incident.user_id);
        break;
      case 'data_breach':
        // Alertar usuários afetados
        await this.notifyAffectedUsers(incident.affected_users);
        break;
      case 'system_compromise':
        // Isolamento de sistema
        await this.isolateSystem(incident.system_id);
        break;
    }
  }
}
```

### Comunicação de Incidentes

#### Template de Notificação
```typescript
interface IncidentNotification {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  description: string;
  affected_systems: string[];
  affected_users: number;
  containment_measures: string[];
  estimated_resolution: string;
  communication_plan: string[];
}
```

## Testes de Segurança

### Testes Automatizados

#### Security Linting
```bash
# ESLint security rules
npm install eslint-plugin-security

# Configuração .eslintrc
{
  "plugins": ["security"],
  "extends": ["plugin:security/recommended"],
  "rules": {
    "security/detect-object-injection": "error",
    "security/detect-non-literal-regexp": "error",
    "security/detect-unsafe-regex": "error"
  }
}
```

#### Dependency Scanning
```bash
# npm audit
npm audit --audit-level high

# Snyk
npm install -g snyk
snyk test
snyk monitor
```

### Penetration Testing

#### Checklist de Testes
- [ ] **Authentication**: Bypass, brute force, session management
- [ ] **Authorization**: Privilege escalation, access controls
- [ ] **Input Validation**: SQL injection, XSS, CSRF
- [ ] **Session Management**: Fixation, hijacking
- [ ] **Encryption**: Data in transit and rest
- [ ] **Error Handling**: Information disclosure
- [ ] **Business Logic**: Workflow bypasses

#### Ferramentas de Teste
- **OWASP ZAP**: Web application scanner
- **Burp Suite**: Professional penetration testing
- **Nmap**: Network discovery and security auditing
- **SQLMap**: SQL injection testing
- **Lighthouse**: Security audit

## Security Monitoring

### SIEM Integration

#### Log Aggregation
```typescript
// src/services/siemService.ts
export class SIEMService {
  static async sendSecurityEvent(event: SecurityEvent) {
    const payload = {
      timestamp: new Date().toISOString(),
      source: 'sistema-gestao',
      severity: event.severity,
      category: event.category,
      description: event.description,
      user_id: event.user_id,
      ip_address: event.ip_address,
      user_agent: event.user_agent,
      additional_data: event.metadata
    };
    
    // Enviar para SIEM externo (ex: Splunk, ELK)
    await fetch('https://siem-endpoint.com/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }
}
```

### Alertas de Segurança

#### Configuração de Alertas
```typescript
const SECURITY_ALERTS = {
  failed_logins: {
    threshold: 5,
    window: '1 hour',
    action: 'lock_account'
  },
  privilege_escalation: {
    threshold: 1,
    window: 'immediate',
    action: 'notify_admin'
  },
  data_export: {
    threshold: 100,
    window: '1 hour',
    action: 'review_required'
  }
};
```

## Training e Conscientização

### Treinamento de Segurança

#### Tópicos Obrigatórios
- **LGPD**: Princípios e direitos dos titulares
- **Phishing**: Identificação e prevenção
- **Senhas**: Políticas e boas práticas
- **Engenharia Social**: Técnicas e defesas
- **Incidentes**: Como reportar e responder

#### Avaliação Periódica
```typescript
interface SecurityTraining {
  user_id: string;
  course: string;
  completion_date: string;
  score: number;
  valid_until: string;
  certificates: string[];
}
```

### Comunicação de Segurança

#### Canal de Comunicação
- **Email**: security@empresa.com
- **Slack**: #security-alerts
- **Dashboard**: Painel de status de segurança
- **Reuniões**: Security briefings mensais

---

*Esta documentação é atualizada regularmente conforme novas ameaças são identificadas e novos controles são implementados.*