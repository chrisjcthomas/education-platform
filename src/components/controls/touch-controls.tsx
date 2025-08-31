'use client'

import React, { useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { useAlgorithmStore } from '@/lib/stores/algorithm-store'
import { useUIStore } from '@/lib/stores/ui-store'
import { cn } from '@/lib/utils'
import { 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX
} from 'lucide-react'

interface TouchControlsProps {
  className?: string
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onDoubleTap?: () => void
}

export function TouchControls({ 
  className,
  onSwipeLeft,
  onSwipeRight,
  onDoubleTap
}: TouchControlsProps) {
  const {
    isRunning,
    currentStep,
    totalSteps,
    play,
    pause,
    reset,
    nextStep,
    previousStep,
    isAtEnd,
    isAtStart
  } = useAlgorithmStore()

  const { preferences, updatePreferences } = useUIStore()
  
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const lastTapRef = useRef<number>(0)

  const handlePlayPause = () => {
    if (isRunning) {
      pause()
    } else {
      play()
    }
  }

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    const touch = event.touches[0]
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    }
  }, [])

  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    if (!touchStartRef.current) return

    const touch = event.changedTouches[0]
    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = touch.clientY - touchStartRef.current.y
    const deltaTime = Date.now() - touchStartRef.current.time

    // Detect swipe gestures
    const minSwipeDistance = 50
    const maxSwipeTime = 300
    const maxVerticalDistance = 100

    if (
      Math.abs(deltaX) > minSwipeDistance &&
      Math.abs(deltaY) < maxVerticalDistance &&
      deltaTime < maxSwipeTime
    ) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight()
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft()
      }
    }

    // Detect double tap
    const now = Date.now()
    const timeSinceLastTap = now - lastTapRef.current
    
    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      if (onDoubleTap) {
        onDoubleTap()
      }
    }
    
    lastTapRef.current = now
    touchStartRef.current = null
  }, [onSwipeLeft, onSwipeRight, onDoubleTap])

  const toggleSound = () => {
    updatePreferences({ soundEnabled: !preferences.soundEnabled })
  }

  const hasSteps = totalSteps > 0

  return (
    <div 
      className={cn(
        'flex flex-col items-center gap-4 p-4 bg-background border rounded-lg shadow-sm',
        'touch-manipulation select-none',
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="toolbar"
      aria-label="Touch-friendly algorithm controls"
    >
      {/* Main control buttons - larger for touch */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={handlePlayPause}
          disabled={!hasSteps}
          aria-label={isRunning ? "Pause algorithm" : "Play algorithm"}
          className="min-w-[3.5rem] min-h-[3.5rem] touch-manipulation"
        >
          {isRunning ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6" />
          )}
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={reset}
          disabled={!hasSteps}
          aria-label="Reset algorithm"
          className="min-w-[3.5rem] min-h-[3.5rem] touch-manipulation"
        >
          <RotateCcw className="h-6 w-6" />
        </Button>
      </div>

      {/* Step navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="lg"
          onClick={previousStep}
          disabled={!hasSteps || isAtStart()}
          aria-label="Previous step"
          className="min-w-[3rem] min-h-[3rem] touch-manipulation"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="px-4 py-2 text-center min-w-[4rem]">
          <div className="text-sm font-medium">
            {hasSteps ? `${currentStep + 1}/${totalSteps}` : '-/-'}
          </div>
          <div className="text-xs text-muted-foreground">Step</div>
        </div>

        <Button
          variant="outline"
          size="lg"
          onClick={nextStep}
          disabled={!hasSteps || isAtEnd()}
          aria-label="Next step"
          className="min-w-[3rem] min-h-[3rem] touch-manipulation"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Additional controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSound}
          aria-label={preferences.soundEnabled ? "Disable sound" : "Enable sound"}
          className="min-w-[2.5rem] min-h-[2.5rem] touch-manipulation"
        >
          {preferences.soundEnabled ? (
            <Volume2 className="h-4 w-4" />
          ) : (
            <VolumeX className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Touch gesture hints */}
      <div className="text-xs text-muted-foreground text-center space-y-1">
        <div>Swipe left/right to navigate steps</div>
        <div>Double tap to play/pause</div>
      </div>
    </div>
  )
}