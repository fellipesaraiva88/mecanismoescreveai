/**
 * 🚀 SERVIDOR PRINCIPAL - Analytics Backend
 * Express server com APIs de análise comportamental
 */

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { setupDashboardAPI } from '../features/analytics/dashboard/api.js'
import { setupConnectionRoutes } from './routes/connection.routes.js'
import { getMessageProcessor } from '../features/analytics/core/message-processor.js'
import { getAnalyticsOrchestrator } from '../services/analytics-orchestrator.service.js'
import type { WhatsAppWebhookPayload } from '../integrations/whatsapp.js'

// Carrega variáveis de ambiente
dotenv.config()

// Iniciar orquestrador de analytics
const orchestrator = getAnalyticsOrchestrator()
orchestrator.start()

const app = express()
const PORT = process.env.PORT || 3333

// ============================================
// MIDDLEWARES
// ============================================

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
}))

app.use(express.json())

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    port: PORT,
  })
})

// ============================================
// WEBHOOK DO WHATSAPP
// ============================================

const messageProcessor = getMessageProcessor()

app.post('/webhook/whatsapp', async (req, res) => {
  try {
    const payload: WhatsAppWebhookPayload = req.body

    console.log('📩 Webhook recebido:', payload.event)

    // Processar diferentes tipos de eventos
    switch (payload.event) {
      case 'messages.upsert':
        // Nova mensagem recebida
        messageProcessor.processWebhookMessage(payload).catch((error) => {
          console.error('Error processing webhook message:', error)
        })
        break

      case 'qrcode.updated':
        // QR Code atualizado
        console.log('🔄 QR Code atualizado')
        // TODO: Emitir evento via WebSocket para frontend
        break

      case 'connection.update':
        // Status de conexão atualizado
        console.log('🔌 Conexão atualizada:', payload.data)
        // TODO: Emitir evento via WebSocket para frontend
        break

      case 'messages.update':
        // Mensagem atualizada (lida, deletada, etc)
        console.log('📝 Mensagem atualizada')
        break

      case 'messages.delete':
        // Mensagem deletada
        console.log('🗑️ Mensagem deletada')
        break

      default:
        console.log('ℹ️ Evento não processado:', payload.event)
    }

    res.json({ success: true, message: 'Webhook received' })
  } catch (error: any) {
    console.error('Webhook error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// ============================================
// ANALYTICS APIs
// ============================================

setupDashboardAPI(app)

// ============================================
// CONNECTION APIs
// ============================================

setupConnectionRoutes(app)

// ============================================
// ERROR HANDLER
// ============================================

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  })
})

// ============================================
// 404 HANDLER
// ============================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
  })
})

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   📊 WhatsApp Analytics Backend                      ║
║                                                       ║
║   🚀 Server running on port ${PORT}                     ║
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}                   ║
║   📡 Webhook: http://localhost:${PORT}/webhook/whatsapp ║
║   🔧 Health: http://localhost:${PORT}/health            ║
║   📊 API: http://localhost:${PORT}/api/analytics        ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `)
})

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...')
  process.exit(0)
})
