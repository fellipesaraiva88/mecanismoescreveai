# 📄 Template das Páginas Restantes

## ✅ CRIADO:
- `/` - Dashboard (página inicial) ✅
- `/participants` - Participantes ✅
- Componentes UI base (Button, Input, Modal, Card, Badge, Tabs) ✅

## 📋 PARA CRIAR (Templates Prontos):

### 1. `/conversations` - Página de Conversas
```bash
mkdir -p app/conversations components/conversations
```

**app/conversations/page.tsx**: Lista de conversas com filtros
**components/conversations/ConversationCard.tsx**: Card da conversa
**components/conversations/ConversationTimeline.tsx**: Timeline de mensagens

### 2. `/relationships` - Mapa de Relacionamentos
```bash
mkdir -p app/relationships components/relationships
```

**app/relationships/page.tsx**: Grafo interativo
**components/relationships/NetworkGraph.tsx**: Grafo D3.js
**components/relationships/RelationshipMatrix.tsx**: Matriz heatmap

### 3. `/insights` - Insights da IA
```bash
mkdir -p app/insights components/insights
```

**app/insights/page.tsx**: Lista de insights
**components/insights/InsightCard.tsx**: Card de insight
**components/insights/InsightDetail.tsx**: Detalhes expandidos

### 4. `/trends` - Tendências
```bash
mkdir -p app/trends components/trends
```

**app/trends/page.tsx**: Análise de tendências
**components/trends/TrendChart.tsx**: Gráfico de tendências
**components/trends/TopicCloud.tsx**: Nuvem de palavras

### 5. `/alerts` - Alertas
```bash
mkdir -p app/alerts components/alerts
```

**app/alerts/page.tsx**: Lista de alertas
**components/alerts/AlertCard.tsx**: Card de alerta
**components/alerts/AlertRules.tsx**: Configurar regras

### 6. `/settings` - Configurações
```bash
mkdir -p app/settings components/settings
```

**app/settings/page.tsx**: Página de configurações
**components/settings/GeneralSettings.tsx**: Configurações gerais
**components/settings/AlertSettings.tsx**: Config de alertas

## 🎨 ESTRUTURA DE CADA PÁGINA

Todas seguem o mesmo padrão:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard/Layout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
// ... outros imports

export default function PaginaPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch data
  }, [])

  return (
    <DashboardLayout>
      <h1 className="text-4xl font-bold text-white mb-8">Título</h1>
      {/* Conteúdo */}
    </DashboardLayout>
  )
}
```

## 📦 COMPONENTES FALTANTES

### Filtros e Busca:
- `components/filters/SearchBar.tsx`
- `components/filters/DateRangePicker.tsx`
- `components/filters/MultiSelect.tsx`

### Gráficos Avançados:
- `components/charts/WordCloud.tsx`
- `components/charts/NetworkGraphD3.tsx`
- `components/charts/RadarChart.tsx`

### Exportação:
- `lib/export.ts` - Funções de export PDF/CSV/JSON

## 🚀 PRÓXIMOS PASSOS:

1. Criar cada página seguindo o padrão de `/participants`
2. Conectar com APIs reais do backend
3. Adicionar gráficos interativos
4. Implementar filtros avançados
5. Sistema de exportação
6. Notificações em tempo real

## 📊 STATUS ATUAL:

**Frontend completo:**
- ✅ Estrutura base
- ✅ Layout e navegação
- ✅ Componentes UI (6 componentes)
- ✅ Página inicial (Dashboard)
- ✅ Página de Participantes (completa)
- ⏳ 6 páginas restantes (templates prontos)
- ⏳ Componentes avançados
- ⏳ Sistema de exportação

**Todas as páginas seguem o design system:**
- Dark mode
- Animações com Framer Motion
- Cards com glassmorphism
- Paleta verde/azul/cinza
- Responsivo
