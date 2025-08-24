# Guia de Deploy - Sistema de Gestão Integrada 🚀

## Visão Geral

Este guia fornece instruções completas para deploy do Sistema de Gestão Integrada em diferentes ambientes, incluindo configuração de PWA, banco de dados e monitoramento.

## Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração do Ambiente](#configuração-do-ambiente)
3. [Deploy Vercel](#deploy-vercel)
4. [Deploy Netlify](#deploy-netlify)
5. [Deploy Docker](#deploy-docker)
6. [Configuração Supabase](#configuração-supabase)
7. [Domínio Customizado](#domínio-customizado)
8. [Monitoramento](#monitoramento)
9. [CI/CD](#cicd)

## Pré-requisitos

### Ferramentas Necessárias
- **Node.js**: 18.0.0 ou superior
- **npm/yarn**: Gerenciador de pacotes
- **Git**: Controle de versão
- **Conta Supabase**: Backend configurado
- **Conta Vercel/Netlify**: Para deploy (opcional)

### Validação do Ambiente
```bash
# Verificar versões
node --version  # >= 18.0.0
npm --version   # >= 8.0.0
git --version   # Qualquer versão recente

# Verificar build local
npm install
npm run build
npm run preview
```

## Configuração do Ambiente

### Variáveis de Ambiente

#### Produção (.env.production)
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima

# PWA Configuration
VITE_APP_NAME="Sistema de Gestão Integrada"
VITE_APP_SHORT_NAME="LYTOTEC"
VITE_APP_DESCRIPTION="Sistema ERP para construção civil"

# Analytics (opcional)
VITE_GA_TRACKING_ID=GA_MEASUREMENT_ID
VITE_HOTJAR_ID=HOTJAR_SITE_ID

# Debug (apenas desenvolvimento)
VITE_DEBUG_MODE=false
VITE_CONSOLE_LOGS=false
```

#### Staging (.env.staging)
```env
# Supabase Staging
VITE_SUPABASE_URL=https://staging-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=staging_chave_anonima

# PWA Staging
VITE_APP_NAME="Sistema de Gestão - Staging"
VITE_APP_SHORT_NAME="LYTOTEC-STG"

# Debug habilitado
VITE_DEBUG_MODE=true
VITE_CONSOLE_LOGS=true
```

### Build Configuration

#### vite.config.ts
```typescript
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 horas
              }
            }
          }
        ]
      },
      manifest: {
        name: process.env.VITE_APP_NAME,
        short_name: process.env.VITE_APP_SHORT_NAME,
        description: process.env.VITE_APP_DESCRIPTION,
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png', 
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: process.env.NODE_ENV === 'development'
  }
});
```

## Deploy Vercel

### 1. Configuração Inicial

#### Via CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy inicial
vercel

# Deploy de produção
vercel --prod
```

#### Via GitHub Integration
1. **Conectar Repositório**:
   - Acesse [vercel.com](https://vercel.com)
   - Import project → GitHub
   - Selecione o repositório

2. **Configurações do Projeto**:
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   ```

### 2. Configuração de Variáveis

#### Vercel Dashboard
```
Project → Settings → Environment Variables

# Adicionar cada variável:
VITE_SUPABASE_URL=valor
VITE_SUPABASE_ANON_KEY=valor
```

### 3. Build Commands

#### vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "functions": {
    "app/**": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options", 
          "value": "nosniff"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ]
}
```

## Deploy Netlify

### 1. Configuração Inicial

#### Via CLI
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy inicial
netlify deploy

# Deploy de produção
netlify deploy --prod
```

#### Via Interface Web
1. **Conectar Repositório**:
   - Acesse [app.netlify.com](https://app.netlify.com)
   - New site from Git → GitHub
   - Selecione repositório

### 2. Build Settings

#### netlify.toml
```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "8"

# Redirect rules for SPA
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Headers for PWA
[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "no-cache, no-store, must-revalidate"

[[headers]]
  for = "/manifest.json"
  [headers.values]
    Content-Type = "application/manifest+json"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### 3. Environment Variables

#### Netlify Dashboard
```
Site → Settings → Environment Variables

VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

## Deploy Docker

### 1. Dockerfile

#### Multi-stage Build
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy SSL certificates (se necessário)
# COPY ssl/ /etc/nginx/ssl/

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
```

### 2. Nginx Configuration

#### nginx.conf
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html index.htm;

        # Security headers
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        # PWA files
        location = /sw.js {
            add_header Cache-Control "no-cache, no-store, must-revalidate";
            add_header Pragma "no-cache";
            add_header Expires "0";
        }

        location = /manifest.json {
            add_header Content-Type "application/manifest+json";
        }

        # Static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # SPA fallback
        location / {
            try_files $uri $uri/ /index.html;
        }
    }
}
```

### 3. Docker Compose

#### docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "80:80"
      - "443:443"
    environment:
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
    volumes:
      - ./ssl:/etc/nginx/ssl:ro  # SSL certificates
    restart: unless-stopped
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

### 4. Build e Deploy

#### Comandos Docker
```bash
# Build da imagem
docker build -t sistema-gestao .

# Run local
docker run -p 80:80 sistema-gestao

# Deploy com compose
docker-compose up -d

# Logs
docker-compose logs -f
```

## Configuração Supabase

### 1. Configuração de Produção

#### Dashboard Supabase
```
Project → Settings → API

# URLs permitidas
Site URL: https://seu-dominio.com
Additional URLs:
- https://www.seu-dominio.com
- https://staging.seu-dominio.com
```

#### RLS Policies
```sql
-- Verificar todas as políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Verificar tabelas sem RLS
SELECT schemaname, tablename, rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = false;
```

### 2. Performance Optimization

#### Connection Pooling
```sql
-- Configurar no Supabase Dashboard
-- Settings → Database → Connection pooling
-- Mode: Transaction
-- Pool size: 15-25 connections
```

#### Indexes Críticos
```sql
-- Indexes para performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_apontamento_equipe_data 
ON bd_apontamento_equipe(data_registro);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_funcionarios_email 
ON bd_funcionarios(email);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_programacao_data 
ON bd_lista_programacao_entrega(data_entrega);
```

### 3. Backup e Recovery

#### Backup Automático
```bash
# Via CLI Supabase
supabase db dump --db-url $DATABASE_URL > backup.sql

# Via pg_dump
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

## Domínio Customizado

### 1. DNS Configuration

#### A Records
```
Type: A
Name: @
Value: [IP_DO_SERVIDOR]

Type: A  
Name: www
Value: [IP_DO_SERVIDOR]
```

#### CNAME (para Vercel/Netlify)
```
Type: CNAME
Name: www
Value: [PLATAFORMA_ENDPOINT]
```

### 2. SSL Certificate

#### Let's Encrypt (Certbot)
```bash
# Instalar certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com

# Auto-renovação
sudo crontab -e
0 12 * * * /usr/bin/certbot renew --quiet
```

#### Cloudflare SSL
```
1. DNS → Cloudflare Nameservers
2. SSL/TLS → Full (strict)
3. Edge Certificates → Always Use HTTPS
```

### 3. CDN Configuration

#### Cloudflare
```javascript
// Page Rules
*seu-dominio.com/assets/*
- Cache Level: Cache Everything
- Edge Cache TTL: 1 month

*seu-dominio.com/sw.js
- Cache Level: Bypass Cache
```

## Monitoramento

### 1. Error Tracking

#### Sentry Integration
```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.BrowserTracing(),
  ],
  tracesSampleRate: 0.1,
});
```

### 2. Analytics

#### Google Analytics 4
```typescript
// src/lib/analytics.ts
import { gtag } from 'ga-4-react';

export const trackPageView = (path: string) => {
  gtag('config', process.env.VITE_GA_TRACKING_ID, {
    page_path: path,
  });
};

export const trackEvent = (action: string, category: string, label?: string) => {
  gtag('event', action, {
    event_category: category,
    event_label: label,
  });
};
```

### 3. Uptime Monitoring

#### UptimeRobot
```
Monitor Type: HTTPS
URL: https://seu-dominio.com/api/health
Interval: 5 minutes
Alert Contacts: [email, SMS, Slack]
```

#### Health Check Endpoint
```typescript
// api/health.ts
export default function handler(req: Request) {
  return new Response(JSON.stringify({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.VITE_APP_VERSION
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
```

## CI/CD

### 1. GitHub Actions

#### .github/workflows/deploy.yml
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build application
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### 2. Staging Environment

#### staging.yml
```yaml
name: Deploy to Staging

on:
  push:
    branches: [develop]

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Staging
        run: |
          # Deploy commands para staging
          npm run build:staging
        env:
          VITE_SUPABASE_URL: ${{ secrets.STAGING_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.STAGING_SUPABASE_ANON_KEY }}
```

### 3. Quality Gates

#### Pre-deploy Checks
```yaml
  quality-gate:
    runs-on: ubuntu-latest
    steps:
      - name: ESLint
        run: npm run lint
      
      - name: TypeScript Check
        run: npm run type-check
      
      - name: Build Test
        run: npm run build
      
      - name: Unit Tests
        run: npm test
      
      - name: E2E Tests
        run: npm run test:e2e
```

## Troubleshooting

### Problemas Comuns

#### "Build Failed"
```bash
# Limpar cache
rm -rf node_modules package-lock.json
npm install

# Verificar versão Node
node --version

# Build verbose
npm run build -- --verbose
```

#### "Environment Variables não funcionam"
```bash
# Verificar sintaxe
cat .env.production

# Restart do servidor
# Vercel: Redeploy
# Netlify: Clear cache and deploy
```

#### "PWA não atualiza"
```bash
# Verificar Service Worker
# DevTools → Application → Service Workers

# Forçar atualização
# DevTools → Application → Storage → Clear storage
```

#### "SSL Certificate Error"
```bash
# Verificar certificado
openssl s_client -connect seu-dominio.com:443

# Renovar certificado
sudo certbot renew
```

### Logs e Debug

#### Application Logs
```bash
# Vercel
vercel logs [deployment-url]

# Netlify  
netlify logs

# Docker
docker logs [container-id]
```

#### Performance Debug
```bash
# Lighthouse CLI
npm install -g lighthouse
lighthouse https://seu-dominio.com --output html

# Bundle Analysis
npm run build -- --analyze
```

## Checklist de Deploy

### ✅ Pré-Deploy
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Build local funcionando
- [ ] Testes passando
- [ ] SSL configurado
- [ ] DNS configurado

### ✅ Deploy
- [ ] Deploy staging realizado
- [ ] Testes de regressão passando
- [ ] Performance aceitável (Lighthouse > 90)
- [ ] PWA funcionando (manifesto + SW)
- [ ] Funcionalidade offline testada

### ✅ Pós-Deploy
- [ ] Monitoramento ativo
- [ ] Analytics configurado
- [ ] Backup configurado
- [ ] Documentação atualizada
- [ ] Equipe notificada

### ✅ Security Checklist
- [ ] HTTPS obrigatório
- [ ] Headers de segurança configurados
- [ ] RLS policies validadas
- [ ] Secrets não expostos
- [ ] CORS configurado corretamente