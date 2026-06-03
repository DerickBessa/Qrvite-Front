import { useState, useEffect } from 'react'

const STORAGE_KEY = 'qrvite-theme'

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    // 1. Preferência salva pelo usuário
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'dark' || saved === 'light') return saved
    // 2. Preferência do sistema operacional
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark'
    return 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  return { theme, toggle, isDark: theme === 'dark' }
}
