'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CodeLanguage, AlgorithmStep, EducationalError } from '@/lib/types'
import { cn } from '@/lib/utils'

export interface ExecutionResult {
  id: string
  language: CodeLanguage
  code: string
  result: unknown
  steps: AlgorithmStep[]
  error?: EducationalError
  timestamp: string
  executionTime?: number
}

interface ExecutionResultsProps {
  results: ExecutionResult[]
  onClear: () => void
  maxResults?: number
  theme?: 'light' | 'dark'
}

export function ExecutionResults({
  results,
  onClear,
  maxResults = 10,
  theme = 'light'
}: ExecutionResultsProps) {
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set())
  const [showStepsFor, setShowStepsFor] = useState<string | null>(null)

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedResults)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedResults(newExpanded)
  }

  const toggleSteps = (id: string) => {
    setShowStepsFor(showStepsFor === id ? null : id)
  }

  const displayResults = results.slice(-maxResults)

  if (results.length === 0) {
    return (
      <div className={cn(
        "text-center py-8 rounded-lg border-2 border-dashed",
        theme === 'light'
          ? 'border-gray-300 text-gray-500'
          : 'border-gray-600 text-gray-400'
      )}>
        <div className="text-4xl mb-2">🚀</div>
        <p className="text-lg font-medium mb-1">No executions yet</p>
        <p className="text-sm">Run some code to see results here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className={cn(
          "text-xl font-semibold",
          theme === 'light' ? 'text-gray-900' : 'text-gray-100'
        )}>
          Execution Results ({results.length})
        </h2>
        <button
          onClick={onClear}
          className={cn(
            "px-3 py-1.5 text-sm rounded transition-colors",
            theme === 'light'
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          )}
        >
          Clear All
        </button>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {displayResults.map((result) => (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                "border rounded-lg overflow-hidden",
                theme === 'light'
                  ? 'bg-white border-gray-200'
                  : 'bg-gray-800 border-gray-700'
              )}
            >
              {/* Header */}
              <div className={cn(
                "px-4 py-3 border-b flex items-center justify-between",
                theme === 'light'
                  ? 'bg-gray-50 border-gray-200'
                  : 'bg-gray-900 border-gray-700'
              )}>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "px-2 py-1 text-xs font-medium rounded",
                    result.language === 'python'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-yellow-100 text-yellow-700'
                  )}>
                    {result.language.toUpperCase()}
                  </span>
                  <span className={cn(
                    "text-sm",
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  )}>
                    {result.timestamp}
                  </span>
                  {result.executionTime && (
                    <span className={cn(
                      "text-xs px-2 py-1 rounded",
                      theme === 'light'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-green-900 text-green-300'
                    )}>
                      {result.executionTime}ms
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {result.steps && result.steps.length > 0 && (
                    <button
                      onClick={() => toggleSteps(result.id)}
                      className={cn(
                        "text-xs px-2 py-1 rounded transition-colors",
                        showStepsFor === result.id
                          ? theme === 'light'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-blue-900 text-blue-300'
                          : theme === 'light'
                          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      )}
                    >
                      {result.steps.length} steps
                    </button>
                  )}
                  
                  <button
                    onClick={() => toggleExpanded(result.id)}
                    className={cn(
                      "text-xs px-2 py-1 rounded transition-colors",
                      theme === 'light'
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    )}
                  >
                    {expandedResults.has(result.id) ? 'Collapse' : 'Expand'}
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Error Display */}
                {result.error ? (
                  <div className={cn(
                    "p-3 rounded border",
                    theme === 'light'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-red-900/20 border-red-800'
                  )}>
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className={cn(
                          "text-sm font-medium mb-1",
                          theme === 'light' ? 'text-red-800' : 'text-red-200'
                        )}>
                          {result.error.message}
                        </h4>
                        <p className={cn(
                          "text-sm mb-2",
                          theme === 'light' ? 'text-red-700' : 'text-red-300'
                        )}>
                          {result.error.suggestion}
                        </p>
                        {result.error.codeExample && (
                          <pre className={cn(
                            "text-xs p-2 rounded font-mono overflow-x-auto",
                            theme === 'light'
                              ? 'bg-red-100 text-red-900'
                              : 'bg-red-900/30 text-red-100'
                          )}>
                            {result.error.codeExample}
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Success Display */
                  <div className={cn(
                    "p-3 rounded border",
                    theme === 'light'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-green-900/20 border-green-800'
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 text-green-500">
                        <svg fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className={cn(
                        "text-sm font-medium",
                        theme === 'light' ? 'text-green-800' : 'text-green-200'
                      )}>
                        Execution Successful
                      </span>
                    </div>
                    
                    <div className={cn(
                      "text-sm",
                      theme === 'light' ? 'text-green-700' : 'text-green-300'
                    )}>
                      <strong>Result:</strong> {
                        result.result !== null && result.result !== undefined
                          ? String(result.result)
                          : 'No return value'
                      }
                    </div>
                  </div>
                )}

                {/* Code Display (when expanded) */}
                {expandedResults.has(result.id) && (
                  <div className={cn(
                    "p-3 rounded border",
                    theme === 'light'
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-gray-900 border-gray-700'
                  )}>
                    <h4 className={cn(
                      "text-sm font-medium mb-2",
                      theme === 'light' ? 'text-gray-800' : 'text-gray-200'
                    )}>
                      Executed Code:
                    </h4>
                    <pre className={cn(
                      "text-xs font-mono overflow-x-auto p-2 rounded",
                      theme === 'light'
                        ? 'bg-white border border-gray-200'
                        : 'bg-gray-800 border border-gray-600'
                    )}>
                      {result.code}
                    </pre>
                  </div>
                )}

                {/* Algorithm Steps Display */}
                {showStepsFor === result.id && result.steps && result.steps.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={cn(
                      "p-3 rounded border",
                      theme === 'light'
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-blue-900/20 border-blue-800'
                    )}
                  >
                    <h4 className={cn(
                      "text-sm font-medium mb-3",
                      theme === 'light' ? 'text-blue-800' : 'text-blue-200'
                    )}>
                      Algorithm Steps ({result.steps.length}):
                    </h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {result.steps.map((step, index) => (
                        <div
                          key={index}
                          className={cn(
                            "p-2 rounded text-xs",
                            theme === 'light'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-blue-900/30 text-blue-200'
                          )}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">
                              Step {index + 1}: {step.type}
                            </span>
                            {step.indices.length > 0 && (
                              <span className={cn(
                                "px-1.5 py-0.5 rounded text-xs",
                                theme === 'light'
                                  ? 'bg-blue-200 text-blue-700'
                                  : 'bg-blue-800 text-blue-300'
                              )}>
                                [{step.indices.join(', ')}]
                              </span>
                            )}
                          </div>
                          <div>{step.description}</div>
                          {step.metadata && Object.keys(step.metadata).length > 0 && (
                            <div className="mt-1 text-xs opacity-75">
                              {JSON.stringify(step.metadata, null, 2)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {results.length > maxResults && (
        <div className={cn(
          "text-center text-sm py-2",
          theme === 'light' ? 'text-gray-500' : 'text-gray-400'
        )}>
          Showing last {maxResults} of {results.length} results
        </div>
      )}
    </div>
  )
}