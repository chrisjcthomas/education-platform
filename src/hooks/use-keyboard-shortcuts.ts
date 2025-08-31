'use client'

import { useEffect, useCallback } from 'react'

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  metaKey?: boolean
  action: () => void
  description: string
  preventDefault?: boolean
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean
  target?: HTMLElement | Document | null
}

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutsOptions = {}
) {
  const { enabled = true, target = document } = options

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      // Don't trigger shortcuts when user is typing in input fields
      const activeElement = document.activeElement
      if (
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          (activeElement as HTMLElement).contentEditable === 'true')
      ) {
        return
      }

      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
        const ctrlMatches = !!shortcut.ctrlKey === event.ctrlKey
        const altMatches = !!shortcut.altKey === event.altKey
        const shiftMatches = !!shortcut.shiftKey === event.shiftKey
        const metaMatches = !!shortcut.metaKey === event.metaKey

        if (keyMatches && ctrlMatches && altMatches && shiftMatches && metaMatches) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault()
          }
          shortcut.action()
          break
        }
      }
    },
    [shortcuts, enabled]
  )

  useEffect(() => {
    if (!target || !enabled) return

    target.addEventListener('keydown', handleKeyDown as EventListener)

    return () => {
      target.removeEventListener('keydown', handleKeyDown as EventListener)
    }
  }, [target, enabled, handleKeyDown])

  return {
    shortcuts: shortcuts.map(({ action, ...shortcut }) => shortcut)
  }
}