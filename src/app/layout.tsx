import './globals.css'
import Link from 'next/link'
import Image from 'next/image'
import { FlashClient } from '@/components/FlashClient'
import SignOutButton from '@/components/SignOutButton'
import { cookies } from 'next/headers'
import { ReactNode } from 'react'
import ThemeRegistry from '@/components/ThemeRegistry'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'

export default function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = cookies()
  const userEmail = cookieStore.get('userEmail')?.value
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <AppBar position="static" color="default" elevation={0}>
            <Toolbar>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
                <Link href="/" style={{ display: 'inline-flex' }}>
                  <Image src="/logo-williams-holdings.png" alt="Williams Holdings" width={32} height={32} />
                </Link>
                <Typography variant="h6">
                  <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    WilliamsHoldings Banking
                  </Link>
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {userEmail ? (
                  <>
                    <Button href="/deposits" component={Link as any}>Deposits</Button>
                    <Button href="/deposits/new" component={Link as any}>New Deposit</Button>
                    <Button href="/withdrawals" component={Link as any}>Withdrawals</Button>
                    <Button href="/withdrawals/new" component={Link as any}>New Withdrawal</Button>
                    <Button href="/dashboard" component={Link as any}>Dashboard</Button>
                    <SignOutButton />
                  </>
                ) : (
                  <>
                    <Button href="/login" component={Link as any}>Login</Button>
                    <Button href="/register" component={Link as any}>Sign Up</Button>
                  </>
                )}
              </Box>
            </Toolbar>
          </AppBar>
          <Container maxWidth="lg" sx={{ py: 4 }}>
            <FlashClient />
            {children}
          </Container>
        </ThemeRegistry>
      </body>
    </html>
  )
}
