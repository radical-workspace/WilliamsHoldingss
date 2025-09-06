"use client"
import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Alert,
  Stack,
  Divider,
  Snackbar,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'

type ReceivingAddress = { asset: string; network: string; address: string }

export default function NewDeposit() {
  const [items, setItems] = useState<ReceivingAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [bank, setBank] = useState<{ enabled: boolean; bankName?: string; accountName?: string; accountNumberMasked?: string; routingNumberMasked?: string; notes?: string }>({ enabled: false })
  const [method, setMethod] = useState<'CRYPTO' | 'BANK'>('CRYPTO')
  const assets = useMemo(() => Array.from(new Set(items.map((i) => i.asset))), [items])
  const [asset, setAsset] = useState('')
  const networks = useMemo(() => items.filter((i) => i.asset === asset).map((i) => i.network), [items, asset])
  const [network, setNetwork] = useState('')
  const addr = useMemo(() => items.find((i) => i.asset === asset && i.network === network)?.address || '', [items, asset, network])
  const [amount, setAmount] = useState('')
  const [txProof, setTxProof] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string>('')
  const [severity, setSeverity] = useState<'success' | 'error' | 'info'>('info')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const [res, bankRes] = await Promise.all([
          fetch('/api/settings/receiving'),
          fetch('/api/settings/bank')
        ])
        const j = await res.json().catch(() => ({ items: [] as ReceivingAddress[] }))
        setItems(j.items || [])
        if ((j.items || []).length) {
          setAsset(j.items[0].asset)
          setNetwork(j.items[0].network)
        }
        const bj = await bankRes.json().catch(() => ({ enabled: false }))
        setBank(bj)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Client validation
    const amt = parseFloat(amount)
    if (!amt || isNaN(amt) || amt <= 0) {
      setSeverity('error')
      setMessage('Enter a valid amount greater than 0.')
      return
    }
    if (method === 'CRYPTO' && !addr) {
      setSeverity('error')
      setMessage('No receiving address available for the selected asset/network.')
      return
    }

    setSubmitting(true)
    setMessage('')
    try {
      const body = method === 'CRYPTO'
        ? { asset, network, amount: amt, sent_to_address: addr, tx_proof: txProof || undefined }
        : { asset: 'USD', network: 'ACH', amount: amt, sent_to_address: `${bank.bankName} ${bank.accountNumberMasked}`, tx_proof: txProof || undefined }

      const res = await fetch('/api/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit deposit')
      }
      setSeverity('success')
      setMessage('Submitted! It will appear in your deposits list with status PENDING.')
      setTxProof('')
      setAmount('')
    } catch (err: any) {
      setSeverity('error')
      setMessage(err.message || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  const copyAddr = async () => {
    try {
      await navigator.clipboard.writeText(addr || '')
      setCopied(true)
    } catch {}
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>New Deposit</Typography>

      <Paper variant="outlined" sx={{ p: 3, mb: 3, backgroundColor: 'white' }}>
        <FormControl>
          <FormLabel>Method</FormLabel>
          <RadioGroup row value={method} onChange={(e) => setMethod(e.target.value as any)}>
            <FormControlLabel value="CRYPTO" control={<Radio />} label="Crypto" />
            {bank.enabled && <FormControlLabel value="BANK" control={<Radio />} label="Bank Transfer (US)" />}
          </RadioGroup>
        </FormControl>

        {method === 'CRYPTO' ? (
          <Typography color="text.secondary" sx={{ mt: 1 }}>Copy the address, send from your wallet, then submit this form.</Typography>
        ) : (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>{bank.bankName}</Typography>
            <Typography>Account Name: <b>{bank.accountName}</b></Typography>
            <Typography>Routing Number: <code>{bank.routingNumberMasked}</code></Typography>
            <Typography>Account Number: <code>{bank.accountNumberMasked}</code></Typography>
            {bank.notes && <Typography color="text.secondary" sx={{ mt: 1 }}>{bank.notes}</Typography>}
          </Box>
        )}
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={20} />
          <Typography>Loading options…</Typography>
        </Box>
      ) : (
        <form onSubmit={onSubmit}>
          <Stack spacing={2}>
            {method === 'CRYPTO' && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControl fullWidth>
                  <FormLabel>Asset</FormLabel>
                  <Select size="small" value={asset} onChange={(e) => { const a = e.target.value as string; setAsset(a); const first = items.find((i) => i.asset === a); setNetwork(first ? first.network : '') }}>
                    {assets.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <FormLabel>Network</FormLabel>
                  <Select size="small" value={network} onChange={(e) => setNetwork(e.target.value as string)}>
                    {networks.map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                  </Select>
                </FormControl>
              </Stack>
            )}

            {method === 'CRYPTO' && (
              <TextField
                label="Send to"
                value={addr || '—'}
                InputProps={{
                  readOnly: true,
                  sx: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton aria-label="Copy address" onClick={copyAddr} disabled={!addr} size="small">
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                fullWidth
                size="small"
              />
            )}

            <Divider sx={{ my: 1 }} />

            <TextField
              label="Amount"
              type="number"
              inputProps={{ step: 'any', min: '0' }}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label={method === 'BANK' ? 'Bank reference or memo (optional)' : 'Optional Tx Proof (URL or hash)'}
              placeholder={method === 'BANK' ? 'e.g., BoA reference #, memo, or note' : ''}
              value={txProof}
              onChange={(e) => setTxProof(e.target.value)}
              fullWidth
            />

            <Box>
              <Button type="submit" variant="contained" disabled={submitting || (method === 'CRYPTO' && !addr)}>
                {submitting ? 'Submitting…' : 'Submit'}
              </Button>
              <Button href="/deposits" sx={{ ml: 1 }}>
                View your deposits
              </Button>
            </Box>

            {message && (
              <Alert severity={severity}>{message}</Alert>
            )}
          </Stack>
        </form>
      )}

      <Snackbar
        open={copied}
        autoHideDuration={1600}
        onClose={() => setCopied(false)}
        message="Address copied"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  )
}
