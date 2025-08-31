import {
  generateRandomArray,
  generateSortedArray,
  calculateComplexity,
  formatComplexity,
  validateArrayInput,
  formatExecutionTime,
} from '@/lib/utils'

describe('Utility Functions', () => {
  describe('generateRandomArray', () => {
    it('generates array of correct length', () => {
      const arr = generateRandomArray(5)
      expect(arr).toHaveLength(5)
    })

    it('generates numbers within specified range', () => {
      const arr = generateRandomArray(10, 1, 10)
      arr.forEach(num => {
        expect(num).toBeGreaterThanOrEqual(1)
        expect(num).toBeLessThanOrEqual(10)
      })
    })
  })

  describe('generateSortedArray', () => {
    it('generates sorted array', () => {
      const arr = generateSortedArray(10)
      const sortedArr = [...arr].sort((a, b) => a - b)
      expect(arr).toEqual(sortedArr)
    })
  })

  describe('calculateComplexity', () => {
    it('returns O(1) for constant operations', () => {
      expect(calculateComplexity(1, 100)).toBe('O(1)')
    })

    it('returns O(log n) for logarithmic operations', () => {
      expect(calculateComplexity(7, 100)).toBe('O(log n)')
    })

    it('returns O(n) for linear operations', () => {
      expect(calculateComplexity(50, 50)).toBe('O(n)')
    })
  })

  describe('formatComplexity', () => {
    it('formats complexity notation correctly', () => {
      expect(formatComplexity('O(1)')).toBe('Constant Time')
      expect(formatComplexity('O(log n)')).toBe('Logarithmic Time')
      expect(formatComplexity('O(n)')).toBe('Linear Time')
    })
  })

  describe('validateArrayInput', () => {
    it('validates correct array input', () => {
      expect(validateArrayInput('1,2,3,4,5')).toEqual([1, 2, 3, 4, 5])
    })

    it('returns null for invalid input', () => {
      expect(validateArrayInput('invalid')).toBeNull()
      expect(validateArrayInput('1,a,3')).toBeNull()
    })
  })

  describe('formatExecutionTime', () => {
    it('formats microseconds correctly', () => {
      expect(formatExecutionTime(0.5)).toBe('500μs')
    })

    it('formats milliseconds correctly', () => {
      expect(formatExecutionTime(100)).toBe('100.0ms')
    })

    it('formats seconds correctly', () => {
      expect(formatExecutionTime(2000)).toBe('2.00s')
    })
  })
})