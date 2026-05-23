'use client'

import { ReactNode, useState } from 'react'
import { Sidebar } from './Sidebar'
import { useThemeStore } from '@/store/themeStore'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { colors } = useThemeStore()

  return (
    <div className={`min-h-screen ${colors.background}`}>
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
      />
      
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="p-8">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mb-4 px-4 py-2 bg-button text-white rounded-lg hover:opacity-90"
          >
            {sidebarOpen ? '☰ Close Sidebar' : '☰ Open Sidebar'}
          </button>
          {children}
        </div>
      </div>
    </div>
  )
}
