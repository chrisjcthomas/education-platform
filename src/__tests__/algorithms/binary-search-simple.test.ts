import { BinarySearchAlgorithm, binarySearch, binarySearchWithSteps } from '../../lib/algorithms/binary-search'

describe('Binary Search Algorithm - Core Functionality', () => {
  describe('BinarySearchAlgorithm class', () => {
    let algorithm: BinarySearchAlgorithm

    beforeEach(() => {
      algorithm = new BinarySearchAlgorithm()
    })

    it('should find target in middle of array', async () => {
      const data = [1, 3, 5, 7, 9]
      const target = 5
      
      const result = await algorithm.execute({ data, target, trackSteps: false })
      
      expect(result.found).toBe(true)
      expect(result.index).toBe(2)
      expect(result.comparisons).toBeGreaterThan(0)
    })

    it('should find target at beginning of array', async () => {
      const data = [1, 3, 5, 7, 9]
      const target = 1
      
      const result = await algorithm.execute({ data, target, trackSteps: false })
      
      expect(result.found).toBe(true)
      expect(result.index).toBe(0)
    })

    it('should find target at end of array', async () => {
      const data = [1, 3, 5, 7, 9]
      const target = 9
      
      const result = await algorithm.execute({ data, target, trackSteps: false })
      
      expect(result.found).toBe(true)
      expect(result.index).toBe(4)
    })

    it('should return not found for missing target', async () => {
      const data = [1, 3, 5, 7, 9]
      const target = 4
      
      const result = await algorithm.execute({ data, target, trackSteps: false })
      
      expect(result.found).toBe(false)
      expect(result.index).toBe(-1)
    })

    it('should handle empty array', async () => {
      const data: number[] = []
      const target = 5
      
      const result = await algorithm.execute({ data, target, trackSteps: false })
      
      expect(result.found).toBe(false)
      expect(result.index).toBe(-1)
    })

    it('should handle single element array - found', async () => {
      const data = [5]
      const target = 5
      
      const result = await algorithm.execute({ data, target, trackSteps: false })
      
      expect(result.found).toBe(true)
      expect(result.index).toBe(0)
    })

    it('should handle single element array - not found', async () => {
      const data = [5]
      const target = 3
      
      const result = await algorithm.execute({ data, target, trackSteps: false })
      
      expect(result.found).toBe(false)
      expect(result.index).toBe(-1)
    })

    it('should track steps when enabled', async () => {
      const data = [1, 3, 5, 7, 9]
      const target = 5
      
      const result = await algorithm.execute({ data, target, trackSteps: true })
      
      expect(result.found).toBe(true)
      expect(result.index).toBe(2)
      expect(result.steps.length).toBeGreaterThan(0)
      expect(result.steps[0].type).toBe('init')
    })

    it('should validate input correctly', async () => {
      // Test unsorted array
      const unsortedData = [3, 1, 2]
      const target = 2
      
      await expect(algorithm.execute({ data: unsortedData, target, trackSteps: false }))
        .rejects.toThrow('Array must be sorted')
    })
  })

  describe('Convenience functions', () => {
    it('should work with binarySearch function', async () => {
      const data = [1, 3, 5, 7, 9]
      const target = 7
      
      const index = await binarySearch(data, target)
      
      expect(index).toBe(3)
    })

    it('should work with binarySearchWithSteps function', async () => {
      const data = [1, 3, 5, 7, 9]
      const target = 7
      
      const result = await binarySearchWithSteps(data, target)
      
      expect(result.found).toBe(true)
      expect(result.index).toBe(3)
      expect(result.steps.length).toBeGreaterThan(0)
    })
  })

  describe('Algorithm complexity', () => {
    it('should demonstrate logarithmic complexity', async () => {
      const sizes = [10, 100, 1000]
      const results: number[] = []

      for (const size of sizes) {
        const data = Array.from({ length: size }, (_, i) => i * 2)
        const target = (size - 1) * 2 // Target near the end
        
        const result = await binarySearch(data, target)
        const algorithm = new BinarySearchAlgorithm()
        const fullResult = await algorithm.execute({ data, target, trackSteps: false })
        
        expect(result).toBeGreaterThanOrEqual(0)
        results.push(fullResult.comparisons)
      }

      // Verify that comparisons grow logarithmically, not linearly
      expect(results[1]).toBeLessThan(results[0] * 5) // Should not grow linearly
      expect(results[2]).toBeLessThan(results[1] * 5) // Should not grow linearly
    })
  })

  describe('Edge cases', () => {
    it('should handle duplicate values', async () => {
      const data = [1, 2, 2, 2, 5]
      const target = 2
      
      const result = await binarySearch(data, target)
      
      // Should find one of the occurrences
      expect([1, 2, 3]).toContain(result)
    })

    it('should handle negative numbers', async () => {
      const data = [-10, -5, -1, 0, 3, 7]
      const target = -1
      
      const result = await binarySearch(data, target)
      
      expect(result).toBe(2)
    })

    it('should handle floating point numbers', async () => {
      const data = [1.1, 2.2, 3.3, 4.4, 5.5]
      const target = 3.3
      
      const result = await binarySearch(data, target)
      
      expect(result).toBe(2)
    })
  })

  describe('Static methods', () => {
    it('should provide complexity information', () => {
      const info = BinarySearchAlgorithm.getComplexityInfo()
      
      expect(info.timeComplexity).toBe('O(log n)')
      expect(info.spaceComplexity).toBe('O(1)')
      expect(info.bestCase).toBe('O(1)')
      expect(info.worstCase).toBe('O(log n)')
      expect(info.averageCase).toBe('O(log n)')
    })

    it('should generate test cases', () => {
      const testCases = BinarySearchAlgorithm.generateTestCases()
      
      expect(testCases.length).toBeGreaterThan(5)
      expect(testCases[0]).toHaveProperty('data')
      expect(testCases[0]).toHaveProperty('target')
      expect(testCases[0]).toHaveProperty('expected')
    })
  })
})