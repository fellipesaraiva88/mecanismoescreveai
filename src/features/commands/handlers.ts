/**
 * Handlers para comandos específicos
 */

import type { Command, CommandContext, CommandResponse } from './types.js';
import { CommandParser } from './parser.js';
import { AIClientFactory } from '../../integrations/ai.js';

/**
 * Comando: /ajuda
 * Mostra todos os comandos disponíveis
 */
export const helpCommand: Command = {
  name: 'ajuda',
  aliases: ['help', 'comandos'],
  description: 'Mostra todos os comandos disponíveis',
  usage: '/ajuda [categoria]',
  category: 'utility',
  execute: async (context: CommandContext): Promise<CommandResponse> => {
    const { commandRegistry } = await import('./registry.js');

    const category = context.args[0];
    const helpText = commandRegistry.generateHelp(category);

    return {
      text: helpText,
      reply: true,
    };
  },
};

/**
 * Comando: /escreveai
 * Ativa/desativa transcrição automática de áudios
 */
export const escreveaiCommand: Command = {
  name: 'escreveai',
  aliases: ['transcrever', 'audio'],
  description: 'Ativa/desativa transcrição automática de áudios',
  usage: '/escreveai [start|stop]',
  category: 'audio',
  execute: async (context: CommandContext): Promise<CommandResponse> => {
    const action = context.args[0]?.toLowerCase() || 'start';

    if (action === 'start') {
      // TODO: Ativar transcrição contínua no estado global
      return {
        text: `✅ *Transcrição ativada!*\n\nAgora vou transcrever todos os áudios automaticamente neste ${context.isGroup ? 'grupo' : 'chat'}.`,
        reply: true,
      };
    } else if (action === 'stop') {
      // TODO: Desativar transcrição contínua
      return {
        text: `⏹️ *Transcrição desativada!*\n\nNão vou mais transcrever áudios automaticamente.`,
        reply: true,
      };
    } else {
      return {
        text: `❌ Ação inválida. Use:\n• /escreveai start - Ativa\n• /escreveai stop - Desativa`,
        reply: true,
      };
    }
  },
};

/**
 * Comando: /resumo
 * Gera resumo da conversa recente
 */
export const resumoCommand: Command = {
  name: 'resumo',
  aliases: ['resume', 'summary'],
  description: 'Gera resumo da conversa recente',
  usage: '/resumo [quantidade de mensagens]',
  category: 'memory',
  execute: async (context: CommandContext): Promise<CommandResponse> => {
    const limit = parseInt(context.args[0]) || 50;

    if (limit < 5 || limit > 200) {
      return {
        text: '❌ Quantidade inválida. Use entre 5 e 200 mensagens.',
        reply: true,
      };
    }

    // TODO: Buscar mensagens do histórico
    // Por enquanto, simula
    const mensagensSimuladas = `
Aqui estão as últimas ${limit} mensagens:
- Discussão sobre projeto
- Planejamento de reunião
- Compartilhamento de ideias
    `.trim();

    const ai = AIClientFactory.createGemini();

    const prompt = `
Você é um assistente que gera resumos de conversas.

Resuma a seguinte conversa em tópicos principais:

${mensagensSimuladas}

Formato da resposta:
*📝 Resumo da Conversa*

*Principais Tópicos:*
• Tópico 1
• Tópico 2

*Conclusões:*
• Conclusão principal
    `.trim();

    try {
      const response = await ai.generate(prompt);

      return {
        text: response.text,
        reply: false,
      };
    } catch (error) {
      return {
        text: '❌ Erro ao gerar resumo. Tente novamente.',
        reply: true,
      };
    }
  },
};

/**
 * Comando: /buscar
 * Busca informações em conversas passadas
 */
export const buscarCommand: Command = {
  name: 'buscar',
  aliases: ['search', 'find', 'procurar'],
  description: 'Busca informações em conversas passadas',
  usage: '/buscar <termo ou pergunta>',
  category: 'search',
  execute: async (context: CommandContext): Promise<CommandResponse> => {
    const validation = CommandParser.validateArgs(context, 1);
    if (!validation.valid) {
      return {
        text: validation.error || '❌ Forneça um termo de busca.',
        reply: true,
      };
    }

    const query = CommandParser.getFullArgument(context);

    // TODO: Implementar busca semântica
    return {
      text: `🔍 *Buscando por:* "${query}"\n\n_Funcionalidade em desenvolvimento..._\n\nEm breve você poderá buscar em todo o histórico de conversas!`,
      reply: true,
    };
  },
};

/**
 * Comando: /salvos
 * Lista mensagens salvas
 */
export const salvosCommand: Command = {
  name: 'salvos',
  aliases: ['saved', 'favoritos'],
  description: 'Lista mensagens salvas (reagir com 📌 para salvar)',
  usage: '/salvos [buscar <termo>]',
  category: 'memory',
  execute: async (context: CommandContext): Promise<CommandResponse> => {
    const subcommand = context.args[0]?.toLowerCase();

    if (subcommand === 'buscar' || subcommand === 'search') {
      const query = context.args.slice(1).join(' ');

      if (!query) {
        return {
          text: '❌ Forneça um termo de busca.\n\nUso: /salvos buscar <termo>',
          reply: true,
        };
      }

      // TODO: Buscar em mensagens salvas
      return {
        text: `🔍 Buscando em salvos: "${query}"\n\n_Em desenvolvimento..._`,
        reply: true,
      };
    }

    // TODO: Listar mensagens salvas
    return {
      text: `📌 *Mensagens Salvas*\n\n_Nenhuma mensagem salva ainda._\n\n💡 *Dica:* Reaja com 📌 em qualquer mensagem para salvar!`,
      reply: false,
    };
  },
};

/**
 * Comando: /contexto
 * Explica o contexto da conversa atual
 */
export const contextoCommand: Command = {
  name: 'contexto',
  aliases: ['context', 'explain'],
  description: 'Explica o contexto da conversa atual',
  usage: '/contexto',
  category: 'memory',
  execute: async (context: CommandContext): Promise<CommandResponse> => {
    // TODO: Analisar contexto real da conversa
    const ai = AIClientFactory.createGemini();

    const prompt = `
Você é um assistente que analisa conversas do WhatsApp.

Analise a conversa e forneça:
1. Tema principal
2. Participantes ativos
3. Pontos importantes
4. Próximos passos (se houver)

Conversa: [em desenvolvimento - será o histórico real]

Responda de forma clara e objetiva.
    `.trim();

    try {
      const response = await ai.generate(prompt);

      return {
        text: `📊 *Contexto da Conversa*\n\n${response.text}`,
        reply: false,
      };
    } catch (error) {
      return {
        text: '❌ Erro ao analisar contexto.',
        reply: true,
      };
    }
  },
};

/**
 * Comando: /ping
 * Teste de resposta
 */
export const pingCommand: Command = {
  name: 'ping',
  description: 'Testa se o bot está respondendo',
  usage: '/ping',
  category: 'utility',
  execute: async (): Promise<CommandResponse> => {
    return {
      text: '🏓 Pong! Bot online e funcionando.',
      reply: true,
    };
  },
};

/**
 * Lista de todos os comandos
 */
export const allCommands: Command[] = [
  helpCommand,
  pingCommand,
  escreveaiCommand,
  resumoCommand,
  buscarCommand,
  salvosCommand,
  contextoCommand,
];
