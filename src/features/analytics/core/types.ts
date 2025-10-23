/**
 * 📊 TIPOS E INTERFACES PARA O SISTEMA DE ANÁLISE COMPORTAMENTAL
 * Sistema completo de análise de conversas do WhatsApp
 */

// ============================================
// TIPOS BASE
// ============================================

export interface WhatsAppParticipant {
  jid: string;
  name?: string;
  phone?: string;
  instance: string;
  messageCount: number;
  firstSeenAt: Date;
  lastSeenAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface WhatsAppConversation {
  jid: string;
  name?: string;
  type: 'private' | 'group';
  instance: string;
  participantCount: number;
  messageCount: number;
  firstMessageAt?: Date;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface WhatsAppMessageRecord {
  id: number;
  messageId: string;
  instance: string;
  conversationJid: string;
  senderJid: string;
  senderName?: string;
  messageType: string;
  content?: string;
  timestamp: number;
  createdAt: Date;
  isFromMe: boolean;
  quotedMessageId?: string;
  hasMedia: boolean;
  mediaType?: string;
}

// ============================================
// ANÁLISE DE SENTIMENTO
// ============================================

export type SentimentLabel = 'positive' | 'negative' | 'neutral' | 'mixed';

export interface EmotionScores {
  joy: number;
  sadness: number;
  anger: number;
  fear: number;
  surprise: number;
  disgust: number;
  [key: string]: number;
}

export interface MessageSentiment {
  messageId: string;
  sentimentLabel: SentimentLabel;
  sentimentScore: number; // -1.00 a +1.00
  emotions: EmotionScores;
  confidence: number; // 0.00 a 1.00
  analyzedAt: Date;
  modelUsed: 'claude' | 'openai' | 'groq';
}

export interface SentimentAnalysisRequest {
  messageId: string;
  content: string;
  context?: string; // Contexto adicional para melhor análise
}

export interface SentimentAnalysisResult {
  sentiment: MessageSentiment;
  reasoning?: string; // Explicação da IA sobre a análise
}

// ============================================
// TÓPICOS E INTERESSES
// ============================================

export interface Topic {
  id: number;
  name: string;
  category?: string;
  keywords: string[];
  description?: string;
  createdAt: Date;
}

export interface MessageTopic {
  messageId: string;
  topicId: number;
  relevanceScore: number; // 0.00 a 1.00
  detectedAt: Date;
}

export interface ParticipantInterest {
  participantJid: string;
  topicId: number;
  topic?: Topic;
  interestScore: number; // 0.00 a 1.00
  mentionCount: number;
  lastMentionedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// PADRÕES COMPORTAMENTAIS
// ============================================

export type PatternType =
  | 'active_hours'
  | 'response_time'
  | 'message_frequency'
  | 'conversation_style'
  | 'emoji_usage'
  | 'message_length';

export interface BehaviorPattern {
  id: number;
  participantJid: string;
  patternType: PatternType;
  patternName?: string;
  patternData: Record<string, any>;
  confidence: number; // 0.00 a 1.00
  detectedAt: Date;
  lastObservedAt: Date;
  observationCount: number;
}

export interface ActiveHoursPattern {
  mostActiveHour: number; // 0-23
  leastActiveHour: number;
  hourlyDistribution: { [hour: number]: number }; // Percentual por hora
  preferredTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

export interface ResponseTimePattern {
  averageResponseTimeSeconds: number;
  medianResponseTimeSeconds: number;
  fastestResponseSeconds: number;
  slowestResponseSeconds: number;
  responseRatePercentage: number;
}

export interface MessageFrequencyPattern {
  messagesPerDay: number;
  messagesPerWeek: number;
  peakDays: string[]; // Dias da semana
  quietDays: string[];
  trendDirection: 'increasing' | 'decreasing' | 'stable';
}

// ============================================
// ANOMALIAS E MUDANÇAS
// ============================================

export type AnomalyType =
  | 'sudden_silence'
  | 'activity_spike'
  | 'sentiment_shift'
  | 'topic_change'
  | 'response_time_change'
  | 'unusual_hour_activity';

export type AnomalySeverity = 'low' | 'medium' | 'high';

export interface BehavioralAnomaly {
  id: number;
  participantJid: string;
  conversationJid?: string;
  anomalyType: AnomalyType;
  description: string;
  severity: AnomalySeverity;
  expectedValue?: number;
  actualValue?: number;
  deviationScore: number;
  metadata: Record<string, any>;
  detectedAt: Date;
  resolvedAt?: Date;
}

// ============================================
// RELACIONAMENTOS
// ============================================

export interface ParticipantRelationship {
  id: number;
  participantAJid: string;
  participantBJid: string;
  relationshipStrength: number; // 0.00 a 1.00
  totalInteractions: number;
  commonGroups: number;
  avgResponseTimeSeconds?: number;
  lastInteractionAt?: Date;
  relationshipData: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface AffinityCluster {
  id: number;
  clusterName?: string;
  description?: string;
  memberJids: string[];
  cohesionScore: number; // 0.00 a 1.00
  commonTopics?: number[];
  detectedAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RelationshipGraphNode {
  jid: string;
  name?: string;
  messageCount: number;
  avgSentiment?: number;
}

export interface RelationshipGraphEdge {
  source: string; // JID
  target: string; // JID
  strength: number;
  interactions: number;
}

export interface RelationshipGraph {
  nodes: RelationshipGraphNode[];
  edges: RelationshipGraphEdge[];
}

// ============================================
// INSIGHTS E IA
// ============================================

export type InsightType =
  | 'pattern'
  | 'anomaly'
  | 'trend'
  | 'recommendation'
  | 'opportunity';

export type InsightSubjectType = 'contact' | 'group' | 'relationship' | 'global';

export type InsightSeverity = 'info' | 'warning' | 'critical';

export interface AIInsight {
  id: number;
  insightType: InsightType;
  subjectType: InsightSubjectType;
  subjectId?: string;
  title: string;
  description: string;
  severity: InsightSeverity;
  confidence: number; // 0.00 a 1.00
  supportingData: Record<string, any>;
  isActive: boolean;
  detectedAt: Date;
  acknowledgedAt?: Date;
  createdAt: Date;
}

export interface EmergingTrend {
  id: number;
  trendType: 'topic_rise' | 'sentiment_change' | 'activity_increase' | 'new_pattern';
  name: string;
  description?: string;
  growthRate: number; // Percentual
  timeWindow: 'daily' | 'weekly' | 'monthly';
  trendData: Record<string, any>;
  confidence: number;
  detectedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
}

// ============================================
// MEMÓRIAS E CONTEXTO (RAG)
// ============================================

export type MemoryType = 'fact' | 'preference' | 'decision' | 'event' | 'opinion';

export interface ConversationMemory {
  id: number;
  conversationJid?: string;
  participantJid?: string;
  memoryType: MemoryType;
  content: string;
  sourceMessageId?: string;
  importanceScore: number; // 0.00 a 1.00
  embedding?: number[]; // Vector embedding
  tags: string[];
  recalledCount: number;
  lastRecalledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationContext {
  id: number;
  conversationJid: string;
  contextName?: string;
  startMessageId?: string;
  endMessageId?: string;
  participantJids: string[];
  mainTopicId?: number;
  startTime: Date;
  endTime?: Date;
  messageCount: number;
  summary?: string;
  sentimentProgression?: Array<{ time: string; score: number }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SemanticSearchQuery {
  query: string;
  conversationJid?: string;
  participantJid?: string;
  limit?: number;
  minImportance?: number;
}

export interface SemanticSearchResult {
  memory: ConversationMemory;
  similarity: number; // 0.00 a 1.00
  relevance: number; // 0.00 a 1.00
}

// ============================================
// ALERTAS
// ============================================

export type AlertRuleType =
  | 'behavior_change'
  | 'keyword_detection'
  | 'sentiment_threshold'
  | 'engagement_drop'
  | 'anomaly_detected';

export type AlertTargetType = 'participant' | 'conversation' | 'global';

export interface AlertRule {
  id: number;
  name: string;
  description?: string;
  ruleType: AlertRuleType;
  conditions: Record<string, any>;
  targetType: AlertTargetType;
  targetJid?: string;
  actions: Record<string, any>;
  isActive: boolean;
  priority: number; // 1-10
  createdAt: Date;
  updatedAt: Date;
}

export interface Alert {
  id: number;
  alertRuleId?: number;
  conversationJid?: string;
  participantJid?: string;
  alertType: string;
  title: string;
  message: string;
  severity: InsightSeverity;
  metadata: Record<string, any>;
  isRead: boolean;
  triggeredAt: Date;
  acknowledgedAt?: Date;
  createdAt: Date;
}

// ============================================
// MÉTRICAS E DASHBOARD
// ============================================

export interface DashboardMetrics {
  totalConversations: number;
  totalParticipants: number;
  totalMessages: number;
  activeDays: number;
  avgMessageLength: number;
  firstMessageDate?: Date;
  lastMessageDate?: Date;
}

export interface ParticipantEngagementStats {
  jid: string;
  name?: string;
  messageCount: number;
  conversationsParticipated: number;
  avgResponseTime?: number;
  lastActive?: Date;
  avgSentiment?: number;
}

export interface TopicTrend {
  topicId: number;
  topicName: string;
  category?: string;
  mentionCount: number;
  avgRelevance: number;
  uniqueParticipants: number;
  lastMentioned: Date;
}

export interface ActivityHeatmap {
  hour: number; // 0-23
  dayOfWeek: number; // 0=Sunday, 6=Saturday
  messageCount: number;
  uniqueSenders: number;
}

export interface SentimentTimeSeries {
  date: Date;
  totalMessages: number;
  avgSentiment: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
}

export interface DashboardWidget {
  id: number;
  userId: string;
  widgetType: string;
  widgetConfig: Record<string, any>;
  position: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// ANÁLISE COMPORTAMENTAL COMPLETA
// ============================================

export interface BehavioralProfile {
  participant: WhatsAppParticipant;

  // Padrões de comunicação
  communicationPatterns: {
    activeHours?: ActiveHoursPattern;
    responseTime?: ResponseTimePattern;
    messageFrequency?: MessageFrequencyPattern;
  };

  // Análise de sentimento
  sentimentProfile: {
    overallSentiment: number;
    emotionalRange: EmotionScores;
    sentimentTrend: 'improving' | 'declining' | 'stable';
    moodSwings: number; // Volatilidade emocional
  };

  // Interesses e tópicos
  topInterests: ParticipantInterest[];
  topTopics: Topic[];

  // Relacionamentos
  strongestRelationships: ParticipantRelationship[];
  affinityClusters: AffinityCluster[];

  // Engajamento
  engagementMetrics: {
    responseRate: number;
    conversationInitiationRate: number;
    participationScore: number;
    avgMessagesPerDay: number;
  };

  // Insights recentes
  recentInsights: AIInsight[];
  anomalies: BehavioralAnomaly[];
}

// ============================================
// ANÁLISE DE CONVERSAÇÃO
// ============================================

export interface ConversationAnalysis {
  conversation: WhatsAppConversation;

  // Estatísticas gerais
  stats: {
    totalMessages: number;
    uniqueParticipants: number;
    avgMessagesPerParticipant: number;
    timespan: number; // Em dias
    peakActivity: Date;
  };

  // Análise de sentimento
  sentimentAnalysis: {
    overallSentiment: number;
    sentimentProgression: SentimentTimeSeries[];
    emotionalMoments: Array<{
      timestamp: Date;
      sentiment: number;
      context: string;
    }>;
  };

  // Tópicos principais
  mainTopics: TopicTrend[];

  // Participantes mais ativos
  topParticipants: ParticipantEngagementStats[];

  // Insights
  insights: AIInsight[];

  // Memórias importantes
  keyMemories: ConversationMemory[];
}

// ============================================
// REQUESTS E RESPONSES
// ============================================

export interface AnalyzeConversationRequest {
  conversationJid: string;
  startDate?: Date;
  endDate?: Date;
  includeMessages?: boolean;
}

export interface AnalyzeParticipantRequest {
  participantJid: string;
  conversationJid?: string; // Opcional: analisar em contexto específico
  period?: 'day' | 'week' | 'month' | 'all';
}

export interface GenerateInsightsRequest {
  targetType: 'participant' | 'conversation' | 'global';
  targetId?: string;
  insightTypes?: InsightType[];
  minConfidence?: number;
}

export interface DetectAnomaliesRequest {
  participantJid?: string;
  conversationJid?: string;
  anomalyTypes?: AnomalyType[];
  minSeverity?: AnomalySeverity;
}

// ============================================
// CONFIGURAÇÃO
// ============================================

export interface AnalyticsConfig {
  // Configurações de IA
  aiProvider: 'claude' | 'openai' | 'groq';
  sentimentAnalysisModel: string;
  insightGenerationModel: string;
  embeddingModel: string;

  // Limites e thresholds
  minConfidenceForInsights: number;
  anomalyDetectionSensitivity: number; // 0.00 a 1.00
  relationshipStrengthThreshold: number;

  // Performance
  batchSize: number;
  cacheEnabled: boolean;
  cacheTTL: number; // Em segundos

  // Features
  enableRealTimeAnalysis: boolean;
  enableAutomaticInsights: boolean;
  enableAnomalyDetection: boolean;
  enableSemanticSearch: boolean;
}

// ============================================
// EVENTOS (para sistema de eventos)
// ============================================

export type AnalyticsEventType =
  | 'message_analyzed'
  | 'sentiment_detected'
  | 'pattern_identified'
  | 'anomaly_detected'
  | 'insight_generated'
  | 'alert_triggered'
  | 'relationship_updated'
  | 'topic_detected';

export interface AnalyticsEvent<T = any> {
  type: AnalyticsEventType;
  timestamp: Date;
  data: T;
  metadata?: Record<string, any>;
}

// ============================================
// EXPORTAÇÃO
// ============================================

export interface ExportOptions {
  format: 'json' | 'csv' | 'pdf';
  includeMessages: boolean;
  includeSentiment: boolean;
  includeInsights: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}
