'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, TrendingUp, MessageSquare } from 'lucide-react'

interface Participant {
  jid: string
  name: string
  messageCount: number
  avgSentiment: number
  lastActive: string
}

export function TopParticipants() {
  const [participants, setParticipants] = useState<Participant[]>([])

  useEffect(() => {
    // Mock data
    const mockParticipants = [
      { jid: '1', name: 'João Silva', messageCount: 1234, avgSentiment: 0.85, lastActive: '2h atrás' },
      { jid: '2', name: 'Maria Santos', messageCount: 987, avgSentiment: 0.72, lastActive: '5h atrás' },
      { jid: '3', name: 'Pedro Costa', messageCount: 856, avgSentiment: 0.45, lastActive: '1d atrás' },
      { jid: '4', name: 'Ana Lima', messageCount: 743, avgSentiment: 0.91, lastActive: '3h atrás' },
      { jid: '5', name: 'Carlos Souza', messageCount: 654, avgSentiment: 0.68, lastActive: '12h atrás' },
    ]

    setParticipants(mockParticipants)
  }, [])

  const getSentimentColor = (score: number) => {
    if (score > 0.6) return 'text-green-400'
    if (score > 0.3) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getSentimentBg = (score: number) => {
    if (score > 0.6) return 'bg-green-500/10 border-green-500/30'
    if (score > 0.3) return 'bg-yellow-500/10 border-yellow-500/30'
    return 'bg-red-500/10 border-red-500/30'
  }

  return (
    <div className="rounded-xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg border border-gray-700/50 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-6 h-6 text-cyan-400" />
        <h2 className="text-xl font-bold text-white">Top Participantes</h2>
      </div>

      <div className="space-y-3">
        {participants.map((participant, index) => (
          <motion.div
            key={participant.jid}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border ${getSentimentBg(participant.avgSentiment)} hover:scale-[1.02] transition-all cursor-pointer`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 text-white font-bold">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{participant.name}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {participant.messageCount.toLocaleString()} msgs
                    </span>
                    <span className="text-xs text-gray-400">
                      {participant.lastActive}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className={`text-lg font-bold ${getSentimentColor(participant.avgSentiment)}`}>
                  {(participant.avgSentiment * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-gray-400">sentimento</div>
              </div>
            </div>

            <div className="mt-3">
              <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${participant.avgSentiment * 100}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  className={`h-full ${
                    participant.avgSentiment > 0.6
                      ? 'bg-green-400'
                      : participant.avgSentiment > 0.3
                      ? 'bg-yellow-400'
                      : 'bg-red-400'
                  }`}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
