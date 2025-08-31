import { renderHook, act } from '@testing-library/react'
import { useAlgorithmExecution, useAlgorithmControls } from '@/hooks/use-algorithm-execution'

// Mock the stores and services
jest.mock('@/lib/stores/algorithm-store')
jest.mock('@/lib/stores/performance-store')
jest.mock('@/lib/stores/ui-store')
jest.mock('@/lib/services/algorithm-sync-service')

import { useAlgorithmStore } from '@/lib/stores/algorithm-store'
import { usePerformanceStore } from '@/lib/stores/performance-store'
import { useUIStore } from '@/lib/stores/ui-store'
import { algorithmSyncService } from '@/lib/services/algorithm-sync-service'

const mockAlgorithmStore = {
  type: 'binary-search',
  data: [1, 3, 5, 7, 9],
  target: 5,
  currentStep: 0,
  totalSteps: 5,
  executionHistory: [],
  isRunning: false,
  isPaused: false,
  speed: 1,
  pointers: { left: 0, right: 4, mid: 2 },
  getCurrentStepData: jest.fn(() => null),
  getProgress: jest.fn(() => 0),
  isAtEnd: jest.fn(() => false),
  isAtStart: jest.fn(() => true)
}

const mockPerformanceStore = {
  fps: 60,
  isLowPerformance: false,
  shouldUseFallback: jest.fn(() => false),
  getOptimalAnimationSettings: jest.fn(() => ({
    maxElements: 100,
    animationDuration: 300,
    useSimplifiedAnimations: false
  }))
}

const mockUIStore = {
  shouldReduceMotion: jest.fn(() => false),
  getEffectiveAnimationSpeed: jest.fn(() => 1)
}

const mockAlgorithmSyncService = {
  executeAlgorithm: jest.fn(),
  pauseExecution: jest.fn(),
  resumeExecution: jest.fn(),
  stopExecution: jest.fn(),
  resetExecution: jest.fn(),
  nextStep: jest.fn(),
  previousStep: jest.fn(),
  goToStep: jest.fn(),
  setExecutionSpeed: jest.fn(),
  replayExecution: jest.fn(),
  compareAlgorithms: jest.fn(),
  getAvailableAlgorithms: jest.fn(() => ['binary-search', 'linear-search']),
  getAlgorithmInfo: jest.fn(),
  isExecuting: false
}

beforeEach(() => {
  (useAlgorithmStore as jest.Mock).mockReturnValue(mockAlgorithmStore);
  (usePerformanceStore as jest.Mock).mockReturnValue(mockPerformanceStore);
  (useUIStore as jest.Mock).mockReturnValue(mockUIStore);
  
  Object.assign(algorithmSyncService, mockAlgorithmSyncService)
  
  jest.clearAllMocks()
})

describe('useAlgorithmExecution', () => {
  it('should provide algorithm execution interface', () => {
    const { result } = renderHook(() => useAlgorithmExecution())

    expect(result.current.executeAlgorithm).toBeDefined()
    expect(result.current.pauseExecution).toBeDefined()
    expect(result.current.resumeExecution).toBeDefined()
    expect(result.current.stopExecution).toBeDefined()
    expect(result.current.resetExecution).toBeDefined()
    expect(result.current.nextStep).toBeDefined()
    expect(result.current.previousStep).toBeDefined()
    expect(result.current.goToStep).toBeDefined()
    expect(result.current.setSpeed).toBeDefined()
    expect(result.current.replayExecution).toBeDefined()
  })

  it('should provide current algorithm state', () => {
    const { result } = renderHook(() => useAlgorithmExecution())

    expect(result.current.algorithmType).toBe('binary-search')
    expect(result.current.data).toEqual([1, 3, 5, 7, 9])
    expect(result.current.target).toBe(5)
    expect(result.current.currentStep).toBe(0)
    expect(result.current.totalSteps).toBe(5)
    expect(result.current.isRunning).toBe(false)
    expect(result.current.isPaused).toBe(false)
    expect(result.current.pointers).toEqual({ left: 0, right: 4, mid: 2 })
  })

  it('should provide performance metrics', () => {
    const { result } = renderHook(() => useAlgorithmExecution())

    expect(result.current.performanceMetrics.fps).toBe(60)
    expect(result.current.performanceMetrics.isLowPerformance).toBe(false)
    expect(result.current.performanceMetrics.shouldUseFallback).toBe(false)
  })

  it('should provide available algorithms', () => {
    const { result } = renderHook(() => useAlgorithmExecution())

    expect(result.current.availableAlgorithms).toEqual(['binary-search', 'linear-search'])
  })

  it('should execute algorithm and handle success', async () => {
    mockAlgorithmSyncService.executeAlgorithm.mockResolvedValue(undefined)
    
    const { result } = renderHook(() => useAlgorithmExecution())

    await act(async () => {
      await result.current.executeAlgorithm('binary-search', [1, 3, 5, 7, 9], 5)
    })

    expect(mockAlgorithmSyncService.executeAlgorithm).toHaveBeenCalledWith(
      'binary-search',
      [1, 3, 5, 7, 9],
      5
    )
    expect(result.current.error).toBeNull()
  })

  it('should handle execution errors', async () => {
    const errorMessage = 'Execution failed'
    mockAlgorithmSyncService.executeAlgorithm.mockRejectedValue(new Error(errorMessage))
    
    const { result } = renderHook(() => useAlgorithmExecution())

    await act(async () => {
      try {
        await result.current.executeAlgorithm('binary-search', [1, 3, 5, 7, 9], 5)
      } catch (error) {
        // Expected to throw
      }
    })

    expect(result.current.error).toBe(errorMessage)
  })

  it('should clear error when algorithm type changes', () => {
    const { result, rerender } = renderHook(() => useAlgorithmExecution())

    // Set an error
    act(() => {
      result.current.executeAlgorithm('invalid-algorithm', [], 0).catch(() => {})
    })

    // Change algorithm type
    mockAlgorithmStore.type = 'linear-search'
    rerender()

    expect(result.current.error).toBeNull()
  })

  it('should call sync service methods for control actions', () => {
    const { result } = renderHook(() => useAlgorithmExecution())

    act(() => {
      result.current.pauseExecution()
    })
    expect(mockAlgorithmSyncService.pauseExecution).toHaveBeenCalled()

    act(() => {
      result.current.resumeExecution()
    })
    expect(mockAlgorithmSyncService.resumeExecution).toHaveBeenCalled()

    act(() => {
      result.current.stopExecution()
    })
    expect(mockAlgorithmSyncService.stopExecution).toHaveBeenCalled()

    act(() => {
      result.current.resetExecution()
    })
    expect(mockAlgorithmSyncService.resetExecution).toHaveBeenCalled()

    act(() => {
      result.current.nextStep()
    })
    expect(mockAlgorithmSyncService.nextStep).toHaveBeenCalled()

    act(() => {
      result.current.previousStep()
    })
    expect(mockAlgorithmSyncService.previousStep).toHaveBeenCalled()

    act(() => {
      result.current.goToStep(3)
    })
    expect(mockAlgorithmSyncService.goToStep).toHaveBeenCalledWith(3)

    act(() => {
      result.current.setSpeed(2)
    })
    expect(mockAlgorithmSyncService.setExecutionSpeed).toHaveBeenCalledWith(2)
  })

  it('should handle replay execution', async () => {
    mockAlgorithmSyncService.replayExecution.mockResolvedValue(undefined)
    
    const { result } = renderHook(() => useAlgorithmExecution())

    await act(async () => {
      await result.current.replayExecution()
    })

    expect(mockAlgorithmSyncService.replayExecution).toHaveBeenCalled()
    expect(result.current.error).toBeNull()
  })

  it('should handle algorithm comparison', async () => {
    const comparisonResult = {
      'binary-search': { steps: [], metrics: {} },
      'linear-search': { steps: [], metrics: {} }
    }
    mockAlgorithmSyncService.compareAlgorithms.mockResolvedValue(comparisonResult)
    
    const { result } = renderHook(() => useAlgorithmExecution())

    let comparison: any
    await act(async () => {
      comparison = await result.current.compareAlgorithms(
        ['binary-search', 'linear-search'],
        [1, 3, 5, 7, 9],
        5
      )
    })

    expect(mockAlgorithmSyncService.compareAlgorithms).toHaveBeenCalledWith(
      ['binary-search', 'linear-search'],
      [1, 3, 5, 7, 9],
      5
    )
    expect(comparison).toEqual(comparisonResult)
  })
})

describe('useAlgorithmControls', () => {
  it('should provide control interface', () => {
    const { result } = renderHook(() => useAlgorithmControls())

    expect(result.current.executeAlgorithm).toBeDefined()
    expect(result.current.pause).toBeDefined()
    expect(result.current.resume).toBeDefined()
    expect(result.current.stop).toBeDefined()
    expect(result.current.reset).toBeDefined()
    expect(result.current.nextStep).toBeDefined()
    expect(result.current.previousStep).toBeDefined()
    expect(result.current.setSpeed).toBeDefined()
    expect(result.current.replay).toBeDefined()
  })

  it('should provide control state', () => {
    const { result } = renderHook(() => useAlgorithmControls())

    expect(result.current.isRunning).toBe(false)
    expect(result.current.isPaused).toBe(false)
    expect(result.current.isAtEnd).toBe(false)
    expect(result.current.isAtStart).toBe(true)
    expect(result.current.progress).toBe(0)
    expect(result.current.speed).toBe(1)
  })

  it('should provide computed control states', () => {
    const { result } = renderHook(() => useAlgorithmControls())

    expect(result.current.canPlay).toBe(true) // !isRunning && !isAtEnd
    expect(result.current.canPause).toBe(false) // isRunning
    expect(result.current.canStep).toBe(true) // !isRunning
    expect(result.current.canReset).toBe(false) // progress > 0 || isAtEnd
  })

  it('should update computed states based on algorithm state', () => {
    // Mock running state
    mockAlgorithmStore.isRunning = true
    mockAlgorithmStore.getProgress = jest.fn(() => 0.5)
    
    const { result } = renderHook(() => useAlgorithmControls())

    expect(result.current.canPlay).toBe(false) // isRunning
    expect(result.current.canPause).toBe(true) // isRunning
    expect(result.current.canStep).toBe(false) // isRunning
    expect(result.current.canReset).toBe(true) // progress > 0
  })
})