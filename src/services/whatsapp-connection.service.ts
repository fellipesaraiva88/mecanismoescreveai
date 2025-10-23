/**
 * 🔌 Serviço de Conexão WhatsApp via Evolution API
 * Gerencia conexão, QR Code, status e reconexão automática
 */

import axios, { type AxiosInstance } from 'axios'

export interface QRCodeData {
  code: string
  base64: string
  count: number
}

export interface ConnectionStatus {
  state: 'connected' | 'connecting' | 'disconnected' | 'qr'
  instance: string
  qrcode?: QRCodeData
  lastConnected?: Date
}

export interface InstanceInfo {
  instance: {
    instanceName: string
    status: string
    state: string
  }
}

export class WhatsAppConnectionService {
  private client: AxiosInstance
  private instance: string
  private apiKey: string

  constructor(
    baseURL: string = process.env.EVOLUTION_API_URL || '',
    apiKey: string = process.env.EVOLUTION_API_KEY || '',
    instance: string = process.env.EVOLUTION_INSTANCE || 'saraiva'
  ) {
    this.instance = instance
    this.apiKey = apiKey

    this.client = axios.create({
      baseURL,
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    })
  }

  /**
   * 🆕 Criar uma nova instância (se não existir)
   */
  async createInstance(): Promise<any> {
    try {
      // Primeiro, verifica se a instância já existe
      const existingInstance = await this.getInstanceInfo()

      if (existingInstance) {
        console.log('ℹ️ Instância já existe:', this.instance)
        return { exists: true, instance: existingInstance }
      }

      // Se não existe, cria uma nova
      const response = await this.client.post('/instance/create', {
        instanceName: this.instance,
        token: this.apiKey,
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS',
      })

      console.log('✅ Instância criada:', this.instance)
      return response.data
    } catch (error: any) {
      // 403 ou 409 significa que a instância já existe
      if (error.response?.status === 403 || error.response?.status === 409) {
        console.log('ℹ️ Instância já existe (erro capturado):', this.instance)
        return { exists: true }
      }
      throw error
    }
  }

  /**
   * 📱 Conectar instância e obter QR Code
   */
  async connect(): Promise<QRCodeData | null> {
    try {
      console.log(`🔄 Tentando conectar instância: ${this.instance}`)

      const response = await this.client.get(`/instance/connect/${this.instance}`)

      // Se já está conectado, retorna null (sem QR code)
      if (response.data.instance?.state === 'open') {
        console.log('✅ Instância já está conectada - sem necessidade de QR Code')
        return null
      }

      // Se tem QR code, retorna
      if (response.data.code) {
        console.log('✅ QR Code obtido com sucesso')
        return {
          code: response.data.code,
          base64: response.data.base64 || '',
          count: response.data.count || 0,
        }
      }

      // Se tem pairingCode, também funciona como QR code alternativo
      if (response.data.pairingCode) {
        console.log('✅ Pairing Code obtido (alternativa ao QR Code)')
        return {
          code: response.data.pairingCode,
          base64: '',
          count: 0,
        }
      }

      throw new Error('Nenhum código de autenticação retornado pela API')
    } catch (error: any) {
      console.error('❌ Erro ao conectar:', error.message)
      throw error
    }
  }

  /**
   * 🔍 Verificar status de conexão da instância
   */
  async getConnectionStatus(): Promise<ConnectionStatus> {
    try {
      const response = await this.client.get(`/instance/connectionState/${this.instance}`)

      const state = response.data?.instance?.state || 'disconnected'

      return {
        state: this.mapState(state),
        instance: this.instance,
        lastConnected: response.data?.instance?.lastConnected
          ? new Date(response.data.instance.lastConnected)
          : undefined,
      }
    } catch (error: any) {
      console.error('❌ Erro ao verificar status:', error.message)
      return {
        state: 'disconnected',
        instance: this.instance,
      }
    }
  }

  /**
   * 🔄 Obter novo QR Code (refresh)
   */
  async refreshQRCode(): Promise<QRCodeData> {
    try {
      // Primeiro tenta conectar novamente
      return await this.connect()
    } catch (error) {
      console.error('Erro ao renovar QR Code:', error)
      throw error
    }
  }

  /**
   * ❌ Desconectar instância
   */
  async disconnect(): Promise<boolean> {
    try {
      await this.client.delete(`/instance/logout/${this.instance}`)
      console.log('✅ Instância desconectada:', this.instance)
      return true
    } catch (error: any) {
      console.error('❌ Erro ao desconectar:', error.message)
      return false
    }
  }

  /**
   * 🔄 Reiniciar instância
   */
  async restart(): Promise<boolean> {
    try {
      await this.client.put(`/instance/restart/${this.instance}`)
      console.log('✅ Instância reiniciada:', this.instance)
      return true
    } catch (error: any) {
      console.error('❌ Erro ao reiniciar:', error.message)
      return false
    }
  }

  /**
   * ℹ️ Obter informações da instância
   */
  async getInstanceInfo(): Promise<InstanceInfo | null> {
    try {
      const response = await this.client.get(`/instance/fetchInstances`, {
        params: { instanceName: this.instance }
      })

      const instances = response.data
      if (Array.isArray(instances) && instances.length > 0) {
        return instances[0]
      }

      return null
    } catch (error) {
      console.error('Erro ao obter info da instância:', error)
      return null
    }
  }

  /**
   * 🗺️ Mapear estado da Evolution API para nosso formato
   */
  private mapState(apiState: string): ConnectionStatus['state'] {
    const stateMap: Record<string, ConnectionStatus['state']> = {
      'open': 'connected',
      'connecting': 'connecting',
      'close': 'disconnected',
      'qr': 'qr',
    }

    return stateMap[apiState] || 'disconnected'
  }

  /**
   * ✅ Verificar se está conectado
   */
  async isConnected(): Promise<boolean> {
    const status = await this.getConnectionStatus()
    return status.state === 'connected'
  }

  /**
   * ⏰ Aguardar conexão (polling até conectar ou timeout)
   */
  async waitForConnection(timeoutSeconds: number = 120): Promise<boolean> {
    const startTime = Date.now()
    const timeout = timeoutSeconds * 1000

    while (Date.now() - startTime < timeout) {
      const isConn = await this.isConnected()

      if (isConn) {
        console.log('✅ WhatsApp conectado!')
        return true
      }

      // Aguardar 3 segundos antes de verificar novamente
      await new Promise(resolve => setTimeout(resolve, 3000))
    }

    console.log('⏱️ Timeout ao aguardar conexão')
    return false
  }
}

// Singleton para reutilizar
let connectionServiceInstance: WhatsAppConnectionService | null = null

export function getWhatsAppConnectionService(): WhatsAppConnectionService {
  if (!connectionServiceInstance) {
    connectionServiceInstance = new WhatsAppConnectionService()
  }
  return connectionServiceInstance
}
