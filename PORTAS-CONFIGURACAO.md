# 🔧 Configuração de Portas - Sistema Analytics

## 📡 Portas Configuráveis

O sistema permite configurar as portas de forma flexível através de variáveis de ambiente.

## ⚙️ Configuração Padrão

```
Backend (API):  3333
Frontend (Web): 3001
Database (PG):  5432
```

## 🚀 Como Configurar Portas Customizadas

### 1️⃣ Backend (API Server)

**Arquivo:** `.env` (raiz do projeto)

```env
# Porta do backend
PORT=3333

# Ou qualquer porta que preferir:
# PORT=8080
# PORT=5000
# PORT=4000
```

**Iniciar backend:**
```bash
npm run dev
# ou
npm run analytics:dev
```

O servidor mostrará a porta no console:
```
╔═══════════════════════════════════════════════════════╗
║   🚀 Server running on port 3333                     ║
╚═══════════════════════════════════════════════════════╝
```

### 2️⃣ Frontend (Next.js)

**Arquivo:** `frontend/.env.local`

```env
# Porta do frontend Next.js
PORT=3001

# URL do backend (atualizar se mudou a porta)
NEXT_PUBLIC_API_URL=http://localhost:3333
```

**Se quiser usar porta diferente:**

```env
# Exemplo: rodar frontend na porta 4000
PORT=4000

# Backend na porta 5000
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Iniciar frontend:**
```bash
cd frontend
npm run dev
```

O Next.js mostrará:
```
- Local:   http://localhost:3001
```

## 🎯 Exemplos de Configuração

### Exemplo 1: Portas Padrão
```env
# Backend (.env)
PORT=3333

# Frontend (frontend/.env.local)
PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3333
```

### Exemplo 2: Portas Customizadas
```env
# Backend (.env)
PORT=8080

# Frontend (frontend/.env.local)
PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Exemplo 3: Produção
```env
# Backend (.env)
PORT=80
NODE_ENV=production

# Frontend (frontend/.env.local)
PORT=3000
NEXT_PUBLIC_API_URL=https://api.seudominio.com
```

## 🔌 Verificar Portas em Uso

### macOS/Linux:
```bash
# Verificar se porta está em uso
lsof -i :3333

# Matar processo em uma porta
kill -9 $(lsof -t -i:3333)

# Ver todas as portas em uso
netstat -an | grep LISTEN
```

### Windows:
```bash
# Verificar porta
netstat -ano | findstr :3333

# Matar processo
taskkill /PID <PID> /F
```

## 🐳 Docker (Opcional)

Se estiver usando Docker, configure no `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "3333:3333"  # porta_host:porta_container
    environment:
      - PORT=3333

  frontend:
    build: ./frontend
    ports:
      - "3001:3001"
    environment:
      - PORT=3001
      - NEXT_PUBLIC_API_URL=http://backend:3333

  database:
    image: postgres:15
    ports:
      - "5432:5432"
```

## 🛠️ Troubleshooting

### Porta já em uso
```bash
# Erro: "EADDRINUSE: address already in use :::3333"

# Solução 1: Mudar a porta no .env
PORT=3334

# Solução 2: Matar o processo
lsof -i :3333
kill -9 <PID>
```

### Frontend não conecta ao Backend
```bash
# Verificar se NEXT_PUBLIC_API_URL está correto
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3333

# Verificar se backend está rodando
curl http://localhost:3333/health
```

### CORS Error
```bash
# Adicionar URL do frontend no backend
# .env
FRONTEND_URL=http://localhost:3001

# Se mudou a porta do frontend, atualizar aqui também
```

## 📋 Checklist de Configuração

- [ ] `.env` criado na raiz com `PORT` do backend
- [ ] `frontend/.env.local` criado com:
  - [ ] `PORT` do frontend
  - [ ] `NEXT_PUBLIC_API_URL` apontando para o backend
- [ ] Portas não estão em conflito com outros serviços
- [ ] Backend rodando (`npm run dev`)
- [ ] Frontend rodando (`cd frontend && npm run dev`)
- [ ] Teste: `curl http://localhost:3333/health`
- [ ] Teste: Abrir `http://localhost:3001` no navegador

## 🌐 URLs Completas

Com configuração padrão:

```
Backend API:
  Health Check:  http://localhost:3333/health
  Dashboard API: http://localhost:3333/api/analytics/dashboard/overview
  Webhook:       http://localhost:3333/webhook/whatsapp

Frontend:
  Dashboard:     http://localhost:3001
  Participantes: http://localhost:3001/participants
  Insights:      http://localhost:3001/insights
```

## 🔐 Produção

Em produção, use variáveis de ambiente do servidor:

```bash
# Render, Vercel, Railway, etc.
PORT=8080
NEXT_PUBLIC_API_URL=https://api.seudominio.com
NODE_ENV=production
```

## ⚡ Quick Start

```bash
# 1. Configurar backend
echo "PORT=3333" > .env

# 2. Configurar frontend
echo "PORT=3001" > frontend/.env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:3333" >> frontend/.env.local

# 3. Iniciar backend (terminal 1)
npm run dev

# 4. Iniciar frontend (terminal 2)
cd frontend && npm run dev

# 5. Acessar
open http://localhost:3001
```

Pronto! Sistema rodando com portas configuradas! 🎉
