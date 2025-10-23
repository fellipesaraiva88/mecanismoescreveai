/**
 * 💡 GERADOR DE INSIGHTS COM IA
 * Gera insights automáticos usando Claude
 */

import Anthropic from '@anthropic-ai/sdk';
import type { AIInsight, GenerateInsightsRequest } from '../core/types.js';
import { getDatabase } from '../core/database-service.js';

export class InsightGenerator {
  private claude: Anthropic;
  private db = getDatabase();

  constructor() {
    this.claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  async generate(request: GenerateInsightsRequest): Promise<AIInsight[]> {
    const context = await this.gatherContext(request);
    const prompt = this.buildInsightPrompt(context);

    try {
      const response = await this.claude.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      });

      const insights = this.parseInsights(
        response.content[0].type === 'text' ? response.content[0].text : '[]',
        request
      );

      for (const insight of insights) {
        await this.db.saveInsight(insight);
      }

      return insights;
    } catch (error) {
      console.error('Error generating insights:', error);
      return [];
    }
  }

  private async gatherContext(request: GenerateInsightsRequest): Promise<any> {
    // Reúne dados relevantes baseado no tipo de análise
    return {
      targetType: request.targetType,
      targetId: request.targetId,
      timestamp: new Date(),
    };
  }

  private buildInsightPrompt(context: any): string {
    return `Você é um especialista em análise comportamental de conversas do WhatsApp.

Analise os dados fornecidos e gere insights valiosos no formato JSON array:

[
  {
    "type": "pattern | anomaly | trend | recommendation",
    "title": "título curto do insight",
    "description": "descrição detalhada",
    "severity": "info | warning | critical",
    "confidence": 0.0-1.0,
    "supportingData": {}
  }
]

Foque em insights acionáveis e significativos.`;
  }

  private parseInsights(response: string, request: GenerateInsightsRequest): AIInsight[] {
    try {
      const parsed = JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
      return parsed.map((item: any) => ({
        id: 0,
        insightType: item.type,
        subjectType: request.targetType,
        subjectId: request.targetId,
        title: item.title,
        description: item.description,
        severity: item.severity,
        confidence: item.confidence,
        supportingData: item.supportingData || {},
        isActive: true,
        detectedAt: new Date(),
        createdAt: new Date(),
      }));
    } catch {
      return [];
    }
  }
}

export function getInsightGenerator(): InsightGenerator {
  return new InsightGenerator();
}
