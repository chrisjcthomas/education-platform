'use client'

import { useCallback, useEffect, useState } from 'react'
import { algorithmSyncService } from '@/lib/services/algorithm-sync-service'
import { useAlgorithmStore } from '@/lib/stores/algorithm-store'
import { usePerformanceStore } from '@/lib/stores/performance-store'
import { useUIStore } from '@/lib/stores/ui-store'
import { AlgorithmStep } from '@/lib/types'

export interface UseAlgorithmExecutionReturn {
  // Execution control
  executeAlgorithm: (algorithmName: string, data: number[], target?: number) => Promise<void>
  pauseExecution: () => void
  resumeExecution: () => void
  stopExecution: () => void
  resetExecution: () => void
  
  // Step control
  nextStep: () => void
  previousStep: () => void
  goToStep: (stepIndex: number) => void
  
  // Speed control
  setSpeed: (speed: number) => void
  
  // Replay functionality
  replayExecution: () => Promise<void>
  
  // State
  isExecuting: boolean
  isRunning: boolean
  isPaused: boolean
  currentStep: number
  totalSteps: number
  progress: number
  isAtEnd: boolean
  isAtStart: boolean
  
  // Data
  algorithmType: string
  data: number[]
  target?: number
  currentStepData: AlgorithmStep | null
  executionHistory: AlgorithmStep[]
  pointers: { left?: number; right?: number; mid?: number }
  
  // Performance
  performanceMetrics: {
    fps: number
    isLowPerformance: boolean
    shouldUseFallback: boolean
  }
  
  // Available algorithms
  availableAlgorithms: string[]
  getAlgorithmInfo: (name: string) => unknown
  
  // Comparison
  compareAlgorithms: (algorithms: string[], data: number[], target?: number) => Promise<unknown>
  
  // Error handling
  error: string | null
  clearError: () => void
}

export function useAlgorithmExecution(): UseAlgorithmExecutionReturn {
  const [error, setError] = useState<string | null>(null)
  
  // Store subscriptions
  const algorithmState = useAlgorithmStore()
  const performanceState = usePerformanceStore()

  // Clear error when algorithm changes
  useEffect(() => {
    setError(null)
  }, [algorithmState.type])

  // Execution control functions
  const executeAlgorithm = useCallback(async (
    algorithmName: string,
    data: number[],
    target?: number
  ) => {
    try {
      setError(null)
      await algorithmSyncService.executeAlgorithm(algorithmName, data, target)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      throw err
    }
  }, [])

  const pauseExecution = useCallback(() => {
    algorithmSyncService.pauseExecution()
  }, [])

  const resumeExecution = useCallback(() => {
    algorithmSyncService.resumeExecution()
  }, [])

  const stopExecution = useCallback(() => {
    algorithmSyncService.stopExecution()
    setError(null)
  }, [])

  const resetExecution = useCallback(() => {
    algorithmSyncService.resetExecution()
    setError(null)
  }, [])

  // Step control functions
  const nextStep = useCallback(() => {
    algorithmSyncService.nextStep()
  }, [])

  const previousStep = useCallback(() => {
    algorithmSyncService.previousStep()
  }, [])

  const goToStep = useCallback((stepIndex: number) => {
    algorithmSyncService.goToStep(stepIndex)
  }, [])

  // Speed control
  const setSpeed = useCallback((speed: number) => {
    algorithmSyncService.setExecutionSpeed(speed)
  }, [])

  // Replay functionality
  const replayExecution = useCallback(async () => {
    try {
      setError(null)
      await algorithmSyncService.replayExecution()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Replay failed'
      setError(errorMessage)
      throw err
    }
  }, [])

  // Algorithm comparison
  const compareAlgorithms = useCallback(async (
    algorithms: string[],
    data: number[],
    target?: number
  ) => {
    try {
      setError(null)
      return await algorithmSyncService.compareAlgorithms(algorithms, data, target)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Comparison failed'
      setError(errorMessage)
      throw err
    }
  }, [])

  // Error handling
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Get algorithm info
  const getAlgorithmInfo = useCallback((name: string) => {
    return algorithmSyncService.getAlgorithmInfo(name)
  }, [])

  return {
    // Execution control
    executeAlgorithm,
    pauseExecution,
    resumeExecution,
    stopExecution,
    resetExecution,
    
    // Step control
    nextStep,
    previousStep,
    goToStep,
    
    // Speed control
    setSpeed,
    
    // Replay functionality
    replayExecution,
    
    // State
    isExecuting: algorithmSyncService.isExecuting,
    isRunning: algorithmState.isRunning,
    isPaused: algorithmState.isPaused,
    currentStep: algorithmState.currentStep,
    totalSteps: algorithmState.totalSteps,
    progress: algorithmState.getProgress(),
    isAtEnd: algorithmState.isAtEnd(),
    isAtStart: algorithmState.isAtStart(),
    
    // Data
    algorithmType: algorithmState.type,
    data: algorithmState.data,
    target: algorithmState.target,
    currentStepData: algorithmState.getCurrentStepData(),
    executionHistory: algorithmState.executionHistory,
    pointers: algorithmState.pointers || {},
    
    // Performance
    performanceMetrics: {
      fps: performanceState.fps,
      isLowPerformance: performanceState.isLowPerformance,
      shouldUseFallback: performanceState.shouldUseFallback()
    },
    
    // Available algorithms
    availableAlgorithms: algorithmSyncService.getAvailableAlgorithms(),
    getAlgorithmInfo,
    
    // Comparison
    compareAlgorithms,
    
    // Error handling
    error,
    clearError
  }
}

// Specialized hook for visualization components
export function useVisualizationExecution() {
  const {
    data,
    currentStepData,
    pointers,
    isRunning,
    currentStep,
    totalSteps,
    progress
  } = useAlgorithmExecution()

  const { shouldReduceMotion, getEffectiveAnimationSpeed } = useUIStore()
  const { getOptimalAnimationSettings } = usePerformanceStore()

  return {
    data,
    currentStepData,
    pointers,
    isRunning,
    currentStep,
    totalSteps,
    progress,
    shouldReduceMotion: shouldReduceMotion(),
    animationSpeed: getEffectiveAnimationSpeed(),
    animationSettings: getOptimalAnimationSettings()
  }
}

// Specialized hook for control components
export function useAlgorithmControls() {
  const {
    executeAlgorithm,
    pauseExecution,
    resumeExecution,
    stopExecution,
    resetExecution,
    nextStep,
    previousStep,
    setSpeed,
    replayExecution,
    isRunning,
    isPaused,
    isAtEnd,
    isAtStart,
    progress,
    error,
    clearError
  } = useAlgorithmExecution()

  const { speed } = useAlgorithmStore()

  return {
    // Control actions
    executeAlgorithm,
    pause: pauseExecution,
    resume: resumeExecution,
    stop: stopExecution,
    reset: resetExecution,
    nextStep,
    previousStep,
    setSpeed,
    replay: replayExecution,
    
    // State
    isRunning,
    isPaused,
    isAtEnd,
    isAtStart,
    progress,
    speed,
    
    // Error handling
    error,
    clearError,
    
    // Computed states
    canPlay: !isRunning && !isAtEnd,
    canPause: isRunning,
    canStep: !isRunning,
    canReset: progress > 0 || isAtEnd
  }
}