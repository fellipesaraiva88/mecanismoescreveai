/**
 * Types para sistema de comandos slash
 */

import type { WhatsAppMessage } from '../../integrations/whatsapp.js';

export interface CommandContext {
  message: WhatsAppMessage;
  jid: string;
  sender: string;
  args: string[];
  rawText: string;
  isGroup: boolean;
  groupName?: string;
}

export interface CommandResponse {
  text?: string;
  media?: {
    url: string;
    caption?: string;
  };
  reply?: boolean; // Se deve responder citando a mensagem original
}

export interface Command {
  name: string;
  aliases?: string[];
  description: string;
  usage: string;
  category: 'audio' | 'search' | 'memory' | 'utility' | 'admin';
  adminOnly?: boolean;
  execute: (context: CommandContext) => Promise<CommandResponse | null>;
}

export interface CommandRegistry {
  commands: Map<string, Command>;
  register(command: Command): void;
  get(name: string): Command | undefined;
  getAll(): Command[];
  getByCategory(category: string): Command[];
}
