import { AlgorithmStep, PerformanceMetrics } from '../types'
import { useAlgorithmStore } from '../stores/algorithm-store'

export interface AlgorithmExecutor {
  execute: (data: number[], target?: number) => Promise<AlgorithmStep[]>
  name: string
  description: string
  timeComplexity: string
  spaceComplexity: string
}

export interface ExecutionContext {
  data: number[]
  target?: number
  stepCallback?: (step: AlgorithmStep) => void
  performanceCallback?: (metrics: Partial<PerformanceMetrics>) => void
}

export class AlgorithmExecutionEngine {
  private executors: Map<string, AlgorithmExecutor> = new Map()
  private currentExecution: AbortController | null = null
  private performanceStartTime: number = 0
  private operationCount: number = 0

  constructor() {
    this.registerDefaultExecutors()
  }

  registerExecutor(name: string, executor: AlgorithmExecutor) {
    this.executors.set(name, executor)
  }

  getAvailableAlgorithms(): string[] {
    return Array.from(this.executors.keys())
  }

  getAlgorithmInfo(name: string): AlgorithmExecutor | undefined {
    return this.executors.get(name)
  }

  async executeAlgorithm(
    algorithmName: string,
    context: ExecutionContext
  ): Promise<{
    steps: AlgorithmStep[]
    metrics: PerformanceMetrics
  }> {
    const executor = this.executors.get(algorithmName)
    if (!executor) {
      throw new Error(`Algorithm '${algorithmName}' not found`)
    }

    // Abort any existing execution
    if (this.currentExecution) {
      this.currentExecution.abort()
    }

    this.currentExecution = new AbortController()
    this.performanceStartTime = performance.now()
    this.operationCount = 0

    try {
      const steps = await this.executeWithTracking(executor, context)
      const endTime = performance.now()
      
      const metrics: PerformanceMetrics = {
        totalOperations: this.operationCount,
        timeComplexity: executor.timeComplexity,
        spaceComplexity: executor.spaceComplexity,
        actualRuntime: endTime - this.performanceStartTime,
        comparisonCount: this.countComparisons(steps)
      }

      return { steps, metrics }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Algorithm execution was cancelled')
      }
      throw error
    } finally {
      this.currentExecution = null
    }
  }

  private async executeWithTracking(
    executor: AlgorithmExecutor,
    context: ExecutionContext
  ): Promise<AlgorithmStep[]> {
    const steps: AlgorithmStep[] = []
    
    // Create a wrapped step callback that tracks performance
    const wrappedStepCallback = (step: AlgorithmStep) => {
      this.operationCount++
      
      // Add operation count to step metadata
      const enhancedStep: AlgorithmStep = {
        ...step,
        operationCount: this.operationCount,
        metadata: {
          ...step.metadata,
          timestamp: performance.now() - this.performanceStartTime
        }
      }
      
      steps.push(enhancedStep)
      
      // Call original callback if provided
      if (context.stepCallback) {
        context.stepCallback(enhancedStep)
      }
      
      // Update performance metrics
      if (context.performanceCallback) {
        context.performanceCallback({
          totalOperations: this.operationCount,
          actualRuntime: performance.now() - this.performanceStartTime
        })
      }
      
      // Check for abort signal
      if (this.currentExecution?.signal.aborted) {
        throw new Error('Algorithm execution was cancelled')
      }
    }

    // Execute the algorithm with tracking
    const executionSteps = await executor.execute(
      context.data,
      context.target
    )

    // If executor didn't use step callback, add steps manually
    if (steps.length === 0) {
      executionSteps.forEach(wrappedStepCallback)
    }

    return steps
  }

  private countComparisons(steps: AlgorithmStep[]): number {
    return steps.filter(step => step.type === 'compare').length
  }

  abortExecution() {
    if (this.currentExecution) {
      this.currentExecution.abort()
    }
  }

  // Step-by-step execution for interactive mode
  async executeStepByStep(
    algorithmName: string,
    context: ExecutionContext,
    stepDelay: number = 500
  ): Promise<void> {
    const { steps } = await this.executeAlgorithm(algorithmName, context)
    const algorithmStore = useAlgorithmStore.getState()
    
    // Clear existing steps and add new ones
    algorithmStore.reset()
    steps.forEach(step => algorithmStore.addStep(step))
    
    // Start step-by-step playback
    algorithmStore.play()
    
    for (let i = 0; i < steps.length; i++) {
      if (this.currentExecution?.signal.aborted) {
        break
      }
      
      algorithmStore.setCurrentStep(i)
      
      // Wait for step delay (adjusted by speed)
      const effectiveDelay = stepDelay / algorithmStore.speed
      await this.delay(effectiveDelay)
      
      // Check if paused
      while (algorithmStore.isPaused && !this.currentExecution?.signal.aborted) {
        await this.delay(100)
      }
    }
    
    algorithmStore.pause()
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Register default algorithm executors
  private registerDefaultExecutors() {
    // Binary Search Executor
    this.registerExecutor('binary-search', {
      name: 'Binary Search',
      description: 'Efficiently find a target value in a sorted array',
      timeComplexity: 'O(log n)',
      spaceComplexity: 'O(1)',
      execute: async (data: number[], target?: number) => {
        if (target === undefined) {
          throw new Error('Binary search requires a target value')
        }

        const steps: AlgorithmStep[] = []
        let left = 0
        let right = data.length - 1

        // Initial step
        steps.push({
          type: 'init',
          indices: [],
          metadata: { left, right, target },
          description: `Searching for ${target} in array of ${data.length} elements`
        })

        while (left <= right) {
          const mid = Math.floor((left + right) / 2)
          
          // Highlight current search range
          steps.push({
            type: 'highlight',
            indices: [left, right],
            metadata: { left, right, mid, searchRange: true },
            description: `Searching in range [${left}, ${right}]`
          })

          // Compare with middle element
          steps.push({
            type: 'compare',
            indices: [mid],
            metadata: { 
              left, 
              right, 
              mid, 
              comparison: `${target} vs ${data[mid]}`,
              targetValue: target,
              midValue: data[mid]
            },
            description: `Compare target ${target} with middle element ${data[mid]} at index ${mid}`
          })

          if (data[mid] === target) {
            // Found the target
            steps.push({
              type: 'found',
              indices: [mid],
              metadata: { left, right, mid, found: true },
              description: `Found target ${target} at index ${mid}!`
            })
            break
          } else if (data[mid] < target) {
            // Eliminate left half
            steps.push({
              type: 'eliminate',
              indices: Array.from({ length: mid - left + 1 }, (_, i) => left + i),
              metadata: { 
                left, 
                right, 
                mid, 
                eliminated: 'left',
                reason: `${data[mid]} < ${target}, search right half`
              },
              description: `${data[mid]} < ${target}, eliminate left half [${left}, ${mid}]`
            })
            left = mid + 1
          } else {
            // Eliminate right half
            steps.push({
              type: 'eliminate',
              indices: Array.from({ length: right - mid + 1 }, (_, i) => mid + i),
              metadata: { 
                left, 
                right, 
                mid, 
                eliminated: 'right',
                reason: `${data[mid]} > ${target}, search left half`
              },
              description: `${data[mid]} > ${target}, eliminate right half [${mid}, ${right}]`
            })
            right = mid - 1
          }
        }

        // If not found
        if (left > right) {
          steps.push({
            type: 'eliminate',
            indices: [],
            metadata: { left, right, found: false },
            description: `Target ${target} not found in array`
          })
        }

        return steps
      }
    })

    // Linear Search Executor (for comparison)
    this.registerExecutor('linear-search', {
      name: 'Linear Search',
      description: 'Search through array elements one by one',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      execute: async (data: number[], target?: number) => {
        if (target === undefined) {
          throw new Error('Linear search requires a target value')
        }

        const steps: AlgorithmStep[] = []

        // Initial step
        steps.push({
          type: 'init',
          indices: [],
          metadata: { target },
          description: `Searching for ${target} using linear search`
        })

        for (let i = 0; i < data.length; i++) {
          // Highlight current element
          steps.push({
            type: 'highlight',
            indices: [i],
            metadata: { currentIndex: i },
            description: `Checking element at index ${i}`
          })

          // Compare with target
          steps.push({
            type: 'compare',
            indices: [i],
            metadata: { 
              currentIndex: i,
              comparison: `${target} vs ${data[i]}`,
              targetValue: target,
              currentValue: data[i]
            },
            description: `Compare target ${target} with element ${data[i]} at index ${i}`
          })

          if (data[i] === target) {
            // Found the target
            steps.push({
              type: 'found',
              indices: [i],
              metadata: { currentIndex: i, found: true },
              description: `Found target ${target} at index ${i}!`
            })
            return steps
          }
        }

        // If not found
        steps.push({
          type: 'eliminate',
          indices: [],
          metadata: { found: false },
          description: `Target ${target} not found in array`
        })

        return steps
      }
    })
  }
}

// Singleton instance
export const algorithmEngine = new AlgorithmExecutionEngine()