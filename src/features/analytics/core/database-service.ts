/**
 * 🗄️ SERVIÇO DE DATABASE PARA ANÁLISE COMPORTAMENTAL
 * Camada de acesso ao PostgreSQL com queries otimizadas
 */

import { Pool, type PoolClient } from 'pg';
import type {
  WhatsAppMessageRecord,
  WhatsAppParticipant,
  WhatsAppConversation,
  MessageSentiment,
  BehaviorPattern,
  ParticipantRelationship,
  AIInsight,
  Alert,
  ConversationMemory,
  Topic,
  ParticipantInterest,
  BehavioralAnomaly
} from './types.js';

export class DatabaseService {
  private pool: Pool;

  constructor(connectionString?: string) {
    this.pool = new Pool({
      connectionString: connectionString || process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  /**
   * Obtém um cliente do pool (para transactions)
   */
  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  /**
   * Executa uma query simples
   */
  async query<T = any>(text: string, params?: any[]): Promise<T[]> {
    const result = await this.pool.query(text, params);
    return result.rows;
  }

  // ============================================
  // MENSAGENS
  // ============================================

  async saveMessage(message: Partial<WhatsAppMessageRecord>): Promise<WhatsAppMessageRecord> {
    const query = `
      INSERT INTO messages (
        message_id, instance, conversation_jid, sender_jid, sender_name,
        message_type, content, timestamp, is_from_me, quoted_message_id,
        has_media, media_type
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (message_id) DO UPDATE SET
        content = EXCLUDED.content,
        sender_name = EXCLUDED.sender_name
      RETURNING *
    `;

    const values = [
      message.messageId,
      message.instance,
      message.conversationJid,
      message.senderJid,
      message.senderName,
      message.messageType,
      message.content,
      message.timestamp,
      message.isFromMe || false,
      message.quotedMessageId,
      message.hasMedia || false,
      message.mediaType,
    ];

    const rows = await this.query<WhatsAppMessageRecord>(query, values);
    return rows[0];
  }

  async getMessagesByConversation(
    conversationJid: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<WhatsAppMessageRecord[]> {
    const query = `
      SELECT * FROM messages
      WHERE conversation_jid = $1
      ORDER BY timestamp DESC
      LIMIT $2 OFFSET $3
    `;
    return this.query<WhatsAppMessageRecord>(query, [conversationJid, limit, offset]);
  }

  async getMessagesByParticipant(
    participantJid: string,
    limit: number = 100
  ): Promise<WhatsAppMessageRecord[]> {
    const query = `
      SELECT * FROM messages
      WHERE sender_jid = $1
      ORDER BY timestamp DESC
      LIMIT $2
    `;
    return this.query<WhatsAppMessageRecord>(query, [participantJid, limit]);
  }

  // ============================================
  // PARTICIPANTES
  // ============================================

  async upsertParticipant(participant: Partial<WhatsAppParticipant>): Promise<WhatsAppParticipant> {
    const query = `
      INSERT INTO participants (jid, name, phone, instance, first_seen_at, last_seen_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      ON CONFLICT (jid) DO UPDATE SET
        name = COALESCE(EXCLUDED.name, participants.name),
        phone = COALESCE(EXCLUDED.phone, participants.phone),
        last_seen_at = NOW(),
        message_count = participants.message_count + 1
      RETURNING *
    `;

    const values = [
      participant.jid,
      participant.name,
      participant.phone,
      participant.instance || 'saraiva',
    ];

    const rows = await this.query<WhatsAppParticipant>(query, values);
    return rows[0];
  }

  async getParticipant(jid: string): Promise<WhatsAppParticipant | null> {
    const query = 'SELECT * FROM participants WHERE jid = $1';
    const rows = await this.query<WhatsAppParticipant>(query, [jid]);
    return rows[0] || null;
  }

  async getAllParticipants(limit: number = 100): Promise<WhatsAppParticipant[]> {
    const query = `
      SELECT * FROM participants
      ORDER BY message_count DESC, last_seen_at DESC
      LIMIT $1
    `;
    return this.query<WhatsAppParticipant>(query, [limit]);
  }

  // ============================================
  // CONVERSAS
  // ============================================

  async upsertConversation(conversation: Partial<WhatsAppConversation>): Promise<WhatsAppConversation> {
    const query = `
      INSERT INTO conversations (jid, name, type, instance)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (jid) DO UPDATE SET
        name = COALESCE(EXCLUDED.name, conversations.name),
        message_count = conversations.message_count + 1,
        last_message_at = NOW(),
        updated_at = NOW()
      RETURNING *
    `;

    const values = [
      conversation.jid,
      conversation.name,
      conversation.type,
      conversation.instance || 'saraiva',
    ];

    const rows = await this.query<WhatsAppConversation>(query, values);
    return rows[0];
  }

  async getConversation(jid: string): Promise<WhatsAppConversation | null> {
    const query = 'SELECT * FROM conversations WHERE jid = $1';
    const rows = await this.query<WhatsAppConversation>(query, [jid]);
    return rows[0] || null;
  }

  // ============================================
  // ANÁLISE DE SENTIMENTO
  // ============================================

  async saveSentiment(sentiment: MessageSentiment): Promise<void> {
    const query = `
      INSERT INTO message_sentiment (
        message_id, sentiment_label, sentiment_score,
        emotions, confidence, model_used
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (message_id) DO UPDATE SET
        sentiment_label = EXCLUDED.sentiment_label,
        sentiment_score = EXCLUDED.sentiment_score,
        emotions = EXCLUDED.emotions,
        confidence = EXCLUDED.confidence
    `;

    const values = [
      sentiment.messageId,
      sentiment.sentimentLabel,
      sentiment.sentimentScore,
      JSON.stringify(sentiment.emotions),
      sentiment.confidence,
      sentiment.modelUsed,
    ];

    await this.pool.query(query, values);
  }

  async getSentimentByMessage(messageId: string): Promise<MessageSentiment | null> {
    const query = 'SELECT * FROM message_sentiment WHERE message_id = $1';
    const rows = await this.query<MessageSentiment>(query, [messageId]);
    return rows[0] || null;
  }

  async getAverageSentimentByParticipant(participantJid: string): Promise<number> {
    const query = `
      SELECT AVG(ms.sentiment_score) as avg_sentiment
      FROM messages m
      JOIN message_sentiment ms ON m.message_id = ms.message_id
      WHERE m.sender_jid = $1
    `;

    const rows = await this.query<{ avg_sentiment: number }>(query, [participantJid]);
    return rows[0]?.avg_sentiment || 0;
  }

  // ============================================
  // PADRÕES COMPORTAMENTAIS
  // ============================================

  async saveBehaviorPattern(pattern: Omit<BehaviorPattern, 'id'>): Promise<BehaviorPattern> {
    const query = `
      INSERT INTO behavior_patterns (
        participant_jid, pattern_type, pattern_name,
        pattern_data, confidence, last_observed_at, observation_count
      )
      VALUES ($1, $2, $3, $4, $5, NOW(), 1)
      ON CONFLICT (participant_jid, pattern_type)
      DO UPDATE SET
        pattern_data = EXCLUDED.pattern_data,
        confidence = EXCLUDED.confidence,
        last_observed_at = NOW(),
        observation_count = behavior_patterns.observation_count + 1
      RETURNING *
    `;

    const values = [
      pattern.participantJid,
      pattern.patternType,
      pattern.patternName,
      JSON.stringify(pattern.patternData),
      pattern.confidence,
    ];

    const rows = await this.query<BehaviorPattern>(query, values);
    return rows[0];
  }

  async getPatternsByParticipant(participantJid: string): Promise<BehaviorPattern[]> {
    const query = `
      SELECT * FROM behavior_patterns
      WHERE participant_jid = $1
      ORDER BY confidence DESC, last_observed_at DESC
    `;
    return this.query<BehaviorPattern>(query, [participantJid]);
  }

  // ============================================
  // RELACIONAMENTOS
  // ============================================

  async upsertRelationship(
    jidA: string,
    jidB: string,
    strength?: number
  ): Promise<ParticipantRelationship> {
    // Garantir ordem consistente (A < B)
    const [participantA, participantB] = jidA < jidB ? [jidA, jidB] : [jidB, jidA];

    const query = `
      INSERT INTO participant_relationships (
        participant_a_jid, participant_b_jid, relationship_strength,
        total_interactions, last_interaction_at
      )
      VALUES ($1, $2, $3, 1, NOW())
      ON CONFLICT (participant_a_jid, participant_b_jid)
      DO UPDATE SET
        relationship_strength = COALESCE($3, participant_relationships.relationship_strength),
        total_interactions = participant_relationships.total_interactions + 1,
        last_interaction_at = NOW(),
        updated_at = NOW()
      RETURNING *
    `;

    const values = [participantA, participantB, strength || 0];
    const rows = await this.query<ParticipantRelationship>(query, values);
    return rows[0];
  }

  async getRelationshipsByParticipant(participantJid: string): Promise<ParticipantRelationship[]> {
    const query = `
      SELECT * FROM participant_relationships
      WHERE participant_a_jid = $1 OR participant_b_jid = $1
      ORDER BY relationship_strength DESC
      LIMIT 50
    `;
    return this.query<ParticipantRelationship>(query, [participantJid]);
  }

  async getStrongestRelationships(limit: number = 20): Promise<ParticipantRelationship[]> {
    const query = `
      SELECT * FROM participant_relationships
      ORDER BY relationship_strength DESC
      LIMIT $1
    `;
    return this.query<ParticipantRelationship>(query, [limit]);
  }

  // ============================================
  // INSIGHTS
  // ============================================

  async saveInsight(insight: Omit<AIInsight, 'id' | 'createdAt'>): Promise<AIInsight> {
    const query = `
      INSERT INTO ai_insights (
        insight_type, subject_type, subject_id, title, description,
        severity, confidence, supporting_data, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)
      RETURNING *
    `;

    const values = [
      insight.insightType,
      insight.subjectType,
      insight.subjectId,
      insight.title,
      insight.description,
      insight.severity,
      insight.confidence,
      JSON.stringify(insight.supportingData),
    ];

    const rows = await this.query<AIInsight>(query, values);
    return rows[0];
  }

  async getActiveInsights(limit: number = 50): Promise<AIInsight[]> {
    const query = `
      SELECT * FROM ai_insights
      WHERE is_active = TRUE
      ORDER BY
        CASE severity
          WHEN 'critical' THEN 1
          WHEN 'warning' THEN 2
          WHEN 'info' THEN 3
        END,
        detected_at DESC
      LIMIT $1
    `;
    return this.query<AIInsight>(query, [limit]);
  }

  async getInsightsBySubject(subjectType: string, subjectId: string): Promise<AIInsight[]> {
    const query = `
      SELECT * FROM ai_insights
      WHERE subject_type = $1 AND subject_id = $2
      ORDER BY detected_at DESC
      LIMIT 20
    `;
    return this.query<AIInsight>(query, [subjectType, subjectId]);
  }

  // ============================================
  // ALERTAS
  // ============================================

  async saveAlert(alert: Omit<Alert, 'id' | 'createdAt'>): Promise<Alert> {
    const query = `
      INSERT INTO alerts (
        alert_rule_id, conversation_jid, participant_jid,
        alert_type, title, message, severity, metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      alert.alertRuleId,
      alert.conversationJid,
      alert.participantJid,
      alert.alertType,
      alert.title,
      alert.message,
      alert.severity,
      JSON.stringify(alert.metadata),
    ];

    const rows = await this.query<Alert>(query, values);
    return rows[0];
  }

  async getUnreadAlerts(limit: number = 50): Promise<Alert[]> {
    const query = `
      SELECT * FROM alerts
      WHERE is_read = FALSE
      ORDER BY
        CASE severity
          WHEN 'critical' THEN 1
          WHEN 'warning' THEN 2
          WHEN 'info' THEN 3
        END,
        triggered_at DESC
      LIMIT $1
    `;
    return this.query<Alert>(query, [limit]);
  }

  async markAlertAsRead(alertId: number): Promise<void> {
    const query = `
      UPDATE alerts
      SET is_read = TRUE, acknowledged_at = NOW()
      WHERE id = $1
    `;
    await this.pool.query(query, [alertId]);
  }

  // ============================================
  // MEMÓRIAS
  // ============================================

  async saveMemory(memory: Omit<ConversationMemory, 'id' | 'createdAt' | 'updatedAt'>): Promise<ConversationMemory> {
    const query = `
      INSERT INTO conversation_memories (
        conversation_jid, participant_jid, memory_type, content,
        source_message_id, importance_score, embedding, tags
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      memory.conversationJid,
      memory.participantJid,
      memory.memoryType,
      memory.content,
      memory.sourceMessageId,
      memory.importanceScore,
      memory.embedding ? `[${memory.embedding.join(',')}]` : null,
      memory.tags,
    ];

    const rows = await this.query<ConversationMemory>(query, values);
    return rows[0];
  }

  async getMemoriesByConversation(
    conversationJid: string,
    limit: number = 20
  ): Promise<ConversationMemory[]> {
    const query = `
      SELECT * FROM conversation_memories
      WHERE conversation_jid = $1
      ORDER BY importance_score DESC, created_at DESC
      LIMIT $2
    `;
    return this.query<ConversationMemory>(query, [conversationJid, limit]);
  }

  async searchMemoriesBySimilarity(
    embedding: number[],
    limit: number = 10
  ): Promise<ConversationMemory[]> {
    const query = `
      SELECT *, (embedding <=> $1::vector) as distance
      FROM conversation_memories
      WHERE embedding IS NOT NULL
      ORDER BY distance
      LIMIT $2
    `;

    const embeddingStr = `[${embedding.join(',')}]`;
    return this.query<ConversationMemory>(query, [embeddingStr, limit]);
  }

  // ============================================
  // TÓPICOS
  // ============================================

  async getOrCreateTopic(name: string, category?: string): Promise<Topic> {
    const query = `
      INSERT INTO topics (name, category)
      VALUES ($1, $2)
      ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
      RETURNING *
    `;

    const rows = await this.query<Topic>(query, [name, category]);
    return rows[0];
  }

  async linkMessageToTopic(
    messageId: string,
    topicId: number,
    relevanceScore: number
  ): Promise<void> {
    const query = `
      INSERT INTO message_topics (message_id, topic_id, relevance_score)
      VALUES ($1, $2, $3)
      ON CONFLICT (message_id, topic_id) DO UPDATE SET
        relevance_score = EXCLUDED.relevance_score
    `;

    await this.pool.query(query, [messageId, topicId, relevanceScore]);
  }

  async updateParticipantInterest(
    participantJid: string,
    topicId: number,
    interestScore: number
  ): Promise<void> {
    const query = `
      INSERT INTO participant_interests (participant_jid, topic_id, interest_score, mention_count, last_mentioned_at)
      VALUES ($1, $2, $3, 1, NOW())
      ON CONFLICT (participant_jid, topic_id) DO UPDATE SET
        interest_score = EXCLUDED.interest_score,
        mention_count = participant_interests.mention_count + 1,
        last_mentioned_at = NOW(),
        updated_at = NOW()
    `;

    await this.pool.query(query, [participantJid, topicId, interestScore]);
  }

  async getParticipantInterests(participantJid: string): Promise<ParticipantInterest[]> {
    const query = `
      SELECT pi.*, t.name as topic_name, t.category as topic_category
      FROM participant_interests pi
      JOIN topics t ON t.id = pi.topic_id
      WHERE pi.participant_jid = $1
      ORDER BY pi.interest_score DESC
      LIMIT 10
    `;

    return this.query<ParticipantInterest>(query, [participantJid]);
  }

  // ============================================
  // ANOMALIAS
  // ============================================

  async saveAnomaly(anomaly: Omit<BehavioralAnomaly, 'id'>): Promise<BehavioralAnomaly> {
    const query = `
      INSERT INTO behavioral_anomalies (
        participant_jid, conversation_jid, anomaly_type, description,
        severity, expected_value, actual_value, deviation_score, metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      anomaly.participantJid,
      anomaly.conversationJid,
      anomaly.anomalyType,
      anomaly.description,
      anomaly.severity,
      anomaly.expectedValue,
      anomaly.actualValue,
      anomaly.deviationScore,
      JSON.stringify(anomaly.metadata),
    ];

    const rows = await this.query<BehavioralAnomaly>(query, values);
    return rows[0];
  }

  async getActiveAnomalies(): Promise<BehavioralAnomaly[]> {
    const query = `
      SELECT * FROM behavioral_anomalies
      WHERE resolved_at IS NULL
      ORDER BY
        CASE severity
          WHEN 'high' THEN 1
          WHEN 'medium' THEN 2
          WHEN 'low' THEN 3
        END,
        detected_at DESC
      LIMIT 50
    `;

    return this.query<BehavioralAnomaly>(query);
  }

  // ============================================
  // UTILITÁRIOS
  // ============================================

  async getDashboardMetrics(): Promise<any> {
    const query = 'SELECT * FROM dashboard_overview';
    const rows = await this.query(query);
    return rows[0] || {};
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

// Singleton instance
let dbInstance: DatabaseService | null = null;

export function getDatabase(): DatabaseService {
  if (!dbInstance) {
    dbInstance = new DatabaseService();
  }
  return dbInstance;
}
