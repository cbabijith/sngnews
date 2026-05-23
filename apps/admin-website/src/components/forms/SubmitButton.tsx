'use client'

interface SubmitButtonProps {
  loading?: boolean
  loadingText?: string
  children: React.ReactNode
  disabled?: boolean
}

export function SubmitButton({ 
  loading = false, 
  loadingText = 'Submitting...',
  children,
  disabled = false
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-button hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-button disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? loadingText : children}
    </button>
  )
}
