'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Filter } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard/Layout'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { InsightCard } from '@/components/insights/InsightCard'

export default function InsightsPage() {
  const [insights, setInsights] = useState<any[]>([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const { dashboardApi } = await import('@/lib/api')
        const response = await dashboardApi.getInsights()

        if (response.success && response.data) {
          const insightsData = response.data.map((i: any) => ({
            id: i.id,
            type: i.insight_type || 'pattern',
            title: i.title,
            description: i.description,
            severity: i.severity || 'info',
            confidence: i.confidence || 0.75,
            icon: i.insight_type === 'anomaly' ? AlertTriangle : i.insight_type === 'trend' ? TrendingUp : Lightbulb,
            createdAt: i.created_at || new Date().toISOString(),
          }))
          setInsights(insightsData)
        }
      } catch (error) {
        console.error('Error fetching insights:', error)
      }
    }

    fetchInsights()
  }, [])

  const filteredInsights = filter === 'all' ? insights : insights.filter((i) => i.type === filter)

  const stats = {
    total: insights.length,
    patterns: insights.filter((i) => i.type === 'pattern').length,
    anomalies: insights.filter((i) => i.type === 'anomaly').length,
    trends: insights.filter((i) => i.type === 'trend').length,
    recommendations: insights.filter((i) => i.type === 'recommendation').length,
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-white mb-2">💡 Insights da IA</h1>
        <p className="text-gray-400 mb-8">
          Descobertas automáticas sobre padrões, anomalias e tendências
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card padding="md">
          <div className="text-sm text-gray-400">Total</div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
        </Card>
        <Card padding="md">
          <div className="text-sm text-gray-400">Padrões</div>
          <div className="text-2xl font-bold text-blue-400">{stats.patterns}</div>
        </Card>
        <Card padding="md">
          <div className="text-sm text-gray-400">Anomalias</div>
          <div className="text-2xl font-bold text-yellow-400">{stats.anomalies}</div>
        </Card>
        <Card padding="md">
          <div className="text-sm text-gray-400">Tendências</div>
          <div className="text-2xl font-bold text-green-400">{stats.trends}</div>
        </Card>
        <Card padding="md">
          <div className="text-sm text-gray-400">Recomendações</div>
          <div className="text-2xl font-bold text-purple-400">{stats.recommendations}</div>
        </Card>
      </div>

      <Card className="mb-6">
        <div className="flex gap-2">
          {['all', 'pattern', 'anomaly', 'trend', 'recommendation'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg capitalize ${
                filter === type ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              {type === 'all' ? 'Todos' : type === 'recommendation' ? 'Recomendações' : type}
            </button>
          ))}
        </div>
      </Card>

      <div className="space-y-4">
        {filteredInsights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <InsightCard insight={insight} />
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  )
}
