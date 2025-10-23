'use client'

import { Users, MessageSquare, Clock } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatRelativeTime, getSentimentColor } from '@/lib/utils'

export function ConversationCard({ conversation, onClick }: any) {
  return (
    <Card hover padding="md" onClick={onClick}>
      <div className="flex items-center gap-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl ${
          conversation.type === 'group' ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-gradient-to-br from-blue-500 to-cyan-500'
        }`}>
          {conversation.type === 'group' ? <Users className="w-8 h-8" /> : conversation.name.charAt(0)}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-semibold text-white">{conversation.name}</h3>
            <span className="text-sm text-gray-400">{formatRelativeTime(conversation.lastMessageAt)}</span>
          </div>

          <p className="text-gray-400 text-sm mb-3 line-clamp-1">{conversation.lastMessage}</p>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-gray-400">
              <MessageSquare className="w-4 h-4" />
              <span>{conversation.messageCount} msgs</span>
            </div>
            {conversation.type === 'group' && (
              <div className="flex items-center gap-1 text-gray-400">
                <Users className="w-4 h-4" />
                <span>{conversation.participantCount} pessoas</span>
              </div>
            )}
            <div className={`font-medium ${getSentimentColor(conversation.avgSentiment)}`}>
              {(conversation.avgSentiment * 100).toFixed(0)}% positivo
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
