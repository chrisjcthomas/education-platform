import { BinarySearchService } from '../../lib/services/binary-search-service'
import { BinarySearchAlgorithm } from '../../lib/algorithms/binary-search'

// Mock Pyodide for testing
const mockPyodide = {
  runPython: jest.fn()
}

// Mock window.pyodide
Object.defineProperty(window, 'pyodide', {
  value: mockPyodide,
  writable: true
})

describe('BinarySearchService', () => {
  let service: BinarySearchService

  beforeEach(() => {
    service = new BinarySearchService()
    jest.clearAllMocks()
  })

  describe('execute', () => {
    const testData = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
    const target = 7

    it('should execute JavaScript binary search successfully', async () => {
      const result = await service.execute(testData, target, 'javascript', true)

      expect(result.found).toBe(true)
      expect(result.index).toBe(3)
      expect(result.comparisons).toBeGreaterThan(0)
      expect(result.steps).toHaveLength(result.steps.length)
      expect(result.steps[0].type).toBe('init')
    })

    it('should execute Python binary search successfully', async () => {
      // Mock successful Python execution
      mockPyodide.runPython.mockReturnValue({
        found: true,
        index: 3,
        steps: [
          {
            type: 'init',
            indices: [],
            metadata: { target: 7, arrayLength: 10 },
            description: 'Initialize binary search',
            operationCount: 1
          }
        ],
        comparisons: 4
      })

      const result = await service.execute(testData, target, 'python', true)

      expect(result.found).toBe(true)
      expect(result.index).toBe(3)
      expect(result.comparisons).toBe(4)
      expect(mockPyodide.runPython).toHaveBeenCalled()
    })

    it('should fallback to JavaScript when Python execution fails', async () => {
      // Mock Python execution failure
      mockPyodide.runPython.mockImplementation(() => {
        throw new Error('Python execution failed')
      })

      const result = await service.execute(testData, target, 'python', true)

      expect(result.found).toBe(true)
      expect(result.index).toBe(3)
      expect(result.comparisons).toBeGreaterThan(0)
    })

    it('should handle target not found', async () => {
      const result = await service.execute(testData, 20, 'javascript', true)

      expect(result.found).toBe(false)
      expect(result.index).toBe(-1)
      expect(result.comparisons).toBeGreaterThan(0)
    })

    it('should handle empty array', async () => {
      const result = await service.execute([], target, 'javascript', true)

      expect(result.found).toBe(false)
      expect(result.index).toBe(-1)
      expect(result.steps).toHaveLength(2) // init + eliminate steps
    })
  })

  describe('validateInput', () => {
    it('should validate correct input', () => {
      const validation = service.validateInput([1, 2, 3, 4, 5], 3)

      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    it('should detect non-array input', () => {
      const validation = service.validateInput('not an array' as any, 3)

      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('Input data must be an array')
    })

    it('should detect non-numeric target', () => {
      const validation = service.validateInput([1, 2, 3], 'not a number' as any)

      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('Target must be a finite number')
    })

    it('should detect unsorted array', () => {
      const validation = service.validateInput([1, 3, 2, 4, 5], 3)

      expect(validation.isValid).toBe(false)
      expect(validation.errors[0]).toContain('Array must be sorted')
    })

    it('should detect non-numeric array elements', () => {
      const validation = service.validateInput([1, 2, 'three' as any, 4, 5], 3)

      expect(validation.isValid).toBe(false)
      expect(validation.errors[0]).toContain('must be a finite number')
    })

    it('should warn about empty array', () => {
      const validation = service.validateInput([], 3)

      expect(validation.isValid).toBe(true)
      expect(validation.warnings).toContain('Array is empty - binary search will return not found')
    })

    it('should warn about large arrays', () => {
      const largeArray = Array.from({ length: 15000 }, (_, i) => i)
      const validation = service.validateInput(largeArray, 5000)

      expect(validation.isValid).toBe(true)
      expect(validation.warnings).toContain('Large array detected - visualization may be slow')
    })

    it('should warn about target not in array', () => {
      const validation = service.validateInput([1, 2, 3, 4, 5], 10)

      expect(validation.isValid).toBe(true)
      expect(validation.warnings[0]).toContain('Target 10 not in array')
    })
  })

  describe('generateTestCases', () => {
    it('should generate educational test cases', () => {
      const testCases = service.generateTestCases()

      expect(testCases).toHaveLength(10)
      expect(testCases[0]).toHaveProperty('data')
      expect(testCases[0]).toHaveProperty('target')
      expect(testCases[0]).toHaveProperty('expected')
      expect(testCases[0]).toHaveProperty('description')
      expect(testCases[0]).toHaveProperty('difficulty')
    })

    it('should include various difficulty levels', () => {
      const testCases = service.generateTestCases()
      const difficulties = testCases.map(tc => tc.difficulty)

      expect(difficulties).toContain('easy')
      expect(difficulties).toContain('medium')
    })
  })

  describe('compareWithLinearSearch', () => {
    it('should compare binary search with linear search', async () => {
      const testData = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
      const target = 7

      const comparison = await service.compareWithLinearSearch(testData, target)

      expect(comparison.binarySearch.found).toBe(true)
      expect(comparison.linearSearch.found).toBe(true)
      expect(comparison.binarySearch.index).toBe(comparison.linearSearch.index)
      expect(comparison.comparison.binarySearchSteps).toBeLessThan(comparison.comparison.linearSearchSteps)
      expect(comparison.comparison.efficiency).toContain('Binary search is more efficient')
    })

    it('should handle target not found in both searches', async () => {
      const testData = [1, 3, 5, 7, 9]
      const target = 10

      const comparison = await service.compareWithLinearSearch(testData, target)

      expect(comparison.binarySearch.found).toBe(false)
      expect(comparison.linearSearch.found).toBe(false)
      expect(comparison.binarySearch.index).toBe(-1)
      expect(comparison.linearSearch.index).toBe(-1)
    })
  })

  describe('getStepExplanation', () => {
    const mockStep = {
      type: 'compare' as const,
      indices: [2],
      metadata: {
        targetValue: 7,
        midValue: 5,
        comparisonCount: 2
      },
      description: 'Compare: target(7) > mid(5)'
    }

    it('should provide beginner-friendly explanations', () => {
      const explanation = service.getStepExplanation(mockStep, 'beginner')

      expect(explanation).toContain('middle item')
      expect(explanation).toContain('dictionary')
    })

    it('should provide curious-level explanations', () => {
      const explanation = service.getStepExplanation(mockStep, 'curious')

      expect(explanation).toContain('Comparing target')
      expect(explanation).toContain('comparison #2')
    })

    it('should provide detailed explanations', () => {
      const explanation = service.getStepExplanation(mockStep, 'details')

      expect(explanation).toBe(mockStep.description)
    })
  })

  describe('getComplexityInfo', () => {
    it('should return algorithm complexity information', () => {
      const info = service.getComplexityInfo()

      expect(info.timeComplexity).toBe('O(log n)')
      expect(info.spaceComplexity).toBe('O(1)')
      expect(info).toHaveProperty('totalOperations')
      expect(info).toHaveProperty('actualRuntime')
      expect(info).toHaveProperty('comparisonCount')
    })
  })

  describe('edge cases', () => {
    it('should handle single element array', async () => {
      const result = await service.execute([5], 5, 'javascript', true)

      expect(result.found).toBe(true)
      expect(result.index).toBe(0)
      expect(result.comparisons).toBe(1)
    })

    it('should handle duplicate values', async () => {
      const result = await service.execute([1, 2, 2, 2, 5], 2, 'javascript', true)

      expect(result.found).toBe(true)
      expect([1, 2, 3]).toContain(result.index) // Any occurrence is valid
    })

    it('should handle negative numbers', async () => {
      const result = await service.execute([-5, -3, -1, 0, 2, 4], -1, 'javascript', true)

      expect(result.found).toBe(true)
      expect(result.index).toBe(2)
    })

    it('should handle floating point numbers', async () => {
      const result = await service.execute([1.1, 2.2, 3.3, 4.4, 5.5], 3.3, 'javascript', true)

      expect(result.found).toBe(true)
      expect(result.index).toBe(2)
    })
  })

  describe('performance considerations', () => {
    it('should handle large arrays efficiently', async () => {
      const largeArray = Array.from({ length: 10000 }, (_, i) => i * 2)
      const target = 5000

      const startTime = performance.now()
      const result = await service.execute(largeArray, target, 'javascript', false) // No step tracking for performance
      const endTime = performance.now()

      expect(result.found).toBe(true)
      expect(result.index).toBe(2500)
      expect(endTime - startTime).toBeLessThan(100) // Should complete in less than 100ms
    })

    it('should limit step tracking for very large arrays', async () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => i)
      const target = 500

      const result = await service.execute(largeArray, target, 'javascript', true)

      expect(result.found).toBe(true)
      expect(result.steps.length).toBeLessThan(50) // Should not generate excessive steps
    })
  })
})