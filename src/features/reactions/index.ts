/**
 * Sistema de Reações
 * Exporta tudo necessário para usar reações
 */

export type { ReactionAction, ReactionContext, ReactionResponse, ReactionEvent } from './types.js';
export * from './detector.js';
export { ReactionRegistry, reactionRegistry } from './registry.js';
export * from './actions.js';

import { reactionRegistry } from './registry.js';
import { allReactions } from './actions.js';
import { ReactionDetector } from './detector.js';
import type { WhatsAppWebhookPayload } from '../../integrations/whatsapp.js';
import type { ReactionResponse } from './types.js';

/**
 * Inicializa o sistema de reações
 * Registra todas as ações disponíveis
 */
export function initializeReactions(): void {
  console.log('🎯 Inicializando sistema de reações...');

  for (const reaction of allReactions) {
    reactionRegistry.register(reaction);
  }

  console.log(`✅ ${allReactions.length} reações registradas!`);
}

/**
 * Processa um webhook e executa ação de reação se houver
 */
export async function processReaction(
  payload: WhatsAppWebhookPayload
): Promise<ReactionResponse | null> {
  // Verifica se é reação
  if (!ReactionDetector.isReaction(payload)) {
    return null;
  }

  // Extrai evento
  const event = ReactionDetector.extractReactionEvent(payload);
  if (!event) {
    return null;
  }

  // Ignora remoção de reação
  if (ReactionDetector.isReactionRemoved(event)) {
    console.log('⏭️ Reação removida, ignorando...');
    return null;
  }

  // Normaliza emoji
  const emoji = ReactionDetector.normalizeEmoji(event.emoji);

  // Busca ação
  const action = reactionRegistry.get(emoji);

  if (!action) {
    console.log(`⚠️ Reação não configurada: ${emoji}`);
    return null;
  }

  try {
    console.log(`🎯 Executando reação: ${emoji} -> ${action.name}`);

    // Cria contexto
    const context = await ReactionDetector.createContext(event, payload);

    // Executa ação
    const response = await action.execute(context);

    return response;
  } catch (error) {
    console.error(`Erro ao executar reação ${emoji}:`, error);

    return {
      text: `❌ Erro ao processar reação.\n\n${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      replyToMessageId: event.messageId,
    };
  }
}
