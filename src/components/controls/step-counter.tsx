'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface StepCounterProps {
  currentStep: number
  totalSteps: number
  className?: string
  showLabel?: boolean
}

export function StepCounter({ 
  currentStep, 
  totalSteps, 
  className,
  showLabel = false
}: StepCounterProps) {
  const displayCurrentStep = totalSteps > 0 ? currentStep + 1 : 0
  const hasSteps = totalSteps > 0

  if (!hasSteps) {
    return (
      <div className={cn('text-muted-foreground', className)}>
        {showLabel && <span className="mr-1">Step:</span>}
        <span>-/-</span>
      </div>
    )
  }

  return (
    <div 
      className={cn('text-muted-foreground', className)}
      role="status"
      aria-label={`Step ${displayCurrentStep} of ${totalSteps}`}
    >
      {showLabel && <span className="mr-1">Step:</span>}
      <span className="font-mono">
        {displayCurrentStep}/{totalSteps}
      </span>
    </div>
  )
}