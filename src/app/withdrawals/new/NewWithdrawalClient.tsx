"use client"
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Box,
  Paper,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Stack,
  Alert,
  Divider,
} from '@mui/material'

function basicAddrOk(addr: string) {
  return /^(0x[a-fA-F0-9]{40}|bc1[a-zA-Z0-9]{25,48}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})$/.test(addr)
}

export default function NewWithdrawalClient() {
  const params = useSearchParams()
  const [method, setMethod] = useState<'CRYPTO' | 'BANK'>('CRYPTO')
  const [items, setItems] = useState<{ asset: string; network: string }[]>([])
  const assets = useMemo(() => Array.from(new Set(items.map((i) => i.asset))), [items])
  const [asset, setAsset] = useState('')
  const networks = useMemo(() => items.filter((i) => i.asset === asset).map((i) => i.network), [items, asset])
  const [network, setNetwork] = useState('')
  const [amount, setAmount] = useState('')
  const [address, setAddress] = useState('')
  const [achName, setAchName] = useState('')
  const [achRouting, setAchRouting] = useState('')
  const [achAccount, setAchAccount] = useState('')
  const [available, setAvailable] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    ;(async () => {
      const res = await fetch('/api/settings/receiving')
      const j = await res.json()
      const arr = (j.items || []).map((i: any) => ({ asset: i.asset, network: i.network }))
      setItems(arr)
      if (arr.length) {
        const qpAsset = params.get('asset') || arr[0].asset
        const qpNetwork = params.get('network') || arr.find((i: any) => i.asset === qpAsset)?.network || arr[0].network
        setAsset(qpAsset)
        setNetwork(qpNetwork)
        const qpAddr = params.get('address')
        if (qpAddr) setAddress(qpAddr)
      }
    })()
  }, [params])

  useEffect(() => {
    async function load() {
      const u = await fetch(`/api/balances?asset=${asset}&network=${network}`)
      const j = await u.json()
      setAvailable(j.available || 0)
    }
    if (asset && network) load()
  }, [asset, network])

  // If switching to BANK, force USD/ACH selection; else keep crypto selection
  useEffect(() => {
    if (method === 'BANK') {
      setAsset('USD')
      setNetwork('ACH')
    }
  }, [method])

  const amountNum = parseFloat(amount || '0')
  const rules: Record<string, { min?: number; regex?: Record<string, RegExp> }> = {
    BTC: { min: 0.00001, regex: { bitcoin: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,}$/ } },
    ETH: { min: 0.0001, regex: { ethereum: /^0x[a-fA-F0-9]{40}$/ } },
    USDC: { min: 1 },
    USD: { min: 1 },
  }
  const min = rules[asset]?.min ?? 0
  const netRegex = rules[asset]?.regex?.[network]
  const isAchValid = achName.trim().length > 1 && /^\d{9}$/.test(achRouting) && /^\d{5,}$/.test(achAccount)
  const isAddrValid = netRegex ? netRegex.test(address) : basicAddrOk(address)
  const formValid = method === 'BANK' ? isAchValid : (Boolean(asset && network) && isAddrValid)
  const amountValid = amountNum >= Math.max(0.00000001, min) && amountNum <= (available || 0)

  return (
    <Paper elevation={0} sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>New Withdrawal</Typography>

      <FormControl sx={{ mb: 2 }}>
        <RadioGroup row value={method} onChange={(e) => setMethod(e.target.value as any)}>
          <FormControlLabel value="CRYPTO" control={<Radio />} label="Crypto" />
          <FormControlLabel value="BANK" control={<Radio />} label="Bank Transfer (US)" />
        </RadioGroup>
      </FormControl>

      <Box component="form" onSubmit={async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setMessage('')
        const payload = method === 'CRYPTO'
          ? { asset, network, amount: amountNum, destination_address: address }
          : { asset: 'USD', network: 'ACH', amount: amountNum, destination_address: `ACH:${achRouting}:${achAccount}:${achName}` }
        const res = await fetch('/api/withdrawals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        const data = await res.json()
        setSubmitting(false)
        if (!res.ok) setMessage(data.error || 'Submission failed')
        else setMessage('Submitted! Status PENDING until admin approves and sends off-chain.')
      }}>
        <Stack spacing={2} sx={{ maxWidth: 600 }}>
          {method === 'CRYPTO' ? (
            <>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControl fullWidth>
                  <InputLabel id="asset-label">Asset</InputLabel>
                  <Select
                    labelId="asset-label"
                    label="Asset"
                    value={asset}
                    onChange={(e) => {
                      const a = e.target.value as string
                      setAsset(a)
                      const n = items.find((i) => i.asset === a)?.network || ''
                      setNetwork(n)
                    }}
                  >
                    {assets.map((a) => (
                      <MenuItem key={a} value={a}>{a}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel id="network-label">Network</InputLabel>
                  <Select
                    labelId="network-label"
                    label="Network"
                    value={network}
                    onChange={(e) => setNetwork(e.target.value as string)}
                  >
                    {networks.map((n) => (
                      <MenuItem key={n} value={n}>{n}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
              <TextField
                label="Destination Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                error={Boolean(address) && !isAddrValid}
                helperText={Boolean(address) && !isAddrValid ? 'Enter a valid address for the selected network' : ' '}
                fullWidth
                required
              />
            </>
          ) : (
            <>
              <TextField
                label="Account Holder Name"
                value={achName}
                onChange={(e) => setAchName(e.target.value)}
                error={Boolean(achName) && achName.trim().length <= 1}
                helperText={Boolean(achName) && achName.trim().length <= 1 ? 'Enter full name' : ' '}
                fullWidth
                required
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Routing Number"
                  value={achRouting}
                  onChange={(e) => setAchRouting(e.target.value.replace(/[^0-9]/g, '').slice(0, 9))}
                  placeholder="9 digits"
                  error={Boolean(achRouting) && !/^\d{9}$/.test(achRouting)}
                  helperText={Boolean(achRouting) && !/^\d{9}$/.test(achRouting) ? '9 digits required' : ' '}
                  fullWidth
                  required
                />
                <TextField
                  label="Account Number"
                  value={achAccount}
                  onChange={(e) => setAchAccount(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Checking/Savings"
                  error={Boolean(achAccount) && !/^\d{5,}$/.test(achAccount)}
                  helperText={Boolean(achAccount) && !/^\d{5,}$/.test(achAccount) ? 'At least 5 digits' : ' '}
                  fullWidth
                  required
                />
              </Stack>
            </>
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-end">
            <TextField
              label={`Amount (Available: ${available}${min ? `, Min: ${min}` : ''})`}
              type="number"
              inputProps={{ step: 'any', min: 0 }}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              error={Boolean(amount) && !amountValid}
              helperText={Boolean(amount) && !amountValid ? 'Enter a valid amount within available balance' : ' '}
              fullWidth
              required
            />
            <Button variant="outlined" onClick={() => setAmount(String(available || ''))}>Max</Button>
          </Stack>

          <Divider sx={{ my: 1 }} />

          {message && <Alert severity={message.startsWith('Submitted') ? 'success' : 'error'}>{message}</Alert>}

          <Box>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting || !(formValid && amountValid)}
            >
              {submitting ? 'Submitting…' : 'Submit Withdrawal'}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Paper>
  )
}
