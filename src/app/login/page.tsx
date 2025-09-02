"use client"
import { useState } from 'react'
import Link from 'next/link'
import { Box, Button, Paper, TextField, Typography } from '@mui/material'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  return (
    <Paper elevation={0} sx={{ maxWidth: 420, mx: 'auto', mt: 6, p: 3 }}>
      <Typography variant="h5" gutterBottom>Sign In</Typography>
      <Box component="form" onSubmit={async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        const res = await fetch('/api/auth/signin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
        setLoading(false)
        if (res.ok) window.location.href = '/dashboard'
        else setError((await res.json()).error || 'Login failed')
      }} sx={{ display: 'grid', gap: 2 }}>
        <TextField type="email" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth />
        <TextField type="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} required fullWidth />
        <Button type="submit" variant="contained" disabled={loading}>Sign In</Button>
      </Box>
      {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
      <Typography sx={{ mt: 2 }}>New? <Link href="/register">Create an account</Link></Typography>
    </Paper>
  )
}
