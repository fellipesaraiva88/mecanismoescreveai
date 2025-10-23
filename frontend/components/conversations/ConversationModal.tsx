'use client'

import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { Users, MessageSquare, TrendingUp } from 'lucide-react'

export function ConversationModal({ conversation, open, onClose }: any) {
  return (
    <Modal open={open} onClose={onClose} title={conversation.name} size="lg">
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-400 mb-1">Tipo</div>
            <Badge variant={conversation.type === 'group' ? 'info' : 'success'}>
              {conversation.type === 'group' ? 'Grupo' : 'Privado'}
            </Badge>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Mensagens</div>
            <div className="text-2xl font-bold text-white">{conversation.messageCount}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Participantes</div>
            <div className="text-2xl font-bold text-white">{conversation.participantCount}</div>
          </div>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3">Última Mensagem</h3>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-gray-300">{conversation.lastMessage}</p>
          </div>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3">Análise de Sentimento</h3>
          <div className="bg-gradient-to-r from-red-500/20 via-yellow-500/20 to-green-500/20 rounded-lg p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {(conversation.avgSentiment * 100).toFixed(0)}%
              </div>
              <div className="text-gray-400">Sentimento Positivo</div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
