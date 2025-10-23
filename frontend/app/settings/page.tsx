'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Bell, Database, Key, Download } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard/Layout'
import { Card } from '@/components/ui/Card'
import { Tabs, Tab } from '@/components/ui/Tabs'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: false,
    autoAnalysis: true,
    dataRetention: '90',
  })

  const tabs: Tab[] = [
    {
      id: 'general',
      label: 'Geral',
      icon: <Settings className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-white font-semibold mb-4">Configurações Gerais</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <div>
                  <div className="text-white font-medium">Análise Automática</div>
                  <div className="text-sm text-gray-400">Analisar novas mensagens automaticamente</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoAnalysis}
                    onChange={(e) => setSettings({ ...settings, autoAnalysis: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>

              <div>
                <label className="text-white font-medium mb-2 block">Retenção de Dados (dias)</label>
                <Input
                  type="number"
                  value={settings.dataRetention}
                  onChange={(e) => setSettings({ ...settings, dataRetention: e.target.value })}
                  className="max-w-xs"
                />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'notifications',
      label: 'Notificações',
      icon: <Bell className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
            <div>
              <div className="text-white font-medium">Notificações Push</div>
              <div className="text-sm text-gray-400">Receber notificações em tempo real</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
            <div>
              <div className="text-white font-medium">Alertas por Email</div>
              <div className="text-sm text-gray-400">Receber alertas importantes por email</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailAlerts}
                onChange={(e) => setSettings({ ...settings, emailAlerts: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </label>
          </div>
        </div>
      ),
    },
    {
      id: 'data',
      label: 'Dados',
      icon: <Database className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-white font-semibold mb-4">Exportação de Dados</h3>
            <div className="space-y-3">
              <Button icon={<Download className="w-4 h-4" />} className="w-full justify-start">
                Exportar Todos os Dados (JSON)
              </Button>
              <Button variant="secondary" icon={<Download className="w-4 h-4" />} className="w-full justify-start">
                Exportar Relatório (PDF)
              </Button>
              <Button variant="secondary" icon={<Download className="w-4 h-4" />} className="w-full justify-start">
                Exportar Análises (CSV)
              </Button>
            </div>
          </div>

          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="text-yellow-400 font-medium mb-2">Zona de Perigo</div>
            <p className="text-sm text-gray-400 mb-4">Esta ação não pode ser desfeita</p>
            <Button variant="danger" className="w-full">
              Limpar Todos os Dados
            </Button>
          </div>
        </div>
      ),
    },
  ]

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-white mb-2">⚙️ Configurações</h1>
        <p className="text-gray-400 mb-8">Gerencie preferências e configurações do sistema</p>
      </motion.div>

      <Card>
        <Tabs tabs={tabs} />
      </Card>
    </DashboardLayout>
  )
}
