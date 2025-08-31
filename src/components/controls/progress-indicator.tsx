'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface ProgressIndicatorProps {
  progress: number // 0 to 1
  className?: string
  showPercentage?: boolean
  animated?: boolean
}

export function ProgressIndicator({ 
  progress, 
  className,
  showPercentage = false,
  animated = true
}: ProgressIndicatorProps) {
  const percentage = Math.round(progress * 100)
  const clampedProgress = Math.max(0, Math.min(1, progress))

  return (
    <div 
      className={cn('flex items-center gap-2', className)}
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Algorithm progress: ${percentage}%`}
    >
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full bg-primary rounded-full',
            animated && 'transition-all duration-300 ease-out'
          )}
          style={{ 
            width: `${clampedProgress * 100}%`,
            transform: `translateX(${clampedProgress === 0 ? '-100%' : '0%'})`
          }}
        />
      </div>
      
      {showPercentage && (
        <span 
          className="text-xs text-muted-foreground whitespace-nowrap min-w-[2.5rem] text-right"
          aria-hidden="true"
        >
          {percentage}%
        </span>
      )}
    </div>
  )
}