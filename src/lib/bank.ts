export type BankDetails = {
  enabled: boolean
  bankName: string
  accountName: string
  accountNumber: string
  routingNumber: string
  notes?: string
}

export function getBankDetails(): BankDetails | null {
  const enabled = process.env.BANK_ENABLED === 'true' || process.env.BANK_ENABLED === '1'
  const bankName = process.env.BANK_NAME || 'Bank of America'
  const accountName = process.env.BANK_ACCOUNT_NAME || ''
  const accountNumber = process.env.BANK_ACCOUNT_NUMBER || ''
  const routingNumber = process.env.BANK_ROUTING_NUMBER || ''
  const notes = process.env.BANK_NOTES
  if (!enabled) return null
  if (!accountName || !accountNumber || !routingNumber) return null
  return { enabled, bankName, accountName, accountNumber, routingNumber, notes }
}

export function maskAccount(acct: string) {
  if (!acct) return ''
  const last4 = acct.slice(-4)
  return `****${last4}`
}

export function maskRouting(rt: string) {
  if (!rt) return ''
  const last2 = rt.slice(-2)
  return `*******${last2}`
}
