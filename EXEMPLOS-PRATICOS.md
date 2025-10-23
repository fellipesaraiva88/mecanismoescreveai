# 🎯 Exemplos Práticos de Uso - Analytics WhatsApp

## 🚀 Cenários de Inicialização

### Cenário 1: Portas Padrão (Mais Comum)

```bash
# Backend: 3333, Frontend: 3001

# Terminal 1
npm run dev

# Terminal 2
cd frontend && npm run dev

# Acessar: http://localhost:3001
```

### Cenário 2: Backend na 5000, Frontend na 3000

```bash
# Configurar
echo "PORT=5000" > .env
echo "PORT=3000" > frontend/.env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" >> frontend/.env.local

# Terminal 1
npm run dev

# Terminal 2
cd frontend && npm run dev
```

### Cenário 3: Tudo em Portas Altas (8080/8081)

```bash
# Configurar
echo "PORT=8080" > .env
echo "PORT=8081" > frontend/.env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8080" >> frontend/.env.local

# Iniciar
npm run dev &
cd frontend && npm run dev
```

### Cenário 4: Usar Porta do Sistema (80/443 - Requer sudo)

```bash
# Backend na porta 80
echo "PORT=80" > .env

# Iniciar com sudo
sudo npm run dev

# Frontend normal
cd frontend && npm run dev
```

## 📊 Exemplos de Uso da API

### 1. Testar Health Check

```bash
# Com porta padrão (3333)
curl http://localhost:3333/health

# Com porta customizada
curl http://localhost:8080/health

# Resposta esperada:
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.456,
  "environment": "development",
  "port": 3333
}
```

### 2. Ver Dashboard Overview

```bash
# Porta padrão
curl http://localhost:3333/api/analytics/dashboard/overview

# Ou no navegador
open http://localhost:3001
```

### 3. Analisar Participante

```bash
# Porta padrão
curl http://localhost:3333/api/analytics/participants/5511999999999@s.whatsapp.net/profile

# Com porta customizada
curl http://localhost:8080/api/analytics/participants/5511999999999@s.whatsapp.net/profile
```

### 4. Webhook do WhatsApp

```bash
# Configurar na Evolution API para apontar para:
# Porta padrão
http://seu-servidor:3333/webhook/whatsapp

# Porta customizada
http://seu-servidor:8080/webhook/whatsapp
```

## 🔧 Múltiplas Instâncias (Diferentes Bancos)

### Instância 1: Produção

```bash
# .env
PORT=3333
DATABASE_URL=postgresql://user:pass@localhost:5432/whatsapp_prod
EVOLUTION_INSTANCE=producao

npm run dev
```

### Instância 2: Desenvolvimento

```bash
# .env.dev
PORT=3334
DATABASE_URL=postgresql://user:pass@localhost:5432/whatsapp_dev
EVOLUTION_INSTANCE=dev

PORT=3334 npm run dev
```

### Instância 3: Testes

```bash
# .env.test
PORT=3335
DATABASE_URL=postgresql://user:pass@localhost:5432/whatsapp_test
EVOLUTION_INSTANCE=teste

PORT=3335 npm run dev
```

## 🎨 Exemplos com Frontend Customizado

### Frontend na porta 3000 (padrão React)

```bash
cd frontend

# Opção 1: .env.local
echo "PORT=3000" > .env.local

# Opção 2: Inline
PORT=3000 npm run dev

# Opção 3: package.json script
npm run dev -- -p 3000
```

### Frontend em múltiplas portas (A/B testing)

```bash
# Frontend A (porta 3001)
cd frontend
PORT=3001 npm run dev &

# Frontend B (porta 3002)
PORT=3002 npm run dev &

# Ambos apontando para o mesmo backend (3333)
```

## 🐳 Docker Examples

### docker-compose.yml com portas customizadas

```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "8080:8080"  # Host:Container
    environment:
      - PORT=8080
      - DATABASE_URL=postgresql://postgres:senha@db:5432/whatsapp

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - NEXT_PUBLIC_API_URL=http://localhost:8080

  db:
    image: postgres:15
    ports:
      - "5433:5432"  # Usando 5433 no host para evitar conflito
```

Iniciar:
```bash
docker-compose up

# Acessar:
# Backend:  http://localhost:8080
# Frontend: http://localhost:3000
```

## 🌐 Reverse Proxy (Nginx)

### Nginx Config para Produção

```nginx
# /etc/nginx/sites-available/analytics

upstream backend {
    server localhost:3333;
}

upstream frontend {
    server localhost:3001;
}

server {
    listen 80;
    server_name analytics.seudominio.com;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Webhook
    location /webhook {
        proxy_pass http://backend;
    }
}
```

Com isso, você acessa:
- Frontend: `http://analytics.seudominio.com`
- API: `http://analytics.seudominio.com/api`

## 🔐 SSL/HTTPS (Certbot)

```bash
# Instalar certbot
sudo apt-get install certbot python3-certbot-nginx

# Gerar certificado
sudo certbot --nginx -d analytics.seudominio.com

# Nginx irá automaticamente redirecionar HTTP -> HTTPS
# Atualizar .env
FRONTEND_URL=https://analytics.seudominio.com
```

## 📱 Acesso Externo (Ngrok)

### Para testar webhooks localmente:

```bash
# Backend na porta 3333
npm run dev

# Expor com ngrok
ngrok http 3333

# Saída:
# Forwarding: https://abc123.ngrok.io -> http://localhost:3333

# Configurar webhook:
https://abc123.ngrok.io/webhook/whatsapp
```

## 🎯 PM2 (Produção)

### Rodar backend com PM2

```bash
# Instalar PM2
npm install -g pm2

# Iniciar
pm2 start npm --name "analytics-backend" -- run start

# Ou com porta customizada
PORT=8080 pm2 start npm --name "analytics-backend" -- run start

# Ver logs
pm2 logs analytics-backend

# Reiniciar
pm2 restart analytics-backend

# Auto-start no boot
pm2 startup
pm2 save
```

### PM2 Ecosystem File

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'analytics-backend',
      script: 'dist/server/index.js',
      env: {
        PORT: 3333,
        NODE_ENV: 'production',
      },
    },
    {
      name: 'analytics-frontend',
      script: 'npm',
      args: 'start',
      cwd: './frontend',
      env: {
        PORT: 3001,
      },
    },
  ],
}

// Iniciar: pm2 start ecosystem.config.js
```

## 🧪 Testing com Diferentes Portas

```bash
# Backend teste na 9000
PORT=9000 npm run dev

# Rodar testes apontando para essa porta
API_URL=http://localhost:9000 npm test
```

## 📊 Monitoramento de Portas

```bash
# Script para verificar se serviços estão rodando
#!/bin/bash

check_port() {
    if lsof -i :$1 > /dev/null; then
        echo "✅ Porta $1 está em uso"
    else
        echo "❌ Porta $1 está livre"
    fi
}

check_port 3333  # Backend
check_port 3001  # Frontend
check_port 5432  # PostgreSQL
```

## 🎉 Quick Commands

```bash
# Ver qual processo está usando uma porta
lsof -i :3333

# Matar processo em uma porta
kill -9 $(lsof -t -i:3333)

# Iniciar backend em background
npm run dev > backend.log 2>&1 &

# Verificar logs
tail -f backend.log

# Parar todos os processos Node
pkill -f node

# Ver todas as portas Node em uso
lsof -i -P | grep node
```

## 📝 Resumo dos Comandos Mais Usados

```bash
# Iniciar com portas padrão
npm run dev                      # Backend (3333)
cd frontend && npm run dev       # Frontend (3001)

# Iniciar com portas customizadas
PORT=8080 npm run dev            # Backend (8080)
cd frontend && PORT=4000 npm run dev  # Frontend (4000)

# Verificar health
curl http://localhost:3333/health

# Ver logs em tempo real
npm run dev | tee backend.log
```

Pronto! Agora você tem exemplos para todos os cenários possíveis! 🚀
