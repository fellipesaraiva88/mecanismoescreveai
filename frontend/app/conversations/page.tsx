'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Users, MessageSquare } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard/Layout'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ConversationCard } from '@/components/conversations/ConversationCard'
import { ConversationModal } from '@/components/conversations/ConversationModal'

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { dashboardApi } = await import('@/lib/api')
        const response = await dashboardApi.getConversations()

        if (response.success && response.data) {
          const conversationsData = response.data.map((c: any) => ({
            jid: c.jid,
            name: c.name || c.jid.split('@')[0],
            type: c.type || (c.jid.includes('@g.us') ? 'group' : 'private'),
            participantCount: c.participant_count || 0,
            messageCount: c.message_count || 0,
            avgSentiment: c.avg_sentiment || 0.5,
            lastMessage: c.last_message || '',
            lastMessageAt: c.last_message_at || new Date().toISOString(),
          }))
          setConversations(conversationsData)
        }
      } catch (error) {
        console.error('Error fetching conversations:', error)
      }
    }

    fetchConversations()
  }, [])

  const filteredConversations = conversations
    .filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((c) => filter === 'all' || c.type === filter)

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-white mb-2">💬 Conversas</h1>
        <p className="text-gray-400 mb-8">
          Gerencie {conversations.length} conversas e grupos
        </p>
      </motion.div>

      <Card className="mb-6">
        <div className="flex gap-4 items-center">
          <Input
            icon={<Search className="w-5 h-5" />}
            placeholder="Buscar conversas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-400'}`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('group')}
              className={`px-4 py-2 rounded-lg ${filter === 'group' ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-400'}`}
            >
              Grupos
            </button>
            <button
              onClick={() => setFilter('private')}
              className={`px-4 py-2 rounded-lg ${filter === 'private' ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-400'}`}
            >
              Privadas
            </button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {filteredConversations.map((conversation, index) => (
          <motion.div
            key={conversation.jid}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ConversationCard
              conversation={conversation}
              onClick={() => setSelectedConversation(conversation)}
            />
          </motion.div>
        ))}
      </div>

      {selectedConversation && (
        <ConversationModal
          conversation={selectedConversation}
          open={!!selectedConversation}
          onClose={() => setSelectedConversation(null)}
        />
      )}
    </DashboardLayout>
  )
}
