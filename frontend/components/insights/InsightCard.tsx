'use client'

import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { TrendingUp, AlertTriangle, Lightbulb, Activity } from 'lucide-react'

export function InsightCard({ insight }: any) {
  const icons = {
    pattern: Activity,
    anomaly: AlertTriangle,
    trend: TrendingUp,
    recommendation: Lightbulb,
  }

  const Icon = icons[insight.type as keyof typeof icons] || Activity

  const severityVariant = {
    info: 'info' as const,
    warning: 'warning' as const,
    critical: 'danger' as const,
  }

  return (
    <Card hover padding="md">
      <div className="flex gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
          insight.severity === 'warning' ? 'bg-yellow-500/20' : 'bg-blue-500/20'
        }`}>
          <Icon className={`w-6 h-6 ${
            insight.severity === 'warning' ? 'text-yellow-400' : 'text-blue-400'
          }`} />
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-white">{insight.title}</h3>
            <Badge variant={severityVariant[insight.severity as keyof typeof severityVariant]}>
              {insight.severity === 'info' ? 'Info' : insight.severity === 'warning' ? 'Atenção' : 'Crítico'}
            </Badge>
          </div>

          <p className="text-gray-400 mb-3">{insight.description}</p>

          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500">
              Confiança: <span className="text-green-400 font-medium">{(insight.confidence * 100).toFixed(0)}%</span>
            </span>
            <span className="text-gray-500 capitalize">Tipo: {insight.type}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
