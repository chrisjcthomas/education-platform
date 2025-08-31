import { AlgorithmExecutionEngine, AlgorithmExecutor } from '@/lib/engines/algorithm-execution-engine'
import { AlgorithmStep } from '@/lib/types'

describe('AlgorithmExecutionEngine', () => {
  let engine: AlgorithmExecutionEngine

  beforeEach(() => {
    engine = new AlgorithmExecutionEngine()
  })

  afterEach(() => {
    engine.abortExecution()
  })

  it('should initialize with default executors', () => {
    const algorithms = engine.getAvailableAlgorithms()
    expect(algorithms).toContain('binary-search')
    expect(algorithms).toContain('linear-search')
  })

  it('should register custom executors', () => {
    const customExecutor: AlgorithmExecutor = {
      name: 'Test Algorithm',
      description: 'A test algorithm',
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(1)',
      execute: async () => [{
        type: 'init',
        indices: [],
        metadata: {},
        description: 'Test step'
      }]
    }

    engine.registerExecutor('test-algorithm', customExecutor)
    
    const algorithms = engine.getAvailableAlgorithms()
    expect(algorithms).toContain('test-algorithm')
    
    const info = engine.getAlgorithmInfo('test-algorithm')
    expect(info).toEqual(customExecutor)
  })

  it('should execute binary search correctly', async () => {
    const data = [1, 3, 5, 7, 9, 11, 13, 15]
    const target = 7
    
    const result = await engine.executeAlgorithm('binary-search', {
      data,
      target
    })

    expect(result.steps).toBeDefined()
    expect(result.metrics).toBeDefined()
    expect(result.steps.length).toBeGreaterThan(0)
    
    // Should have init step
    expect(result.steps[0].type).toBe('init')
    
    // Should find the target
    const foundStep = result.steps.find(step => step.type === 'found')
    expect(foundStep).toBeDefined()
    expect(foundStep?.indices).toContain(3) // Index of 7 in the array
    
    // Check metrics
    expect(result.metrics.timeComplexity).toBe('O(log n)')
    expect(result.metrics.totalOperations).toBeGreaterThan(0)
    expect(result.metrics.comparisonCount).toBeGreaterThan(0)
  })

  it('should execute linear search correctly', async () => {
    const data = [5, 2, 8, 1, 9]
    const target = 8
    
    const result = await engine.executeAlgorithm('linear-search', {
      data,
      target
    })

    expect(result.steps).toBeDefined()
    expect(result.metrics).toBeDefined()
    
    // Should have init step
    expect(result.steps[0].type).toBe('init')
    
    // Should find the target
    const foundStep = result.steps.find(step => step.type === 'found')
    expect(foundStep).toBeDefined()
    expect(foundStep?.indices).toContain(2) // Index of 8 in the array
    
    // Check metrics
    expect(result.metrics.timeComplexity).toBe('O(n)')
  })

  it('should handle target not found in binary search', async () => {
    const data = [1, 3, 5, 7, 9]
    const target = 6 // Not in array
    
    const result = await engine.executeAlgorithm('binary-search', {
      data,
      target
    })

    // Should not find the target
    const foundStep = result.steps.find(step => step.type === 'found')
    expect(foundStep).toBeUndefined()
    
    // Should have elimination steps
    const eliminateSteps = result.steps.filter(step => step.type === 'eliminate')
    expect(eliminateSteps.length).toBeGreaterThan(0)
  })

  it('should handle target not found in linear search', async () => {
    const data = [1, 3, 5, 7, 9]
    const target = 6 // Not in array
    
    const result = await engine.executeAlgorithm('linear-search', {
      data,
      target
    })

    // Should not find the target
    const foundStep = result.steps.find(step => step.type === 'found')
    expect(foundStep).toBeUndefined()
    
    // Should end with not found message
    const lastStep = result.steps[result.steps.length - 1]
    expect(lastStep.type).toBe('eliminate')
    expect(lastStep.metadata.found).toBe(false)
  })

  it('should track performance metrics', async () => {
    const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const target = 5
    
    const result = await engine.executeAlgorithm('binary-search', {
      data,
      target
    })

    expect(result.metrics.totalOperations).toBeGreaterThan(0)
    expect(result.metrics.actualRuntime).toBeGreaterThan(0)
    expect(result.metrics.comparisonCount).toBeGreaterThan(0)
    expect(result.metrics.timeComplexity).toBe('O(log n)')
    expect(result.metrics.spaceComplexity).toBe('O(1)')
  })

  it('should call step callback during execution', async () => {
    const data = [1, 3, 5, 7, 9]
    const target = 5
    const stepCallback = jest.fn()
    
    await engine.executeAlgorithm('binary-search', {
      data,
      target,
      stepCallback
    })

    expect(stepCallback).toHaveBeenCalled()
    
    // Check that steps have operation counts
    const calls = stepCallback.mock.calls
    calls.forEach((call, index) => {
      const step: AlgorithmStep = call[0]
      expect(step.operationCount).toBe(index + 1)
      expect(step.metadata.timestamp).toBeDefined()
    })
  })

  it('should call performance callback during execution', async () => {
    const data = [1, 3, 5, 7, 9]
    const target = 5
    const performanceCallback = jest.fn()
    
    await engine.executeAlgorithm('binary-search', {
      data,
      target,
      performanceCallback
    })

    expect(performanceCallback).toHaveBeenCalled()
    
    // Check that performance updates were called
    const calls = performanceCallback.mock.calls
    calls.forEach(call => {
      const metrics = call[0]
      expect(metrics.totalOperations).toBeDefined()
      expect(metrics.actualRuntime).toBeDefined()
    })
  })

  it('should abort execution when requested', async () => {
    const data = Array.from({ length: 1000 }, (_, i) => i)
    const target = 999
    
    // Start execution
    const executionPromise = engine.executeAlgorithm('linear-search', {
      data,
      target
    })
    
    // Abort immediately
    engine.abortExecution()
    
    // Should throw an error
    await expect(executionPromise).rejects.toThrow('Algorithm execution was cancelled')
  })

  it('should throw error for unknown algorithm', async () => {
    await expect(
      engine.executeAlgorithm('unknown-algorithm', {
        data: [1, 2, 3],
        target: 2
      })
    ).rejects.toThrow("Algorithm 'unknown-algorithm' not found")
  })

  it('should throw error when target is missing for search algorithms', async () => {
    await expect(
      engine.executeAlgorithm('binary-search', {
        data: [1, 2, 3]
        // target is missing
      })
    ).rejects.toThrow('Binary search requires a target value')
  })

  it('should handle empty array', async () => {
    const result = await engine.executeAlgorithm('binary-search', {
      data: [],
      target: 5
    })

    expect(result.steps).toBeDefined()
    expect(result.steps.length).toBeGreaterThan(0)
    
    // Should have init step
    expect(result.steps[0].type).toBe('init')
    
    // Should not find anything
    const foundStep = result.steps.find(step => step.type === 'found')
    expect(foundStep).toBeUndefined()
  })

  it('should handle single element array', async () => {
    const data = [5]
    const target = 5
    
    const result = await engine.executeAlgorithm('binary-search', {
      data,
      target
    })

    expect(result.steps).toBeDefined()
    
    // Should find the target
    const foundStep = result.steps.find(step => step.type === 'found')
    expect(foundStep).toBeDefined()
    expect(foundStep?.indices).toContain(0)
  })
})