/**
 * Registry de ações de reação
 */

import type { ReactionAction, ReactionRegistry as IReactionRegistry } from './types.js';

export class ReactionRegistry implements IReactionRegistry {
  actions: Map<string, ReactionAction> = new Map();

  /**
   * Registra uma nova ação de reação
   */
  register(action: ReactionAction): void {
    this.actions.set(action.emoji, action);
    console.log(`✅ Reação registrada: ${action.emoji} -> ${action.name}`);
  }

  /**
   * Obtém uma ação por emoji
   */
  get(emoji: string): ReactionAction | undefined {
    return this.actions.get(emoji);
  }

  /**
   * Retorna todas as ações
   */
  getAll(): ReactionAction[] {
    return Array.from(this.actions.values());
  }

  /**
   * Remove uma ação
   */
  unregister(emoji: string): boolean {
    return this.actions.delete(emoji);
  }

  /**
   * Verifica se uma ação existe
   */
  has(emoji: string): boolean {
    return this.actions.has(emoji);
  }

  /**
   * Gera texto de ajuda sobre reações
   */
  generateHelp(): string {
    const actions = this.getAll();

    if (actions.length === 0) {
      return '❌ Nenhuma reação configurada.';
    }

    let help = '*🎯 Reações Disponíveis*\n\n';
    help += '_Reaja em uma mensagem com estes emojis para ações rápidas:_\n\n';

    const categories = new Map<string, ReactionAction[]>();

    for (const action of actions) {
      const existing = categories.get(action.category) || [];
      existing.push(action);
      categories.set(action.category, existing);
    }

    for (const [cat, acts] of categories) {
      help += `*${cat.toUpperCase()}*\n`;

      for (const action of acts) {
        help += `${action.emoji} *${action.name}*\n`;
        help += `   ${action.description}\n\n`;
      }
    }

    return help.trim();
  }
}

// Singleton
export const reactionRegistry = new ReactionRegistry();
