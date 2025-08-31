import { BinarySearchAlgorithm, BinarySearchResult, BinarySearchInput } from '../algorithms/binary-search'
import { AlgorithmStep, PerformanceMetrics, CodeLanguage } from '../types'

/**
 * Service class that provides high-level binary search operations
 * with educational features and cross-language support
 */
export class BinarySearchService {
  private jsAlgorithm: BinarySearchAlgorithm
  private pythonCode: string

  constructor() {
    this.jsAlgorithm = new BinarySearchAlgorithm()
    this.pythonCode = this.getPythonImplementation()
  }

  /**
   * Execute binary search in the specified language
   */
  async execute(
    data: number[],
    target: number,
    language: CodeLanguage = 'javascript',
    trackSteps: boolean = true
  ): Promise<BinarySearchResult> {
    if (language === 'javascript') {
      return this.executeJavaScript(data, target, trackSteps)
    } else {
      return this.executePython(data, target, trackSteps)
    }
  }

  /**
   * Execute JavaScript binary search
   */
  private async executeJavaScript(
    data: number[],
    target: number,
    trackSteps: boolean
  ): Promise<BinarySearchResult> {
    const input: BinarySearchInput = { data, target, trackSteps }
    return this.jsAlgorithm.execute(input)
  }

  /**
   * Execute Python binary search using Pyodide
   */
  private async executePython(
    data: number[],
    target: number,
    trackSteps: boolean
  ): Promise<BinarySearchResult> {
    try {
      // Check if Pyodide is available
      if (typeof window === 'undefined' || !(window as any).pyodide) {
        throw new Error('Pyodide is not available. Please ensure it is loaded.')
      }

      const pyodide = (window as any).pyodide

      // Execute Python code
      const pythonScript = `
${this.pythonCode}

# Execute the algorithm
algorithm = BinarySearchAlgorithm()
result = algorithm.execute(${JSON.stringify(data)}, ${target}, ${trackSteps})
result_dict = result.to_dict()
result_dict
`

      const result = pyodide.runPython(pythonScript)
      
      return {
        found: result.found,
        index: result.index,
        steps: result.steps,
        comparisons: result.comparisons
      }
    } catch (error) {
      console.error('Python execution error:', error)
      // Fallback to JavaScript implementation
      console.warn('Falling back to JavaScript implementation')
      return this.executeJavaScript(data, target, trackSteps)
    }
  }

  /**
   * Get algorithm complexity information
   */
  getComplexityInfo(): PerformanceMetrics {
    const info = BinarySearchAlgorithm.getComplexityInfo()
    return {
      totalOperations: 0, // Will be filled during execution
      timeComplexity: info.timeComplexity,
      spaceComplexity: info.spaceComplexity,
      actualRuntime: 0, // Will be measured during execution
      comparisonCount: 0 // Will be filled during execution
    }
  }

  /**
   * Generate educational test cases
   */
  generateTestCases(): Array<{
    data: number[]
    target: number
    expected: { found: boolean; index: number }
    description: string
    difficulty: 'easy' | 'medium' | 'hard'
  }> {
    const baseCases = BinarySearchAlgorithm.generateTestCases()
    
    return baseCases.map((testCase, index) => ({
      ...testCase,
      description: this.getTestCaseDescription(testCase, index),
      difficulty: this.getTestCaseDifficulty(testCase)
    }))
  }

  /**
   * Validate input for binary search
   */
  validateInput(data: number[], target: number): {
    isValid: boolean
    errors: string[]
    warnings: string[]
  } {
    const errors: string[] = []
    const warnings: string[] = []

    // Check if data is an array
    if (!Array.isArray(data)) {
      errors.push('Input data must be an array')
      return { isValid: false, errors, warnings }
    }

    // Check if target is a number
    if (typeof target !== 'number' || !isFinite(target)) {
      errors.push('Target must be a finite number')
    }

    // Check for empty array
    if (data.length === 0) {
      warnings.push('Array is empty - binary search will return not found')
    }

    // Check if array is sorted
    let isSorted = true
    for (let i = 1; i < data.length; i++) {
      if (data[i] < data[i - 1]) {
        errors.push(`Array must be sorted for binary search. Found ${data[i]} < ${data[i - 1]} at indices ${i} and ${i - 1}`)
        isSorted = false
        break
      }
    }

    // Check for non-numeric values
    for (let i = 0; i < data.length; i++) {
      if (typeof data[i] !== 'number' || !isFinite(data[i])) {
        errors.push(`Array element at index ${i} must be a finite number, got: ${data[i]}`)
      }
    }

    // Performance warnings
    if (data.length > 10000) {
      warnings.push('Large array detected - visualization may be slow')
    }

    // Educational warnings
    if (isSorted && data.length > 1) {
      const hasTarget = data.includes(target)
      if (!hasTarget) {
        const closest = this.findClosestValue(data, target)
        warnings.push(`Target ${target} not in array. Closest value is ${closest.value} at index ${closest.index}`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Compare binary search with linear search for educational purposes
   */
  async compareWithLinearSearch(data: number[], target: number): Promise<{
    binarySearch: BinarySearchResult
    linearSearch: { found: boolean; index: number; comparisons: number }
    comparison: {
      binarySearchSteps: number
      linearSearchSteps: number
      efficiency: string
      explanation: string
    }
  }> {
    // Execute binary search
    const binaryResult = await this.execute(data, target, 'javascript', true)

    // Simulate linear search
    const linearResult = this.simulateLinearSearch(data, target)

    // Calculate comparison
    const comparison = {
      binarySearchSteps: binaryResult.comparisons,
      linearSearchSteps: linearResult.comparisons,
      efficiency: binaryResult.comparisons < linearResult.comparisons ? 'Binary search is more efficient' : 'Linear search is more efficient',
      explanation: this.generateComparisonExplanation(binaryResult.comparisons, linearResult.comparisons, data.length)
    }

    return {
      binarySearch: binaryResult,
      linearSearch: linearResult,
      comparison
    }
  }

  /**
   * Get step-by-step explanation for educational purposes
   */
  getStepExplanation(step: AlgorithmStep, learningMode: 'beginner' | 'curious' | 'details'): string {
    switch (learningMode) {
      case 'beginner':
        return this.getBeginnerExplanation(step)
      case 'curious':
        return this.getCuriousExplanation(step)
      case 'details':
        return this.getDetailedExplanation(step)
      default:
        return step.description
    }
  }

  // Private helper methods

  private getPythonImplementation(): string {
    // Return the Python implementation as a string
    // This would typically be loaded from the .py file
    return `
class BinarySearchResult:
    def __init__(self, found, index, steps, comparisons):
        self.found = found
        self.index = index
        self.steps = steps
        self.comparisons = comparisons
    
    def to_dict(self):
        return {
            'found': self.found,
            'index': self.index,
            'steps': self.steps,
            'comparisons': self.comparisons
        }

class BinarySearchAlgorithm:
    def __init__(self):
        self.steps = []
        self.comparisons = 0
    
    def execute(self, data, target, track_steps=True):
        self.steps = []
        self.comparisons = 0
        
        if not data:
            return BinarySearchResult(False, -1, self.steps, self.comparisons)
        
        left, right = 0, len(data) - 1
        
        while left <= right:
            mid = (left + right) // 2
            self.comparisons += 1
            
            if track_steps:
                self.steps.append({
                    'type': 'compare',
                    'indices': [mid],
                    'metadata': {
                        'left': left, 'right': right, 'mid': mid,
                        'targetValue': target, 'midValue': data[mid],
                        'comparisonCount': self.comparisons
                    },
                    'description': f'Compare target({target}) with mid({data[mid]})',
                    'operationCount': len(self.steps) + 1
                })
            
            if data[mid] == target:
                if track_steps:
                    self.steps.append({
                        'type': 'found',
                        'indices': [mid],
                        'metadata': {'found': True, 'foundIndex': mid},
                        'description': f'Found target {target} at index {mid}',
                        'operationCount': len(self.steps) + 1
                    })
                return BinarySearchResult(True, mid, self.steps, self.comparisons)
            elif data[mid] < target:
                left = mid + 1
            else:
                right = mid - 1
        
        return BinarySearchResult(False, -1, self.steps, self.comparisons)
`
  }

  private getTestCaseDescription(testCase: any, index: number): string {
    const { data, target, expected } = testCase
    
    if (data.length === 0) {
      return 'Empty array test case'
    } else if (data.length === 1) {
      return 'Single element test case'
    } else if (expected.found) {
      if (expected.index === 0) {
        return 'Target at beginning of array'
      } else if (expected.index === data.length - 1) {
        return 'Target at end of array'
      } else {
        return 'Target in middle of array'
      }
    } else {
      return 'Target not in array'
    }
  }

  private getTestCaseDifficulty(testCase: any): 'easy' | 'medium' | 'hard' {
    const { data, expected } = testCase
    
    if (data.length <= 1) return 'easy'
    if (data.length <= 5) return 'easy'
    if (data.length <= 10) return 'medium'
    return 'hard'
  }

  private findClosestValue(data: number[], target: number): { value: number; index: number } {
    let closest = data[0]
    let closestIndex = 0
    let minDiff = Math.abs(data[0] - target)

    for (let i = 1; i < data.length; i++) {
      const diff = Math.abs(data[i] - target)
      if (diff < minDiff) {
        minDiff = diff
        closest = data[i]
        closestIndex = i
      }
    }

    return { value: closest, index: closestIndex }
  }

  private simulateLinearSearch(data: number[], target: number): { found: boolean; index: number; comparisons: number } {
    let comparisons = 0
    
    for (let i = 0; i < data.length; i++) {
      comparisons++
      if (data[i] === target) {
        return { found: true, index: i, comparisons }
      }
    }
    
    return { found: false, index: -1, comparisons }
  }

  private generateComparisonExplanation(binarySteps: number, linearSteps: number, arraySize: number): string {
    const efficiency = ((linearSteps - binarySteps) / linearSteps * 100).toFixed(1)
    
    return `Binary search took ${binarySteps} comparisons while linear search took ${linearSteps} comparisons for an array of ${arraySize} elements. Binary search was ${efficiency}% more efficient. For larger arrays, this difference becomes even more significant due to binary search's O(log n) complexity versus linear search's O(n) complexity.`
  }

  private getBeginnerExplanation(step: AlgorithmStep): string {
    switch (step.type) {
      case 'init':
        return "We're starting our search! Think of it like looking for a word in a dictionary - we'll start in the middle and narrow down our search."
      case 'compare':
        return `We're checking the middle item to see if it's our target. It's like opening a dictionary to the middle page to see if we're close to our word.`
      case 'eliminate':
        return "We can throw away half of our search area! Just like in a dictionary, if our word comes before the current page, we can ignore everything after it."
      case 'found':
        return "🎉 We found it! Just like finding the right page in a dictionary by always going to the middle."
      default:
        return step.description
    }
  }

  private getCuriousExplanation(step: AlgorithmStep): string {
    switch (step.type) {
      case 'init':
        return `Starting binary search algorithm. We'll use three pointers (left, middle, right) to track our search space.`
      case 'compare':
        const metadata = step.metadata as any
        return `Comparing target (${metadata.targetValue}) with middle element (${metadata.midValue}). This is comparison #${metadata.comparisonCount}.`
      case 'eliminate':
        const elimMeta = step.metadata as any
        return `Eliminating ${elimMeta.eliminated} half of the search space. Remaining elements: ${elimMeta.remainingSize}.`
      case 'found':
        return `Target found! Binary search completed successfully with fewer comparisons than linear search would need.`
      default:
        return step.description
    }
  }

  private getDetailedExplanation(step: AlgorithmStep): string {
    // Return the full technical description
    return step.description
  }
}