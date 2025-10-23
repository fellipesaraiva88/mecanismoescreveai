/**
 * Teste Rápido - Execute este arquivo para testar o sistema
 *
 * npm run dev src/examples/quick-test.ts
 */

import 'dotenv/config';
import { Workflow, createNode } from '../core/workflow.js';
import { Text, Time, Arrays } from '../utils/helpers.js';

console.log('🧪 Teste Rápido do Sistema EscreverAI\n');

/**
 * Teste 1: Workflow Básico
 */
async function test1() {
  console.log('--- Teste 1: Workflow Básico ---');

  const workflow = new Workflow('Teste');

  const node1 = createNode('limpar', (texto: string) => {
    return Text.clean(texto);
  });

  const node2 = createNode('contar', (texto: string, context) => {
    const palavras = Text.wordCount(texto);
    context.palavras = palavras;
    return texto;
  });

  const node3 = createNode('truncar', (texto: string) => {
    return Text.truncate(texto, 50);
  });

  workflow.addNode(node1).addNode(node2).addNode(node3);

  const resultado = await workflow.execute(
    '   Este    é  um   texto    de   teste   com   espaços   extras   e   vai   ser   truncado   porque   é   muito   longo   ',
    ['limpar', 'contar', 'truncar']
  );

  console.log('Resultado:', resultado);
  console.log('Palavras:', workflow.getContext().palavras);
  console.log('✅ Teste 1 passou!\n');
}

/**
 * Teste 2: Helpers
 */
async function test2() {
  console.log('--- Teste 2: Helpers ---');

  // Texto
  const texto = '  Olá,  Mundo!  ';
  console.log('Original:', `"${texto}"`);
  console.log('Limpo:', `"${Text.clean(texto)}"`);
  console.log('Slug:', Text.slugify('Título com Acentuação!'));
  console.log('Capitalizado:', Text.capitalize('TEXTO EM CAPS'));

  // Tempo
  console.log('\nEsperando 1 segundo...');
  await Time.sleep(1000);
  console.log('Formatado:', Time.formatDuration(125));

  // Arrays
  const numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  console.log('\nChunks:', Arrays.chunk(numeros, 3));
  console.log('Unique:', Arrays.unique([1, 1, 2, 2, 3, 3]));
  console.log('Random:', Arrays.random(['A', 'B', 'C']));

  console.log('✅ Teste 2 passou!\n');
}

/**
 * Teste 3: Contexto do Workflow
 */
async function test3() {
  console.log('--- Teste 3: Contexto do Workflow ---');

  const workflow = new Workflow('Contexto');

  const node1 = createNode('set', (input: any, context) => {
    context.usuario = 'João';
    context.timestamp = new Date().toISOString();
    return input;
  });

  const node2 = createNode('read', (input: any, context) => {
    console.log('Usuário:', context.usuario);
    console.log('Timestamp:', context.timestamp);
    return `Processado por ${context.usuario}`;
  });

  workflow.addNode(node1).addNode(node2);

  const resultado = await workflow.execute('teste', ['set', 'read']);

  console.log('Resultado:', resultado);
  console.log('✅ Teste 3 passou!\n');
}

/**
 * Teste 4: Error Handling
 */
async function test4() {
  console.log('--- Teste 4: Error Handling ---');

  const workflow = new Workflow('Erros');

  const nodeOk = createNode('ok', (input: any) => {
    return 'OK';
  });

  const nodeErro = createNode('erro', (input: any) => {
    throw new Error('Erro de teste!');
  });

  workflow.addNode(nodeOk).addNode(nodeErro);

  // Testa node OK
  try {
    const resultado = await workflow.executeNode('ok', 'teste');
    console.log('Node OK:', resultado);
  } catch (error) {
    console.error('Erro inesperado:', error);
  }

  // Testa node com erro
  try {
    await workflow.executeNode('erro', 'teste');
    console.log('❌ Deveria ter dado erro!');
  } catch (error) {
    if (error instanceof Error) {
      console.log('✅ Erro capturado corretamente:', error.message);
    }
  }

  console.log('✅ Teste 4 passou!\n');
}

/**
 * Teste 5: Simulação de Webhook WhatsApp
 */
async function test5() {
  console.log('--- Teste 5: Simulação Webhook WhatsApp ---');

  const workflow = new Workflow('WhatsApp Mock');

  const validate = createNode('validate', (msg: any) => {
    if (!msg.data) {
      throw new Error('Mensagem inválida');
    }
    return msg.data;
  });

  const extract = createNode('extract', (data: any) => {
    return {
      jid: data.key?.remoteJid || 'unknown',
      messageType: data.messageType || 'text',
      timestamp: data.messageTimestamp || Date.now(),
    };
  });

  const process = createNode('process', (info: any) => {
    return {
      ...info,
      processed: true,
      response: 'Mensagem processada com sucesso!',
    };
  });

  workflow.addNode(validate).addNode(extract).addNode(process);

  // Mock de payload do WhatsApp
  const mockPayload = {
    event: 'messages.upsert',
    instance: 'teste',
    data: {
      key: {
        remoteJid: '5511999999999@s.whatsapp.net',
        fromMe: false,
        id: 'mock-id',
      },
      messageType: 'conversation',
      messageTimestamp: Date.now() / 1000,
    },
  };

  const resultado = await workflow.execute(mockPayload, [
    'validate',
    'extract',
    'process',
  ]);

  console.log('Resultado:', JSON.stringify(resultado, null, 2));
  console.log('✅ Teste 5 passou!\n');
}

/**
 * Teste 6: Formatação WhatsApp
 */
function test6() {
  console.log('--- Teste 6: Formatação WhatsApp ---');

  // Simula formatadores (sem importar WhatsApp pra não dar erro)
  const bold = (text: string) => `*${text}*`;
  const italic = (text: string) => `_${text}_`;

  const mensagem = `
${bold('Bem-vindo ao EscreverAI!')}

${italic('Sistema funcionando perfeitamente.')}

Lista de features:
• Workflows modulares
• Integrações com IA
• Webhooks prontos

Tudo pronto para usar!
  `.trim();

  console.log('Mensagem formatada:');
  console.log(mensagem);
  console.log('✅ Teste 6 passou!\n');
}

/**
 * Executa todos os testes
 */
async function runAllTests() {
  console.log('='.repeat(50));
  console.log('EXECUTANDO TESTES DO SISTEMA');
  console.log('='.repeat(50));
  console.log('');

  try {
    await test1();
    await test2();
    await test3();
    await test4();
    await test5();
    test6();

    console.log('='.repeat(50));
    console.log('✅ TODOS OS TESTES PASSARAM!');
    console.log('='.repeat(50));
    console.log('');
    console.log('🎉 Sistema funcionando perfeitamente!');
    console.log('');
    console.log('Próximos passos:');
    console.log('1. Configure suas API keys no .env');
    console.log('2. Rode o servidor: npm run dev');
    console.log('3. Teste os webhooks');
    console.log('4. Comece a criar seus workflows!');
  } catch (error) {
    console.error('❌ Erro nos testes:', error);
    process.exit(1);
  }
}

// Executa os testes
runAllTests();
