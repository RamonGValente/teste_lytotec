# Guia PWA - Progressive Web App 📱

## Visão Geral

O Sistema de Gestão Integrada é uma **Progressive Web App (PWA)** completa que oferece experiência nativa em qualquer dispositivo, com funcionalidades offline, instalação como aplicativo e notificações.

## Índice

1. [O que é PWA](#o-que-é-pwa)
2. [Instalação do App](#instalação-do-app)
3. [Funcionalidades Offline](#funcionalidades-offline)
4. [Atualizações Automáticas](#atualizações-automáticas)
5. [Performance](#performance)
6. [Compatibilidade](#compatibilidade)

## O que é PWA

### Definição
Uma Progressive Web App combina o melhor das aplicações web e mobile, oferecendo:

- **Instalação**: Como um app nativo no dispositivo
- **Offline**: Funciona sem internet
- **Performance**: Carregamento instantâneo
- **Atualização**: Automática em segundo plano
- **Segurança**: HTTPS obrigatório

### Vantagens do LYTOTEC PWA

#### ✅ Para o Usuário
- **Acesso rápido**: Ícone na tela inicial
- **Funciona offline**: Continue trabalhando sem internet
- **Menor uso de dados**: Cache inteligente
- **Interface nativa**: Sem barra de navegador
- **Notificações**: Alertas importantes

#### ✅ Para a Empresa
- **Sem app store**: Instalação direta via navegador
- **Atualizações instantâneas**: Sem aguardar aprovação
- **Multiplataforma**: Funciona em qualquer dispositivo
- **Menor custo**: Uma versão para todos os dispositivos

## Instalação do App

### Android (Chrome)

#### 1. Via Navegador
```
1. 📱 Abra o sistema no Chrome
2. 🔔 Apareçerá banner "Instalar App"
3. ✅ Clique em "Instalar" ou "Adicionar"
4. 📲 App será instalado na tela inicial
```

#### 2. Via Menu Chrome
```
1. 📱 Abra o sistema no Chrome
2. ⋮ Toque no menu (3 pontos)
3. 📲 "Instalar app" ou "Adicionar à tela inicial"
4. ✅ Confirme a instalação
```

### iOS (Safari)

#### Via Safari
```
1. 📱 Abra o sistema no Safari
2. 📤 Toque no ícone de compartilhar
3. 📲 "Adicionar à Tela de Início"
4. ✅ Confirme o nome e toque "Adicionar"
```

### Desktop (Chrome/Edge)

#### Via Barra de Endereços
```
1. 💻 Abra o sistema no navegador
2. 📲 Clique no ícone de instalação (➕)
3. ✅ Confirme "Instalar"
4. 🖥️ App aparecerá na lista de programas
```

### Verificação da Instalação

#### Como Saber se Está Instalado
- **Mobile**: Ícone na tela inicial sem barra de navegador
- **Desktop**: Aplicativo na lista de programas
- **Interface**: Sem elementos do navegador (barra de endereços)

## Funcionalidades Offline

### Módulos Disponíveis Offline

#### ✅ Totalmente Offline
- **Apontamento de Equipes**: Presença e horários
- **Apontamento de Caminhões**: Controle operacional
- **Registro de Aplicação**: Dados de aplicação de asfalto
- **Registro de Cargas**: Pesagem e controle
- **Chamados de OS**: Abertura de ordens de serviço
- **Consultas**: Dados já carregados

#### 🔄 Sincronização Automática
- **Detecção**: Sistema detecta quando internet volta
- **Envio**: Dados salvos localmente são enviados automaticamente
- **Validação**: Confirmação de sucesso para cada registro
- **Limpeza**: Dados sincronizados são removidos do cache

### Indicadores de Status

#### 1. **Indicador Principal** (Canto Superior)
```
🟢 Online   → Internet OK + Base conectada
🟡 Limitado → Internet OK + Base com problema  
🔴 Offline  → Sem internet - Modo offline ativo
```

#### 2. **Feedback nos Formulários**
- **Ícone Wi-Fi**: No título do modal
- **Mensagem**: "Trabalhando offline"
- **Botão**: "Salvar Offline" ao invés de "Salvar"

#### 3. **Notificações do Sistema**
- **"Salvo offline"**: Dados armazenados localmente
- **"Sincronizando..."**: Enviando para servidor
- **"X registros sincronizados"**: Sucesso na sincronização

### Armazenamento Local

#### Capacidade
- **localStorage**: 5-10MB por domínio
- **Registros**: ~1000-5000 registros simultaneamente
- **Limpeza**: Automática após sincronização

#### Estrutura dos Dados
```javascript
// Exemplo de dados offline
{
  id: "temp_20240702_143015_001",
  timestamp: "2024-07-02T14:30:15.123Z",
  data: {
    equipe_id: "uuid",
    colaborador_id: "uuid", 
    presente: true,
    // ... outros campos
  },
  tentativas: 0,
  usuario_id: "uuid"
}
```

## Atualizações Automáticas

### Processo de Atualização

#### 1. **Verificação Automática**
- **Frequência**: A cada abertura do app
- **Background**: Durante uso normal
- **Service Worker**: Baixa atualizações em segundo plano

#### 2. **Notificação ao Usuário**
```
🔄 "Nova versão disponível"
📝 "Melhorias e correções incluídas"
✅ [Atualizar Agora] [Depois]
```

#### 3. **Aplicação da Atualização**
- **Imediato**: Se usuário confirmar
- **Próxima abertura**: Se usuário postergar
- **Cache**: Limpo automaticamente
- **Dados**: Preservados durante atualização

### Versionamento

#### Tipos de Atualização
- **Patch** (3.2.1): Correções e melhorias
- **Minor** (3.3.0): Novas funcionalidades
- **Major** (4.0.0): Mudanças significativas

#### Changelog Automático
- **Visible**: Usuário vê principais mudanças
- **Detalhado**: Disponível na documentação
- **Histórico**: Mantido para consulta

## Performance

### Estratégias de Cache

#### 1. **Cache First** (Assets Estáticos)
```javascript
// JS, CSS, Imagens
→ Busca no cache primeiro
→ Se não encontrar, busca na rede
→ Armazena no cache para próxima vez
```

#### 2. **Network First** (API/Dados)
```javascript
// Calls para Supabase
→ Tenta buscar da rede primeiro
→ Se falhar, busca no cache
→ Atualiza cache com dados frescos
```

#### 3. **Stale While Revalidate** (Fontes)
```javascript
// Google Fonts, etc.
→ Retorna do cache imediatamente
→ Atualiza cache em background
→ Próxima vez usa versão atualizada
```

### Métricas de Performance

#### Tempos de Carregamento
- **Primeira visita**: ~2-3 segundos
- **Visitas subsequentes**: ~0.5-1 segundo
- **Offline**: Instantâneo (cache local)

#### Uso de Dados
- **Primeira instalação**: ~5-10MB
- **Atualizações**: ~1-2MB (delta)
- **Uso diário**: ~100KB-500KB

### Otimizações Implementadas

#### Code Splitting
- **Lazy Loading**: Páginas carregadas sob demanda
- **Dynamic Imports**: Componentes grandes separados
- **Bundle Analysis**: Otimização contínua

#### Resource Optimization
- **Image Compression**: WebP quando possível
- **Font Subsetting**: Apenas caracteres necessários
- **Tree Shaking**: Remoção de código não utilizado

## Compatibilidade

### Navegadores Suportados

#### ✅ Suporte Completo
- **Chrome**: 67+
- **Firefox**: 62+
- **Safari**: 11.1+
- **Edge**: 79+

#### ⚠️ Suporte Parcial
- **Samsung Internet**: 8.2+
- **Opera**: 54+
- **UC Browser**: 12.12+

#### ❌ Sem Suporte
- **Internet Explorer**: Todas as versões
- **Chrome**: < 67
- **Safari**: < 11.1

### Recursos por Plataforma

#### Android
- ✅ Instalação via Chrome
- ✅ Notificações push
- ✅ Modo offline completo
- ✅ Background sync
- ✅ Share Target

#### iOS
- ✅ Instalação via Safari
- ⚠️ Notificações limitadas
- ✅ Modo offline completo
- ⚠️ Background sync limitado
- ⚠️ Share Target limitado

#### Desktop
- ✅ Instalação (Chrome/Edge)
- ✅ Notificações do sistema
- ✅ Modo offline completo
- ✅ Background sync
- ✅ Window controls overlay

### Detecção de Recursos

#### JavaScript Feature Detection
```javascript
// Verificação de suporte PWA
const isPWASupported = () => {
  return 'serviceWorker' in navigator &&
         'PushManager' in window &&
         'Notification' in window;
};

// Verificação de instalação
const isInstalled = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true;
};
```

## Troubleshooting PWA

### Problemas Comuns

#### "Não consigo instalar o app"
**Possíveis causas:**
- Navegador não suportado
- Já está instalado
- Conexão HTTPS necessária

**Soluções:**
1. Use Chrome/Firefox/Safari atualizado
2. Verifique se já não está na tela inicial
3. Acesse via HTTPS (não HTTP)

#### "App não funciona offline"
**Possíveis causas:**
- Service Worker não registrado
- Cache não carregado
- Dados não sincronizados

**Soluções:**
1. Recarregue a página uma vez online
2. Verifique indicador de status
3. Aguarde cache ser populado

#### "Atualizações não aparecem"
**Possíveis causas:**
- Cache do navegador
- Service Worker antigo
- Conexão instável

**Soluções:**
1. Force atualização (Ctrl+Shift+R)
2. Limpe cache do navegador
3. Reabra o aplicativo

### Logs e Debugging

#### Console do Navegador
```javascript
// Verificar Service Worker
navigator.serviceWorker.getRegistrations()

// Verificar Cache
caches.keys()

// Status de instalação
window.matchMedia('(display-mode: standalone)').matches
```

#### Ferramentas de Debug
- **Chrome DevTools**: Application > Service Workers
- **Lighthouse**: Auditoria PWA
- **Network Tab**: Verificar cache hits/misses

### Suporte Técnico

#### Informações para Suporte
1. **Dispositivo**: Modelo e sistema operacional
2. **Navegador**: Nome e versão
3. **Erro específico**: Mensagem exata
4. **Passos**: Como reproduzir o problema
5. **Screenshots**: Se aplicável

#### Contato
- 📧 **Email**: suporte.pwa@sistema-pavimentacao.com
- 💬 **Chat**: Disponível no app
- 📚 **Documentação**: Este guia completo