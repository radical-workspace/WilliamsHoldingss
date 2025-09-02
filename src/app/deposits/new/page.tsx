"use client"
import { useEffect, useMemo, useState } from 'react'

type ReceivingAddress = { asset: string; network: string; address: string }

export default function NewDeposit() {
  const [items, setItems] = useState<ReceivingAddress[]>([])
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
  const [message, setMessage] = useState('')

  useEffect(() => {
    ;(async () => {
      const res = await fetch('/api/settings/receiving')
      const j = await res.json()
      setItems(j.items || [])
      if ((j.items || []).length) {
        setAsset(j.items[0].asset)
        setNetwork(j.items[0].network)
      }
      const bankRes = await fetch('/api/settings/bank')
      const bj = await bankRes.json().catch(() => ({ enabled: false }))
      setBank(bj)
      if (bj.enabled) setMethod('BANK')
    })()
  }, [])

  return (
    <div>
      <h2>New Deposit</h2>
      <div className="mb-3 flex gap-3">
        <label className="flex items-center gap-1">
          <input type="radio" name="method" checked={method === 'CRYPTO'} onChange={() => setMethod('CRYPTO')} /> Crypto
        </label>
        {bank.enabled && (
          <label className="flex items-center gap-1">
            <input type="radio" name="method" checked={method === 'BANK'} onChange={() => setMethod('BANK')} /> Bank Transfer (US)
          </label>
        )}
      </div>
      {method === 'CRYPTO' ? <p className="muted">Copy the address, send from your wallet, then submit this form.</p> : (
        <div className="rounded border p-3 bg-white mb-3">
          <p><strong>{bank.bankName}</strong></p>
          <p>Account Name: {bank.accountName}</p>
          <p>Routing Number: {bank.routingNumberMasked}</p>
          <p>Account Number: {bank.accountNumberMasked}</p>
          {bank.notes && <p className="muted">{bank.notes}</p>}
        </div>
      )}
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          setSubmitting(true)
          setMessage('')
          const res = await fetch('/api/deposits', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(method === 'CRYPTO' ?
              { asset, network, amount: parseFloat(amount), sent_to_address: addr, tx_proof: txProof || undefined } :
              { asset: 'USD', network: 'ACH', amount: parseFloat(amount), sent_to_address: `${bank.bankName} ${bank.accountNumberMasked}`, tx_proof: txProof || undefined }
            )
          })
          const data = await res.json()
          setSubmitting(false)
          if (!res.ok) {
            setMessage(data.error || 'Failed')
          } else {
            setMessage('Submitted! It will appear in your deposits list with status PENDING.')
          }
        }}
      >
        <label>
          Asset
          <select value={asset} onChange={(e) => { const a = e.target.value; setAsset(a); const n = items.find((i) => i.asset === a)?.network || ''; setNetwork(n) }}>
            {assets.map((a: string) => (
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
        <div>
          <strong>Send to:</strong>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <code>{addr || '—'}</code>
            <button type="button" onClick={() => navigator.clipboard.writeText(addr || '')}>Copy</button>
          </div>
        </div>
        <label>
          Amount
          <input type="number" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </label>
        <label>
          {method === 'BANK' ? 'Bank reference or memo (optional)' : 'Optional Tx Proof (URL or hash)'}
          <input value={txProof} onChange={(e) => setTxProof(e.target.value)} placeholder={method === 'BANK' ? 'e.g., BoA reference #, memo, or note' : ''} />
        </label>
  <button disabled={submitting || (method === 'CRYPTO' && !addr)}>Submit</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  )
}
