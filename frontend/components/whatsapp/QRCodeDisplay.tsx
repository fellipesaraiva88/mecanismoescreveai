'use client'

import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loader2, RefreshCw, Smartphone } from 'lucide-react'

interface QRCodeDisplayProps {
  onConnected?: () => void
}

export function QRCodeDisplay({ onConnected }: QRCodeDisplayProps) {
  const [qrCode, setQrCode] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [refreshCount, setRefreshCount] = useState(0)

  const fetchQRCode = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('http://localhost:3333/api/connection/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (data.success && data.qrcode) {
        setQrCode(data.qrcode.code)
        console.log('✅ QR Code obtido com sucesso')
      } else {
        throw new Error(data.error || 'Erro ao obter QR Code')
      }
    } catch (err: any) {
      console.error('❌ Erro ao buscar QR Code:', err)
      setError(err.message || 'Erro ao conectar ao servidor')
    } finally {
      setLoading(false)
    }
  }

  const refreshQRCode = () => {
    setRefreshCount(prev => prev + 1)
    fetchQRCode()
  }

  // Buscar QR Code ao montar
  useEffect(() => {
    fetchQRCode()
  }, [])

  // Auto-refresh a cada 30 segundos (QR Code expira)
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh QR Code...')
      fetchQRCode()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  // Verificar conexão a cada 3 segundos
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('http://localhost:3333/api/connection/status')
        const data = await response.json()

        if (data.success && data.status === 'connected') {
          console.log('✅ WhatsApp conectado!')
          onConnected?.()
        }
      } catch (err) {
        // Silently fail
      }
    }

    const interval = setInterval(checkConnection, 3000)
    return () => clearInterval(interval)
  }, [onConnected])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <Card className="max-w-md w-full" padding="lg">
        <div className="text-center">
          {/* Header */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-10 h-10 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Conectar WhatsApp
            </h1>
            <p className="text-gray-400">
              Escaneie o QR Code com seu WhatsApp
            </p>
          </div>

          {/* QR Code */}
          <div className="mb-8">
            {loading ? (
              <div className="flex items-center justify-center h-64 bg-gray-800/50 rounded-lg">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-green-400 animate-spin mx-auto mb-4" />
                  <p className="text-gray-400">Gerando QR Code...</p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
                <p className="text-red-400 mb-4">{error}</p>
                <Button variant="danger" onClick={refreshQRCode}>
                  Tentar Novamente
                </Button>
              </div>
            ) : qrCode ? (
              <div className="bg-white p-8 rounded-lg inline-block">
                <QRCodeSVG
                  value={qrCode}
                  size={256}
                  level="H"
                  includeMargin={false}
                />
              </div>
            ) : null}
          </div>

          {/* Instruções */}
          {!error && (
            <div className="space-y-4 text-left bg-gray-800/30 rounded-lg p-6 mb-6">
              <h3 className="text-white font-semibold mb-3">Como conectar:</h3>
              <ol className="space-y-3 text-sm text-gray-300">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <span>Abra o WhatsApp no seu celular</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <span>Toque em <strong>Menu</strong> ou <strong>Configurações</strong></span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  <span>Toque em <strong>Dispositivos conectados</strong></span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-xs font-bold">
                    4
                  </span>
                  <span>Toque em <strong>Conectar dispositivo</strong> e escaneie o código</span>
                </li>
              </ol>
            </div>
          )}

          {/* Botão de refresh manual */}
          {!loading && !error && (
            <Button
              variant="ghost"
              onClick={refreshQRCode}
              icon={<RefreshCw className="w-4 h-4" />}
              className="w-full"
            >
              Atualizar QR Code
            </Button>
          )}

          {refreshCount > 0 && (
            <p className="text-xs text-gray-500 mt-4">
              QR Code atualizado {refreshCount} {refreshCount === 1 ? 'vez' : 'vezes'}
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
