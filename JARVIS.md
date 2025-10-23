# 🤖 JARVIS - Assistente Inteligente para WhatsApp

## O que é?

**JARVIS** é um assistente tipo "Tony Stark" para WhatsApp que fica observando suas conversas e age quando você pede.

Diferente de um bot comum, o Jarvis:
- ✅ **Entende comandos** slash (/escreveai, /resumo, etc)
- ✅ **Reage a emojis** (🔊 para transcrever, 📌 para salvar, etc)
- ✅ **É contextual** (entende sobre o que vocês estão falando)
- ✅ **É seletivo** (funciona apenas em grupos autorizados)
- ✅ **Aprende** (memória de conversas para contexto)

## 🚀 Como Usar

### Passo 1: Configurar

Edite o arquivo `src/config/groups.ts` e adicione os grupos que você quer autorizar:

```typescript
export const ALLOWED_GROUPS: GroupConfig[] = [
  {
    jid: '120363404369363372@g.us', // ID do grupo
    name: 'Meu Grupo',
    features: {
      commands: true,        // Habilita comandos /
      reactions: true,       // Habilita reações com emoji
      autoTranscribe: false, // Transcrição automática de TODOS os áudios
      memory: true,          // Salva mensagens para memória
    },
  },
  // Adicione mais grupos aqui...
];
```

**Como descobrir o JID de um grupo?**
1. Entre no grupo
2. Mande `/grupos current` (se você for admin)
3. Copie o JID que aparecer

### Passo 2: Rodar o Jarvis

```bash
npm run dev
```

Você verá:
```
🤖 ================================
🤖   JARVIS BOT INICIANDO...
🤖 ================================

🔐 Inicializando whitelist de grupos...
✅ 1 grupos autorizados
🔧 Inicializando sistema de comandos...
✅ 7 comandos registrados!
🎯 Inicializando sistema de reações...
✅ 6 reações registradas!

✅ Jarvis inicializado com sucesso!
📱 Pronto para receber mensagens do WhatsApp

🚀 Webhook server running on port 3000
📋 Registered routes: POST:/webhook/jarvis, GET:/stats, POST:/webhook/test

✅ Jarvis está online e funcionando!
```

### Passo 3: Configurar Webhook no Evolution API

No seu Evolution API, configure o webhook para:

```
URL: http://seu-servidor:3000/webhook/jarvis
```

Se estiver em desenvolvimento local, use **ngrok** ou **localtunnel**:

```bash
# Ngrok
ngrok http 3000

# Localtunnel
npx localtunnel --port 3000
```

Use a URL gerada no Evolution API.

## 📱 Comandos Disponíveis

### 🎵 Comandos de Áudio

#### `/escreveai [start|stop]`
Ativa ou desativa transcrição automática de áudios.

**Exemplos:**
```
/escreveai start     → Começa a transcrever todos os áudios
/escreveai stop      → Para de transcrever
/escreveai           → Mostra status atual
```

**Uso:**
- Em grupos: todos os áudios serão transcritos
- Em privado: só áudios dessa conversa

**Dica:** Se quiser transcrever apenas um áudio específico, use a reação 🔊 (veja abaixo)

### 💾 Comandos de Memória

#### `/resumo [quantidade]`
Gera resumo da conversa recente.

**Exemplos:**
```
/resumo              → Resume últimas 50 mensagens
/resumo 100          → Resume últimas 100 mensagens
```

#### `/salvos [buscar <termo>]`
Lista ou busca em mensagens salvas.

**Exemplos:**
```
/salvos              → Lista todas as mensagens salvas
/salvos buscar rua   → Busca mensagens salvas com "rua"
```

**Como salvar:** Reaja com 📌 em qualquer mensagem!

#### `/contexto`
Explica o contexto da conversa atual (quem está falando sobre o que, tópicos principais).

### 🔍 Comandos de Busca

#### `/buscar <termo ou pergunta>`
Busca semântica em conversas passadas.

**Exemplos:**
```
/buscar aquela reunião sobre o projeto
/buscar quando falamos sobre delivery
```

*Em desenvolvimento - busca semântica com RAG*

### 🛠️ Comandos Utilitários

#### `/ajuda [categoria]`
Mostra todos os comandos disponíveis.

**Exemplos:**
```
/ajuda               → Todos os comandos
/ajuda audio         → Só comandos de áudio
/ajuda memory        → Só comandos de memória
```

#### `/ping`
Testa se o bot está online.

### 👑 Comandos Admin

#### `/grupos [subcomando]`
Gerencia grupos autorizados (**apenas admin**).

**Subcomandos:**
```
/grupos list                        → Lista grupos autorizados
/grupos current                     → Mostra JID do grupo atual
/grupos add <jid> <nome>           → Adiciona grupo
/grupos remove <jid>               → Remove grupo
```

**Exemplo completo:**
```
# No grupo que você quer autorizar:
/grupos current

# Resposta:
# 📍 Grupo Atual
# JID: `120363404369363372@g.us`
# Status: ❌ Não autorizado

# Copie o JID e adicione:
/grupos add 120363404369363372@g.us Meu Grupo Legal

# ✅ Grupo "Meu Grupo Legal" adicionado à whitelist!
```

## 🎨 Reações Disponíveis

Em vez de comandos, você pode **reagir** em mensagens com emojis para ações rápidas:

### 🔊 Transcrever Áudio
**O que faz:** Transcreve aquele áudio específico

**Como usar:**
1. Alguém manda um áudio
2. Você reage com 🔊
3. O bot transcreve e responde

### 📌 Salvar Mensagem
**O que faz:** Salva a mensagem como importante

**Como usar:**
1. Reaja com 📌 em qualquer mensagem
2. Use `/salvos` para ver depois

### 📝 Resumir Thread
**O que faz:** Gera resumo da conversa relacionada

**Como usar:**
1. Reaja com 📝 em uma mensagem
2. O bot resume a thread/conversa

### ❓ Explicar Contexto
**O que faz:** IA explica o que a pessoa quis dizer

**Como usar:**
1. Reaja com ❓ em mensagem confusa
2. IA explica o contexto

### 🔍 Buscar Relacionadas
**O que faz:** Busca mensagens sobre o mesmo assunto

**Como usar:**
1. Reaja com 🔍 em uma mensagem
2. Bot busca mensagens relacionadas

*Em desenvolvimento*

### 🎯 Criar Tarefa
**O que faz:** Cria lembrete baseado na mensagem

**Como usar:**
1. Reaja com 🎯 em uma mensagem
2. Bot cria tarefa/lembrete

*Em desenvolvimento*

## 🔐 Sistema de Whitelist

O Jarvis **só funciona** em:
- ✅ Grupos autorizados (whitelist)
- ✅ Conversas privadas (se permitido na config)
- ✅ Sempre para o admin principal

### Configuração Atual

Arquivo: `src/config/groups.ts`

```typescript
export const BOT_CONFIG = {
  // Seu número (admin principal)
  adminNumber: '5511991143605@s.whatsapp.net',

  // Permitir conversas privadas?
  allowPrivateChats: true,

  // Permitir grupos não autorizados se você for o dono?
  allowUnauthorizedGroupsForOwner: true,
};
```

### Features por Grupo

Cada grupo pode ter features específicas ativadas/desativadas:

```typescript
{
  commands: true,        // Comandos / habilitados
  reactions: true,       // Reações com emoji habilitadas
  autoTranscribe: false, // Transcrição automática de áudios
  memory: true,          // Salvar mensagens para memória
}
```

## 🧠 Inteligência Contextual

*(Em desenvolvimento)*

O Jarvis será capaz de:

- 🎯 **Detectar perguntas não respondidas** e lembrar você
- 💡 **Sugerir ações** baseado no contexto ("Parece que vocês estão marcando reunião, quer que eu ajude?")
- 📊 **Análise de sentimento** da conversa
- 🔮 **Ser proativo** quando identificar oportunidades

## 📊 Endpoints da API

### `GET /health`
Health check do servidor

**Resposta:**
```json
{
  "status": "ok",
  "uptime": 123.45,
  "timestamp": "2025-10-23T00:00:00.000Z"
}
```

### `POST /webhook/jarvis`
Webhook principal (configure no Evolution API)

**Aceita:** Todos os eventos do WhatsApp
**Processa:**
- Comandos slash
- Reações com emoji
- Áudios (transcrição)
- Mensagens (memória)

### `GET /stats`
Estatísticas do Jarvis

**Resposta:**
```json
{
  "success": true,
  "stats": "texto formatado",
  "text": "🤖 JARVIS - Status..."
}
```

## 🎯 Próximas Features

### Fase 2 (Em Desenvolvimento)
- [ ] 💾 Memória persistente no Supabase
- [ ] 📝 Sistema de mensagens salvas completo
- [ ] 🔍 Busca semântica (RAG + Vector Search)
- [ ] 🎯 Sistema de tarefas/lembretes

### Fase 3 (Planejado)
- [ ] 🧠 Análise contextual avançada
- [ ] 💡 Sugestões proativas
- [ ] 📊 Dashboard web
- [ ] 📈 Analytics de conversas

## 🐛 Troubleshooting

### Bot não responde

**Verifique:**
1. Grupo está na whitelist? (`/grupos current`)
2. Servidor está rodando? (veja logs)
3. Webhook configurado? (Evolution API)
4. URL correta? (ngrok/localtunnel se local)

### Comandos não funcionam

**Verifique:**
1. Começa com `/`? (`/ajuda` e não `ajuda`)
2. Feature `commands` está habilitada no grupo?
3. Você é admin (para comandos admin)?

### Reações não funcionam

**Verifique:**
1. Feature `reactions` está habilitada?
2. Emoji correto? (🔊 exato, não variações)
3. Mensagem tem menos de 30 dias?

### Áudios não transcrevem

**Verifique:**
1. GROQ_API_KEY configurada?
2. Feature `autoTranscribe` ativada OU usou `/escreveai start`?
3. Áudio é válido?

## 💡 Dicas

### 1. Use Reações para Ações Rápidas
Em vez de `/escreveai` para cada áudio, reaja com 🔊 no específico que quer transcrever.

### 2. Salve Mensagens Importantes
Reaja com 📌 em mensagens importantes e depois use `/salvos` para encontrar.

### 3. Use `/resumo` Regularmente
Em grupos ativos, use `/resumo` para se atualizar do que rolou.

### 4. Configure Features por Grupo
Grupos de trabalho: tudo ativado
Grupos de amigos: só reações
Família: só transcrição

## 🔧 Desenvolvimento

### Adicionar Novo Comando

1. Crie em `src/features/commands/handlers.ts`:

```typescript
export const meuComando: Command = {
  name: 'meucomando',
  aliases: ['mc'],
  description: 'Faz algo legal',
  usage: '/meucomando <arg>',
  category: 'utility',
  execute: async (context) => {
    return {
      text: `Executei com: ${context.args.join(' ')}`,
      reply: true,
    };
  },
};
```

2. Adicione em `allCommands`:

```typescript
export const allCommands: Command[] = [
  // ... outros
  meuComando,
];
```

3. Pronto! Reinicie o servidor.

### Adicionar Nova Reação

1. Crie em `src/features/reactions/actions.ts`:

```typescript
export const minhaReaction: ReactionAction = {
  emoji: '⭐',
  name: 'Destacar',
  description: 'Destaca a mensagem',
  category: 'utility',
  execute: async (context) => {
    return {
      text: '⭐ Mensagem destacada!',
      replyToMessageId: context.reaction.messageId,
    };
  },
};
```

2. Adicione em `allReactions`:

```typescript
export const allReactions: ReactionAction[] = [
  // ... outros
  minhaReaction,
];
```

---

**Jarvis está pronto para te ajudar! 🚀**

Dúvidas? Abra uma issue ou leia a documentação completa em `README.md`
