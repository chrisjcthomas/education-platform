import { CodeLanguage, AlgorithmStep, EducationalError } from '@/lib/types'
import { pythonExecutionService } from './python-execution-service'

export interface LanguageSwitchingResult {
  convertedCode: string
  suggestions: string[]
  warnings?: string[]
}

export interface ExecutionResult {
  result: any
  steps: AlgorithmStep[]
  error?: EducationalError
  language: CodeLanguage
}

export class LanguageSwitchingService {
  /**
   * Convert code between JavaScript and Python
   */
  convertCode(code: string, fromLanguage: CodeLanguage, toLanguage: CodeLanguage): LanguageSwitchingResult {
    if (fromLanguage === toLanguage) {
      return {
        convertedCode: code,
        suggestions: []
      }
    }

    if (fromLanguage === 'javascript' && toLanguage === 'python') {
      return this.convertJavaScriptToPython(code)
    } else {
      return this.convertPythonToJavaScript(code)
    }
  }

  /**
   * Convert JavaScript to Python
   */
  private convertJavaScriptToPython(jsCode: string): LanguageSwitchingResult {
    let pythonCode = jsCode

    // Convert function declarations
    pythonCode = pythonCode.replace(
      /function\s+(\w+)\s*\(([^)]*)\)\s*{/g,
      'def $1($2):'
    )

    // Convert arrow functions
    pythonCode = pythonCode.replace(
      /const\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>\s*{/g,
      'def $1($2):'
    )

    // Convert variable declarations
    pythonCode = pythonCode.replace(/let\s+(\w+)/g, '$1')
    pythonCode = pythonCode.replace(/const\s+(\w+)/g, '$1')
    pythonCode = pythonCode.replace(/var\s+(\w+)/g, '$1')

    // Convert array methods
    pythonCode = pythonCode.replace(/\.length/g, '.length')  // Will be handled later
    pythonCode = pythonCode.replace(/Math\.floor\(/g, 'int(')

    // Convert control structures
    pythonCode = pythonCode.replace(/if\s*\(([^)]+)\)\s*{/g, 'if $1:')
    pythonCode = pythonCode.replace(/while\s*\(([^)]+)\)\s*{/g, 'while $1:')
    pythonCode = pythonCode.replace(/for\s*\(([^)]+)\)\s*{/g, (_match, condition) => {
      // Handle for loops - this is a simplified conversion
      if (condition.includes('let i = 0; i < ')) {
        const arrayMatch = condition.match(/i < ([^;]+)/)
        if (arrayMatch) {
          return `for i in range(${arrayMatch[1]}):`
        }
      }
      return `# TODO: Convert for loop: ${condition}`
    })

    // Convert else if and else
    pythonCode = pythonCode.replace(/}\s*else\s*if\s*\(([^)]+)\)\s*{/g, 'elif $1:')
    pythonCode = pythonCode.replace(/}\s*else\s*{/g, 'else:')

    // Convert return statements
    pythonCode = pythonCode.replace(/return\s+([^;]+);/g, 'return $1')

    // Convert array access and length
    pythonCode = pythonCode.replace(/\.length/g, ')') // Temporary
    pythonCode = pythonCode.replace(/(\w+)\.length\)/g, 'len($1)')
    pythonCode = pythonCode.replace(/(\w+)\)/g, '$1') // Clean up

    // Convert comparison operators
    pythonCode = pythonCode.replace(/===/g, '==')
    pythonCode = pythonCode.replace(/!==/g, '!=')

    // Convert Math.floor
    pythonCode = pythonCode.replace(/Math\.floor\(([^)]+)\)/g, 'int($1)')

    // Remove semicolons and braces
    pythonCode = pythonCode.replace(/;/g, '')
    pythonCode = pythonCode.replace(/[{}]/g, '')

    // Fix indentation (basic)
    const lines = pythonCode.split('\n')
    let indentLevel = 0
    const indentedLines = lines.map(line => {
      const trimmed = line.trim()
      if (!trimmed) return ''
      
      if (trimmed.endsWith(':')) {
        const result = '    '.repeat(indentLevel) + trimmed
        indentLevel++
        return result
      } else if (trimmed.startsWith('elif ') || trimmed.startsWith('else:')) {
        indentLevel = Math.max(0, indentLevel - 1)
        const result = '    '.repeat(indentLevel) + trimmed
        indentLevel++
        return result
      } else {
        return '    '.repeat(indentLevel) + trimmed
      }
    })

    pythonCode = indentedLines.join('\n')

    // Clean up extra whitespace
    pythonCode = pythonCode.replace(/\n\s*\n/g, '\n')

    const suggestions = [
      'Converted JavaScript to Python syntax',
      'Check indentation - Python uses 4 spaces per level',
      'Verify array operations use len() instead of .length',
      'Make sure all variables are properly defined'
    ]

    const warnings = this.analyzeJavaScriptToPythonWarnings(jsCode)

    return {
      convertedCode: pythonCode,
      suggestions,
      warnings
    }
  }

  /**
   * Convert Python to JavaScript
   */
  private convertPythonToJavaScript(pythonCode: string): LanguageSwitchingResult {
    let jsCode = pythonCode

    // Convert function definitions
    jsCode = jsCode.replace(/def\s+(\w+)\s*\(([^)]*)\):/g, 'function $1($2) {')

    // Convert if statements
    jsCode = jsCode.replace(/if\s+([^:]+):/g, 'if ($1) {')
    jsCode = jsCode.replace(/elif\s+([^:]+):/g, '} else if ($1) {')
    jsCode = jsCode.replace(/else:/g, '} else {')

    // Convert while loops
    jsCode = jsCode.replace(/while\s+([^:]+):/g, 'while ($1) {')

    // Convert for loops
    jsCode = jsCode.replace(/for\s+(\w+)\s+in\s+range\(([^)]+)\):/g, 'for (let $1 = 0; $1 < $2; $1++) {')

    // Convert len() to .length
    jsCode = jsCode.replace(/len\(([^)]+)\)/g, '$1.length')

    // Convert int() to Math.floor()
    jsCode = jsCode.replace(/int\(([^)]+)\)/g, 'Math.floor($1)')

    // Convert return statements
    jsCode = jsCode.replace(/return\s+([^\n]+)/g, 'return $1;')

    // Convert comparison operators
    jsCode = jsCode.replace(/==/g, '===')
    jsCode = jsCode.replace(/!=/g, '!==')

    // Handle indentation to braces conversion
    const lines = jsCode.split('\n')
    const bracedLines: string[] = []
    let braceCount = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()
      
      if (!trimmed) {
        bracedLines.push('')
        continue
      }

      const currentIndent = line.length - line.trimStart().length
      const nextLine = i < lines.length - 1 ? lines[i + 1] : ''
      const nextIndent = nextLine ? nextLine.length - nextLine.trimStart().length : 0

      // Add the line
      if (trimmed.endsWith('{')) {
        bracedLines.push(line)
        braceCount++
      } else {
        bracedLines.push(line + (trimmed.startsWith('return') || trimmed.includes('=') ? ';' : ''))
      }

      // Add closing braces if indentation decreases
      if (nextIndent < currentIndent) {
        const bracesToClose = Math.floor((currentIndent - nextIndent) / 4)
        for (let j = 0; j < bracesToClose; j++) {
          bracedLines.push('    '.repeat(Math.max(0, currentIndent / 4 - j - 1)) + '}')
          braceCount--
        }
      }
    }

    // Close any remaining braces
    while (braceCount > 0) {
      bracedLines.push('}')
      braceCount--
    }

    jsCode = bracedLines.join('\n')

    // Clean up extra whitespace
    jsCode = jsCode.replace(/\n\s*\n/g, '\n')

    const suggestions = [
      'Converted Python to JavaScript syntax',
      'Added semicolons and braces as needed',
      'Converted len() to .length property',
      'Changed == to === for strict equality'
    ]

    const warnings = this.analyzePythonToJavaScriptWarnings(pythonCode)

    return {
      convertedCode: jsCode,
      suggestions,
      warnings
    }
  }

  /**
   * Execute code in the specified language
   */
  async executeCode(code: string, language: CodeLanguage): Promise<ExecutionResult> {
    try {
      if (language === 'python') {
        const result = await pythonExecutionService.executePython(code)
        
        // Convert Python steps to our AlgorithmStep format
        const steps: AlgorithmStep[] = result.steps.map((step: any) => ({
          type: step[0],
          indices: step[1],
          description: step[2],
          metadata: step[3] || {}
        }))

        return {
          result: result.result,
          steps,
          error: result.error,
          language: 'python'
        }
      } else {
        // JavaScript execution
        return await this.executeJavaScript(code)
      }
    } catch (error: any) {
      return {
        result: null,
        steps: [],
        error: {
          message: error.message || 'Execution failed',
          suggestion: 'Check your code for syntax errors and try again.'
        },
        language
      }
    }
  }

  /**
   * Execute JavaScript code safely
   */
  private async executeJavaScript(code: string): Promise<ExecutionResult> {
    // Create a safe execution environment
    const steps: AlgorithmStep[] = []
    let _operationCount = 0

    // Create tracker for JavaScript
    const tracker = {
      addStep: (type: string, indices: number[], description: string, metadata: any = {}) => {
        steps.push({
          type: type as any,
          indices,
          description,
          metadata
        })
        _operationCount++
      },
      reset: () => {
        steps.length = 0
        _operationCount = 0
      }
    }

    // Educational JavaScript implementations
    const binarySearchEducational = (arr: number[], target: number): number => {
      tracker.reset()
      let left = 0
      let right = arr.length - 1

      tracker.addStep('init', [left, right], `Starting binary search for ${target}`, 
                     { left, right, target })

      while (left <= right) {
        const mid = Math.floor((left + right) / 2)
        tracker.addStep('compare', [left, mid, right], 
                       `Comparing arr[${mid}] = ${arr[mid]} with target ${target}`,
                       { left, mid, right, value: arr[mid] })

        if (arr[mid] === target) {
          tracker.addStep('found', [mid], `Found target at index ${mid}`,
                         { found_index: mid, value: arr[mid] })
          return mid
        } else if (arr[mid] < target) {
          left = mid + 1
          tracker.addStep('eliminate', Array.from({ length: mid + 1 }, (_, i) => i), 
                         'Target is larger, eliminating left half',
                         { new_left: left, eliminated: Array.from({ length: mid + 1 }, (_, i) => i) })
        } else {
          right = mid - 1
          tracker.addStep('eliminate', Array.from({ length: arr.length - mid }, (_, i) => i + mid), 
                         'Target is smaller, eliminating right half',
                         { new_right: right, eliminated: Array.from({ length: arr.length - mid }, (_, i) => i + mid) })
        }
      }

      tracker.addStep('not_found', [], 'Target not found in array', { result: -1 })
      return -1
    }

    const linearSearchEducational = (arr: number[], target: number): number => {
      tracker.reset()
      
      tracker.addStep('init', [], `Starting linear search for ${target}`, { target })
      
      for (let i = 0; i < arr.length; i++) {
        tracker.addStep('compare', [i], `Checking arr[${i}] = ${arr[i]}`,
                       { index: i, value: arr[i], target })
        
        if (arr[i] === target) {
          tracker.addStep('found', [i], `Found target at index ${i}`,
                         { found_index: i, value: arr[i] })
          return i
        }
      }
      
      tracker.addStep('not_found', [], 'Target not found in array', { result: -1 })
      return -1
    }

    // Create safe execution context
    const safeContext = {
      binarySearchEducational,
      linearSearchEducational,
      tracker,
      console: {
        log: (...args: any[]) => console.log(...args)
      },
      Math,
      Array,
      // Prevent access to dangerous globals
      window: undefined,
      document: undefined,
      fetch: undefined,
      XMLHttpRequest: undefined
    }

    try {
      // Execute code in safe context
      const func = new Function(...Object.keys(safeContext), code)
      const result = func(...Object.values(safeContext))

      return {
        result,
        steps,
        language: 'javascript'
      }
    } catch (error: any) {
      const educationalError = this.convertJavaScriptError(error, code)
      return {
        result: null,
        steps: [],
        error: educationalError,
        language: 'javascript'
      }
    }
  }

  /**
   * Convert JavaScript errors to educational format
   */
  private convertJavaScriptError(error: any, _code: string): EducationalError {
    const message = error.message || error.toString()

    if (message.includes('is not defined')) {
      return {
        message: 'Variable or function is not defined',
        suggestion: 'Make sure you\'ve declared all variables and functions before using them.',
        codeExample: 'let arr = [1, 2, 3]; // Declare before use\nconst result = binarySearchEducational(arr, 2);'
      }
    }

    if (message.includes('Cannot read property') || message.includes('Cannot read properties')) {
      return {
        message: 'Trying to access property of undefined or null',
        suggestion: 'Check that your variables are properly initialized before accessing their properties.',
        codeExample: 'if (arr && arr.length > 0) {\n  // Safe to access arr properties\n}'
      }
    }

    if (message.includes('SyntaxError')) {
      return {
        message: 'JavaScript syntax error',
        suggestion: 'Check for missing brackets, semicolons, or incorrect syntax.',
        codeExample: 'function binarySearch(arr, target) {\n  // Don\'t forget the opening brace\n  return -1;\n} // And the closing brace'
      }
    }

    return {
      message,
      suggestion: 'Review your JavaScript code for common programming errors and try again.'
    }
  }

  /**
   * Get code templates for each language
   */
  getCodeTemplate(language: CodeLanguage, algorithmType: 'binary-search' | 'linear-search'): string {
    if (language === 'python') {
      if (algorithmType === 'binary-search') {
        return `# Binary Search Algorithm
def binary_search(arr, target):
    left = 0
    right = len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1

# Test the algorithm
test_array = [1, 3, 5, 7, 9, 11, 13, 15]
target = 7
result = binary_search(test_array, target)
print(f"Found {target} at index: {result}")

# Or use the educational version with visualization
result = binary_search_educational(test_array, target)
steps = tracker.get_steps()
print(f"Algorithm took {len(steps)} steps")`
      } else {
        return `# Linear Search Algorithm
def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1

# Test the algorithm
test_array = [1, 3, 5, 7, 9, 11, 13, 15]
target = 7
result = linear_search(test_array, target)
print(f"Found {target} at index: {result}")

# Or use the educational version with visualization
result = linear_search_educational(test_array, target)
steps = tracker.get_steps()
print(f"Algorithm took {len(steps)} steps")`
      }
    } else {
      if (algorithmType === 'binary-search') {
        return `// Binary Search Algorithm
function binarySearch(arr, target) {
    let left = 0;
    let right = arr.length - 1;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        
        if (arr[mid] === target) {
            return mid;
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return -1;
}

// Test the algorithm
const testArray = [1, 3, 5, 7, 9, 11, 13, 15];
const target = 7;
const result = binarySearch(testArray, target);
console.log(\`Found \${target} at index: \${result}\`);

// Or use the educational version with visualization
const educationalResult = binarySearchEducational(testArray, target);
const steps = tracker.steps;
console.log(\`Algorithm took \${steps.length} steps\`);`
      } else {
        return `// Linear Search Algorithm
function linearSearch(arr, target) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === target) {
            return i;
        }
    }
    return -1;
}

// Test the algorithm
const testArray = [1, 3, 5, 7, 9, 11, 13, 15];
const target = 7;
const result = linearSearch(testArray, target);
console.log(\`Found \${target} at index: \${result}\`);

// Or use the educational version with visualization
const educationalResult = linearSearchEducational(testArray, target);
const steps = tracker.steps;
console.log(\`Algorithm took \${steps.length} steps\`);`
      }
    }
  }

  /**
   * Analyze JavaScript code for Python conversion warnings
   * Only shows warnings for actual syntax conflicts
   */
  private analyzeJavaScriptToPythonWarnings(jsCode: string): string[] {
    const warnings: string[] = []

    // Remove comments and strings to avoid false positives
    const codeWithoutCommentsAndStrings = this.removeCommentsAndStrings(jsCode)

    // Check for strict equality operators (===, !==) in actual code
    if (/[^=!]=={2,3}[^=]/.test(codeWithoutCommentsAndStrings)) {
      warnings.push('Strict equality operators (=== and !==) converted to == and !=')
    }

    // Check for Math object usage in actual code (not in comments/strings)
    const mathUsageRegex = /\bMath\.\w+\s*\(/g
    if (mathUsageRegex.test(codeWithoutCommentsAndStrings)) {
      warnings.push('Math object methods may need Python equivalents (e.g., Math.floor() → int())')
    }

    // Check for array.length usage
    if (/\w+\.length\b/.test(codeWithoutCommentsAndStrings)) {
      warnings.push('Array .length property converted to len() function')
    }

    // Check for typeof operator
    if (/\btypeof\b/.test(codeWithoutCommentsAndStrings)) {
      warnings.push('typeof operator may need Python type() function equivalent')
    }

    return warnings
  }

  /**
   * Analyze Python code for JavaScript conversion warnings
   * Only shows warnings for actual syntax conflicts
   */
  private analyzePythonToJavaScriptWarnings(pythonCode: string): string[] {
    const warnings: string[] = []

    // Remove comments and strings to avoid false positives
    const codeWithoutCommentsAndStrings = this.removeCommentsAndStrings(pythonCode, 'python')

    // Check for integer division (//) in actual code
    if (/\w+\s*\/\/\s*\w+/.test(codeWithoutCommentsAndStrings)) {
      warnings.push('Integer division (//) converted to Math.floor(a / b)')
    }

    // Check for exponentiation (**) in actual code
    if (/\w+\s*\*\*\s*\w+/.test(codeWithoutCommentsAndStrings)) {
      warnings.push('Exponentiation (**) converted to Math.pow()')
    }

    // Check for len() function usage
    if (/\blen\s*\(\s*\w+\s*\)/.test(codeWithoutCommentsAndStrings)) {
      warnings.push('len() function converted to .length property')
    }

    // Check for range() function usage
    if (/\brange\s*\(/.test(codeWithoutCommentsAndStrings)) {
      warnings.push('range() function converted to for loop syntax')
    }

    return warnings
  }

  /**
   * Remove comments and string literals to avoid false positive warnings
   */
  private removeCommentsAndStrings(code: string, language: 'javascript' | 'python' = 'javascript'): string {
    let cleaned = code

    if (language === 'javascript') {
      // Remove single-line comments
      cleaned = cleaned.replace(/\/\/.*$/gm, '')
      // Remove multi-line comments
      cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '')
      // Remove string literals (single and double quotes)
      cleaned = cleaned.replace(/'[^'\\]*(?:\\.[^'\\]*)*'/g, '""')
      cleaned = cleaned.replace(/"[^"\\]*(?:\\.[^"\\]*)*"/g, '""')
      // Remove template literals
      cleaned = cleaned.replace(/`[^`\\]*(?:\\.[^`\\]*)*`/g, '""')
    } else {
      // Python
      // Remove single-line comments
      cleaned = cleaned.replace(/#.*$/gm, '')
      // Remove triple-quoted strings
      cleaned = cleaned.replace(/"""[\s\S]*?"""/g, '""')
      cleaned = cleaned.replace(/'''[\s\S]*?'''/g, '""')
      // Remove string literals (single and double quotes)
      cleaned = cleaned.replace(/'[^'\\]*(?:\\.[^'\\]*)*'/g, '""')
      cleaned = cleaned.replace(/"[^"\\]*(?:\\.[^"\\]*)*"/g, '""')
    }

    return cleaned
  }
}

// Singleton instance
export const languageSwitchingService = new LanguageSwitchingService()