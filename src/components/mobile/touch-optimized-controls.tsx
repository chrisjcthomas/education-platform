'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { usePerformanceAdaptation } from '../../hooks/use-enhanced-performance'

interface TouchOptimizedControlsProps {
  isPlaying: boolean
  canStep: boolean
  canReset: boolean
  speed: number
  currentStep: number
  totalSteps: number
  onPlay: () => void
  onPause: () => void
  onStep: () => void
  onReset: () => void
  onSpeedChange: (speed: number) => void
  className?: string
}

export function TouchOptimizedControls({
  isPlaying,
  canStep,
  canReset,
  speed,
  currentStep,
  totalSteps,
  onPlay,
  onPause,
  onStep,
  onReset,
  onSpeedChange,
  className = ''
}: TouchOptimizedControlsProps) {
  const { isMobile, getAnimationConfig } = usePerformanceAdaptation()
  const [isSpeedSliderVisible, setIsSpeedSliderVisible] = useState(false)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchStartY, setTouchStartY] = useState<number | null>(null)
  const speedSliderRef = useRef<HTMLDivElement>(null)

  // Touch gesture handling for speed control
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    setTouchStartX(touch.clientX)
    setTouchStartY(touch.clientY)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartX || !touchStartY) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - touchStartX
    const deltaY = touch.clientY - touchStartY

    // Horizontal swipe for speed control (only if speed slider is visible)
    if (isSpeedSliderVisible && Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 20) {
      e.preventDefault()
      const speedDelta = deltaX > 0 ? 0.1 : -0.1
      const newSpeed = Math.max(0.1, Math.min(3, speed + speedDelta))
      onSpeedChange(newSpeed)
    }
  }, [touchStartX, touchStartY, isSpeedSliderVisible, speed, onSpeedChange])

  const handleTouchEnd = useCallback(() => {
    setTouchStartX(null)
    setTouchStartY(null)
  }, [])

  // Close speed slider when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (speedSliderRef.current && !speedSliderRef.current.contains(event.target as Node)) {
        setIsSpeedSliderVisible(false)
      }
    }

    if (isSpeedSliderVisible) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isSpeedSliderVisible])

  // Button size based on device type
  const buttonSize = isMobile ? 'lg' : 'default'
  const buttonClass = isMobile 
    ? 'min-h-[48px] min-w-[48px] text-lg' // 48px minimum touch target
    : 'min-h-[40px] min-w-[40px]'

  const speedPresets = [0.25, 0.5, 1, 1.5, 2, 3]

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        {/* Main Controls */}
        <div className="flex justify-center items-center gap-3">
          {/* Play/Pause Button */}
          <Button
            onClick={isPlaying ? onPause : onPlay}
            size={buttonSize}
            className={`${buttonClass} ${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
            aria-label={isPlaying ? 'Pause algorithm' : 'Play algorithm'}
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </Button>

          {/* Step Button */}
          <Button
            onClick={onStep}
            disabled={!canStep || isPlaying}
            size={buttonSize}
            variant="outline"
            className={buttonClass}
            aria-label="Step forward one operation"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Button>

          {/* Reset Button */}
          <Button
            onClick={onReset}
            disabled={!canReset}
            size={buttonSize}
            variant="outline"
            className={buttonClass}
            aria-label="Reset algorithm to beginning"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </Button>

          {/* Speed Control Toggle */}
          <Button
            onClick={() => setIsSpeedSliderVisible(!isSpeedSliderVisible)}
            size={buttonSize}
            variant="outline"
            className={buttonClass}
            aria-label="Toggle speed controls"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
          </Button>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between text-sm">
          <Badge variant="outline" className="text-xs">
            Step {currentStep} of {totalSteps}
          </Badge>
          <div className="flex-1 mx-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0}%` }}
              />
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {speed}x
          </Badge>
        </div>

        {/* Speed Controls (Collapsible) */}
        {isSpeedSliderVisible && (
          <div
            ref={speedSliderRef}
            className="space-y-3 p-3 bg-gray-50 rounded-lg"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="text-sm font-medium text-center">
              Speed: {speed}x
              {isMobile && (
                <div className="text-xs text-gray-500 mt-1">
                  Swipe left/right to adjust
                </div>
              )}
            </div>

            {/* Speed Presets for Mobile */}
            {isMobile ? (
              <div className="grid grid-cols-3 gap-2">
                {speedPresets.map((preset) => (
                  <Button
                    key={preset}
                    onClick={() => onSpeedChange(preset)}
                    size="sm"
                    variant={speed === preset ? 'default' : 'outline'}
                    className="min-h-[40px] text-sm"
                  >
                    {preset}x
                  </Button>
                ))}
              </div>
            ) : (
              /* Traditional Slider for Desktop */
              <div className="space-y-2">
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={speed}
                  onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0.1x</span>
                  <span>1x</span>
                  <span>3x</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Touch Instructions for Mobile */}
        {isMobile && (
          <div className="text-xs text-gray-500 text-center space-y-1">
            <div>Tap controls to interact</div>
            <div>Double-tap play button for quick pause/resume</div>
          </div>
        )}
      </div>
    </Card>
  )
}

// Hook for double-tap detection
export function useDoubleTap(callback: () => void, delay = 300) {
  const [lastTap, setLastTap] = useState<number>(0)

  const handleTap = useCallback(() => {
    const now = Date.now()
    if (now - lastTap < delay) {
      callback()
      setLastTap(0) // Reset to prevent triple-tap
    } else {
      setLastTap(now)
    }
  }, [lastTap, delay, callback])

  return handleTap
}