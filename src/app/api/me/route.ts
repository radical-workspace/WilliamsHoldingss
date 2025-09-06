import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const u = await getCurrentUser()
    return NextResponse.json({
      email: u.email,
      name: u.name || null,
      avatarUrl: (u as any).avatarUrl || null,
    })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
