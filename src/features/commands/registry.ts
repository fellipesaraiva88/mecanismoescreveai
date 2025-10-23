/**
 * Registry de comandos
 * Gerencia todos os comandos disponíveis
 */

import type { Command, CommandRegistry as ICommandRegistry } from './types.js';

export class CommandRegistry implements ICommandRegistry {
  commands: Map<string, Command> = new Map();
  private aliases: Map<string, string> = new Map(); // alias -> commandName

  /**
   * Registra um novo comando
   */
  register(command: Command): void {
    this.commands.set(command.name, command);

    // Registra aliases
    if (command.aliases) {
      for (const alias of command.aliases) {
        this.aliases.set(alias.toLowerCase(), command.name);
      }
    }

    console.log(`✅ Comando registrado: /${command.name}`);
  }

  /**
   * Obtém um comando pelo nome ou alias
   */
  get(name: string): Command | undefined {
    const lowerName = name.toLowerCase();

    // Verifica se é um alias
    const aliasedName = this.aliases.get(lowerName);
    if (aliasedName) {
      return this.commands.get(aliasedName);
    }

    // Busca direto
    return this.commands.get(lowerName);
  }

  /**
   * Retorna todos os comandos
   */
  getAll(): Command[] {
    return Array.from(this.commands.values());
  }

  /**
   * Retorna comandos por categoria
   */
  getByCategory(category: string): Command[] {
    return this.getAll().filter((cmd) => cmd.category === category);
  }

  /**
   * Remove um comando
   */
  unregister(name: string): boolean {
    const command = this.commands.get(name);
    if (!command) return false;

    // Remove aliases
    if (command.aliases) {
      for (const alias of command.aliases) {
        this.aliases.delete(alias.toLowerCase());
      }
    }

    return this.commands.delete(name);
  }

  /**
   * Verifica se um comando existe
   */
  has(name: string): boolean {
    return this.get(name) !== undefined;
  }

  /**
   * Gera texto de ajuda
   */
  generateHelp(category?: string): string {
    let commands = this.getAll();

    if (category) {
      commands = this.getByCategory(category);
    }

    if (commands.length === 0) {
      return '❌ Nenhum comando disponível.';
    }

    const categories = new Map<string, Command[]>();

    for (const cmd of commands) {
      const existing = categories.get(cmd.category) || [];
      existing.push(cmd);
      categories.set(cmd.category, existing);
    }

    let help = '*🤖 Comandos Disponíveis*\n\n';

    for (const [cat, cmds] of categories) {
      const icon = this.getCategoryIcon(cat);
      help += `*${icon} ${cat.toUpperCase()}*\n`;

      for (const cmd of cmds) {
        help += `• /${cmd.name}`;
        if (cmd.aliases && cmd.aliases.length > 0) {
          help += ` (ou /${cmd.aliases.join(', /')})`;
        }
        help += `\n  ${cmd.description}\n`;
        help += `  _Uso: ${cmd.usage}_\n\n`;
      }
    }

    return help.trim();
  }

  /**
   * Helper para ícones de categoria
   */
  private getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      audio: '🎵',
      search: '🔍',
      memory: '💾',
      utility: '🛠️',
      admin: '👑',
    };

    return icons[category] || '📌';
  }
}

// Singleton
export const commandRegistry = new CommandRegistry();
