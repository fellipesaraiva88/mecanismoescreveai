/**
 * Exemplo: Recriação do workflow "Ultron" do n8n em código
 *
 * Fluxo:
 * 1. Recebe mensagem via webhook (WhatsApp)
 * 2. Filtra: privado vs grupo, ignora mensagens enviadas por você
 * 3. Verifica se é áudio
 * 4. Transcreve áudio (Groq Whisper)
 * 5. Processa com IA:
 *    - Áudios < 30s: resumo curto
 *    - Áudios >= 30s: aplicação OGRT + revisão
 * 6. Envia resposta
 */

import { Workflow, createNode, createCondition } from '../core/workflow.js';
import { WhatsAppClient, type WhatsAppWebhookPayload } from '../integrations/whatsapp.js';
import { AIClientFactory, Prompts } from '../integrations/ai.js';
import { Text, retry, SimpleCache } from '../utils/helpers.js';

// Configurações
const ALLOWED_GROUPS = [
  '120363404369363372@g.us', // Adicione IDs de grupos permitidos aqui
];

const SHORT_AUDIO_THRESHOLD = 30; // segundos

// Clientes
const whatsapp = new WhatsAppClient(
  process.env.EVOLUTION_API_URL || '',
  process.env.EVOLUTION_API_KEY || '',
  'saraiva'
);

const groq = AIClientFactory.createGroq();
const gemini = AIClientFactory.createGemini();

// Cache para conversas (evitar processar mensagens duplicadas)
const messageCache = new SimpleCache<boolean>();

/**
 * Workflow Ultron
 */
export function createUltronWorkflow() {
  const workflow = new Workflow('Ultron');

  // Node 1: Validar mensagem
  const validateMessage = createNode(
    'validateMessage',
    async (payload: WhatsAppWebhookPayload) => {
      const { data } = payload;

      // Ignora mensagens enviadas por mim
      if (WhatsAppClient.isFromMe(data)) {
        throw new Error('Mensagem enviada por mim - ignorar');
      }

      // Verifica se já processamos essa mensagem
      const messageId = data.key.id;
      if (messageCache.has(messageId)) {
        throw new Error('Mensagem já processada - ignorar');
      }
      messageCache.set(messageId, true, 300000); // 5 min de cache

      // Verifica se é áudio
      if (!WhatsAppClient.isAudioMessage(data)) {
        throw new Error('Não é mensagem de áudio - ignorar');
      }

      return data;
    }
  );

  // Node 2: Filtrar privado/grupo
  const filterPrivateOrGroup = createNode(
    'filterPrivateOrGroup',
    async (message: any) => {
      const jid = message.key.remoteJid;
      const isGroup = WhatsAppClient.isGroup(jid);
      const isPrivate = WhatsAppClient.isPrivate(jid);

      // Se for grupo, verificar se está na lista permitida
      if (isGroup && !ALLOWED_GROUPS.includes(jid)) {
        throw new Error(`Grupo ${jid} não está na lista de permitidos`);
      }

      return {
        message,
        isGroup,
        isPrivate,
        jid,
      };
    }
  );

  // Node 3: Extrair dados do usuário
  const extractUserData = createNode(
    'extractUserData',
    async (data: any) => {
      const { message, isGroup, jid } = data;

      return {
        jid,
        isGroup,
        pushName: message.pushName || 'Usuário',
        audioUrl: WhatsAppClient.getAudioUrl(message)!,
        audioDuration: WhatsAppClient.getAudioDuration(message),
        participant: message.key.participant,
      };
    }
  );

  // Node 4: Baixar e transcrever áudio
  const transcribeAudio = createNode(
    'transcribeAudio',
    async (userData: any) => {
      const { audioUrl } = userData;

      // Baixa o áudio (em produção, você precisará decriptar o áudio do WhatsApp)
      // Por simplicidade, aqui assumimos que temos acesso direto
      console.log(`📥 Transcrevendo áudio: ${audioUrl}`);

      // Simula transcrição (em produção, use Groq Whisper)
      const transcription = await retry(
        async () => {
          // const audioBuffer = await File.download(audioUrl);
          // const result = await groq.transcribeAudio(audioBuffer);
          // return result.text;

          // Por enquanto, retorna texto de exemplo
          return 'Transcrição do áudio aqui...';
        },
        { maxAttempts: 3, delayMs: 1000 }
      );

      return {
        ...userData,
        transcription,
      };
    }
  );

  // Node 5: Processar com IA (curto vs longo)
  const processWithAI = createNode(
    'processWithAI',
    async (data: any) => {
      const { transcription, audioDuration } = data;

      let processedText: string;

      if (audioDuration < SHORT_AUDIO_THRESHOLD) {
        // Áudio curto: resumo direto
        console.log('⚡ Processando áudio curto...');

        const response = await gemini.generateWithTemplate(
          Prompts.RESUMO_CURTO,
          { transcription }
        );

        processedText = response.text;
      } else {
        // Áudio longo: OGRT + revisão
        console.log('📝 Processando áudio longo com OGRT...');

        // Aplicação OGRT
        const ogrtResponse = await gemini.generateWithTemplate(
          Prompts.OGRT_APLICACAO,
          { transcription }
        );

        // Revisão
        const revisorResponse = await gemini.generateWithTemplate(
          Prompts.OGRT_REVISOR,
          { text: ogrtResponse.text }
        );

        processedText = revisorResponse.text;
      }

      return {
        ...data,
        processedText,
      };
    }
  );

  // Node 6: Formatar resposta com "Ler Mais" se necessário
  const formatResponse = createNode(
    'formatResponse',
    async (data: any) => {
      const { processedText, transcription } = data;

      // Se o texto for muito longo, adiciona "Ler Mais"
      const MAX_LENGTH = 300;
      let finalText = processedText;

      if (processedText.length > MAX_LENGTH) {
        finalText = Text.truncate(processedText, MAX_LENGTH);
        finalText += '\n\n_Digite "ler mais" para ver o texto completo_';
      }

      // Adiciona transcrição completa ao contexto para "Ler Mais"
      return {
        ...data,
        finalText,
        fullText: processedText,
      };
    }
  );

  // Node 7: Enviar resposta
  const sendResponse = createNode(
    'sendResponse',
    async (data: any) => {
      const { jid, finalText } = data;

      console.log(`📤 Enviando resposta para ${jid}`);

      await retry(
        async () => {
          await whatsapp.sendText(jid, finalText);
        },
        { maxAttempts: 3, delayMs: 2000 }
      );

      return {
        success: true,
        sentTo: jid,
        message: finalText,
      };
    }
  );

  // Registra todos os nodes
  workflow
    .addNode(validateMessage)
    .addNode(filterPrivateOrGroup)
    .addNode(extractUserData)
    .addNode(transcribeAudio)
    .addNode(processWithAI)
    .addNode(formatResponse)
    .addNode(sendResponse);

  return workflow;
}

/**
 * Handler para webhook do WhatsApp
 */
export async function handleUltronWebhook(payload: WhatsAppWebhookPayload) {
  const workflow = createUltronWorkflow();

  try {
    const result = await workflow.execute(payload, [
      'validateMessage',
      'filterPrivateOrGroup',
      'extractUserData',
      'transcribeAudio',
      'processWithAI',
      'formatResponse',
      'sendResponse',
    ]);

    console.log('✅ Workflow Ultron concluído:', result);
    return result;
  } catch (error) {
    if (error instanceof Error) {
      console.log(`⚠️ Workflow ignorou mensagem: ${error.message}`);
    } else {
      console.error('❌ Erro no workflow Ultron:', error);
      throw error;
    }
  }
}
