import { BinarySearchService } from '../../lib/services/binary-search-service'
import { BinarySearchAlgorithm } from '../../lib/algorithms/binary-search'

describe('Binary Search Integration Tests', () => {
  let service: BinarySearchService

  beforeEach(() => {
    service = new BinarySearchService()
  })

  describe('Algorithm Correctness', () => {
    it('should find elements in various positions', async () => {
      const testData = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]

      // Test finding element at beginning
      const resultFirst = await service.execute(testData, 1, 'javascript', true)
      expect(resultFirst.found).toBe(true)
      expect(resultFirst.index).toBe(0)

      // Test finding element in middle
      const resultMiddle = await service.execute(testData, 9, 'javascript', true)
      expect(resultMiddle.found).toBe(true)
      expect(resultMiddle.index).toBe(4)

      // Test finding element at end
      const resultLast = await service.execute(testData, 19, 'javascript', true)
      expect(resultLast.found).toBe(true)
      expect(resultLast.index).toBe(9)
    })

    it('should handle not found cases correctly', async () => {
      const testData = [2, 4, 6, 8, 10]

      // Target less than all elements
      const resultTooSmall = await service.execute(testData, 1, 'javascript', true)
      expect(resultTooSmall.found).toBe(false)
      expect(resultTooSmall.index).toBe(-1)

      // Target greater than all elements
      const resultTooLarge = await service.execute(testData, 12, 'javascript', true)
      expect(resultTooLarge.found).toBe(false)
      expect(resultTooLarge.index).toBe(-1)

      // Target between elements
      const resultBetween = await service.execute(testData, 5, 'javascript', true)
      expect(resultBetween.found).toBe(false)
      expect(resultBetween.index).toBe(-1)
    })
  })

  describe('Step Tracking Accuracy', () => {
    it('should generate correct step sequence for successful search', async () => {
      const testData = [1, 3, 5, 7, 9]
      const target = 5

      const result = await service.execute(testData, target, 'javascript', true)

      expect(result.steps[0].type).toBe('init')
      expect(result.steps[0].description).toContain('Initialize binary search')

      // Should have highlight steps showing search ranges
      const highlightSteps = result.steps.filter(step => step.type === 'highlight')
      expect(highlightSteps.length).toBeGreaterThan(0)

      // Should have compare steps
      const compareSteps = result.steps.filter(step => step.type === 'compare')
      expect(compareSteps.length).toBe(result.comparisons)

      // Should end with found step
      const lastStep = result.steps[result.steps.length - 1]
      expect(lastStep.type).toBe('found')
      expect(lastStep.description).toContain('Found target')
    })

    it('should generate correct step sequence for unsuccessful search', async () => {
      const testData = [1, 3, 5, 7, 9]
      const target = 4

      const result = await service.execute(testData, target, 'javascript', true)

      expect(result.steps[0].type).toBe('init')

      // Should have eliminate steps showing range reduction
      const eliminateSteps = result.steps.filter(step => step.type === 'eliminate')
      expect(eliminateSteps.length).toBeGreaterThan(0)

      // Should end with eliminate step indicating search exhausted
      const lastStep = result.steps[result.steps.length - 1]
      expect(lastStep.type).toBe('eliminate')
      expect(lastStep.description).toContain('not found')
    })

    it('should track pointer movements correctly', async () => {
      const testData = [1, 3, 5, 7, 9, 11, 13, 15]
      const target = 11

      const result = await service.execute(testData, target, 'javascript', true)

      // Check that pointer metadata is present in steps
      const stepsWithPointers = result.steps.filter(step => 
        step.metadata.left !== undefined && 
        step.metadata.right !== undefined && 
        step.metadata.mid !== undefined
      )

      expect(stepsWithPointers.length).toBeGreaterThan(0)

      // Verify pointer values make sense
      stepsWithPointers.forEach(step => {
        const { left, right, mid } = step.metadata as any
        expect(left).toBeGreaterThanOrEqual(0)
        expect(right).toBeLessThan(testData.length)
        expect(mid).toBeGreaterThanOrEqual(left)
        expect(mid).toBeLessThanOrEqual(right)
      })
    })
  })

  describe('Performance Characteristics', () => {
    it('should demonstrate logarithmic time complexity', async () => {
      const sizes = [10, 100, 1000, 10000]
      const results: { size: number; comparisons: number }[] = []

      for (const size of sizes) {
        const testData = Array.from({ length: size }, (_, i) => i * 2)
        const target = size - 2 // Target near the end to maximize comparisons

        const result = await service.execute(testData, target, 'javascript', false)
        results.push({ size, comparisons: result.comparisons })
      }

      // Verify that comparisons grow logarithmically
      for (let i = 1; i < results.length; i++) {
        const prevResult = results[i - 1]
        const currentResult = results[i]
        
        // Size increased by 10x, comparisons should increase by roughly log2(10) ≈ 3.3
        const sizeRatio = currentResult.size / prevResult.size
        const comparisonRatio = currentResult.comparisons / prevResult.comparisons
        
        expect(comparisonRatio).toBeLessThan(sizeRatio) // Should be much less than linear growth
        expect(comparisonRatio).toBeLessThan(5) // Should be reasonable logarithmic growth
      }
    })

    it('should handle worst-case scenarios efficiently', async () => {
      const size = 1000
      const testData = Array.from({ length: size }, (_, i) => i)

      // Worst case: target not in array, forces maximum comparisons
      const result = await service.execute(testData, -1, 'javascript', false)

      // Should complete in O(log n) comparisons
      const maxExpectedComparisons = Math.ceil(Math.log2(size)) + 1
      expect(result.comparisons).toBeLessThanOrEqual(maxExpectedComparisons)
    })
  })

  describe('Educational Features', () => {
    it('should provide appropriate explanations for different learning modes', async () => {
      const testData = [1, 3, 5, 7, 9]
      const target = 5

      const result = await service.execute(testData, target, 'javascript', true)
      const compareStep = result.steps.find(step => step.type === 'compare')!

      const beginnerExplanation = service.getStepExplanation(compareStep, 'beginner')
      const curiousExplanation = service.getStepExplanation(compareStep, 'curious')
      const detailsExplanation = service.getStepExplanation(compareStep, 'details')

      expect(beginnerExplanation).toContain('dictionary')
      expect(curiousExplanation).toContain('Comparing target')
      expect(detailsExplanation).toBe(compareStep.description)
    })

    it('should generate meaningful test cases', () => {
      const testCases = service.generateTestCases()

      expect(testCases.length).toBeGreaterThan(5)

      // Should have different difficulty levels
      const difficulties = new Set(testCases.map(tc => tc.difficulty))
      expect(difficulties.size).toBeGreaterThan(1)

      // Should have descriptive descriptions
      testCases.forEach(testCase => {
        expect(testCase.description).toBeTruthy()
        expect(testCase.description.length).toBeGreaterThan(10)
      })
    })

    it('should provide meaningful comparison with linear search', async () => {
      const testData = Array.from({ length: 100 }, (_, i) => i * 2)
      const target = 50

      const comparison = await service.compareWithLinearSearch(testData, target)

      expect(comparison.binarySearch.found).toBe(true)
      expect(comparison.linearSearch.found).toBe(true)
      expect(comparison.comparison.binarySearchSteps).toBeLessThan(comparison.comparison.linearSearchSteps)
      expect(comparison.comparison.explanation).toContain('more efficient')
      expect(comparison.comparison.explanation).toContain('O(log n)')
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle all generated test cases correctly', async () => {
      const testCases = BinarySearchAlgorithm.generateTestCases()

      for (const testCase of testCases) {
        const result = await service.execute(testCase.data, testCase.target, 'javascript', true)
        
        expect(result.found).toBe(testCase.expected.found)
        if (testCase.expected.found) {
          expect(result.index).toBe(testCase.expected.index)
        } else {
          expect(result.index).toBe(-1)
        }
      }
    })

    it('should provide comprehensive input validation', () => {
      // Test various invalid inputs
      const invalidInputs = [
        { data: null as any, target: 5, expectedError: 'Input data must be an array' },
        { data: [1, 2, 3], target: NaN, expectedError: 'Target must be a finite number' },
        { data: [3, 1, 2], target: 2, expectedError: 'Array must be sorted' },
        { data: [1, 'two' as any, 3], target: 2, expectedError: 'must be a finite number' }
      ]

      invalidInputs.forEach(({ data, target, expectedError }) => {
        const validation = service.validateInput(data, target)
        expect(validation.isValid).toBe(false)
        expect(validation.errors.some(error => error.includes(expectedError))).toBe(true)
      })
    })

    it('should handle floating point precision correctly', async () => {
      const testData = [0.1, 0.2, 0.3, 0.4, 0.5]
      const target = 0.3

      const result = await service.execute(testData, target, 'javascript', true)

      expect(result.found).toBe(true)
      expect(result.index).toBe(2)
    })

    it('should handle very large numbers', async () => {
      const testData = [1e10, 2e10, 3e10, 4e10, 5e10]
      const target = 3e10

      const result = await service.execute(testData, target, 'javascript', true)

      expect(result.found).toBe(true)
      expect(result.index).toBe(2)
    })
  })

  describe('Cross-Language Consistency', () => {
    it('should produce consistent results between JavaScript and Python implementations', async () => {
      // Mock Pyodide for this test
      const mockPyodide = {
        runPython: jest.fn().mockReturnValue({
          found: true,
          index: 2,
          steps: [
            { type: 'init', indices: [], metadata: {}, description: 'Initialize', operationCount: 1 },
            { type: 'found', indices: [2], metadata: {}, description: 'Found', operationCount: 2 }
          ],
          comparisons: 2
        })
      }

      Object.defineProperty(window, 'pyodide', {
        value: mockPyodide,
        writable: true
      })

      const testData = [1, 3, 5, 7, 9]
      const target = 5

      const jsResult = await service.execute(testData, target, 'javascript', true)
      const pyResult = await service.execute(testData, target, 'python', true)

      expect(jsResult.found).toBe(pyResult.found)
      expect(jsResult.index).toBe(pyResult.index)
      // Note: Step counts and comparisons might differ slightly due to implementation details
    })
  })
})