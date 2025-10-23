'use client'

import { User, MessageSquare, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatRelativeTime, getSentimentColor, getSentimentLabel } from '@/lib/utils'

interface ParticipantCardProps {
  participant: any
  onClick: () => void
}

export function ParticipantCard({ participant, onClick }: ParticipantCardProps) {
  const sentimentVariant = participant.avgSentiment > 0.6 ? 'success' :
                           participant.avgSentiment > 0.3 ? 'warning' : 'danger'

  return (
    <Card hover padding="md" onClick={onClick} className="cursor-pointer">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
          {participant.name.charAt(0)}
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-white mb-1">{participant.name}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
            <MessageSquare className="w-4 h-4" />
            <span>{participant.messageCount} msgs</span>
            <span className="text-gray-600">•</span>
            <span>{formatRelativeTime(participant.lastActive)}</span>
          </div>

          <div className="flex items-center justify-between">
            <Badge variant={sentimentVariant} size="sm">
              {getSentimentLabel(participant.avgSentiment)}
            </Badge>
            <div className={`text-sm font-medium ${getSentimentColor(participant.avgSentiment)}`}>
              {(participant.avgSentiment * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
