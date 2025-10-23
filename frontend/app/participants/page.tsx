'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Download, UserPlus } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard/Layout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ParticipantCard } from '@/components/participants/ParticipantCard'
import { ParticipantModal } from '@/components/participants/ParticipantModal'
import { ParticipantFilter } from '@/components/participants/ParticipantFilter'
import { dashboardApi } from '@/lib/api'

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<any[]>([])
  const [filteredParticipants, setFilteredParticipants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    sentiment: 'all',
    activity: 'all',
    sortBy: 'messages',
  })

  useEffect(() => {
    fetchParticipants()
  }, [])

  useEffect(() => {
    filterAndSortParticipants()
  }, [participants, searchTerm, filters])

  const fetchParticipants = async () => {
    try {
      const response = await dashboardApi.getParticipants(100)
      if (response.success && response.data) {
        // Usar dados reais da API
        const participantsData = response.data.map((p: any) => ({
          jid: p.jid,
          name: p.name || p.jid.split('@')[0],
          messageCount: p.message_count || 0,
          avgSentiment: p.avg_sentiment || 0.5,
          lastActive: p.last_active || new Date().toISOString(),
        }))
        setParticipants(participantsData)
      }
    } catch (error) {
      console.error('Error fetching participants:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortParticipants = () => {
    let filtered = [...participants]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Sentiment filter
    if (filters.sentiment !== 'all') {
      if (filters.sentiment === 'positive') {
        filtered = filtered.filter((p) => p.avgSentiment > 0.6)
      } else if (filters.sentiment === 'neutral') {
        filtered = filtered.filter((p) => p.avgSentiment > 0.3 && p.avgSentiment <= 0.6)
      } else if (filters.sentiment === 'negative') {
        filtered = filtered.filter((p) => p.avgSentiment <= 0.3)
      }
    }

    // Sort
    filtered.sort((a, b) => {
      if (filters.sortBy === 'messages') {
        return b.messageCount - a.messageCount
      } else if (filters.sortBy === 'sentiment') {
        return b.avgSentiment - a.avgSentiment
      } else if (filters.sortBy === 'recent') {
        return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
      }
      return 0
    })

    setFilteredParticipants(filtered)
  }

  const handleExport = () => {
    const csv = [
      ['Nome', 'Mensagens', 'Sentimento', 'Última Atividade'].join(','),
      ...filteredParticipants.map((p) =>
        [p.name, p.messageCount, p.avgSentiment.toFixed(2), p.lastActive].join(',')
      ),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `participantes-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2">👥 Participantes</h1>
        <p className="text-gray-400">
          Gerencie e analise o perfil de {participants.length} participantes
        </p>
      </motion.div>

      {/* Actions Bar */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <Input
            icon={<Search className="w-5 h-5" />}
            placeholder="Buscar por nome ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:w-96"
          />

          <div className="flex gap-2">
            <Button
              variant="secondary"
              icon={<Filter className="w-4 h-4" />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filtros
            </Button>
            <Button
              variant="secondary"
              icon={<Download className="w-4 h-4" />}
              onClick={handleExport}
            >
              Exportar
            </Button>
          </div>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t border-gray-700"
          >
            <ParticipantFilter filters={filters} onChange={setFilters} />
          </motion.div>
        )}
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="text-sm text-gray-400">Total</div>
          <div className="text-3xl font-bold text-white">{filteredParticipants.length}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-400">Muito Ativos</div>
          <div className="text-3xl font-bold text-green-400">
            {filteredParticipants.filter((p) => p.messageCount > 200).length}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-gray-400">Sentimento Positivo</div>
          <div className="text-3xl font-bold text-green-400">
            {filteredParticipants.filter((p) => p.avgSentiment > 0.6).length}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-gray-400">Média de Mensagens</div>
          <div className="text-3xl font-bold text-white">
            {Math.round(
              filteredParticipants.reduce((sum, p) => sum + p.messageCount, 0) /
                filteredParticipants.length || 0
            )}
          </div>
        </Card>
      </div>

      {/* Participants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredParticipants.map((participant, index) => (
          <motion.div
            key={participant.jid}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <ParticipantCard
              participant={participant}
              onClick={() => setSelectedParticipant(participant)}
            />
          </motion.div>
        ))}
      </div>

      {filteredParticipants.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-gray-400 text-lg">Nenhum participante encontrado</p>
        </Card>
      )}

      {/* Modal */}
      {selectedParticipant && (
        <ParticipantModal
          participant={selectedParticipant}
          open={!!selectedParticipant}
          onClose={() => setSelectedParticipant(null)}
        />
      )}
    </DashboardLayout>
  )
}
