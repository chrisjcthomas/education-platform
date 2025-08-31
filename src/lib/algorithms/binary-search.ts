import { AlgorithmStep } from '../types'

export interface BinarySearchResult {
  found: boolean
  index: number
  steps: AlgorithmStep[]
  comparisons: number
}

export interface BinarySearchInput {
  data: number[]
  target: number
  trackSteps?: boolean
}

/**
 * JavaScript implementation of binary search algorithm with comprehensive step tracking
 * for educational visualization and analysis
 */
export class BinarySearchAlgorithm {
  private steps: AlgorithmStep[] = []
  private comparisons = 0

  /**
   * Execute binary search with step-by-step tracking
   */
  async execute(input: BinarySearchInput): Promise<BinarySearchResult> {
    const { data, target, trackSteps = true } = input
    
    // Reset tracking state
    this.steps = []
    this.comparisons = 0

    // Input validation
    this.validateInput(data, target)

    if (trackSteps) {
      this.addStep({
        type: 'init',
        indices: [],
        metadata: { 
          target, 
          arrayLength: data.length,
          algorithm: 'binary-search',
          language: 'javascript'
        },
        description: `Initialize binary search for target ${target} in sorted array of ${data.length} elements`
      })
    }

    // Handle edge cases
    if (data.length === 0) {
      if (trackSteps) {
        this.addStep({
          type: 'eliminate',
          indices: [],
          metadata: { found: false, reason: 'empty-array' },
          description: 'Array is empty - target cannot be found'
        })
      }
      return { found: false, index: -1, steps: this.steps, comparisons: this.comparisons }
    }

    // Perform binary search
    const result = await this.binarySearchCore(data, target, trackSteps)
    
    return {
      found: result.found,
      index: result.index,
      steps: this.steps,
      comparisons: this.comparisons
    }
  }

  /**
   * Core binary search implementation with step tracking
   */
  private async binarySearchCore(
    data: number[], 
    target: number, 
    trackSteps: boolean
  ): Promise<{ found: boolean; index: number }> {
    let left = 0
    let right = data.length - 1

    while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      
      if (trackSteps) {
        // Show current search range
        this.addStep({
          type: 'highlight',
          indices: this.generateRangeIndices(left, right),
          metadata: { 
            left, 
            right, 
            mid,
            searchRange: true,
            rangeSize: right - left + 1
          },
          description: `Search range: [${left}, ${right}] (${right - left + 1} elements)`
        })

        // Show pointer positions
        this.addStep({
          type: 'highlight',
          indices: [left, mid, right],
          metadata: { 
            left, 
            right, 
            mid,
            pointers: { left, mid, right },
            leftValue: data[left],
            midValue: data[mid],
            rightValue: data[right]
          },
          description: `Pointers: left=${left}(${data[left]}), mid=${mid}(${data[mid]}), right=${right}(${data[right]})`
        })
      }

      // Compare target with middle element
      this.comparisons++
      
      if (trackSteps) {
        this.addStep({
          type: 'compare',
          indices: [mid],
          metadata: { 
            left, 
            right, 
            mid,
            targetValue: target,
            midValue: data[mid],
            comparison: this.getComparisonResult(target, data[mid]),
            comparisonCount: this.comparisons
          },
          description: `Compare: target(${target}) ${this.getComparisonSymbol(target, data[mid])} mid(${data[mid]})`
        })
      }

      if (data[mid] === target) {
        // Target found
        if (trackSteps) {
          this.addStep({
            type: 'found',
            indices: [mid],
            metadata: { 
              left, 
              right, 
              mid,
              found: true,
              targetValue: target,
              foundIndex: mid,
              totalComparisons: this.comparisons
            },
            description: `🎉 Found target ${target} at index ${mid} after ${this.comparisons} comparisons!`
          })
        }
        return { found: true, index: mid }
      } else if (data[mid] < target) {
        // Target is in right half - eliminate left half
        if (trackSteps) {
          const eliminatedIndices = this.generateRangeIndices(left, mid)
          this.addStep({
            type: 'eliminate',
            indices: eliminatedIndices,
            metadata: { 
              left, 
              right, 
              mid,
              eliminated: 'left',
              eliminatedRange: [left, mid],
              reason: `${data[mid]} < ${target}`,
              remainingRange: [mid + 1, right],
              remainingSize: right - mid
            },
            description: `${data[mid]} < ${target}: eliminate left half [${left}, ${mid}], search [${mid + 1}, ${right}]`
          })
        }
        left = mid + 1
      } else {
        // Target is in left half - eliminate right half
        if (trackSteps) {
          const eliminatedIndices = this.generateRangeIndices(mid, right)
          this.addStep({
            type: 'eliminate',
            indices: eliminatedIndices,
            metadata: { 
              left, 
              right, 
              mid,
              eliminated: 'right',
              eliminatedRange: [mid, right],
              reason: `${data[mid]} > ${target}`,
              remainingRange: [left, mid - 1],
              remainingSize: mid - left
            },
            description: `${data[mid]} > ${target}: eliminate right half [${mid}, ${right}], search [${left}, ${mid - 1}]`
          })
        }
        right = mid - 1
      }
    }

    // Target not found
    if (trackSteps) {
      this.addStep({
        type: 'eliminate',
        indices: [],
        metadata: { 
          found: false,
          totalComparisons: this.comparisons,
          searchExhausted: true,
          finalLeft: left,
          finalRight: right
        },
        description: `❌ Target ${target} not found after ${this.comparisons} comparisons (search space exhausted)`
      })
    }

    return { found: false, index: -1 }
  }

  /**
   * Generate array of indices for a given range
   */
  private generateRangeIndices(start: number, end: number): number[] {
    const indices: number[] = []
    for (let i = start; i <= end; i++) {
      indices.push(i)
    }
    return indices
  }

  /**
   * Get comparison result as string
   */
  private getComparisonResult(target: number, mid: number): 'equal' | 'less' | 'greater' {
    if (target === mid) return 'equal'
    if (target < mid) return 'less'
    return 'greater'
  }

  /**
   * Get comparison symbol for display
   */
  private getComparisonSymbol(target: number, mid: number): string {
    if (target === mid) return '=='
    if (target < mid) return '<'
    return '>'
  }

  /**
   * Add a step to the tracking array
   */
  private addStep(step: AlgorithmStep): void {
    this.steps.push({
      ...step,
      operationCount: this.steps.length + 1
    })
  }

  /**
   * Validate input parameters
   */
  private validateInput(data: number[], target: number): void {
    if (!Array.isArray(data)) {
      throw new Error('Input data must be an array')
    }

    if (typeof target !== 'number' || !isFinite(target)) {
      throw new Error('Target must be a finite number')
    }

    // Check if array is sorted (for educational purposes)
    for (let i = 1; i < data.length; i++) {
      if (data[i] < data[i - 1]) {
        throw new Error(`Array must be sorted for binary search. Found ${data[i]} < ${data[i - 1]} at indices ${i} and ${i - 1}`)
      }
    }

    // Check for non-numeric values
    for (let i = 0; i < data.length; i++) {
      if (typeof data[i] !== 'number' || !isFinite(data[i])) {
        throw new Error(`Array element at index ${i} must be a finite number, got: ${data[i]}`)
      }
    }
  }

  /**
   * Get algorithm complexity information
   */
  static getComplexityInfo() {
    return {
      timeComplexity: 'O(log n)',
      spaceComplexity: 'O(1)',
      bestCase: 'O(1)',
      worstCase: 'O(log n)',
      averageCase: 'O(log n)',
      description: 'Binary search divides the search space in half with each comparison, resulting in logarithmic time complexity.'
    }
  }

  /**
   * Generate test cases for educational purposes
   */
  static generateTestCases(): Array<{ data: number[], target: number, expected: { found: boolean, index: number } }> {
    return [
      // Basic cases
      { data: [1, 3, 5, 7, 9], target: 5, expected: { found: true, index: 2 } },
      { data: [1, 3, 5, 7, 9], target: 1, expected: { found: true, index: 0 } },
      { data: [1, 3, 5, 7, 9], target: 9, expected: { found: true, index: 4 } },
      { data: [1, 3, 5, 7, 9], target: 4, expected: { found: false, index: -1 } },
      
      // Edge cases
      { data: [], target: 5, expected: { found: false, index: -1 } },
      { data: [5], target: 5, expected: { found: true, index: 0 } },
      { data: [5], target: 3, expected: { found: false, index: -1 } },
      
      // Larger arrays
      { data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], target: 7, expected: { found: true, index: 6 } },
      { data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], target: 11, expected: { found: false, index: -1 } },
      
      // Duplicate values
      { data: [1, 2, 2, 2, 5], target: 2, expected: { found: true, index: 1 } }, // May find any occurrence
    ]
  }
}

/**
 * Convenience function for simple binary search without step tracking
 */
export async function binarySearch(data: number[], target: number): Promise<number> {
  const algorithm = new BinarySearchAlgorithm()
  const result = await algorithm.execute({ data, target, trackSteps: false })
  return result.index
}

/**
 * Convenience function for binary search with full step tracking
 */
export async function binarySearchWithSteps(data: number[], target: number): Promise<BinarySearchResult> {
  const algorithm = new BinarySearchAlgorithm()
  return algorithm.execute({ data, target, trackSteps: true })
}