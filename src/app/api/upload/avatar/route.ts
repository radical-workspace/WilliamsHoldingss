import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// Attempt to use Vercel Blob in production when token is available
let put: undefined | ((name: string, body: any, opts?: any) => Promise<{ url: string }>)
try {
  const vercelBlob = await import('@vercel/blob') as { put?: (name: string, body: any, opts?: any) => Promise<{ url: string }> }
  if (typeof vercelBlob.put === 'function') {
    put = vercelBlob.put
  }
    put = vercelBlob.put
  }
    put = vercelBlob.put
  }
    put = vercelBlob.put
  }
    put = vercelBlob.put
  }
    put = vercelBlob.put
  }
    put = vercelBlob.put
  }
    put = vercelBlob.put
  }
} catch {
  // optional dependency not available locally
}

export const runtime = 'nodejs'

const MAX_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp'])

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get('file') as unknown as File | null
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    if (!ALLOWED.has(file.type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 415 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Too large' }, { status: 413 })
    }

    const ext = file.type.split('/')[1] || 'png'
    const baseName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    // Use Vercel Blob if available
    if (put && process.env.BLOB_READ_WRITE_TOKEN) {
      const res = await put(`avatars/${baseName}`, file, { access: 'public', addRandomSuffix: false })
      // Persist to current user
      try {
        const user = await getCurrentUser()
        await prisma.user.update({ where: { id: user.id }, data: { avatarUrl: res.url } })
      } catch {}
      return NextResponse.json({ url: res.url })
    }

    // Dev fallback: write to public/avatars
  const arrayBuffer = await file.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)
    const fs = await import('fs/promises')
    const path = await import('path')
    const dir = path.join(process.cwd(), 'public', 'avatars')
    await fs.mkdir(dir, { recursive: true })
    const full = path.join(dir, baseName)
  await fs.writeFile(full, buffer)
    const url = `/avatars/${baseName}`
    try {
      const user = await getCurrentUser()
      await prisma.user.update({ where: { id: user.id }, data: { avatarUrl: url } })
    } catch {}
    return NextResponse.json({ url })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Upload failed' }, { status: 500 })
  }
}
