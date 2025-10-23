'use client'

import { useState, useEffect, useCallback } from 'react'

export interface ConnectionState {
  status: 'connected' | 'connecting' | 'disconnected' | 'qr' | 'loading'
  isConnected: boolean
  qrCode: string | null
  lastConnected: Date | null
  error: string | null
}

export interface SyncProgress {
  status: 'idle' | 'syncing' | 'completed' | 'error'
  totalMessages: number
  processedMessages: number
  progressPercent: number
  error?: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

export function useWhatsAppConnection() {
  const [state, setState] = useState<ConnectionState>({
    status: 'loading',
    isConnected: false,
    qrCode: null,
    lastConnected: null,
    error: null,
  })

  const [syncProgress, setSyncProgress] = useState<SyncProgress>({
    status: 'idle',
    totalMessages: 0,
    processedMessages: 0,
    progressPercent: 0,
  })

  /**
   * 🔍 Verificar status de conexão
   */
  const checkStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/connection/status`)
      const data = await response.json()

      if (data.success) {
        setState(prev => ({
          ...prev,
          status: data.status,
          isConnected: data.status === 'connected',
          lastConnected: data.lastConnected ? new Date(data.lastConnected) : null,
          error: null,
        }))
      }
    } catch (err: any) {
      console.error('Erro ao verificar status:', err)
      setState(prev => ({
        ...prev,
        status: 'disconnected',
        isConnected: false,
        error: err.message,
      }))
    }
  }, [])

  /**
   * 🚀 Iniciar conexão e obter QR Code
   */
  const connect = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, status: 'connecting', error: null }))

      const response = await fetch(`${API_URL}/api/connection/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (data.success) {
        // Se já está conectado, pula para o dashboard
        if (data.alreadyConnected) {
          setState(prev => ({
            ...prev,
            status: 'connected',
            isConnected: true,
            qrCode: null,
            error: null,
          }))
          return
        }

        // Se tem QR code, mostra para escanear
        if (data.qrcode) {
          setState(prev => ({
            ...prev,
            status: 'qr',
            qrCode: data.qrcode.code,
            error: null,
          }))
          return
        }
      }

      // Se não tem QR code nem está conectado, erro
      throw new Error(data.error || 'Erro ao obter QR Code')
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        status: 'disconnected',
        error: err.message,
      }))
      throw err
    }
  }, [])

  /**
   * 🔄 Atualizar QR Code
   */
  const refreshQRCode = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/connection/qrcode`)
      const data = await response.json()

      if (data.success && data.qrcode) {
        setState(prev => ({
          ...prev,
          qrCode: data.qrcode.code,
        }))
      }
    } catch (err: any) {
      console.error('Erro ao atualizar QR Code:', err)
    }
  }, [])

  /**
   * ❌ Desconectar
   */
  const disconnect = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/connection/disconnect`, {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        setState({
          status: 'disconnected',
          isConnected: false,
          qrCode: null,
          lastConnected: null,
          error: null,
        })
      } else {
        throw new Error(data.error || 'Erro ao desconectar')
      }
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        error: err.message,
      }))
      throw err
    }
  }, [])

  /**
   * 📚 Sincronizar histórico
   */
  const syncHistory = useCallback(async (days: number = 30) => {
    try {
      const response = await fetch(`${API_URL}/api/connection/sync-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Erro ao iniciar sincronização')
      }

      // Começar a monitorar progresso
      const interval = setInterval(async () => {
        try {
          const progressResponse = await fetch(`${API_URL}/api/connection/sync-progress`)
          const progressData = await progressResponse.json()

          if (progressData.success) {
            setSyncProgress(progressData.progress)

            // Parar de monitorar se completou ou deu erro
            if (progressData.progress.status === 'completed' || progressData.progress.status === 'error') {
              clearInterval(interval)
            }
          }
        } catch (err) {
          console.error('Erro ao buscar progresso:', err)
        }
      }, 2000) // Verificar a cada 2 segundos

      return () => clearInterval(interval)
    } catch (err: any) {
      console.error('Erro ao sincronizar histórico:', err)
      throw err
    }
  }, [])

  /**
   * ✅ Verificar se já fez sync antes
   */
  const checkHasSynced = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/connection/has-synced`)
      const data = await response.json()

      return data.success && data.hasSynced
    } catch (err) {
      console.error('Erro ao verificar sync:', err)
      return false
    }
  }, [])

  // Verificar status ao montar
  useEffect(() => {
    checkStatus()
  }, [checkStatus])

  // Polling de status a cada 5 segundos
  useEffect(() => {
    const interval = setInterval(checkStatus, 5000)
    return () => clearInterval(interval)
  }, [checkStatus])

  // Auto-refresh QR Code a cada 30 segundos quando em modo QR
  useEffect(() => {
    if (state.status === 'qr') {
      const interval = setInterval(refreshQRCode, 30000)
      return () => clearInterval(interval)
    }
  }, [state.status, refreshQRCode])

  return {
    ...state,
    syncProgress,
    connect,
    disconnect,
    refreshQRCode,
    syncHistory,
    checkHasSynced,
    refetch: checkStatus,
  }
}
