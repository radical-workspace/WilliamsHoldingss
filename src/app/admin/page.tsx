import { isAdminRequest } from '@/lib/auth'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function AdminHome() {
  if (!isAdminRequest()) {
  return <p>Unauthorized.</p>
  }
  return (
    <div>
      <h2 className="text-xl font-semibold mb-1">Admin Dashboard</h2>
      <p className="muted mb-6">WilliamsHoldings Banking — operations console</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/deposits" className="rounded border bg-white p-4 hover:shadow-sm">
          <h3 className="font-medium mb-1">Deposits</h3>
          <p className="muted text-sm">Review and approve user deposits.</p>
        </Link>
        <Link href="/admin/withdrawals" className="rounded border bg-white p-4 hover:shadow-sm">
          <h3 className="font-medium mb-1">Withdrawals</h3>
          <p className="muted text-sm">Approve or reject withdrawal requests.</p>
        </Link>
        <Link href="/admin/card-requests" className="rounded border bg-white p-4 hover:shadow-sm">
          <h3 className="font-medium mb-1">Card Requests</h3>
          <p className="muted text-sm">Approve or reject manual off-chain card requests.</p>
        </Link>
        <Link href="/admin/balances" className="rounded border bg-white p-4 hover:shadow-sm">
          <h3 className="font-medium mb-1">Balances & Ledger</h3>
          <p className="muted text-sm">View system balances and recent ledger.</p>
        </Link>
      </div>
    </div>
  )
}
