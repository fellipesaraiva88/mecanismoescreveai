/**
 * Servidor de webhooks para receber eventos externos
 */

import express, { type Request, type Response, type NextFunction } from 'express';
import type { WhatsAppWebhookPayload } from '../integrations/whatsapp.js';

export type WebhookHandler<T = any> = (
  payload: T,
  req: Request,
  res: Response
) => Promise<void> | void;

export interface WebhookRoute {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  handler: WebhookHandler;
}

export class WebhookServer {
  private app: express.Application;
  private routes: Map<string, WebhookRoute> = new Map();

  constructor(private port: number = 3000) {
    this.app = express();
    this.setupMiddleware();
  }

  private setupMiddleware() {
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // CORS
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }

      next();
    });

    // Logger
    this.app.use((req, res, next) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
      next();
    });

    // Error handler
    this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error('Error:', err);
      res.status(500).json({
        error: err.message,
        timestamp: new Date().toISOString(),
      });
    });
  }

  /**
   * Registra uma rota de webhook
   */
  registerWebhook(route: WebhookRoute): this {
    const routeKey = `${route.method}:${route.path}`;
    this.routes.set(routeKey, route);

    const method = route.method.toLowerCase() as 'get' | 'post' | 'put' | 'delete';

    this.app[method](route.path, async (req, res) => {
      try {
        await route.handler(req.body, req, res);

        // Só envia resposta se ainda não foi enviada
        if (!res.headersSent) {
          res.status(200).json({
            success: true,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error(`Error in webhook ${route.path}:`, error);

        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
          });
        }
      }
    });

    return this;
  }

  /**
   * Registra um webhook para WhatsApp
   */
  onWhatsApp(path: string, handler: WebhookHandler<WhatsAppWebhookPayload>): this {
    return this.registerWebhook({
      path,
      method: 'POST',
      handler,
    });
  }

  /**
   * Health check endpoint
   */
  setupHealthCheck(path: string = '/health'): this {
    this.app.get(path, (req, res) => {
      res.json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        routes: Array.from(this.routes.keys()),
      });
    });

    return this;
  }

  /**
   * Inicia o servidor
   */
  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.app.listen(this.port, () => {
        console.log(`🚀 Webhook server running on port ${this.port}`);
        console.log(`📋 Registered routes: ${Array.from(this.routes.keys()).join(', ')}`);
        resolve();
      });
    });
  }

  /**
   * Retorna a instância do Express (para customizações)
   */
  getApp(): express.Application {
    return this.app;
  }
}

/**
 * Middleware helpers
 */
export const Middleware = {
  /**
   * Valida que o webhook veio de uma fonte confiável
   */
  validateApiKey(expectedKey: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      const apiKey = req.headers['apikey'] || req.headers['authorization'];

      if (apiKey !== expectedKey) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      next();
    };
  },

  /**
   * Rate limiting simples
   */
  rateLimit(maxRequests: number, windowMs: number) {
    const requests = new Map<string, number[]>();

    return (req: Request, res: Response, next: NextFunction) => {
      const ip = req.ip || 'unknown';
      const now = Date.now();

      const userRequests = requests.get(ip) || [];
      const recentRequests = userRequests.filter((time) => now - time < windowMs);

      if (recentRequests.length >= maxRequests) {
        return res.status(429).json({ error: 'Too many requests' });
      }

      recentRequests.push(now);
      requests.set(ip, recentRequests);

      next();
    };
  },
};
