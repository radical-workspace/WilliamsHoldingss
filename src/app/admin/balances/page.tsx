import { prisma } from '@/lib/prisma'
import { isAdminRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function AdminBalances() {
  if (!isAdminRequest()) {
    return <p>Unauthorized. Provide X-Admin-Secret header to access.</p>
  }
  const balances = await prisma.balance.findMany({ include: { user: true }, orderBy: [{ userId: 'asc' }] })
  const ledger = await prisma.ledger.findMany({ include: { user: true }, orderBy: [{ createdAt: 'desc' }], take: 100 })
  return (
    <div>
      <h2>Admin: Balances</h2>
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Asset</th>
            <th>Network</th>
            <th>Available</th>
            <th>Locked</th>
          </tr>
        </thead>
        <tbody>
          {balances.map((b) => (
            <tr key={b.id}>
              <td>{b.user.email}</td>
              <td>{b.asset}</td>
              <td>{b.network}</td>
              <td>{b.available.toString()}</td>
              <td>{b.locked.toString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Recent Ledger</h3>
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>User</th>
            <th>Type</th>
            <th>Asset</th>
            <th>Network</th>
            <th>Amount</th>
            <th>Ref</th>
            <th>Memo</th>
          </tr>
        </thead>
        <tbody>
          {ledger.map((l) => (
            <tr key={l.id}>
              <td>{l.createdAt.toISOString()}</td>
              <td>{l.user.email}</td>
              <td>{l.type}</td>
              <td>{l.asset}</td>
              <td>{l.network}</td>
              <td>{l.amount.toString()}</td>
              <td>{l.refType}:{l.refId}</td>
              <td>{l.memo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
