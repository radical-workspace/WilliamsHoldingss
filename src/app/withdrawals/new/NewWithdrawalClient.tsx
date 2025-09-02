"use client"
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'

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
    USDC: { min: 1 }
  }
  const min = rules[asset]?.min ?? 0
  const netRegex = rules[asset]?.regex?.[network]
  const addrOk = method === 'BANK'
    ? (achName.trim().length > 1 && /^\d{9}$/.test(achRouting) && /^\d{5,}$/.test(achAccount))
    : (netRegex ? netRegex.test(address) : basicAddrOk(address))
  const ok = (method === 'BANK' ? true : (asset && network)) && amountNum >= Math.max(0.00000001, min) && amountNum <= available && addrOk

  return (
    <div>
      <h2>New Withdrawal</h2>
      <div className="mb-3 flex gap-3">
        <label className="flex items-center gap-1">
          <input type="radio" name="method" checked={method === 'CRYPTO'} onChange={() => setMethod('CRYPTO')} /> Crypto
        </label>
        <label className="flex items-center gap-1">
          <input type="radio" name="method" checked={method === 'BANK'} onChange={() => setMethod('BANK')} /> Bank Transfer (US)
        </label>
      </div>
      <form
        onSubmit={async (e) => {
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
          if (!res.ok) setMessage(data.error || 'Failed')
          else setMessage('Submitted! Status PENDING until admin approves and sends off-chain.')
        }}
      >
        {method === 'CRYPTO' ? (
          <>
            <label>
              Asset
              <select value={asset} onChange={(e) => { const a = e.target.value; setAsset(a); const n = items.find((i) => i.asset === a)?.network || ''; setNetwork(n) }}>
                {assets.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </label>
            <label>
              Network
              <select value={network} onChange={(e) => setNetwork(e.target.value)}>
                {networks.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>
            <label>
              Destination Address
              <input value={address} onChange={(e) => setAddress(e.target.value)} required />
            </label>
          </>
        ) : (
          <>
            <label>
              Account Holder Name
              <input value={achName} onChange={(e) => setAchName(e.target.value)} required />
            </label>
            <label>
              Routing Number
              <input value={achRouting} onChange={(e) => setAchRouting(e.target.value)} placeholder="9 digits" required />
            </label>
            <label>
              Account Number
              <input value={achAccount} onChange={(e) => setAchAccount(e.target.value)} placeholder="Checking/Savings" required />
            </label>
          </>
        )}
        <label>
          Amount (Available: {available}{min ? `, Min: ${min}` : ''})
          <input type="number" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </label>
        <button disabled={!ok || submitting}>Submit</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  )
}
