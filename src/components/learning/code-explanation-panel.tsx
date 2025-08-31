'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface CodeExplanation {
  id: string
  title: string
  code: string
  language: 'javascript' | 'python'
  explanation: string
  keyPoints: string[]
  stepByStep: CodeStep[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  concept: string
}

interface CodeStep {
  lineNumbers: number[]
  title: string
  description: string
  highlight: boolean
}

interface CodeExplanationPanelProps {
  explanations: CodeExplanation[]
  currentConcept?: string
  language?: 'javascript' | 'python'
  className?: string
  interactive?: boolean
}

const BINARY_SEARCH_EXPLANATIONS: CodeExplanation[] = [
  {
    id: 'basic-binary-search-js',
    title: 'Basic Binary Search',
    language: 'javascript',
    code: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid; // Found it!
    } else if (arr[mid] < target) {
      left = mid + 1; // Search right half
    } else {
      right = mid - 1; // Search left half
    }
  }
  
  return -1; // Not found
}`,
    explanation: 'This is the classic binary search algorithm. It works by repeatedly dividing the search space in half until we find our target or determine it doesn\'t exist.',
    keyPoints: [
      'We keep track of left and right boundaries',
      'Always check the middle element first',
      'Eliminate half the array with each comparison',
      'Return the index when found, -1 when not found'
    ],
    stepByStep: [
      {
        lineNumbers: [2, 3],
        title: 'Initialize Boundaries',
        description: 'Set up pointers to track the current search area. Left starts at 0, right starts at the last index.',
        highlight: true
      },
      {
        lineNumbers: [5],
        title: 'Loop Condition',
        description: 'Continue searching as long as there are elements to check (left <= right).',
        highlight: true
      },
      {
        lineNumbers: [6],
        title: 'Find Middle',
        description: 'Calculate the middle index. We use Math.floor to handle odd-length arrays.',
        highlight: true
      },
      {
        lineNumbers: [8, 9],
        title: 'Check if Found',
        description: 'If the middle element equals our target, we found it! Return the index.',
        highlight: true
      },
      {
        lineNumbers: [10, 11],
        title: 'Search Right Half',
        description: 'If middle element is smaller than target, the target must be in the right half.',
        highlight: true
      },
      {
        lineNumbers: [12, 13],
        title: 'Search Left Half',
        description: 'If middle element is larger than target, the target must be in the left half.',
        highlight: true
      }
    ],
    difficulty: 'beginner',
    concept: 'binary-search'
  },
  {
    id: 'basic-binary-search-py',
    title: 'Basic Binary Search',
    language: 'python',
    code: `def binary_search(arr, target):
    left = 0
    right = len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid  # Found it!
        elif arr[mid] < target:
            left = mid + 1  # Search right half
        else:
            right = mid - 1  # Search left half
    
    return -1  # Not found`,
    explanation: 'The Python version of binary search follows the same logic as JavaScript, but uses Python syntax like // for integer division and elif for else-if.',
    keyPoints: [
      'Uses // for integer division instead of Math.floor',
      'elif is Python\'s way of writing else-if',
      'Indentation is crucial in Python',
      'Same algorithm, different syntax'
    ],
    stepByStep: [
      {
        lineNumbers: [2, 3],
        title: 'Initialize Boundaries',
        description: 'Set left to 0 and right to the last valid index using len(arr) - 1.',
        highlight: true
      },
      {
        lineNumbers: [5],
        title: 'While Loop',
        description: 'Continue while there are still elements to search (left <= right).',
        highlight: true
      },
      {
        lineNumbers: [6],
        title: 'Calculate Middle',
        description: 'Use // for integer division to get the middle index without decimals.',
        highlight: true
      },
      {
        lineNumbers: [8, 9],
        title: 'Target Found',
        description: 'If arr[mid] equals target, return the index where we found it.',
        highlight: true
      },
      {
        lineNumbers: [10, 11],
        title: 'Search Right',
        description: 'If middle value is too small, move left boundary to mid + 1.',
        highlight: true
      },
      {
        lineNumbers: [12, 13],
        title: 'Search Left',
        description: 'If middle value is too large, move right boundary to mid - 1.',
        highlight: true
      }
    ],
    difficulty: 'beginner',
    concept: 'binary-search'
  }
]

export function CodeExplanationPanel({
  explanations = BINARY_SEARCH_EXPLANATIONS,
  currentConcept = 'binary-search',
  language = 'javascript',
  className = '',
  interactive = true
}: CodeExplanationPanelProps) {
  const [selectedExplanation, setSelectedExplanation] = React.useState<string>('')
  const [currentStep, setCurrentStep] = React.useState(0)
  const [showStepByStep, setShowStepByStep] = React.useState(false)
  const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(new Set())
  const [isAutoPlaying, setIsAutoPlaying] = React.useState(false)

  const filteredExplanations = explanations.filter(exp => 
    exp.concept === currentConcept && exp.language === language
  )

  React.useEffect(() => {
    if (filteredExplanations.length > 0 && !selectedExplanation) {
      setSelectedExplanation(filteredExplanations[0].id)
    }
  }, [filteredExplanations, selectedExplanation])

  const currentExplanation = filteredExplanations.find(exp => exp.id === selectedExplanation)

  const handleExplanationSelect = (explanationId: string) => {
    setSelectedExplanation(explanationId)
    setCurrentStep(0)
    setShowStepByStep(false)
  }

  const nextStep = () => {
    if (currentExplanation && currentStep < currentExplanation.stepByStep.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]))
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const playAllSteps = () => {
    setIsAutoPlaying(true)
    setCurrentStep(0)
    setCompletedSteps(new Set())
    
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (currentExplanation && prev >= currentExplanation.stepByStep.length - 1) {
          clearInterval(interval)
          setIsAutoPlaying(false)
          return prev
        }
        setCompletedSteps(prevCompleted => new Set([...prevCompleted, prev]))
        return prev + 1
      })
    }, 3000) // 3 seconds per step
  }

  const toggleStepByStep = () => {
    setShowStepByStep(!showStepByStep)
    setCurrentStep(0)
  }

  if (!currentExplanation) {
    return (
      <Card className={`p-6 ${className}`}>
        <p className="text-muted-foreground text-center">
          No code explanations available for {language} and {currentConcept}.
        </p>
      </Card>
    )
  }

  const highlightedLines = showStepByStep 
    ? currentExplanation.stepByStep[currentStep]?.lineNumbers || []
    : []

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Language/Explanation Selector */}
      {filteredExplanations.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {filteredExplanations.map((explanation) => (
            <button
              key={explanation.id}
              onClick={() => handleExplanationSelect(explanation.id)}
              className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
                selectedExplanation === explanation.id
                  ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              {explanation.title}
            </button>
          ))}
        </div>
      )}

      {/* Main Code Explanation */}
      <motion.div
        key={selectedExplanation}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <div className="p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-semibold text-blue-800">
                  {currentExplanation.title}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {currentExplanation.language}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    currentExplanation.difficulty === 'beginner' ? 'border-green-300 text-green-700' :
                    currentExplanation.difficulty === 'intermediate' ? 'border-yellow-300 text-yellow-700' :
                    'border-red-300 text-red-700'
                  }`}
                >
                  {currentExplanation.difficulty}
                </Badge>
              </div>
              {interactive && (
                <Button
                  onClick={toggleStepByStep}
                  variant="outline"
                  size="sm"
                  className="text-blue-700 border-blue-300 hover:bg-blue-100"
                >
                  {showStepByStep ? 'Hide Steps' : 'Step-by-Step'}
                </Button>
              )}
            </div>

            {/* Code Block */}
            <div className="relative">
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm">
                  {currentExplanation.code.split('\n').map((line, index) => {
                    const lineNumber = index + 1
                    const isHighlighted = highlightedLines.includes(lineNumber)
                    
                    return (
                      <motion.div
                        key={index}
                        className={`flex ${isHighlighted ? 'bg-yellow-400/20 rounded' : ''}`}
                        animate={isHighlighted ? { scale: 1.02 } : { scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <span className="text-gray-500 w-8 text-right mr-4 select-none">
                          {lineNumber}
                        </span>
                        <code className={`text-green-400 ${isHighlighted ? 'font-semibold' : ''}`}>
                          {line}
                        </code>
                      </motion.div>
                    )
                  })}
                </pre>
              </div>
            </div>

            {/* Step-by-Step Explanation */}
            <AnimatePresence>
              {showStepByStep && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-4 bg-yellow-50 border-yellow-200">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-yellow-800">
                          Step {currentStep + 1} of {currentExplanation.stepByStep.length}
                        </h4>
                        <div className="flex gap-2">
                          <Button
                            onClick={prevStep}
                            disabled={currentStep === 0 || isAutoPlaying}
                            variant="outline"
                            size="sm"
                          >
                            Previous
                          </Button>
                          <Button
                            onClick={nextStep}
                            disabled={currentStep === currentExplanation.stepByStep.length - 1 || isAutoPlaying}
                            variant="outline"
                            size="sm"
                          >
                            Next
                          </Button>
                          <Button
                            onClick={playAllSteps}
                            disabled={isAutoPlaying}
                            variant="default"
                            size="sm"
                          >
                            {isAutoPlaying ? 'Playing...' : 'Play All'}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-yellow-800 mb-2">
                          {currentExplanation.stepByStep[currentStep]?.title}
                        </h5>
                        <p className="text-yellow-700 text-sm">
                          {currentExplanation.stepByStep[currentStep]?.description}
                        </p>
                      </div>

                      {/* Progress indicator */}
                      <div className="flex gap-1">
                        {currentExplanation.stepByStep.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => !isAutoPlaying && setCurrentStep(index)}
                            disabled={isAutoPlaying}
                            className={`h-2 flex-1 rounded transition-all cursor-pointer hover:scale-110 ${
                              index === currentStep ? 'bg-yellow-500' : 
                              completedSteps.has(index) ? 'bg-green-400' :
                              index < currentStep ? 'bg-yellow-300' : 'bg-yellow-200'
                            }`}
                            title={`Step ${index + 1}: ${currentExplanation.stepByStep[index]?.title}`}
                          />
                        ))}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* General Explanation */}
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <p className="text-blue-700 leading-relaxed">
                {currentExplanation.explanation}
              </p>
            </div>

            {/* Key Points */}
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-3">Key Points:</h4>
              <ul className="space-y-2">
                {currentExplanation.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-2 text-blue-700 text-sm">
                    <span className="text-blue-500 mt-1">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}