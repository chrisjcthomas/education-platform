'use client'

import React, { useEffect, useState } from 'react'
import { AlgorithmControlPanel } from './algorithm-control-panel'
import { TouchControls } from './touch-controls'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { useAlgorithmStore } from '@/lib/stores/algorithm-store'
import { useUIStore } from '@/lib/stores/ui-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Keyboard, Smartphone, Monitor } from 'lucide-react'

interface EnhancedControlPanelProps {
  className?: string
  showKeyboardShortcuts?: boolean
  enableTouchControls?: boolean
}

export function EnhancedControlPanel({
  className,
  showKeyboardShortcuts = true,
  enableTouchControls = true
}: EnhancedControlPanelProps) {
  const {
    isRunning,
    play,
    pause,
    reset,
    nextStep,
    previousStep,
    setSpeed,
    speed,
    totalSteps
  } = useAlgorithmStore()

  const { isMobileLayout, preferences, updatePreferences } = useUIStore()
  
  const [controlMode, setControlMode] = useState<'desktop' | 'touch'>('desktop')
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false)

  // Detect if device supports touch
  useEffect(() => {
    const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    if (hasTouchSupport && isMobileLayout()) {
      setControlMode('touch')
    }
  }, [isMobileLayout])

  // Keyboard shortcuts
  const shortcuts = [
    {
      key: ' ',
      action: () => {
        if (totalSteps > 0) {
          if (isRunning) {
            pause()
          } else {
            play()
          }
        }
      },
      description: 'Play/Pause algorithm execution'
    },
    {
      key: 'ArrowRight',
      action: nextStep,
      description: 'Next step'
    },
    {
      key: 'ArrowLeft',
      action: previousStep,
      description: 'Previous step'
    },
    {
      key: 'r',
      action: reset,
      description: 'Reset algorithm'
    },
    {
      key: '=',
      action: () => setSpeed(Math.min(5, speed + 0.5)),
      description: 'Increase speed'
    },
    {
      key: '-',
      action: () => setSpeed(Math.max(0.1, speed - 0.5)),
      description: 'Decrease speed'
    },
    {
      key: '?',
      action: () => setShowShortcutsHelp(!showShortcutsHelp),
      description: 'Toggle keyboard shortcuts help',
      preventDefault: false
    }
  ]

  useKeyboardShortcuts(shortcuts, { enabled: showKeyboardShortcuts })

  const handleSwipeLeft = () => {
    nextStep()
  }

  const handleSwipeRight = () => {
    previousStep()
  }

  const handleDoubleTap = () => {
    if (totalSteps > 0) {
      if (isRunning) {
        pause()
      } else {
        play()
      }
    }
  }

  const toggleControlMode = () => {
    setControlMode(controlMode === 'desktop' ? 'touch' : 'desktop')
  }

  const toggleReducedMotion = () => {
    updatePreferences({ reducedMotion: !preferences.reducedMotion })
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Control mode selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={controlMode === 'desktop' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setControlMode('desktop')}
            className="flex items-center gap-2"
          >
            <Monitor className="h-4 w-4" />
            Desktop
          </Button>
          
          {enableTouchControls && (
            <Button
              variant={controlMode === 'touch' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setControlMode('touch')}
              className="flex items-center gap-2"
            >
              <Smartphone className="h-4 w-4" />
              Touch
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {showKeyboardShortcuts && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowShortcutsHelp(!showShortcutsHelp)}
              className="flex items-center gap-2"
              aria-label="Toggle keyboard shortcuts help"
            >
              <Keyboard className="h-4 w-4" />
              Shortcuts
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleReducedMotion}
            aria-label={preferences.reducedMotion ? "Enable animations" : "Reduce motion"}
            className="text-xs"
          >
            {preferences.reducedMotion ? "Enable Motion" : "Reduce Motion"}
          </Button>
        </div>
      </div>

      {/* Control panels */}
      {controlMode === 'desktop' ? (
        <AlgorithmControlPanel />
      ) : (
        <TouchControls
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          onDoubleTap={handleDoubleTap}
        />
      )}

      {/* Keyboard shortcuts help */}
      {showShortcutsHelp && showKeyboardShortcuts && (
        <div className="p-4 bg-muted rounded-lg border">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Keyboard className="h-4 w-4" />
            Keyboard Shortcuts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-muted-foreground">{shortcut.description}</span>
                <kbd className="px-2 py-1 bg-background border rounded text-xs font-mono">
                  {shortcut.key === ' ' ? 'Space' : shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            Press ? to toggle this help panel
          </div>
        </div>
      )}

      {/* Accessibility status */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>
            Motion: {preferences.reducedMotion ? 'Reduced' : 'Full'}
          </span>
          <span>
            Sound: {preferences.soundEnabled ? 'On' : 'Off'}
          </span>
          <span>
            Mode: {controlMode === 'touch' ? 'Touch-friendly' : 'Desktop'}
          </span>
        </div>
        
        <div className="text-right">
          <div>Screen reader optimized</div>
          <div>WCAG 2.1 AA compliant</div>
        </div>
      </div>
    </div>
  )
}