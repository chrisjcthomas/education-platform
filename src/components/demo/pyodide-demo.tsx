'use client'

import { useState, useEffect } from 'react'
import { CodeEditor } from '@/components/editor/code-editor'
import { LanguageSwitcher } from '@/components/editor/language-switcher'
import { ExecutionResults, ExecutionResult } from '@/components/execution/execution-results'
import { ResponsiveLayout, MobileOptimizedCodeEditor, TouchOptimizedControls, MobileButton } from '@/components/layout/responsive-layout'
// import { performanceMonitor } from '@/lib/monitoring/performance-monitor' // Unused
import { CodeLanguage } from '@/lib/types'
import { languageSwitchingService } from '@/lib/services/language-switching-service'
import { pythonExecutionService } from '@/lib/services/python-execution-service'

export function PyodideDemo() {
  const [language, setLanguage] = useState<CodeLanguage>('javascript')
  const [code, setCode] = useState(`// Binary Search Algorithm Demo
const arr = [1, 3, 5, 7, 9, 11, 13, 15];
const target = 7;

// Use the educational version to see steps
const result = binarySearchEducational(arr, target);
console.log(\`Found \${target} at index: \${result}\`);

// Check the algorithm steps
console.log('Steps taken:', tracker.steps.length);`)

  const [executionResults, setExecutionResults] = useState<ExecutionResult[]>([])
  const [isPythonReady, setIsPythonReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [executionTime, setExecutionTime] = useState<number | null>(null)

  // Initialize Python when component mounts
  useEffect(() => {
    const initPython = async () => {
      try {
        setIsLoading(true)
        await pythonExecutionService.initialize()
        setIsPythonReady(true)
      } catch (error) {
        console.error('Failed to initialize Python:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initPython()
  }, [])

  const handleLanguageChange = (newLanguage: CodeLanguage, newCode: string) => {
    setLanguage(newLanguage)
    setCode(newCode)
  }

  const handleCodeExecution = async (executedCode: string) => {
    try {
      const startTime = performance.now()
      const result = await languageSwitchingService.executeCode(executedCode, language)
      const endTime = performance.now()
      const executionTimeMs = Math.round(endTime - startTime)
      
      setExecutionTime(executionTimeMs)
      const executionResult: ExecutionResult = {
        id: Date.now().toString(),
        language,
        code: executedCode,
        result: result.result,
        steps: result.steps,
        error: result.error,
        timestamp: new Date().toLocaleTimeString(),
        executionTime: executionTimeMs
      }
      
      setExecutionResults(prev => [...prev, executionResult])
    } catch (error) {
      console.error('Execution failed:', error)
      const errorResult: ExecutionResult = {
        id: Date.now().toString(),
        language,
        code: executedCode,
        result: null,
        steps: [],
        error: {
          message: 'Execution failed',
          suggestion: 'Please check your code and try again.'
        },
        timestamp: new Date().toLocaleTimeString()
      }
      
      setExecutionResults(prev => [...prev, errorResult])
    }
  }

  const clearResults = () => {
    setExecutionResults([])
  }

  const loadTemplate = (algorithmType: 'binary-search' | 'linear-search') => {
    const template = languageSwitchingService.getCodeTemplate(language, algorithmType)
    setCode(template)
  }

  const controlsSection = (
    <div className="space-y-4">
      {/* Status Indicators */}
      <div className="flex items-center justify-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isPythonReady ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <span className="text-sm font-medium">
            Python: {isPythonReady ? 'Ready' : isLoading ? 'Loading...' : 'Not Ready'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-sm font-medium">JavaScript: Ready</span>
        </div>
        {executionTime && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-sm font-medium">Last: {executionTime}ms</span>
          </div>
        )}
      </div>

      {/* Language Switcher */}
      <div className="p-4 bg-white border rounded-lg">
        <LanguageSwitcher
          currentLanguage={language}
          currentCode={code}
          onLanguageChange={handleLanguageChange}
          disabled={language === 'python' && !isPythonReady}
        />
      </div>

      {/* Template Buttons */}
      <TouchOptimizedControls>
        <div className="w-full">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Algorithm Templates</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <MobileButton
              onClick={() => loadTemplate('binary-search')}
              variant="outline"
              size="md"
              className="justify-start"
            >
              🔍 Binary Search - O(log n)
            </MobileButton>
            <MobileButton
              onClick={() => loadTemplate('linear-search')}
              variant="outline"
              size="md"
              className="justify-start"
            >
              📋 Linear Search - O(n)
            </MobileButton>
            <MobileButton
              onClick={clearResults}
              variant="secondary"
              size="md"
              className="justify-start"
            >
              🗑️ Clear Results
            </MobileButton>
          </div>
        </div>
      </TouchOptimizedControls>

      {/* Educational Information */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          🚀 Features
        </h3>
        <div className="space-y-1 text-xs text-blue-800">
          <p><strong>Pyodide:</strong> Python in browser via WebAssembly</p>
          <p><strong>Language Switching:</strong> JS ↔ Python conversion</p>
          <p><strong>Step Tracking:</strong> Algorithm visualization</p>
          <p><strong>Safe Execution:</strong> Sandboxed with timeouts</p>
        </div>
      </div>
    </div>
  )

  const editorSection = (
    <div className="border rounded-lg overflow-hidden h-96">
      <CodeEditor
        language={language}
        initialCode={code}
        onCodeChange={setCode}
        onExecute={handleCodeExecution}
        readOnly={false}
        theme="light"
      />
    </div>
  )

  const resultsSection = (
    <ExecutionResults
      results={executionResults}
      onClear={clearResults}
      theme="light"
    />
  )

  return (
    <ResponsiveLayout className="bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Pyodide Python Execution Demo
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Interactive algorithm learning with JavaScript and Python execution in the browser
            </p>
          </div>
          <div className="flex justify-center md:justify-end">
            <div className="text-xs text-gray-500">
              Performance monitoring active
            </div>
          </div>
        </div>

        <MobileOptimizedCodeEditor
          controls={controlsSection}
          results={resultsSection}
        >
          {editorSection}
        </MobileOptimizedCodeEditor>
      </div>
    </ResponsiveLayout>
  )
}