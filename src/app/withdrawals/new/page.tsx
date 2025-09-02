import { Suspense } from 'react'
import NewWithdrawalClient from './NewWithdrawalClient'

export const dynamic = 'force-dynamic'

export default function NewWithdrawal() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <NewWithdrawalClient />
    </Suspense>
  )
}
