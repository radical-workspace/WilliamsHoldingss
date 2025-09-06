import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function AdminCardsRedirect() {
  redirect('/admin/card-requests')
}
