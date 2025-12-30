import { useEffect, useState } from 'react'
import { theme } from 'antd'

type ThemeType = 'light' | 'dark'

export function useTheme() {
  const [themeType, setThemeType] = useState<ThemeType>('light')
  const [mounted, setMounted] = useState(false)

  // Carrega o tema do localStorage na montagem
  useEffect(() => {
    const savedTheme = (localStorage.getItem('theme') as ThemeType) || 'light'
    setThemeType(savedTheme)
    applyTheme(savedTheme)
    setMounted(true)
  }, [])

  // Aplica o tema no documento
  const applyTheme = (newTheme: ThemeType) => {
    if (typeof document !== 'undefined') {
      const htmlElement = document.documentElement
      if (newTheme === 'dark') {
        htmlElement.setAttribute('data-theme', 'dark')
        document.body.style.backgroundColor = '#141414'
        document.body.style.color = '#e6e6e6'
      } else {
        htmlElement.setAttribute('data-theme', 'light')
        document.body.style.backgroundColor = '#ffffff'
        document.body.style.color = '#000000'
      }
    }
  }

  const toggleTheme = () => {
    const newTheme: ThemeType = themeType === 'light' ? 'dark' : 'light'
    setThemeType(newTheme)
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  }

  const getThemeConfig = () => {
    return {
      token: {
        colorBgBase: themeType === 'dark' ? '#141414' : '#ffffff',
        colorTextBase: themeType === 'dark' ? '#e6e6e6' : '#000000',
      },
      algorithm: themeType === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
    }
  }

  return {
    themeType,
    toggleTheme,
    getThemeConfig,
    mounted,
  }
}
