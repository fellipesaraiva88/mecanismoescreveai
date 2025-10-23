/**
 * Exemplo: Workflow simples
 *
 * Demonstra como criar um workflow básico de forma rápida
 */

import { Workflow, createNode, createCondition } from '../core/workflow.js';
import { AIClientFactory } from '../integrations/ai.js';
import { Text } from '../utils/helpers.js';

/**
 * Exemplo 1: Workflow de processamento de texto
 */
export async function textProcessingExample() {
  const workflow = new Workflow('Processamento de Texto');

  // Node 1: Limpar texto
  const cleanText = createNode('cleanText', (input: string) => {
    return Text.clean(input);
  });

  // Node 2: Contar palavras
  const countWords = createNode('countWords', (input: string, context) => {
    const count = Text.wordCount(input);
    context.wordCount = count;
    return input;
  });

  // Node 3: Gerar resumo com IA
  const generateSummary = createNode('generateSummary', async (input: string) => {
    const ai = AIClientFactory.createGemini();
    const response = await ai.generate(
      `Resuma o seguinte texto em 2 frases:\n\n${input}`
    );
    return response.text;
  });

  // Registra nodes e executa
  workflow
    .addNode(cleanText)
    .addNode(countWords)
    .addNode(generateSummary);

  const texto = `
    Este é um exemplo de texto que será processado pelo workflow.
    Ele tem algumas quebras de linha e      espaços extras.


    O workflow vai limpar, contar palavras e gerar um resumo.
  `;

  const resultado = await workflow.execute(texto, [
    'cleanText',
    'countWords',
    'generateSummary',
  ]);

  console.log('Resumo:', resultado);
  console.log('Total de palavras:', workflow.getContext().wordCount);
}

/**
 * Exemplo 2: Workflow com condicionais
 */
export async function conditionalWorkflowExample() {
  const workflow = new Workflow('Análise Condicional');

  // Condition: Texto é longo?
  const isLongText = createCondition('isLongText', (input: string) => {
    return Text.wordCount(input) > 100;
  });

  // Node para textos curtos
  const processShort = createNode('processShort', async (input: string) => {
    const ai = AIClientFactory.createGemini();
    return (await ai.generate(`Expanda este texto: ${input}`)).text;
  });

  // Node para textos longos
  const processLong = createNode('processLong', async (input: string) => {
    const ai = AIClientFactory.createGemini();
    return (await ai.generate(`Resuma este texto: ${input}`)).text;
  });

  workflow.addNode(processShort).addNode(processLong);

  const textoLongo = 'Lorem ipsum...'.repeat(50);
  const textoCurto = 'Hello world!';

  // Executa com condicional
  const resultadoLongo = await workflow.executeConditional(
    textoLongo,
    isLongText,
    ['processLong'],
    ['processShort']
  );

  const resultadoCurto = await workflow.executeConditional(
    textoCurto,
    isLongText,
    ['processLong'],
    ['processShort']
  );

  console.log('Texto longo processado:', resultadoLongo);
  console.log('Texto curto processado:', resultadoCurto);
}

/**
 * Exemplo 3: Workflow de webhook + IA
 */
export async function webhookAIExample() {
  const workflow = new Workflow('Webhook AI');

  // Node: Validar payload
  const validate = createNode('validate', (payload: any) => {
    if (!payload.message) {
      throw new Error('Payload inválido: falta campo "message"');
    }
    return payload.message;
  });

  // Node: Processar com IA
  const processAI = createNode('processAI', async (message: string) => {
    const ai = AIClientFactory.createGemini();

    const prompt = `
      Você é um assistente prestativo.

      Mensagem do usuário: ${message}

      Responda de forma clara e objetiva.
    `;

    const response = await ai.generate(prompt);
    return response.text;
  });

  // Node: Formatar resposta
  const format = createNode('format', (text: string) => {
    return {
      success: true,
      response: text,
      timestamp: new Date().toISOString(),
    };
  });

  workflow.addNode(validate).addNode(processAI).addNode(format);

  // Simula payload de webhook
  const payload = {
    message: 'Como criar um workflow em TypeScript?',
  };

  const resultado = await workflow.execute(payload, [
    'validate',
    'processAI',
    'format',
  ]);

  console.log('Resposta:', resultado);
}

/**
 * Exemplo 4: Workflow paralelo (processamento em batch)
 */
export async function parallelWorkflowExample() {
  const textos = [
    'Primeiro texto para processar',
    'Segundo texto para processar',
    'Terceiro texto para processar',
  ];

  const ai = AIClientFactory.createGemini();

  // Processa todos em paralelo
  const resultados = await Promise.all(
    textos.map(async (texto) => {
      const response = await ai.generate(`Resuma: ${texto}`);
      return {
        original: texto,
        resumo: response.text,
      };
    })
  );

  console.log('Resultados paralelos:', resultados);
}

// Execute os exemplos
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🧪 Executando exemplos de workflows...\n');

  (async () => {
    try {
      console.log('--- Exemplo 1: Processamento de Texto ---');
      await textProcessingExample();

      console.log('\n--- Exemplo 2: Workflow Condicional ---');
      await conditionalWorkflowExample();

      console.log('\n--- Exemplo 3: Webhook + IA ---');
      await webhookAIExample();

      console.log('\n--- Exemplo 4: Processamento Paralelo ---');
      await parallelWorkflowExample();

      console.log('\n✅ Todos os exemplos concluídos!');
    } catch (error) {
      console.error('❌ Erro nos exemplos:', error);
    }
  })();
}
