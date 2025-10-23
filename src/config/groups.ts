/**
 * Configuração de grupos permitidos
 * Whitelist de grupos onde o bot pode funcionar
 */

export interface GroupConfig {
  jid: string; // ID do grupo
  name: string; // Nome descritivo
  features: {
    commands: boolean; // Comandos slash habilitados
    reactions: boolean; // Reações habilitadas
    autoTranscribe: boolean; // Transcrição automática
    memory: boolean; // Salvar mensagens para memória
  };
  adminOnly?: boolean; // Se apenas admins podem usar comandos
}

/**
 * Lista de grupos permitidos
 * Adicione os IDs dos grupos que você quer autorizar
 */
export const ALLOWED_GROUPS: GroupConfig[] = [
  {
    jid: '120363404369363372@g.us', // Exemplo do workflow Ultron
    name: 'Grupo Exemplo',
    features: {
      commands: true,
      reactions: true,
      autoTranscribe: false,
      memory: true,
    },
    adminOnly: false,
  },
  // Adicione mais grupos aqui...
];

/**
 * Configuração global do bot
 */
export const BOT_CONFIG = {
  // Número do bot (opcional, para identificação)
  botNumber: process.env.BOT_NUMBER || '',

  // Prefixo para comandos (padrão: /)
  commandPrefix: '/',

  // Admin principal (seu número)
  adminNumber: process.env.ADMIN_NUMBER || '5511991143605@s.whatsapp.net',

  // Permitir em conversas privadas?
  allowPrivateChats: true,

  // Permitir em grupos não autorizados? (apenas para owner)
  allowUnauthorizedGroupsForOwner: true,

  // Linguagem padrão
  language: 'pt-BR',

  // Timezone
  timezone: 'America/Sao_Paulo',
};
