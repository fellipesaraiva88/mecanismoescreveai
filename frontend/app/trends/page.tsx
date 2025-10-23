'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard/Layout'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

export default function TrendsPage() {
  const [trends, setTrends] = useState<any[]>([])
  const [timeRange, setTimeRange] = useState('7days')

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const { dashboardApi } = await import('@/lib/api')
        const response = await dashboardApi.getTrends(timeRange)
        if (response.success && response.data) {
          setTrends(response.data.trends || [])
        }
      } catch (error) {
        console.error('Error fetching trends:', error)
      }
    }
    fetchTrends()
  }, [timeRange])

  const [activityData, setActivityData] = useState<any[]>([])

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const { dashboardApi } = await import('@/lib/api')
        const response = await dashboardApi.getActivityData()
        if (response.success && response.data) {
          setActivityData(response.data || [])
        }
      } catch (error) {
        console.error('Error fetching activity:', error)
      }
    }
    fetchActivity()
  }, [])

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-white mb-2">📈 Tendências</h1>
        <p className="text-gray-400 mb-8">Análise temporal de tópicos e atividades</p>
      </motion.div>

      <Card className="mb-6">
        <div className="flex gap-2">
          {['24h', '7days', '30days', '90days'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg ${timeRange === range ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-400'}`}
            >
              {range === '24h' ? '24 Horas' : range === '7days' ? '7 Dias' : range === '30days' ? '30 Dias' : '90 Dias'}
            </button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <h3 className="text-white font-semibold mb-4">Atividade Semanal</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
              />
              <Bar dataKey="messages" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="text-white font-semibold mb-4">Sentimento ao Longo do Tempo</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" domain={[-1, 1]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
              />
              <Line type="monotone" dataKey="sentiment" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="mb-6">
        <h3 className="text-white font-semibold mb-4">Tópicos em Alta</h3>
        <div className="space-y-3">
          {trends.map((trend) => (
            <div key={trend.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="text-white font-medium">{trend.name}</h4>
                  <Badge variant={trend.growth > 0 ? 'success' : 'danger'}>
                    {trend.category}
                  </Badge>
                </div>
                <p className="text-sm text-gray-400 mt-1">{trend.mentions} menções</p>
              </div>

              <div className="flex items-center gap-2">
                {trend.growth > 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-400" />
                )}
                <span className={`text-lg font-bold ${trend.growth > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {trend.growth > 0 ? '+' : ''}{trend.growth.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </DashboardLayout>
  )
}
