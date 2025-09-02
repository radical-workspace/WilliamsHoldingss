import Image from 'next/image'
import BrandLogo from '@/components/BrandLogo'
import { Box, Typography, Paper } from '@mui/material'

export default function Home() {
  return (
    <Paper elevation={0} sx={{ p: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.04)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
  <BrandLogo width={72} height={72} rounded={12} />
        <Typography variant="h4" sx={{ fontWeight: 700 }}>WilliamsHoldings Banking</Typography>
      </Box>
      <Typography color="text.secondary">Welcome.</Typography>
    </Paper>
  )
}
