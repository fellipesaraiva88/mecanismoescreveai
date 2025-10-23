/**
 * Detector de reações
 * Processa webhooks de reações do WhatsApp
 */

import type { WhatsAppWebhookPayload } from '../../integrations/whatsapp.js';
import type { ReactionEvent, ReactionContext } from './types.js';
import { WhatsAppClient } from '../../integrations/whatsapp.js';

export class ReactionDetector {
  /**
   * Detecta se um webhook é uma reação
   */
  static isReaction(payload: WhatsAppWebhookPayload): boolean {
    return payload.data.messageType === 'reactionMessage';
  }

  /**
   * Extrai evento de reação do webhook
   */
  static extractReactionEvent(payload: WhatsAppWebhookPayload): ReactionEvent | null {
    const data = payload.data;

    if (data.messageType !== 'reactionMessage') {
      return null;
    }

    const reaction = data.message?.reactionMessage;

    if (!reaction) {
      return null;
    }

    return {
      messageId: reaction.key?.id || '',
      emoji: reaction.text || '', // Emoji usado
      fromMe: data.key.fromMe,
      jid: data.key.remoteJid,
      timestamp: data.messageTimestamp,
    };
  }

  /**
   * Cria contexto de reação
   */
  static async createContext(
    event: ReactionEvent,
    payload: WhatsAppWebhookPayload
  ): Promise<ReactionContext> {
    const jid = event.jid;
    const sender = payload.data.key.participant || payload.data.key.remoteJid;
    const isGroup = WhatsAppClient.isGroup(jid);

    // TODO: Buscar mensagem original do banco de dados/histórico
    // Por enquanto, retorna sem a mensagem original
    const originalMessage = undefined;

    return {
      reaction: event,
      originalMessage,
      jid,
      sender,
      isGroup,
    };
  }

  /**
   * Verifica se a reação foi removida (sem emoji)
   */
  static isReactionRemoved(event: ReactionEvent): boolean {
    return !event.emoji || event.emoji.trim() === '';
  }

  /**
   * Normaliza emoji para comparação
   * Remove variações e normaliza
   */
  static normalizeEmoji(emoji: string): string {
    return emoji.trim();
  }
}
