'use client'

import { useState } from 'react'
import { CodeLanguage } from '@/lib/types'
import { cn } from '@/lib/utils'
import { languageSwitchingService } from '@/lib/services/language-switching-service'

interface LanguageSwitcherProps {
  currentLanguage: CodeLanguage
  currentCode: string
  onLanguageChange: (language: CodeLanguage, convertedCode: string) => void
  theme?: 'light' | 'dark'
  disabled?: boolean
}

export function LanguageSwitcher({
  currentLanguage,
  currentCode,
  onLanguageChange,
  theme = 'light',
  disabled = false
}: LanguageSwitcherProps) {
  const [isConverting, setIsConverting] = useState(false)
  const [conversionWarnings, setConversionWarnings] = useState<string[]>([])
  const [showWarnings, setShowWarnings] = useState(false)

  const handleLanguageSwitch = async (newLanguage: CodeLanguage) => {
    if (newLanguage === currentLanguage || disabled) return

    setIsConverting(true)
    setConversionWarnings([])

    try {
      // Convert code to new language
      const result = languageSwitchingService.convertCode(
        currentCode,
        currentLanguage,
        newLanguage
      )

      // Show warnings if any
      if (result.warnings && result.warnings.length > 0) {
        setConversionWarnings(result.warnings)
        setShowWarnings(true)
      }

      // Update language and code
      onLanguageChange(newLanguage, result.convertedCode)
    } catch (error) {
      console.error('Failed to convert code:', error)
      // Still switch language but keep original code
      onLanguageChange(newLanguage, currentCode)
    } finally {
      setIsConverting(false)
    }
  }

  const getLanguageTemplate = (language: CodeLanguage) => {
    return languageSwitchingService.getCodeTemplate(language, 'binary-search')
  }

  const handleUseTemplate = (language: CodeLanguage) => {
    const template = getLanguageTemplate(language)
    onLanguageChange(language, template)
  }

  return (
    <div className="relative">
      {/* Language Toggle */}
      <div className={cn(
        "flex items-center rounded-lg p-1 border",
        theme === 'light'
          ? 'bg-gray-100 border-gray-200'
          : 'bg-gray-800 border-gray-700'
      )}>
        <button
          onClick={() => handleLanguageSwitch('javascript')}
          disabled={disabled || isConverting}
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
            currentLanguage === 'javascript'
              ? theme === 'light'
                ? 'bg-white text-blue-700 shadow-sm border border-blue-200'
                : 'bg-gray-700 text-blue-300 shadow-sm border border-blue-800'
              : theme === 'light'
              ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700',
            (disabled || isConverting) && 'opacity-50 cursor-not-allowed'
          )}
        >
          JavaScript
        </button>
        
        <button
          onClick={() => handleLanguageSwitch('python')}
          disabled={disabled || isConverting}
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
            currentLanguage === 'python'
              ? theme === 'light'
                ? 'bg-white text-blue-700 shadow-sm border border-blue-200'
                : 'bg-gray-700 text-blue-300 shadow-sm border border-blue-800'
              : theme === 'light'
              ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700',
            (disabled || isConverting) && 'opacity-50 cursor-not-allowed'
          )}
        >
          Python
        </button>

        {isConverting && (
          <div className="ml-2 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
            <span className="ml-1 text-xs text-gray-500">Converting...</span>
          </div>
        )}
      </div>

      {/* Template Button */}
      <button
        onClick={() => handleUseTemplate(currentLanguage)}
        disabled={disabled}
        className={cn(
          "mt-2 px-2 py-1 text-xs rounded border transition-colors",
          theme === 'light'
            ? 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
            : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        Use {currentLanguage === 'javascript' ? 'JavaScript' : 'Python'} Template
      </button>

      {/* Conversion Warnings */}
      {showWarnings && conversionWarnings.length > 0 && (
        <div className={cn(
          "absolute top-full left-0 right-0 mt-2 p-3 rounded-lg border z-10",
          theme === 'light'
            ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
            : 'bg-yellow-900/20 border-yellow-800 text-yellow-200'
        )}>
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 w-4 h-4 mt-0.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium mb-1">Conversion Notes</h4>
              <ul className="text-sm space-y-1">
                {conversionWarnings.map((warning, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <span className="text-xs mt-1">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => setShowWarnings(false)}
              className={cn(
                "flex-shrink-0 p-1 rounded hover:bg-opacity-20",
                theme === 'light' ? 'hover:bg-yellow-200' : 'hover:bg-yellow-800'
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
  )
}