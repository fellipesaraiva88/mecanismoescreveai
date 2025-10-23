# 📊 Sistema de Análise Comportamental - WhatsApp Edition

Sistema completo de análise comportamental para conversas do WhatsApp, com inteligência artificial, insights automáticos e visualizações interativas.

## 🎯 Visão Geral

Este sistema captura, processa e analisa conversas do WhatsApp em tempo real, fornecendo:

- **Análise de Sentimento** com IA (Claude/OpenAI)
- **Detecção de Padrões Comportamentais**
- **Mapa de Relacionamentos** (Grafo Social)
- **Insights Automáticos** gerados por IA
- **Alertas Inteligentes**
- **Memórias e Busca Semântica** (RAG)
- **Dashboard Interativo** com UX/UI moderna

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    WHATSAPP (Evolution API)                  │
└──────────────────────┬──────────────────────────────────────┘
                       │ Webhooks
┌──────────────────────▼──────────────────────────────────────┐
│                  MESSAGE PROCESSOR                           │
│  - Captura mensagens em tempo real                          │
│  - Normaliza dados do WhatsApp                              │
│  - Dispara eventos para análises                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼────┐  ┌──────▼────┐  ┌─────▼─────┐
│ SENTIMENT  │  │  PATTERN  │  │ RELATION  │
│ ANALYZER   │  │ DETECTOR  │  │ BUILDER   │
│ (Claude)   │  │           │  │           │
└───────┬────┘  └──────┬────┘  └─────┬─────┘
        │              │              │
        └──────────────┼──────────────┘
                       │
        ┌──────────────▼──────────────┐
        │    INSIGHT GENERATOR (AI)    │
        │    ALERT ENGINE              │
        │    MEMORY EXTRACTOR          │
        └──────────────┬──────────────┘
                       │
        ┌──────────────▼──────────────┐
        │     POSTGRESQL DATABASE      │
        │  - Messages & Conversations  │
        │  - Sentiment Analysis        │
        │  - Behavior Patterns         │
        │  - Relationships & Clusters  │
        │  - AI Insights & Alerts      │
        │  - Memories (with vectors)   │
        └──────────────┬──────────────┘
                       │
        ┌──────────────▼──────────────┐
        │      REST API (Express)      │
        └──────────────┬──────────────┘
                       │
        ┌──────────────▼──────────────┐
        │   FRONTEND (Next.js/React)   │
        │  - Dashboard Interativo      │
        │  - Gráficos e Visualizações  │
        │  - Real-time Updates         │
        └──────────────────────────────┘
```

## 📁 Estrutura do Projeto

```
escreveai/
├── database/
│   ├── schema.sql                    # Schema base
│   └── schema-analytics-extension.sql # Schema completo de analytics
│
├── src/
│   ├── features/
│   │   └── analytics/
│   │       ├── core/
│   │       │   ├── types.ts                  # Tipos TypeScript completos
│   │       │   ├── database-service.ts       # Camada de acesso ao DB
│   │       │   └── message-processor.ts      # Processamento de mensagens
│   │       │
│   │       ├── sentiment/
│   │       │   └── sentiment-analyzer.ts     # Análise de sentimento com IA
│   │       │
│   │       ├── metrics/
│   │       │   └── pattern-detector.ts       # Detecção de padrões
│   │       │
│   │       ├── relationships/
│   │       │   └── relationship-builder.ts   # Grafo de relacionamentos
│   │       │
│   │       ├── insights/
│   │       │   └── insight-generator.ts      # Geração de insights com IA
│   │       │
│   │       ├── alerts/
│   │       │   └── alert-engine.ts           # Motor de alertas
│   │       │
│   │       └── dashboard/
│   │           └── api.ts                    # APIs REST
│   │
│   └── integrations/
│       └── whatsapp.ts                       # Integração Evolution API
│
└── frontend/                                  # Dashboard Next.js
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   └── globals.css
    │
    ├── components/
    │   ├── dashboard/
    │   │   ├── Layout.tsx
    │   │   ├── MetricCard.tsx
    │   │   ├── InsightsList.tsx
    │   │   ├── AlertsList.tsx
    │   │   └── TopParticipants.tsx
    │   │
    │   └── charts/
    │       ├── SentimentChart.tsx
    │       ├── ActivityHeatmap.tsx
    │       └── RelationshipGraph.tsx
    │
    ├── package.json
    ├── tailwind.config.ts
    └── tsconfig.json
```

## 🚀 Instalação e Configuração

### 1. Backend (Node.js + PostgreSQL)

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Editar .env com suas credenciais:
# - DATABASE_URL
# - ANTHROPIC_API_KEY (Claude)
# - OPENAI_API_KEY (opcional)
# - EVOLUTION_API_URL
# - EVOLUTION_API_KEY

# Criar database e rodar migrations
psql -U postgres -c "CREATE DATABASE whatsapp_analytics;"
psql -U postgres -d whatsapp_analytics -f database/schema.sql
psql -U postgres -d whatsapp_analytics -f database/schema-analytics-extension.sql

# Iniciar servidor
npm run dev
```

### 2. Frontend (Next.js)

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar em modo desenvolvimento
npm run dev

# Acesse: http://localhost:3001
```

## 📊 Funcionalidades Principais

### 1. Painel Principal (Dashboard)

- **Métricas em tempo real**: Total de conversas, participantes, mensagens
- **Sentimento geral**: Score médio de sentimento das conversas
- **Alertas ativos**: Notificações de anomalias e mudanças importantes
- **Insights da IA**: Descobertas automáticas sobre padrões e tendências

### 2. Análise de Sentimento

- Análise por mensagem usando Claude AI
- Detecção de 6 emoções: alegria, tristeza, raiva, medo, surpresa, nojo
- Score de -1.00 (muito negativo) a +1.00 (muito positivo)
- Progressão de sentimento ao longo do tempo
- Identificação de picos emocionais
- Detecção de mudanças bruscas de humor

### 3. Padrões Comportamentais

**Horários Ativos:**
- Distribuição de mensagens por hora
- Período do dia preferido (manhã/tarde/noite)
- Dias da semana mais ativos

**Tempo de Resposta:**
- Tempo médio, mediano, mínimo e máximo
- Classificação: muito rápido, rápido, moderado, lento
- Taxa de resposta

**Frequência de Mensagens:**
- Mensagens por dia/semana
- Tendência: crescente, decrescente, estável
- Detecção de mudanças de padrão

### 4. Mapa de Relacionamentos

- **Grafo interativo** mostrando conexões entre participantes
- Força do relacionamento baseada em:
  - Número de interações
  - Grupos em comum
  - Tempo de resposta mútuo
- Visualização por sentimento (cores)
- Detecção de clusters de afinidade

### 5. Insights com IA

**Tipos de Insights:**
- **Padrões**: Comportamentos recorrentes identificados
- **Anomalias**: Mudanças significativas
- **Tendências**: Tópicos em ascensão, mudanças de sentimento
- **Recomendações**: Sugestões de ações

**Exemplos:**
- "Sentimento de João caiu 40% nos últimos 7 dias"
- "Novo cluster de afinidade detectado: 5 pessoas discutindo 'projeto X'"
- "Tendência emergente: menções a 'viagem' aumentaram 200%"

### 6. Alertas Inteligentes

**Regras Configuráveis:**
- Sentimento muito negativo (< -0.7)
- Queda brusca de atividade
- Mudanças comportamentais significativas
- Palavras-chave específicas

**Níveis de Severidade:**
- Info (informativo)
- Warning (atenção necessária)
- Critical (ação urgente)

### 7. Memórias e Contexto (RAG)

- **Extração automática** de informações importantes
- **Busca semântica** usando embeddings vetoriais
- Tipos de memória:
  - Fatos
  - Preferências
  - Decisões
  - Eventos
  - Opiniões
- Score de importância (0.00 a 1.00)
- Tags para organização

## 🎨 Interface do Dashboard

### Design System

**Cores:**
- Verde (Primary): #10b981 - Ações positivas, sentimento positivo
- Azul: Informações neutras
- Amarelo: Avisos, sentimento neutro
- Vermelho: Alertas críticos, sentimento negativo
- Roxo: IA e insights
- Laranja: Notificações e alertas

**Componentes:**
- Cards com efeito glass morphism
- Animações suaves com Framer Motion
- Gráficos interativos com Recharts
- Heatmap de atividade
- Grafo de relacionamentos em canvas

**UX Features:**
- Loading states animados
- Feedback visual em todas as ações
- Tooltips informativos
- Responsive design
- Dark mode nativo

## 📡 APIs Disponíveis

### Dashboard
- `GET /api/analytics/dashboard/overview` - Métricas gerais

### Participantes
- `GET /api/analytics/participants` - Lista participantes
- `GET /api/analytics/participants/:jid/profile` - Perfil completo
- `POST /api/analytics/participants/:jid/analyze` - Analisar padrões

### Sentimento
- `GET /api/analytics/sentiment/overview` - Visão geral
- `GET /api/analytics/sentiment/conversation/:jid/progression` - Progressão
- `GET /api/analytics/sentiment/conversation/:jid/peaks` - Picos emocionais

### Relacionamentos
- `GET /api/analytics/relationships/graph` - Grafo de relacionamentos
- `GET /api/analytics/relationships/strongest` - Relacionamentos mais fortes

### Insights
- `GET /api/analytics/insights` - Lista insights
- `POST /api/analytics/insights/generate` - Gerar novos insights

### Alertas
- `GET /api/analytics/alerts` - Lista alertas
- `POST /api/analytics/alerts/:id/read` - Marcar como lido

### Atividade
- `GET /api/analytics/activity/heatmap` - Mapa de calor
- `GET /api/analytics/activity/trending-topics` - Tópicos em alta

## 🔧 Tecnologias Utilizadas

**Backend:**
- Node.js + TypeScript
- Express.js
- PostgreSQL com extensões:
  - pg_trgm (busca de texto)
  - pgvector (embeddings)
- Anthropic Claude AI
- Evolution API (WhatsApp)

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion (animações)
- Recharts (gráficos)
- Radix UI (componentes)
- Lucide Icons

## 🎯 Casos de Uso

1. **Atendimento ao Cliente**
   - Monitore sentimento dos clientes em tempo real
   - Identifique insatisfações antes que se tornem problemas
   - Analise eficácia da equipe de suporte

2. **Gestão de Equipes**
   - Acompanhe clima organizacional
   - Detecte conflitos emergentes
   - Identifique líderes naturais e influenciadores

3. **Pesquisa e Análise**
   - Estude padrões de comunicação
   - Analise dinâmicas de grupo
   - Extraia insights comportamentais

4. **Marketing e Vendas**
   - Identifique tópicos de interesse
   - Detecte tendências emergentes
   - Analise eficácia de campanhas

## 🔐 Segurança e Privacidade

- Todas as senhas são hasheadas
- Comunicação criptografada (HTTPS)
- Tokens de API protegidos
- Dados sensíveis nunca expostos no frontend
- Conformidade com LGPD/GDPR

## 📈 Performance

- Processamento assíncrono de mensagens
- Cache de métricas para respostas rápidas
- Índices otimizados no PostgreSQL
- Lazy loading no frontend
- Paginação em todas as listagens

## 🚀 Próximos Passos

- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Notificações push em tempo real
- [ ] Integração com outros canais (Telegram, Discord)
- [ ] Machine Learning para predição de tendências
- [ ] Análise de mídia (imagens, áudios, vídeos)
- [ ] Comparação entre períodos
- [ ] Filtros avançados e segmentação

## 📝 Licença

MIT License - Sinta-se livre para usar e modificar!

## 🤝 Contribuindo

Pull requests são bem-vindos! Para mudanças importantes, abra uma issue primeiro.

## 📧 Contato

Para dúvidas ou sugestões: saraiva@example.com

---

**Desenvolvido com ❤️ e muita ☕ por Saraiva**
