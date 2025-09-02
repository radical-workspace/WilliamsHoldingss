"use client"
import { useState } from 'react'

export default function AdminLogin() {
  const [secret, setSecret] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  return (
    <div>
      <h2>Admin Login</h2>
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          setLoading(true)
          setMessage('')
          const res = await fetch('/api/admin/signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ secret })
          })
          setLoading(false)
          if (res.ok) {
            window.location.href = '/admin/deposits'
          } else {
            const j = await res.json().catch(() => ({}))
            setMessage(j.error || 'Invalid admin secret')
          }
        }}
      >
        <label>
          Admin Secret
          <input type="password" value={secret} onChange={(e) => setSecret(e.target.value)} required />
        </label>
        <button disabled={loading}>Login</button>
      </form>
      {message && <p style={{ color: 'red' }}>{message}</p>}
    </div>
  )
}
