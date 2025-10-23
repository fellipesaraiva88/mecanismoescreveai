'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  Bell,
  Settings,
  Brain,
  Network,
  MessageSquare,
} from 'lucide-react'
import Link from 'next/link'

interface DashboardLayoutProps {
  children: ReactNode
}

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { name: 'Participantes', icon: Users, href: '/participants' },
  { name: 'Conversas', icon: MessageSquare, href: '/conversations' },
  { name: 'Relacionamentos', icon: Network, href: '/relationships' },
  { name: 'Insights', icon: Brain, href: '/insights' },
  { name: 'Tendências', icon: TrendingUp, href: '/trends' },
  { name: 'Alertas', icon: Bell, href: '/alerts' },
]

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="fixed left-0 top-0 bottom-0 w-64 bg-gray-800/50 backdrop-blur-lg border-r border-gray-700/50 p-6"
      >
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-green-400">📊 Analytics</h2>
          <p className="text-sm text-gray-400 mt-1">WhatsApp Edition</p>
        </div>

        <nav className="space-y-2">
          {navigation.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-green-500/10 hover:text-green-400 transition-all duration-200"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            </motion.div>
          ))}
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-700/50 hover:text-white transition-all"
          >
            <Settings className="w-5 h-5" />
            <span>Configurações</span>
          </Link>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  )
}
