'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  icon: ReactNode
  trend?: string
  trendUp?: boolean
  sentiment?: number
}

export function MetricCard({ title, value, icon, trend, trendUp, sentiment }: MetricCardProps) {
  const getSentimentColor = (score: number) => {
    if (score > 0.6) return 'text-green-400'
    if (score > 0.3) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg border border-gray-700/50 p-6 card-hover"
    >
      {/* Gradient overlay */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-full blur-2xl" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <div className="text-green-400">{icon}</div>
          </div>
          {trend && (
            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                trendUp ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {trendUp ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {trend}
            </div>
          )}
        </div>

        <h3 className="text-gray-400 text-sm font-medium mb-2">{title}</h3>
        <p className="text-3xl font-bold text-white">
          {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
        </p>

        {sentiment !== undefined && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-gray-400">Sentimento</span>
              <span className={getSentimentColor(sentiment)}>
                {(sentiment * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${sentiment * 100}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full ${
                  sentiment > 0.6
                    ? 'bg-green-400'
                    : sentiment > 0.3
                    ? 'bg-yellow-400'
                    : 'bg-red-400'
                }`}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
