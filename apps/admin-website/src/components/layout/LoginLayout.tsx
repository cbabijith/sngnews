import { ReactNode } from 'react'
import { LOGIN_TEXT } from '@/constants/login'
import { useThemeStore } from '@/store/themeStore'

interface LoginLayoutProps {
  children: ReactNode
}

export function LoginLayout({ children }: LoginLayoutProps) {
  const { colors } = useThemeStore()
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className={`mt-6 text-center text-3xl font-extrabold ${colors.text}`}>
            {LOGIN_TEXT.pageTitle}
          </h2>
          <p className={`mt-2 text-center text-sm ${colors.textSecondary}`}>
            {LOGIN_TEXT.pageSubtitle}
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
