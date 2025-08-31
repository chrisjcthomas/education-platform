import { languageSwitchingService } from '@/lib/services/language-switching-service'

// Mock the Python execution service
jest.mock('@/lib/services/python-execution-service', () => ({
  pythonExecutionService: {
    executePython: jest.fn()
  }
}))

describe('LanguageSwitchingService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('code conversion', () => {
    test('converts JavaScript to Python', () => {
      const jsCode = `function binarySearch(arr, target) {
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
}`

      const result = languageSwitchingService.convertCode(jsCode, 'javascript', 'python')
      
      expect(result.convertedCode).toContain('def binarySearch(arr, target):')
      expect(result.convertedCode).toContain('while left <= right:')
      expect(result.convertedCode).toContain('if arr[mid] == target:')
      expect(result.convertedCode).toContain('return mid')
      expect(result.suggestions).toContain('Converted JavaScript to Python syntax')
    })

    test('converts Python to JavaScript', () => {
      const pythonCode = `def binary_search(arr, target):
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
    
    return -1`

      const result = languageSwitchingService.convertCode(pythonCode, 'python', 'javascript')
      
      expect(result.convertedCode).toContain('function binary_search(arr, target) {')
      expect(result.convertedCode).toContain('while (left <= right) {')
      expect(result.convertedCode).toContain('if (arr[mid] === target) {')
      expect(result.convertedCode).toContain('return mid;')
      expect(result.suggestions).toContain('Converted Python to JavaScript syntax')
    })

    test('returns same code when converting to same language', () => {
      const code = 'console.log("Hello World");'
      
      const result = languageSwitchingService.convertCode(code, 'javascript', 'javascript')
      
      expect(result.convertedCode).toBe(code)
      expect(result.suggestions).toEqual([])
    })

    test('handles complex JavaScript constructs', () => {
      const jsCode = `const arr = [1, 2, 3];
for (let i = 0; i < arr.length; i++) {
  if (arr[i] === target) {
    return i;
  }
}`

      const result = languageSwitchingService.convertCode(jsCode, 'javascript', 'python')
      
      expect(result.convertedCode).toContain('arr = [1, 2, 3]')
      expect(result.convertedCode).toContain('for i in range(len(arr)):')
      expect(result.convertedCode).toContain('if arr[i] == target:')
      expect(result.convertedCode).toContain('return i')
    })

    test('provides intelligent warnings only for actual syntax conflicts', () => {
      const jsCode = `const result = Math.pow(2, 3);
const isEqual = value === target;
const length = arr.length;`

      const result = languageSwitchingService.convertCode(jsCode, 'javascript', 'python')

      expect(result.warnings).toBeDefined()
      expect(result.warnings?.some(w => w.includes('Math object methods'))).toBe(true)
      expect(result.warnings?.some(w => w.includes('Strict equality operators'))).toBe(true)
      expect(result.warnings?.some(w => w.includes('Array .length property'))).toBe(true)
    })

    test('does not show warnings for code without syntax conflicts', () => {
      const jsCode = `const message = "Hello World";
console.log(message);`

      const result = languageSwitchingService.convertCode(jsCode, 'javascript', 'python')

      expect(result.warnings).toBeDefined()
      expect(result.warnings?.length).toBe(0)
    })

    test('ignores syntax in comments and strings', () => {
      const jsCode = `// This comment mentions Math.pow and === operators
const message = "Use === for comparison";
const value = 42;`

      const result = languageSwitchingService.convertCode(jsCode, 'javascript', 'python')

      expect(result.warnings).toBeDefined()
      expect(result.warnings?.length).toBe(0)
    })
  })

  describe('code execution', () => {
    test('executes JavaScript code successfully', async () => {
      const jsCode = `
const arr = [1, 3, 5, 7, 9];
const result = binarySearchEducational(arr, 5);
result;
`

      const result = await languageSwitchingService.executeCode(jsCode, 'javascript')
      
      expect(result.language).toBe('javascript')
      expect(result.result).toBe(2) // Index of 5 in the array
      expect(result.steps).toBeDefined()
      expect(result.steps.length).toBeGreaterThan(0)
    })

    test('executes Python code successfully', async () => {
      const { pythonExecutionService } = require('@/lib/services/python-execution-service')
      pythonExecutionService.executePython.mockResolvedValueOnce({
        result: 2,
        steps: [
          ['init', [0, 4], 'Starting search', {}],
          ['found', [2], 'Found target', {}]
        ]
      })

      const pythonCode = `
arr = [1, 3, 5, 7, 9]
result = binary_search_educational(arr, 5)
`

      const result = await languageSwitchingService.executeCode(pythonCode, 'python')
      
      expect(result.language).toBe('python')
      expect(result.result).toBe(2)
      expect(result.steps).toHaveLength(2)
      expect(pythonExecutionService.executePython).toHaveBeenCalledWith(pythonCode)
    })

    test('handles JavaScript execution errors', async () => {
      const jsCode = 'undefinedFunction();'

      const result = await languageSwitchingService.executeCode(jsCode, 'javascript')
      
      expect(result.error).toBeDefined()
      expect(result.error?.message).toContain('not defined')
      expect(result.error?.suggestion).toContain('declared all variables')
    })

    test('handles Python execution errors', async () => {
      const { pythonExecutionService } = require('@/lib/services/python-execution-service')
      pythonExecutionService.executePython.mockResolvedValueOnce({
        result: null,
        steps: [],
        error: {
          message: 'NameError: name not defined',
          suggestion: 'Check variable names'
        }
      })

      const pythonCode = 'print(undefined_variable)'

      const result = await languageSwitchingService.executeCode(pythonCode, 'python')
      
      expect(result.error).toBeDefined()
      expect(result.error?.message).toBe('NameError: name not defined')
    })

    test('provides educational JavaScript functions', async () => {
      const jsCode = `
const arr = [1, 2, 3, 4, 5];
const result = linearSearchEducational(arr, 3);
result;
`

      const result = await languageSwitchingService.executeCode(jsCode, 'javascript')
      
      expect(result.result).toBe(2) // Index of 3 in the array
      expect(result.steps).toBeDefined()
      expect(result.steps.some(step => step.type === 'init')).toBe(true)
      expect(result.steps.some(step => step.type === 'found')).toBe(true)
    })
  })

  describe('code templates', () => {
    test('provides JavaScript binary search template', () => {
      const template = languageSwitchingService.getCodeTemplate('javascript', 'binary-search')
      
      expect(template).toContain('function binarySearch(arr, target)')
      expect(template).toContain('Math.floor((left + right) / 2)')
      expect(template).toContain('binarySearchEducational')
      expect(template).toContain('testArray')
    })

    test('provides Python binary search template', () => {
      const template = languageSwitchingService.getCodeTemplate('python', 'binary-search')
      
      expect(template).toContain('def binary_search(arr, target):')
      expect(template).toContain('(left + right) // 2')
      expect(template).toContain('binary_search_educational')
      expect(template).toContain('test_array')
    })

    test('provides JavaScript linear search template', () => {
      const template = languageSwitchingService.getCodeTemplate('javascript', 'linear-search')
      
      expect(template).toContain('function linearSearch(arr, target)')
      expect(template).toContain('for (let i = 0; i < arr.length; i++)')
      expect(template).toContain('linearSearchEducational')
    })

    test('provides Python linear search template', () => {
      const template = languageSwitchingService.getCodeTemplate('python', 'linear-search')
      
      expect(template).toContain('def linear_search(arr, target):')
      expect(template).toContain('for i in range(len(arr)):')
      expect(template).toContain('linear_search_educational')
    })
  })

  describe('error conversion', () => {
    test('converts JavaScript undefined variable error', async () => {
      const jsCode = 'console.log(undefinedVar);'

      const result = await languageSwitchingService.executeCode(jsCode, 'javascript')
      
      expect(result.error?.message).toBe('Variable or function is not defined')
      expect(result.error?.suggestion).toContain('declared all variables')
      expect(result.error?.codeExample).toContain('let arr = [1, 2, 3];')
    })

    test('converts JavaScript property access error', async () => {
      const jsCode = 'const obj = null; console.log(obj.property);'

      const result = await languageSwitchingService.executeCode(jsCode, 'javascript')
      
      expect(result.error?.message).toContain('property of undefined or null')
      expect(result.error?.suggestion).toContain('properly initialized')
      expect(result.error?.codeExample).toContain('if (arr && arr.length > 0)')
    })

    test('converts JavaScript syntax error', async () => {
      const jsCode = 'function test( { return 42; }' // Missing closing parenthesis

      const result = await languageSwitchingService.executeCode(jsCode, 'javascript')
      
      expect(result.error?.message).toBe('JavaScript syntax error')
      expect(result.error?.suggestion).toContain('missing brackets')
    })
  })
})