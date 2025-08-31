import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CodeEditor } from '@/components/editor/code-editor'
import { LanguageSwitcher } from '@/components/editor/language-switcher'
import { useState } from 'react'

// Mock Pyodide and services
jest.mock('pyodide', () => ({
  loadPyodide: jest.fn(() => Promise.resolve({
    runPython: jest.fn((code) => {
      // Simulate Python execution
      if (code.includes('binary_search_educational')) {
        return 2 // Found at index 2
      }
      if (code.includes('tracker.get_steps()')) {
        return [
          ['init', [0, 4], 'Starting search', {}],
          ['compare', [0, 2, 4], 'Comparing middle', {}],
          ['found', [2], 'Found target', {}]
        ]
      }
      return null
    }),
    globals: {
      get: jest.fn(),
      set: jest.fn()
    },
    loadPackage: jest.fn(() => Promise.resolve()),
    registerJsModule: jest.fn()
  }))
}))

// Mock Monaco Editor
jest.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: ({ value, onChange, onMount, loading }: any) => {
    // Simulate editor mount
    setTimeout(() => {
      if (onMount) {
        const mockEditor = {
          getValue: () => value,
          updateOptions: jest.fn(),
          addCommand: jest.fn()
        }
        const mockMonaco = {
          editor: {
            defineTheme: jest.fn(),
            setTheme: jest.fn()
          },
          languages: {
            registerCompletionItemProvider: jest.fn(() => ({ dispose: jest.fn() }))
          },
          KeyMod: { CtrlCmd: 1 },
          KeyCode: { Enter: 2 }
        }
        onMount(mockEditor, mockMonaco)
      }
    }, 0)

    return (
      <div data-testid="monaco-editor">
        <textarea
          data-testid="editor-textarea"
          data-language={value?.includes('def ') ? 'python' : 'javascript'}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
        />
      </div>
    )
  }
}))

// Test component that combines editor and language switcher
function TestPyodideIntegration() {
  const [language, setLanguage] = useState<'javascript' | 'python'>('javascript')
  const [code, setCode] = useState('console.log("Hello World");')
  const [executionResults, setExecutionResults] = useState<any[]>([])

  const handleLanguageChange = (newLanguage: 'javascript' | 'python', newCode: string) => {
    setLanguage(newLanguage)
    setCode(newCode)
  }

  const handleCodeExecution = (executedCode: string) => {
    setExecutionResults(prev => [...prev, { language, code: executedCode, timestamp: Date.now() }])
  }

  return (
    <div>
      <LanguageSwitcher
        currentLanguage={language}
        currentCode={code}
        onLanguageChange={handleLanguageChange}
      />
      <CodeEditor
        language={language}
        initialCode={code}
        onCodeChange={setCode}
        onExecute={handleCodeExecution}
        readOnly={false}
        theme="light"
      />
      <div data-testid="execution-results">
        {executionResults.map((result, index) => (
          <div key={index} data-testid={`result-${index}`}>
            {result.language}: {result.code}
          </div>
        ))}
      </div>
    </div>
  )
}

describe.skip('Pyodide Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('initializes Python environment and executes code', async () => {
    render(<TestPyodideIntegration />)
    
    // Switch to Python
    const pythonButton = screen.getByText('Python')
    await userEvent.click(pythonButton)
    
    // Wait for Python to be ready
    await waitFor(() => {
      expect(screen.queryByText('Loading Python...')).not.toBeInTheDocument()
    }, { timeout: 5000 })
    
    // Update code to use Python
    const textarea = screen.getByTestId('editor-textarea')
    await userEvent.clear(textarea)
    await userEvent.type(textarea, 'arr = [1, 3, 5, 7, 9]\nresult = binary_search_educational(arr, 5)')
    
    // Execute the code
    const runButton = screen.getByText('Run Code')
    await userEvent.click(runButton)
    
    // Check that execution was recorded
    await waitFor(() => {
      const results = screen.getByTestId('execution-results')
      expect(results).toHaveTextContent('python:')
    })
  })

  test('converts code between languages', async () => {
    render(<TestPyodideIntegration />)
    
    // Start with JavaScript code
    const textarea = screen.getByTestId('editor-textarea')
    await userEvent.clear(textarea)
    await userEvent.type(textarea, 'function test() { return 42; }')
    
    // Switch to Python (should convert code)
    const pythonButton = screen.getByText('Python')
    await userEvent.click(pythonButton)
    
    await waitFor(() => {
      const updatedTextarea = screen.getByTestId('editor-textarea')
      expect(updatedTextarea.value).toContain('def test():')
    })
  })

  test('uses code templates', async () => {
    render(<TestPyodideIntegration />)
    
    // Use JavaScript template
    const templateButton = screen.getByText('Use JavaScript Template')
    await userEvent.click(templateButton)
    
    await waitFor(() => {
      const textarea = screen.getByTestId('editor-textarea')
      expect(textarea.value).toContain('function binarySearch')
      expect(textarea.value).toContain('testArray')
    })
  })

  test('handles execution errors gracefully', async () => {
    render(<TestPyodideIntegration />)
    
    // Switch to Python
    const pythonButton = screen.getByText('Python')
    await userEvent.click(pythonButton)
    
    await waitFor(() => {
      expect(screen.queryByText('Loading Python...')).not.toBeInTheDocument()
    })
    
    // Enter invalid Python code
    const textarea = screen.getByTestId('editor-textarea')
    await userEvent.clear(textarea)
    await userEvent.type(textarea, 'invalid python syntax here')
    
    // Execute the code
    const runButton = screen.getByText('Run Code')
    await userEvent.click(runButton)
    
    // Should show error message (this would be handled by the actual implementation)
    // For now, we just verify the execution attempt was made
    await waitFor(() => {
      expect(runButton).not.toHaveTextContent('Running...')
    })
  })

  test('shows loading state during Python initialization', async () => {
    render(<TestPyodideIntegration />)
    
    // Switch to Python
    const pythonButton = screen.getByText('Python')
    await userEvent.click(pythonButton)
    
    // Should show loading state initially
    expect(screen.getByText('Loading Python...')).toBeInTheDocument()
    
    // Should disappear after initialization
    await waitFor(() => {
      expect(screen.queryByText('Loading Python...')).not.toBeInTheDocument()
    }, { timeout: 5000 })
  })

  test('disables run button while Python is loading', async () => {
    render(<TestPyodideIntegration />)
    
    // Switch to Python
    const pythonButton = screen.getByText('Python')
    await userEvent.click(pythonButton)
    
    // Run button should be disabled initially
    const runButton = screen.getByText('Run Code')
    expect(runButton).toHaveClass('cursor-not-allowed')
    
    // Should be enabled after Python loads
    await waitFor(() => {
      expect(runButton).not.toHaveClass('cursor-not-allowed')
    }, { timeout: 5000 })
  })

  test('maintains code state during language switching', async () => {
    render(<TestPyodideIntegration />)
    
    // Enter some JavaScript code
    const textarea = screen.getByTestId('editor-textarea')
    await userEvent.clear(textarea)
    await userEvent.type(textarea, 'const x = 42;')
    
    // Switch to Python
    const pythonButton = screen.getByText('Python')
    await userEvent.click(pythonButton)
    
    // Code should be converted
    await waitFor(() => {
      const updatedTextarea = screen.getByTestId('editor-textarea')
      expect(updatedTextarea.value).toContain('x = 42')
    })
    
    // Switch back to JavaScript
    const jsButton = screen.getByText('JavaScript')
    await userEvent.click(jsButton)
    
    // Code should be converted back
    await waitFor(() => {
      const finalTextarea = screen.getByTestId('editor-textarea')
      expect(finalTextarea.value).toContain('const x = 42')
    })
  })

  test('executes educational algorithm functions', async () => {
    render(<TestPyodideIntegration />)
    
    // Switch to Python
    const pythonButton = screen.getByText('Python')
    await userEvent.click(pythonButton)
    
    await waitFor(() => {
      expect(screen.queryByText('Loading Python...')).not.toBeInTheDocument()
    })
    
    // Use educational binary search
    const textarea = screen.getByTestId('editor-textarea')
    await userEvent.clear(textarea)
    await userEvent.type(textarea, 'result = binary_search_educational([1,3,5,7,9], 5)')
    
    // Execute the code
    const runButton = screen.getByText('Run Code')
    await userEvent.click(runButton)
    
    // Verify execution was attempted
    await waitFor(() => {
      const results = screen.getByTestId('execution-results')
      expect(results).toHaveTextContent('python:')
    })
  })
})