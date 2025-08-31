import { EducationalError } from '@/lib/types'

// Pyodide instance type
interface PyodideInterface {
  runPython: (code: string) => any
  globals: any
  loadPackage: (packages: string | string[]) => Promise<any>
  registerJsModule: (name: string, module: any) => void
}

export class PythonExecutionService {
  private pyodide: PyodideInterface | null = null
  private isInitializing = false
  private initializationPromise: Promise<void> | null = null

  /**
   * Initialize Pyodide with educational packages and safety measures
   */
  async initialize(): Promise<void> {
    if (this.pyodide) return
    if (this.isInitializing && this.initializationPromise) {
      return this.initializationPromise
    }

    this.isInitializing = true
    this.initializationPromise = this._initializePyodide()
    
    try {
      await this.initializationPromise
    } finally {
      this.isInitializing = false
    }
  }

  private async _initializePyodide(): Promise<void> {
    try {
      // Check if we're in browser environment
      if (typeof window === 'undefined') {
        throw new Error('Pyodide can only run in browser environment')
      }

      // Load Pyodide from CDN using script tag approach for better compatibility
      if (!(window as any).loadPyodide) {
        await this.loadPyodideScript()
      }

      const loadPyodide = (window as any).loadPyodide
      
      this.pyodide = await loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.28.2/full/',
        stdout: (text: string) => {
          console.log('Python output:', text)
        },
        stderr: (text: string) => {
          console.error('Python error:', text)
        }
      })

      // Set up educational environment
      await this.setupEducationalEnvironment()
      
    } catch (error) {
      console.error('Failed to initialize Pyodide:', error)
      throw new Error('Failed to initialize Python environment')
    }
  }

  /**
   * Load Pyodide script from CDN
   */
  private async loadPyodideScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).loadPyodide) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.28.2/full/pyodide.js'
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Pyodide from CDN'))
      document.head.appendChild(script)
    })
  }

  /**
   * Set up educational Python environment with safety measures
   */
  private async setupEducationalEnvironment(): Promise<void> {
    if (!this.pyodide) return

    // Install commonly used packages for algorithms
    try {
      await this.pyodide.loadPackage(['numpy'])
    } catch (_error) {
      console.warn('Could not load numpy, continuing without it')
    }

    // Set up educational utilities and safety measures
    this.pyodide.runPython(`
import sys
import time
import traceback
from typing import List, Any, Optional

# Educational utilities for algorithm visualization
class AlgorithmStep:
    def __init__(self, step_type: str, indices: List[int], description: str, metadata: dict = None):
        self.type = step_type
        self.indices = indices
        self.description = description
        self.metadata = metadata or {}

class AlgorithmTracker:
    def __init__(self):
        self.steps = []
        self.operation_count = 0
    
    def add_step(self, step_type: str, indices: List[int], description: str, metadata: dict = None):
        self.steps.append(AlgorithmStep(step_type, indices, description, metadata))
        self.operation_count += 1
    
    def get_steps(self):
        return [(step.type, step.indices, step.description, step.metadata) for step in self.steps]
    
    def reset(self):
        self.steps = []
        self.operation_count = 0

# Global tracker instance
tracker = AlgorithmTracker()

# Safety: Limit execution time
class TimeoutError(Exception):
    pass

def timeout_handler():
    raise TimeoutError("Code execution timed out")

# Educational binary search implementation
def binary_search_educational(arr: List[int], target: int) -> int:
    """
    Educational binary search with step tracking
    """
    tracker.reset()
    left = 0
    right = len(arr) - 1
    
    tracker.add_step('init', [left, right], f'Starting binary search for {target}', 
                    {'left': left, 'right': right, 'target': target})
    
    while left <= right:
        mid = (left + right) // 2
        tracker.add_step('compare', [left, mid, right], 
                        f'Comparing arr[{mid}] = {arr[mid]} with target {target}',
                        {'left': left, 'mid': mid, 'right': right, 'value': arr[mid]})
        
        if arr[mid] == target:
            tracker.add_step('found', [mid], f'Found target at index {mid}',
                            {'found_index': mid, 'value': arr[mid]})
            return mid
        elif arr[mid] < target:
            left = mid + 1
            tracker.add_step('eliminate', list(range(0, mid + 1)), 
                            f'Target is larger, eliminating left half',
                            {'new_left': left, 'eliminated': list(range(0, mid + 1))})
        else:
            right = mid - 1
            tracker.add_step('eliminate', list(range(mid, len(arr))), 
                            f'Target is smaller, eliminating right half',
                            {'new_right': right, 'eliminated': list(range(mid, len(arr)))})
    
    tracker.add_step('not_found', [], 'Target not found in array', {'result': -1})
    return -1

# Educational linear search for comparison
def linear_search_educational(arr: List[int], target: int) -> int:
    """
    Educational linear search with step tracking
    """
    tracker.reset()
    
    tracker.add_step('init', [], f'Starting linear search for {target}', {'target': target})
    
    for i in range(len(arr)):
        tracker.add_step('compare', [i], f'Checking arr[{i}] = {arr[i]}',
                        {'index': i, 'value': arr[i], 'target': target})
        
        if arr[i] == target:
            tracker.add_step('found', [i], f'Found target at index {i}',
                            {'found_index': i, 'value': arr[i]})
            return i
    
    tracker.add_step('not_found', [], 'Target not found in array', {'result': -1})
    return -1

# Make functions available globally
globals()['binary_search_educational'] = binary_search_educational
globals()['linear_search_educational'] = linear_search_educational
globals()['tracker'] = tracker
`)
  }

  /**
   * Execute Python code safely with educational error handling
   */
  async executePython(code: string): Promise<{
    result: any
    steps: any[]
    error?: EducationalError
  }> {
    if (!this.pyodide) {
      await this.initialize()
    }

    if (!this.pyodide) {
      throw new Error('Python environment not available')
    }

    try {
      // Set up execution timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT')), 5000)
      })

      // Execute code with timeout
      const executionPromise = this._executeWithSafety(code)
      
      const result = await Promise.race([executionPromise, timeoutPromise])
      
      // Get algorithm steps if available
      const steps = this.getAlgorithmSteps()
      
      return { result, steps }
      
    } catch (error: any) {
      const educationalError = this.convertToEducationalError(error, code)
      return { 
        result: null, 
        steps: [], 
        error: educationalError 
      }
    }
  }

  /**
   * Execute code with safety measures
   */
  private async _executeWithSafety(code: string): Promise<any> {
    if (!this.pyodide) throw new Error('Pyodide not initialized')

    // Sanitize code to prevent dangerous operations
    const sanitizedCode = this.sanitizeCode(code)
    
    // Reset tracker before execution
    this.pyodide.runPython('tracker.reset()')
    
    // Execute the code
    const result = this.pyodide.runPython(sanitizedCode)
    
    return result
  }

  /**
   * Sanitize Python code to prevent dangerous operations
   */
  private sanitizeCode(code: string): string {
    // Remove or replace dangerous imports and operations
    const dangerousPatterns = [
      /import\s+os/g,
      /import\s+subprocess/g,
      /import\s+sys/g,
      /from\s+os/g,
      /from\s+subprocess/g,
      /exec\s*\(/g,
      /eval\s*\(/g,
      /__import__/g,
      /open\s*\(/g,
      /file\s*\(/g
    ]

    let sanitized = code
    dangerousPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '# Removed for safety')
    })

    return sanitized
  }

  /**
   * Get algorithm execution steps from the tracker
   */
  private getAlgorithmSteps(): any[] {
    if (!this.pyodide) return []

    try {
      const stepsData = this.pyodide.runPython('tracker.get_steps()')
      return stepsData || []
    } catch (error) {
      console.warn('Could not retrieve algorithm steps:', error)
      return []
    }
  }

  /**
   * Convert Python errors to educational format
   */
  private convertToEducationalError(error: any, _code: string): EducationalError {
    const message = error.message || error.toString()

    // Handle timeout errors
    if (message.includes('TIMEOUT') || message.includes('timeout')) {
      return {
        message: 'Code execution timed out',
        suggestion: 'Your code might have an infinite loop. Check your loop conditions and make sure they eventually become false.',
        codeExample: 'while left <= right:  # Make sure this condition changes\n    # Update left or right in each iteration'
      }
    }

    // Handle syntax errors
    if (message.includes('SyntaxError') || message.includes('invalid syntax')) {
      return {
        message: 'Python syntax error',
        suggestion: 'Check your Python syntax. Make sure you have proper indentation and colons after if/while/for statements.',
        codeExample: 'if condition:  # Don\'t forget the colon\n    # Indent with 4 spaces\n    pass'
      }
    }

    // Handle indentation errors
    if (message.includes('IndentationError') || message.includes('indentation')) {
      return {
        message: 'Python indentation error',
        suggestion: 'Python uses indentation to define code blocks. Use 4 spaces for each level of indentation.',
        codeExample: 'def function():\n    if condition:\n        # 4 spaces for each level\n        return True'
      }
    }

    // Handle name errors (undefined variables)
    if (message.includes('NameError') || message.includes('not defined')) {
      return {
        message: 'Variable or function not defined',
        suggestion: 'Make sure you\'ve defined all variables and functions before using them.',
        codeExample: 'arr = [1, 2, 3]  # Define before use\nresult = binary_search_educational(arr, 2)'
      }
    }

    // Handle index errors
    if (message.includes('IndexError') || message.includes('index out of range')) {
      return {
        message: 'List index out of range',
        suggestion: 'Check that your list indices are within the valid range (0 to len(list) - 1).',
        codeExample: 'if 0 <= i < len(arr):\n    value = arr[i]  # Safe access'
      }
    }

    // Handle type errors
    if (message.includes('TypeError')) {
      return {
        message: 'Type error in your code',
        suggestion: 'Check that you\'re using the correct data types. For example, you can\'t add a string to a number.',
        codeExample: 'number = int("5")  # Convert string to number\nresult = number + 10'
      }
    }

    // Generic error
    return {
      message: message,
      suggestion: 'Review your Python code for common errors and try again. Check the syntax and make sure all variables are defined.'
    }
  }

  /**
   * Check if Pyodide is ready
   */
  isReady(): boolean {
    return this.pyodide !== null
  }

  /**
   * Get available educational functions
   */
  getAvailableFunctions(): string[] {
    return [
      'binary_search_educational(arr, target)',
      'linear_search_educational(arr, target)',
      'tracker.get_steps()',
      'tracker.reset()'
    ]
  }
}

// Singleton instance
export const pythonExecutionService = new PythonExecutionService()