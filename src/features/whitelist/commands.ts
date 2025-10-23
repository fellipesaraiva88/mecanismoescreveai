/**
 * Comandos admin para gerenciar whitelist
 */

import type { Command } from '../commands/types.js';
import { WhitelistManager } from './manager.js';
import { CommandParser } from '../commands/parser.js';

/**
 * Comando: /grupos
 * Lista grupos autorizados (admin only)
 */
export const gruposCommand: Command = {
  name: 'grupos',
  aliases: ['groups', 'whitelist'],
  description: 'Lista grupos autorizados (admin only)',
  usage: '/grupos [add|remove|list]',
  category: 'admin',
  adminOnly: true,
  execute: async (context) => {
    // Verifica se é admin
    if (!WhitelistManager.isAdmin(context.sender)) {
      return {
        text: '❌ Apenas administradores podem usar este comando.',
        reply: true,
      };
    }

    const subcommand = context.args[0]?.toLowerCase();

    // /grupos list (ou sem argumentos)
    if (!subcommand || subcommand === 'list') {
      const status = WhitelistManager.generateStatus();
      return {
        text: status,
        reply: false,
      };
    }

    // /grupos add <jid> <nome>
    if (subcommand === 'add') {
      if (context.args.length < 3) {
        return {
          text: '❌ Uso: /grupos add <jid> <nome do grupo>',
          reply: true,
        };
      }

      const jid = context.args[1];
      const name = context.args.slice(2).join(' ');

      WhitelistManager.addGroup(jid, name);

      return {
        text: `✅ Grupo "${name}" adicionado à whitelist!\n\nJID: \`${jid}\``,
        reply: true,
      };
    }

    // /grupos remove <jid>
    if (subcommand === 'remove' || subcommand === 'rm') {
      if (context.args.length < 2) {
        return {
          text: '❌ Uso: /grupos remove <jid>',
          reply: true,
        };
      }

      const jid = context.args[1];
      const removed = WhitelistManager.removeGroup(jid);

      if (removed) {
        return {
          text: `✅ Grupo removido da whitelist!\n\nJID: \`${jid}\``,
          reply: true,
        };
      } else {
        return {
          text: `❌ Grupo não encontrado na whitelist.\n\nJID: \`${jid}\``,
          reply: true,
        };
      }
    }

    // /grupos current (mostra JID do grupo atual)
    if (subcommand === 'current' || subcommand === 'este') {
      if (!context.isGroup) {
        return {
          text: '❌ Este comando só funciona em grupos.',
          reply: true,
        };
      }

      const isAllowed = WhitelistManager.isAllowed(context.jid);

      return {
        text: `📍 *Grupo Atual*\n\nJID: \`${context.jid}\`\n\nStatus: ${isAllowed ? '✅ Autorizado' : '❌ Não autorizado'}\n\n💡 *Dica:* Copie o JID acima para adicionar à whitelist.`,
        reply: false,
      };
    }

    return {
      text: `❌ Subcomando desconhecido: ${subcommand}\n\nUso:\n• /grupos list - Lista grupos\n• /grupos add <jid> <nome> - Adiciona grupo\n• /grupos remove <jid> - Remove grupo\n• /grupos current - Mostra JID do grupo atual`,
      reply: true,
    };
  },
};
