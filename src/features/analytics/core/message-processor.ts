/**
 * ⚙️ PROCESSADOR DE MENSAGENS DO WHATSAPP
 * Captura mensagens em tempo real e dispara análises
 */

import type { WhatsAppMessage, WhatsAppWebhookPayload } from '../../../integrations/whatsapp.js';
import type { WhatsAppMessageRecord } from './types.js';
import { getDatabase } from './database-service.js';
import { EventEmitter } from 'events';

export interface ProcessedMessage {
  record: WhatsAppMessageRecord;
  isNew: boolean;
}

export class MessageProcessor extends EventEmitter {
  private db = getDatabase();

  constructor() {
    super();
  }

  /**
   * Processa uma mensagem do webhook do WhatsApp
   */
  async processWebhookMessage(payload: WhatsAppWebhookPayload): Promise<ProcessedMessage> {
    const message = payload.data;

    // Extrai informações da mensagem
    const messageRecord: Partial<WhatsAppMessageRecord> = {
      messageId: message.key.id,
      instance: payload.instance,
      conversationJid: message.key.remoteJid,
      senderJid: this.extractSenderJid(message),
      senderName: message.pushName,
      messageType: message.messageType,
      content: this.extractMessageContent(message),
      timestamp: message.messageTimestamp,
      isFromMe: message.key.fromMe,
      quotedMessageId: this.extractQuotedMessageId(message),
      hasMedia: this.hasMedia(message),
      mediaType: this.extractMediaType(message),
    };

    // Salva no banco
    const savedMessage = await this.db.saveMessage(messageRecord);

    // Atualiza participante
    await this.db.upsertParticipant({
      jid: messageRecord.senderJid!,
      name: messageRecord.senderName,
      instance: messageRecord.instance,
    });

    // Atualiza conversa
    const conversationType = this.isGroupMessage(message.key.remoteJid)
      ? 'group'
      : 'private';

    await this.db.upsertConversation({
      jid: messageRecord.conversationJid!,
      type: conversationType,
      instance: messageRecord.instance,
    });

    // Emite eventos para processamento assíncrono
    this.emit('message:saved', savedMessage);
    this.emit('message:analyze', savedMessage);

    // Se é mensagem de grupo, atualiza relacionamentos
    if (conversationType === 'group' && !messageRecord.isFromMe) {
      this.emit('relationship:update', {
        conversationJid: messageRecord.conversationJid,
        participantJid: messageRecord.senderJid,
      });
    }

    return {
      record: savedMessage,
      isNew: true,
    };
  }

  /**
   * Processa múltiplas mensagens em lote (útil para importação de histórico)
   */
  async processBatch(messages: WhatsAppMessage[]): Promise<ProcessedMessage[]> {
    const results: ProcessedMessage[] = [];

    for (const message of messages) {
      try {
        const payload: WhatsAppWebhookPayload = {
          event: 'messages.upsert',
          instance: 'saraiva',
          data: message,
          sender: message.key.remoteJid,
          server_url: '',
          apikey: '',
        };

        const result = await this.processWebhookMessage(payload);
        results.push(result);
      } catch (error) {
        console.error('Error processing message:', error);
      }
    }

    return results;
  }

  // ============================================
  // HELPERS PRIVADOS
  // ============================================

  private extractSenderJid(message: WhatsAppMessage): string {
    // Em grupos, o participant é o sender
    if (message.key.participant) {
      return message.key.participant;
    }

    // Em mensagens diretas, o remoteJid é o sender (se não for fromMe)
    if (message.key.fromMe) {
      // Somos nós - pegar o número da nossa instância
      return 'me@whatsapp';
    }

    return message.key.remoteJid;
  }

  private extractMessageContent(message: WhatsAppMessage): string | undefined {
    const msg = message.message;

    if (!msg) return undefined;

    // Texto simples
    if (msg.conversation) return msg.conversation;

    // Mensagem estendida (com formatação)
    if (msg.extendedTextMessage?.text) return msg.extendedTextMessage.text;

    // Imagem com caption
    if (msg.imageMessage?.caption) return msg.imageMessage.caption;

    // Vídeo com caption
    if (msg.videoMessage?.caption) return msg.videoMessage.caption;

    // Áudio - retorna indicador
    if (msg.audioMessage) return '[ÁUDIO]';

    // Documento
    if (msg.documentMessage) {
      const fileName = msg.documentMessage.fileName || 'documento';
      return `[DOCUMENTO: ${fileName}]`;
    }

    // Sticker
    if (msg.stickerMessage) return '[STICKER]';

    // Localização
    if (msg.locationMessage) {
      const lat = msg.locationMessage.degreesLatitude;
      const lon = msg.locationMessage.degreesLongitude;
      return `[LOCALIZAÇÃO: ${lat}, ${lon}]`;
    }

    // Contato
    if (msg.contactMessage) return '[CONTATO]';

    return undefined;
  }

  private extractQuotedMessageId(message: WhatsAppMessage): string | undefined {
    const contextInfo = message.message?.extendedTextMessage?.contextInfo;
    return contextInfo?.stanzaId;
  }

  private hasMedia(message: WhatsAppMessage): boolean {
    const msg = message.message;
    if (!msg) return false;

    return !!(
      msg.imageMessage ||
      msg.videoMessage ||
      msg.audioMessage ||
      msg.documentMessage ||
      msg.stickerMessage
    );
  }

  private extractMediaType(message: WhatsAppMessage): string | undefined {
    const msg = message.message;
    if (!msg) return undefined;

    if (msg.imageMessage) return 'image';
    if (msg.videoMessage) return 'video';
    if (msg.audioMessage) return 'audio';
    if (msg.documentMessage) return 'document';
    if (msg.stickerMessage) return 'sticker';

    return undefined;
  }

  private isGroupMessage(jid: string): boolean {
    return jid.endsWith('@g.us');
  }

  /**
   * Valida se uma mensagem deve ser processada
   */
  shouldProcessMessage(message: WhatsAppMessage): boolean {
    // Ignora mensagens do sistema
    if (message.messageType === 'protocolMessage') return false;
    if (message.messageType === 'reactionMessage') return false;

    // Ignora mensagens vazias
    if (!this.extractMessageContent(message)) return false;

    return true;
  }

  /**
   * Extrai número do JID
   */
  extractNumber(jid: string): string {
    return jid.split('@')[0];
  }
}

// Singleton instance
let processorInstance: MessageProcessor | null = null;

export function getMessageProcessor(): MessageProcessor {
  if (!processorInstance) {
    processorInstance = new MessageProcessor();
  }
  return processorInstance;
}
