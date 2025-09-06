"use client"
import * as React from 'react'
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'

export type Mode = 'light' | 'dark'

export const ThemeModeContext = React.createContext<{
  mode: Mode
  toggle: () => void
} | null>(null)

function createEmotionCache() {
  return createCache({ key: 'mui', prepend: true })
}

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const [cache] = React.useState(createEmotionCache)
  const [mode, setMode] = React.useState<Mode>('light')

  // Initialize mode from storage or system pref
  React.useEffect(() => {
    try {
      const saved = (typeof window !== 'undefined' ? localStorage.getItem('palette-mode') : null) as Mode | null
      if (saved === 'light' || saved === 'dark') {
        setMode(saved)
        return
      }
      const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      setMode(prefersDark ? 'dark' : 'light')
    } catch {
      // ignore
    }
  }, [])

  const toggle = React.useCallback(() => {
    setMode((m) => {
      const next = m === 'light' ? 'dark' : 'light'
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('palette-mode', next)
          document.cookie = `paletteMode=${next}; path=/; max-age=31536000`
        }
      } catch {}
      return next
    })
  }, [])

  const theme = React.useMemo(() => createTheme({
    palette: {
      mode,
      primary: { main: '#0ea5a5' },
    },
    shape: { borderRadius: 10 },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
    },
  }), [mode])

  return (
    <CacheProvider value={cache}>
      <ThemeModeContext.Provider value={{ mode, toggle }}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </ThemeModeContext.Provider>
    </CacheProvider>
  )
}
