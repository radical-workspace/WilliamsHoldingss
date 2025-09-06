"use client"
import * as React from 'react'
import { IconButton, Tooltip } from '@mui/material'
import DarkIcon from '@mui/icons-material/Brightness4'
import LightIcon from '@mui/icons-material/Brightness7'
import { ThemeModeContext } from './ThemeRegistry'

export default function ThemeToggle() {
  const ctx = React.useContext(ThemeModeContext)
  if (!ctx) return null
  const { mode, toggle } = ctx
  const isDark = mode === 'dark'
  return (
    <Tooltip title={isDark ? 'Switch to light' : 'Switch to dark'}>
      <IconButton color="inherit" onClick={toggle} aria-label="toggle color mode" size="small">
        {isDark ? <LightIcon fontSize="small" /> : <DarkIcon fontSize="small" />}
      </IconButton>
    </Tooltip>
  )
}
