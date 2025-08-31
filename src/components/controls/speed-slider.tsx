'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Gauge } from 'lucide-react'

interface SpeedSliderProps {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
  compact?: boolean
  className?: string
}

export function SpeedSlider({ 
  value, 
  onChange, 
  disabled = false,
  compact = false,
  className 
}: SpeedSliderProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(event.target.value)
    onChange(newValue)
  }

  const getSpeedLabel = (speed: number): string => {
    if (speed <= 0.25) return 'Very Slow'
    if (speed <= 0.5) return 'Slow'
    if (speed <= 1) return 'Normal'
    if (speed <= 2) return 'Fast'
    if (speed <= 3) return 'Very Fast'
    return 'Maximum'
  }

  const speedLabel = getSpeedLabel(value)

  return (
    <div 
      className={cn(
        'flex items-center gap-2',
        compact && 'gap-1',
        className
      )}
    >
      <Gauge 
        className={cn(
          'h-4 w-4 text-muted-foreground',
          compact && 'h-3 w-3'
        )} 
        aria-hidden="true"
      />
      
      <div className="flex items-center gap-2 min-w-0">
        <input
          type="range"
          min="0.1"
          max="5"
          step="0.1"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={cn(
            'flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4',
            '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary',
            '[&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-sm',
            '[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full',
            '[&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:cursor-pointer',
            '[&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:shadow-sm',
            compact ? 'w-16' : 'w-24'
          )}
          aria-label={`Animation speed: ${speedLabel}`}
          aria-valuemin={0.1}
          aria-valuemax={5}
          aria-valuenow={value}
          aria-valuetext={`${value.toFixed(1)}x speed - ${speedLabel}`}
        />
        
        {!compact && (
          <span 
            className="text-xs text-muted-foreground whitespace-nowrap min-w-[3rem] text-right"
            aria-live="polite"
          >
            {value.toFixed(1)}x
          </span>
        )}
      </div>

      {/* Speed indicator tooltip for compact mode */}
      {compact && (
        <span className="sr-only" aria-live="polite">
          Speed: {value.toFixed(1)}x - {speedLabel}
        </span>
      )}
    </div>
  )
}