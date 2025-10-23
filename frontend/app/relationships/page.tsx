'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Network, Users, Heart } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard/Layout'
import { Card } from '@/components/ui/Card'

export default function RelationshipsPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [relationships, setRelationships] = useState<any[]>([])

  useEffect(() => {
    const fetchRelationships = async () => {
      try {
        const { dashboardApi } = await import('@/lib/api')
        const response = await dashboardApi.getRelationships()
        if (response.success && response.data) {
          setRelationships(response.data.map((r: any) => ({
            from: r.from_name || r.participant_a_jid?.split('@')[0] || 'Unknown',
            to: r.to_name || r.participant_b_jid?.split('@')[0] || 'Unknown',
            strength: r.relationship_strength || 0.5,
          })))
        }
      } catch (error) {
        console.error('Error fetching relationships:', error)
      }
    }
    fetchRelationships()

    // Desenhar grafo simples
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = 500

    const nodes = [
      { name: 'João', x: 150, y: 250, connections: 3 },
      { name: 'Maria', x: 350, y: 150, connections: 2 },
      { name: 'Pedro', x: 550, y: 250, connections: 2 },
      { name: 'Ana', x: 250, y: 400, connections: 2 },
      { name: 'Carlos', x: 450, y: 400, connections: 1 },
    ]

    // Limpa
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Desenha conexões
    mockRelationships.slice(0, 5).forEach((rel, i) => {
      const fromNode = nodes[i % nodes.length]
      const toNode = nodes[(i + 1) % nodes.length]

      ctx.strokeStyle = `rgba(16, 185, 129, ${rel.strength})`
      ctx.lineWidth = rel.strength * 4
      ctx.beginPath()
      ctx.moveTo(fromNode.x, fromNode.y)
      ctx.lineTo(toNode.x, toNode.y)
      ctx.stroke()
    })

    // Desenha nós
    nodes.forEach((node) => {
      const radius = 20 + node.connections * 5

      // Glow
      const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius * 1.5)
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)')
      gradient.addColorStop(1, 'transparent')
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(node.x, node.y, radius * 1.5, 0, Math.PI * 2)
      ctx.fill()

      // Círculo
      ctx.fillStyle = '#10b981'
      ctx.beginPath()
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)
      ctx.fill()

      // Borda
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()

      // Nome
      ctx.fillStyle = '#fff'
      ctx.font = '14px Inter'
      ctx.textAlign = 'center'
      ctx.fillText(node.name, node.x, node.y - radius - 15)
    })
  }, [])

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-white mb-2">🕸️ Mapa de Relacionamentos</h1>
        <p className="text-gray-400 mb-8">Visualize conexões e afinidades entre participantes</p>
      </motion.div>

      <Card className="mb-6">
        <h3 className="text-white font-semibold mb-4">Grafo de Relacionamentos</h3>
        <canvas ref={canvasRef} className="w-full rounded-lg bg-gray-900/50" />
        <div className="mt-4 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span className="text-gray-400">Conexão Forte (&gt;0.7)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-400 opacity-50" />
            <span className="text-gray-400">Conexão Média (0.4-0.7)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-400 opacity-25" />
            <span className="text-gray-400">Conexão Fraca (&lt;0.4)</span>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-white font-semibold mb-4">Relacionamentos Mais Fortes</h3>
        <div className="space-y-3">
          {relationships.map((rel, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-pink-400" />
                <span className="text-white">{rel.from}</span>
                <span className="text-gray-500">↔</span>
                <span className="text-white">{rel.to}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-32 bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-blue-400"
                    style={{ width: `${rel.strength * 100}%` }}
                  />
                </div>
                <span className="text-green-400 font-bold w-12 text-right">
                  {(rel.strength * 100).toFixed(0)}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </DashboardLayout>
  )
}
