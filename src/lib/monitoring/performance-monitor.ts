/**
 * Performance monitoring utilities for the educational platform
 */

export interface PerformanceMetrics {
  fps: number
  frameDrops: number
  memoryUsage: number
  renderTime: number
  timestamp: number
}

export class PerformanceMonitor {
  private frameCount = 0
  private lastTime = performance.now()
  private frameDrops = 0
  private isMonitoring = false
  private animationFrameId: number | null = null
  private callbacks: ((metrics: PerformanceMetrics) => void)[] = []

  /**
   * Start monitoring performance
   */
  start(): void {
    if (this.isMonitoring) return

    this.isMonitoring = true
    this.frameCount = 0
    this.lastTime = performance.now()
    this.frameDrops = 0
    
    this.monitorFrame()
  }

  /**
   * Stop monitoring performance
   */
  stop(): void {
    this.isMonitoring = false
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  /**
   * Add callback for performance updates
   */
  onUpdate(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.callbacks.push(callback)
    
    // Return unsubscribe function
    return () => {
      const index = this.callbacks.indexOf(callback)
      if (index > -1) {
        this.callbacks.splice(index, 1)
      }
    }
  }

  /**
   * Get current performance metrics
   */
  getCurrentMetrics(): PerformanceMetrics {
    const now = performance.now()
    const deltaTime = now - this.lastTime
    const fps = deltaTime > 0 ? 1000 / deltaTime : 0
    
    return {
      fps,
      frameDrops: this.frameDrops,
      memoryUsage: this.getMemoryUsage(),
      renderTime: deltaTime,
      timestamp: now
    }
  }

  /**
   * Monitor frame performance
   */
  private monitorFrame = (): void => {
    if (!this.isMonitoring) return

    const now = performance.now()
    const deltaTime = now - this.lastTime
    
    this.frameCount++
    
    // Calculate FPS
    const fps = deltaTime > 0 ? 1000 / deltaTime : 0
    
    // Detect frame drops (below 30 FPS)
    if (fps < 30) {
      this.frameDrops++
    }

    // Update metrics every 60 frames or 1 second
    if (this.frameCount % 60 === 0 || deltaTime > 1000) {
      const metrics: PerformanceMetrics = {
        fps,
        frameDrops: this.frameDrops,
        memoryUsage: this.getMemoryUsage(),
        renderTime: deltaTime,
        timestamp: now
      }

      // Notify callbacks
      this.callbacks.forEach(callback => callback(metrics))
      
      this.lastTime = now
    }

    this.animationFrameId = requestAnimationFrame(this.monitorFrame)
  }

  /**
   * Get memory usage if available
   */
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as { memory: { usedJSHeapSize?: number } }).memory
      return memory.usedJSHeapSize || 0
    }
    return 0
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor()