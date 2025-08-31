'use client'

import { useEffect, useCallback, useState } from 'react'
import { usePerformanceStore } from '../lib/stores/performance-store'
import { 
  enhancedPerformanceMonitor, 
  type EnhancedPerformanceMetrics,
  type PerformanceSettings 
} from '../lib/monitoring/enhanced-performance-monitor'

export interface UseEnhancedPerformanceReturn {
  metrics: EnhancedPerformanceMetrics | null
  settings: PerformanceSettings
  isMonitoring: boolean
  deviceCapabilities: ReturnType<typeof enhancedPerformanceMonitor.getDeviceCapabilities>
  optimalSettings: ReturnType<typeof enhancedPerformanceMonitor.getOptimalSettings>
  
  // Actions
  startMonitoring: () => void
  stopMonitoring: () => void
  updateSettings: (settings: Partial<PerformanceSettings>) => void
  forceCleanup: () => void
  
  // Computed values
  shouldUseFallback: boolean
  performanceLevel: 'high' | 'medium' | 'low'
  isLowPerformance: boolean
}

export function useEnhancedPerformance(): UseEnhancedPerformanceReturn {
  const performanceStore = usePerformanceStore()
  const [metrics, setMetrics] = useState<EnhancedPerformanceMetrics | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [settings, setSettings] = useState<PerformanceSettings>(
    enhancedPerformanceMonitor.getSettings()
  )

  // Subscribe to enhanced performance monitor updates
  useEffect(() => {
    const unsubscribeMetrics = enhancedPerformanceMonitor.onUpdate((newMetrics) => {
      setMetrics(newMetrics)
      
      // Sync with existing performance store
      performanceStore.updateFPS(newMetrics.fps)
      performanceStore.updateMemoryUsage(newMetrics.memoryUsage)
      performanceStore.updateRenderTime(newMetrics.renderTime)
      
      // Update frame drops
      if (newMetrics.frameDrops > (metrics?.frameDrops || 0)) {
        performanceStore.incrementFrameDrops()
      }
    })

    const unsubscribeFallback = enhancedPerformanceMonitor.onFallback((level) => {
      console.info(`Performance fallback triggered: ${level}`)
      
      // Update performance store based on fallback level
      performanceStore.setLowPerformanceMode(level === 'low')
      
      // You could trigger additional fallback actions here
      // For example, notify other components to reduce their complexity
    })

    return () => {
      unsubscribeMetrics()
      unsubscribeFallback()
    }
  }, [performanceStore, metrics])

  const startMonitoring = useCallback(() => {
    enhancedPerformanceMonitor.start()
    setIsMonitoring(true)
  }, [])

  const stopMonitoring = useCallback(() => {
    enhancedPerformanceMonitor.stop()
    setIsMonitoring(false)
    setMetrics(null)
  }, [])

  const updateSettings = useCallback((newSettings: Partial<PerformanceSettings>) => {
    enhancedPerformanceMonitor.updateSettings(newSettings)
    setSettings(enhancedPerformanceMonitor.getSettings())
  }, [])

  const forceCleanup = useCallback(() => {
    enhancedPerformanceMonitor.forceGarbageCollection()
    performanceStore.resetMetrics()
  }, [performanceStore])

  // Computed values
  const shouldUseFallback = metrics ? (
    metrics.fps < settings.fpsThreshold ||
    metrics.frameDrops > settings.frameDropThreshold ||
    metrics.memoryUsage > settings.memoryThreshold
  ) : false

  const performanceLevel = metrics?.performanceLevel || 'medium'
  const isLowPerformance = performanceLevel === 'low' || shouldUseFallback

  return {
    metrics,
    settings,
    isMonitoring,
    deviceCapabilities: enhancedPerformanceMonitor.getDeviceCapabilities(),
    optimalSettings: enhancedPerformanceMonitor.getOptimalSettings(),
    
    // Actions
    startMonitoring,
    stopMonitoring,
    updateSettings,
    forceCleanup,
    
    // Computed values
    shouldUseFallback,
    performanceLevel,
    isLowPerformance
  }
}

/**
 * Hook for components that need to adapt based on performance
 */
export function usePerformanceAdaptation() {
  const { 
    optimalSettings, 
    performanceLevel, 
    shouldUseFallback,
    deviceCapabilities 
  } = useEnhancedPerformance()

  const getAnimationConfig = useCallback(() => {
    if (optimalSettings.animationDuration === 0) {
      return { duration: 0, type: 'tween' as const }
    }

    return {
      duration: optimalSettings.animationDuration / 1000, // Convert to seconds
      type: optimalSettings.useSimplifiedAnimations ? 'tween' as const : 'spring' as const,
      ease: optimalSettings.useSimplifiedAnimations ? 'easeInOut' : undefined,
      damping: optimalSettings.useSimplifiedAnimations ? undefined : 25,
      stiffness: optimalSettings.useSimplifiedAnimations ? undefined : 300
    }
  }, [optimalSettings])

  const getVisualEffects = useCallback(() => ({
    enableShadows: optimalSettings.enableShadows,
    enableBlur: optimalSettings.enableBlur,
    enableParallax: optimalSettings.enableParallax,
    maxElements: optimalSettings.maxElements
  }), [optimalSettings])

  const shouldReduceComplexity = useCallback((elementCount: number) => {
    return elementCount > optimalSettings.maxElements || shouldUseFallback
  }, [optimalSettings.maxElements, shouldUseFallback])

  return {
    performanceLevel,
    shouldUseFallback,
    deviceCapabilities,
    getAnimationConfig,
    getVisualEffects,
    shouldReduceComplexity,
    isMobile: deviceCapabilities.isMobile,
    isLowEnd: deviceCapabilities.isLowEnd
  }
}