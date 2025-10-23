/**
 * Integração com WhatsApp via Evolution API
 */

import axios, { type AxiosInstance } from 'axios';

export interface WhatsAppMessage {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
    participant?: string;
  };
  pushName?: string;
  message: any;
  messageType: string;
  messageTimestamp: number;
  instanceId: string;
}

export interface WhatsAppWebhookPayload {
  event: string;
  instance: string;
  data: WhatsAppMessage;
  sender: string;
  server_url: string;
  apikey: string;
}

export interface SendMessageOptions {
  number: string;
  text?: string;
  media?: {
    url: string;
    caption?: string;
  };
}

export class WhatsAppClient {
  private client: AxiosInstance;

  constructor(
    private baseURL: string,
    private apiKey: string,
    private instance: string = 'saraiva'
  ) {
    this.client = axios.create({
      baseURL,
      headers: {
        apikey: apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Envia uma mensagem de texto
   */
  async sendText(to: string, text: string): Promise<any> {
    return this.client.post(`/message/sendText/${this.instance}`, {
      number: to,
      text,
    });
  }

  /**
   * Envia uma mídia (áudio, imagem, vídeo, etc)
   */
  async sendMedia(to: string, mediaUrl: string, caption?: string): Promise<any> {
    return this.client.post(`/message/sendMedia/${this.instance}`, {
      number: to,
      mediaUrl,
      caption,
    });
  }

  /**
   * Envia um áudio
   */
  async sendAudio(to: string, audioUrl: string): Promise<any> {
    return this.client.post(`/message/sendWhatsAppAudio/${this.instance}`, {
      number: to,
      audioUrl,
    });
  }

  /**
   * Obtém informações de uma mensagem
   */
  async getMessageInfo(messageId: string): Promise<any> {
    return this.client.get(`/chat/findMessages/${this.instance}`, {
      params: { id: messageId },
    });
  }

  /**
   * Obtém o histórico de conversa
   */
  async getConversationHistory(jid: string, limit: number = 50): Promise<any> {
    return this.client.get(`/chat/findMessages/${this.instance}`, {
      params: {
        where: JSON.stringify({ key: { remoteJid: jid } }),
        limit
      },
    });
  }

  /**
   * Marca mensagem como lida
   */
  async markAsRead(messageId: string): Promise<any> {
    return this.client.post(`/chat/markMessageAsRead/${this.instance}`, {
      messageId,
    });
  }

  /**
   * Helpers para análise de mensagens
   */
  static isGroup(jid: string): boolean {
    return jid.endsWith('@g.us');
  }

  static isPrivate(jid: string): boolean {
    return jid.endsWith('@s.whatsapp.net');
  }

  static extractNumber(jid: string): string {
    return jid.split('@')[0];
  }

  static isAudioMessage(message: WhatsAppMessage): boolean {
    return message.messageType === 'audioMessage';
  }

  static getAudioUrl(message: WhatsAppMessage): string | null {
    return message.message?.audioMessage?.url || null;
  }

  static getAudioDuration(message: WhatsAppMessage): number {
    return message.message?.audioMessage?.seconds || 0;
  }

  static isFromMe(message: WhatsAppMessage): boolean {
    return message.key.fromMe;
  }
}

/**
 * Helpers para criar respostas formatadas
 */
export class WhatsAppFormatter {
  /**
   * Formata texto em negrito
   */
  static bold(text: string): string {
    return `*${text}*`;
  }

  /**
   * Formata texto em itálico
   */
  static italic(text: string): string {
    return `_${text}_`;
  }

  /**
   * Formata texto tachado
   */
  static strikethrough(text: string): string {
    return `~${text}~`;
  }

  /**
   * Formata texto monoespaçado
   */
  static monospace(text: string): string {
    return `\`\`\`${text}\`\`\``;
  }

  /**
   * Cria um botão "Ler Mais" truncando texto longo
   */
  static truncateWithReadMore(text: string, maxLength: number = 300): string {
    if (text.length <= maxLength) {
      return text;
    }

    const truncated = text.substring(0, maxLength);
    return `${truncated}...\n\n_Digite "ler mais" para ver o texto completo_`;
  }

  /**
   * Remove caracteres especiais que podem quebrar formatação
   */
  static sanitize(text: string): string {
    return text
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove caracteres de controle
      .trim();
  }
}
