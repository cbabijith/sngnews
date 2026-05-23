'use client'

import { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { useThemeStore } from '@/store/themeStore'
import { useNavigationStore } from '@/store/navigationStore'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { colors } = useThemeStore()
  const { sidebarOpen, toggleSidebar } = useNavigationStore()

  return (
    <div className={`min-h-screen ${colors.background}`}>
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={toggleSidebar}
      />
      
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="p-8">
          <button
            onClick={toggleSidebar}
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
