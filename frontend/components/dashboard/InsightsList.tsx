'use client'

import { motion } from 'framer-motion'
import { Brain, AlertCircle, TrendingUp, Lightbulb, Info } from 'lucide-react'

interface Insight {
  id: number
  title: string
  description: string
  severity: 'info' | 'warning' | 'critical'
  confidence: number
  insightType: string
}

interface InsightsListProps {
  insights: Insight[]
}

export function InsightsList({ insights }: InsightsListProps) {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-400" />
      case 'warning':
        return <Info className="w-5 h-5 text-yellow-400" />
      default:
        return <Lightbulb className="w-5 h-5 text-blue-400" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500/30 bg-red-500/5'
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-500/5'
      default:
        return 'border-blue-500/30 bg-blue-500/5'
    }
  }

  return (
    <div className="rounded-xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg border border-gray-700/50 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="w-6 h-6 text-purple-400" />
        <h2 className="text-xl font-bold text-white">Insights da IA</h2>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
        {insights.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Nenhum insight disponível no momento</p>
        ) : (
          insights.slice(0, 5).map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${getSeverityColor(insight.severity)} hover:scale-[1.02] transition-all cursor-pointer`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">{getSeverityIcon(insight.severity)}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">{insight.title}</h3>
                  <p className="text-sm text-gray-400 line-clamp-2">{insight.description}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-xs text-gray-500">
                      Confiança: {(insight.confidence * 100).toFixed(0)}%
                    </span>
                    <span className="text-xs text-gray-500 capitalize">{insight.insightType}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
