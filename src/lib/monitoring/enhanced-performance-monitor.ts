/**
 * Enhanced performance monitoring system with automatic fallbacks and device detection
 */

export interface DeviceCapabilities {
  deviceMemory: number // GB
  hardwareConcurrency: number // CPU cores
  maxTouchPoints: number
  isMobile: boolean
  isLowEnd: boolean
  supportedFeatures: {
    webgl: boolean
    webgl2: boolean
    webAssembly: boolean
    intersectionObserver: boolean
    resizeObserver: boolean
  }
}

export interface PerformanceSettings {
  enableAutoFallback: boolean
  fpsThreshold: number
  memoryThreshold: number // MB
  frameDropThreshold: number
  animationQuality: 'high' | 'medium' | 'low' | 'auto'
  enableBatterySaving: boolean
  enableReducedMotion: boolean
}

export interface EnhancedPerformanceMetrics {
  fps: number
  frameDrops: number
  memoryUsage: number
  renderTime: number
  timestamp: number
  deviceCapabilities: DeviceCapabilities
  performanceLevel: 'high' | 'medium' | 'low'
  batteryLevel?: number
  isCharging?: boolean
}

export class EnhancedPerformanceMonitor {
  private frameCount = 0
  private lastTime = performance.now()
  private frameDrops = 0
  private isMonitoring = false
  private animationFrameId: number | null = null
  private callbacks: ((metrics: EnhancedPerformanceMetrics) => void)[] = []
  private fallbackCallbacks: ((level: 'high' | 'medium' | 'low') => void)[] = []
  private deviceCapabilities: DeviceCapabilities
  private settings: PerformanceSettings
  private performanceHistory: number[] = []
  private memoryCleanupInterval: NodeJS.Timeout | null = null

  constructor(initialSettings?: Partial<PerformanceSettings>) {
    this.deviceCapabilities = this.detectDeviceCapabilities()
    this.settings = {
      enableAutoFallback: true,
      fpsThreshold: this.deviceCapabilities.isLowEnd ? 25 : 30,
      memoryThreshold: this.deviceCapabilities.deviceMemory < 4 ? 50 : 100,
      frameDropThreshold: 10,
      animationQuality: 'auto',
      enableBatterySaving: false,
      enableReducedMotion: this.detectReducedMotionPreference(),
      ...initialSettings
    }
  }

  /**
   * Detect device capabilities for performance optimization
   */
  private detectDeviceCapabilities(): DeviceCapabilities {
    const nav = navigator as Navigator & {
      deviceMemory?: number
      getBattery?: () => Promise<{ level: number; charging: boolean }>
    }

    // Detect if device is mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.matchMedia('(max-width: 768px)').matches

    // Get device memory (if available)
    const deviceMemory = nav.deviceMemory || (isMobile ? 2 : 4) // Default estimates

    // Detect low-end devices
    const isLowEnd = deviceMemory < 4 || 
                     navigator.hardwareConcurrency < 4 || 
                     isMobile

    return {
      deviceMemory,
      hardwareConcurrency: navigator.hardwareConcurrency || 4,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      isMobile,
      isLowEnd,
      supportedFeatures: {
        webgl: this.detectWebGLSupport(),
        webgl2: this.detectWebGL2Support(),
        webAssembly: typeof WebAssembly !== 'undefined',
        intersectionObserver: 'IntersectionObserver' in window,
        resizeObserver: 'ResizeObserver' in window
      }
    }
  }

  /**
   * Detect WebGL support
   */
  private detectWebGLSupport(): boolean {
    try {
      const canvas = document.createElement('canvas')
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    } catch {
      return false
    }
  }

  /**
   * Detect WebGL2 support
   */
  private detectWebGL2Support(): boolean {
    try {
      const canvas = document.createElement('canvas')
      return !!canvas.getContext('webgl2')
    } catch {
      return false
    }
  }

  /**
   * Detect user's reduced motion preference
   */
  private detectReducedMotionPreference(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  /**
   * Start enhanced performance monitoring
   */
  start(): void {
    if (this.isMonitoring) return

    this.isMonitoring = true
    this.frameCount = 0
    this.lastTime = performance.now()
    this.frameDrops = 0
    this.performanceHistory = []
    
    this.monitorFrame()
    this.startMemoryCleanup()
    this.monitorBattery()
  }

  /**
   * Stop performance monitoring
   */
  stop(): void {
    this.isMonitoring = false
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
    if (this.memoryCleanupInterval) {
      clearInterval(this.memoryCleanupInterval)
      this.memoryCleanupInterval = null
    }
  }

  /**
   * Update performance settings
   */
  updateSettings(newSettings: Partial<PerformanceSettings>): void {
    this.settings = { ...this.settings, ...newSettings }
  }

  /**
   * Get current settings
   */
  getSettings(): PerformanceSettings {
    return { ...this.settings }
  }

  /**
   * Get device capabilities
   */
  getDeviceCapabilities(): DeviceCapabilities {
    return { ...this.deviceCapabilities }
  }

  /**
   * Add callback for performance updates
   */
  onUpdate(callback: (metrics: EnhancedPerformanceMetrics) => void): () => void {
    this.callbacks.push(callback)
    
    return () => {
      const index = this.callbacks.indexOf(callback)
      if (index > -1) {
        this.callbacks.splice(index, 1)
      }
    }
  }

  /**
   * Add callback for automatic fallback triggers
   */
  onFallback(callback: (level: 'high' | 'medium' | 'low') => void): () => void {
    this.fallbackCallbacks.push(callback)
    
    return () => {
      const index = this.fallbackCallbacks.indexOf(callback)
      if (index > -1) {
        this.fallbackCallbacks.splice(index, 1)
      }
    }
  }

  /**
   * Get current performance metrics
   */
  getCurrentMetrics(): EnhancedPerformanceMetrics {
    const now = performance.now()
    const deltaTime = now - this.lastTime
    const fps = deltaTime > 0 ? 1000 / deltaTime : 0
    
    return {
      fps,
      frameDrops: this.frameDrops,
      memoryUsage: this.getMemoryUsage(),
      renderTime: deltaTime,
      timestamp: now,
      deviceCapabilities: this.deviceCapabilities,
      performanceLevel: this.calculatePerformanceLevel(fps)
    }
  }

  /**
   * Calculate performance level based on metrics
   */
  private calculatePerformanceLevel(fps: number): 'high' | 'medium' | 'low' {
    if (this.settings.animationQuality !== 'auto') {
      return this.settings.animationQuality as 'high' | 'medium' | 'low'
    }

    const avgFps = this.performanceHistory.length > 0 
      ? this.performanceHistory.reduce((a, b) => a + b) / this.performanceHistory.length
      : fps

    if (avgFps >= 50 && this.frameDrops < 3) {
      return 'high'
    } else if (avgFps >= this.settings.fpsThreshold && this.frameDrops < this.settings.frameDropThreshold) {
      return 'medium'
    } else {
      return 'low'
    }
  }

  /**
   * Monitor frame performance with automatic fallbacks
   */
  private monitorFrame = (): void => {
    if (!this.isMonitoring) return

    const now = performance.now()
    const deltaTime = now - this.lastTime
    
    this.frameCount++
    
    // Calculate FPS
    const fps = deltaTime > 0 ? 1000 / deltaTime : 0
    
    // Track performance history (last 60 frames)
    this.performanceHistory.push(fps)
    if (this.performanceHistory.length > 60) {
      this.performanceHistory.shift()
    }
    
    // Detect frame drops
    if (fps < this.settings.fpsThreshold) {
      this.frameDrops++
    }

    // Update metrics every 60 frames or 1 second
    if (this.frameCount % 60 === 0 || deltaTime > 1000) {
      const metrics: EnhancedPerformanceMetrics = {
        fps,
        frameDrops: this.frameDrops,
        memoryUsage: this.getMemoryUsage(),
        renderTime: deltaTime,
        timestamp: now,
        deviceCapabilities: this.deviceCapabilities,
        performanceLevel: this.calculatePerformanceLevel(fps)
      }

      // Check for automatic fallback triggers
      if (this.settings.enableAutoFallback) {
        this.checkFallbackTriggers(metrics)
      }

      // Notify callbacks
      this.callbacks.forEach(callback => callback(metrics))
      
      this.lastTime = now
    }

    this.animationFrameId = requestAnimationFrame(this.monitorFrame)
  }

  /**
   * Check if fallback should be triggered
   */
  private checkFallbackTriggers(metrics: EnhancedPerformanceMetrics): void {
    const shouldFallback = 
      metrics.fps < this.settings.fpsThreshold ||
      metrics.frameDrops > this.settings.frameDropThreshold ||
      metrics.memoryUsage > this.settings.memoryThreshold

    if (shouldFallback) {
      const newLevel = metrics.performanceLevel
      this.fallbackCallbacks.forEach(callback => callback(newLevel))
    }
  }

  /**
   * Start memory cleanup monitoring
   */
  private startMemoryCleanup(): void {
    this.memoryCleanupInterval = setInterval(() => {
      const memoryUsage = this.getMemoryUsage()
      
      if (memoryUsage > this.settings.memoryThreshold) {
        // Trigger garbage collection if available
        if ('gc' in window && typeof (window as any).gc === 'function') {
          try {
            (window as any).gc()
          } catch (e) {
            // Ignore errors
          }
        }
        
        // Notify about high memory usage
        console.warn(`High memory usage detected: ${memoryUsage.toFixed(2)}MB`)
      }
    }, 10000) // Check every 10 seconds
  }

  /**
   * Monitor battery status for power-saving optimizations
   */
  private async monitorBattery(): Promise<void> {
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery()
        
        const updateBatteryInfo = () => {
          const metrics = this.getCurrentMetrics()
          metrics.batteryLevel = battery.level
          metrics.isCharging = battery.charging
          
          // Enable battery saving mode if battery is low and not charging
          if (battery.level < 0.2 && !battery.charging && !this.settings.enableBatterySaving) {
            this.settings.enableBatterySaving = true
            console.info('Battery saving mode enabled due to low battery')
          }
        }

        battery.addEventListener('levelchange', updateBatteryInfo)
        battery.addEventListener('chargingchange', updateBatteryInfo)
        
        updateBatteryInfo()
      } catch (e) {
        // Battery API not supported or failed
      }
    }
  }

  /**
   * Get memory usage if available
   */
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as { memory: { usedJSHeapSize?: number } }).memory
      return (memory.usedJSHeapSize || 0) / (1024 * 1024) // Convert to MB
    }
    return 0
  }

  /**
   * Force garbage collection (if available)
   */
  forceGarbageCollection(): void {
    if ('gc' in window && typeof (window as any).gc === 'function') {
      try {
        (window as any).gc()
        console.info('Forced garbage collection')
      } catch (e) {
        console.warn('Could not force garbage collection:', e)
      }
    }
  }

  /**
   * Get optimal settings based on current performance
   */
  getOptimalSettings(): {
    maxElements: number
    animationDuration: number
    useSimplifiedAnimations: boolean
    enableParallax: boolean
    enableShadows: boolean
    enableBlur: boolean
  } {
    const level = this.calculatePerformanceLevel(this.getCurrentMetrics().fps)
    const isBatterySaving = this.settings.enableBatterySaving
    const isReducedMotion = this.settings.enableReducedMotion

    if (isReducedMotion) {
      return {
        maxElements: 20,
        animationDuration: 0,
        useSimplifiedAnimations: true,
        enableParallax: false,
        enableShadows: false,
        enableBlur: false
      }
    }

    switch (level) {
      case 'high':
        return {
          maxElements: isBatterySaving ? 50 : 100,
          animationDuration: isBatterySaving ? 200 : 300,
          useSimplifiedAnimations: false,
          enableParallax: !isBatterySaving,
          enableShadows: !isBatterySaving,
          enableBlur: !isBatterySaving
        }
      case 'medium':
        return {
          maxElements: 50,
          animationDuration: 200,
          useSimplifiedAnimations: false,
          enableParallax: false,
          enableShadows: true,
          enableBlur: false
        }
      case 'low':
        return {
          maxElements: 20,
          animationDuration: 100,
          useSimplifiedAnimations: true,
          enableParallax: false,
          enableShadows: false,
          enableBlur: false
        }
    }
  }
}

// Singleton instance
export const enhancedPerformanceMonitor = new EnhancedPerformanceMonitor()