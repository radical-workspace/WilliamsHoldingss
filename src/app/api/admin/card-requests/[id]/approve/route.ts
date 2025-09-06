import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminRequest } from '@/lib/auth'

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const result = await prisma.$transaction(async (tx) => {
    const cr = await tx.cardRequest.update({ where: { id }, data: { status: 'APPROVED' } })
    // deduct 1000 USD available and add ledger entry
    const bal = await tx.balance.findUnique({ where: { userId_asset_network: { userId: cr.userId, asset: 'USD', network: 'ACH' } } })
    if (!bal) throw new Error('USD balance not found')
    if (Number(bal.available) < 1000) throw new Error('Insufficient funds')
    const updated = await tx.balance.update({ where: { id: bal.id }, data: { available: (Number(bal.available) - 1000) as any } })
    await tx.ledger.create({ data: { userId: cr.userId, asset: 'USD', network: 'ACH', amount: (-1000 as any), type: 'ADJUSTMENT', refType: 'CardRequest', refId: cr.id, memo: 'Card request approved: $1,000 fee charged' } })
    return { cr, updated }
  })
  return NextResponse.json({ ok: true, request: result.cr })
}
