import { useEffect, useState } from 'react'
import { applyTheme, getInitialTheme, toggleTheme } from '../theme'

export default function ThemeToggle() {
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    const t = getInitialTheme()
    setTheme(t)
    applyTheme(t)
  }, [])

  const onToggle = () => {
    const next = toggleTheme()
    setTheme(next)
  }

  return (
    <button className="btn" onClick={onToggle} aria-label="Toggle theme">
      {theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
    </button>
  )
}

