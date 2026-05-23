'use client'

import { useState } from 'react'
import { EmailInput } from './EmailInput'
import { PasswordInput } from './PasswordInput'
import { SubmitButton } from './SubmitButton'
import { LOGIN_TEXT } from '@/constants/login'

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>
  loading?: boolean
  error?: string | null
}

export function LoginForm({ onSubmit, loading = false, error = null }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(email, password)
  }

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <div className="rounded-md shadow-sm -space-y-px">
        <EmailInput 
          value={email} 
          onChange={setEmail}
          placeholder={LOGIN_TEXT.emailPlaceholder}
        />
        <PasswordInput 
          value={password} 
          onChange={setPassword}
          placeholder={LOGIN_TEXT.passwordPlaceholder}
        />
      </div>

      <SubmitButton 
        loading={loading} 
        loadingText={LOGIN_TEXT.signingInText}
      >
        {LOGIN_TEXT.signInButton}
      </SubmitButton>
    </form>
  )
}
