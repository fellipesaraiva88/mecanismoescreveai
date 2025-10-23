/**
 * 🔍 DETECTOR DE PADRÕES COMPORTAMENTAIS
 * Identifica padrões de comunicação, horários ativos, frequência, etc
 */

import type {
  BehaviorPattern,
  ActiveHoursPattern,
  ResponseTimePattern,
  MessageFrequencyPattern,
  PatternType,
} from '../core/types.js';
import { getDatabase } from '../core/database-service.js';

export class PatternDetector {
  private db = getDatabase();

  /**
   * Detecta todos os padrões de um participante
   */
  async detectAllPatterns(participantJid: string): Promise<BehaviorPattern[]> {
    const patterns: BehaviorPattern[] = [];

    // Detecta padrões em paralelo
    const [activeHours, responseTime, frequency] = await Promise.all([
      this.detectActiveHoursPattern(participantJid),
      this.detectResponseTimePattern(participantJid),
      this.detectMessageFrequencyPattern(participantJid),
    ]);

    if (activeHours) patterns.push(activeHours);
    if (responseTime) patterns.push(responseTime);
    if (frequency) patterns.push(frequency);

    // Salva todos os padrões no banco
    for (const pattern of patterns) {
      await this.db.saveBehaviorPattern(pattern);
    }

    return patterns;
  }

  /**
   * Detecta padrão de horários mais ativos
   */
  async detectActiveHoursPattern(participantJid: string): Promise<BehaviorPattern | null> {
    const query = `
      SELECT
        EXTRACT(HOUR FROM to_timestamp(timestamp)) as hour,
        COUNT(*) as message_count
      FROM messages
      WHERE sender_jid = $1
        AND timestamp >= EXTRACT(EPOCH FROM (NOW() - INTERVAL '30 days'))::BIGINT
      GROUP BY hour
      ORDER BY message_count DESC
    `;

    const results = await this.db.query<{ hour: number; message_count: number }>(query, [
      participantJid,
    ]);

    if (results.length === 0) return null;

    const hourlyDistribution: { [hour: number]: number } = {};
    const totalMessages = results.reduce((sum, r) => sum + Number(r.message_count), 0);

    results.forEach((r) => {
      hourlyDistribution[r.hour] = (Number(r.message_count) / totalMessages) * 100;
    });

    const mostActiveHour = results[0].hour;
    const leastActiveHour = results[results.length - 1].hour;

    // Determina período do dia preferido
    let preferredTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'night' = 'afternoon';
    if (mostActiveHour >= 6 && mostActiveHour < 12) preferredTimeOfDay = 'morning';
    else if (mostActiveHour >= 12 && mostActiveHour < 18) preferredTimeOfDay = 'afternoon';
    else if (mostActiveHour >= 18 && mostActiveHour < 22) preferredTimeOfDay = 'evening';
    else preferredTimeOfDay = 'night';

    const patternData: ActiveHoursPattern = {
      mostActiveHour,
      leastActiveHour,
      hourlyDistribution,
      preferredTimeOfDay,
    };

    return {
      id: 0,
      participantJid,
      patternType: 'active_hours',
      patternName: `Mais ativo às ${mostActiveHour}h (${preferredTimeOfDay})`,
      patternData,
      confidence: results.length >= 10 ? 0.9 : 0.6,
      detectedAt: new Date(),
      lastObservedAt: new Date(),
      observationCount: 1,
    };
  }

  /**
   * Detecta padrão de tempo de resposta
   */
  async detectResponseTimePattern(participantJid: string): Promise<BehaviorPattern | null> {
    const query = `
      WITH responses AS (
        SELECT
          m1.timestamp as question_time,
          m2.timestamp as response_time,
          (m2.timestamp - m1.timestamp) as response_time_seconds
        FROM messages m1
        JOIN messages m2 ON m2.quoted_message_id = m1.message_id
        WHERE m2.sender_jid = $1
          AND m1.timestamp >= EXTRACT(EPOCH FROM (NOW() - INTERVAL '30 days'))::BIGINT
          AND (m2.timestamp - m1.timestamp) < 86400 -- Menos de 24h
          AND (m2.timestamp - m1.timestamp) > 0
      )
      SELECT
        AVG(response_time_seconds) as avg_response,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY response_time_seconds) as median_response,
        MIN(response_time_seconds) as fastest_response,
        MAX(response_time_seconds) as slowest_response,
        COUNT(*) as total_responses
      FROM responses
    `;

    const results = await this.db.query<any>(query, [participantJid]);
    const data = results[0];

    if (!data || !data.total_responses || data.total_responses < 3) return null;

    const patternData: ResponseTimePattern = {
      averageResponseTimeSeconds: Math.round(Number(data.avg_response)),
      medianResponseTimeSeconds: Math.round(Number(data.median_response)),
      fastestResponseSeconds: Math.round(Number(data.fastest_response)),
      slowestResponseSeconds: Math.round(Number(data.slowest_response)),
      responseRatePercentage: 100, // Calcular isso de forma mais precisa depois
    };

    const avgMinutes = patternData.averageResponseTimeSeconds / 60;
    let responsiveness = 'lento';
    if (avgMinutes < 5) responsiveness = 'muito rápido';
    else if (avgMinutes < 30) responsiveness = 'rápido';
    else if (avgMinutes < 120) responsiveness = 'moderado';

    return {
      id: 0,
      participantJid,
      patternType: 'response_time',
      patternName: `Resposta ${responsiveness} (média: ${Math.round(avgMinutes)}min)`,
      patternData,
      confidence: Number(data.total_responses) >= 10 ? 0.85 : 0.65,
      detectedAt: new Date(),
      lastObservedAt: new Date(),
      observationCount: 1,
    };
  }

  /**
   * Detecta padrão de frequência de mensagens
   */
  async detectMessageFrequencyPattern(participantJid: string): Promise<BehaviorPattern | null> {
    const query = `
      WITH daily_counts AS (
        SELECT
          DATE(to_timestamp(timestamp)) as date,
          COUNT(*) as message_count
        FROM messages
        WHERE sender_jid = $1
          AND timestamp >= EXTRACT(EPOCH FROM (NOW() - INTERVAL '30 days'))::BIGINT
        GROUP BY DATE(to_timestamp(timestamp))
      ),
      weekly_counts AS (
        SELECT
          DATE_TRUNC('week', to_timestamp(timestamp)) as week,
          COUNT(*) as message_count
        FROM messages
        WHERE sender_jid = $1
          AND timestamp >= EXTRACT(EPOCH FROM (NOW() - INTERVAL '30 days'))::BIGINT
        GROUP BY week
      )
      SELECT
        AVG(dc.message_count) as messages_per_day,
        AVG(wc.message_count) as messages_per_week,
        STDDEV(dc.message_count) as daily_stddev
      FROM daily_counts dc
      CROSS JOIN weekly_counts wc
    `;

    const results = await this.db.query<any>(query, [participantJid]);
    const data = results[0];

    if (!data || !data.messages_per_day) return null;

    // Detecta tendência (simplificado)
    const trendDirection: 'increasing' | 'decreasing' | 'stable' = 'stable';

    const patternData: MessageFrequencyPattern = {
      messagesPerDay: Math.round(Number(data.messages_per_day)),
      messagesPerWeek: Math.round(Number(data.messages_per_week)),
      peakDays: [], // Implementar depois
      quietDays: [],
      trendDirection,
    };

    return {
      id: 0,
      participantJid,
      patternType: 'message_frequency',
      patternName: `${patternData.messagesPerDay} mensagens/dia`,
      patternData,
      confidence: 0.8,
      detectedAt: new Date(),
      lastObservedAt: new Date(),
      observationCount: 1,
    };
  }

  /**
   * Detecta mudanças significativas em padrões (anomalias)
   */
  async detectPatternChanges(
    participantJid: string
  ): Promise<Array<{ patternType: PatternType; change: string; severity: string }>> {
    const currentPatterns = await this.db.getPatternsByParticipant(participantJid);
    const changes = [];

    // Compara padrões atuais com históricos
    // (Implementação simplificada - pode ser expandida)

    return changes;
  }
}

export function getPatternDetector(): PatternDetector {
  return new PatternDetector();
}
