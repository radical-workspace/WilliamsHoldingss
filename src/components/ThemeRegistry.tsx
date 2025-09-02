"use client"
import * as React from 'react'
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0ea5a5' }, // teal-ish to match branding
  },
  shape: { borderRadius: 10 },
})

function createEmotionCache() {
  return createCache({ key: 'mui', prepend: true })
}

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const [cache] = React.useState(createEmotionCache)
  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  )
}
