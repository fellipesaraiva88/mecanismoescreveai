/**
 * 📚 Serviço de Sincronização de Histórico WhatsApp
 * Busca e processa mensagens dos últimos 30 dias
 */

import axios, { type AxiosInstance } from 'axios'
import { getMessageProcessor } from '../features/analytics/core/message-processor.js'
import type { WhatsAppMessage } from '../integrations/whatsapp.js'

export interface SyncProgress {
  status: 'idle' | 'syncing' | 'completed' | 'error'
  totalMessages: number
  processedMessages: number
  progressPercent: number
  startedAt?: Date
  completedAt?: Date
  error?: string
}

export interface ChatMessage {
  key: {
    remoteJid: string
    fromMe: boolean
    id: string
    participant?: string
  }
  pushName?: string
  message: any
  messageType: string
  messageTimestamp: number
}

export class HistorySyncService {
  private client: AxiosInstance
  private instance: string
  private syncProgress: SyncProgress = {
    status: 'idle',
    totalMessages: 0,
    processedMessages: 0,
    progressPercent: 0,
  }

  constructor(
    baseURL: string = process.env.EVOLUTION_API_URL || '',
    apiKey: string = process.env.EVOLUTION_API_KEY || '',
    instance: string = process.env.EVOLUTION_INSTANCE || 'saraiva'
  ) {
    this.instance = instance

    this.client = axios.create({
      baseURL,
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 60000, // 60 segundos para operações pesadas
    })
  }

  /**
   * 📊 Obter progresso atual do sync
   */
  getProgress(): SyncProgress {
    return { ...this.syncProgress }
  }

  /**
   * 📥 Buscar todas as conversas (chats)
   */
  async fetchChats(): Promise<any[]> {
    try {
      console.log('🔍 Buscando lista de conversas...')

      const response = await this.client.get(`/chat/findChats/${this.instance}`)

      const chats = response.data || []
      console.log(`✅ ${chats.length} conversas encontradas`)

      return chats
    } catch (error: any) {
      console.error('❌ Erro ao buscar conversas:', error.message)
      return []
    }
  }

  /**
   * 📩 Buscar mensagens de uma conversa específica
   */
  async fetchMessagesFromChat(chatJid: string, limit: number = 100): Promise<ChatMessage[]> {
    try {
      console.log(`📥 Buscando mensagens de ${chatJid} (limite: ${limit})`)

      const response = await this.client.get(`/chat/findMessages/${this.instance}`, {
        params: {
          where: JSON.stringify({
            key: { remoteJid: chatJid }
          }),
          limit,
        }
      })

      const messages = response.data || []
      console.log(`✅ ${messages.length} mensagens encontradas`)

      return messages
    } catch (error: any) {
      console.error(`❌ Erro ao buscar mensagens de ${chatJid}:`, error.message)
      return []
    }
  }

  /**
   * 🕐 Filtrar mensagens dos últimos N dias
   */
  filterMessagesByDays(messages: ChatMessage[], days: number = 30): ChatMessage[] {
    const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000)

    return messages.filter((msg) => {
      const timestamp = msg.messageTimestamp * 1000 // Converter para ms
      return timestamp >= cutoffDate
    })
  }

  /**
   * 🚀 Sincronizar histórico completo (30 dias)
   */
  async syncHistory(days: number = 30): Promise<SyncProgress> {
    try {
      this.syncProgress = {
        status: 'syncing',
        totalMessages: 0,
        processedMessages: 0,
        progressPercent: 0,
        startedAt: new Date(),
      }

      console.log(`\n╔═══════════════════════════════════════════════════════╗`)
      console.log(`║  📚 INICIANDO SINCRONIZAÇÃO DE HISTÓRICO             ║`)
      console.log(`║  📅 Período: Últimos ${days} dias                         ║`)
      console.log(`╚═══════════════════════════════════════════════════════╝\n`)

      // 1. Buscar todas as conversas
      const chats = await this.fetchChats()

      if (chats.length === 0) {
        console.log('⚠️ Nenhuma conversa encontrada')
        this.syncProgress.status = 'completed'
        this.syncProgress.completedAt = new Date()
        return this.syncProgress
      }

      // 2. Para cada conversa, buscar mensagens
      const messageProcessor = getMessageProcessor()
      let allMessages: ChatMessage[] = []

      for (const chat of chats) {
        const chatJid = chat.id || chat.remoteJid

        if (!chatJid) continue

        console.log(`\n📁 Processando conversa: ${chatJid}`)

        // Buscar mensagens (max 200 por conversa para não sobrecarregar)
        const messages = await this.fetchMessagesFromChat(chatJid, 200)

        // Filtrar pelos últimos N dias
        const recentMessages = this.filterMessagesByDays(messages, days)

        console.log(`   ✅ ${recentMessages.length} mensagens dos últimos ${days} dias`)

        allMessages = allMessages.concat(recentMessages)

        // Aguardar 500ms entre requisições para não sobrecarregar API
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      this.syncProgress.totalMessages = allMessages.length

      console.log(`\n📊 Total de mensagens a processar: ${allMessages.length}`)

      // 3. Processar mensagens em lotes de 50
      const batchSize = 50
      for (let i = 0; i < allMessages.length; i += batchSize) {
        const batch = allMessages.slice(i, i + batchSize)

        console.log(`\n🔄 Processando lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(allMessages.length / batchSize)}`)

        // Processar cada mensagem do lote
        for (const msg of batch) {
          try {
            // Converter para formato WhatsAppMessage
            const whatsappMessage: WhatsAppMessage = {
              key: msg.key,
              pushName: msg.pushName,
              message: msg.message,
              messageType: msg.messageType,
              messageTimestamp: msg.messageTimestamp,
              instanceId: this.instance,
            }

            // Processar via message processor (salva no banco + analytics)
            await messageProcessor.processWebhookMessage({
              event: 'messages.upsert',
              instance: this.instance,
              data: whatsappMessage,
              sender: '',
              server_url: '',
              apikey: '',
            })

            this.syncProgress.processedMessages++
            this.syncProgress.progressPercent = Math.round(
              (this.syncProgress.processedMessages / this.syncProgress.totalMessages) * 100
            )
          } catch (error: any) {
            console.error(`   ⚠️ Erro ao processar mensagem ${msg.key.id}:`, error.message)
          }
        }

        console.log(`   ✅ Lote processado (${this.syncProgress.processedMessages}/${this.syncProgress.totalMessages})`)

        // Aguardar 1s entre lotes
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      // 4. Finalizar
      this.syncProgress.status = 'completed'
      this.syncProgress.completedAt = new Date()
      this.syncProgress.progressPercent = 100

      const duration = this.syncProgress.completedAt.getTime() - this.syncProgress.startedAt!.getTime()
      const durationMin = Math.round(duration / 1000 / 60)

      console.log(`\n╔═══════════════════════════════════════════════════════╗`)
      console.log(`║  ✅ SINCRONIZAÇÃO CONCLUÍDA!                         ║`)
      console.log(`║  📊 Mensagens processadas: ${this.syncProgress.processedMessages.toString().padEnd(24)}║`)
      console.log(`║  ⏱️  Duração: ${durationMin} minutos${' '.repeat(32 - durationMin.toString().length)}║`)
      console.log(`╚═══════════════════════════════════════════════════════╝\n`)

      return this.syncProgress

    } catch (error: any) {
      console.error('❌ Erro durante sincronização:', error.message)

      this.syncProgress.status = 'error'
      this.syncProgress.error = error.message
      this.syncProgress.completedAt = new Date()

      return this.syncProgress
    }
  }

  /**
   * 🔄 Resetar progresso
   */
  resetProgress(): void {
    this.syncProgress = {
      status: 'idle',
      totalMessages: 0,
      processedMessages: 0,
      progressPercent: 0,
    }
  }

  /**
   * ✅ Verificar se sync já foi feito (tem mensagens no banco)
   */
  async hasSyncedBefore(): Promise<boolean> {
    try {
      const { Pool } = await import('pg')
      const pool = new Pool({ connectionString: process.env.DATABASE_URL })

      const result = await pool.query('SELECT COUNT(*) as count FROM messages')
      const count = parseInt(result.rows[0]?.count || '0')

      await pool.end()

      return count > 0
    } catch (error) {
      console.error('Erro ao verificar sync anterior:', error)
      return false
    }
  }
}

// Singleton
let historySyncServiceInstance: HistorySyncService | null = null

export function getHistorySyncService(): HistorySyncService {
  if (!historySyncServiceInstance) {
    historySyncServiceInstance = new HistorySyncService()
  }
  return historySyncServiceInstance
}
