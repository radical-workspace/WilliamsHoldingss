import { NextResponse } from 'next/server'
import { getBankDetails, maskAccount, maskRouting } from '@/lib/bank'

export async function GET() {
  const d = getBankDetails()
  if (!d) return NextResponse.json({ enabled: false })
  return NextResponse.json({
    enabled: true,
    bankName: d.bankName,
    accountName: d.accountName,
    accountNumberMasked: maskAccount(d.accountNumber),
    routingNumberMasked: maskRouting(d.routingNumber),
    notes: d.notes || ''
  })
}
