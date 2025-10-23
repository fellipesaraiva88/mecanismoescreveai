/**
 * Detector de menções ao bot
 * Identifica quando o bot é mencionado em mensagens
 */

import type { WhatsAppWebhookPayload } from '../../types/webhook.js';

export interface MentionEvent {
  messageId: string;
  jid: string; // Grupo ou chat privado
  fromMe: boolean;
  sender: string; // Quem mencionou
  text: string; // Texto completo da mensagem
  request: string; // Texto após a menção
  timestamp: number;
  mentionedNumbers: string[]; // Números mencionados
}

export class MentionDetector {
  private static BOT_TRIGGERS = ['@escreveai', 'escreveai'];

  /**
   * Detecta se uma mensagem menciona o bot
   */
  static isMention(payload: WhatsAppWebhookPayload): boolean {
    const data = payload.data;

    // Mensagens do próprio bot não contam
    if (data.key.fromMe) {
      return false;
    }

    const text = this.extractText(data);
    if (!text) {
      return false;
    }

    // Verifica se contém algum dos triggers
    const lowerText = text.toLowerCase();
    return this.BOT_TRIGGERS.some((trigger) => lowerText.includes(trigger));
  }

  /**
   * Extrai o evento de menção
   */
  static extractMentionEvent(
    payload: WhatsAppWebhookPayload
  ): MentionEvent | null {
    if (!this.isMention(payload)) {
      return null;
    }

    const data = payload.data;
    const text = this.extractText(data) || '';
    const request = this.extractRequest(text);

    // Extrai números mencionados (se houver)
    const mentionedNumbers = this.extractMentionedNumbers(data);

    return {
      messageId: data.key.id || '',
      jid: data.key.remoteJid,
      fromMe: data.key.fromMe,
      sender: data.pushName || data.key.participant || 'Unknown',
      text,
      request,
      timestamp: data.messageTimestamp,
      mentionedNumbers,
    };
  }

  /**
   * Extrai o texto da mensagem (suporta vários tipos)
   */
  private static extractText(data: any): string | null {
    const msg = data.message;

    if (!msg) {
      return null;
    }

    // Mensagem de texto simples
    if (msg.conversation) {
      return msg.conversation;
    }

    // Mensagem estendida (com menções, links, etc)
    if (msg.extendedTextMessage?.text) {
      return msg.extendedTextMessage.text;
    }

    // Mensagem de imagem com legenda
    if (msg.imageMessage?.caption) {
      return msg.imageMessage.caption;
    }

    // Mensagem de vídeo com legenda
    if (msg.videoMessage?.caption) {
      return msg.videoMessage.caption;
    }

    return null;
  }

  /**
   * Extrai o pedido após a menção
   * Ex: "@escreveai analisa nossa conversa" -> "analisa nossa conversa"
   */
  private static extractRequest(text: string): string {
    const lowerText = text.toLowerCase();

    // Encontra a posição do trigger
    for (const trigger of this.BOT_TRIGGERS) {
      const index = lowerText.indexOf(trigger);
      if (index !== -1) {
        // Pega o texto após o trigger
        let request = text.substring(index + trigger.length).trim();

        // Remove vírgulas, dois pontos, etc no início
        request = request.replace(/^[,:]?\s*/, '');

        return request;
      }
    }

    return text;
  }

  /**
   * Extrai números mencionados (se houver)
   */
  private static extractMentionedNumbers(data: any): string[] {
    const msg = data.message;

    // Verifica se há menções na mensagem extendida
    if (msg?.extendedTextMessage?.contextInfo?.mentionedJid) {
      return msg.extendedTextMessage.contextInfo.mentionedJid;
    }

    return [];
  }
}
