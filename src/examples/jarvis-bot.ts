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
import { MentionSystem } from '../features/mentions/index.js';
import { UltronSystem } from '../features/audio/index.js';
import { commandRegistry } from '../features/commands/registry.js';
import { gruposCommand } from '../features/whitelist/commands.js';

// Sistema de menções (instância global)
const mentionSystem = new MentionSystem();

// Sistema Ultron de transcrição (instância global)
const ultronSystem = new UltronSystem();

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

  console.log('💬 Sistema de menções ativado');
  console.log('   Use @escreveai para invocar o bot');

  console.log('🎙️  Sistema Ultron ativado');
  console.log('   Transcrição automática de áudios');

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

  // 1. Ignora mensagens enviadas pelo próprio bot
  if (WhatsAppClient.isFromMe(data)) {
    return;
  }

  // 2. Processa ÁUDIOS com Ultron (SEMPRE, em qualquer conversa)
  if (ultronSystem.shouldProcess(payload)) {
    console.log(`🎙️  Áudio detectado em ${jid}`);

    // Processa com Ultron (transcreve + formata + envia)
    await ultronSystem.processAudio(payload, 'saraiva');

    return;
  }

  // 3. Verifica whitelist (para outros tipos de mensagem)
  if (!WhitelistManager.isAllowed(jid, sender)) {
    console.log(`⛔ Mensagem ignorada (whitelist): ${jid}`);
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

  // 4. Processa MENÇÕES (@escreveai)
  if (mentionSystem.isMention(payload)) {
    console.log(`💬 Menção ao bot detectada em ${jid}`);

    // Processa a menção (detector, processador e executor)
    await mentionSystem.processMention(payload, 'saraiva');

    return;
  }

  // 5. Processa COMANDOS SLASH
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

*Menções (Novo! 🔥):*
• @escreveai analisa nossa conversa
• @escreveai resume as últimas mensagens
• @escreveai busca informações sobre X
• @escreveai explica esse contexto

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
✅ Ultron - Transcrição de Áudios 🎙️
✅ Menções com IA (@escreveai) 🔥
✅ Comandos Slash
✅ Reações com Emojis
✅ Whitelist de Grupos
✅ Sistema de Memória (básico)
⏳ Busca Semântica (em desenvolvimento)
⏳ Análise Contextual (em desenvolvimento)

_Bot funcionando perfeitamente! 🚀_
  `.trim();
}
