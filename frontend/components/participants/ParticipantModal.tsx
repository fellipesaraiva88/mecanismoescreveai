'use client'

import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { Tabs, Tab } from '@/components/ui/Tabs'
import { MessageSquare, Heart, Clock, TrendingUp } from 'lucide-react'
import { getSentimentLabel, formatRelativeTime } from '@/lib/utils'

interface ParticipantModalProps {
  participant: any
  open: boolean
  onClose: () => void
}

export function ParticipantModal({ participant, open, onClose }: ParticipantModalProps) {
  const tabs: Tab[] = [
    {
      id: 'overview',
      label: 'Visão Geral',
      icon: <MessageSquare className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-400 mb-1">Total de Mensagens</div>
              <div className="text-2xl font-bold text-white">{participant.messageCount}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Sentimento Médio</div>
              <div className="flex items-center gap-2">
                <Badge variant={participant.avgSentiment > 0.6 ? 'success' : 'warning'}>
                  {getSentimentLabel(participant.avgSentiment)}
                </Badge>
                <span className="text-lg font-bold text-white">
                  {(participant.avgSentiment * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Última Atividade</div>
              <div className="text-lg text-white">{formatRelativeTime(participant.lastActive)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Status</div>
              <Badge variant="success">Ativo</Badge>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'activity',
      label: 'Atividade',
      icon: <TrendingUp className="w-4 h-4" />,
      content: (
        <div className="text-center py-8 text-gray-400">
          Gráfico de atividade em desenvolvimento...
        </div>
      ),
    },
    {
      id: 'sentiment',
      label: 'Sentimento',
      icon: <Heart className="w-4 h-4" />,
      content: (
        <div className="text-center py-8 text-gray-400">
          Análise de sentimento detalhada em desenvolvimento...
        </div>
      ),
    },
  ]

  return (
    <Modal open={open} onClose={onClose} title={participant.name} size="lg">
      <Tabs tabs={tabs} />
    </Modal>
  )
}
