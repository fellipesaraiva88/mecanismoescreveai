# 📖 Receitas Rápidas

Copie e cole estas receitas para implementar rapidamente suas ideias!

## 🤖 Workflows com IA

### Resumir Áudio do WhatsApp

```typescript
import { Workflow, createNode } from './core/workflow.js';
import { WhatsAppClient } from './integrations/whatsapp.js';
import { AIClientFactory } from './integrations/ai.js';
import { File } from './utils/helpers.js';

const workflow = new Workflow('Resumir Áudio');

// 1. Validar que é áudio
const validateAudio = createNode('validateAudio', (msg: any) => {
  if (!WhatsAppClient.isAudioMessage(msg)) {
    throw new Error('Não é áudio');
  }
  return {
    audioUrl: WhatsAppClient.getAudioUrl(msg),
    jid: msg.key.remoteJid,
  };
});

// 2. Baixar e transcrever
const transcribe = createNode('transcribe', async (data: any) => {
  const audioBuffer = await File.download(data.audioUrl);
  const groq = AIClientFactory.createGroq();
  const result = await groq.transcribeAudio(audioBuffer);
  return { ...data, transcription: result.text };
});

// 3. Resumir com IA
const summarize = createNode('summarize', async (data: any) => {
  const ai = AIClientFactory.createGemini();
  const response = await ai.generate(
    `Resuma em 2 frases: ${data.transcription}`
  );
  return { ...data, summary: response.text };
});

// 4. Enviar resposta
const sendReply = createNode('sendReply', async (data: any) => {
  const whatsapp = new WhatsAppClient(
    process.env.EVOLUTION_API_URL!,
    process.env.EVOLUTION_API_KEY!
  );
  await whatsapp.sendText(data.jid, data.summary);
  return { success: true };
});

workflow
  .addNode(validateAudio)
  .addNode(transcribe)
  .addNode(summarize)
  .addNode(sendReply);

// Executar
await workflow.execute(mensagem, [
  'validateAudio',
  'transcribe',
  'summarize',
  'sendReply',
]);
```

### Chatbot Simples

```typescript
import { AIClientFactory } from './integrations/ai.js';

const ai = AIClientFactory.createGemini();

async function chat(message: string): Promise<string> {
  const prompt = `
    Você é um assistente prestativo e amigável.

    Responda de forma clara e objetiva.

    Mensagem do usuário: ${message}
  `;

  const response = await ai.generate(prompt);
  return response.text;
}

// Uso
const resposta = await chat('Como fazer um bolo?');
```

### Análise de Sentimento

```typescript
import { AIClientFactory } from './integrations/ai.js';

async function analyzeSentiment(text: string) {
  const ai = AIClientFactory.createGemini();

  const prompt = `
    Analise o sentimento do seguinte texto.

    Retorne APENAS um JSON no formato:
    {
      "sentiment": "positive" | "negative" | "neutral",
      "score": 0.0 a 1.0,
      "summary": "breve explicação"
    }

    Texto: ${text}
  `;

  const response = await ai.generate(prompt);

  try {
    return JSON.parse(response.text);
  } catch {
    return { sentiment: 'neutral', score: 0.5, summary: 'Erro ao analisar' };
  }
}

// Uso
const result = await analyzeSentiment('Estou muito feliz hoje!');
console.log(result);
// { sentiment: "positive", score: 0.9, summary: "Texto expressa felicidade" }
```

## 📨 Webhooks

### Webhook Básico

```typescript
import { WebhookServer } from './server/webhook.js';

const server = new WebhookServer(3000);

server.registerWebhook({
  path: '/webhook/dados',
  method: 'POST',
  handler: async (payload, req, res) => {
    console.log('Dados recebidos:', payload);

    // Sua lógica aqui
    const resultado = processarDados(payload);

    res.json({
      success: true,
      data: resultado,
    });
  },
});

await server.start();
```

### Webhook com Validação

```typescript
import { WebhookServer, Middleware } from './server/webhook.js';

const server = new WebhookServer(3000);

// Adiciona middleware de autenticação
const app = server.getApp();
app.use('/webhook/protegido', Middleware.validateApiKey('minha-chave-secreta'));

server.registerWebhook({
  path: '/webhook/protegido',
  method: 'POST',
  handler: async (payload) => {
    // Webhook protegido
    return { message: 'Autenticado!' };
  },
});

await server.start();
```

### Webhook com Rate Limiting

```typescript
import { WebhookServer, Middleware } from './server/webhook.js';

const server = new WebhookServer(3000);
const app = server.getApp();

// Máximo 10 requests por minuto
app.use(
  '/webhook/limitado',
  Middleware.rateLimit(10, 60000)
);

server.registerWebhook({
  path: '/webhook/limitado',
  method: 'POST',
  handler: async (payload) => {
    return { message: 'OK' };
  },
});

await server.start();
```

## 💬 WhatsApp

### Enviar Mensagem Formatada

```typescript
import { WhatsAppClient, WhatsAppFormatter } from './integrations/whatsapp.js';

const client = new WhatsAppClient(
  process.env.EVOLUTION_API_URL!,
  process.env.EVOLUTION_API_KEY!
);

const mensagem = `
${WhatsAppFormatter.bold('Título Importante')}

${WhatsAppFormatter.italic('Este é um texto em itálico')}

${WhatsAppFormatter.monospace('Código: const x = 10;')}

Lista:
• Item 1
• Item 2
• Item 3

${WhatsAppFormatter.strikethrough('Texto riscado')}
`;

await client.sendText('5511999999999@s.whatsapp.net', mensagem);
```

### Auto-Responder Mensagens

```typescript
import { WebhookServer } from './server/webhook.js';
import { WhatsAppClient } from './integrations/whatsapp.js';

const server = new WebhookServer(3000);
const whatsapp = new WhatsAppClient(
  process.env.EVOLUTION_API_URL!,
  process.env.EVOLUTION_API_KEY!
);

server.onWhatsApp('/webhook/whatsapp', async (payload) => {
  const message = payload.data;

  // Ignora mensagens enviadas por mim
  if (WhatsAppClient.isFromMe(message)) return;

  // Ignora grupos
  if (WhatsAppClient.isGroup(message.key.remoteJid)) return;

  // Responde automaticamente
  await whatsapp.sendText(
    message.key.remoteJid,
    'Olá! Recebi sua mensagem. Em breve responderei!'
  );
});

await server.start();
```

### Ler Histórico de Conversa

```typescript
import { WhatsAppClient } from './integrations/whatsapp.js';

const client = new WhatsAppClient(
  process.env.EVOLUTION_API_URL!,
  process.env.EVOLUTION_API_KEY!
);

const jid = '5511999999999@s.whatsapp.net';
const history = await client.getConversationHistory(jid, 50);

console.log('Últimas 50 mensagens:', history.data);
```

## 🎯 Processamento de Dados

### Processar Lista em Lote

```typescript
import { Arrays, retry } from './utils/helpers.js';
import { AIClientFactory } from './integrations/ai.js';

const ai = AIClientFactory.createGemini();

const textos = [
  'Texto 1...',
  'Texto 2...',
  'Texto 3...',
  // ... muitos textos
];

// Divide em chunks de 5
const chunks = Arrays.chunk(textos, 5);

for (const chunk of chunks) {
  // Processa chunk em paralelo
  const resultados = await Promise.all(
    chunk.map((texto) =>
      retry(
        async () => {
          const response = await ai.generate(`Resuma: ${texto}`);
          return response.text;
        },
        { maxAttempts: 3 }
      )
    )
  );

  console.log('Chunk processado:', resultados);
}
```

### Extrair Informações com IA

```typescript
import { AIClientFactory } from './integrations/ai.js';

async function extractInfo(text: string) {
  const ai = AIClientFactory.createGemini();

  const prompt = `
    Extraia as seguintes informações do texto:
    - Nome
    - Email
    - Telefone
    - Empresa

    Retorne APENAS um JSON no formato:
    {
      "nome": "...",
      "email": "...",
      "telefone": "...",
      "empresa": "..."
    }

    Se não encontrar alguma informação, use null.

    Texto:
    ${text}
  `;

  const response = await ai.generate(prompt);

  try {
    return JSON.parse(response.text);
  } catch {
    return null;
  }
}

// Uso
const texto = `
  Olá, meu nome é João Silva.
  Trabalho na Empresa XYZ.
  Meu email é joao@empresa.com
  Telefone: (11) 99999-9999
`;

const info = await extractInfo(texto);
console.log(info);
// { nome: "João Silva", email: "joao@empresa.com", ... }
```

### Validar e Limpar Dados

```typescript
import { Text } from './utils/helpers.js';

interface UserInput {
  nome: string;
  email: string;
  mensagem: string;
}

function validateAndClean(input: UserInput) {
  return {
    nome: Text.clean(input.nome),
    email: input.email.toLowerCase().trim(),
    mensagem: Text.truncate(Text.clean(input.mensagem), 500),
  };
}

const input = {
  nome: '  João   Silva  ',
  email: 'JOAO@EMAIL.COM  ',
  mensagem: 'Mensagem    com    espaços    extras...',
};

const cleaned = validateAndClean(input);
console.log(cleaned);
```

## 🔄 Workflows Condicionais

### Roteamento Baseado em Conteúdo

```typescript
import { Workflow, createCondition, createNode } from './core/workflow.js';

const workflow = new Workflow('Router');

// Condições
const isPergunta = createCondition('isPergunta', (text: string) => {
  return text.includes('?');
});

const isSaudacao = createCondition('isSaudacao', (text: string) => {
  const saudacoes = ['oi', 'olá', 'bom dia', 'boa tarde', 'boa noite'];
  return saudacoes.some((s) => text.toLowerCase().includes(s));
});

// Handlers
const respondePergunta = createNode('respondePergunta', async (text: string) => {
  const ai = AIClientFactory.createGemini();
  return (await ai.generate(`Responda: ${text}`)).text;
});

const respondeSaudacao = createNode('respondeSaudacao', () => {
  return 'Olá! Como posso ajudar?';
});

const respostaGenerica = createNode('respostaGenerica', () => {
  return 'Recebi sua mensagem!';
});

workflow
  .addNode(respondePergunta)
  .addNode(respondeSaudacao)
  .addNode(respostaGenerica);

// Lógica de roteamento
async function processMessage(message: string) {
  if (await isPergunta.evaluate(message, {})) {
    return await workflow.executeNode('respondePergunta', message);
  } else if (await isSaudacao.evaluate(message, {})) {
    return await workflow.executeNode('respondeSaudacao', message);
  } else {
    return await workflow.executeNode('respostaGenerica', message);
  }
}

// Uso
const resposta = await processMessage('Como fazer um bolo?');
```

## ⚡ Performance

### Cache de Respostas de IA

```typescript
import { SimpleCache } from './utils/helpers.js';
import { AIClientFactory } from './integrations/ai.js';
import { createHash } from 'crypto';

const cache = new SimpleCache();
const ai = AIClientFactory.createGemini();

async function cachedAICall(prompt: string, ttlMs: number = 3600000) {
  // Gera hash do prompt para usar como chave
  const key = createHash('md5').update(prompt).digest('hex');

  // Verifica cache
  const cached = cache.get(key);
  if (cached) {
    console.log('✅ Cache hit!');
    return cached;
  }

  // Chama IA
  console.log('🔄 Cache miss - chamando IA...');
  const response = await ai.generate(prompt);

  // Salva no cache
  cache.set(key, response.text, ttlMs);

  return response.text;
}

// Uso
const resposta1 = await cachedAICall('Como fazer bolo?'); // Chama IA
const resposta2 = await cachedAICall('Como fazer bolo?'); // Usa cache
```

### Processamento Paralelo

```typescript
import { AIClientFactory } from './integrations/ai.js';

const ai = AIClientFactory.createGemini();

const tarefas = [
  'Resuma este texto...',
  'Traduza este texto...',
  'Analise este texto...',
];

// Executa tudo em paralelo
const resultados = await Promise.all(
  tarefas.map((tarefa) => ai.generate(tarefa))
);

console.log('Todos processados:', resultados);
```

## 🐛 Error Handling

### Retry com Backoff

```typescript
import { retry, Time } from './utils/helpers.js';

const resultado = await retry(
  async () => {
    // Operação que pode falhar
    const response = await fetch('https://api.exemplo.com/data');
    if (!response.ok) throw new Error('API error');
    return response.json();
  },
  {
    maxAttempts: 5,
    delayMs: 1000,
    backoff: true, // 1s, 2s, 4s, 8s, 16s
    onRetry: (error, attempt) => {
      console.log(`Tentativa ${attempt} falhou: ${error.message}`);
    },
  }
);
```

### Try-Catch com Fallback

```typescript
import { AIClientFactory } from './integrations/ai.js';

async function processWithFallback(text: string) {
  const gemini = AIClientFactory.createGemini();
  const groq = AIClientFactory.createGroq();

  try {
    // Tenta Gemini primeiro
    const response = await gemini.generate(text);
    return response.text;
  } catch (error) {
    console.log('Gemini falhou, usando Groq como fallback...');

    try {
      // Fallback para Groq
      const response = await groq.generate(text);
      return response.text;
    } catch (error2) {
      console.error('Ambos falharam');
      return 'Desculpe, não foi possível processar.';
    }
  }
}
```

## 🎨 Dicas Finais

### Criar Node Reutilizável

```typescript
// nodes/common.ts
import { createNode } from '../core/workflow.js';
import { AIClientFactory } from '../integrations/ai.js';

export function createSummarizeNode(maxLength: number = 2) {
  return createNode('summarize', async (text: string) => {
    const ai = AIClientFactory.createGemini();
    const prompt = `Resuma em ${maxLength} frases: ${text}`;
    const response = await ai.generate(prompt);
    return response.text;
  });
}

// Uso
import { createSummarizeNode } from './nodes/common.js';

const workflow = new Workflow('Teste');
workflow.addNode(createSummarizeNode(3)); // Resumo em 3 frases
```

### Workflow Reutilizável

```typescript
// workflows/common.ts
import { Workflow, createNode } from '../core/workflow.js';

export function createTextProcessingWorkflow() {
  const workflow = new Workflow('TextProcessing');

  workflow
    .addNode(createNode('clean', (text) => Text.clean(text)))
    .addNode(createNode('validate', (text) => {
      if (text.length === 0) throw new Error('Empty text');
      return text;
    }))
    .addNode(createNode('process', async (text) => {
      // Processamento...
      return text;
    }));

  return workflow;
}

// Uso
const wf = createTextProcessingWorkflow();
await wf.execute(input, ['clean', 'validate', 'process']);
```

---

**💡 Dica**: Copie e adapte essas receitas para acelerar seu desenvolvimento!
