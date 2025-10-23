/**
 * 🚨 MOTOR DE ALERTAS INTELIGENTES
 * Avalia regras e dispara alertas automaticamente
 */

import type { Alert, AlertRule, BehavioralAnomaly } from '../core/types.js';
import { getDatabase } from '../core/database-service.js';

export class AlertEngine {
  private db = getDatabase();

  async evaluateRules(): Promise<Alert[]> {
    const query = `SELECT * FROM alert_rules WHERE is_active = TRUE`;
    const rules = await this.db.query<AlertRule>(query);

    const alerts: Alert[] = [];

    for (const rule of rules) {
      const ruleAlerts = await this.evaluateRule(rule);
      alerts.push(...ruleAlerts);
    }

    return alerts;
  }

  private async evaluateRule(rule: AlertRule): Promise<Alert[]> {
    const alerts: Alert[] = [];

    // Lógica de avaliação baseada no tipo de regra
    switch (rule.ruleType) {
      case 'sentiment_threshold':
        const sentimentAlerts = await this.evaluateSentimentRule(rule);
        alerts.push(...sentimentAlerts);
        break;

      case 'behavior_change':
        const behaviorAlerts = await this.evaluateBehaviorChangeRule(rule);
        alerts.push(...behaviorAlerts);
        break;

      // Adicionar outros tipos conforme necessário
    }

    return alerts;
  }

  private async evaluateSentimentRule(rule: AlertRule): Promise<Alert[]> {
    // Implementação simplificada
    return [];
  }

  private async evaluateBehaviorChangeRule(rule: AlertRule): Promise<Alert[]> {
    // Implementação simplificada
    return [];
  }

  async triggerAnomaly(anomaly: BehavioralAnomaly): Promise<void> {
    const alert: Omit<Alert, 'id' | 'createdAt'> = {
      alertRuleId: undefined,
      conversationJid: anomaly.conversationJid,
      participantJid: anomaly.participantJid,
      alertType: anomaly.anomalyType,
      title: `Anomalia Detectada: ${anomaly.anomalyType}`,
      message: anomaly.description,
      severity: anomaly.severity === 'high' ? 'critical' : 'warning',
      metadata: { anomalyId: anomaly.id },
      isRead: false,
      triggeredAt: new Date(),
    };

    await this.db.saveAlert(alert);
  }
}

export function getAlertEngine(): AlertEngine {
  return new AlertEngine();
}
