/**
 * 🕸️ CONSTRUTOR DE GRAFOS DE RELACIONAMENTOS
 * Mapeia e analisa relacionamentos entre participantes
 */

import type { ParticipantRelationship, RelationshipGraph, AffinityCluster } from '../core/types.js';
import { getDatabase } from '../core/database-service.js';

export class RelationshipBuilder {
  private db = getDatabase();

  async buildRelationshipGraph(conversationJid?: string): Promise<RelationshipGraph> {
    const nodes = await this.getGraphNodes(conversationJid);
    const edges = await this.getGraphEdges(conversationJid);

    return { nodes, edges };
  }

  async updateRelationship(jidA: string, jidB: string): Promise<void> {
    const strength = await this.calculateStrength(jidA, jidB);
    await this.db.upsertRelationship(jidA, jidB, strength);
  }

  private async calculateStrength(jidA: string, jidB: string): Promise<number> {
    const query = `SELECT calculate_relationship_strength($1, $2) as strength`;
    const results = await this.db.query<{ strength: number }>(query, [jidA, jidB]);
    return results[0]?.strength || 0;
  }

  private async getGraphNodes(conversationJid?: string) {
    const query = conversationJid
      ? `SELECT p.jid, p.name, p.message_count FROM participants p
         JOIN messages m ON m.sender_jid = p.jid
         WHERE m.conversation_jid = $1
         GROUP BY p.jid, p.name, p.message_count`
      : `SELECT jid, name, message_count FROM participants LIMIT 100`;

    return this.db.query(query, conversationJid ? [conversationJid] : []);
  }

  private async getGraphEdges(conversationJid?: string) {
    const query = `
      SELECT
        participant_a_jid as source,
        participant_b_jid as target,
        relationship_strength as strength,
        total_interactions as interactions
      FROM participant_relationships
      WHERE relationship_strength > 0.1
      ORDER BY relationship_strength DESC
      LIMIT 200
    `;

    return this.db.query(query);
  }
}

export function getRelationshipBuilder(): RelationshipBuilder {
  return new RelationshipBuilder();
}
