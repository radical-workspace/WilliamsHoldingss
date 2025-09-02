"use client"
import { useEffect, useState } from 'react'

export function Flash({ message, type = 'info' }: { message?: string; type?: 'success' | 'error' | 'info' }) {
  const [open, setOpen] = useState(Boolean(message))
  useEffect(() => setOpen(Boolean(message)), [message])
  if (!message || !open) return null
  const color = type === 'success' ? 'bg-green-100 text-green-800' : type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
  return (
    <div className={`rounded p-3 mb-4 ${color}`} onClick={() => setOpen(false)}>
      {message}
    </div>
  )
}
