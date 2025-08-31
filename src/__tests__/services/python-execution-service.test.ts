import { pythonExecutionService } from '@/lib/services/python-execution-service'

// Mock Pyodide to avoid loading it in tests
jest.mock('pyodide', () => ({
  loadPyodide: jest.fn(() => Promise.resolve({
    runPython: jest.fn(),
    globals: {
      get: jest.fn(),
      set: jest.fn()
    },
    loadPackage: jest.fn(() => Promise.resolve()),
    registerJsModule: jest.fn()
  }))
}))

describe.skip('PythonExecutionService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('initialization', () => {
    test('initializes Pyodide successfully', async () => {
      const service = new (pythonExecutionService.constructor as any)()
      
      await expect(service.initialize()).resolves.not.toThrow()
      expect(service.isReady()).toBe(true)
    }, 15000)

    test('handles initialization failure gracefully', async () => {
      const { loadPyodide } = require('pyodide')
      loadPyodide.mockRejectedValueOnce(new Error('Failed to load'))
      
      const service = new (pythonExecutionService.constructor as any)()
      
      await expect(service.initialize()).rejects.toThrow('Failed to initialize Python environment')
    }, 15000)

    test('prevents multiple simultaneous initializations', async () => {
      const service = new (pythonExecutionService.constructor as any)()
      
      const promise1 = service.initialize()
      const promise2 = service.initialize()
      
      await Promise.all([promise1, promise2])
      
      // Should only call loadPyodide once
      const { loadPyodide } = require('pyodide')
      expect(loadPyodide).toHaveBeenCalledTimes(1)
    }, 15000)
  })

  describe('code execution', () => {
    test('executes simple Python code', async () => {
      const mockPyodide = {
        runPython: jest.fn()
          .mockReturnValueOnce(null) // For setupEducationalEnvironment
          .mockReturnValueOnce(null) // For tracker.reset()
          .mockReturnValueOnce(42),  // For actual code execution
        globals: { get: jest.fn(), set: jest.fn() },
        loadPackage: jest.fn(() => Promise.resolve()),
        registerJsModule: jest.fn()
      }
      
      const { loadPyodide } = require('pyodide')
      loadPyodide.mockResolvedValueOnce(mockPyodide)
      
      const service = new (pythonExecutionService.constructor as any)()
      await service.initialize()
      
      const result = await service.executePython('result = 6 * 7')
      
      expect(result.result).toBe(42)
    }, 15000)

    test('handles execution timeout', async () => {
      const mockPyodide = {
        runPython: jest.fn(() => {
          // Simulate long-running code
          return new Promise(() => {}) // Never resolves
        }),
        globals: { get: jest.fn(), set: jest.fn() },
        loadPackage: jest.fn(() => Promise.resolve()),
        registerJsModule: jest.fn()
      }
      
      const { loadPyodide } = require('pyodide')
      loadPyodide.mockResolvedValueOnce(mockPyodide)
      
      const service = new (pythonExecutionService.constructor as any)()
      await service.initialize()
      
      const result = await service.executePython('while True: pass')
      
      expect(result.error).toBeDefined()
      expect(result.error?.message).toContain('timed out')
    }, 10000)

    test('sanitizes dangerous code', async () => {
      const mockPyodide = {
        runPython: jest.fn()
          .mockReturnValueOnce(null) // For setupEducationalEnvironment
          .mockReturnValueOnce(null) // For tracker.reset()
          .mockReturnValueOnce(null), // For sanitized code execution
        globals: { get: jest.fn(), set: jest.fn() },
        loadPackage: jest.fn(() => Promise.resolve()),
        registerJsModule: jest.fn()
      }
      
      const { loadPyodide } = require('pyodide')
      loadPyodide.mockResolvedValueOnce(mockPyodide)
      
      const service = new (pythonExecutionService.constructor as any)()
      await service.initialize()
      
      await service.executePython('import os\nos.system("rm -rf /")')
      
      // Should have sanitized the dangerous code
      const sanitizedCode = mockPyodide.runPython.mock.calls[2][0]
      expect(sanitizedCode).toContain('# Removed for safety')
      expect(sanitizedCode).not.toContain('import os')
    }, 15000)

    test('retrieves algorithm steps', async () => {
      const mockSteps = [
        ['init', [0, 9], 'Starting binary search', {}],
        ['compare', [0, 4, 9], 'Comparing middle element', {}],
        ['found', [4], 'Found target', {}]
      ]
      
      const mockPyodide = {
        runPython: jest.fn()
          .mockReturnValueOnce(null) // For setupEducationalEnvironment
          .mockReturnValueOnce(null) // For tracker.reset()
          .mockReturnValueOnce(4)    // For main execution
          .mockReturnValueOnce(mockSteps), // For tracker.get_steps()
        globals: { get: jest.fn(), set: jest.fn() },
        loadPackage: jest.fn(() => Promise.resolve()),
        registerJsModule: jest.fn()
      }
      
      const { loadPyodide } = require('pyodide')
      loadPyodide.mockResolvedValueOnce(mockPyodide)
      
      const service = new (pythonExecutionService.constructor as any)()
      await service.initialize()
      
      const result = await service.executePython('binary_search_educational([1,2,3,4,5], 5)')
      
      expect(result.steps).toEqual(mockSteps)
    }, 15000)
  })

  describe('error handling', () => {
    test('converts syntax errors to educational format', async () => {
      const mockPyodide = {
        runPython: jest.fn().mockImplementation(() => {
          throw new Error('SyntaxError: invalid syntax')
        }),
        globals: { get: jest.fn(), set: jest.fn() },
        loadPackage: jest.fn(() => Promise.resolve()),
        registerJsModule: jest.fn()
      }
      
      const { loadPyodide } = require('pyodide')
      loadPyodide.mockResolvedValueOnce(mockPyodide)
      
      const service = new (pythonExecutionService.constructor as any)()
      await service.initialize()
      
      const result = await service.executePython('if True\n  print("missing colon")')
      
      expect(result.error).toBeDefined()
      expect(result.error?.message).toBe('Python syntax error')
      expect(result.error?.suggestion).toContain('indentation')
      expect(result.error?.codeExample).toBeDefined()
    }, 15000)

    test('converts indentation errors to educational format', async () => {
      const mockPyodide = {
        runPython: jest.fn().mockImplementation(() => {
          throw new Error('IndentationError: expected an indented block')
        }),
        globals: { get: jest.fn(), set: jest.fn() },
        loadPackage: jest.fn(() => Promise.resolve()),
        registerJsModule: jest.fn()
      }
      
      const { loadPyodide } = require('pyodide')
      loadPyodide.mockResolvedValueOnce(mockPyodide)
      
      const service = new (pythonExecutionService.constructor as any)()
      await service.initialize()
      
      const result = await service.executePython('def test():\nprint("no indent")')
      
      expect(result.error).toBeDefined()
      expect(result.error?.message).toBe('Python indentation error')
      expect(result.error?.suggestion).toContain('4 spaces')
    }, 15000)

    test('converts name errors to educational format', async () => {
      const mockPyodide = {
        runPython: jest.fn().mockImplementation(() => {
          throw new Error('NameError: name \'undefined_var\' is not defined')
        }),
        globals: { get: jest.fn(), set: jest.fn() },
        loadPackage: jest.fn(() => Promise.resolve()),
        registerJsModule: jest.fn()
      }
      
      const { loadPyodide } = require('pyodide')
      loadPyodide.mockResolvedValueOnce(mockPyodide)
      
      const service = new (pythonExecutionService.constructor as any)()
      await service.initialize()
      
      const result = await service.executePython('print(undefined_var)')
      
      expect(result.error).toBeDefined()
      expect(result.error?.message).toBe('Variable or function not defined')
      expect(result.error?.suggestion).toContain('defined all variables')
    }, 15000)

    test('converts index errors to educational format', async () => {
      const mockPyodide = {
        runPython: jest.fn().mockImplementation(() => {
          throw new Error('IndexError: list index out of range')
        }),
        globals: { get: jest.fn(), set: jest.fn() },
        loadPackage: jest.fn(() => Promise.resolve()),
        registerJsModule: jest.fn()
      }
      
      const { loadPyodide } = require('pyodide')
      loadPyodide.mockResolvedValueOnce(mockPyodide)
      
      const service = new (pythonExecutionService.constructor as any)()
      await service.initialize()
      
      const result = await service.executePython('arr = [1,2,3]; print(arr[10])')
      
      expect(result.error).toBeDefined()
      expect(result.error?.message).toBe('List index out of range')
      expect(result.error?.suggestion).toContain('valid range')
    }, 15000)
  })

  describe('educational features', () => {
    test('provides available functions list', () => {
      const functions = pythonExecutionService.getAvailableFunctions()
      
      expect(functions).toContain('binary_search_educational(arr, target)')
      expect(functions).toContain('linear_search_educational(arr, target)')
      expect(functions).toContain('tracker.get_steps()')
      expect(functions).toContain('tracker.reset()')
    })

    test('reports readiness status', async () => {
      const service = new (pythonExecutionService.constructor as any)()
      
      expect(service.isReady()).toBe(false)
      
      await service.initialize()
      
      expect(service.isReady()).toBe(true)
    }, 15000)
  })
})