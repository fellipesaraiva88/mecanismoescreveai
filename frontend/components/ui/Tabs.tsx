'use client'

import { useState, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface Tab {
  id: string
  label: string
  icon?: ReactNode
  content: ReactNode
}

interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
  onChange?: (tabId: string) => void
}

export function Tabs({ tabs, defaultTab, onChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    onChange?.(tabId)
  }

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content

  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div className="flex gap-2 border-b border-gray-700 mb-6">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                'relative px-4 py-3 text-sm font-medium transition-colors',
                isActive ? 'text-green-400' : 'text-gray-400 hover:text-gray-300'
              )}
            >
              <div className="flex items-center gap-2">
                {tab.icon}
                {tab.label}
              </div>

              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-400 transition-all duration-200" />
              )}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div
        key={activeTab}
        className="animate-fadeIn"
      >
        {activeTabContent}
      </div>
    </div>
  )
}
