/**
 * Types para sistema de reações
 */

import type { WhatsAppMessage } from '../../integrations/whatsapp.js';

export interface ReactionEvent {
  messageId: string; // ID da mensagem que foi reagida
  emoji: string; // Emoji usado na reação
  fromMe: boolean; // Se foi você quem reagiu
  jid: string; // Chat onde aconteceu
  timestamp: number;
}

export interface ReactionContext {
  reaction: ReactionEvent;
  originalMessage?: WhatsAppMessage; // Mensagem original (se disponível)
  jid: string;
  sender: string;
  isGroup: boolean;
}

export interface ReactionResponse {
  text?: string;
  media?: {
    url: string;
    caption?: string;
  };
  reply?: boolean; // Se deve responder citando a mensagem original
  replyToMessageId?: string; // ID da mensagem para responder
}

export interface ReactionAction {
  emoji: string;
  name: string;
  description: string;
  category: 'audio' | 'memory' | 'utility' | 'ai';
  execute: (context: ReactionContext) => Promise<ReactionResponse | null>;
}

export interface ReactionRegistry {
  actions: Map<string, ReactionAction>;
  register(action: ReactionAction): void;
  get(emoji: string): ReactionAction | undefined;
  getAll(): ReactionAction[];
}
