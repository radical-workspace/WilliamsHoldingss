import Link from 'next/link'
import { ReactNode } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Typography sx={{ flexGrow: 1, fontWeight: 600 }}>Admin</Typography>
          <Button href="/admin/deposits" component={Link as any}>Deposits</Button>
          <Button href="/admin/withdrawals" component={Link as any}>Withdrawals</Button>
          <Button href="/admin/balances" component={Link as any}>Balances</Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {children}
      </Container>
    </div>
  )
}
