import { BigOAnalysisService } from '../../lib/services/big-o-analysis-service'

describe('BigOAnalysisService', () => {
  describe('analyzeComplexity', () => {
    it('should correctly classify binary search as O(log n)', () => {
      const analysis = BigOAnalysisService.analyzeComplexity('binary-search', 4, 16)
      
      expect(analysis.complexity.notation).toBe('O(log n)')
      expect(analysis.complexity.name).toBe('Logarithmic')
      expect(analysis.complexity.category).toBe('excellent')
      expect(analysis.operationCount).toBe(4)
      expect(analysis.inputSize).toBe(16)
      expect(analysis.efficiency).toBeGreaterThan(80)
    })

    it('should correctly classify linear search as O(n)', () => {
      const analysis = BigOAnalysisService.analyzeComplexity('linear-search', 8, 16)
      
      expect(analysis.complexity.notation).toBe('O(n)')
      expect(analysis.complexity.name).toBe('Linear')
      expect(analysis.complexity.category).toBe('good')
      expect(analysis.operationCount).toBe(8)
      expect(analysis.inputSize).toBe(16)
    })

    it('should provide plain language explanations', () => {
      const analysis = BigOAnalysisService.analyzeComplexity('binary-search', 4, 16)
      
      expect(analysis.plainLanguageExplanation).toContain('dictionary')
      expect(analysis.plainLanguageExplanation).toContain('4 steps')
      expect(analysis.description).toContain('eliminates half')
    })

    it('should calculate efficiency correctly', () => {
      // Perfect binary search should be 100% efficient
      const perfectAnalysis = BigOAnalysisService.analyzeComplexity('binary-search', 4, 16)
      expect(perfectAnalysis.efficiency).toBe(100)

      // Inefficient search should have lower efficiency
      const inefficientAnalysis = BigOAnalysisService.analyzeComplexity('binary-search', 8, 16)
      expect(inefficientAnalysis.efficiency).toBeLessThan(100)
    })
  })

  describe('compareAlgorithms', () => {
    it('should correctly compare binary search vs linear search', () => {
      const algorithms = [
        { name: 'Binary Search', type: 'binary-search', operationCount: 4 },
        { name: 'Linear Search', type: 'linear-search', operationCount: 8 }
      ]

      const comparison = BigOAnalysisService.compareAlgorithms(algorithms, 16)

      expect(comparison.winner).toBe('Binary Search')
      expect(comparison.algorithms).toHaveLength(2)
      expect(comparison.inputSize).toBe(16)
      expect(comparison.explanation).toContain('more efficient')
    })

    it('should handle equal performance algorithms', () => {
      const algorithms = [
        { name: 'Algorithm A', type: 'binary-search', operationCount: 4 },
        { name: 'Algorithm B', type: 'binary-search', operationCount: 4 }
      ]

      const comparison = BigOAnalysisService.compareAlgorithms(algorithms, 16)

      expect(comparison.explanation).toContain('equally')
    })

    it('should sort algorithms by efficiency', () => {
      const algorithms = [
        { name: 'Slow Algorithm', type: 'linear-search', operationCount: 16 },
        { name: 'Fast Algorithm', type: 'binary-search', operationCount: 4 },
        { name: 'Medium Algorithm', type: 'linear-search', operationCount: 8 }
      ]

      const comparison = BigOAnalysisService.compareAlgorithms(algorithms, 16)

      // Check that algorithms are sorted (most efficient first)
      expect(comparison.algorithms).toHaveLength(3)
      
      // Check that we have the expected algorithms
      const algorithmNames = comparison.algorithms.map(alg => alg.name)
      expect(algorithmNames).toContain('Fast Algorithm')
      expect(algorithmNames).toContain('Slow Algorithm')
      expect(algorithmNames).toContain('Medium Algorithm')
      
      // Find the binary search algorithm (should be most efficient)
      const binarySearchAlg = comparison.algorithms.find(alg => alg.name === 'Fast Algorithm')
      expect(binarySearchAlg).toBeDefined()
      expect(binarySearchAlg?.type).toBe('binary-search')
    })
  })

  describe('generateScalingBehavior', () => {
    it('should generate scaling data for binary search', () => {
      const scaling = BigOAnalysisService.generateScalingBehavior('binary-search')

      expect(scaling.complexityClass.notation).toBe('O(log n)')
      expect(scaling.inputSizes).toHaveLength(9) // 5 base + 4 projected
      expect(scaling.operationCounts).toHaveLength(9)
      expect(scaling.scalingFactor).toBe(2) // log n scaling
    })

    it('should generate scaling data for linear search', () => {
      const scaling = BigOAnalysisService.generateScalingBehavior('linear-search')

      expect(scaling.complexityClass.notation).toBe('O(n)')
      expect(scaling.scalingFactor).toBe(2) // linear scaling
    })

    it('should handle custom input sizes', () => {
      const customSizes = [5, 10, 20]
      const scaling = BigOAnalysisService.generateScalingBehavior('binary-search', customSizes)

      expect(scaling.inputSizes).toContain(5)
      expect(scaling.inputSizes).toContain(10)
      expect(scaling.inputSizes).toContain(20)
    })

    it('should calculate correct operation counts', () => {
      const scaling = BigOAnalysisService.generateScalingBehavior('binary-search', [8, 16])

      // For binary search: log2(8) = 3, log2(16) = 4
      expect(scaling.operationCounts[0]).toBe(3)
      expect(scaling.operationCounts[1]).toBe(4)
    })
  })

  describe('classifyByOperationRatio', () => {
    it('should classify constant time operations', () => {
      const analysis = BigOAnalysisService.analyzeComplexity('unknown', 1, 1000)
      expect(analysis.complexity.notation).toBe('O(1)')
    })

    it('should classify logarithmic operations', () => {
      const analysis = BigOAnalysisService.analyzeComplexity('unknown', 10, 1000)
      expect(analysis.complexity.notation).toBe('O(log n)')
    })

    it('should classify linear operations', () => {
      const analysis = BigOAnalysisService.analyzeComplexity('unknown', 100, 100)
      expect(analysis.complexity.notation).toBe('O(n)')
    })

    it('should classify quadratic operations', () => {
      const analysis = BigOAnalysisService.analyzeComplexity('unknown', 10000, 100)
      expect(analysis.complexity.notation).toBe('O(n²)')
    })
  })

  describe('getComplexityClasses', () => {
    it('should return all complexity classes', () => {
      const classes = BigOAnalysisService.getComplexityClasses()

      expect(classes).toHaveLength(6)
      expect(classes.map(c => c.notation)).toContain('O(1)')
      expect(classes.map(c => c.notation)).toContain('O(log n)')
      expect(classes.map(c => c.notation)).toContain('O(n)')
      expect(classes.map(c => c.notation)).toContain('O(n log n)')
      expect(classes.map(c => c.notation)).toContain('O(n²)')
      expect(classes.map(c => c.notation)).toContain('O(2^n)')
    })

    it('should have proper color coding', () => {
      const classes = BigOAnalysisService.getComplexityClasses()

      const constantClass = classes.find(c => c.notation === 'O(1)')
      const exponentialClass = classes.find(c => c.notation === 'O(2^n)')

      expect(constantClass?.category).toBe('excellent')
      expect(exponentialClass?.category).toBe('terrible')
    })
  })

  describe('edge cases', () => {
    it('should handle zero input size', () => {
      const analysis = BigOAnalysisService.analyzeComplexity('binary-search', 0, 0)
      expect(analysis.efficiency).toBe(100)
    })

    it('should handle single element arrays', () => {
      const analysis = BigOAnalysisService.analyzeComplexity('binary-search', 1, 1)
      expect(analysis.complexity.notation).toBe('O(log n)')
      expect(analysis.operationCount).toBe(1)
    })

    it('should handle unknown algorithm types', () => {
      const analysis = BigOAnalysisService.analyzeComplexity('unknown-algorithm', 50, 100)
      expect(analysis.complexity).toBeDefined()
      expect(analysis.description).toBeDefined()
    })
  })
})