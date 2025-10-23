# 🚀 Quick Start - Sistema de Análise Comportamental

## Setup Rápido em 5 Minutos

### 1️⃣ Setup do Database (PostgreSQL)

```bash
# Criar database
createdb whatsapp_analytics

# Rodar migrations
psql whatsapp_analytics < database/schema.sql
psql whatsapp_analytics < database/schema-analytics-extension.sql

# Instalar extensões (se necessário)
psql whatsapp_analytics -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"
psql whatsapp_analytics -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

### 2️⃣ Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL=postgresql://usuario:senha@localhost:5432/whatsapp_analytics

# AI Services
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...  # Opcional, para embeddings

# WhatsApp Evolution API
EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_API_KEY=sua-chave-aqui
EVOLUTION_INSTANCE=saraiva

# Server
PORT=3000
NODE_ENV=development
```

### 3️⃣ Instalar Dependências e Iniciar Backend

```bash
# Instalar dependências
npm install

# Build TypeScript
npm run build

# Iniciar servidor
npm run dev
```

O backend estará rodando em `http://localhost:3000`

### 4️⃣ Iniciar Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar em modo dev
npm run dev
```

O dashboard estará disponível em `http://localhost:3001`

## 🎯 Primeiro Uso

### Integrar com WhatsApp (Evolution API)

1. Configure webhook na Evolution API apontando para:
   ```
   POST http://seu-servidor:3000/webhook/whatsapp
   ```

2. As mensagens começarão a ser processadas automaticamente

3. Acesse o dashboard em `http://localhost:3001`

### Testar Análise de Sentimento

```typescript
import { getSentimentAnalyzer } from './src/features/analytics'

const analyzer = getSentimentAnalyzer()

const result = await analyzer.analyze({
  messageId: 'test-123',
  content: 'Estou muito feliz com os resultados do projeto! 🎉'
})

console.log(result.sentiment)
// {
//   sentimentLabel: 'positive',
//   sentimentScore: 0.85,
//   emotions: { joy: 0.9, ... },
//   confidence: 0.92
// }
```

### Detectar Padrões de um Participante

```typescript
import { getPatternDetector } from './src/features/analytics'

const detector = getPatternDetector()

const patterns = await detector.detectAllPatterns('5511999999999@s.whatsapp.net')

console.log(patterns)
// [
//   {
//     patternType: 'active_hours',
//     patternData: { mostActiveHour: 14, preferredTimeOfDay: 'afternoon', ... }
//   },
//   ...
// ]
```

### Gerar Insights com IA

```typescript
import { getInsightGenerator } from './src/features/analytics'

const generator = getInsightGenerator()

const insights = await generator.generate({
  targetType: 'participant',
  targetId: '5511999999999@s.whatsapp.net',
  insightTypes: ['pattern', 'anomaly', 'trend']
})

console.log(insights)
```

## 📊 Endpoints da API

### Dashboard
```bash
# Overview geral
curl http://localhost:3000/api/analytics/dashboard/overview

# Participantes
curl http://localhost:3000/api/analytics/participants

# Perfil de um participante
curl http://localhost:3000/api/analytics/participants/5511999999999@s.whatsapp.net/profile
```

### Análise de Sentimento
```bash
# Visão geral do sentimento
curl http://localhost:3000/api/analytics/sentiment/overview

# Progressão de sentimento em uma conversa
curl http://localhost:3000/api/analytics/sentiment/conversation/CONVERSATION_JID/progression
```

### Relacionamentos
```bash
# Grafo de relacionamentos
curl http://localhost:3000/api/analytics/relationships/graph

# Relacionamentos mais fortes
curl http://localhost:3000/api/analytics/relationships/strongest
```

### Insights e Alertas
```bash
# Insights ativos
curl http://localhost:3000/api/analytics/insights

# Alertas não lidos
curl http://localhost:3000/api/analytics/alerts
```

## 🎨 Personalização do Dashboard

### Adicionar Novos Widgets

1. Criar componente em `frontend/components/charts/`
2. Importar e usar em `frontend/app/page.tsx`
3. Criar endpoint na API se necessário

### Customizar Cores

Edite `frontend/app/globals.css`:

```css
:root {
  --primary: 142 76% 36%;  /* Verde padrão */
  /* Altere para suas cores */
}
```

## 🔧 Troubleshooting

### Database não conecta
```bash
# Verifique se PostgreSQL está rodando
pg_isready

# Teste conexão
psql $DATABASE_URL
```

### Extensão vector não encontrada
```bash
# Instale pgvector
git clone https://github.com/pgvector/pgvector.git
cd pgvector
make
make install

# Em macOS com Homebrew:
brew install pgvector
```

### Claude API retorna erro
- Verifique se `ANTHROPIC_API_KEY` está correta
- Verifique saldo da conta Anthropic
- Teste com: `curl -H "x-api-key: $ANTHROPIC_API_KEY" https://api.anthropic.com/v1/messages`

## 📚 Documentação Completa

Veja `SISTEMA-ANALYTICS-README.md` para documentação detalhada.

## 🆘 Suporte

- GitHub Issues: https://github.com/seu-repo/issues
- Email: saraiva@example.com

---

**Pronto! Seu sistema de análise comportamental está funcionando! 🎉**
