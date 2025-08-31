'use client'

import { useRef, useEffect, useState } from 'react'
import Editor, { Monaco } from '@monaco-editor/react'
import { CodeEditorProps, CodeLanguage, EducationalError } from '@/lib/types'
import { cn } from '@/lib/utils'
import { languageSwitchingService } from '@/lib/services/language-switching-service'
import { pythonExecutionService } from '@/lib/services/python-execution-service'

// Educational code completion items for algorithms
const getAlgorithmCompletions = (language: CodeLanguage) => {
  const jsCompletions = [
    {
      label: 'binarySearch',
      kind: 1, // Function
      insertText: 'function binarySearch(arr, target) {\n  let left = 0;\n  let right = arr.length - 1;\n  \n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    \n    if (arr[mid] === target) {\n      return mid;\n    } else if (arr[mid] < target) {\n      left = mid + 1;\n    } else {\n      right = mid - 1;\n    }\n  }\n  \n  return -1;\n}',
      documentation: 'Binary search algorithm implementation'
    },
    {
      label: 'linearSearch',
      kind: 1,
      insertText: 'function linearSearch(arr, target) {\n  for (let i = 0; i < arr.length; i++) {\n    if (arr[i] === target) {\n      return i;\n    }\n  }\n  return -1;\n}',
      documentation: 'Linear search algorithm implementation'
    }
  ]

  const pythonCompletions = [
    {
      label: 'binary_search',
      kind: 1,
      insertText: 'def binary_search(arr, target):\n    left = 0\n    right = len(arr) - 1\n    \n    while left <= right:\n        mid = (left + right) // 2\n        \n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    \n    return -1',
      documentation: 'Binary search algorithm implementation'
    },
    {
      label: 'linear_search',
      kind: 1,
      insertText: 'def linear_search(arr, target):\n    for i in range(len(arr)):\n        if arr[i] == target:\n            return i\n    return -1',
      documentation: 'Linear search algorithm implementation'
    }
  ]

  return language === 'javascript' ? jsCompletions : pythonCompletions
}

// Educational themes for the editor
const getEditorThemes = () => ({
  'educational-light': {
    base: 'vs' as const,
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6a737d', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'd73a49', fontStyle: 'bold' },
      { token: 'string', foreground: '032f62' },
      { token: 'number', foreground: '005cc5' },
      { token: 'function', foreground: '6f42c1' }
    ],
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#24292e',
      'editor.lineHighlightBackground': '#f6f8fa',
      'editor.selectionBackground': '#0366d625',
      'editorLineNumber.foreground': '#959da5',
      'editorLineNumber.activeForeground': '#24292e'
    }
  },
  'educational-dark': {
    base: 'vs-dark' as const,
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6a737d', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'ff7b72', fontStyle: 'bold' },
      { token: 'string', foreground: 'a5d6ff' },
      { token: 'number', foreground: '79c0ff' },
      { token: 'function', foreground: 'd2a8ff' }
    ],
    colors: {
      'editor.background': '#0d1117',
      'editor.foreground': '#c9d1d9',
      'editor.lineHighlightBackground': '#161b22',
      'editor.selectionBackground': '#264f78',
      'editorLineNumber.foreground': '#484f58',
      'editorLineNumber.activeForeground': '#c9d1d9'
    }
  }
})

export function CodeEditor({
  language,
  initialCode,
  onCodeChange,
  onExecute,
  readOnly = false,
  theme = 'light'
}: CodeEditorProps) {
  const editorRef = useRef<import('monaco-editor').editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<Monaco | null>(null)
  const [isEditorReady, setIsEditorReady] = useState(false)

  const [isPythonReady, setIsPythonReady] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionError, setExecutionError] = useState<EducationalError | null>(null)

  // Handle editor mount
  const handleEditorDidMount = (editor: import('monaco-editor').editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco
    
    // Register custom themes
    const themes = getEditorThemes()
    monaco.editor.defineTheme('educational-light', themes['educational-light'])
    monaco.editor.defineTheme('educational-dark', themes['educational-dark'])
    
    // Set initial theme
    monaco.editor.setTheme(theme === 'light' ? 'educational-light' : 'educational-dark')
    
    // Register completion provider
    monaco.languages.registerCompletionItemProvider(
      language,
      {
        provideCompletionItems: (_, position) => {
          const suggestions = getAlgorithmCompletions(language).map(item => ({
            ...item,
            range: {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: position.column,
              endColumn: position.column
            }
          }))
          
          return { suggestions }
        }
      }
    )
    
    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      const code = editor.getValue()
      handleSafeExecution(code)
    })
    
    // Configure editor options for educational use
    editor.updateOptions({
      fontSize: 14,
      lineHeight: 20,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      lineNumbers: 'on',
      glyphMargin: true,
      folding: true,
      lineDecorationsWidth: 10,
      lineNumbersMinChars: 3,
      renderLineHighlight: 'line',
      selectOnLineNumbers: true,
      roundedSelection: false,
      readOnly,
      cursorStyle: 'line',
      automaticLayout: true,
      tabSize: language === 'python' ? 4 : 2,
      insertSpaces: true
    })
    
    setIsEditorReady(true)
  }

  // Initialize Python environment when language is Python
  useEffect(() => {
    if (language === 'python' && !isPythonReady) {
      pythonExecutionService.initialize()
        .then(() => {
          setIsPythonReady(true)
        })
        .catch((error) => {
          console.error('Failed to initialize Python environment:', error)
          setExecutionError({
            message: 'Failed to initialize Python environment',
            suggestion: 'Please refresh the page to try again. Make sure you have a stable internet connection.'
          })
        })
    }
  }, [language, isPythonReady])

  // Handle safe code execution with timeout protection
  const handleSafeExecution = async (code: string) => {
    if (!code.trim()) return
    
    setIsExecuting(true)
    setExecutionError(null)
    
    try {
      // Execute code using the language switching service
      const result = await languageSwitchingService.executeCode(code, language)
      
      if (result.error) {
        setExecutionError(result.error)
      } else {
        // Call the onExecute callback with the result
        onExecute(code)
        
        // Log successful execution for debugging
        console.log('Code executed successfully:', {
          language,
          result: result.result,
          steps: result.steps.length
        })
      }
    } catch (error) {
      const educationalError = convertToEducationalError(error instanceof Error ? error : new Error(String(error)), language)
      setExecutionError(educationalError)
      console.error('Execution error:', educationalError)
    } finally {
      setIsExecuting(false)
    }
  }

  // Convert runtime errors to educational messages
  const convertToEducationalError = (error: Error, lang: CodeLanguage): EducationalError => {
    const message = error.message || 'An error occurred'
    
    // Common error patterns and their educational explanations
    if (message.includes('undefined')) {
      return {
        message: 'Variable or function is undefined',
        suggestion: 'Make sure you\'ve declared all variables and functions before using them.',
        codeExample: lang === 'javascript' 
          ? 'let arr = [1, 2, 3]; // Declare before use'
          : 'arr = [1, 2, 3]  # Declare before use'
      }
    }
    
    if (message.includes('index') || message.includes('bounds')) {
      return {
        message: 'Array index out of bounds',
        suggestion: 'Check that your array indices are within the valid range (0 to array.length - 1).',
        codeExample: lang === 'javascript'
          ? 'if (i >= 0 && i < arr.length) { /* safe access */ }'
          : 'if 0 <= i < len(arr):  # safe access'
      }
    }
    
    if (message.includes('syntax')) {
      return {
        message: 'Syntax error in your code',
        suggestion: 'Check for missing brackets, semicolons, or incorrect indentation.',
        relatedConcept: 'syntax-basics'
      }
    }
    
    return {
      message,
      suggestion: 'Review your code for common programming errors and try again.'
    }
  }

  // Update theme when prop changes
  useEffect(() => {
    if (monacoRef.current && isEditorReady) {
      monacoRef.current.editor.setTheme(
        theme === 'light' ? 'educational-light' : 'educational-dark'
      )
    }
  }, [theme, isEditorReady])



  return (
    <div className={cn(
      "h-full w-full border rounded-lg overflow-hidden",
      theme === 'light' ? 'border-gray-200' : 'border-gray-700'
    )}>
      <div className={cn(
        "flex items-center justify-between px-4 py-2 border-b text-sm font-medium",
        theme === 'light' 
          ? 'bg-gray-50 border-gray-200 text-gray-700' 
          : 'bg-gray-800 border-gray-700 text-gray-300'
      )}>
        <span className="capitalize">{language} Editor</span>
        <div className="flex items-center gap-2">
          <span className="text-xs opacity-70">
            Ctrl+Enter to run
          </span>
          {language === 'python' && !isPythonReady && (
            <span className="text-xs text-yellow-600">
              Loading Python...
            </span>
          )}
          {!readOnly && (
            <button
              onClick={() => handleSafeExecution(editorRef.current?.getValue() || '')}
              disabled={isExecuting || (language === 'python' && !isPythonReady)}
              className={cn(
                "px-3 py-1 rounded text-xs font-medium transition-colors",
                isExecuting || (language === 'python' && !isPythonReady)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : theme === 'light'
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'bg-blue-900 text-blue-300 hover:bg-blue-800'
              )}
            >
              {isExecuting ? 'Running...' : 'Run Code'}
            </button>
          )}
        </div>
      </div>
      
      <div className="relative h-full">
        <Editor
          height={executionError ? "calc(100% - 49px - 120px)" : "calc(100% - 49px)"}
          language={language}
          value={initialCode}
          onChange={(value) => onCodeChange(value || '')}
          onMount={handleEditorDidMount}
          loading={
            <div className="flex items-center justify-center h-full">
              <div className="text-sm text-gray-500">Loading editor...</div>
            </div>
          }
          options={{
            readOnly,
            automaticLayout: true
          }}
        />
        
        {/* Error Display */}
        {executionError && (
          <div className={cn(
            "absolute bottom-0 left-0 right-0 p-4 border-t",
            theme === 'light'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-red-900/20 border-red-800 text-red-200'
          )}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium mb-1">
                  {executionError.message}
                </h4>
                <p className="text-sm opacity-90 mb-2">
                  {executionError.suggestion}
                </p>
                {executionError.codeExample && (
                  <pre className={cn(
                    "text-xs p-2 rounded font-mono overflow-x-auto",
                    theme === 'light'
                      ? 'bg-red-100 text-red-900'
                      : 'bg-red-900/30 text-red-100'
                  )}>
                    {executionError.codeExample}
                  </pre>
                )}
              </div>
              <button
                onClick={() => setExecutionError(null)}
                className={cn(
                  "flex-shrink-0 p-1 rounded hover:bg-opacity-20",
                  theme === 'light' ? 'hover:bg-red-200' : 'hover:bg-red-800'
                )}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}