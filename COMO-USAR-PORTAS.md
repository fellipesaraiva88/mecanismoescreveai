# 🎯 Como Usar Portas Customizadas - Guia Rápido

## ✅ Sim! Você pode executar em outras portas!

O sistema está 100% configurável. Veja como:

## 🚀 Método 1: Variáveis de Ambiente (Recomendado)

### Backend

**Opção A: Via arquivo `.env`**
```bash
# Criar/editar .env na raiz do projeto
echo "PORT=8080" > .env

# Iniciar
npm run dev
# Servidor rodará em http://localhost:8080
```

**Opção B: Via linha de comando**
```bash
PORT=8080 npm run dev
# ou
PORT=5000 npm run analytics:dev
```

### Frontend

**Opção A: Via arquivo `.env.local`**
```bash
# Criar frontend/.env.local
cd frontend
cat > .env.local << EOF
PORT=4000
NEXT_PUBLIC_API_URL=http://localhost:8080
EOF

# Iniciar
npm run dev
# Dashboard em http://localhost:4000
```

**Opção B: Via linha de comando**
```bash
cd frontend
PORT=4000 npm run dev
```

## 📝 Exemplo Completo

### Cenário: Backend na 8080, Frontend na 4000

```bash
# 1. Configurar backend
echo "PORT=8080" > .env

# 2. Configurar frontend
cat > frontend/.env.local << EOF
PORT=4000
NEXT_PUBLIC_API_URL=http://localhost:8080
EOF

# 3. Terminal 1 - Backend
npm run dev
# ✅ Backend rodando em http://localhost:8080

# 4. Terminal 2 - Frontend
cd frontend && npm run dev
# ✅ Frontend rodando em http://localhost:4000
```

## 🎨 Configurações Prontas

### Configuração 1: Portas Padrão (Recomendado)
```env
# .env
PORT=3333

# frontend/.env.local
PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3333
```

### Configuração 2: Desenvolvimento com React (porta 3000)
```env
# .env
PORT=3333

# frontend/.env.local
PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:3333
```

### Configuração 3: Portas Altas (sem conflitos)
```env
# .env
PORT=8080

# frontend/.env.local
PORT=8081
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Configuração 4: Backend em 5000 (comum em Node.js)
```env
# .env
PORT=5000

# frontend/.env.local
PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 🔍 Verificar Portas Disponíveis

### macOS/Linux:
```bash
# Ver portas em uso
lsof -i -P | grep LISTEN

# Verificar porta específica
lsof -i :3333

# Matar processo em porta
kill -9 $(lsof -t -i:3333)
```

### Windows:
```bash
# Ver portas em uso
netstat -ano | findstr LISTENING

# Verificar porta específica
netstat -ano | findstr :3333

# Matar processo
taskkill /PID <PID> /F
```

## ⚡ Quick Start com Portas Customizadas

```bash
# Um comando para configurar tudo
echo "PORT=8080" > .env && \
echo "PORT=4000" > frontend/.env.local && \
echo "NEXT_PUBLIC_API_URL=http://localhost:8080" >> frontend/.env.local

# Iniciar backend
npm run dev

# Em outro terminal, iniciar frontend
cd frontend && npm run dev
```

## 🐛 Troubleshooting

### "Porta já em uso"
```bash
# Erro: EADDRINUSE
# Solução: Mudar a porta
echo "PORT=3334" > .env
```

### "Cannot connect to backend"
```bash
# Verificar se NEXT_PUBLIC_API_URL está correto
cat frontend/.env.local

# Deve mostrar a porta correta do backend
NEXT_PUBLIC_API_URL=http://localhost:3333
```

### CORS Error
```bash
# Adicionar URL do frontend no .env do backend
echo "FRONTEND_URL=http://localhost:4000" >> .env
```

## 📱 URLs Após Iniciar

Com portas customizadas (exemplo: 8080 e 4000):

```
✅ Backend (API):
   Health:     http://localhost:8080/health
   API Docs:   http://localhost:8080/api/analytics
   Webhook:    http://localhost:8080/webhook/whatsapp

✅ Frontend (Dashboard):
   Home:       http://localhost:4000
   Analytics:  http://localhost:4000/analytics
```

## 🎯 Resumo Rápido

| Serviço  | Arquivo Config       | Variável             | Padrão |
|----------|---------------------|----------------------|--------|
| Backend  | `.env`              | `PORT`               | 3333   |
| Frontend | `frontend/.env.local` | `PORT`             | 3001   |
| API URL  | `frontend/.env.local` | `NEXT_PUBLIC_API_URL` | http://localhost:3333 |

## ✨ Pronto!

Agora você pode rodar o sistema em **qualquer porta** que desejar! 🎉

**Dúvidas?** Veja `PORTAS-CONFIGURACAO.md` para mais detalhes.
