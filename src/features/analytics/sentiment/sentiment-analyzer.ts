/**
 * 🎭 ANÁLISE DE SENTIMENTO COM IA
 * Usa Claude/OpenAI para análise avançada de sentimento e emoções
 */

import Anthropic from '@anthropic-ai/sdk';
import type {
  MessageSentiment,
  SentimentAnalysisRequest,
  SentimentAnalysisResult,
  SentimentLabel,
  EmotionScores,
} from '../core/types.js';
import { getDatabase } from '../core/database-service.js';

export class SentimentAnalyzer {
  private claude: Anthropic;
  private db = getDatabase();

  constructor() {
    this.claude = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Analisa o sentimento de uma mensagem
   */
  async analyze(request: SentimentAnalysisRequest): Promise<SentimentAnalysisResult> {
    const prompt = this.buildAnalysisPrompt(request.content, request.context);

    try {
      const response = await this.claude.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const resultText = response.content[0].type === 'text' ? response.content[0].text : '';
      const analysis = this.parseAnalysisResponse(resultText);

      const sentiment: MessageSentiment = {
        messageId: request.messageId,
        sentimentLabel: analysis.label,
        sentimentScore: analysis.score,
        emotions: analysis.emotions,
        confidence: analysis.confidence,
        analyzedAt: new Date(),
        modelUsed: 'claude',
      };

      // Salva no banco
      await this.db.saveSentiment(sentiment);

      return {
        sentiment,
        reasoning: analysis.reasoning,
      };
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      throw error;
    }
  }

  /**
   * Analisa sentimento de múltiplas mensagens em lote
   */
  async analyzeBatch(requests: SentimentAnalysisRequest[]): Promise<SentimentAnalysisResult[]> {
    const results: SentimentAnalysisResult[] = [];

    // Processa em paralelo, mas com limite de concorrência
    const batchSize = 5;
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map((req) => this.analyze(req).catch((err) => null))
      );

      results.push(...batchResults.filter((r): r is SentimentAnalysisResult => r !== null));
    }

    return results;
  }

  /**
   * Detecta mudança de sentimento ao longo do tempo
   */
  async detectSentimentShift(
    participantJid: string,
    daysBack: number = 7
  ): Promise<{
    currentAvg: number;
    previousAvg: number;
    shiftMagnitude: number;
    isSignificant: boolean;
  }> {
    const query = `
      SELECT * FROM detect_sentiment_shift($1, $2)
    `;

    const results = await this.db.query<any>(query, [participantJid, daysBack]);
    return results[0] || {
      currentAvg: 0,
      previousAvg: 0,
      shiftMagnitude: 0,
      isSignificant: false,
    };
  }

  // ============================================
  // HELPERS PRIVADOS
  // ============================================

  private buildAnalysisPrompt(content: string, context?: string): string {
    return `Você é um especialista em análise de sentimento e emoções em conversas de WhatsApp.

${context ? `CONTEXTO DA CONVERSA:\n${context}\n\n` : ''}

MENSAGEM PARA ANALISAR:
"${content}"

Analise o sentimento e emoções desta mensagem e retorne EXATAMENTE no seguinte formato JSON:

{
  "label": "positive | negative | neutral | mixed",
  "score": <número entre -1.0 (muito negativo) e 1.0 (muito positivo)>,
  "emotions": {
    "joy": <0.0 a 1.0>,
    "sadness": <0.0 a 1.0>,
    "anger": <0.0 a 1.0>,
    "fear": <0.0 a 1.0>,
    "surprise": <0.0 a 1.0>,
    "disgust": <0.0 a 1.0>
  },
  "confidence": <0.0 a 1.0>,
  "reasoning": "breve explicação da sua análise"
}

IMPORTANTE:
- Considere o contexto brasileiro e expressões coloquiais do português
- Considere emojis e sua contribuição emocional
- Seja preciso e objetivo
- O score deve refletir a intensidade do sentimento
- A soma das emoções não precisa ser 1.0 (podem coexistir)

Retorne APENAS o JSON, sem markdown ou explicações adicionais.`;
  }

  private parseAnalysisResponse(response: string): {
    label: SentimentLabel;
    score: number;
    emotions: EmotionScores;
    confidence: number;
    reasoning: string;
  } {
    try {
      // Remove markdown se existir
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanResponse);

      return {
        label: this.normalizeSentimentLabel(parsed.label),
        score: this.normalizeScore(parsed.score),
        emotions: this.normalizeEmotions(parsed.emotions),
        confidence: this.normalizeConfidence(parsed.confidence),
        reasoning: parsed.reasoning || 'Análise automática',
      };
    } catch (error) {
      console.error('Error parsing sentiment analysis response:', error);
      console.error('Response:', response);

      // Fallback para sentimento neutro
      return {
        label: 'neutral',
        score: 0,
        emotions: {
          joy: 0,
          sadness: 0,
          anger: 0,
          fear: 0,
          surprise: 0,
          disgust: 0,
        },
        confidence: 0.5,
        reasoning: 'Análise automática (fallback)',
      };
    }
  }

  private normalizeSentimentLabel(label: string): SentimentLabel {
    const normalized = label.toLowerCase();
    if (['positive', 'negative', 'neutral', 'mixed'].includes(normalized)) {
      return normalized as SentimentLabel;
    }
    return 'neutral';
  }

  private normalizeScore(score: number): number {
    return Math.max(-1, Math.min(1, score));
  }

  private normalizeEmotions(emotions: any): EmotionScores {
    return {
      joy: this.normalizeEmotion(emotions.joy),
      sadness: this.normalizeEmotion(emotions.sadness),
      anger: this.normalizeEmotion(emotions.anger),
      fear: this.normalizeEmotion(emotions.fear),
      surprise: this.normalizeEmotion(emotions.surprise),
      disgust: this.normalizeEmotion(emotions.disgust),
    };
  }

  private normalizeEmotion(value: number): number {
    return Math.max(0, Math.min(1, value || 0));
  }

  private normalizeConfidence(confidence: number): number {
    return Math.max(0, Math.min(1, confidence || 0.5));
  }

  /**
   * Analisa a tendência emocional de uma conversa ao longo do tempo
   */
  async analyzeSentimentProgression(
    conversationJid: string,
    limit: number = 50
  ): Promise<Array<{ timestamp: Date; score: number; label: SentimentLabel }>> {
    const query = `
      SELECT
        to_timestamp(m.timestamp) as timestamp,
        ms.sentiment_score as score,
        ms.sentiment_label as label
      FROM messages m
      JOIN message_sentiment ms ON m.message_id = ms.message_id
      WHERE m.conversation_jid = $1
      ORDER BY m.timestamp ASC
      LIMIT $2
    `;

    return this.db.query(query, [conversationJid, limit]);
  }

  /**
   * Identifica momentos emocionais intensos (picos)
   */
  async findEmotionalPeaks(
    conversationJid: string,
    threshold: number = 0.7
  ): Promise<Array<{
    messageId: string;
    content: string;
    timestamp: Date;
    sentimentScore: number;
    dominantEmotion: string;
  }>> {
    const query = `
      SELECT
        m.message_id,
        m.content,
        to_timestamp(m.timestamp) as timestamp,
        ms.sentiment_score,
        (
          SELECT key
          FROM jsonb_each(ms.emotions)
          ORDER BY value DESC
          LIMIT 1
        ) as dominant_emotion
      FROM messages m
      JOIN message_sentiment ms ON m.message_id = ms.message_id
      WHERE m.conversation_jid = $1
        AND ABS(ms.sentiment_score) >= $2
      ORDER BY ABS(ms.sentiment_score) DESC
      LIMIT 10
    `;

    return this.db.query(query, [conversationJid, threshold]);
  }

  /**
   * Calcula o "clima emocional" geral de um participante
   */
  async getEmotionalClimate(
    participantJid: string
  ): Promise<{
    avgSentiment: number;
    dominantEmotion: string;
    emotionalVolatility: number;
    trend: 'improving' | 'declining' | 'stable';
  }> {
    const query = `
      SELECT
        AVG(ms.sentiment_score) as avg_sentiment,
        STDDEV(ms.sentiment_score) as volatility,
        (
          SELECT key
          FROM (
            SELECT key, AVG((value)::float) as avg_value
            FROM messages m2
            JOIN message_sentiment ms2 ON m2.message_id = ms2.message_id,
            jsonb_each(ms2.emotions)
            WHERE m2.sender_jid = $1
            GROUP BY key
          ) emotions
          ORDER BY avg_value DESC
          LIMIT 1
        ) as dominant_emotion
      FROM messages m
      JOIN message_sentiment ms ON m.message_id = ms.message_id
      WHERE m.sender_jid = $1
    `;

    const result = await this.db.query<any>(query, [participantJid]);
    const data = result[0] || {};

    // Detecta tendência comparando últimas mensagens com anteriores
    const shift = await this.detectSentimentShift(participantJid, 7);

    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (shift.isSignificant) {
      trend = shift.currentAvg > shift.previousAvg ? 'improving' : 'declining';
    }

    return {
      avgSentiment: data.avg_sentiment || 0,
      dominantEmotion: data.dominant_emotion || 'neutral',
      emotionalVolatility: data.volatility || 0,
      trend,
    };
  }
}

// Singleton instance
let analyzerInstance: SentimentAnalyzer | null = null;

export function getSentimentAnalyzer(): SentimentAnalyzer {
  if (!analyzerInstance) {
    analyzerInstance = new SentimentAnalyzer();
  }
  return analyzerInstance;
}
