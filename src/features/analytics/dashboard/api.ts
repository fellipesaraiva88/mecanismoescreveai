/**
 * 🎯 API REST PARA O DASHBOARD DE ANÁLISE COMPORTAMENTAL
 * Endpoints completos para visualização de dados
 */

import express, { type Request, type Response, type Router } from 'express';
import { getDatabase } from '../core/database-service.js';
import { getSentimentAnalyzer } from '../sentiment/sentiment-analyzer.js';
import { getPatternDetector } from '../metrics/pattern-detector.js';
import { getRelationshipBuilder } from '../relationships/relationship-builder.js';
import { getInsightGenerator } from '../insights/insight-generator.js';

export class DashboardAPI {
  public router: Router;
  private db = getDatabase();
  private sentimentAnalyzer = getSentimentAnalyzer();
  private patternDetector = getPatternDetector();
  private relationshipBuilder = getRelationshipBuilder();
  private insightGenerator = getInsightGenerator();

  constructor() {
    this.router = express.Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    // ============================================
    // 1. PAINEL PRINCIPAL (Dashboard Overview)
    // ============================================

    this.router.get('/dashboard/overview', async (req: Request, res: Response) => {
      try {
        const metrics = await this.db.getDashboardMetrics();
        const activeAlerts = await this.db.getUnreadAlerts(10);
        const recentInsights = await this.db.getActiveInsights(10);

        res.json({
          success: true,
          data: {
            metrics,
            alerts: activeAlerts,
            insights: recentInsights,
          },
        });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // ============================================
    // 2. ANÁLISE DE PARTICIPANTES
    // ============================================

    this.router.get('/participants', async (req: Request, res: Response) => {
      try {
        const limit = parseInt(req.query.limit as string) || 50;
        const participants = await this.db.getAllParticipants(limit);

        res.json({ success: true, data: participants });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.router.get('/participants/:jid/profile', async (req: Request, res: Response) => {
      try {
        const { jid } = req.params;

        const [participant, patterns, interests, relationships, sentimentClimate] =
          await Promise.all([
            this.db.getParticipant(jid),
            this.db.getPatternsByParticipant(jid),
            this.db.getParticipantInterests(jid),
            this.db.getRelationshipsByParticipant(jid),
            this.sentimentAnalyzer.getEmotionalClimate(jid),
          ]);

        res.json({
          success: true,
          data: {
            participant,
            patterns,
            interests,
            relationships,
            sentimentClimate,
          },
        });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.router.post('/participants/:jid/analyze', async (req: Request, res: Response) => {
      try {
        const { jid } = req.params;
        const patterns = await this.patternDetector.detectAllPatterns(jid);

        res.json({ success: true, data: patterns });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // ============================================
    // 3. ANÁLISE DE SENTIMENTO
    // ============================================

    this.router.get('/sentiment/overview', async (req: Request, res: Response) => {
      try {
        const query = `SELECT * FROM daily_sentiment_analysis LIMIT 30`;
        const data = await this.db.query(query);

        res.json({ success: true, data });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.router.get(
      '/sentiment/conversation/:jid/progression',
      async (req: Request, res: Response) => {
        try {
          const { jid } = req.params;
          const limit = parseInt(req.query.limit as string) || 50;

          const progression = await this.sentimentAnalyzer.analyzeSentimentProgression(jid, limit);

          res.json({ success: true, data: progression });
        } catch (error: any) {
          res.status(500).json({ success: false, error: error.message });
        }
      }
    );

    this.router.get('/sentiment/conversation/:jid/peaks', async (req: Request, res: Response) => {
      try {
        const { jid } = req.params;
        const threshold = parseFloat(req.query.threshold as string) || 0.7;

        const peaks = await this.sentimentAnalyzer.findEmotionalPeaks(jid, threshold);

        res.json({ success: true, data: peaks });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // ============================================
    // 4. RELACIONAMENTOS (Grafo Social)
    // ============================================

    this.router.get('/relationships/graph', async (req: Request, res: Response) => {
      try {
        const conversationJid = req.query.conversation as string | undefined;
        const graph = await this.relationshipBuilder.buildRelationshipGraph(conversationJid);

        res.json({ success: true, data: graph });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.router.get('/relationships/strongest', async (req: Request, res: Response) => {
      try {
        const limit = parseInt(req.query.limit as string) || 20;
        const relationships = await this.db.getStrongestRelationships(limit);

        res.json({ success: true, data: relationships });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // ============================================
    // 5. INSIGHTS E IA
    // ============================================

    this.router.get('/insights', async (req: Request, res: Response) => {
      try {
        const limit = parseInt(req.query.limit as string) || 50;
        const insights = await this.db.getActiveInsights(limit);

        res.json({ success: true, data: insights });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.router.post('/insights/generate', async (req: Request, res: Response) => {
      try {
        const { targetType, targetId, insightTypes } = req.body;

        const insights = await this.insightGenerator.generate({
          targetType,
          targetId,
          insightTypes,
        });

        res.json({ success: true, data: insights });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // ============================================
    // 6. ALERTAS
    // ============================================

    this.router.get('/alerts', async (req: Request, res: Response) => {
      try {
        const limit = parseInt(req.query.limit as string) || 50;
        const alerts = await this.db.getUnreadAlerts(limit);

        res.json({ success: true, data: alerts });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.router.post('/alerts/:id/read', async (req: Request, res: Response) => {
      try {
        const alertId = parseInt(req.params.id);
        await this.db.markAlertAsRead(alertId);

        res.json({ success: true, message: 'Alert marked as read' });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // ============================================
    // 7. ATIVIDADE E MÉTRICAS
    // ============================================

    this.router.get('/activity/heatmap', async (req: Request, res: Response) => {
      try {
        const query = `SELECT * FROM hourly_activity_heatmap`;
        const heatmap = await this.db.query(query);

        res.json({ success: true, data: heatmap });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.router.get('/activity/trending-topics', async (req: Request, res: Response) => {
      try {
        const query = `SELECT * FROM trending_topics`;
        const topics = await this.db.query(query);

        res.json({ success: true, data: topics });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // ============================================
    // 8. CONVERSAS
    // ============================================

    this.router.get('/conversations/:jid', async (req: Request, res: Response) => {
      try {
        const { jid } = req.params;
        const conversation = await this.db.getConversation(jid);

        res.json({ success: true, data: conversation });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.router.get('/conversations/:jid/messages', async (req: Request, res: Response) => {
      try {
        const { jid } = req.params;
        const limit = parseInt(req.query.limit as string) || 100;
        const offset = parseInt(req.query.offset as string) || 0;

        const messages = await this.db.getMessagesByConversation(jid, limit, offset);

        res.json({ success: true, data: messages });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.router.get('/conversations/:jid/memories', async (req: Request, res: Response) => {
      try {
        const { jid } = req.params;
        const limit = parseInt(req.query.limit as string) || 20;

        const memories = await this.db.getMemoriesByConversation(jid, limit);

        res.json({ success: true, data: memories });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // ============================================
    // 9. ANOMALIAS
    // ============================================

    this.router.get('/anomalies', async (req: Request, res: Response) => {
      try {
        const anomalies = await this.db.getActiveAnomalies();

        res.json({ success: true, data: anomalies });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
  }
}

// Exporta função helper para adicionar ao Express app
export function setupDashboardAPI(app: express.Application): void {
  const dashboardAPI = new DashboardAPI();
  app.use('/api/analytics', dashboardAPI.router);
}
