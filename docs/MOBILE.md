# Guia Mobile - Interface Responsiva 📱

## Visão Geral

O Sistema de Gestão Integrada foi projetado com **Mobile First**, oferecendo experiência otimizada em tablets e smartphones, com navegação touch-friendly e layouts adaptativos.

## Índice

1. [Design Mobile First](#design-mobile-first)
2. [Navegação Touch](#navegação-touch)
3. [Layouts Responsivos](#layouts-responsivos)
4. [Performance Mobile](#performance-mobile)
5. [Gestos e Interações](#gestos-e-interações)
6. [Otimizações Específicas](#otimizações-específicas)

## Design Mobile First

### Princípios de Design

#### 1. **Conteúdo Prioritário**
- **Informações essenciais** sempre visíveis
- **Ações principais** facilmente acessíveis
- **Navegação simplificada** com poucos toques
- **Dados críticos** destacados adequadamente

#### 2. **Hierarquia Visual**
- **Tipografia escalável**: Texto legível em qualquer tamanho
- **Contraste adequado**: Visibilidade em diferentes condições de luz
- **Espaçamento touch-friendly**: Elementos com 44px+ de área tocável
- **Cores semânticas**: Status e ações claramente identificáveis

### Breakpoints Responsivos

#### Definições do Sistema
```css
/* Tailwind CSS Breakpoints Customizados */
xs: 320px   /* Smartphone pequeno */
sm: 640px   /* Smartphone padrão */
md: 768px   /* Tablet portrait */
lg: 1024px  /* Tablet landscape */
xl: 1280px  /* Desktop */
2xl: 1536px /* Desktop large */
```

#### Estratégia de Adaptação
```
Mobile First → Tablet → Desktop
320px ------→ 768px ------→ 1024px+
```

## Navegação Touch

### Menu Principal (Sidebar)

#### Mobile (< 768px)
- **Drawer**: Menu deslizante sobreposto
- **Trigger**: Ícone hambúrguer no header
- **Overlay**: Fundo escuro quando aberto
- **Swipe**: Gestos para abrir/fechar

#### Tablet (768px - 1024px)
- **Collapsible**: Menu retrátil na lateral
- **Auto-hide**: Oculta em modo portrait
- **Persistent**: Visível em mode landscape

#### Desktop (1024px+)
- **Persistent**: Sempre visível
- **Expandable**: Pode ser expandido/colapsado
- **Quick Access**: Atalhos de teclado

### Navegação Contextual

#### Breadcrumbs Mobile
- **Collapse**: Mostra apenas último nível
- **Dropdown**: Acesso aos níveis anteriores
- **Back Button**: Navegação por gestos

#### Tab Navigation
- **Swipe**: Navegação horizontal entre abas
- **Scroll**: Quando muitas abas não cabem
- **Indicators**: Pontos ou barra de progresso

## Layouts Responsivos

### Grid System Adaptativo

#### Cards em Grid
```css
/* Mobile: 1 coluna */
grid-cols-1

/* Tablet: 2 colunas */
md:grid-cols-2

/* Desktop: 3-4 colunas */
lg:grid-cols-3 xl:grid-cols-4
```

#### Tabelas Responsivas
```css
/* Mobile: Cards verticais */
block

/* Tablet+: Tabela tradicional */
md:table
```

### Formulários Mobile

#### Layout Vertical
- **Campos**: Um por linha no mobile
- **Labels**: Sempre acima dos campos
- **Grupos**: Separação visual clara
- **Validation**: Mensagens inline

#### Modais Adaptativos
```css
/* Mobile: Fullscreen */
h-full w-full

/* Tablet+: Centered modal */
md:h-auto md:w-auto md:max-w-lg
```

### Listas e Cards

#### Lista de Funcionários Mobile
```jsx
// Desktop: Tabela com colunas
<Table>
  <TableHeader>...</TableHeader>
  <TableBody>...</TableBody>
</Table>

// Mobile: Cards empilhados
<div className="space-y-4 md:hidden">
  {funcionarios.map(funcionario => (
    <Card key={funcionario.id}>
      <CardHeader>
        <Avatar />
        <div>
          <h3>{funcionario.nome}</h3>
          <p>{funcionario.funcao}</p>
        </div>
      </CardHeader>
      <CardContent>
        <Badge>{funcionario.status}</Badge>
      </CardContent>
    </Card>
  ))}
</div>
```

## Performance Mobile

### Otimizações Implementadas

#### 1. **Bundle Splitting**
- **Lazy Loading**: Páginas carregadas sob demanda
- **Code Splitting**: Componentes grandes separados
- **Dynamic Imports**: Reduz bundle inicial

#### 2. **Asset Optimization**
- **WebP Images**: Quando suportado
- **Responsive Images**: Tamanhos adequados por device
- **Font Loading**: Otimizado com font-display

#### 3. **Service Worker Cache**
- **Static Assets**: Cache agressivo
- **API Calls**: Cache com revalidação
- **Offline Fallbacks**: Conteúdo quando offline

### Métricas de Performance

#### Targets Mobile
- **First Contentful Paint**: < 2s
- **Largest Contentful Paint**: < 3s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

#### Monitoramento
```javascript
// Web Vitals tracking
import { getCLS, getFID, getFCP, getLCP } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
```

## Gestos e Interações

### Gestos Implementados

#### 1. **Swipe Navigation**
- **Tabs**: Deslizar entre abas
- **Cards**: Ações por swipe
- **Menu**: Abrir/fechar sidebar

#### 2. **Pull to Refresh**
- **Listas**: Atualizar dados
- **Dashboard**: Refresh de KPIs
- **Feedback**: Indicador visual

#### 3. **Long Press**
- **Context Menu**: Ações adicionais
- **Multi-select**: Seleção múltipla
- **Quick Actions**: Atalhos

### Touch Targets

#### Tamanhos Mínimos
```css
/* Botões principais */
min-h-[44px] min-w-[44px]

/* Links em texto */
py-2 px-1

/* Ícones clicáveis */
p-2 (32px total)
```

#### Espaçamento
```css
/* Entre elementos tocáveis */
gap-2 (8px)

/* Dentro de listas */
space-y-1
```

## Otimizações Específicas

### Formulários Mobile

#### Input Types Otimizados
```jsx
// Email
<input type="email" />

// Telefone
<input type="tel" />

// Números
<input type="number" inputMode="decimal" />

// Data
<input type="date" />
```

#### Teclado Virtual
- **Dismiss**: Toque fora para fechar
- **Navigation**: Enter para próximo campo
- **Submit**: Enter para enviar formulário

### Componentes Adaptativos

#### DatePicker Mobile
```jsx
// Mobile: Native date picker
<input 
  type="date" 
  className="md:hidden"
/>

// Desktop: Custom calendar
<Calendar 
  className="hidden md:block"
/>
```

#### Select Dropdown
```jsx
// Mobile: Native select
<select className="md:hidden">
  <option>Opção 1</option>
</select>

// Desktop: Custom combobox
<Combobox className="hidden md:block">
  ...
</Combobox>
```

### Modal e Dialog

#### Comportamento Mobile
```jsx
<Dialog>
  <DialogContent className={cn(
    // Mobile: Fullscreen
    "h-full w-full max-w-none",
    // Desktop: Centered
    "md:h-auto md:w-auto md:max-w-lg"
  )}>
    <DialogHeader className="sticky top-0 bg-background">
      <DialogTitle>Título</DialogTitle>
    </DialogHeader>
    
    <div className="flex-1 overflow-y-auto p-4">
      {/* Conteúdo scrollável */}
    </div>
    
    <DialogFooter className="sticky bottom-0 bg-background">
      <Button>Salvar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Loading States

#### Mobile-Specific
```jsx
// Skeleton para cards
<div className="space-y-4 md:hidden">
  {[...Array(5)].map((_, i) => (
    <Card key={i}>
      <CardHeader>
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </CardHeader>
    </Card>
  ))}
</div>

// Skeleton para tabela
<div className="hidden md:block">
  <TableSkeleton rows={10} cols={5} />
</div>
```

## Funcionalidades Mobile Específicas

### Apontamentos em Campo

#### Interface Otimizada
- **Botões grandes**: Fácil toque com luvas
- **Contraste alto**: Visibilidade em sol forte
- **Feedback tátil**: Vibração quando disponível
- **Orientação**: Portrait/landscape adaptativo

#### Captura de Dados
```jsx
// Foto de avarias
<Camera
  onCapture={handlePhotoCapture}
  className="w-full aspect-video"
  overlay="Centralize a avaria"
/>

// GPS Location (se disponível)
<LocationPicker
  onLocationSelect={handleLocationSelect}
  accuracy="high"
/>

// Assinatura digital
<SignaturePad
  onSignature={handleSignature}
  className="w-full h-32 border"
/>
```

### Offline Mobile

#### Indicadores Visuais
```jsx
<OfflineIndicator className={cn(
  // Mobile: Banner fixo
  "fixed top-0 left-0 right-0 z-50",
  // Desktop: Corner notification
  "md:absolute md:top-4 md:right-4 md:left-auto"
)} />
```

#### Sync Status
```jsx
<SyncStatus className="fixed bottom-4 right-4 md:relative md:bottom-auto md:right-auto" />
```

## Testes Mobile

### Devices de Teste

#### Smartphones
- **iPhone SE**: 375 × 667px
- **iPhone 12**: 390 × 844px
- **Samsung Galaxy S21**: 360 × 800px
- **Pixel 5**: 393 × 851px

#### Tablets
- **iPad**: 768 × 1024px
- **iPad Pro**: 1024 × 1366px
- **Samsung Tab S7**: 800 × 1280px

### Ferramentas de Teste

#### Browser DevTools
```javascript
// Responsive mode
F12 → Toggle device toolbar

// Simulate touch
Settings → Sensors → Touch

// Network throttling
Network tab → Throttling
```

#### Real Device Testing
- **BrowserStack**: Cross-device testing
- **TestFlight**: iOS testing
- **Firebase Test Lab**: Android testing

## Troubleshooting Mobile

### Problemas Comuns

#### "Interface muito pequena"
- Verifique viewport meta tag
- Confirme uso de unidades rem/em
- Teste zoom do navegador

#### "Botões difíceis de tocar"
- Aumente min-height para 44px
- Adicione padding adequado
- Verifique espaçamento entre elementos

#### "Scrolling com problemas"
- Use `-webkit-overflow-scrolling: touch`
- Evite scroll horizontal desnecessário
- Teste em dispositivos reais

#### "Performance lenta"
- Otimize imagens
- Reduza JavaScript
- Use lazy loading

### Debug Mobile

#### Console Remoto
```javascript
// Weinre para debug remoto
// Eruda para console mobile
// iOS Safari: Desenvolvedor → iPhone
```

#### Touch Events Debug
```javascript
// Log touch events
element.addEventListener('touchstart', console.log);
element.addEventListener('touchmove', console.log);
element.addEventListener('touchend', console.log);
```

## Best Practices Mobile

### Do's ✅

1. **Design Mobile First**: Comece sempre pelo mobile
2. **Test Early**: Teste em dispositivos reais cedo
3. **Touch Targets**: Mínimo 44px para elementos tocáveis
4. **Performance**: Otimize para conexões lentas
5. **Offline Support**: Implemente funcionalidade offline
6. **Progressive Enhancement**: Melhore gradualmente

### Don'ts ❌

1. **Hover Effects**: Não use `:hover` como única interação
2. **Small Text**: Evite texto menor que 16px
3. **Complex Navigation**: Mantenha navegação simples
4. **Heavy Animations**: Cuidado com performance
5. **Desktop-Only**: Não teste apenas no desktop
6. **Ignore Gestures**: Aproveite navegação por gestos

### Performance Guidelines

#### Critical Metrics
- **Time to Interactive**: < 5s em 3G
- **Bundle Size**: < 200KB gzipped inicial
- **Memory Usage**: < 50MB durante uso
- **Battery Impact**: Mínimo possível

#### Optimization Checklist
- [ ] Images otimizadas (WebP, tamanhos corretos)
- [ ] Bundle splitting implementado
- [ ] Service worker ativo
- [ ] Critical CSS inline
- [ ] Font loading otimizado
- [ ] JavaScript lazy loading