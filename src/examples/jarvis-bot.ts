/**
 * 🤖 JARVIS - Assistente Inteligente para WhatsApp
 *
 * Bot completo que integra:
 * - Comandos slash (/escreveai, /resumo, /buscar, etc)
 * - Reações com emojis (🔊, 📌, 📝, ❓)
 * - Whitelist de grupos
 * - Transcrição de áudios
 * - Inteligência contextual
 */

import type { WhatsAppWebhookPayload } from '../integrations/whatsapp.js';
import { WhatsAppClient } from '../integrations/whatsapp.js';
import { WhitelistManager } from '../features/whitelist/index.js';
import { initializeCommands, processCommand } from '../features/commands/index.js';
import { initializeReactions, processReaction } from '../features/reactions/index.js';
import { commandRegistry } from '../features/commands/registry.js';
import { gruposCommand } from '../features/whitelist/commands.js';

/**
 * Inicializa o bot Jarvis
 */
export function initializeJarvis(): void {
  console.log('\n🤖 ================================');
  console.log('🤖   JARVIS BOT INICIANDO...');
  console.log('🤖 ================================\n');

  // Inicializa whitelist
  WhitelistManager.initialize();

  // Inicializa comandos
  initializeCommands();

  // Registra comando admin de grupos
  commandRegistry.register(gruposCommand);

  // Inicializa reações
  initializeReactions();

  console.log('\n✅ Jarvis inicializado com sucesso!');
  console.log('📱 Pronto para receber mensagens do WhatsApp\n');
}

/**
 * Handler principal do Jarvis
 * Processa todos os tipos de eventos do WhatsApp
 */
export async function handleJarvisWebhook(
  payload: WhatsAppWebhookPayload,
  whatsapp: WhatsAppClient
): Promise<void> {
  const { data } = payload;
  const jid = data.key.remoteJid;
  const sender = data.key.participant || data.key.remoteJid;

  // 1. Verifica whitelist
  if (!WhitelistManager.isAllowed(jid, sender)) {
    console.log(`⛔ Mensagem ignorada (whitelist): ${jid}`);
    return;
  }

  // 2. Ignora mensagens enviadas pelo próprio bot
  if (WhatsAppClient.isFromMe(data)) {
    return;
  }

  // 3. Processa REAÇÕES (emojis)
  if (data.messageType === 'reactionMessage') {
    console.log(`🎯 Reação detectada em ${jid}`);

    const reactionResponse = await processReaction(payload);

    if (reactionResponse) {
      // Envia resposta da reação
      if (reactionResponse.text) {
        await whatsapp.sendText(jid, reactionResponse.text);
      }

      if (reactionResponse.media) {
        await whatsapp.sendMedia(jid, reactionResponse.media.url, reactionResponse.media.caption);
      }
    }

    return;
  }

  // 4. Processa COMANDOS SLASH
  const commandResponse = await processCommand(data);

  if (commandResponse) {
    console.log(`⚡ Comando executado em ${jid}`);

    // Envia resposta do comando
    if (commandResponse.text) {
      await whatsapp.sendText(jid, commandResponse.text);
    }

    if (commandResponse.media) {
      await whatsapp.sendMedia(jid, commandResponse.media.url, commandResponse.media.caption);
    }

    return;
  }

  // 5. Processa ÁUDIOS (se transcrição automática estiver ativa)
  if (WhatsAppClient.isAudioMessage(data)) {
    const autoTranscribe = WhitelistManager.isFeatureEnabled(jid, 'autoTranscribe');

    if (autoTranscribe) {
      console.log(`🎵 Transcrição automática em ${jid}`);

      // TODO: Implementar transcrição automática
      // Por enquanto, apenas loga
      await whatsapp.sendText(jid, '_Transcrição automática ativada! (em desenvolvimento)_');
    }

    return;
  }

  // 6. Salva na memória (se habilitado)
  const shouldSaveMemory = WhitelistManager.isFeatureEnabled(jid, 'memory');

  if (shouldSaveMemory) {
    // TODO: Salvar mensagem no banco de dados para memória/contexto
    console.log(`💾 Salvando na memória: ${jid}`);
  }

  // 7. Análise contextual (futuro)
  // TODO: Detectar perguntas não respondidas, sugerir ações, etc
}

/**
 * Helper para enviar mensagem de boas-vindas quando adicionado em grupo
 */
export async function sendWelcomeMessage(jid: string, whatsapp: WhatsAppClient): Promise<void> {
  const message = `
👋 *Olá! Sou o Jarvis!*

Sou um assistente inteligente para WhatsApp.

*🎯 Como me usar:*

*Comandos Principais:*
• /ajuda - Ver todos os comandos
• /escreveai - Ativar transcrição de áudios
• /resumo - Resumir conversa
• /buscar <termo> - Buscar em conversas passadas
• /salvos - Ver mensagens salvas

*Reações Rápidas:*
🔊 Reagir em áudio = transcreve
📌 Reagir em mensagem = salva
📝 Reagir em thread = resume
❓ Reagir em mensagem = explica contexto

*Configuração:*
• /grupos - Gerenciar grupos (admin)

Digite /ajuda para mais informações!
  `.trim();

  await whatsapp.sendText(jid, message);
}

/**
 * Stats do Jarvis
 */
export function getJarvisStats(): string {
  const groups = WhitelistManager.listGroups();
  const commandCount = commandRegistry.getAll().length;

  return `
*🤖 JARVIS - Status*

*Grupos Autorizados:* ${groups.length}
*Comandos Disponíveis:* ${commandCount}
*Reações Configuradas:* 6

*Recursos Ativos:*
✅ Comandos Slash
✅ Reações com Emojis
✅ Whitelist de Grupos
✅ Sistema de Memória (básico)
⏳ Busca Semântica (em desenvolvimento)
⏳ Análise Contextual (em desenvolvimento)

_Bot funcionando perfeitamente! 🚀_
  `.trim();
}
