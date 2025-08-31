import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { PerformanceState } from '../types'

interface PerformanceStore extends PerformanceState {
  // Actions
  updateFPS: (fps: number) => void
  incrementFrameDrops: () => void
  updateMemoryUsage: (usage: number) => void
  updateRenderTime: (time: number) => void
  setLowPerformanceMode: (isLow: boolean) => void
  resetMetrics: () => void
  
  // Performance monitoring
  startPerformanceMonitoring: () => void
  stopPerformanceMonitoring: () => void
  
  // Computed getters
  shouldUseFallback: () => boolean
  getPerformanceLevel: () => 'high' | 'medium' | 'low'
  getOptimalAnimationSettings: () => {
    maxElements: number
    animationDuration: number
    useSimplifiedAnimations: boolean
  }
}

const initialState: PerformanceState = {
  fps: 60,
  frameDrops: 0,
  memoryUsage: 0,
  renderTime: 0,
  isLowPerformance: false
}

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  LOW_FPS: 30,
  HIGH_FRAME_DROPS: 10,
  HIGH_MEMORY: 100, // MB
  HIGH_RENDER_TIME: 16.67 // ms (60fps target)
}

export const usePerformanceStore = create<PerformanceStore>()(
  subscribeWithSelector((set, get) => {
    let monitoringInterval: NodeJS.Timeout | null = null
    let frameCount = 0
    let lastTime = performance.now()

    return {
      ...initialState,

      // Actions
      updateFPS: (fps: number) => {
        set({ fps })
        
        // Auto-detect low performance
        const state = get()
        if (fps < PERFORMANCE_THRESHOLDS.LOW_FPS && !state.isLowPerformance) {
          set({ isLowPerformance: true })
        } else if (fps >= PERFORMANCE_THRESHOLDS.LOW_FPS && state.isLowPerformance) {
          set({ isLowPerformance: false })
        }
      },

      incrementFrameDrops: () => {
        set((state) => ({ frameDrops: state.frameDrops + 1 }))
      },

      updateMemoryUsage: (usage: number) => {
        set({ memoryUsage: usage })
      },

      updateRenderTime: (time: number) => {
        set({ renderTime: time })
        
        // Track frame drops based on render time
        if (time > PERFORMANCE_THRESHOLDS.HIGH_RENDER_TIME) {
          get().incrementFrameDrops()
        }
      },

      setLowPerformanceMode: (isLow: boolean) => {
        set({ isLowPerformance: isLow })
      },

      resetMetrics: () => {
        set({
          frameDrops: 0,
          memoryUsage: 0,
          renderTime: 0
        })
      },

      // Performance monitoring
      startPerformanceMonitoring: () => {
        if (typeof window === 'undefined') return

        const measurePerformance = () => {
          const now = performance.now()
          frameCount++

          // Calculate FPS every second
          if (now - lastTime >= 1000) {
            const fps = Math.round((frameCount * 1000) / (now - lastTime))
            get().updateFPS(fps)
            frameCount = 0
            lastTime = now
          }

          // Measure memory usage if available
          if ('memory' in performance) {
            const memory = (performance as { memory: { usedJSHeapSize: number } }).memory
            const memoryMB = memory.usedJSHeapSize / (1024 * 1024)
            get().updateMemoryUsage(memoryMB)
          }

          requestAnimationFrame(measurePerformance)
        }

        measurePerformance()

        // Additional monitoring every 5 seconds
        monitoringInterval = setInterval(() => {
          const state = get()
          
          // Reset frame drops counter periodically
          if (state.frameDrops > PERFORMANCE_THRESHOLDS.HIGH_FRAME_DROPS) {
            console.warn('High frame drops detected, consider enabling performance mode')
          }
        }, 5000)
      },

      stopPerformanceMonitoring: () => {
        if (monitoringInterval) {
          clearInterval(monitoringInterval)
          monitoringInterval = null
        }
      },

      // Computed getters
      shouldUseFallback: () => {
        const state = get()
        return state.isLowPerformance || 
               state.fps < PERFORMANCE_THRESHOLDS.LOW_FPS ||
               state.frameDrops > PERFORMANCE_THRESHOLDS.HIGH_FRAME_DROPS
      },

      getPerformanceLevel: () => {
        const state = get()
        
        if (state.fps >= 50 && state.frameDrops < 3) {
          return 'high'
        } else if (state.fps >= 30 && state.frameDrops < 8) {
          return 'medium'
        } else {
          return 'low'
        }
      },

      getOptimalAnimationSettings: () => {
        const performanceLevel = get().getPerformanceLevel()
        
        switch (performanceLevel) {
          case 'high':
            return {
              maxElements: 100,
              animationDuration: 300,
              useSimplifiedAnimations: false
            }
          case 'medium':
            return {
              maxElements: 50,
              animationDuration: 200,
              useSimplifiedAnimations: false
            }
          case 'low':
            return {
              maxElements: 20,
              animationDuration: 100,
              useSimplifiedAnimations: true
            }
        }
      }
    }
  })
)