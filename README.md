# EscreverAI 🚀

Sistema modular de workflows em TypeScript para automações, integrações com IA e processamento de dados.

**Transforme suas ideias em código rapidamente** - inspirado em n8n, mas com a flexibilidade e performance de código nativo.

## 📋 Features

- ✅ **Workflows modulares** - Crie fluxos complexos com nodes reutilizáveis
- 🤖 **Integração com LLMs** - Anthropic Claude, Google Gemini, Groq
- 💬 **WhatsApp automatizado** - Via Evolution API
- 🔗 **Webhooks prontos** - Servidor Express configurável
- 🛠️ **Helpers úteis** - Texto, arquivos, arrays, retry logic, cache
- ⚡ **TypeScript nativo** - Type-safe, rápido e fácil de debugar
- 📦 **Zero configuração** - Clone e rode

## 🚀 Quick Start

### Instalação

```bash
# Clone o repositório
git clone <seu-repo>
cd escreveai

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas chaves de API

# Rode em desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
```

### Exemplo Simples

```typescript
import { Workflow, createNode } from './core/workflow.js';
import { AIClientFactory } from './integrations/ai.js';

// Cria um workflow
const workflow = new Workflow('Meu Workflow');

// Adiciona um node de IA
const processAI = createNode('processAI', async (input: string) => {
  const ai = AIClientFactory.createGemini();
  const response = await ai.generate(`Resuma: ${input}`);
  return response.text;
});

workflow.addNode(processAI);

// Executa
const resultado = await workflow.executeNode('processAI', 'Seu texto aqui...');
console.log(resultado);
```

## 📚 Estrutura do Projeto

```
escreveai/
├── src/
│   ├── core/
│   │   └── workflow.ts          # Motor de workflows
│   ├── integrations/
│   │   ├── ai.ts                # Integrações com LLMs
│   │   └── whatsapp.ts          # Cliente WhatsApp
│   ├── server/
│   │   └── webhook.ts           # Servidor de webhooks
│   ├── utils/
│   │   └── helpers.ts           # Funções auxiliares
│   ├── examples/
│   │   ├── ultron-workflow.ts   # Exemplo: workflow Ultron
│   │   └── simple-workflow.ts   # Exemplos simples
│   └── index.ts                 # Entry point
├── package.json
├── tsconfig.json
└── README.md
```

## 🎯 Casos de Uso

### 1. Webhook + IA (Chatbot Simples)

```typescript
import { WebhookServer } from './server/webhook.js';
import { AIClientFactory } from './integrations/ai.js';

const server = new WebhookServer(3000);
const ai = AIClientFactory.createGemini();

server.registerWebhook({
  path: '/chat',
  method: 'POST',
  handler: async (payload) => {
    const response = await ai.generate(payload.message);
    return { reply: response.text };
  },
});

await server.start();
```

### 2. Processamento de Áudio WhatsApp

Veja o exemplo completo em [`src/examples/ultron-workflow.ts`](src/examples/ultron-workflow.ts)

Fluxo:
1. Recebe áudio via webhook
2. Transcreve com Groq Whisper
3. Processa com IA (resumo ou análise detalhada)
4. Responde automaticamente

### 3. Workflow com Condicionais

```typescript
import { Workflow, createCondition } from './core/workflow.js';

const workflow = new Workflow('Condicional');

const isLongText = createCondition('isLong', (text: string) => {
  return text.length > 500;
});

const result = await workflow.executeConditional(
  input,
  isLongText,
  ['processLong'],   // Se verdadeiro
  ['processShort']   // Se falso
);
```

## 🔧 Configuração

### Variáveis de Ambiente

```bash
# Server
PORT=3000
NODE_ENV=development

# Supabase (opcional)
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key

# AI Models
ANTHROPIC_API_KEY=your_key
GROQ_API_KEY=your_key
GOOGLE_AI_KEY=your_key

# WhatsApp / Evolution API
EVOLUTION_API_URL=your_url
EVOLUTION_API_KEY=your_key
```

## 📖 Documentação dos Módulos

### Core - Workflow

Sistema modular para criar fluxos de processamento:

```typescript
import { Workflow, createNode, createCondition } from './core/workflow.js';

// Criar workflow
const workflow = new Workflow('Nome');

// Adicionar node
const node = createNode('nomedo-node', async (input, context) => {
  // Sua lógica aqui
  return output;
});

workflow.addNode(node);

// Executar
await workflow.executeNode('nome-do-node', input);
await workflow.execute(input, ['node1', 'node2', 'node3']);
```

### Integrations - AI

Clientes para diferentes LLMs:

```typescript
import { AIClientFactory, Prompts } from './integrations/ai.js';

// Groq (transcrição + LLM rápido)
const groq = AIClientFactory.createGroq();
const transcription = await groq.transcribeAudio(audioBuffer);
const response = await groq.generate('Seu prompt');

// Google Gemini (via LangChain)
const gemini = AIClientFactory.createGemini();
const response = await gemini.generate('Seu prompt');

// Anthropic Claude
const claude = AIClientFactory.createAnthropic();
const response = await claude.generate('Seu prompt', {
  systemPrompt: 'Você é um assistente...'
});
```

### Integrations - WhatsApp

Cliente para Evolution API:

```typescript
import { WhatsAppClient, WhatsAppFormatter } from './integrations/whatsapp.js';

const client = new WhatsAppClient(url, apiKey, instance);

// Enviar mensagem
await client.sendText('5511999999999@s.whatsapp.net', 'Olá!');

// Enviar mídia
await client.sendMedia(number, mediaUrl, 'Legenda');

// Helpers
WhatsAppClient.isGroup(jid);
WhatsAppClient.isPrivate(jid);
WhatsAppClient.isAudioMessage(message);

// Formatação
WhatsAppFormatter.bold('texto');
WhatsAppFormatter.italic('texto');
WhatsAppFormatter.truncateWithReadMore(texto, 300);
```

### Server - Webhook

Servidor Express configurado:

```typescript
import { WebhookServer } from './server/webhook.js';

const server = new WebhookServer(3000);

// Webhook genérico
server.registerWebhook({
  path: '/webhook/custom',
  method: 'POST',
  handler: async (payload, req, res) => {
    // Sua lógica
  }
});

// Webhook WhatsApp
server.onWhatsApp('/webhook/whatsapp', async (payload) => {
  // Processa mensagem do WhatsApp
});

// Health check
server.setupHealthCheck('/health');

await server.start();
```

### Utils - Helpers

Funções úteis para o dia a dia:

```typescript
import { Text, Time, File, Arrays, retry, SimpleCache } from './utils/helpers.js';

// Texto
Text.truncate(text, 100);
Text.clean(text);
Text.wordCount(text);
Text.slugify(text);

// Tempo
await Time.sleep(1000);
Time.formatDuration(300); // "5m 0s"

// Arquivos
const buffer = await File.download(url);
const hash = File.md5(buffer);
const base64 = File.toBase64(buffer);

// Arrays
Arrays.chunk([1,2,3,4,5], 2); // [[1,2], [3,4], [5]]
Arrays.unique([1,1,2,3,3]); // [1,2,3]

// Retry
await retry(async () => {
  // Operação que pode falhar
}, { maxAttempts: 3, delayMs: 1000 });

// Cache
const cache = new SimpleCache();
cache.set('key', value, 60000); // TTL 1min
const cached = cache.get('key');
```

## 🎨 Como Adaptar para Suas Ideias

### Passo 1: Defina o Fluxo

Desenhe mentalmente (ou no papel) o fluxo:

```
Webhook → Validação → Processamento → IA → Resposta
```

### Passo 2: Crie os Nodes

```typescript
const validate = createNode('validate', (input) => {
  if (!input.data) throw new Error('Inválido');
  return input.data;
});

const process = createNode('process', async (data) => {
  // Sua lógica de processamento
  return processedData;
});

const sendResponse = createNode('send', async (data) => {
  await api.send(data);
  return { success: true };
});
```

### Passo 3: Monte o Workflow

```typescript
const workflow = new Workflow('MeuFluxo');

workflow
  .addNode(validate)
  .addNode(process)
  .addNode(sendResponse);

await workflow.execute(input, ['validate', 'process', 'send']);
```

### Passo 4: Integre com Webhook

```typescript
const server = new WebhookServer(3000);

server.registerWebhook({
  path: '/meu-webhook',
  method: 'POST',
  handler: async (payload) => {
    const workflow = createMeuWorkflow();
    return await workflow.execute(payload, [...]);
  }
});

await server.start();
```

## 🧪 Exemplos Prontos

Execute os exemplos:

```bash
# Exemplos simples
npm run dev src/examples/simple-workflow.ts

# Servidor com webhook Ultron
npm run dev
```

## 🤝 Como Usar com Este Sistema

### Cenário 1: "Quero processar mensagens do WhatsApp com IA"

```typescript
// 1. Use o exemplo Ultron como base
import { handleUltronWebhook } from './examples/ultron-workflow.js';

// 2. Customize os prompts em src/integrations/ai.ts
export const Prompts = {
  MEU_PROMPT: `Você faz X, Y, Z...`
};

// 3. Ajuste o workflow em src/examples/ultron-workflow.ts
const processWithAI = createNode('processAI', async (data) => {
  const response = await ai.generateWithTemplate(
    Prompts.MEU_PROMPT,
    { ...data }
  );
  return response.text;
});

// 4. Configure o webhook no Evolution API para apontar para seu servidor
```

### Cenário 2: "Quero criar uma automação customizada"

```typescript
// 1. Crie um novo arquivo em src/workflows/meu-workflow.ts
import { Workflow, createNode } from '../core/workflow.js';

export function createMeuWorkflow() {
  const workflow = new Workflow('MeuWorkflow');

  // Seus nodes aqui...

  return workflow;
}

// 2. Registre no src/index.ts
import { createMeuWorkflow } from './workflows/meu-workflow.js';

server.registerWebhook({
  path: '/meu-endpoint',
  method: 'POST',
  handler: async (payload) => {
    const workflow = createMeuWorkflow();
    return await workflow.execute(payload, [...]);
  }
});
```

### Cenário 3: "Quero apenas usar as integrações de IA"

```typescript
import { AIClientFactory } from './integrations/ai.js';

// Simples assim!
const ai = AIClientFactory.createGemini();
const response = await ai.generate('Minha pergunta...');
console.log(response.text);
```

## 🎯 Próximos Passos

Sugestões de melhorias que você pode adicionar:

- [ ] Integração com Supabase (database)
- [ ] Sistema de filas (Bull/BullMQ)
- [ ] Logs estruturados (Winston/Pino)
- [ ] Monitoramento (Sentry)
- [ ] Testes automatizados (Vitest)
- [ ] Deploy automatizado (Docker/Railway/Vercel)
- [ ] Interface visual (próxima etapa)

## 📝 Licença

MIT

## 🙋‍♂️ Suporte

Dúvidas? Abra uma issue ou entre em contato!

---

**Feito com ❤️ para acelerar suas ideias** 🚀
