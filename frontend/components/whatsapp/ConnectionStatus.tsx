'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { LogOut, RefreshCw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

interface ConnectionStatusProps {
  onDisconnect?: () => void
}

export function ConnectionStatus({ onDisconnect }: ConnectionStatusProps) {
  const [status, setStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'qr'>('disconnected')
  const [lastConnected, setLastConnected] = useState<Date | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchStatus = async () => {
    try {
      const response = await fetch('http://localhost:3333/api/connection/status')
      const data = await response.json()

      if (data.success) {
        setStatus(data.status)
        if (data.lastConnected) {
          setLastConnected(new Date(data.lastConnected))
        }
      }
    } catch (err) {
      console.error('Erro ao buscar status:', err)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm('Deseja realmente desconectar o WhatsApp?')) {
      return
    }

    try {
      setLoading(true)

      const response = await fetch('http://localhost:3333/api/connection/disconnect', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        setStatus('disconnected')
        onDisconnect?.()
      } else {
        alert(`Erro ao desconectar: ${data.error}`)
      }
    } catch (err: any) {
      console.error('Erro ao desconectar:', err)
      alert(`Erro: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleRestart = async () => {
    try {
      setLoading(true)

      const response = await fetch('http://localhost:3333/api/connection/restart', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        await fetchStatus()
      } else {
        alert(`Erro ao reiniciar: ${data.error}`)
      }
    } catch (err: any) {
      console.error('Erro ao reiniciar:', err)
      alert(`Erro: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()

    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle2 className="w-4 h-4" />
      case 'connecting':
      case 'qr':
        return <Loader2 className="w-4 h-4 animate-spin" />
      case 'disconnected':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const getStatusLabel = () => {
    switch (status) {
      case 'connected':
        return 'Conectado'
      case 'connecting':
        return 'Conectando...'
      case 'qr':
        return 'Aguardando scan'
      case 'disconnected':
        return 'Desconectado'
      default:
        return 'Desconhecido'
    }
  }

  const getStatusVariant = () => {
    switch (status) {
      case 'connected':
        return 'success'
      case 'connecting':
      case 'qr':
        return 'warning'
      case 'disconnected':
        return 'danger'
      default:
        return 'info'
    }
  }

  return (
    <div className="flex items-center gap-4">
      {/* Status Badge */}
      <div className="flex items-center gap-2">
        <Badge variant={getStatusVariant()}>
          <span className="flex items-center gap-2">
            {getStatusIcon()}
            {getStatusLabel()}
          </span>
        </Badge>
      </div>

      {/* Last Connected */}
      {lastConnected && status === 'connected' && (
        <span className="text-xs text-gray-400">
          Conectado {lastConnected.toLocaleTimeString('pt-BR')}
        </span>
      )}

      {/* Actions */}
      {status === 'connected' && (
        <div className="flex gap-2 ml-auto">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRestart}
            loading={loading}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Reiniciar
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={handleDisconnect}
            loading={loading}
            icon={<LogOut className="w-4 h-4" />}
          >
            Desconectar
          </Button>
        </div>
      )}
    </div>
  )
}
