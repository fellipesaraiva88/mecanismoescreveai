/**
 * Parser de comandos slash
 * Detecta e extrai comandos de mensagens do WhatsApp
 */

import type { WhatsAppMessage } from '../../integrations/whatsapp.js';
import type { CommandContext } from './types.js';
import { WhatsAppClient } from '../../integrations/whatsapp.js';

export class CommandParser {
  /**
   * Detecta se uma mensagem é um comando
   */
  static isCommand(message: WhatsAppMessage): boolean {
    const text = this.extractText(message);
    return text.trimStart().startsWith('/');
  }

  /**
   * Extrai texto da mensagem
   */
  static extractText(message: WhatsAppMessage): string {
    // Suporta diferentes tipos de mensagem
    if (message.message?.conversation) {
      return message.message.conversation;
    }

    if (message.message?.extendedTextMessage?.text) {
      return message.message.extendedTextMessage.text;
    }

    if (message.message?.imageMessage?.caption) {
      return message.message.imageMessage.caption;
    }

    if (message.message?.videoMessage?.caption) {
      return message.message.videoMessage.caption;
    }

    return '';
  }

  /**
   * Faz parse de um comando e retorna o contexto
   */
  static parse(message: WhatsAppMessage): CommandContext | null {
    const text = this.extractText(message);

    if (!text.trimStart().startsWith('/')) {
      return null;
    }

    // Remove o / e divide em partes
    const parts = text.trim().substring(1).split(/\s+/);
    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1);

    const jid = message.key.remoteJid;
    const sender = message.key.participant || message.key.remoteJid;
    const isGroup = WhatsAppClient.isGroup(jid);

    return {
      message,
      jid,
      sender,
      args,
      rawText: text,
      isGroup,
      groupName: undefined, // Pode ser populado depois se necessário
    };
  }

  /**
   * Extrai o nome do comando de um contexto
   */
  static getCommandName(context: CommandContext): string {
    const text = context.rawText.trim();
    const parts = text.substring(1).split(/\s+/);
    return parts[0].toLowerCase();
  }

  /**
   * Helper para validar argumentos
   */
  static validateArgs(
    context: CommandContext,
    minArgs: number,
    maxArgs?: number
  ): { valid: boolean; error?: string } {
    if (context.args.length < minArgs) {
      return {
        valid: false,
        error: `❌ Poucos argumentos. Use: ${context.rawText.split(' ')[0]} <argumentos>`,
      };
    }

    if (maxArgs !== undefined && context.args.length > maxArgs) {
      return {
        valid: false,
        error: `❌ Muitos argumentos. Máximo: ${maxArgs}`,
      };
    }

    return { valid: true };
  }

  /**
   * Helper para extrair texto após o comando
   */
  static getFullArgument(context: CommandContext): string {
    return context.args.join(' ');
  }
}
