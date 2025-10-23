# ⚡ Início Rápido - EscreverAI

## 🎯 O que é isso?

Um sistema modular em TypeScript que transforma workflows do n8n em código nativo, permitindo que você:

- ✅ Implemente suas ideias rapidamente
- ✅ Crie automações complexas com código simples
- ✅ Integre WhatsApp, IA e webhooks facilmente
- ✅ Tenha controle total e performance superior ao n8n

## 🚀 Setup em 3 Passos

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis

Edite o arquivo `.env` e adicione suas chaves de API:

```bash
# Mínimo para começar:
GOOGLE_AI_KEY=sua_chave_aqui
PORT=3000
```

### 3. Testar

```bash
# Teste rápido (sem APIs externas)
npm run dev src/examples/quick-test.ts

# Servidor completo (precisa das APIs configuradas)
npm run dev
```

## 📁 Estrutura do Projeto

```
escreveai/
├── src/
│   ├── core/workflow.ts           ← Motor de workflows
│   ├── integrations/
│   │   ├── ai.ts                  ← Claude, Gemini, Groq
│   │   └── whatsapp.ts            ← Evolution API
│   ├── server/webhook.ts          ← Servidor Express
│   ├── utils/helpers.ts           ← Funções úteis
│   └── examples/                  ← Exemplos prontos
│
├── README.md                      ← Documentação completa
├── RECEITAS.md                    ← Código pronto para copiar
├── COMO-USAR.md                   ← Como me pedir para criar código
└── .env                           ← Suas configurações
```

## 🎨 Você Já Pode Fazer Isso:

### 1. Criar um Workflow Simples

```typescript
import { Workflow, createNode } from './core/workflow.js';

const workflow = new Workflow('Meu Workflow');

const node = createNode('processar', (input: string) => {
  return input.toUpperCase();
});

workflow.addNode(node);
const resultado = await workflow.executeNode('processar', 'teste');
// Resultado: "TESTE"
```

### 2. Usar IA

```typescript
import { AIClientFactory } from './integrations/ai.js';

const ai = AIClientFactory.createGemini();
const response = await ai.generate('Explique TypeScript em 2 frases');
console.log(response.text);
```

### 3. Criar um Webhook

```typescript
import { WebhookServer } from './server/webhook.js';

const server = new WebhookServer(3000);

server.registerWebhook({
  path: '/meu-webhook',
  method: 'POST',
  handler: async (payload) => {
    console.log('Recebi:', payload);
    return { success: true };
  },
});

await server.start();
```

## 📚 Próximos Passos

### Opção 1: Ler a Documentação

- **README.md** - Visão geral completa
- **RECEITAS.md** - Código pronto para copiar e usar
- **COMO-USAR.md** - Como me passar suas ideias

### Opção 2: Ver Exemplos

```bash
# Ver exemplos de workflows
cat src/examples/simple-workflow.ts

# Ver workflow Ultron (completo)
cat src/examples/ultron-workflow.ts
```

### Opção 3: Começar a Usar

1. **Me diga o que você quer criar**
   - Exemplo: "Quero um bot de WhatsApp que..."

2. **Eu crio o código**
   - Baseado nos templates e exemplos

3. **Você testa e itera**
   - Ajustamos até ficar perfeito

## 🔑 APIs Necessárias

### Gratuitas/Baratas:

- **Google AI (Gemini)** - https://ai.google.dev/
  - Modelo Flash: gratuito
  - Modelo Pro: muito barato

- **Groq** - https://groq.com/
  - Whisper (transcrição): gratuito
  - LLMs rápidos: gratuito (rate limits)

### Pagas mas Valiosas:

- **Anthropic (Claude)** - https://console.anthropic.com/
  - Claude Sonnet: melhor qualidade
  - Pago por uso

- **Evolution API** - Para WhatsApp
  - Configure sua instância ou use serviço pago

## ⚡ Comandos Úteis

```bash
# Desenvolvimento (auto-reload)
npm run dev

# Build (produção)
npm run build
npm start

# Testes rápidos
npm run dev src/examples/quick-test.ts

# Exemplos
npm run dev src/examples/simple-workflow.ts
```

## 🐛 Troubleshooting

### Erro: "Cannot find module"

```bash
# Reinstale as dependências
rm -rf node_modules package-lock.json
npm install
```

### Erro: "API key not found"

```bash
# Verifique o .env
cat .env

# Adicione sua chave
echo "GOOGLE_AI_KEY=sua_chave" >> .env
```

### Servidor não inicia

```bash
# Verifique se a porta está disponível
lsof -i :3000

# Ou mude a porta no .env
echo "PORT=3001" >> .env
```

## 💡 Dicas Rápidas

### 1. Copie as Receitas

O arquivo **RECEITAS.md** tem código pronto. Copie e cole!

### 2. Adapte os Exemplos

Use **src/examples/ultron-workflow.ts** como base e adapte.

### 3. Peça Ajuda

Leia **COMO-USAR.md** e me descreva o que quer. Eu crio o código!

## 🎯 Seu Primeiro Workflow

Vamos criar algo simples agora mesmo:

```typescript
// src/meu-primeiro-workflow.ts

import { Workflow, createNode } from './core/workflow.js';
import { Text } from './utils/helpers.js';

const workflow = new Workflow('Meu Primeiro');

// Node 1: Limpar texto
workflow.addNode(
  createNode('limpar', (texto: string) => Text.clean(texto))
);

// Node 2: Contar palavras
workflow.addNode(
  createNode('contar', (texto: string) => {
    const count = Text.wordCount(texto);
    return `O texto tem ${count} palavras: "${texto}"`;
  })
);

// Executar
const resultado = await workflow.execute(
  '  Olá,   mundo!  ',
  ['limpar', 'contar']
);

console.log(resultado);
// "O texto tem 2 palavras: "Olá, mundo!""
```

Execute:
```bash
npm run dev src/meu-primeiro-workflow.ts
```

## 🎉 Pronto!

Você já tem tudo para começar. Agora é só:

1. **Pensar na sua ideia**
2. **Me contar** (veja COMO-USAR.md)
3. **Eu crio o código**
4. **Você usa e lucra** 🚀

---

**Dúvidas?** Leia README.md ou me pergunte!
