'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { Heart, TrendingUp } from 'lucide-react'

export function SentimentChart() {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    // Mock data - substituir pela chamada API real
    const mockData = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
      }),
      sentimento: Math.random() * 2 - 1, // -1 a 1
      positivo: Math.floor(Math.random() * 50) + 20,
      neutro: Math.floor(Math.random() * 30) + 10,
      negativo: Math.floor(Math.random() * 20),
    }))

    setData(mockData)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg border border-gray-700/50 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Heart className="w-6 h-6 text-pink-400" />
          <h2 className="text-xl font-bold text-white">Análise de Sentimento ao Longo do Tempo</h2>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span className="text-gray-400">Positivo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="text-gray-400">Neutro</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <span className="text-gray-400">Negativo</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorSentiment" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" domain={[-1, 1]} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#fff',
            }}
          />
          <Area
            type="monotone"
            dataKey="sentimento"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#colorSentiment)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
