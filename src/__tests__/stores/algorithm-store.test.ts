import { renderHook, act } from '@testing-library/react'
import { useAlgorithmStore } from '@/lib/stores/algorithm-store'
import { AlgorithmStep } from '@/lib/types'

// Reset store before each test
beforeEach(() => {
  useAlgorithmStore.getState().reset()
  useAlgorithmStore.setState({
    type: '',
    data: [],
    currentStep: 0,
    totalSteps: 0,
    executionHistory: [],
    isRunning: false,
    isPaused: false,
    speed: 1,
    target: undefined,
    pointers: {}
  })
})

describe('AlgorithmStore', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAlgorithmStore())
    
    expect(result.current.type).toBe('')
    expect(result.current.data).toEqual([])
    expect(result.current.currentStep).toBe(0)
    expect(result.current.totalSteps).toBe(0)
    expect(result.current.isRunning).toBe(false)
    expect(result.current.isPaused).toBe(false)
    expect(result.current.speed).toBe(1)
  })

  it('should set algorithm type', () => {
    const { result } = renderHook(() => useAlgorithmStore())
    
    act(() => {
      result.current.setAlgorithmType('binary-search')
    })
    
    expect(result.current.type).toBe('binary-search')
  })

  it('should set data and reset state', () => {
    const { result } = renderHook(() => useAlgorithmStore())
    const testData = [1, 2, 3, 4, 5]
    
    act(() => {
      result.current.setData(testData)
    })
    
    expect(result.current.data).toEqual(testData)
    expect(result.current.currentStep).toBe(0)
    expect(result.current.totalSteps).toBe(0)
    expect(result.current.executionHistory).toEqual([])
  })

  it('should add steps and update total steps', () => {
    const { result } = renderHook(() => useAlgorithmStore())
    
    const step1: AlgorithmStep = {
      type: 'init',
      indices: [],
      metadata: {},
      description: 'Initialize algorithm'
    }
    
    const step2: AlgorithmStep = {
      type: 'compare',
      indices: [0, 4],
      metadata: { comparison: 'target vs mid' },
      description: 'Compare target with middle element'
    }
    
    act(() => {
      result.current.addStep(step1)
      result.current.addStep(step2)
    })
    
    expect(result.current.executionHistory).toHaveLength(2)
    expect(result.current.totalSteps).toBe(2)
    expect(result.current.executionHistory[0]).toEqual(step1)
    expect(result.current.executionHistory[1]).toEqual(step2)
  })

  it('should navigate through steps correctly', () => {
    const { result } = renderHook(() => useAlgorithmStore())
    
    // Add some steps
    act(() => {
      result.current.addStep({
        type: 'init',
        indices: [],
        metadata: {},
        description: 'Step 1'
      })
      result.current.addStep({
        type: 'compare',
        indices: [0],
        metadata: {},
        description: 'Step 2'
      })
      result.current.addStep({
        type: 'found',
        indices: [1],
        metadata: {},
        description: 'Step 3'
      })
    })
    
    expect(result.current.currentStep).toBe(0)
    
    // Move forward
    act(() => {
      result.current.nextStep()
    })
    expect(result.current.currentStep).toBe(1)
    
    act(() => {
      result.current.nextStep()
    })
    expect(result.current.currentStep).toBe(2)
    
    // Can't go beyond last step
    act(() => {
      result.current.nextStep()
    })
    expect(result.current.currentStep).toBe(2)
    
    // Move backward
    act(() => {
      result.current.previousStep()
    })
    expect(result.current.currentStep).toBe(1)
    
    // Set specific step
    act(() => {
      result.current.setCurrentStep(0)
    })
    expect(result.current.currentStep).toBe(0)
  })

  it('should handle play/pause/reset correctly', () => {
    const { result } = renderHook(() => useAlgorithmStore())
    
    // Initially not running
    expect(result.current.isRunning).toBe(false)
    expect(result.current.isPaused).toBe(false)
    
    // Play
    act(() => {
      result.current.play()
    })
    expect(result.current.isRunning).toBe(true)
    expect(result.current.isPaused).toBe(false)
    
    // Pause
    act(() => {
      result.current.pause()
    })
    expect(result.current.isRunning).toBe(false)
    expect(result.current.isPaused).toBe(true)
    
    // Reset
    act(() => {
      result.current.reset()
    })
    expect(result.current.isRunning).toBe(false)
    expect(result.current.isPaused).toBe(false)
    expect(result.current.currentStep).toBe(0)
  })

  it('should update pointers correctly', () => {
    const { result } = renderHook(() => useAlgorithmStore())
    
    act(() => {
      result.current.updatePointers({ left: 0, right: 9 })
    })
    
    expect(result.current.pointers).toEqual({ left: 0, right: 9 })
    
    act(() => {
      result.current.updatePointers({ mid: 4 })
    })
    
    expect(result.current.pointers).toEqual({ left: 0, right: 9, mid: 4 })
  })

  it('should provide correct computed values', () => {
    const { result } = renderHook(() => useAlgorithmStore())
    
    // Add steps
    act(() => {
      result.current.addStep({
        type: 'init',
        indices: [],
        metadata: {},
        description: 'Step 1'
      })
      result.current.addStep({
        type: 'compare',
        indices: [0],
        metadata: {},
        description: 'Step 2'
      })
    })
    
    // Test computed getters
    expect(result.current.getCurrentStepData()?.description).toBe('Step 1')
    expect(result.current.getProgress()).toBe(0.5) // Step 1 of 2
    expect(result.current.isAtStart()).toBe(true)
    expect(result.current.isAtEnd()).toBe(false)
    
    // Move to end
    act(() => {
      result.current.setCurrentStep(1)
    })
    
    expect(result.current.getCurrentStepData()?.description).toBe('Step 2')
    expect(result.current.getProgress()).toBe(1) // Step 2 of 2
    expect(result.current.isAtStart()).toBe(false)
    expect(result.current.isAtEnd()).toBe(true)
  })

  it('should clamp speed values', () => {
    const { result } = renderHook(() => useAlgorithmStore())
    
    // Test minimum speed
    act(() => {
      result.current.setSpeed(0.05)
    })
    expect(result.current.speed).toBe(0.1)
    
    // Test maximum speed
    act(() => {
      result.current.setSpeed(10)
    })
    expect(result.current.speed).toBe(5)
    
    // Test normal speed
    act(() => {
      result.current.setSpeed(2.5)
    })
    expect(result.current.speed).toBe(2.5)
  })
})