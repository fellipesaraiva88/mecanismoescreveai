/**
 * Coletor de Mensagens do Evolution API
 * Busca histórico completo e salva no PostgreSQL
 */

import axios from 'axios';
import pg from 'pg';

const { Pool } = pg;

interface EvolutionMessage {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
    participant?: string;
  };
  pushName?: string;
  messageType: string;
  message: any;
  messageTimestamp: number;
}

export class MessageCollector {
  private pool: Pool;
  private evolutionApiUrl: string;
  private evolutionApiKey: string;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    this.evolutionApiUrl = process.env.EVOLUTION_API_URL || '';
    this.evolutionApiKey = process.env.EVOLUTION_API_KEY || '';
  }

  /**
   * Coleta todas as mensagens de uma instância
   */
  async collectAllMessages(instance: string = 'saraiva'): Promise<void> {
    console.log(`\n📥 ================================`);
    console.log(`📥   COLETANDO MENSAGENS`);
    console.log(`📥 ================================\n`);
    console.log(`Instance: ${instance}`);

    try {
      // 1. Busca todas as conversas
      const conversations = await this.fetchAllConversations(instance);
      console.log(`✅ Encontradas ${conversations.length} conversas`);

      let totalMessages = 0;

      // 2. Para cada conversa, busca as mensagens
      for (const conversation of conversations) {
        console.log(`\n📂 Processando: ${conversation.name || conversation.jid}`);

        try {
          const messages = await this.fetchConversationMessages(
            instance,
            conversation.jid
          );

          if (messages.length > 0) {
            await this.saveMessages(messages, instance);
            await this.saveConversation(conversation, instance);
            totalMessages += messages.length;

            console.log(`   ✅ ${messages.length} mensagens salvas`);
          } else {
            console.log(`   ℹ️  Sem mensagens`);
          }
        } catch (error) {
          console.error(`   ❌ Erro ao processar conversa:`, error);
        }
      }

      console.log(`\n✅ Coleta concluída!`);
      console.log(`   Total de mensagens: ${totalMessages}`);
      console.log(`   Total de conversas: ${conversations.length}\n`);
      console.log(`📥 ================================\n`);
    } catch (error) {
      console.error('❌ Erro na coleta:', error);
      throw error;
    }
  }

  /**
   * Busca todas as conversas da instância
   */
  private async fetchAllConversations(instance: string): Promise<any[]> {
    try {
      const response = await axios.get(
        `${this.evolutionApiUrl}/chat/findChats/${instance}`,
        {
          headers: {
            apikey: this.evolutionApiKey,
          },
        }
      );

      return response.data || [];
    } catch (error) {
      console.error('Erro ao buscar conversas:', error);
      return [];
    }
  }

  /**
   * Busca mensagens de uma conversa específica
   */
  private async fetchConversationMessages(
    instance: string,
    jid: string
  ): Promise<EvolutionMessage[]> {
    try {
      const response = await axios.post(
        `${this.evolutionApiUrl}/chat/fetchMessages/${instance}`,
        {
          number: jid,
          limit: 1000, // Máximo por requisição
        },
        {
          headers: {
            apikey: this.evolutionApiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data || [];
    } catch (error) {
      // Algumas conversas podem não ter mensagens acessíveis
      return [];
    }
  }

  /**
   * Salva mensagens no banco de dados
   */
  private async saveMessages(
    messages: EvolutionMessage[],
    instance: string
  ): Promise<void> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      for (const msg of messages) {
        // Extrai conteúdo da mensagem
        const content = this.extractContent(msg);
        const mediaType = this.extractMediaType(msg);

        // Extrai informações do participante
        const senderJid =
          msg.key.participant || msg.key.remoteJid;
        const senderName = msg.pushName || null;

        await client.query(
          `INSERT INTO messages (
            message_id, instance, conversation_jid, sender_jid, sender_name,
            message_type, content, timestamp, is_from_me, has_media, media_type
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (message_id) DO NOTHING`,
          [
            msg.key.id,
            instance,
            msg.key.remoteJid,
            senderJid,
            senderName,
            msg.messageType,
            content,
            msg.messageTimestamp,
            msg.key.fromMe,
            mediaType !== null,
            mediaType,
          ]
        );

        // Salva ou atualiza participante
        if (!msg.key.fromMe) {
          await this.saveParticipant(client, senderJid, senderName, instance);
        }
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Salva informações da conversa
   */
  private async saveConversation(
    conversation: any,
    instance: string
  ): Promise<void> {
    const client = await this.pool.connect();

    try {
      const type = conversation.jid.includes('@g.us') ? 'group' : 'private';
      const name = conversation.name || conversation.jid;

      await client.query(
        `INSERT INTO conversations (jid, name, type, instance)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (jid) DO UPDATE SET
          name = EXCLUDED.name,
          updated_at = CURRENT_TIMESTAMP`,
        [conversation.jid, name, type, instance]
      );
    } finally {
      client.release();
    }
  }

  /**
   * Salva ou atualiza participante
   */
  private async saveParticipant(
    client: any,
    jid: string,
    name: string | null,
    instance: string
  ): Promise<void> {
    await client.query(
      `INSERT INTO participants (jid, name, instance, first_seen_at, last_seen_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (jid) DO UPDATE SET
        name = COALESCE(EXCLUDED.name, participants.name),
        last_seen_at = CURRENT_TIMESTAMP,
        message_count = participants.message_count + 1`,
      [jid, name, instance]
    );
  }

  /**
   * Extrai conteúdo da mensagem
   */
  private extractContent(msg: EvolutionMessage): string | null {
    if (!msg.message) return null;

    if (msg.message.conversation) {
      return msg.message.conversation;
    }

    if (msg.message.extendedTextMessage?.text) {
      return msg.message.extendedTextMessage.text;
    }

    if (msg.message.imageMessage?.caption) {
      return msg.message.imageMessage.caption;
    }

    if (msg.message.videoMessage?.caption) {
      return msg.message.videoMessage.caption;
    }

    return null;
  }

  /**
   * Extrai tipo de mídia
   */
  private extractMediaType(msg: EvolutionMessage): string | null {
    if (msg.messageType === 'audioMessage') return 'audio';
    if (msg.messageType === 'imageMessage') return 'image';
    if (msg.messageType === 'videoMessage') return 'video';
    if (msg.messageType === 'documentMessage') return 'document';
    if (msg.messageType === 'stickerMessage') return 'sticker';

    return null;
  }

  /**
   * Fecha conexões
   */
  async close(): Promise<void> {
    await this.pool.end();
  }
}
