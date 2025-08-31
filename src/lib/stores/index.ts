import { useUIStore } from './ui-store'
import { usePerformanceStore } from './performance-store'
import { useAlgorithmStore } from './algorithm-store'

// Export individual stores
export { useAlgorithmStore } from './algorithm-store'
export { useUIStore } from './ui-store'
export { usePerformanceStore } from './performance-store'
export { useBigOStore } from './big-o-store'

// Export services and engines
export { algorithmEngine } from '../engines/algorithm-execution-engine'
export { algorithmSyncService } from '../services/algorithm-sync-service'

// Combined store hook for components that need multiple stores
export const useAppStore = () => {
  const algorithm = useAlgorithmStore()
  const ui = useUIStore()
  const performance = usePerformanceStore()

  return {
    algorithm,
    ui,
    performance
  }
}

// Store synchronization utilities
export const setupStoreSync = () => {
  // Sync animation speed between UI preferences and algorithm execution
  useUIStore.subscribe(
    (state) => state.preferences.animationSpeed,
    (animationSpeed) => {
      useAlgorithmStore.getState().setSpeed(animationSpeed)
    }
  )

  // Sync performance state with UI reduced motion preference
  usePerformanceStore.subscribe(
    (state) => state.shouldUseFallback(),
    (shouldUseFallback) => {
      if (shouldUseFallback) {
        useUIStore.getState().updatePreferences({ reducedMotion: true })
      }
    }
  )

  // Auto-pause algorithm when performance is too low
  usePerformanceStore.subscribe(
    (state) => state.getPerformanceLevel(),
    (performanceLevel) => {
      if (performanceLevel === 'low') {
        const algorithmState = useAlgorithmStore.getState()
        if (algorithmState.isRunning) {
          algorithmState.pause()
          console.warn('Algorithm paused due to low performance')
        }
      }
    }
  )

  // Start performance monitoring when algorithm starts
  useAlgorithmStore.subscribe(
    (state) => state.isRunning,
    (isRunning) => {
      const performanceStore = usePerformanceStore.getState()
      if (isRunning) {
        performanceStore.startPerformanceMonitoring()
      } else {
        performanceStore.stopPerformanceMonitoring()
      }
    }
  )
}

// Utility hooks for common store combinations
export const useAlgorithmControls = () => {
  const { play, pause, reset, nextStep, previousStep, setSpeed } = useAlgorithmStore()
  const { getEffectiveAnimationSpeed } = useUIStore()
  
  return {
    play,
    pause,
    reset,
    nextStep,
    previousStep,
    setSpeed,
    getEffectiveSpeed: getEffectiveAnimationSpeed
  }
}

export const useVisualizationState = () => {
  const { 
    data, 
    currentStep, 
    getCurrentStepData, 
    pointers, 
    isRunning 
  } = useAlgorithmStore()
  
  const { shouldReduceMotion, getEffectiveAnimationSpeed } = useUIStore()
  const { getOptimalAnimationSettings } = usePerformanceStore()
  
  return {
    data,
    currentStep,
    currentStepData: getCurrentStepData(),
    pointers,
    isRunning,
    shouldReduceMotion: shouldReduceMotion(),
    animationSpeed: getEffectiveAnimationSpeed(),
    animationSettings: getOptimalAnimationSettings()
  }
}

export const useLearningMode = () => {
  const { learningMode, setLearningMode } = useUIStore()
  
  const getVisibleFeatures = () => {
    switch (learningMode) {
      case 'beginner':
        return {
          showCode: false,
          showTechnicalDetails: false,
          showBigOAnalysis: false,
          showAnalogies: true,
          showBasicControls: true
        }
      case 'curious':
        return {
          showCode: true,
          showTechnicalDetails: false,
          showBigOAnalysis: true,
          showAnalogies: true,
          showBasicControls: true
        }
      case 'details':
        return {
          showCode: true,
          showTechnicalDetails: true,
          showBigOAnalysis: true,
          showAnalogies: false,
          showBasicControls: true
        }
    }
  }
  
  return {
    learningMode,
    setLearningMode,
    visibleFeatures: getVisibleFeatures()
  }
}