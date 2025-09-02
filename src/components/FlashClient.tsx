"use client"
import { useEffect, useState } from 'react'
import { Flash } from './Flash'

export function FlashClient() {
  const [msg, setMsg] = useState<string | undefined>(undefined)
  useEffect(() => {
    const m = typeof window !== 'undefined' ? window.localStorage.getItem('flash') : null
    if (m) {
      setMsg(m)
      window.localStorage.removeItem('flash')
    }
  }, [])
  if (!msg) return null
  return <Flash message={msg} type="success" />
}
