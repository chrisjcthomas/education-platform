'use client'

import { useEffect } from 'react'
import { setupStoreSync } from '@/lib/stores'

interface StoreProviderProps {
  children: React.ReactNode
}

export function StoreProvider({ children }: StoreProviderProps) {
  useEffect(() => {
    // Initialize store synchronization
    setupStoreSync()
    
    // Initialize theme from stored preferences
    const initializeTheme = () => {
      if (typeof window !== 'undefined') {
        // Check for stored theme preference
        const stored = localStorage.getItem('ui-preferences')
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            if (parsed.state?.theme) {
              document.documentElement.classList.toggle('dark', parsed.state.theme === 'dark')
            }
          } catch (error) {
            console.warn('Failed to parse stored theme preference:', error)
          }
        }
        
        // Fallback to system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (!stored) {
          document.documentElement.classList.toggle('dark', prefersDark)
        }
      }
    }
    
    initializeTheme()
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleThemeChange = (e: MediaQueryListEvent) => {
      // Only auto-update if user hasn't set a preference
      const stored = localStorage.getItem('ui-preferences')
      if (!stored) {
        document.documentElement.classList.toggle('dark', e.matches)
      }
    }
    
    mediaQuery.addEventListener('change', handleThemeChange)
    
    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange)
    }
  }, [])

  return <>{children}</>
}