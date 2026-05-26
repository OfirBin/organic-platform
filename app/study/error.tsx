'use client' // Error components must be Client Components

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 space-y-6 w-full max-w-2xl mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mb-2">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h2 className="text-3xl font-bold text-foreground text-center">It didn't work :(</h2>
      <p className="text-sidebar-text text-center text-lg">
        {error.message || "Something went wrong while processing your request."}
      </p>
      <button
        className="px-8 py-3 bg-brand text-white font-bold rounded-xl hover:bg-brand-hover transition-colors shadow-sm mt-4"
        onClick={() => reset()}
      >
        Try again
      </button>
    </div>
  )
}
