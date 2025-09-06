"use client"
import Link from 'next/link'
import BrandLogo from './BrandLogo'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import ThemeToggle from './ThemeToggle'
import { usePathname } from 'next/navigation'
import AvatarMenu from './AvatarMenu'
import SignOutButton from './SignOutButton'

export default function MainNav({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname() || '/'
  // Hide the main user nav entirely on admin routes; admin has its own header
  if (pathname.startsWith('/admin')) return null

  return (
    <AppBar position="static" color="default" elevation={0}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
          <Link href="/" style={{ display: 'inline-flex' }}>
            <BrandLogo width={36} height={36} />
          </Link>
          <Typography variant="h6">
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              WilliamsHoldings Banking
            </Link>
          </Typography>
        </Box>
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {userEmail ? (
            <>
      <Button href="/deposits" component={Link as any} variant="outlined" color="info">Deposits</Button>
      <Button href="/deposits/new" component={Link as any} variant="contained" color="success">New Deposit</Button>
      <Button href="/withdrawals" component={Link as any} variant="outlined" color="info">Withdrawals</Button>
      <Button href="/withdrawals/new" component={Link as any} variant="contained" color="warning">New Withdrawal</Button>
  <Button href="/dashboard" component={Link as any} variant="text">Dashboard</Button>
  <SignOutButton />
            </>
          ) : (
            <>
              <Button href="/login" component={Link as any}>Login</Button>
              <Button href="/register" component={Link as any}>Sign Up</Button>
            </>
          )}
          <ThemeToggle />
          <AvatarMenu />
        </Box>
      </Toolbar>
    </AppBar>
  )
}
