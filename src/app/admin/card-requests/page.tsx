import { prisma } from '@/lib/prisma'
import { isAdminRequest } from '@/lib/auth'
import { ClientActions } from '@/components/ClientActions'

export const dynamic = 'force-dynamic'

export default async function AdminCardRequests() {
  if (!isAdminRequest()) return <p>Unauthorized</p>
  const items = await prisma.cardRequest.findMany({ orderBy: { createdAt: 'desc' }, include: { user: true } })
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Admin: Card Requests</h2>
      <table className="min-w-full bg-white border rounded">
        <thead>
          <tr className="bg-slate-50 text-left">
            <th>Created</th>
            <th>User</th>
            <th>Brand</th>
            <th>Type</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.id} className="hover:bg-slate-50">
              <td className="p-2 border-b">{new Date(r.createdAt as any).toLocaleString()}</td>
              <td className="p-2 border-b">{r.user.email}</td>
              <td className="p-2 border-b">{r.brand}</td>
              <td className="p-2 border-b">{r.cardType}</td>
              <td className="p-2 border-b">{r.status}</td>
              <td className="p-2 border-b">{r.status === 'PENDING' ? <ClientActions id={r.id} type={'card-requests'} /> : <span className="muted">—</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
