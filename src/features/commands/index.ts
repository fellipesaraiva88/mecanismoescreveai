/**
 * Sistema de Comandos Slash
 * Exporta tudo necessário para usar comandos
 */

export type { Command, CommandContext, CommandResponse } from './types.js';
export * from './parser.js';
export { CommandRegistry, commandRegistry } from './registry.js';
export * from './handlers.js';

import { commandRegistry } from './registry.js';
import { allCommands } from './handlers.js';
import { CommandParser } from './parser.js';
import type { WhatsAppMessage } from '../../integrations/whatsapp.js';
import type { CommandResponse } from './types.js';

/**
 * Inicializa o sistema de comandos
 * Registra todos os comandos disponíveis
 */
export function initializeCommands(): void {
  console.log('🔧 Inicializando sistema de comandos...');

  for (const command of allCommands) {
    commandRegistry.register(command);
  }

  console.log(`✅ ${allCommands.length} comandos registrados!`);
}

/**
 * Processa uma mensagem e executa comando se houver
 */
export async function processCommand(
  message: WhatsAppMessage
): Promise<CommandResponse | null> {
  // Verifica se é comando
  if (!CommandParser.isCommand(message)) {
    return null;
  }

  // Faz parse
  const context = CommandParser.parse(message);
  if (!context) {
    return null;
  }

  // Obtém nome do comando
  const commandName = CommandParser.getCommandName(context);

  // Busca comando
  const command = commandRegistry.get(commandName);

  if (!command) {
    return {
      text: `❌ Comando desconhecido: /${commandName}\n\nDigite /ajuda para ver comandos disponíveis.`,
      reply: true,
    };
  }

  // Verifica se é admin only
  if (command.adminOnly) {
    // TODO: Verificar se é admin
    return {
      text: '❌ Este comando é apenas para administradores.',
      reply: true,
    };
  }

  try {
    console.log(`📝 Executando comando: /${command.name}`);

    // Executa comando
    const response = await command.execute(context);

    return response;
  } catch (error) {
    console.error(`Erro ao executar comando /${command.name}:`, error);

    return {
      text: `❌ Erro ao executar comando.\n\n${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      reply: true,
    };
  }
}
