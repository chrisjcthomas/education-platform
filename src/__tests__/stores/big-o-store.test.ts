import { useBigOStore } from '../../lib/stores/big-o-store'
import { act, renderHook } from '@testing-library/react'

describe('useBigOStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useBigOStore())
    act(() => {
      result.current.stopTracking()
      result.current.resetCounter()
      result.current.clearComparisons()
    })
  })

  describe('tracking operations', () => {
    it('should start tracking with correct initial state', () => {
      const { result } = renderHook(() => useBigOStore())

      act(() => {
        result.current.startTracking('binary-search', 16)
      })

      expect(result.current.isTracking).toBe(true)
      expect(result.current.operationCounter).toBe(0)
      expect(result.current.currentAnalysis).toBeDefined()
      expect(result.current.currentAnalysis?.inputSize).toBe(16)
    })

    it('should increment operation counter', () => {
      const { result } = renderHook(() => useBigOStore())

      act(() => {
        result.current.startTracking('binary-search', 16)
        result.current.incrementOperations(3)
      })

      expect(result.current.operationCounter).toBe(3)
      expect(result.current.currentAnalysis?.operationCount).toBe(3)
    })

    it('should not increment when not tracking', () => {
      const { result } = renderHook(() => useBigOStore())

      act(() => {
        result.current.incrementOperations(5)
      })

      expect(result.current.operationCounter).toBe(0)
    })

    it('should stop tracking', () => {
      const { result } = renderHook(() => useBigOStore())

      act(() => {
        result.current.startTracking('binary-search', 16)
        result.current.stopTracking()
      })

      expect(result.current.isTracking).toBe(false)
    })

    it('should reset counter', () => {
      const { result } = renderHook(() => useBigOStore())

      act(() => {
        result.current.startTracking('binary-search', 16)
        result.current.incrementOperations(5)
        result.current.resetCounter()
      })

      expect(result.current.operationCounter).toBe(0)
    })
  })

  describe('algorithm comparison', () => {
    it('should add algorithm for comparison', () => {
      const { result } = renderHook(() => useBigOStore())

      act(() => {
        result.current.startTracking('binary-search', 16)
        result.current.addAlgorithmForComparison('Binary Search', 'binary-search', 4)
      })

      expect(result.current.algorithmComparisons).toBeDefined()
      expect(result.current.algorithmComparisons?.algorithms).toHaveLength(1)
      expect(result.current.algorithmComparisons?.algorithms[0].name).toBe('Binary Search')
    })

    it('should update existing algorithm in comparison', () => {
      const { result } = renderHook(() => useBigOStore())

      act(() => {
        result.current.startTracking('binary-search', 16)
        result.current.addAlgorithmForComparison('Binary Search', 'binary-search', 4)
        result.current.addAlgorithmForComparison('Binary Search', 'binary-search', 6)
      })

      expect(result.current.algorithmComparisons?.algorithms).toHaveLength(1)
      expect(result.current.algorithmComparisons?.algorithms[0].operationCount).toBe(6)
    })

    it('should add multiple algorithms for comparison', () => {
      const { result } = renderHook(() => useBigOStore())

      act(() => {
        result.current.startTracking('binary-search', 16)
        result.current.addAlgorithmForComparison('Binary Search', 'binary-search', 4)
        result.current.addAlgorithmForComparison('Linear Search', 'linear-search', 8)
      })

      expect(result.current.algorithmComparisons?.algorithms).toHaveLength(2)
      expect(result.current.algorithmComparisons?.winner).toBe('Binary Search')
    })

    it('should clear comparisons', () => {
      const { result } = renderHook(() => useBigOStore())

      act(() => {
        result.current.startTracking('binary-search', 16)
        result.current.addAlgorithmForComparison('Binary Search', 'binary-search', 4)
        result.current.clearComparisons()
      })

      expect(result.current.algorithmComparisons).toBeNull()
    })
  })

  describe('scaling behavior', () => {
    it('should generate scaling data', () => {
      const { result } = renderHook(() => useBigOStore())

      act(() => {
        result.current.generateScalingData('binary-search', [10, 20, 40])
      })

      expect(result.current.scalingBehavior).toBeDefined()
      expect(result.current.scalingBehavior?.complexityClass.notation).toBe('O(log n)')
      expect(result.current.scalingBehavior?.inputSizes).toContain(10)
      expect(result.current.scalingBehavior?.inputSizes).toContain(20)
      expect(result.current.scalingBehavior?.inputSizes).toContain(40)
    })
  })

  describe('display toggles', () => {
    it('should toggle real-time counter display', () => {
      const { result } = renderHook(() => useBigOStore())

      const initialState = result.current.showRealTimeCounter

      act(() => {
        result.current.toggleRealTimeCounter()
      })

      expect(result.current.showRealTimeCounter).toBe(!initialState)
    })

    it('should toggle complexity badge display', () => {
      const { result } = renderHook(() => useBigOStore())

      const initialState = result.current.showComplexityBadge

      act(() => {
        result.current.toggleComplexityBadge()
      })

      expect(result.current.showComplexityBadge).toBe(!initialState)
    })

    it('should toggle scaling chart display', () => {
      const { result } = renderHook(() => useBigOStore())

      const initialState = result.current.showScalingChart

      act(() => {
        result.current.toggleScalingChart()
      })

      expect(result.current.showScalingChart).toBe(!initialState)
    })

    it('should toggle comparisons display', () => {
      const { result } = renderHook(() => useBigOStore())

      const initialState = result.current.showComparisons

      act(() => {
        result.current.toggleComparisons()
      })

      expect(result.current.showComparisons).toBe(!initialState)
    })
  })

  describe('getters', () => {
    it('should get current complexity', () => {
      const { result } = renderHook(() => useBigOStore())

      act(() => {
        result.current.startTracking('binary-search', 16)
      })

      expect(result.current.getCurrentComplexity()).toBe('O(log n)')
    })

    it('should get efficiency score', () => {
      const { result } = renderHook(() => useBigOStore())

      act(() => {
        result.current.startTracking('binary-search', 16)
      })

      expect(result.current.getEfficiencyScore()).toBeGreaterThanOrEqual(0)
      expect(result.current.getEfficiencyScore()).toBeLessThanOrEqual(100)
    })

    it('should get operation count', () => {
      const { result } = renderHook(() => useBigOStore())

      act(() => {
        result.current.startTracking('binary-search', 16)
        result.current.incrementOperations(5)
      })

      expect(result.current.getOperationCount()).toBe(5)
    })

    it('should return current complexity from analysis', () => {
      const { result } = renderHook(() => useBigOStore())

      // The store may have initial analysis, so test the actual behavior
      const complexity = result.current.getCurrentComplexity()
      expect(typeof complexity).toBe('string')
      expect(complexity.length).toBeGreaterThan(0)
    })

    it('should return efficiency score from analysis', () => {
      const { result } = renderHook(() => useBigOStore())

      // The store may have initial analysis, so test the actual behavior
      const efficiency = result.current.getEfficiencyScore()
      expect(typeof efficiency).toBe('number')
      expect(efficiency).toBeGreaterThanOrEqual(0)
    })
  })

  describe('analysis updates', () => {
    it('should update analysis with new algorithm type and input size', () => {
      const { result } = renderHook(() => useBigOStore())

      act(() => {
        result.current.startTracking('binary-search', 16)
        result.current.incrementOperations(4)
        result.current.updateAnalysis('linear-search', 32)
      })

      expect(result.current.currentAnalysis?.complexity.notation).toBe('O(n)')
      expect(result.current.currentAnalysis?.inputSize).toBe(32)
      expect(result.current.currentAnalysis?.operationCount).toBe(4)
    })
  })
})