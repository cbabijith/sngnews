'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useThemeStore } from '@/store/themeStore'
import { useNavigationStore } from '@/store/navigationStore'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { colors } = useThemeStore()
  const { setCurrentPath } = useNavigationStore()

  const navItems = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/content/news', label: 'News', icon: '📰' },
    { href: '/content/categories', label: 'Categories', icon: '📁' },
  ]

  const handleNavClick = (href: string) => {
    setCurrentPath(href)
  }

  return (
    <aside className={`fixed left-0 top-0 h-full w-64 ${colors.card} shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-6">
        <h2 className={`text-2xl font-bold ${colors.text}`}>SNG News</h2>
        <p className={`text-sm ${colors.textSecondary}`}>Admin Panel</p>
      </div>

      <nav className="mt-6">
        <ul className="space-y-2 px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-button text-white'
                      : `${colors.text} hover:${colors.background}`
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
