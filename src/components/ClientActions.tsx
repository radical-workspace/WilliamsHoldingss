"use client"
import React from 'react'

export function ClientActions({ id, type }: { id: string; type: 'deposit' | 'withdrawal' }) {
  async function act(path: string, message: string, withNote = false) {
    let init: RequestInit = { method: 'POST' }
    if (withNote) {
      const note = typeof window !== 'undefined' ? window.prompt('Admin note (optional): e.g., "ACH sent 9/2/2025 ref #12345"') : ''
      init = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNote: note || undefined })
      }
    }
    const r = await fetch(path, init)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('flash', r.ok ? message : 'Action failed')
      window.location.reload()
    }
  }
  return (
    <div className="flex gap-2">
      <button className="border px-2 py-1" onClick={() => act(`/api/admin/${type}s/${id}/approve`, `${type} approved`, true)}>Approve</button>
      <button className="border px-2 py-1" onClick={() => act(`/api/admin/${type}s/${id}/reject`, `${type} rejected`)}>Reject</button>
    </div>
  )
}
