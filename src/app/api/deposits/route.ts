import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { getCurrentUser } from '../../../lib/auth'
import { depositSchema } from '../../../lib/validation'

export async function POST(req: Request) {
  const user = await getCurrentUser()
  const dbUser = await prisma.user.upsert({ where: { email: user.email }, update: {}, create: { email: user.email, name: user.name ?? 'Demo' } })
  const json = await req.json()
  const parsed = depositSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 })
  const { asset, network, amount, sent_to_address, tx_proof } = parsed.data

  const deposit = await prisma.deposit.create({
    data: {
      userId: dbUser.id,
      asset: asset as any,
      network: network as any,
      amount: amount as any,
      sentToAddress: sent_to_address,
      txProof: tx_proof
    }
  })

  return NextResponse.json({ id: deposit.id, status: deposit.status })
}
