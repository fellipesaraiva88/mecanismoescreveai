# 🚀 Como Usar Este Sistema Comigo

## Objetivo

Este sistema foi criado para **acelerar suas ideias**. Você me descreve o que quer, e eu transformo em código rapidamente usando esta estrutura.

## 📝 Como Me Passar Suas Ideias

### Formato Ideal

Quanto mais específico, melhor! Mas não se preocupe em ser técnico - eu traduzo para código.

#### ✅ Exemplo Bom

```
"Quero receber mensagens do WhatsApp, transcrever os áudios,
processar com IA usando OGRT e enviar a resposta.
Só processar se for privado ou de grupos específicos.
Ignorar mensagens que eu enviei."
```

#### ✅ Exemplo Simples

```
"Preciso de um chatbot que responde perguntas no WhatsApp"
```

#### ✅ Exemplo Complexo

```
"Criar um workflow que:
1. Recebe dados de um formulário via webhook
2. Valida os dados
3. Extrai informações usando IA
4. Salva no Supabase
5. Envia confirmação por email
6. Se der erro, tenta 3 vezes"
```

### Templates de Ideias

Use estes templates para me passar suas ideias:

#### Template 1: Webhook + Processamento

```
Quero um webhook que:
- Recebe: [tipo de dado]
- Valida: [regras]
- Processa: [o que fazer]
- Responde: [formato de resposta]
```

**Exemplo:**
```
Quero um webhook que:
- Recebe: JSON com campo "texto"
- Valida: texto não vazio, máximo 500 caracteres
- Processa: resume o texto com IA
- Responde: JSON com o resumo
```

#### Template 2: WhatsApp Automation

```
Quero automatizar WhatsApp:
- Quando receber: [tipo de mensagem]
- Fazer: [ação]
- Enviar: [resposta]
- Condições: [filtros/regras]
```

**Exemplo:**
```
Quero automatizar WhatsApp:
- Quando receber: áudio
- Fazer: transcrever e resumir
- Enviar: texto com resumo
- Condições: só em grupos X, Y, Z
```

#### Template 3: Processamento em Lote

```
Quero processar:
- Dados: [fonte/tipo]
- Quantidade: [estimativa]
- Processamento: [o que fazer com cada item]
- Resultado: [onde salvar/enviar]
```

**Exemplo:**
```
Quero processar:
- Dados: lista de 1000 textos
- Quantidade: ~1000 itens
- Processamento: classificar sentimento com IA
- Resultado: salvar em CSV
```

#### Template 4: Workflow Condicional

```
Se [condição]:
  Fazer: [ação A]
Senão:
  Fazer: [ação B]
```

**Exemplo:**
```
Se mensagem for pergunta:
  Fazer: responder com IA
Senão se for saudação:
  Fazer: responder "Olá!"
Senão:
  Fazer: guardar para processar depois
```

## 🎯 Níveis de Especificação

### Nível 1: Ideia Vaga (eu ajudo a definir)

```
"Quero automatizar meu atendimento no WhatsApp"
```

✅ Eu vou perguntar:
- Que tipo de mensagens?
- Como deve responder?
- Quais regras/filtros?
- Usar qual IA?

### Nível 2: Ideia Clara (eu implemento direto)

```
"Receber áudios do WhatsApp, transcrever com Groq,
resumir com Gemini e enviar resposta"
```

✅ Eu vou criar o código direto baseado no template Ultron

### Nível 3: Especificação Técnica (mais rápido ainda)

```
"Webhook POST /audio
Payload: { audioUrl, jid }
1. Download áudio
2. Groq Whisper transcrição
3. Gemini resumo (prompt X)
4. WhatsApp sendText
Retry 3x com backoff"
```

✅ Código pronto em minutos

## 🔄 Fluxo de Trabalho Comigo

### Passo 1: Você Descreve

```
"Quero [sua ideia aqui]"
```

### Passo 2: Eu Clarificо (se necessário)

```
"Entendi! Vou precisar saber:
- [pergunta 1]
- [pergunta 2]"
```

### Passo 3: Eu Crio o Código

```typescript
// Código pronto baseado na estrutura
```

### Passo 4: Você Testa e Itera

```
"Funcionou! Mas preciso ajustar [detalhe]"
```

### Passo 5: Eu Ajusto

```typescript
// Código ajustado
```

## 📦 Estrutura Já Pronta

Você tem acesso a:

### ✅ Integrações Prontas

- **WhatsApp** (via Evolution API)
- **IA**: Claude, Gemini, Groq
- **Webhooks**: servidor Express configurado
- **Supabase**: cliente pronto (se precisar)

### ✅ Helpers Úteis

- Processamento de texto
- Download de arquivos
- Retry logic
- Cache simples
- Formatação WhatsApp

### ✅ Exemplos Funcionais

- Workflow Ultron (completo)
- Workflows simples
- Receitas prontas (RECEITAS.md)

## 🎨 Exemplos de Como Me Pedir

### ❌ Não Ideal

```
"Faz um negócio de IA"
```

### ✅ Melhor

```
"Quero usar IA para processar mensagens"
```

### ✅✅ Ideal

```
"Receber mensagens do WhatsApp, usar IA para extrair nome
e email, salvar no banco e responder confirmação"
```

## 💡 Dicas para Acelerar

### 1. Use os Exemplos como Base

```
"Igual ao Ultron, mas ao invés de resumir, quero
classificar o sentimento da mensagem"
```

### 2. Referencie Receitas

```
"Usar a receita 'Chatbot Simples' mas com prompt
personalizado para pets"
```

### 3. Seja Específico nos Detalhes Importantes

```
"Processar apenas grupos: [ID1, ID2, ID3]
Ignorar áudios < 5 segundos
Usar modelo Gemini Flash (mais rápido)"
```

### 4. Me Diga o Contexto

```
"É para um bot que atende clientes de pet shop,
precisa ser empático e ajudar com agendamentos"
```

## 🚀 Casos de Uso Frequentes

### Caso 1: Bot de Atendimento

```
"Bot para WhatsApp que:
- Responde perguntas sobre [seu negócio]
- Horário de funcionamento
- Agenda via link
- Salva leads no Supabase"
```

### Caso 2: Processamento de Áudio

```
"Transcrever reuniões do WhatsApp,
gerar resumo executivo e ata,
enviar por email"
```

### Caso 3: Automação de Dados

```
"Receber dados via webhook,
validar e limpar,
processar com IA,
salvar em planilha"
```

### Caso 4: Sistema de Notificações

```
"Monitorar [fonte de dados],
quando [condição],
enviar WhatsApp para [pessoa/grupo]"
```

## 🎯 Começando Agora

### Opção 1: Adaptar Exemplo Existente

```
"Pega o workflow Ultron e adapta para [meu caso]"
```

### Opção 2: Criar do Zero

```
"Preciso de um workflow que faça [X, Y, Z]"
```

### Opção 3: Usar Receita

```
"Receita de 'Chatbot Simples' mas com [ajuste]"
```

## 🤝 Como Funciona na Prática

### Você:
```
"Quero um bot que recebe áudios do WhatsApp,
transcreve e salva no Supabase"
```

### Eu:
```typescript
// Crio o código completo:

import { Workflow, createNode } from './core/workflow.js';
import { WhatsAppClient } from './integrations/whatsapp.js';
import { AIClientFactory } from './integrations/ai.js';
import { createClient } from '@supabase/supabase-js';

const workflow = new Workflow('Salvar Transcrições');

const transcribe = createNode('transcribe', async (msg) => {
  const audioUrl = WhatsAppClient.getAudioUrl(msg);
  const groq = AIClientFactory.createGroq();
  const result = await groq.transcribeAudio(await File.download(audioUrl));
  return result.text;
});

const saveToSupabase = createNode('save', async (transcription, context) => {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
  await supabase.from('transcriptions').insert({ text: transcription });
  return { success: true };
});

workflow.addNode(transcribe).addNode(saveToSupabase);

// Handler do webhook
export async function handleAudio(message: any) {
  return await workflow.execute(message, ['transcribe', 'save']);
}
```

### Você:
```
"Perfeito! Mas quero adicionar timestamp e sender"
```

### Eu:
```typescript
// Ajusto o código:

const saveToSupabase = createNode('save', async (transcription, context) => {
  const message = context.originalMessage;
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

  await supabase.from('transcriptions').insert({
    text: transcription,
    sender: WhatsAppClient.extractNumber(message.key.remoteJid),
    timestamp: new Date(message.messageTimestamp * 1000).toISOString(),
  });

  return { success: true };
});
```

## 📚 Referências Rápidas

Quando tiver dúvida, consulte:

- **README.md** - Visão geral e documentação
- **RECEITAS.md** - Código pronto para copiar
- **src/examples/** - Exemplos funcionais
- **Este arquivo** - Como me pedir coisas

## 🎉 Próximos Passos

1. Me conte sua ideia
2. Eu crio o código
3. Você testa
4. Iteramos até ficar perfeito
5. Deploy e uso!

---

**Estou pronto! Me diga o que você quer criar 🚀**
