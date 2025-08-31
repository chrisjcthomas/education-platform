import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CodeEditor } from '@/components/editor/code-editor'
import { CodeLanguage } from '@/lib/types'

// Mock Monaco Editor
jest.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: ({ onMount, onChange, value, language }: any) => {
    // Simulate editor mount
    if (onMount) {
      const mockEditor = {
        getValue: () => value,
        setValue: (newValue: string) => onChange?.(newValue),
        updateOptions: jest.fn(),
        addCommand: jest.fn(),
        dispose: jest.fn()
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
      setTimeout(() => onMount(mockEditor, mockMonaco), 0)
    }
    
    return (
      <div data-testid="monaco-editor">
        <textarea
          data-testid="editor-textarea"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          data-language={language}
        />
      </div>
    )
  }
}))

describe('CodeEditor', () => {
  const defaultProps = {
    language: 'javascript' as CodeLanguage,
    initialCode: 'console.log("Hello World");',
    onCodeChange: jest.fn(),
    onExecute: jest.fn(),
    readOnly: false,
    theme: 'light' as const
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders editor with initial code', async () => {
    render(<CodeEditor {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByTestId('monaco-editor')).toBeDefined()
    })
    
    const textarea = screen.getByTestId('editor-textarea')
    expect(textarea.getAttribute('value')).toBe('console.log("Hello World");')
  })

  test('displays correct language in header', () => {
    render(<CodeEditor {...defaultProps} language="python" />)
    
    expect(screen.getByText('Python Editor')).toBeDefined()
  })

  test('calls onCodeChange when code is modified', async () => {
    const onCodeChange = jest.fn()
    render(<CodeEditor {...defaultProps} onCodeChange={onCodeChange} />)
    
    await waitFor(() => {
      expect(screen.getByTestId('editor-textarea')).toBeDefined()
    })
    
    const textarea = screen.getByTestId('editor-textarea')
    await userEvent.clear(textarea)
    await userEvent.type(textarea, 'new code')
    
    expect(onCodeChange).toHaveBeenCalledWith('new code')
  })

  test('shows run button when not read-only', () => {
    render(<CodeEditor {...defaultProps} readOnly={false} />)
    
    expect(screen.getByText('Run Code')).toBeDefined()
  })

  test('hides run button when read-only', () => {
    render(<CodeEditor {...defaultProps} readOnly={true} />)
    
    expect(screen.queryByText('Run Code')).toBeNull()
  })

  test('calls onExecute when run button is clicked', async () => {
    const onExecute = jest.fn()
    render(<CodeEditor {...defaultProps} onExecute={onExecute} />)
    
    const runButton = screen.getByText('Run Code')
    await userEvent.click(runButton)
    
    expect(onExecute).toHaveBeenCalledWith('console.log("Hello World");')
  })

  test('shows keyboard shortcut hint', () => {
    render(<CodeEditor {...defaultProps} />)
    
    expect(screen.getByText('Ctrl+Enter to run')).toBeDefined()
  })

  test('handles different programming languages', async () => {
    const { rerender } = render(<CodeEditor {...defaultProps} language="javascript" />)
    
    await waitFor(() => {
      const textarea = screen.getByTestId('editor-textarea')
      expect(textarea.getAttribute('data-language')).toBe('javascript')
    })
    
    rerender(<CodeEditor {...defaultProps} language="python" />)
    
    await waitFor(() => {
      const textarea = screen.getByTestId('editor-textarea')
      expect(textarea.getAttribute('data-language')).toBe('python')
    })
  })

  test('handles empty code execution gracefully', async () => {
    const onExecute = jest.fn()
    render(<CodeEditor {...defaultProps} initialCode="" onExecute={onExecute} />)
    
    const runButton = screen.getByText('Run Code')
    await userEvent.click(runButton)
    
    // Should not call onExecute for empty code
    expect(onExecute).not.toHaveBeenCalled()
  })

  test('shows loading state initially', () => {
    render(<CodeEditor {...defaultProps} />)
    
    expect(screen.getByText('Loading editor...')).toBeDefined()
  })
})