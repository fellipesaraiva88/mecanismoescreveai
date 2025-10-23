/**
 * 📊 ANALYTICS MODULE - Index
 * Exportações centralizadas para o sistema de análise comportamental
 */

// Core
export * from './core/types.js'
export { DatabaseService, getDatabase } from './core/database-service.js'
export { MessageProcessor, getMessageProcessor } from './core/message-processor.js'

// Sentiment Analysis
export { SentimentAnalyzer, getSentimentAnalyzer } from './sentiment/sentiment-analyzer.js'

// Metrics & Patterns
export { PatternDetector, getPatternDetector } from './metrics/pattern-detector.js'

// Relationships
export { RelationshipBuilder, getRelationshipBuilder } from './relationships/relationship-builder.js'

// Insights
export { InsightGenerator, getInsightGenerator } from './insights/insight-generator.js'

// Alerts
export { AlertEngine, getAlertEngine } from './alerts/alert-engine.js'

// Dashboard API
export { DashboardAPI, setupDashboardAPI } from './dashboard/api.js'

/**
 * Inicializa todo o sistema de analytics
 */
export async function initializeAnalytics() {
  const db = getDatabase()
  const processor = getMessageProcessor()
  const sentimentAnalyzer = getSentimentAnalyzer()
  const patternDetector = getPatternDetector()
  const relationshipBuilder = getRelationshipBuilder()
  const insightGenerator = getInsightGenerator()
  const alertEngine = getAlertEngine()

  // Configura listeners de eventos
  processor.on('message:analyze', async (message) => {
    try {
      // Analisa sentimento
      if (message.content) {
        await sentimentAnalyzer.analyze({
          messageId: message.messageId,
          content: message.content,
        })
      }
    } catch (error) {
      console.error('Error analyzing message:', error)
    }
  })

  processor.on('relationship:update', async ({ conversationJid, participantJid }) => {
    try {
      // Atualiza relacionamentos em grupos
      const messages = await db.getMessagesByConversation(conversationJid, 100)
      const participants = new Set(messages.map(m => m.senderJid))

      for (const otherParticipant of participants) {
        if (otherParticipant !== participantJid) {
          await relationshipBuilder.updateRelationship(participantJid, otherParticipant)
        }
      }
    } catch (error) {
      console.error('Error updating relationships:', error)
    }
  })

  console.log('✅ Analytics system initialized!')

  return {
    db,
    processor,
    sentimentAnalyzer,
    patternDetector,
    relationshipBuilder,
    insightGenerator,
    alertEngine,
  }
}
