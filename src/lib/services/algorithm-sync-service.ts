import { algorithmEngine, ExecutionContext } from '../engines/algorithm-execution-engine'
import { useAlgorithmStore } from '../stores/algorithm-store'
import { usePerformanceStore } from '../stores/performance-store'
import { useUIStore } from '../stores/ui-store'
import { AlgorithmStep, PerformanceMetrics } from '../types'

export class AlgorithmSyncService {
  private _isExecuting = false
  private executionPromise: Promise<void> | null = null

  async executeAlgorithm(
    algorithmName: string,
    data: number[],
    target?: number
  ): Promise<void> {
    if (this._isExecuting) {
      throw new Error('Algorithm is already executing')
    }

    this._isExecuting = true
    const algorithmStore = useAlgorithmStore.getState()
    const performanceStore = usePerformanceStore.getState()
    const uiStore = useUIStore.getState()

    try {
      // Initialize algorithm state
      algorithmStore.setAlgorithmType(algorithmName)
      algorithmStore.setData(data)
      algorithmStore.setTarget(target)
      algorithmStore.reset()

      // Start performance monitoring
      performanceStore.startPerformanceMonitoring()
      performanceStore.resetMetrics()

      // Create execution context with callbacks
      const context: ExecutionContext = {
        data,
        target,
        stepCallback: (step: AlgorithmStep) => {
          // Add step to store
          algorithmStore.addStep(step)
          
          // Update pointers if present in metadata
          if (step.metadata.left !== undefined || 
              step.metadata.right !== undefined || 
              step.metadata.mid !== undefined) {
            algorithmStore.updatePointers({
              left: typeof step.metadata.left === 'number' ? step.metadata.left : undefined,
              right: typeof step.metadata.right === 'number' ? step.metadata.right : undefined,
              mid: typeof step.metadata.mid === 'number' ? step.metadata.mid : undefined
            })
          }
        },
        performanceCallback: (metrics: Partial<PerformanceMetrics>) => {
          // Update performance metrics in real-time
          if (metrics.totalOperations !== undefined) {
            // Could update a real-time operation counter here
          }
        }
      }

      // Execute algorithm with step-by-step playback
      const stepDelay = this.calculateStepDelay(uiStore.getEffectiveAnimationSpeed())
      
      this.executionPromise = algorithmEngine.executeStepByStep(
        algorithmName,
        context,
        stepDelay
      )

      await this.executionPromise

    } catch (error) {
      console.error('Algorithm execution failed:', error)
      algorithmStore.pause()
      throw error
    } finally {
      this._isExecuting = false
      this.executionPromise = null
      performanceStore.stopPerformanceMonitoring()
    }
  }

  async precomputeSteps(
    algorithmName: string,
    data: number[],
    target?: number
  ): Promise<{
    steps: AlgorithmStep[]
    metrics: PerformanceMetrics
  }> {
    const context: ExecutionContext = { data, target }
    return algorithmEngine.executeAlgorithm(algorithmName, context)
  }

  pauseExecution(): void {
    const algorithmStore = useAlgorithmStore.getState()
    algorithmStore.pause()
  }

  resumeExecution(): void {
    const algorithmStore = useAlgorithmStore.getState()
    algorithmStore.play()
  }

  stopExecution(): void {
    algorithmEngine.abortExecution()
    const algorithmStore = useAlgorithmStore.getState()
    algorithmStore.pause()
  }

  resetExecution(): void {
    this.stopExecution()
    const algorithmStore = useAlgorithmStore.getState()
    algorithmStore.reset()
  }

  // Manual step control
  nextStep(): void {
    const algorithmStore = useAlgorithmStore.getState()
    algorithmStore.nextStep()
    this.syncVisualizationState()
  }

  previousStep(): void {
    const algorithmStore = useAlgorithmStore.getState()
    algorithmStore.previousStep()
    this.syncVisualizationState()
  }

  goToStep(stepIndex: number): void {
    const algorithmStore = useAlgorithmStore.getState()
    algorithmStore.setCurrentStep(stepIndex)
    this.syncVisualizationState()
  }

  // Speed control
  setExecutionSpeed(speed: number): void {
    const algorithmStore = useAlgorithmStore.getState()
    algorithmStore.setSpeed(speed)
  }

  private syncVisualizationState(): void {
    const algorithmStore = useAlgorithmStore.getState()
    const currentStep = algorithmStore.getCurrentStepData()
    
    if (currentStep && currentStep.metadata) {
      // Update pointers based on current step
      if (currentStep.metadata.left !== undefined || 
          currentStep.metadata.right !== undefined || 
          currentStep.metadata.mid !== undefined) {
        algorithmStore.updatePointers({
          left: typeof currentStep.metadata.left === 'number' ? currentStep.metadata.left : undefined,
          right: typeof currentStep.metadata.right === 'number' ? currentStep.metadata.right : undefined,
          mid: typeof currentStep.metadata.mid === 'number' ? currentStep.metadata.mid : undefined
        })
      }
    }
  }

  private calculateStepDelay(animationSpeed: number): number {
    // Base delay of 1000ms, adjusted by animation speed
    const baseDelay = 1000
    return baseDelay / Math.max(animationSpeed, 0.1)
  }

  // Replay functionality
  async replayExecution(): Promise<void> {
    const algorithmStore = useAlgorithmStore.getState()
    const steps = algorithmStore.executionHistory
    
    if (steps.length === 0) {
      throw new Error('No execution history to replay')
    }

    algorithmStore.setCurrentStep(0)
    algorithmStore.play()

    const uiStore = useUIStore.getState()
    const stepDelay = this.calculateStepDelay(uiStore.getEffectiveAnimationSpeed())

    for (let i = 0; i < steps.length; i++) {
      if (!algorithmStore.isRunning) {
        break
      }

      algorithmStore.setCurrentStep(i)
      this.syncVisualizationState()

      await this.delay(stepDelay)

      // Check if paused
      while (algorithmStore.isPaused && algorithmStore.isRunning) {
        await this.delay(100)
      }
    }

    algorithmStore.pause()
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Algorithm comparison
  async compareAlgorithms(
    algorithms: string[],
    data: number[],
    target?: number
  ): Promise<{
    [algorithmName: string]: {
      steps: AlgorithmStep[]
      metrics: PerformanceMetrics
    }
  }> {
    const results: {
      [algorithmName: string]: {
        steps: AlgorithmStep[]
        metrics: PerformanceMetrics
      }
    } = {}

    for (const algorithmName of algorithms) {
      try {
        const result = await this.precomputeSteps(algorithmName, data, target)
        results[algorithmName] = result
      } catch (error) {
        console.error(`Failed to execute ${algorithmName}:`, error)
      }
    }

    return results
  }

  // Get execution history for analysis
  getExecutionHistory(): AlgorithmStep[] {
    const algorithmStore = useAlgorithmStore.getState()
    return algorithmStore.executionHistory
  }

  // Get current execution state
  getExecutionState() {
    const algorithmStore = useAlgorithmStore.getState()
    return {
      isRunning: algorithmStore.isRunning,
      isPaused: algorithmStore.isPaused,
      currentStep: algorithmStore.currentStep,
      totalSteps: algorithmStore.totalSteps,
      progress: algorithmStore.getProgress(),
      isAtEnd: algorithmStore.isAtEnd(),
      isAtStart: algorithmStore.isAtStart()
    }
  }

  // Check if execution is in progress
  get isExecuting(): boolean {
    return this._isExecuting
  }

  // Get available algorithms
  getAvailableAlgorithms(): string[] {
    return algorithmEngine.getAvailableAlgorithms()
  }

  // Get algorithm information
  getAlgorithmInfo(name: string) {
    return algorithmEngine.getAlgorithmInfo(name)
  }
}

// Singleton instance
export const algorithmSyncService = new AlgorithmSyncService()