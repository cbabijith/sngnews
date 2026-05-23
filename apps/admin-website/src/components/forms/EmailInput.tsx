'use client'

import { useState } from 'react'

interface EmailInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
}

export function EmailInput({ 
  value, 
  onChange, 
  placeholder = 'Email address',
  required = true 
}: EmailInputProps) {
  return (
    <div>
      <label htmlFor="email" className="sr-only">
        Email address
      </label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required={required}
        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
