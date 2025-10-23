/**
 * 🛣️ Rotas de Conexão WhatsApp
 * Endpoints para gerenciar conexão e QR Code
 */

import type { Express, Request, Response } from 'express'
import { getWhatsAppConnectionService } from '../../services/whatsapp-connection.service.js'
import { getHistorySyncService } from '../../services/history-sync.service.js'

export function setupConnectionRoutes(app: Express): void {
  const connectionService = getWhatsAppConnectionService()
  const syncService = getHistorySyncService()

  /**
   * 🚀 POST /api/connection/start
   * Iniciar conexão e obter QR Code
   */
  app.post('/api/connection/start', async (req: Request, res: Response) => {
    try {
      console.log('📱 Iniciando conexão WhatsApp...')

      // 1. Criar instância (se não existir)
      await connectionService.createInstance()

      // 2. Conectar e obter QR Code
      const qrcode = await connectionService.connect()

      // Se já está conectado (qrcode === null)
      if (!qrcode) {
        return res.json({
          success: true,
          alreadyConnected: true,
          message: 'WhatsApp já está conectado! Redirecionando para o dashboard...',
          status: 'connected',
        })
      }

      // Se gerou QR code
      res.json({
        success: true,
        alreadyConnected: false,
        message: 'QR Code gerado. Escaneie com seu WhatsApp.',
        qrcode: {
          code: qrcode.code,
          base64: qrcode.base64,
          count: qrcode.count,
        },
      })
    } catch (error: any) {
      console.error('❌ Erro ao iniciar conexão:', error)
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao gerar QR Code',
      })
    }
  })

  /**
   * 🔍 GET /api/connection/status
   * Verificar status atual da conexão
   */
  app.get('/api/connection/status', async (req: Request, res: Response) => {
    try {
      const status = await connectionService.getConnectionStatus()

      res.json({
        success: true,
        status: status.state,
        instance: status.instance,
        lastConnected: status.lastConnected,
        qrcode: status.qrcode,
      })
    } catch (error: any) {
      console.error('❌ Erro ao verificar status:', error)
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao verificar status',
      })
    }
  })

  /**
   * 🔄 GET /api/connection/qrcode
   * Obter QR Code atual (para polling)
   */
  app.get('/api/connection/qrcode', async (req: Request, res: Response) => {
    try {
      const qrcode = await connectionService.refreshQRCode()

      res.json({
        success: true,
        qrcode: {
          code: qrcode.code,
          base64: qrcode.base64,
          count: qrcode.count,
        },
      })
    } catch (error: any) {
      console.error('❌ Erro ao obter QR Code:', error)
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao obter QR Code',
      })
    }
  })

  /**
   * ❌ POST /api/connection/disconnect
   * Desconectar WhatsApp
   */
  app.post('/api/connection/disconnect', async (req: Request, res: Response) => {
    try {
      console.log('❌ Desconectando WhatsApp...')

      const success = await connectionService.disconnect()

      if (success) {
        res.json({
          success: true,
          message: 'WhatsApp desconectado com sucesso',
        })
      } else {
        res.status(500).json({
          success: false,
          error: 'Falha ao desconectar',
        })
      }
    } catch (error: any) {
      console.error('❌ Erro ao desconectar:', error)
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao desconectar',
      })
    }
  })

  /**
   * 🔄 POST /api/connection/restart
   * Reiniciar conexão WhatsApp
   */
  app.post('/api/connection/restart', async (req: Request, res: Response) => {
    try {
      console.log('🔄 Reiniciando conexão WhatsApp...')

      const success = await connectionService.restart()

      if (success) {
        res.json({
          success: true,
          message: 'Conexão reiniciada com sucesso',
        })
      } else {
        res.status(500).json({
          success: false,
          error: 'Falha ao reiniciar',
        })
      }
    } catch (error: any) {
      console.error('❌ Erro ao reiniciar:', error)
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao reiniciar',
      })
    }
  })

  /**
   * ℹ️ GET /api/connection/info
   * Obter informações da instância
   */
  app.get('/api/connection/info', async (req: Request, res: Response) => {
    try {
      const info = await connectionService.getInstanceInfo()

      res.json({
        success: true,
        info,
      })
    } catch (error: any) {
      console.error('❌ Erro ao obter info:', error)
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao obter informações',
      })
    }
  })

  /**
   * 📚 POST /api/connection/sync-history
   * Sincronizar histórico de mensagens (30 dias)
   */
  app.post('/api/connection/sync-history', async (req: Request, res: Response) => {
    try {
      const { days = 30 } = req.body

      console.log(`📚 Iniciando sincronização de ${days} dias...`)

      // Verificar se já está conectado
      const isConnected = await connectionService.isConnected()

      if (!isConnected) {
        return res.status(400).json({
          success: false,
          error: 'WhatsApp não está conectado. Conecte-se primeiro.',
        })
      }

      // Iniciar sync em background (não aguardar término)
      syncService.syncHistory(days).then((progress) => {
        console.log('✅ Sincronização finalizada:', progress)
      }).catch((error) => {
        console.error('❌ Erro na sincronização:', error)
      })

      res.json({
        success: true,
        message: `Sincronização de ${days} dias iniciada em background`,
      })
    } catch (error: any) {
      console.error('❌ Erro ao iniciar sync:', error)
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao iniciar sincronização',
      })
    }
  })

  /**
   * 📊 GET /api/connection/sync-progress
   * Verificar progresso da sincronização
   */
  app.get('/api/connection/sync-progress', async (req: Request, res: Response) => {
    try {
      const progress = syncService.getProgress()

      res.json({
        success: true,
        progress,
      })
    } catch (error: any) {
      console.error('❌ Erro ao obter progresso:', error)
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao obter progresso',
      })
    }
  })

  /**
   * ✅ GET /api/connection/has-synced
   * Verificar se já fez sync antes (tem mensagens no banco)
   */
  app.get('/api/connection/has-synced', async (req: Request, res: Response) => {
    try {
      const hasSynced = await syncService.hasSyncedBefore()

      res.json({
        success: true,
        hasSynced,
      })
    } catch (error: any) {
      console.error('❌ Erro ao verificar sync:', error)
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao verificar sync',
      })
    }
  })

  console.log('✅ Rotas de conexão configuradas')
}
