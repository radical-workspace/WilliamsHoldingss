"use client"
import * as React from 'react'
import { Avatar, IconButton, Menu, MenuItem, ListItemIcon, Snackbar, Tooltip } from '@mui/material'
import UploadIcon from '@mui/icons-material/Upload'
import LogoutIcon from '@mui/icons-material/Logout'
import PhotoIcon from '@mui/icons-material/AccountCircle'

type Props = {
  userInitial?: string
  onSignOut?: () => void
}

export default function AvatarMenu({ userInitial = 'U', onSignOut }: Props) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null)
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null)
  const [snack, setSnack] = React.useState<string>('')

  React.useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await fetch('/api/me', { cache: 'no-store' })
        if (res.ok) {
          const j = await res.json()
          if (!active) return
          if (j.avatarUrl) setAvatarUrl(j.avatarUrl)
          if (j.email && userInitial === 'U') {
            // If no provided initial, derive from email
            const initial = String(j.email).charAt(0)
            // we can't set prop, but Avatar will still show state url
          }
        } else {
          // fallback to localStorage
          try {
            const saved = localStorage.getItem('avatar-url')
            if (saved) setAvatarUrl(saved)
          } catch {}
        }
      } catch {
        try {
          const saved = localStorage.getItem('avatar-url')
          if (saved) setAvatarUrl(saved)
        } catch {}
      }
    })()
    return () => { active = false }
  }, [])

  const open = Boolean(anchorEl)
  const handleClose = () => setAnchorEl(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    const fd = new FormData()
    fd.append('file', f)
    try {
      const res = await fetch('/api/upload/avatar', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Upload failed')
  setAvatarUrl(data.url)
  try { localStorage.setItem('avatar-url', data.url) } catch {}
      setSnack('Avatar updated')
    } catch (err: any) {
      setSnack(err.message || 'Upload failed')
    } finally {
      e.target.value = ''
      handleClose()
    }
  }

  return (
    <>
      <Tooltip title="Profile">
        <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
          <Avatar alt="Profile" src={avatarUrl || undefined} sx={{ width: 30, height: 30 }}>
            {userInitial.toUpperCase().slice(0, 1)}
          </Avatar>
        </IconButton>
      </Tooltip>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose} keepMounted>
        <MenuItem onClick={() => fileInputRef.current?.click()}>
          <ListItemIcon><UploadIcon fontSize="small" /></ListItemIcon>
          Upload photo
        </MenuItem>
        <MenuItem onClick={() => { setAvatarUrl(null); try { localStorage.removeItem('avatar-url') } catch {} ; handleClose(); setSnack('Avatar removed') }}>
          <ListItemIcon><PhotoIcon fontSize="small" /></ListItemIcon>
          Remove photo
        </MenuItem>
        {onSignOut && (
          <MenuItem onClick={() => { handleClose(); onSignOut() }}>
            <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
            Sign out
          </MenuItem>
        )}
      </Menu>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        style={{ display: 'none' }}
        onChange={onFileChange}
      />
      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack('')} message={snack} />
    </>
  )
}
