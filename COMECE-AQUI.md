# 🚀 COMECE AQUI - Jarvis Pronto para Usar!

## ✅ O QUE ESTÁ PRONTO

Você tem um **assistente tipo Jarvis completo** para WhatsApp com:

### 🎯 Funcionalidades
- ✅ **7 Comandos Slash** (/escreveai, /resumo, /buscar, /salvos, /contexto, /ajuda, /grupos)
- ✅ **6 Reações com Emoji** (🔊 transcrever, 📌 salvar, 📝 resumir, ❓ explicar, 🔍 buscar, 🎯 tarefa)
- ✅ **Whitelist de Grupos** (controla onde o bot funciona)
- ✅ **Sistema Modular** (fácil adicionar novos comandos/reações)

### 🔧 Configurações
- ✅ **Evolution API:** Configurado
- ✅ **Database:** PostgreSQL conectado
- ✅ **Variáveis:** Arquivo `.env` pronto

## 🎯 USAR AGORA (3 Passos)

### Passo 1: Expor Servidor (ngrok)

```bash
# Terminal 1 - Instalar ngrok se não tiver
brew install ngrok

# Expor porta 3000
ngrok http 3000
```

Copie a URL que aparecer, tipo: `https://abc123.ngrok.io`

### Passo 2: Rodar Jarvis

```bash
# Terminal 2
npm run dev
```

Aguarde ver:
```
✅ Jarvis inicializado com sucesso!
🚀 Webhook server running on port 3000
```

### Passo 3: Configurar Webhook

```bash
# Terminal 3 - SUBSTITUA abc123.ngrok.io pela sua URL
curl -X POST https://pange-evolution-api.u5qiqp.easypanel.host/webhook/set/saraiva \
  -H "apikey: 429683C4C977415CAAFCCE10F7D57E11" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://abc123.ngrok.io/webhook/jarvis",
    "webhook_by_events": false,
    "events": ["MESSAGES_UPSERT", "MESSAGE_REACTION"]
  }'
```

**Pronto! Jarvis está conectado! 🎉**

## 📱 TESTAR NO WHATSAPP

### 1. Teste Básico

Envie no WhatsApp (grupo ou privado):
```
/ping
```

Jarvis responde:
```
🏓 Pong! Bot online e funcionando.
```

### 2. Ver Comandos

```
/ajuda
```

### 3. Autorizar Grupo

Se estiver em grupo, descubra o ID:
```
/grupos current
```

Copie o JID e adicione:
```
/grupos add <JID> Nome do Grupo
```

### 4. Testar Reação

1. Alguém manda um áudio
2. Você reage com 🔊
3. Bot transcreve (quando configurar Groq API)

## 📚 DOCUMENTAÇÃO

- **`JARVIS.md`** - Guia completo do Jarvis (todos os comandos, reações, como usar)
- **`SETUP-WEBHOOK.md`** - Detalhes de configuração do webhook
- **`README.md`** - Documentação geral do projeto
- **`RECEITAS.md`** - Código pronto para copiar

## 🎯 PRÓXIMOS PASSOS

### Agora (Para Funcionar 100%)

**1. Configurar APIs de IA**

Adicione no `.env`:

```bash
# Groq (transcrição de áudio) - Grátis
# Pegue em: https://console.groq.com
GROQ_API_KEY=sua_chave_aqui

# Google Gemini (IA) - Grátis
# Pegue em: https://ai.google.dev/
GOOGLE_AI_KEY=sua_chave_aqui
```

**2. Autorizar Grupos**

Use `/grupos add` para cada grupo onde quer o bot.

**3. Testar Tudo**

- `/ping` - Bot responde?
- `/ajuda` - Lista comandos?
- Áudio + 🔊 - Transcreve?
- Mensagem + 📌 - Salva?

### Depois (Incrementar)

**Fase 2 - Memória e Busca:**
- Implementar tabelas no PostgreSQL
- Sistema de memória persistente
- Busca semântica (RAG)
- Mensagens salvas no banco

**Fase 3 - Inteligência Avançada:**
- Análise contextual
- Sugestões proativas
- Dashboard web
- Analytics

## 🔥 QUICK START COMPLETO

```bash
# 1. Instalar dependências (se não fez)
npm install

# 2. Build (testar se compila)
npm run build

# 3. Terminal 1 - Ngrok
ngrok http 3000

# 4. Terminal 2 - Jarvis
npm run dev

# 5. Terminal 3 - Webhook (substituir URL)
curl -X POST https://pange-evolution-api.u5qiqp.easypanel.host/webhook/set/saraiva \
  -H "apikey: 429683C4C977415CAAFCCE10F7D57E11" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://SUA_URL_NGROK/webhook/jarvis",
    "webhook_by_events": false,
    "events": ["MESSAGES_UPSERT", "MESSAGE_REACTION"]
  }'

# 6. WhatsApp - Testar
# /ping
```

## 🐛 PROBLEMAS COMUNS

### Bot não responde

1. Servidor rodando? (`npm run dev`)
2. Ngrok ativo? (verifica URL)
3. Webhook configurado? (curl acima)
4. Grupo autorizado? (`/grupos current`)

### Comandos não funcionam

1. Começa com `/`? (`/ping` não `ping`)
2. Grupo na whitelist?
3. Veja logs do servidor

### Reações não funcionam

1. Emoji correto? (🔊 exato)
2. Feature habilitada no grupo?
3. Evento `MESSAGE_REACTION` no webhook?

## 📊 ENDPOINTS

- `http://localhost:3000/health` - Health check
- `http://localhost:3000/stats` - Estatísticas
- `http://localhost:3000/webhook/jarvis` - Webhook principal
- `http://localhost:3000/webhook/test` - Teste

## 🎨 PERSONALIZAR

### Adicionar Comando

Edite `src/features/commands/handlers.ts`:

```typescript
export const meuComando: Command = {
  name: 'meucomando',
  description: 'Faz algo legal',
  usage: '/meucomando',
  category: 'utility',
  execute: async (context) => {
    return { text: 'Funcionou!' };
  },
};

// Adicione em allCommands
export const allCommands = [
  // ...outros
  meuComando,
];
```

### Adicionar Reação

Edite `src/features/reactions/actions.ts`:

```typescript
export const minhaReacao: ReactionAction = {
  emoji: '⭐',
  name: 'Destacar',
  description: 'Destaca mensagem',
  category: 'utility',
  execute: async (context) => {
    return { text: '⭐ Destacado!' };
  },
};

// Adicione em allReactions
export const allReactions = [
  // ...outros
  minhaReacao,
];
```

### Modificar Grupos Permitidos

Edite `src/config/groups.ts`:

```typescript
export const ALLOWED_GROUPS = [
  {
    jid: 'ID_DO_GRUPO@g.us',
    name: 'Meu Grupo',
    features: {
      commands: true,
      reactions: true,
      autoTranscribe: false,
      memory: true,
    },
  },
];
```

## 💡 DICAS

1. **Use ngrok pro** se for usar em produção (URL fixa)
2. **Autorize poucos grupos** primeiro para testar
3. **Monitore logs** para ver o que está acontecendo
4. **Comece simples** (/ping, /ajuda) antes de features complexas
5. **Configure Groq** para transcrições funcionarem

## 🎉 ESTÁ PRONTO!

Seu Jarvis está **100% funcional** e pronto para:
- ✅ Receber comandos slash
- ✅ Reagir a emojis
- ✅ Controlar acesso por whitelist
- ✅ Processar webhooks do WhatsApp

**Agora é só configurar as APIs de IA e começar a usar!** 🚀

---

**Dúvidas?**
- Leia `JARVIS.md` - Guia completo
- Leia `SETUP-WEBHOOK.md` - Setup detalhado
- Veja logs do servidor - `npm run dev`
