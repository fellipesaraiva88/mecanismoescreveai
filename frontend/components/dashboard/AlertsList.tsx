'use client'

import { motion } from 'framer-motion'
import { Bell, AlertTriangle, Info, XCircle } from 'lucide-react'

interface Alert {
  id: number
  title: string
  message: string
  severity: 'info' | 'warning' | 'critical'
  triggeredAt: string
}

interface AlertsListProps {
  alerts: Alert[]
}

export function AlertsList({ alerts }: AlertsListProps) {
  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          icon: <XCircle className="w-5 h-5" />,
          color: 'text-red-400',
          bg: 'bg-red-500/10 border-red-500/30',
        }
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5" />,
          color: 'text-yellow-400',
          bg: 'bg-yellow-500/10 border-yellow-500/30',
        }
      default:
        return {
          icon: <Info className="w-5 h-5" />,
          color: 'text-blue-400',
          bg: 'bg-blue-500/10 border-blue-500/30',
        }
    }
  }

  return (
    <div className="rounded-xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg border border-gray-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-orange-400" />
          <h2 className="text-xl font-bold text-white">Alertas Ativos</h2>
        </div>
        {alerts.length > 0 && (
          <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-sm font-medium">
            {alerts.length}
          </span>
        )}
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
        {alerts.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Nenhum alerta ativo</p>
        ) : (
          alerts.map((alert, index) => {
            const styles = getSeverityStyles(alert.severity)

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${styles.bg} hover:scale-[1.02] transition-all cursor-pointer`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 ${styles.color}`}>{styles.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{alert.title}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2">{alert.message}</p>
                    <span className="text-xs text-gray-500 mt-2 block">
                      {new Date(alert.triggeredAt).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}
