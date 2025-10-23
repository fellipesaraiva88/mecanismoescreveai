/**
 * 🎯 Orquestrador de Analytics Automáticos
 * Coordena análises automáticas quando mensagens chegam
 */

import { getMessageProcessor } from '../features/analytics/core/message-processor.js'
import { getSentimentAnalyzer } from '../features/analytics/sentiment/sentiment-analyzer.js'
import { getDatabase } from '../features/analytics/core/database-service.js'

export class AnalyticsOrchestrator {
  private messageProcessor = getMessageProcessor()
  private sentimentAnalyzer = getSentimentAnalyzer()
  private db = getDatabase()
  private isRunning = false

  /**
   * 🚀 Iniciar orquestrador
   */
  start(): void {
    if (this.isRunning) {
      console.log('⚠️ Analytics Orchestrator já está rodando')
      return
    }

    console.log('\n╔═══════════════════════════════════════════════════════╗')
    console.log('║  🎯 ANALYTICS ORCHESTRATOR INICIADO                  ║')
    console.log('╚═══════════════════════════════════════════════════════╝\n')

    this.isRunning = true

    // Listener 1: Análise de Sentimento Automática
    this.messageProcessor.on('message:analyze', async (message: any) => {
      await this.analyzeSentiment(message)
    })

    // Listener 2: Atualização de Relacionamentos
    this.messageProcessor.on('relationship:update', async (data: any) => {
      await this.updateRelationships(data)
    })

    // Listener 3: Detecção de Padrões (a cada 100 mensagens)
    let messageCount = 0
    this.messageProcessor.on('message:saved', async () => {
      messageCount++
      if (messageCount % 100 === 0) {
        await this.detectPatterns()
      }
    })

    // Job periódico: Verificar alertas a cada 5 minutos
    setInterval(() => {
      this.checkAlerts().catch(err => {
        console.error('Erro ao verificar alertas:', err)
      })
    }, 5 * 60 * 1000)

    console.log('✅ Listeners de analytics configurados')
    console.log('   📊 Análise de sentimento: ATIVA')
    console.log('   🕸️  Cálculo de relacionamentos: ATIVO')
    console.log('   🔍 Detecção de padrões: ATIVA (a cada 100 msgs)')
    console.log('   🚨 Verificação de alertas: ATIVA (a cada 5min)\n')
  }

  /**
   * 📊 Analisar sentimento de uma mensagem
   */
  private async analyzeSentiment(message: any): Promise<void> {
    try {
      // Ignorar mensagens sem conteúdo textual
      if (!message.content || message.content.trim().length === 0) {
        return
      }

      // Ignorar mensagens muito curtas (menos de 5 caracteres)
      if (message.content.trim().length < 5) {
        return
      }

      console.log(`🤖 Analisando sentimento: "${message.content.substring(0, 50)}..."`)

      const sentimentResult = await this.sentimentAnalyzer.analyze({
        messageId: message.message_id,
        content: message.content,
        senderJid: message.sender_jid,
        conversationJid: message.conversation_jid,
      })

      console.log(`   ✅ Sentimento: ${sentimentResult.label} (${sentimentResult.score})`)
    } catch (error: any) {
      console.error(`   ❌ Erro ao analisar sentimento: ${error.message}`)
    }
  }

  /**
   * 🕸️ Atualizar relacionamentos entre participantes
   */
  private async updateRelationships(data: { conversationJid: string; participantJid: string }): Promise<void> {
    try {
      const { conversationJid, participantJid } = data

      // Buscar outros participantes ativos na conversa
      const result = await this.db.query(
        `
        SELECT DISTINCT sender_jid
        FROM messages
        WHERE conversation_jid = $1
          AND sender_jid != $2
          AND is_from_me = false
        LIMIT 50
        `,
        [conversationJid, participantJid]
      )

      const otherParticipants = result.rows.map((row: any) => row.sender_jid)

      // Para cada outro participante, calcular força do relacionamento
      for (const otherJid of otherParticipants) {
        await this.calculateRelationshipStrength(participantJid, otherJid, conversationJid)
      }
    } catch (error: any) {
      console.error('Erro ao atualizar relacionamentos:', error.message)
    }
  }

  /**
   * 💪 Calcular força de relacionamento entre dois participantes
   */
  private async calculateRelationshipStrength(
    participantA: string,
    participantB: string,
    conversationJid: string
  ): Promise<void> {
    try {
      // Contar interações (mensagens trocadas)
      const result = await this.db.query(
        `
        SELECT COUNT(*) as interaction_count
        FROM messages
        WHERE conversation_jid = $1
          AND (
            (sender_jid = $2 AND $3 IN (
              SELECT sender_jid FROM messages m2
              WHERE m2.conversation_jid = $1
                AND m2.timestamp > messages.timestamp
                AND m2.timestamp < messages.timestamp + 3600000
              LIMIT 1
            ))
            OR
            (sender_jid = $3 AND $2 IN (
              SELECT sender_jid FROM messages m2
              WHERE m2.conversation_jid = $1
                AND m2.timestamp > messages.timestamp
                AND m2.timestamp < messages.timestamp + 3600000
              LIMIT 1
            ))
          )
        `,
        [conversationJid, participantA, participantB]
      )

      const interactionCount = parseInt(result.rows[0]?.interaction_count || '0')

      // Calcular força (0.0 a 1.0) baseado em interações
      const strength = Math.min(interactionCount / 50, 1.0) // 50 interações = força máxima

      // Salvar relacionamento
      await this.db.query(
        `
        INSERT INTO participant_relationships (
          participant_a_jid, participant_b_jid, relationship_strength, total_interactions
        )
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (participant_a_jid, participant_b_jid)
        DO UPDATE SET
          relationship_strength = $3,
          total_interactions = $4,
          updated_at = NOW()
        `,
        [participantA, participantB, strength, interactionCount]
      )

      console.log(`🕸️  Relacionamento atualizado: ${participantA.substring(0, 10)}... ↔ ${participantB.substring(0, 10)}... (força: ${strength.toFixed(2)})`)
    } catch (error: any) {
      console.error('Erro ao calcular força de relacionamento:', error.message)
    }
  }

  /**
   * 🔍 Detectar padrões comportamentais
   */
  private async detectPatterns(): Promise<void> {
    try {
      console.log('\n🔍 Executando detecção de padrões...')

      // Detectar horários de pico por participante
      const peakHoursResult = await this.db.query(`
        SELECT
          sender_jid,
          EXTRACT(HOUR FROM to_timestamp(timestamp/1000)) as hour,
          COUNT(*) as message_count
        FROM messages
        WHERE timestamp > EXTRACT(EPOCH FROM NOW() - INTERVAL '7 days') * 1000
        GROUP BY sender_jid, hour
        ORDER BY sender_jid, message_count DESC
      `)

      // Agrupar por participante
      const participantPeaks: Record<string, number> = {}
      peakHoursResult.rows.forEach((row: any) => {
        if (!participantPeaks[row.sender_jid]) {
          participantPeaks[row.sender_jid] = parseInt(row.hour)
        }
      })

      // Salvar padrões detectados
      for (const [jid, peakHour] of Object.entries(participantPeaks)) {
        await this.db.query(
          `
          INSERT INTO behavior_patterns (
            participant_jid, pattern_type, pattern_data, detected_at
          )
          VALUES ($1, 'peak_hour', $2, NOW())
          ON CONFLICT (participant_jid, pattern_type)
          DO UPDATE SET pattern_data = $2, detected_at = NOW()
          `,
          [jid, JSON.stringify({ hour: peakHour })]
        )
      }

      console.log(`   ✅ ${Object.keys(participantPeaks).length} padrões de horário detectados`)
    } catch (error: any) {
      console.error('Erro ao detectar padrões:', error.message)
    }
  }

  /**
   * 🚨 Verificar e criar alertas
   */
  private async checkAlerts(): Promise<void> {
    try {
      console.log('\n🚨 Verificando alertas...')

      // Alerta 1: Queda de atividade (70% menos mensagens que a média)
      const inactivityAlerts = await this.db.query(`
        WITH participant_stats AS (
          SELECT
            sender_jid,
            COUNT(*) FILTER (WHERE timestamp > EXTRACT(EPOCH FROM NOW() - INTERVAL '7 days') * 1000) as recent_count,
            COUNT(*) FILTER (WHERE timestamp > EXTRACT(EPOCH FROM NOW() - INTERVAL '30 days') * 1000) / 4.0 as avg_weekly_count
          FROM messages
          WHERE is_from_me = false
          GROUP BY sender_jid
        )
        SELECT sender_jid, recent_count, avg_weekly_count
        FROM participant_stats
        WHERE avg_weekly_count > 10
          AND recent_count < (avg_weekly_count * 0.3)
      `)

      for (const row of inactivityAlerts.rows) {
        await this.createAlert({
          type: 'inactivity',
          severity: 'warning',
          participantJid: row.sender_jid,
          message: `Queda de atividade: ${row.recent_count} mensagens (média: ${Math.round(row.avg_weekly_count)})`,
        })
      }

      // Alerta 2: Sentimento negativo persistente
      const negativeSentimentAlerts = await this.db.query(`
        SELECT sender_jid, COUNT(*) as negative_count
        FROM messages m
        JOIN message_sentiment s ON m.message_id = s.message_id
        WHERE s.sentiment_label = 'negative'
          AND m.timestamp > EXTRACT(EPOCH FROM NOW() - INTERVAL '24 hours') * 1000
        GROUP BY sender_jid
        HAVING COUNT(*) >= 5
      `)

      for (const row of negativeSentimentAlerts.rows) {
        await this.createAlert({
          type: 'negative_sentiment',
          severity: 'critical',
          participantJid: row.sender_jid,
          message: `${row.negative_count} mensagens negativas nas últimas 24h`,
        })
      }

      const totalAlerts = inactivityAlerts.rows.length + negativeSentimentAlerts.rows.length
      if (totalAlerts > 0) {
        console.log(`   ✅ ${totalAlerts} alertas criados`)
      } else {
        console.log('   ℹ️  Nenhum alerta detectado')
      }
    } catch (error: any) {
      console.error('Erro ao verificar alertas:', error.message)
    }
  }

  /**
   * 📝 Criar alerta no banco
   */
  private async createAlert(data: {
    type: string
    severity: string
    participantJid: string
    message: string
  }): Promise<void> {
    try {
      await this.db.query(
        `
        INSERT INTO alerts (
          alert_type, severity, participant_jid, message, triggered_at, is_read
        )
        VALUES ($1, $2, $3, $4, NOW(), false)
        `,
        [data.type, data.severity, data.participantJid, data.message]
      )

      console.log(`   🚨 Alerta criado: [${data.severity.toUpperCase()}] ${data.message}`)
    } catch (error: any) {
      // Ignorar erros de duplicação
      if (!error.message.includes('duplicate')) {
        console.error('Erro ao criar alerta:', error.message)
      }
    }
  }

  /**
   * 🛑 Parar orquestrador
   */
  stop(): void {
    this.messageProcessor.removeAllListeners()
    this.isRunning = false
    console.log('🛑 Analytics Orchestrator parado')
  }
}

// Singleton
let orchestratorInstance: AnalyticsOrchestrator | null = null

export function getAnalyticsOrchestrator(): AnalyticsOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new AnalyticsOrchestrator()
  }
  return orchestratorInstance
}
