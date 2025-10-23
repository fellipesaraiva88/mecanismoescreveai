'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, Check, X, Filter } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard/Layout'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [filter, setFilter] = useState('unread')

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const { dashboardApi } = await import('@/lib/api')
        const response = await dashboardApi.getAlerts()
        if (response.success && response.data) {
          setAlerts(response.data.map((a: any) => ({
            id: a.id,
            title: a.title || 'Alerta',
            message: a.message,
            severity: a.severity || 'info',
            isRead: a.is_read || false,
            triggeredAt: a.triggered_at || new Date().toISOString(),
          })))
        }
      } catch (error) {
        console.error('Error fetching alerts:', error)
      }
    }
    fetchAlerts()
  }, [])

  const filteredAlerts = alerts.filter((a) =>
    filter === 'all' || (filter === 'unread' && !a.isRead) || (filter === 'read' && a.isRead)
  )

  const markAsRead = (id: number) => {
    setAlerts(alerts.map((a) => (a.id === id ? { ...a, isRead: true } : a)))
  }

  const deleteAlert = (id: number) => {
    setAlerts(alerts.filter((a) => a.id !== id))
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-white mb-2">🚨 Alertas</h1>
        <p className="text-gray-400 mb-8">
          {alerts.filter((a) => !a.isRead).length} alertas não lidos
        </p>
      </motion.div>

      <Card className="mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg ${filter === 'unread' ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            Não Lidos ({alerts.filter((a) => !a.isRead).length})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-4 py-2 rounded-lg ${filter === 'read' ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            Lidos
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            Todos
          </button>
        </div>
      </Card>

      <div className="space-y-4">
        {filteredAlerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card padding="md" className={!alert.isRead ? 'border-l-4 border-orange-500' : ''}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  alert.severity === 'critical' ? 'bg-red-500/20' :
                  alert.severity === 'warning' ? 'bg-yellow-500/20' : 'bg-blue-500/20'
                }`}>
                  <Bell className={`w-5 h-5 ${
                    alert.severity === 'critical' ? 'text-red-400' :
                    alert.severity === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                  }`} />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">{alert.title}</h3>
                      <Badge variant={
                        alert.severity === 'critical' ? 'danger' :
                        alert.severity === 'warning' ? 'warning' : 'info'
                      }>
                        {alert.severity === 'critical' ? 'Crítico' :
                         alert.severity === 'warning' ? 'Atenção' : 'Info'}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      {!alert.isRead && (
                        <Button size="sm" variant="ghost" onClick={() => markAsRead(alert.id)}>
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => deleteAlert(alert.id)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-gray-400 mb-2">{alert.message}</p>
                  <span className="text-xs text-gray-500">
                    {new Date(alert.triggeredAt).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredAlerts.length === 0 && (
        <Card className="text-center py-12">
          <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Nenhum alerta {filter === 'unread' ? 'não lido' : filter === 'read' ? 'lido' : ''}</p>
        </Card>
      )}
    </DashboardLayout>
  )
}
