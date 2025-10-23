'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Network } from 'lucide-react'

export function RelationshipGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Configuração do canvas
    canvas.width = canvas.offsetWidth
    canvas.height = 400

    // Mock data - nós e conexões
    const nodes = [
      { id: '1', name: 'João Silva', x: 150, y: 200, connections: 15, sentiment: 0.8 },
      { id: '2', name: 'Maria Santos', x: 350, y: 150, connections: 12, sentiment: 0.6 },
      { id: '3', name: 'Pedro Costa', x: 550, y: 200, connections: 8, sentiment: 0.4 },
      { id: '4', name: 'Ana Lima', x: 250, y: 300, connections: 10, sentiment: 0.9 },
      { id: '5', name: 'Carlos Souza', x: 450, y: 300, connections: 6, sentiment: 0.7 },
    ]

    const edges = [
      { from: '1', to: '2', strength: 0.9 },
      { from: '1', to: '4', strength: 0.7 },
      { from: '2', to: '3', strength: 0.6 },
      { from: '2', to: '5', strength: 0.8 },
      { from: '3', to: '5', strength: 0.5 },
      { from: '4', to: '5', strength: 0.4 },
    ]

    // Limpa canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Desenha as conexões
    edges.forEach((edge) => {
      const fromNode = nodes.find((n) => n.id === edge.from)
      const toNode = nodes.find((n) => n.id === edge.to)

      if (fromNode && toNode) {
        ctx.strokeStyle = `rgba(16, 185, 129, ${edge.strength * 0.5})`
        ctx.lineWidth = edge.strength * 3
        ctx.beginPath()
        ctx.moveTo(fromNode.x, fromNode.y)
        ctx.lineTo(toNode.x, toNode.y)
        ctx.stroke()
      }
    })

    // Desenha os nós
    nodes.forEach((node) => {
      const radius = 10 + node.connections * 2

      // Círculo externo (glow)
      const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius * 1.5)
      gradient.addColorStop(0, `rgba(16, 185, 129, ${node.sentiment * 0.3})`)
      gradient.addColorStop(1, 'transparent')

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(node.x, node.y, radius * 1.5, 0, Math.PI * 2)
      ctx.fill()

      // Círculo principal
      ctx.fillStyle = node.sentiment > 0.6 ? '#10b981' : node.sentiment > 0.3 ? '#f59e0b' : '#ef4444'
      ctx.beginPath()
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)
      ctx.fill()

      // Borda
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()

      // Nome (se hover)
      if (hoveredNode === node.id) {
        ctx.fillStyle = '#fff'
        ctx.font = '12px Inter'
        ctx.textAlign = 'center'
        ctx.fillText(node.name, node.x, node.y - radius - 10)
      }
    })
  }, [hoveredNode])

  return (
    <div className="rounded-xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg border border-gray-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Network className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-bold text-white">Mapa de Relacionamentos</h2>
        </div>
        <div className="text-sm text-gray-400">
          Força das conexões entre participantes
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full rounded-lg"
          style={{ height: '400px' }}
        />

        <div className="absolute bottom-4 right-4 bg-gray-800/90 rounded-lg p-3 text-xs space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span className="text-gray-300">Sentimento Positivo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="text-gray-300">Sentimento Neutro</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <span className="text-gray-300">Sentimento Negativo</span>
          </div>
        </div>
      </div>
    </div>
  )
}
