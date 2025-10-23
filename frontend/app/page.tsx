'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  Users,
  MessageSquare,
  TrendingUp,
  Brain,
  Heart,
  Network,
  Bell,
  Loader2,
} from 'lucide-react'

import { DashboardLayout } from '@/components/dashboard/Layout'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { SentimentChart } from '@/components/charts/SentimentChart'
import { ActivityHeatmap } from '@/components/charts/ActivityHeatmap'
import { RelationshipGraph } from '@/components/charts/RelationshipGraph'
import { InsightsList } from '@/components/dashboard/InsightsList'
import { AlertsList } from '@/components/dashboard/AlertsList'
import { TopParticipants } from '@/components/dashboard/TopParticipants'
import { QRCodeDisplay } from '@/components/whatsapp/QRCodeDisplay'
import { useWhatsAppConnection } from '@/lib/hooks/useWhatsAppConnection'
import { Card } from '@/components/ui/Card'

export default function HomePage() {
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  const connection = useWhatsAppConnection()

  useEffect(() => {
    // Quando conectar, verificar se precisa fazer sync
    if (connection.isConnected && !syncing) {
      checkAndSync()
    }
  }, [connection.isConnected])

  useEffect(() => {
    // Se conectado, buscar dados do dashboard
    if (connection.isConnected && connection.syncProgress.status === 'completed') {
      fetchDashboardData()
    }
  }, [connection.isConnected, connection.syncProgress.status])

  const checkAndSync = async () => {
    try {
      const hasSynced = await connection.checkHasSynced()

      if (!hasSynced) {
        console.log('📚 Primeira conexão! Iniciando sincronização de histórico...')
        setSyncing(true)
        await connection.syncHistory(30)
      } else {
        console.log('✅ Já tem dados sincronizados')
        fetchDashboardData()
      }
    } catch (error) {
      console.error('Erro ao verificar/iniciar sync:', error)
    }
  }

  const fetchDashboardData = async () => {
    try {
      const { dashboardApi } = await import('@/lib/api')
      const response = await dashboardApi.getOverview()

      if (response.success) {
        setMetrics(response.data)
      } else {
        console.error('Error:', response.error)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnected = () => {
    console.log('✅ WhatsApp conectado! Iniciando verificação...')
    checkAndSync()
  }

  // Se não está conectado, mostrar QR Code
  if (!connection.isConnected) {
    return <QRCodeDisplay onConnected={handleConnected} />
  }

  // Se está sincronizando, mostrar progresso
  if (syncing || connection.syncProgress.status === 'syncing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
        <Card className="max-w-md w-full" padding="lg">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-green-400 animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Sincronizando Histórico
            </h2>
            <p className="text-gray-400 mb-6">
              Buscando mensagens dos últimos 30 dias...
            </p>

            {/* Progress Bar */}
            <div className="bg-gray-800 rounded-full h-3 mb-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-400 to-blue-500 h-full transition-all duration-500"
                style={{ width: `${connection.syncProgress.progressPercent}%` }}
              />
            </div>

            <div className="text-sm text-gray-400">
              {connection.syncProgress.processedMessages} / {connection.syncProgress.totalMessages} mensagens
              ({connection.syncProgress.progressPercent}%)
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // Loading dashboard data
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          📊 Painel de Análise Comportamental
        </h1>
        <p className="text-muted-foreground mt-2">
          Insights profundos sobre suas conversas do WhatsApp
        </p>
      </motion.div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total de Conversas"
          value={metrics?.metrics?.total_conversations || 0}
          icon={<MessageSquare className="w-6 h-6" />}
          trend="+12%"
          trendUp={true}
        />
        <MetricCard
          title="Participantes Ativos"
          value={metrics?.metrics?.total_participants || 0}
          icon={<Users className="w-6 h-6" />}
          trend="+8%"
          trendUp={true}
        />
        <MetricCard
          title="Mensagens Analisadas"
          value={metrics?.metrics?.total_messages || 0}
          icon={<BarChart3 className="w-6 h-6" />}
          trend="+24%"
          trendUp={true}
        />
        <MetricCard
          title="Sentimento Geral"
          value="Positivo"
          icon={<Heart className="w-6 h-6" />}
          sentiment={0.72}
        />
      </div>

      {/* Alertas e Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AlertsList alerts={metrics?.alerts || []} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <InsightsList insights={metrics?.insights || []} />
        </motion.div>
      </div>

      {/* Análise de Sentimento ao Longo do Tempo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <SentimentChart />
      </motion.div>

      {/* Mapa de Atividade e Top Participantes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <ActivityHeatmap />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <TopParticipants />
        </motion.div>
      </div>

      {/* Grafo de Relacionamentos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mb-8"
      >
        <RelationshipGraph />
      </motion.div>
    </DashboardLayout>
  )
}
