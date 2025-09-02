import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { Badge } from '@/components/Badge'
import { TimeAgo } from '@/components/TimeAgo'

export const dynamic = 'force-dynamic'

export default async function WithdrawalsPage() {
  const user = await getCurrentUser()
  const dbUser = await prisma.user.upsert({
    where: { email: user.email },
    update: {},
    create: { email: user.email, name: user.name ?? 'Demo' }
  })

  const wds = await prisma.withdrawal.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div>
      <h2>Your Withdrawals</h2>
      {wds.length === 0 ? (
        <p className="muted">No withdrawals yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Created</th>
              <th>Asset</th>
              <th>Network</th>
              <th>Amount</th>
              <th>Destination</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {wds.map((d) => (
              <tr key={d.id}>
                <td><TimeAgo date={d.createdAt} /></td>
                <td>{d.asset}</td>
                <td>{d.network}</td>
                <td>{d.amount.toString()}</td>
                <td>{d.destinationAddress}</td>
                <td>{d.status === 'PENDING' ? <Badge>Pending</Badge> : d.status === 'APPROVED' ? <Badge variant='success'>Approved</Badge> : <Badge variant='error'>Rejected</Badge>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
