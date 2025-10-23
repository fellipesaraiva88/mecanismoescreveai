'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'

export function ActivityHeatmap() {
  const [heatmapData, setHeatmapData] = useState<any[][]>([])

  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const hours = Array.from({ length: 24 }, (_, i) => i)

  useEffect(() => {
    // Mock data - gera um heatmap aleatório
    const mockData = days.map(() =>
      hours.map(() => Math.floor(Math.random() * 100))
    )
    setHeatmapData(mockData)
  }, [])

  const getHeatColor = (value: number) => {
    if (value > 75) return 'bg-green-500'
    if (value > 50) return 'bg-green-400'
    if (value > 25) return 'bg-yellow-400'
    if (value > 10) return 'bg-blue-400'
    return 'bg-gray-700'
  }

  return (
    <div className="rounded-xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg border border-gray-700/50 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-6 h-6 text-blue-400" />
        <h2 className="text-xl font-bold text-white">Mapa de Atividade por Hora</h2>
      </div>

      <div className="space-y-2">
        <div className="flex gap-2 mb-2">
          <div className="w-12" /> {/* Espaço para labels dos dias */}
          {hours.map((hour) => (
            hour % 3 === 0 && (
              <div key={hour} className="flex-1 text-center text-xs text-gray-500">
                {hour}h
              </div>
            )
          ))}
        </div>

        {days.map((day, dayIndex) => (
          <motion.div
            key={day}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: dayIndex * 0.1 }}
            className="flex gap-2"
          >
            <div className="w-12 text-sm text-gray-400 flex items-center">{day}</div>
            {hours.map((hour) => (
              <motion.div
                key={hour}
                whileHover={{ scale: 1.2, zIndex: 10 }}
                className={`flex-1 aspect-square rounded ${getHeatColor(
                  heatmapData[dayIndex]?.[hour] || 0
                )} cursor-pointer transition-all`}
                title={`${day} ${hour}:00 - ${heatmapData[dayIndex]?.[hour] || 0} mensagens`}
              />
            ))}
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-4 mt-6 text-xs">
        <span className="text-gray-400">Menos</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 rounded bg-gray-700" />
          <div className="w-4 h-4 rounded bg-blue-400" />
          <div className="w-4 h-4 rounded bg-yellow-400" />
          <div className="w-4 h-4 rounded bg-green-400" />
          <div className="w-4 h-4 rounded bg-green-500" />
        </div>
        <span className="text-gray-400">Mais</span>
      </div>
    </div>
  )
}
