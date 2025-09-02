import Image from 'next/image'
import { Box, Typography, Paper } from '@mui/material'

export default function Home() {
  return (
    <Paper elevation={0} sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
  <Image src="/logo-williams-holdings.png" alt="Williams Holdings" width={56} height={56} />
        <Typography variant="h4">WilliamsHoldings Banking</Typography>
      </Box>
    </Paper>
  )
}
