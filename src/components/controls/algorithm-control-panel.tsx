'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { SpeedSlider } from './speed-slider'
import { ProgressIndicator } from './progress-indicator'
import { StepCounter } from './step-counter'
import { useAlgorithmStore } from '@/lib/stores/algorithm-store'
import { useUIStore } from '@/lib/stores/ui-store'
import { cn } from '@/lib/utils'
import { 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface AlgorithmControlPanelProps {
  className?: string
  compact?: boolean
}

export function AlgorithmControlPanel({ 
  className, 
  compact = false 
}: AlgorithmControlPanelProps) {
  const {
    isRunning,
    isPaused,
    currentStep,
    totalSteps,
    speed,
    play,
    pause,
    reset,
    nextStep,
    previousStep,
    setSpeed,
    isAtEnd,
    isAtStart,
    getProgress
  } = useAlgorithmStore()

  const { isMobileLayout } = useUIStore()

  const handlePlayPause = () => {
    if (isRunning) {
      pause()
    } else {
      play()
    }
  }

  const handleStep = () => {
    if (!isAtEnd()) {
      nextStep()
    }
  }

  const handlePreviousStep = () => {
    if (!isAtStart()) {
      previousStep()
    }
  }

  const handleReset = () => {
    reset()
  }

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed)
  }

  const progress = getProgress()
  const hasSteps = totalSteps > 0

  return (
    <div 
      className={cn(
        'flex items-center gap-2 p-3 bg-background border rounded-lg shadow-sm',
        compact && 'p-2 gap-1',
        isMobileLayout() && 'flex-wrap justify-center',
        className
      )}
      role="toolbar"
      aria-label="Algorithm execution controls"
    >
      {/* Main control buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size={compact ? "sm" : "default"}
          onClick={handlePlayPause}
          disabled={!hasSteps}
          aria-label={isRunning ? "Pause algorithm" : "Play algorithm"}
          className="min-w-[2.5rem]"
        >
          {isRunning ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        <Button
          variant="outline"
          size={compact ? "sm" : "default"}
          onClick={handlePreviousStep}
          disabled={!hasSteps || isAtStart()}
          aria-label="Previous step"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size={compact ? "sm" : "default"}
          onClick={handleStep}
          disabled={!hasSteps || isAtEnd()}
          aria-label="Next step"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size={compact ? "sm" : "default"}
          onClick={handleReset}
          disabled={!hasSteps}
          aria-label="Reset algorithm"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Progress and step information */}
      {!compact && (
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <ProgressIndicator 
            progress={progress}
            className="flex-1 min-w-[100px]"
          />
          
          <StepCounter 
            currentStep={currentStep}
            totalSteps={totalSteps}
            className="text-sm text-muted-foreground whitespace-nowrap"
          />
        </div>
      )}

      {/* Speed control */}
      <div className={cn(
        "flex items-center gap-2",
        isMobileLayout() && compact && "w-full mt-2"
      )}>
        <SpeedSlider
          value={speed}
          onChange={handleSpeedChange}
          disabled={!hasSteps}
          compact={compact}
        />
      </div>

      {/* Compact mode progress */}
      {compact && hasSteps && (
        <div className="w-full mt-2 flex items-center gap-2">
          <ProgressIndicator 
            progress={progress}
            className="flex-1"
          />
          <StepCounter 
            currentStep={currentStep}
            totalSteps={totalSteps}
            className="text-xs text-muted-foreground"
          />
        </div>
      )}
    </div>
  )
}