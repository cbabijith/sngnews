'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseApi } from '@/api/supabase.api'
import { LoginLayout } from '@/components/layout/LoginLayout'
import { LoginForm } from '@/components/forms/LoginForm'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabaseApi.auth.signIn(email, password)

      if (error) throw error

      router.push('/')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <LoginLayout>
      <LoginForm onSubmit={handleLogin} loading={loading} error={error} />
    </LoginLayout>
  )
}
