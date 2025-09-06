import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminRequest } from '@/lib/auth'

const CARD_REQUEST_FEE_USD = 1000;

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  if (!isAdminRequest()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = params
  const result = await prisma.$transaction(async (tx) => {
    const cr = await tx.cardRequest.update({ where: { id }, data: { status: 'APPROVED' } })
    // deduct card fee USD available and add ledger entry
    const bal = await tx.balance.findUnique({ where: { userId_asset_network: { userId: cr.userId, asset: 'USD', network: 'ACH' } } })
    if (!bal) throw new Error('USD balance not found')
    if (Number(bal.available) < CARD_REQUEST_FEE_USD) throw new Error('Insufficient funds')
    const updated = await tx.balance.update({ where: { id: bal.id }, data: { available: Number(bal.available) - CARD_REQUEST_FEE_USD } })
    await tx.ledger.create({ data: { userId: cr.userId, asset: 'USD', network: 'ACH', amount: -CARD_REQUEST_FEE_USD, type: 'ADJUSTMENT', refType: 'CardRequest', refId: cr.id, memo: `Card request approved: $${CARD_REQUEST_FEE_USD.toLocaleString()} fee charged` } })
    return { cr, updated }
  })
  return NextResponse.json({ ok: true, request: result.cr })
}
