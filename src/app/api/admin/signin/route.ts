import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const { secret } = body
  if (!secret || secret !== process.env.ADMIN_SECRET) return NextResponse.json({ error: 'Invalid admin secret' }, { status: 401 })
  return new NextResponse(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Set-Cookie': `admin=1; Path=/; HttpOnly; SameSite=Lax`
    }
  })
}
