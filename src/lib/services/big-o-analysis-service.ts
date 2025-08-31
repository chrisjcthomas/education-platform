import { BigOAnalysis, ComplexityClass, ComplexityComparison, ScalingBehavior } from '../types'

/**
 * Service for analyzing algorithm complexity and providing Big-O insights
 */
export class BigOAnalysisService {
  private static readonly COMPLEXITY_CLASSES: Record<string, ComplexityClass> = {
    'O(1)': {
      notation: 'O(1)',
      name: 'Constant',
      category: 'excellent',
      color: '#10b981' // green
    },
    'O(log n)': {
      notation: 'O(log n)',
      name: 'Logarithmic',
      category: 'excellent',
      color: '#059669' // dark green
    },
    'O(n)': {
      notation: 'O(n)',
      name: 'Linear',
      category: 'good',
      color: '#3b82f6' // blue
    },
    'O(n log n)': {
      notation: 'O(n log n)',
      name: 'Linearithmic',
      category: 'fair',
      color: '#f59e0b' // amber
    },
    'O(n²)': {
      notation: 'O(n²)',
      name: 'Quadratic',
      category: 'poor',
      color: '#ef4444' // red
    },
    'O(2^n)': {
      notation: 'O(2^n)',
      name: 'Exponential',
      category: 'terrible',
      color: '#dc2626' // dark red
    }
  }

  /**
   * Analyze the complexity of an algorithm based on operation count and input size
   */
  static analyzeComplexity(
    algorithmType: string,
    operationCount: number,
    inputSize: number
  ): BigOAnalysis {
    const complexity = this.classifyComplexity(algorithmType, operationCount, inputSize)
    const efficiency = this.calculateEfficiency(operationCount, inputSize, complexity)
    
    return {
      complexity,
      operationCount,
      inputSize,
      efficiency,
      description: this.getComplexityDescription(complexity),
      plainLanguageExplanation: this.getPlainLanguageExplanation(complexity, inputSize)
    }
  }

  /**
   * Classify the complexity based on algorithm type and actual performance
   */
  private static classifyComplexity(
    algorithmType: string,
    operationCount: number,
    inputSize: number
  ): ComplexityClass {
    // Algorithm-specific classification
    switch (algorithmType) {
      case 'binary-search':
        return this.COMPLEXITY_CLASSES['O(log n)']
      case 'linear-search':
        return this.COMPLEXITY_CLASSES['O(n)']
      case 'bubble-sort':
      case 'selection-sort':
        return this.COMPLEXITY_CLASSES['O(n²)']
      case 'merge-sort':
      case 'quick-sort':
        return this.COMPLEXITY_CLASSES['O(n log n)']
      default:
        // Fallback: analyze based on operation count ratio
        return this.classifyByOperationRatio(operationCount, inputSize)
    }
  }

  /**
   * Classify complexity by analyzing the ratio of operations to input size
   */
  private static classifyByOperationRatio(operationCount: number, inputSize: number): ComplexityClass {
    if (inputSize === 0) return this.COMPLEXITY_CLASSES['O(1)']
    
    const ratio = operationCount / inputSize
    const logRatio = operationCount / Math.log2(inputSize)
    
    if (operationCount <= 1) {
      return this.COMPLEXITY_CLASSES['O(1)']
    } else if (logRatio <= 2) {
      return this.COMPLEXITY_CLASSES['O(log n)']
    } else if (ratio <= 2) {
      return this.COMPLEXITY_CLASSES['O(n)']
    } else if (operationCount <= inputSize * Math.log2(inputSize) * 2) {
      return this.COMPLEXITY_CLASSES['O(n log n)']
    } else if (operationCount <= inputSize * inputSize) {
      return this.COMPLEXITY_CLASSES['O(n²)']
    } else {
      return this.COMPLEXITY_CLASSES['O(2^n)']
    }
  }

  /**
   * Calculate efficiency score (0-100) based on complexity
   */
  private static calculateEfficiency(
    operationCount: number,
    inputSize: number,
    complexity: ComplexityClass
  ): number {
    if (inputSize === 0) return 100
    
    const theoretical = this.getTheoreticalOperations(inputSize, complexity.notation)
    const efficiency = Math.max(0, Math.min(100, (theoretical / operationCount) * 100))
    
    return Math.round(efficiency)
  }

  /**
   * Get theoretical operation count for a given complexity and input size
   */
  private static getTheoreticalOperations(inputSize: number, notation: string): number {
    switch (notation) {
      case 'O(1)':
        return 1
      case 'O(log n)':
        return Math.ceil(Math.log2(inputSize))
      case 'O(n)':
        return inputSize
      case 'O(n log n)':
        return inputSize * Math.ceil(Math.log2(inputSize))
      case 'O(n²)':
        return inputSize * inputSize
      case 'O(2^n)':
        return Math.pow(2, inputSize)
      default:
        return inputSize
    }
  }

  /**
   * Get technical description of the complexity class
   */
  private static getComplexityDescription(complexity: ComplexityClass): string {
    const descriptions = {
      'O(1)': 'Constant time - performance doesn\'t change with input size',
      'O(log n)': 'Logarithmic time - very efficient, eliminates half the possibilities each step',
      'O(n)': 'Linear time - performance scales directly with input size',
      'O(n log n)': 'Linearithmic time - efficient for sorting algorithms',
      'O(n²)': 'Quadratic time - performance degrades quickly with larger inputs',
      'O(2^n)': 'Exponential time - performance becomes impractical for large inputs'
    }
    
    return descriptions[complexity.notation as keyof typeof descriptions] || 'Unknown complexity class'
  }

  /**
   * Get plain language explanation suitable for beginners
   */
  private static getPlainLanguageExplanation(complexity: ComplexityClass, inputSize: number): string {
    const examples = {
      'O(1)': `Like finding a book when you know exactly which shelf it's on - always takes the same time regardless of how many books there are.`,
      'O(log n)': `Like finding a word in a dictionary by opening to the middle and eliminating half the pages each time. With ${inputSize} items, you only need about ${Math.ceil(Math.log2(inputSize))} steps!`,
      'O(n)': `Like looking through a list from start to finish. With ${inputSize} items, you might need to check all ${inputSize} of them in the worst case.`,
      'O(n log n)': `Like organizing a deck of cards by repeatedly splitting and merging piles. More work than linear, but still manageable.`,
      'O(n²)': `Like comparing every item with every other item. With ${inputSize} items, that's potentially ${inputSize * inputSize} comparisons!`,
      'O(2^n)': `Like trying every possible combination. The work doubles with each new item - quickly becomes impossible!`
    }
    
    return examples[complexity.notation as keyof typeof examples] || 'This algorithm\'s efficiency depends on the input size.'
  }

  /**
   * Compare multiple algorithms' complexity
   */
  static compareAlgorithms(
    algorithms: Array<{
      name: string
      type: string
      operationCount: number
    }>,
    inputSize: number
  ): ComplexityComparison {
    const analyzed = algorithms.map(alg => {
      const analysis = this.analyzeComplexity(alg.type, alg.operationCount, inputSize)
      return {
        name: alg.name,
        complexity: analysis.complexity,
        operationCount: alg.operationCount,
        efficiency: analysis.efficiency
      }
    })

    // Find the most efficient algorithm
    const winner = analyzed.reduce((best, current) => 
      current.efficiency > best.efficiency ? current : best
    )

    const explanation = this.generateComparisonExplanation(analyzed, winner)

    return {
      algorithms: analyzed,
      inputSize,
      winner: winner.name,
      explanation
    }
  }

  /**
   * Generate explanation for algorithm comparison
   */
  private static generateComparisonExplanation(
    algorithms: ComplexityComparison['algorithms'],
    winner: ComplexityComparison['algorithms'][0]
  ): string {
    const sorted = [...algorithms].sort((a, b) => b.efficiency - a.efficiency)
    
    if (sorted.length === 1) {
      return `${winner.name} completed the task in ${winner.operationCount} operations.`
    }

    const best = sorted[0]
    const worst = sorted[sorted.length - 1]
    
    if (best.operationCount === worst.operationCount) {
      return `All algorithms performed equally with ${best.operationCount} operations.`
    }

    const improvement = Math.round((worst.operationCount / best.operationCount) * 10) / 10
    
    return `${best.name} (${best.complexity.notation}) is ${improvement}x more efficient than ${worst.name} (${worst.complexity.notation}), using ${best.operationCount} vs ${worst.operationCount} operations.`
  }

  /**
   * Generate scaling behavior data for visualization
   */
  static generateScalingBehavior(
    algorithmType: string,
    baseSizes: number[] = [10, 50, 100, 500, 1000]
  ): ScalingBehavior {
    const complexity = this.classifyComplexity(algorithmType, 0, 100) // Get base complexity
    
    const operationCounts = baseSizes.map(size => 
      this.getTheoreticalOperations(size, complexity.notation)
    )

    // Project to larger sizes
    const projectedSizes = [5000, 10000, 50000, 100000]
    const projectedCounts = projectedSizes.map(size =>
      this.getTheoreticalOperations(size, complexity.notation)
    )

    // Calculate scaling factor (how much operations increase when input doubles)
    const scalingFactor = this.calculateScalingFactor(complexity.notation)

    return {
      inputSizes: [...baseSizes, ...projectedSizes],
      operationCounts: [...operationCounts, ...projectedCounts],
      complexityClass: complexity,
      projectedCounts,
      scalingFactor
    }
  }

  /**
   * Calculate how operations scale when input size doubles
   */
  private static calculateScalingFactor(notation: string): number {
    switch (notation) {
      case 'O(1)': return 1
      case 'O(log n)': return 2 // log(2n) ≈ log(n) + 1
      case 'O(n)': return 2
      case 'O(n log n)': return 2.2 // approximately
      case 'O(n²)': return 4
      case 'O(2^n)': return Math.pow(2, 1) // 2^(n+1) = 2 * 2^n
      default: return 2
    }
  }

  /**
   * Get all available complexity classes for reference
   */
  static getComplexityClasses(): ComplexityClass[] {
    return Object.values(this.COMPLEXITY_CLASSES)
  }
}