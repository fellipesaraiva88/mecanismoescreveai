# 🚀 EXECUTAR O SISTEMA AGORA - Guia Completo

## ⚠️ PostgreSQL Não Está Rodando

Detectamos que o PostgreSQL não está ativo. Você tem **3 opções**:

---

## 🎯 OPÇÃO 1: Iniciar PostgreSQL (Recomendado)

### macOS:
```bash
# Se instalou via Homebrew:
brew services start postgresql@15

# Verificar se está rodando:
brew services list | grep postgresql

# Ou iniciar manualmente:
pg_ctl -D /usr/local/var/postgres start
```

### Linux:
```bash
# Ubuntu/Debian:
sudo service postgresql start

# ou
sudo systemctl start postgresql

# Verificar status:
sudo systemctl status postgresql
```

### Depois que PostgreSQL estiver rodando:
```bash
# 1. Criar database
createdb whatsapp_analytics

# 2. Rodar schema
psql whatsapp_analytics < database/schema.sql
psql whatsapp_analytics < database/schema-analytics-extension.sql

# 3. Popular com dados
npm run build
tsx src/scripts/setup-and-populate.ts

# 4. Iniciar backend (terminal 1)
npm run dev

# 5. Iniciar frontend (terminal 2)
cd frontend && npm run dev

# 6. Acessar
open http://localhost:3001
```

---

## 🐳 OPÇÃO 2: Usar Docker (Mais Fácil)

### Criar docker-compose.yml:
```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: whatsapp_analytics
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: senha123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database:/docker-entrypoint-initdb.d

volumes:
  postgres_data:
```

### Executar:
```bash
# Iniciar PostgreSQL
docker-compose up -d

# Aguardar 5 segundos
sleep 5

# Popular dados
tsx src/scripts/setup-and-populate.ts

# Iniciar backend
npm run dev

# Iniciar frontend (outro terminal)
cd frontend && npm run dev
```

---

## ☁️ OPÇÃO 3: Usar Supabase (Grátis na Nuvem)

### 1. Criar conta no Supabase:
- Acesse: https://supabase.com
- Crie um projeto gratuito
- Copie a "Connection String" em Settings > Database

### 2. Configurar .env:
```bash
# Cole sua connection string do Supabase
echo "DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" > .env
echo "PORT=3333" >> .env
echo "FRONTEND_URL=http://localhost:3001" >> .env
```

### 3. Rodar schema no Supabase:
- No Supabase Dashboard, vá em "SQL Editor"
- Cole o conteúdo de `database/schema.sql`
- Execute
- Cole o conteúdo de `database/schema-analytics-extension.sql`
- Execute

### 4. Popular e iniciar:
```bash
# Popular dados
tsx src/scripts/setup-and-populate.ts

# Iniciar backend
npm run dev

# Iniciar frontend
cd frontend && npm run dev
```

---

## 🎬 OPÇÃO 4: DEMO MODE (Sem Database)

Se você só quer ver a interface funcionando:

### 1. Criar arquivo de mock data:
```bash
cat > src/features/analytics/core/mock-data.ts << 'EOF'
export const mockDashboardData = {
  metrics: {
    total_conversations: 3,
    total_participants: 8,
    total_messages: 156,
    avg_message_length: 45.2
  },
  alerts: [
    {
      id: 1,
      title: "Sentimento negativo detectado",
      message: "Foram detectadas mensagens negativas no grupo Trabalho",
      severity: "warning",
      triggeredAt: new Date().toISOString()
    }
  ],
  insights: [
    {
      id: 1,
      title: "Horário de pico identificado",
      description: "A equipe está mais ativa entre 14h e 16h",
      severity: "info",
      confidence: 0.85,
      insightType: "pattern"
    }
  ]
}
EOF
```

### 2. Modificar API para retornar mock:
```bash
# Editar src/features/analytics/dashboard/api.ts
# Descomentar a seção de mock data
```

### 3. Iniciar apenas o frontend:
```bash
cd frontend
npm run dev
```

---

## ✅ VERIFICAR SE ESTÁ FUNCIONANDO

### Backend:
```bash
# Deve retornar {"status":"ok"}
curl http://localhost:3333/health
```

### Frontend:
```bash
# Abrir navegador
open http://localhost:3001
```

---

## 🆘 PROBLEMAS COMUNS

### "Porta já em uso"
```bash
# Matar processo na porta 3333
kill -9 $(lsof -t -i:3333)

# Ou usar outra porta
echo "PORT=8080" > .env
```

### "Database connection error"
```bash
# Verificar se PostgreSQL está rodando
pg_isready

# Verificar DATABASE_URL no .env
cat .env | grep DATABASE_URL
```

### "Module not found"
```bash
# Reinstalar dependências
rm -rf node_modules
npm install

cd frontend
rm -rf node_modules
npm install
```

---

## 🎉 RESUMO RÁPIDO

### Se PostgreSQL estiver instalado:
```bash
brew services start postgresql@15  # macOS
createdb whatsapp_analytics
psql whatsapp_analytics < database/schema.sql
psql whatsapp_analytics < database/schema-analytics-extension.sql
tsx src/scripts/setup-and-populate.ts
npm run dev &
cd frontend && npm run dev
```

### Se não tiver PostgreSQL:
```bash
# Use Docker (opção 2) ou Supabase (opção 3)
```

### Só ver a interface:
```bash
cd frontend && npm run dev
# Abrir: http://localhost:3001
```

---

**Escolha a opção que melhor se adequa ao seu ambiente!** 🚀
