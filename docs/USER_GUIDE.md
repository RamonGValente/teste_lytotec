
# Guia do Usuário - Sistema de Gestão Integrada 📋

## Índice

1. [Introdução](#introdução)
2. [Primeiros Passos](#primeiros-passos)
3. [Dashboard](#dashboard)
4. [**Modo Offline e Sincronização**](#modo-offline-e-sincronização) 🔄 **NOVO**
5. [Gestão de RH](#gestão-de-rh)
6. [Gestão de Máquinas](#gestão-de-máquinas)
7. [Logística](#logística)
8. [Relatório de Medição](#relatório-de-medição) ⭐
9. [Relatórios e Exportações](#relatórios-e-exportações)
10. [Índice de Fórmulas e Cálculos](#índice-de-fórmulas-e-cálculos) 🧮
11. [Configurações](#configurações)
12. [Solução de Problemas](#solução-de-problemas)

## Introdução

O Sistema de Gestão Integrada é uma plataforma completa para gerenciamento de operações de pavimentação asfáltica, incluindo gestão de recursos humanos, máquinas, logística e relatórios de medição para contratos de locação.

### Novidades da Versão 3.0 ⭐
- **Modo Offline Completo**: Continue trabalhando mesmo sem internet
- **Sincronização Automática**: Dados são salvos automaticamente quando a conexão retorna
- **Indicadores Visuais**: Status da conexão sempre visível
- **Proteção de Dados**: Zero perda de informações

### Perfis de Usuário

- **SuperAdm**: Acesso completo ao sistema
- **AdmLogistica**: Gestão de logística e relatórios
- **Encarregado**: Apontamentos e operações diárias
- **Usuário**: Consultas básicas

## Primeiros Passos

### 1. Login
- Acesse o sistema com seu email e senha
- Em caso de esquecimento, use "Esqueci minha senha"
- Primeiro acesso: contate o administrador

### 2. Navegação
- **Sidebar**: Menu principal com módulos
- **Header**: Informações do usuário e notificações
- **Dashboard**: Visão geral das operações
- **Indicador de Conexão**: Status offline/online no canto superior direito

## Dashboard

O dashboard oferece uma visão consolidada das operações:

### KPIs Principais
- **Funcionários Ativos**: Total de colaboradores
- **Veículos Operando**: Equipamentos em atividade
- **Requisições Pendentes**: Solicitações aguardando
- **Entregas do Dia**: Programações ativas

### Gráficos
- **Produtividade Mensal**: Evolução da produção
- **Status de Veículos**: Distribuição por situação
- **Entregas por Centro de Custo**: Análise regional

## Modo Offline e Sincronização 🔄

### Visão Geral
O sistema LYTEC possui capacidade **completa de funcionamento offline**, permitindo que você continue trabalhando mesmo sem conexão com a internet. Todos os dados são salvos localmente e sincronizados automaticamente quando a conexão é restaurada.

### ✅ Funcionalidades Disponíveis Offline

#### Apontamentos e Registros
- **Apontamento de Equipes**: Registro de presença e horários
- **Apontamento de Caminhões**: Controle operacional de veículos
- **Registro de Aplicação**: Dados de aplicação de asfalto
- **Registro de Cargas**: Controle de cargas e pesagem
- **Chamados de OS**: Abertura de ordens de serviço
- **Gestão de OS**: Movimentação de ordens de serviço

#### Todas as Consultas
- Visualização de dados já carregados
- Navegação entre telas
- Relatórios com dados em cache

### 🔌 Indicadores de Status

#### 1. **Indicador Principal** (Canto Superior Direito)
```
🟢 Online + Base Conectada    → Tudo funcionando
🟡 Online + Base Desconectada → Internet OK, banco com problema
🔴 Offline                    → Sem internet - Modo offline ativo
```

#### 2. **Cartão de Status** (Aparece quando necessário)
- **Localização**: Canto superior direito da tela
- **Informações**:
  - Status da conexão atual
  - Quantidade de dados pendentes
  - Última sincronização
  - Botão para sincronizar manualmente

#### 3. **Indicadores nos Formulários**
- **Ícone Wi-Fi** no título do modal
- **Mensagem informativa** sobre modo offline
- **Texto no botão** indicando salvamento offline

### 📱 Como Funciona na Prática

#### Cenário 1: Trabalhando Online
```
1. Você preenche um apontamento
2. Clica em "Salvar"
3. ✅ Dados vão direto para o banco
4. 🎉 Toast: "Apontamento registrado"
```

#### Cenário 2: Internet Cai Durante o Trabalho
```
1. 📵 Sistema detecta perda de conexão
2. 🔄 Automaticamente entra em modo offline
3. 📝 Você continua preenchendo formulários
4. 💾 Dados salvos no localStorage
5. 🎉 Toast: "Salvo offline - será sincronizado automaticamente"
```

#### Cenário 3: Internet Volta
```
1. 🌐 Sistema detecta conexão restaurada
2. 🔄 Sincronização automática inicia
3. ⬆️ Envia todos os dados pendentes
4. ✅ Remove dados do cache local
5. 🎉 Toast: "X registro(s) sincronizado(s) com sucesso"
```

### 🎯 Experiência do Usuário

#### Durante o Trabalho Offline
- **Visual Normal**: Interface permanece igual
- **Feedback Claro**: Toasts informativos sobre status
- **Sem Interrupção**: Continue trabalhando normalmente
- **Dados Seguros**: Tudo salvo localmente com segurança

#### Mensagens do Sistema
- **"Salvo offline"**: Dados armazenados localmente
- **"Sincronizando..."**: Enviando dados para o servidor
- **"X registros sincronizados"**: Sucesso na sincronização
- **"Erro na sincronização"**: Problema detectado (detalhes fornecidos)

### 🔄 Sincronização Automática

#### Quando Acontece
- **Imediatamente** quando internet retorna
- **A cada 30 segundos** verificação de conexão
- **Manualmente** via botão "Sincronizar agora"

#### Processo de Sincronização
```
1. Verificar conexão com Supabase ✓
2. Buscar dados pendentes no localStorage ✓
3. Enviar cada registro individualmente ✓
4. Verificar sucesso de cada envio ✓
5. Remover dados sincronizados do cache ✓
6. Notificar resultado ao usuário ✓
```

#### Tratamento de Erros
- **Tentativas**: Até 3 tentativas por registro
- **Falhas**: Registros problemáticos são mantidos para nova tentativa
- **Logs**: Detalhes de erros no console para suporte
- **Usuário**: Notificação clara sobre problemas

### 💾 Armazenamento Local

#### Estrutura dos Dados
```javascript
// localStorage keys:
offline_apontamento_equipe      // Apontamentos de equipe
offline_apontamento_caminhoes   // Apontamentos de caminhões  
offline_registro_aplicacao     // Registros de aplicação
offline_registro_cargas        // Registros de cargas
offline_chamados_os            // Chamados de OS
offline_ordens_servico         // Ordens de serviço
```

#### Dados Armazenados
```javascript
{
  id: "temp_uuid",              // ID temporário único
  timestamp: "2024-01-15T...",  // Momento da criação
  data: { /* dados do form */ }, // Dados completos do formulário
  tentativas: 0,               // Contador de tentativas de sync
  erro: null,                  // Último erro (se houver)
  usuario_id: "uuid"           // ID do usuário que criou
}
```

### 🛠️ Funcionalidades Avançadas

#### Monitoramento de Conexão
- **Eventos do navegador**: `online`/`offline`
- **Verificação real**: Testa conexão com Supabase
- **Frequência**: A cada 30 segundos
- **Inteligente**: Só verifica quando necessário

#### Gestão de Conflitos
- **Prevenção**: IDs temporários únicos evitam duplicatas
- **Validação**: Dados são validados antes do envio
- **Recuperação**: Falhas não interrompem outras sincronizações

#### Limpeza Automática
- **Sucesso**: Dados sincronizados são removidos automaticamente
- **Falhas**: Dados problemáticos ficam para nova tentativa
- **Limite**: Máximo 3 tentativas por registro

### 📊 Monitoramento e Estatísticas

#### Informações Disponíveis
- **Registros Pendentes**: Quantos estão aguardando sincronização
- **Última Sincronização**: Timestamp da última operação
- **Status por Tipo**: Detalhamento por módulo
- **Histórico de Erros**: Logs para troubleshooting

#### Relatório de Status
```
📊 Status de Sincronização:
- Apontamentos de Equipe: 3 pendentes
- Registro de Aplicação: 1 pendente
- Chamados de OS: 0 pendentes
- Última sync: 14:30:15
- Status: 🟢 Tudo sincronizado
```

### 🚨 Troubleshooting Modo Offline

#### "Dados não sincronizando"
1. **Verificar conexão**: Indicador deve estar verde
2. **Aguardar**: Sincronização pode levar alguns segundos
3. **Manual**: Usar botão "Sincronizar agora"
4. **Logs**: Verificar console (F12) para erros

#### "Dados duplicados"
- **Causa**: Sincronização manual múltipla
- **Prevenção**: Sistema previne automaticamente
- **Solução**: Contatar suporte se persistir

#### "Erro de permissão"
- **Causa**: Usuário sem acesso ou token expirado
- **Solução**: Fazer logout/login novamente
- **Prevenção**: Sistema renovar token automaticamente

#### "Dados perdidos"
- **Impossível**: Dados ficam no localStorage até sincronizar
- **Verificação**: F12 > Application > Local Storage
- **Recuperação**: Dados ficam mesmo após fechar navegador

### ⚠️ Limitações e Considerações

#### Limitações do Modo Offline
- **Não funciona**: Consultas que precisam buscar novos dados do servidor
- **Cache limitado**: Apenas dados já carregados na sessão
- **Relacionamentos**: Podem faltar dados de referência para novos registros

#### Recomendações
- **Sincronize frequentemente** quando online
- **Monitore o indicador** de status de conexão
- **Não force fechamento** durante sincronização
- **Aguarde confirmação** antes de fechar aplicação

#### Capacidade de Armazenamento
- **localStorage**: ~5-10MB por domain
- **Registros**: Aproximadamente 1000-5000 registros offline
- **Limpeza**: Dados sincronizados são removidos automaticamente

### 🎯 Casos de Uso Típicos

#### Encarregado em Campo
```
Cenário: Fazendo apontamentos na obra sem internet
1. 📱 Abre app no celular/tablet
2. 📝 Preenche apontamentos normalmente  
3. 💾 Sistema salva tudo offline
4. 🚗 Volta para escritório com WiFi
5. 🔄 Tudo sincroniza automaticamente
```

#### Usina sem Internet Estável
```
Cenário: Registrando cargas com conexão instável  
1. 🏭 Operador na usina registra cargas
2. 📶 Internet oscila constantemente
3. 💾 Sistema alterna entre online/offline automaticamente
4. ✅ Zero perda de dados independente da conexão
```

#### Escritório com Problemas de Rede
```
Cenário: Equipe fazendo apontamentos no escritório
1. 🏢 Internet corporativa com instabilidade
2. 👥 Múltiplos usuários trabalhando simultaneamente
3. 🔄 Cada um tem seu cache offline independente
4. 📊 Sincronização coordenada quando conexão volta
```

## Gestão de RH

### Cadastro de Funcionários

#### Dados Pessoais
- Nome completo
- CPF (validação automática)
- Data de nascimento
- Gênero
- Endereço completo
- Telefone e email

#### Dados Profissionais
- Empresa
- Departamento
- Função
- Centro de custo
- Data de admissão
- Status (Ativo/Inativo)

#### Dados Contratuais
- Salário base
- Benefícios (VT, VR, etc.)
- Adicionais (noturno, periculosidade)
- Férias programadas

### Apontamento de Equipes ⭐ **COM MODO OFFLINE**

#### Processo Padrão
1. Selecione a equipe
2. Marque presença dos colaboradores
3. Registre horários de trabalho
4. Adicione observações se necessário
5. Confirme o apontamento

#### Modo Offline 🔄
- **Funciona sem internet**: Continue registrando apontamentos
- **Salvamento local**: Dados ficam seguros no dispositivo
- **Sincronização automática**: Enviados quando conexão voltar
- **Indicador visual**: Ícone e mensagem mostram status offline
- **Zero perda**: Impossível perder dados de apontamento

### Avaliação de Performance
- Pontualidade (1-5)
- Competência técnica (1-5)
- Trabalho em equipe (1-5)
- Comunicação (1-5)
- Proatividade (1-5)
- Organização (1-5)

## Gestão de Máquinas

### Cadastro de Veículos/Equipamentos

#### Informações Básicas
- Frota e número
- Placa
- Tipo (Caminhão, Equipamento, Prancha, etc.)
- Marca e modelo
- Ano de fabricação

#### Especificações Técnicas
- Motor
- Combustível
- Capacidade
- Situação operacional
- Status IPVA

#### Documentação
- Upload de fotos
- Documentos do veículo
- Observações importantes

### Apontamento de Uso ⭐ **COM MODO OFFLINE**

#### Dados Operacionais
- Data e horários de operação
- Horímetro inicial e final
- Operador responsável
- Centro de custo
- Situação (Operando, Disponível, Manutenção, etc.)

#### Modo Offline 🔄
- **Apontamentos de caminhões**: Salvos localmente se offline
- **Dados operacionais**: Horímetros, situação, centro de custo
- **Fotos de avarias**: Armazenadas e enviadas na sincronização
- **Continuidade**: Zero interrupção nas operações de campo

#### Inspeção Diária
- Níveis (óleo, água, combustível)
- Estado dos equipamentos
- Material de segurança
- Documentação
- Registro fotográfico de avarias

### Chamados e Ordens de Serviço ⭐ **COM MODO OFFLINE**

#### Abertura de Chamado (Offline)
1. Selecione o veículo/equipamento
2. Descreva o problema
3. Defina prioridade
4. Anexe fotos das avarias
5. Submeta o chamado (salvo offline se necessário)

#### Modo Offline 🔄
- **Chamados**: Podem ser criados offline
- **Fotos**: Armazenadas localmente até sincronização
- **Priorização**: Funciona normalmente offline
- **Histórico**: Disponível conforme dados em cache

#### Acompanhamento
- Status do chamado
- Técnico responsável
- Tempo de atendimento
- Histórico de movimentações

## Logística

### Requisições de Obra

#### Criação de Requisição
1. Número da requisição
2. Centro de custo
3. Engenheiro responsável
4. Data da requisição

#### Logradouros
- Nome da rua/avenida
- Bairro
- Comprimento (m)
- Largura (m)
- Espessura (cm)
- Tipo de massa asfáltica
- Pintura de ligação

### Programação de Entregas

#### Dados da Programação
- Requisição base
- Data de entrega
- Centro de custo
- Usina fornecedora

#### Lista de Entregas
- Caminhão designado
- Equipe responsável
- Apontador
- Quantidade de massa (ton)
- Logradouro de destino
- Tipo de lançamento

### Registro de Cargas ⭐ **COM MODO OFFLINE**

#### Saída da Usina (Offline)
- Data e hora de saída
- Temperatura da massa
- Peso na balança (ticket)
- Upload da foto do ticket

#### Modo Offline 🔄
- **Pesagem**: Todos os dados salvos localmente
- **Fotos de tickets**: Armazenadas no dispositivo
- **Temperaturas**: Registradas sem conexão
- **Cálculos**: Funcionam normalmente offline

#### Retorno à Usina
- Peso de retorno
- Cálculo da carga líquida
- Status da entrega

### Aplicação de Asfalto ⭐ **COM MODO OFFLINE**

#### Processo em 3 Etapas (Offline)

**1. Dados Iniciais**
- Seleção da entrega programada
- Verificação da carga disponível
- Dados do logradouro

**2. Dados Técnicos**
- Data e hora de chegada
- Temperatura na chegada
- Hora de aplicação
- Temperatura na aplicação
- Dimensões da aplicação:
  - Estaca inicial/final
  - Comprimento (m)
  - Largura média (m)
  - Área calculada automaticamente

**3. Finalização**
- Tonelada aplicada
- Espessura calculada automaticamente
- Validação (ideal: 3-7cm)
- Hora de saída do caminhão
- Observações finais

#### Modo Offline 🔄
- **Cálculos automáticos**: Área, espessura, validações
- **Múltiplas aplicações**: Controle de massa remanescente
- **Dados técnicos**: Temperaturas, dimensões, horários
- **Validações**: Status da espessura funciona offline

#### Múltiplas Aplicações
- Uma carga pode ter várias aplicações
- Controle de massa remanescente
- Sequenciamento automático
- Finalização quando massa zerada

## Relatório de Medição ⭐

### Visão Geral
O módulo de Relatório de Medição é utilizado para contratos de locação de equipamentos e caminhões, calculando valores proporcionais baseados em apontamentos operacionais e aplicando descontos de manutenção e desmobilização.

### Filtros de Geração

#### 1. Tipo de Veículo (Obrigatório)
- **Equipamento**: Cálculo baseado em horas (200h/mês)
- **Caminhão**: Cálculo baseado em dias úteis
- **Prancha/Van/Ônibus**: Outros tipos disponíveis

#### 2. Identificação (Obrigatório)
- Lista dinâmica baseada no tipo selecionado
- Mostra: Frota + Número + Placa + Modelo
- Somente veículos ativos são exibidos

#### 3. Período (Obrigatório)
- Seletor de intervalo de datas
- Padrão: 21/mês atual à 20/próximo mês
- Valida apontamentos no período

#### 4. Desmobilização (Opcional)
- Checkbox para aplicar desconto de desmobilização
- Disponível para Equipamentos e Caminhões
- Calcula dias sem apontamento até final do período

### Cálculos para Equipamentos

#### Fórmula Base (4 Partes)
1. **Valor Unitário**: `Aluguel Mensal ÷ 200 horas = R$/h`
2. **Desconto Manutenção**: `(200 ÷ 30) × Dias Manutenção × R$/h`
3. **Desconto Desmobilização**: `(200 ÷ 30) × Dias Parados × R$/h`
4. **Horas Restantes**: `200h - Total Horas Descontadas`

#### Distribuição por Centro de Custo
- **Horas Disponíveis**: `(Horas Restantes ÷ Total Dias) × Dias do Centro`
- **Valor Período**: `Horas Disponíveis × Valor Unitário`
- **Produtividade**: `(Total Horímetros ÷ Horas Restantes) × Horas Disponíveis`

### Cálculos para Caminhões

#### Fórmula Base (4 Partes)
1. **Valor Diário**: `Aluguel Mensal ÷ 30 dias = R$/dia`
2. **Desconto Manutenção**: `Valor Diário × Dias Manutenção`
3. **Desconto Desmobilização**: `Valor Diário × Dias Parados`
4. **Valor Restante**: `Aluguel Mensal - Total Descontos`

#### Distribuição por Centro de Custo
- **Valor Diário Divisão**: `Valor Restante ÷ Total Dias Operando`
- **Valor Centro**: `Valor Diário Divisão × Dias do Centro`
- **Produtividade**: Quilometragem proporcional por centro

### Tipos de Desconto

#### Manutenção
- **Fonte**: Apontamentos com situação "Em Manutenção"
- **Equipamento**: Calculado em horas
- **Caminhão**: Calculado em dias
- **Automático**: Baseado nos apontamentos do período

#### Desmobilização
- **Ativação**: Checkbox opcional
- **Cálculo**: Diferença entre última data de apontamento e final do período
- **Aplicação**: Mesmo valor unitário da manutenção

### Estrutura do Relatório

#### Cabeçalho
- Logo da empresa
- Número PM, mês de referência, período
- Contratada: ABRA INFRAESTRUTURA
- Obra: Centros de custo envolvidos

#### 1. Descrição dos Serviços
**Para Equipamentos:**
- Quantidade (200H fixo)
- Valor Unit. (R$/h)
- Total Mensal (R$)
- Horas Disponíveis
- Valor (R$)
- Produtividade (H)
- Abastecimento (L)
- Média Abast. (L/H)
- Rastreador (editável)

**Para Caminhões:**
- Total Mensal (R$)
- QTD/DIA
- Valor (R$)
- Produtividade (KM)
- Abastecimento (L)
- Média Abast. (KM/L)
- Rastreador (editável)

#### 2. Descontos/Acréscimos
- **Tipo de Desconto**: Manutenção/Desmobilização
- **Valor Unit.**: R$/h ou R$/dia
- **Quantidade**: Horas ou dias
- **Valor Total**: Desconto aplicado

#### 3. Observações
- Campo livre para anotações
- Importante para contextualizações

#### 4. Total do Período
- **Cálculo**: Soma dos valores - Soma dos descontos
- **Destaque**: Valor final em negrito

#### 5. Assinaturas
- Medição e Controle
- Gestor de Contratos
- Contratada

### Exportações

#### Excel (Múltiplas Abas)
- **Aba 1**: Relatório principal
- **Aba 2**: Detalhamento de descontos
- **Aba 3**: Resumo por centro de custo
- **Formatação**: Cores, bordas, formatação monetária

#### PDF
- **Layout**: Formato de impressão A4
- **Conteúdo**: Relatório completo com formatação
- **Assinaturas**: Campos para assinatura manual

### Validações e Regras

#### Obrigatórias
- Tipo de veículo, identificação e período são obrigatórios
- Período deve ter apontamentos "Operando" ou "Disponível"
- Veículo deve ter valor de aluguel cadastrado

#### Automáticas
- Busca apontamentos por situação específica
- Calcula automaticamente todos os valores
- Valida período contra dados disponíveis

#### Mensagens
- **Sucesso**: "Relatório gerado com X registros"
- **Erro**: "Nenhum dado encontrado para os filtros"
- **Validação**: Campos obrigatórios destacados

### Cenários de Uso

#### Caso 1: Equipamento Completo
- Equipamento trabalhou todos os dias
- Sem manutenção, sem desmobilização
- Valor = (Aluguel ÷ 200) × Horas trabalhadas

#### Caso 2: Equipamento com Manutenção
- 5 dias em manutenção no período
- Desconto: (200 ÷ 30) × 5 × (Aluguel ÷ 200)
- Horas restantes: 200 - horas descontadas

#### Caso 3: Caminhão com Desmobilização
- Última data de apontamento: dia 15
- Período até dia 20 = 5 dias parados
- Desconto: (Aluguel ÷ 30) × 5 dias

#### Caso 4: Múltiplos Centros de Custo
- Equipamento trabalhou em 3 centros diferentes
- Rateio proporcional por dias trabalhados
- Cada centro recebe valor correspondente

### Troubleshooting

#### "Nenhum dado encontrado"
1. Verifique se há apontamentos no período
2. Confirme se situações são "Operando" ou "Disponível"
3. Valide se centro de custo está preenchido

#### "Erro na exportação"
1. Verifique dados de manutenção
2. Confirme cálculos de desconto
3. Tente gerar novamente

#### "Valores incorretos"
1. Verifique valor de aluguel do veículo
2. Confirme apontamentos de manutenção
3. Valide configuração de desmobilização

## Índice de Fórmulas e Cálculos 🧮

### 📍 Localização das Fórmulas no Código

#### 1. **Aplicação de Asfalto**
📁 **Arquivo**: `src/utils/aplicacaoCalculations.ts`

- **Cálculo de Área** (linha 8-15)
  ```typescript
  // Fórmula: comprimento × largura
  return comprimento * largura;
  ```

- **Cálculo de Tonelada Aplicada** (linha 22-29)
  ```typescript
  // Fórmula: área × 0.05 × 2.4
  return area * 0.05 * 2.4;
  ```

- **Cálculo de Espessura** (linha 62-76)
  ```typescript
  // Fórmula: (tonelada_aplicada ÷ área) ÷ 2.4
  return tonelada / area / 2.4;
  ```

- **Status da Espessura** (linha 139-150)
  ```typescript
  // < 0.035 cm ou > 0.05 cm → "Fora do Padrão"
  // Entre 0.035 e 0.05 → "Dentro do Padrão"
  ```

#### 2. **Hook de Cálculos de Aplicação**
📁 **Arquivo**: `src/hooks/registro-aplicacao/useCalculations.ts`

- **Área Calculada** (linha 18-21)
  ```typescript
  // Multiplica comprimento por largura
  return comprimento * largura;
  ```

- **Tonelada Aplicada com Limite** (linha 24-36)
  ```typescript
  // Usa o menor valor entre calculado e disponível
  return Math.min(calculatedTonelada, massaDisponivel);
  ```

- **Espessura Condicional** (linha 39-55)
  ```typescript
  // Com massa total: (massa ÷ área) ÷ 2.4
  // Tradicional: (tonelada_aplicada ÷ área) ÷ 2.4
  ```

#### 3. **Relatório de Medição - Equipamentos**
📁 **Arquivo**: `src/components/relatorio-medicao/RelatorioMedicaoDetalhado.tsx`

- **Valor Unitário por Hora** (documentado nas linhas 105-115)
  ```
  Fórmula: Aluguel Mensal ÷ 200 horas = R$/h
  ```

- **Desconto de Manutenção**
  ```
  Fórmula: (200 ÷ 30) × Dias Manutenção × R$/h
  ```

- **Horas Disponíveis por Centro**
  ```
  Fórmula: (Horas Restantes ÷ Total Dias) × Dias do Centro
  ```

- **Produtividade Nova**
  ```
  Fórmula: (Total Horímetros ÷ Horas Restantes) × Horas Disponíveis
  ```

#### 4. **Relatório de Medição - Caminhões**

- **Valor Diário**
  ```
  Fórmula: Aluguel Mensal ÷ 30 dias = R$/dia
  ```

- **Distribuição Proporcional**
  ```
  Fórmula: ((Aluguel - Descontos) ÷ Total Dias) × Dias do Centro
  ```

#### 5. **Banco de Dados - Views e Queries**
📁 **Arquivo**: `docs/DATABASE.md`

- **View de Massa Remanescente** (linhas 520-535)
  ```sql
  -- Massa Total - Massa Aplicada = Remanescente
  COALESCE(rc.massa_total_carga, 0) - COALESCE(aa.massa_aplicada_total, 0)
  ```

- **Cálculo de Espessura Média** (linhas 560-575)
  ```sql
  -- (Massa Total ÷ Área Total) ÷ 2.4
  (emr.massa_total_carga / area_total) / 2.4
  ```

### 🔍 **Fórmulas por Funcionalidade**

#### **A. Pavimentação Asfáltica**

| **Cálculo** | **Fórmula** | **Localização** | **Unidade** |
|-------------|-------------|----------------|-------------|
| Área | `comprimento × largura` | `aplicacaoCalculations.ts:12` | m² |
| Volume | `área × espessura × 2.4` | `DATABASE.md:645` | m³ |
| Tonelada Aplicada | `área × 0.05 × 2.4` | `aplicacaoCalculations.ts:25` | ton |
| Espessura | `(tonelada ÷ área) ÷ 2.4` | `aplicacaoCalculations.ts:70` | m |
| Densidade Padrão | `2.4 ton/m³` | Constante | ton/m³ |

#### **B. Relatório de Medição - Equipamentos**

| **Cálculo** | **Fórmula** | **Localização** | **Unidade** |
|-------------|-------------|----------------|-------------|
| Valor/Hora | `Aluguel ÷ 200` | Documentação | R$/h |
| Horas Manutenção | `(200 ÷ 30) × Dias` | Documentação | horas |
| Horas Disponíveis | `(Restantes ÷ Total Dias) × Dias Centro` | Documentação | horas |
| Valor Período | `Horas Disponíveis × R$/h` | Documentação | R$ |
| Produtividade | `(Horímetros ÷ Restantes) × Disponíveis` | Documentação | horas |

#### **C. Relatório de Medição - Caminhões**

| **Cálculo** | **Fórmula** | **Localização** | **Unidade** |
|-------------|-------------|----------------|-------------|
| Valor/Dia | `Aluguel ÷ 30` | Documentação | R$/dia |
| Desconto Manutenção | `R$/dia × Dias` | Documentação | R$ |
| Valor Centro | `((Aluguel - Descontos) ÷ Dias) × Dias Centro` | Documentação | R$ |
| Quilometragem | Proporcional por centro | Documentação | km |

#### **D. Validações e Status**

| **Validação** | **Critério** | **Localização** | **Status** |
|---------------|--------------|----------------|------------|
| Espessura Boa | `0.035 ≤ valor ≤ 0.05` | `aplicacaoCalculations.ts:145` | Success |
| Espessura Crítica | `< 0.035 ou > 0.05` | `aplicacaoCalculations.ts:147` | Error |
| Massa Excedida | `Aplicada > Disponível` | `useCalculations.ts:75` | Warning |
| Período Válido | `Tem apontamentos` | Documentação | Valid |

### 📊 **Constantes do Sistema**

#### **Pavimentação**
- **Densidade do Asfalto**: `2.4 ton/m³`
- **Espessura Padrão**: `0.05 m (5 cm)`
- **Fator de Compactação**: `1.0`

#### **Relatório de Medição**
- **Horas Mensais Equipamento**: `200 h/mês`
- **Dias Mensais**: `30 dias/mês`
- **Conversão Hora/Dia**: `200h ÷ 30 dias = 6.67 h/dia`

#### **Validações**
- **Espessura Mínima**: `0.035 m`
- **Espessura Máxima**: `0.05 m`
- **Tolerância Temperatura**: `±10°C`

### 🔗 **Referências Cruzadas**

#### **Dependências entre Módulos**
1. **Aplicação → Cargas**: Usa massa real da carga
2. **Medição → Apontamentos**: Baseia-se em datas de operação
3. **Área → Volume**: Multiplica por espessura e densidade
4. **Centro Custo → Rateio**: Distribui valores proporcionalmente

#### **Fluxo de Dados**
```
Apontamentos → Cálculo Horas → Distribuição Centro → Valor Final
     ↓              ↓              ↓              ↓
Banco de Dados → Hook Cálculos → Component → Relatório
```

### 💡 **Dicas de Manutenção**

1. **Alterações em Fórmulas**: Sempre atualizar documentação
2. **Novos Cálculos**: Criar testes unitários
3. **Constantes**: Definir em arquivo separado para fácil alteração
4. **Performance**: Cachear cálculos complexos em useMemo

---
**📍 Localização dos Arquivos Principais:**
- **Cálculos**: `src/utils/aplicacaoCalculations.ts`
- **Hooks**: `src/hooks/registro-aplicacao/useCalculations.ts`
- **Componentes**: `src/components/relatorio-medicao/`
- **Documentação**: `docs/DATABASE.md`, `docs/USER_GUIDE.md`

## Relatórios e Exportações

### Tipos de Relatório
- **Funcionários**: Lista completa com filtros
- **Veículos**: Status e utilização
- **Produtividade**: Métricas operacionais
- **Medição**: Contratos de locação ⭐
- **Dados Offline**: Relatório de sincronização ⭐ **NOVO**

### Formatos de Export
- **Excel**: Dados tabulares com formatação
- **PDF**: Relatórios formatados para impressão
- **CSV**: Dados brutos para análise

## Configurações

### Centros de Custo
- Código identificador
- Nome descritivo
- CNPJ vinculado
- Status (Ativo/Inativo)

### Empresas
- Dados fiscais
- Endereço e contatos
- Departamentos associados

### Usuários e Permissões
- Criação de usuários
- Atribuição de funções
- Controle de acesso por módulo

### Configurações de Sincronização ⭐ **NOVO**
- **Frequência de verificação**: 30 segundos (padrão)
- **Tentativas máximas**: 3 por registro
- **Limpeza automática**: Dados sincronizados removidos
- **Log de atividades**: Console do navegador

## Solução de Problemas

### Problemas Comuns

#### "Erro de Permissão"
- Verifique seu perfil de usuário
- Contate o administrador para ajustes
- Confirme se está na empresa correta

#### "Dados não Carregando"
- Verifique conexão com internet
- Verifique indicador de status no canto superior
- Recarregue a página
- Limpe cache do navegador

#### "Erro ao Salvar"
- Verifique campos obrigatórios
- Confirme formato dos dados
- Se offline, dados são salvos localmente
- Tente novamente

### Problemas de Sincronização ⭐ **NOVO**

#### "Dados não sincronizando"
**Sintomas:**
- Indicador mostra dados pendentes
- Botão "Sincronizar" não funciona
- Dados permanecem no cache local

**Soluções:**
1. **Verificar conexão**:
   - Indicador deve estar verde (🟢)
   - Testar acesso a outros sites
   - Verificar se Supabase está funcionando

2. **Aguardar processo automático**:
   - Sincronização ocorre a cada 30 segundos
   - Processo pode demorar alguns minutos
   - Não force fechamento durante sync

3. **Sincronização manual**:
   - Clicar em "Sincronizar agora"
   - Aguardar mensagem de confirmação
   - Verificar se contador de pendentes zerou

4. **Verificar logs**:
   - Abrir console (F12)
   - Procurar erros em vermelho
   - Enviar logs para suporte se necessário

#### "Erro de Autenticação na Sync"
**Sintomas:**
- Mensagem "Permission denied"
- Sincronização falha repetidamente
- Token de acesso expirado

**Soluções:**
1. **Renovar sessão**:
   - Fazer logout
   - Fazer login novamente
   - Sincronização deve funcionar

2. **Verificar permissões**:
   - Confirmar acesso aos módulos
   - Contatar administrador se necessário

#### "Dados duplicados após sync"
**Sintomas:**
- Registros aparecem duplicados
- Múltiplas sincronizações do mesmo dado

**Prevenção:**
- Sistema previne automaticamente
- IDs temporários únicos
- Validação antes da inserção

**Solução:**
- Raramente ocorre devido às proteções
- Contatar suporte se persistir

#### "Cache offline muito grande"
**Sintomas:**
- Navegador lento
- Erro de espaço insuficiente
- Muitos dados pendentes

**Soluções:**
1. **Sincronizar tudo**:
   - Conectar à internet
   - Aguardar sincronização completa
   - Cache será limpo automaticamente

2. **Limpeza manual** (último recurso):
   ```javascript
   // No console do navegador (F12)
   localStorage.clear();
   // ATENÇÃO: Isso apaga TODOS os dados offline!
   ```

### Dicas de Uso Offline ⭐ **NOVO**

#### Melhores Práticas
1. **Sincronize regularmente** quando online
2. **Monitore o indicador** de status de conexão
3. **Não force fechamento** durante sincronização
4. **Aguarde confirmação** antes de sair do sistema

#### Preparação para Campo
1. **Carregar dados** antes de sair (equipes, veículos, etc.)
2. **Verificar indicador** está funcionando
3. **Testar modo offline** antes da operação
4. **Confirmar cache** tem dados necessários

#### Resolução de Emergência
1. **Dados críticos perdidos**:
   - Verificar localStorage (F12 > Application)
   - Não limpar cache sem verificar
   - Contatar suporte imediatamente

2. **Sistema não responde**:
   - Recarregar página (Ctrl+F5)
   - Verificar se dados offline ainda existem
   - Tentar sincronização manual

### Contato para Suporte
- **Email**: suporte@sistema.com
- **Telefone**: (11) 99999-9999
- **Horário**: Segunda a sexta, 8h às 18h

### Informações para Suporte ⭐ **NOVO**
Ao reportar problemas de sincronização, inclua:

1. **Status da conexão** (verde/amarelo/vermelho)
2. **Quantidade de dados pendentes**
3. **Última sincronização** (timestamp)
4. **Logs do console** (F12 > Console)
5. **Ações realizadas** antes do problema
6. **Dados específicos** que não sincronizaram

---

**Versão do Guia**: 3.0  
**Última Atualização**: Janeiro 2025  
**Sistema**: Gestão Integrada de Pavimentação com Modo Offline  
**Novidades**: Funcionalidade offline completa e sincronização automática

