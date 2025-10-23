/**
 * Gerenciador de Whitelist
 * Controla quais grupos/chats têm permissão para usar o bot
 */

import { ALLOWED_GROUPS, BOT_CONFIG, type GroupConfig } from '../../config/groups.js';
import { WhatsAppClient } from '../../integrations/whatsapp.js';

export class WhitelistManager {
  private static allowedGroups: Map<string, GroupConfig> = new Map();

  /**
   * Inicializa a whitelist
   */
  static initialize(): void {
    console.log('🔐 Inicializando whitelist de grupos...');

    for (const group of ALLOWED_GROUPS) {
      this.allowedGroups.set(group.jid, group);
    }

    console.log(`✅ ${this.allowedGroups.size} grupos autorizados`);
  }

  /**
   * Verifica se um JID está autorizado
   */
  static isAllowed(jid: string, sender?: string): boolean {
    // Conversas privadas
    if (WhatsAppClient.isPrivate(jid)) {
      // Verifica se conversas privadas são permitidas
      if (!BOT_CONFIG.allowPrivateChats) {
        return false;
      }

      // Se for o admin, sempre permite
      if (sender === BOT_CONFIG.adminNumber) {
        return true;
      }

      return true; // Permite conversas privadas por padrão
    }

    // Grupos
    if (WhatsAppClient.isGroup(jid)) {
      // Se for o admin e a config permite grupos não autorizados para o owner
      if (sender === BOT_CONFIG.adminNumber && BOT_CONFIG.allowUnauthorizedGroupsForOwner) {
        return true;
      }

      // Verifica whitelist
      return this.allowedGroups.has(jid);
    }

    return false;
  }

  /**
   * Obtém configuração de um grupo
   */
  static getGroupConfig(jid: string): GroupConfig | undefined {
    return this.allowedGroups.get(jid);
  }

  /**
   * Verifica se uma feature está habilitada para um grupo
   */
  static isFeatureEnabled(jid: string, feature: keyof GroupConfig['features']): boolean {
    const config = this.getGroupConfig(jid);

    if (!config) {
      // Se não está na whitelist, verifica se é conversa privada
      if (WhatsAppClient.isPrivate(jid) && BOT_CONFIG.allowPrivateChats) {
        return true; // Todas features habilitadas em privado
      }

      return false;
    }

    return config.features[feature];
  }

  /**
   * Adiciona um grupo à whitelist (admin only)
   */
  static addGroup(jid: string, name: string, config?: Partial<GroupConfig['features']>): void {
    const groupConfig: GroupConfig = {
      jid,
      name,
      features: {
        commands: config?.commands ?? true,
        reactions: config?.reactions ?? true,
        autoTranscribe: config?.autoTranscribe ?? false,
        memory: config?.memory ?? true,
      },
      adminOnly: false,
    };

    this.allowedGroups.set(jid, groupConfig);
    console.log(`✅ Grupo adicionado à whitelist: ${name} (${jid})`);
  }

  /**
   * Remove um grupo da whitelist (admin only)
   */
  static removeGroup(jid: string): boolean {
    const removed = this.allowedGroups.delete(jid);

    if (removed) {
      console.log(`🗑️ Grupo removido da whitelist: ${jid}`);
    }

    return removed;
  }

  /**
   * Lista todos os grupos autorizados
   */
  static listGroups(): GroupConfig[] {
    return Array.from(this.allowedGroups.values());
  }

  /**
   * Verifica se o sender é admin
   */
  static isAdmin(sender: string): boolean {
    return sender === BOT_CONFIG.adminNumber;
  }

  /**
   * Gera texto de status da whitelist
   */
  static generateStatus(): string {
    const groups = this.listGroups();

    let status = '*🔐 Whitelist de Grupos*\n\n';
    status += `*Total:* ${groups.length} grupos autorizados\n\n`;

    if (groups.length === 0) {
      status += '_Nenhum grupo autorizado ainda._\n';
    } else {
      status += '*Grupos Autorizados:*\n';

      for (const group of groups) {
        status += `\n📍 *${group.name}*\n`;
        status += `   ID: \`${group.jid}\`\n`;
        status += `   Comandos: ${group.features.commands ? '✅' : '❌'}\n`;
        status += `   Reações: ${group.features.reactions ? '✅' : '❌'}\n`;
        status += `   Auto-Transcrição: ${group.features.autoTranscribe ? '✅' : '❌'}\n`;
        status += `   Memória: ${group.features.memory ? '✅' : '❌'}\n`;
      }
    }

    status += `\n*Configurações Globais:*\n`;
    status += `• Conversas Privadas: ${BOT_CONFIG.allowPrivateChats ? '✅ Permitidas' : '❌ Bloqueadas'}\n`;
    status += `• Admin: \`${BOT_CONFIG.adminNumber}\`\n`;

    return status;
  }
}

// Inicializa automaticamente
WhitelistManager.initialize();
