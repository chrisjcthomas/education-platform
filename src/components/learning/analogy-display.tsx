'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Analogy {
  id: string
  title: string
  description: string
  visualAid?: string
  interactiveDemo?: boolean
  relatedConcept: string
  difficulty: 'simple' | 'intermediate' | 'advanced'
}

interface AnalogyDisplayProps {
  analogies: Analogy[]
  currentConcept?: string
  className?: string
  interactive?: boolean
}

const BINARY_SEARCH_ANALOGIES: Analogy[] = [
  {
    id: 'dictionary',
    title: 'Dictionary Search',
    description: 'Finding a word in a dictionary is just like binary search! You open to the middle, see if your word comes before or after that page, then eliminate half the dictionary. Keep doing this until you find your word.',
    visualAid: '📖 → 📄 → 🎯',
    interactiveDemo: true,
    relatedConcept: 'binary-search',
    difficulty: 'simple'
  },
  {
    id: 'guessing-game',
    title: 'Number Guessing Game',
    description: 'Think of the "guess my number" game! If someone thinks of a number between 1-100, you always guess 50 first. If they say "higher," you guess 75. If "lower," you guess 25. You keep cutting the possibilities in half!',
    visualAid: '🎯 1-100 → 50 → 25/75 → Found!',
    interactiveDemo: true,
    relatedConcept: 'binary-search',
    difficulty: 'simple'
  },
  {
    id: 'library-books',
    title: 'Library Book Search',
    description: 'Looking for a book in a library with organized shelves. You know books are sorted alphabetically, so you start in the middle section and work your way to the right section by eliminating whole sections at once.',
    visualAid: '📚 A-M-Z → M → A-F/N-Z → Found!',
    interactiveDemo: false,
    relatedConcept: 'binary-search',
    difficulty: 'simple'
  },
  {
    id: 'phone-book',
    title: 'Phone Book Search',
    description: 'Remember phone books? They were huge books with names sorted alphabetically. To find "Smith," you wouldn\'t start from "Adams" - you\'d flip to the middle and see if you need to go forward or backward.',
    visualAid: '📞 A-Z → M → S → Smith!',
    interactiveDemo: false,
    relatedConcept: 'binary-search',
    difficulty: 'intermediate'
  }
]

export function AnalogyDisplay({ 
  analogies = BINARY_SEARCH_ANALOGIES, 
  currentConcept = 'binary-search',
  className = '',
  interactive = true 
}: AnalogyDisplayProps) {
  const [selectedAnalogy, setSelectedAnalogy] = React.useState<string>(analogies[0]?.id || '')
  const [showInteractive, setShowInteractive] = React.useState(false)
  const [completedAnalogies, setCompletedAnalogies] = React.useState<Set<string>>(new Set())

  const filteredAnalogies = analogies.filter(analogy => 
    !currentConcept || analogy.relatedConcept === currentConcept
  )

  const currentAnalogy = filteredAnalogies.find(a => a.id === selectedAnalogy) || filteredAnalogies[0]

  const handleAnalogySelect = (analogyId: string) => {
    setSelectedAnalogy(analogyId)
    setShowInteractive(false)
    // Mark previous analogy as completed
    if (selectedAnalogy) {
      setCompletedAnalogies(prev => new Set([...prev, selectedAnalogy]))
    }
  }

  const toggleInteractive = () => {
    if (currentAnalogy?.interactiveDemo) {
      setShowInteractive(!showInteractive)
    }
  }

  if (!currentAnalogy) {
    return (
      <Card className={`p-6 ${className}`}>
        <p className="text-muted-foreground text-center">
          No analogies available for this concept.
        </p>
      </Card>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Analogy Selector */}
      {filteredAnalogies.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {filteredAnalogies.map((analogy) => (
            <button
              key={analogy.id}
              onClick={() => handleAnalogySelect(analogy.id)}
              className={`px-3 py-1.5 text-sm rounded-full transition-all duration-200 relative ${
                selectedAnalogy === analogy.id
                  ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              {analogy.title}
              {completedAnalogies.has(analogy.id) && (
                <span className="absolute -top-1 -right-1 text-green-500 text-xs">✓</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Main Analogy Display */}
      <motion.div
        key={selectedAnalogy}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-6 bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-semibold text-green-800">
                  {currentAnalogy.title}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  Analogy
                </Badge>
              </div>
              {currentAnalogy.interactiveDemo && interactive && (
                <button
                  onClick={toggleInteractive}
                  className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                >
                  {showInteractive ? 'Hide Demo' : 'Try Interactive Demo'}
                </button>
              )}
            </div>

            {/* Visual Aid */}
            {currentAnalogy.visualAid && (
              <div className="text-center py-4">
                <div className="text-3xl font-mono bg-white rounded-lg p-4 border border-green-200 inline-block">
                  {currentAnalogy.visualAid}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <p className="text-green-700 leading-relaxed text-lg">
                {currentAnalogy.description}
              </p>
            </div>

            {/* Interactive Demo */}
            {showInteractive && currentAnalogy.interactiveDemo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <InteractiveAnalogyDemo analogy={currentAnalogy} />
              </motion.div>
            )}

            {/* Connection to Algorithm */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">
                How this relates to {currentConcept.replace('-', ' ')}:
              </h4>
              <p className="text-blue-700 text-sm">
                {getConnectionExplanation(currentAnalogy.id, currentConcept)}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

/**
 * Interactive demo component for analogies
 */
function InteractiveAnalogyDemo({ analogy }: { analogy: Analogy }) {
  const [step, setStep] = React.useState(0)
  const [isPlaying, setIsPlaying] = React.useState(false)

  const demoSteps = getDemoSteps(analogy.id)

  const nextStep = () => {
    if (step < demoSteps.length - 1) {
      setStep(step + 1)
    } else {
      setStep(0) // Reset to beginning
    }
  }

  const playDemo = () => {
    setIsPlaying(true)
    setStep(0)
    
    const interval = setInterval(() => {
      setStep(prev => {
        if (prev >= demoSteps.length - 1) {
          clearInterval(interval)
          setIsPlaying(false)
          return 0
        }
        return prev + 1
      })
    }, 2000)
  }

  const currentStep = demoSteps[step] || demoSteps[0]

  return (
    <Card className="p-4 bg-yellow-50 border-yellow-200">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-yellow-800">Interactive Demo</h4>
          <div className="flex gap-2">
            <button
              onClick={nextStep}
              disabled={isPlaying}
              className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 disabled:opacity-50"
            >
              Next Step
            </button>
            <button
              onClick={playDemo}
              disabled={isPlaying}
              className="px-3 py-1 text-xs bg-yellow-200 text-yellow-800 rounded hover:bg-yellow-300 disabled:opacity-50"
            >
              {isPlaying ? 'Playing...' : 'Play Demo'}
            </button>
          </div>
        </div>

        <div className="text-center">
          <div className="text-2xl mb-2">{currentStep.visual}</div>
          <p className="text-yellow-700 text-sm">{currentStep.description}</p>
        </div>

        <div className="flex justify-center">
          <div className="flex gap-1">
            {demoSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === step ? 'bg-yellow-500' : 'bg-yellow-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}

/**
 * Get demo steps for interactive analogies
 */
function getDemoSteps(analogyId: string) {
  switch (analogyId) {
    case 'dictionary':
      return [
        { visual: '📖', description: 'You have a dictionary and want to find "SEARCH"' },
        { visual: '📖 ➡️ 📄', description: 'Open to the middle page - you see "MIDDLE"' },
        { visual: '📄 ➡️ 📄', description: '"SEARCH" comes after "MIDDLE", so look in the right half' },
        { visual: '📄 ➡️ 🎯', description: 'Open to the middle of the right half and find "SEARCH"!' }
      ]
    case 'guessing-game':
      return [
        { visual: '🎯 1-100', description: 'Think of a number between 1-100. Let\'s say it\'s 73.' },
        { visual: '🎯 50', description: 'First guess: 50. "Higher!" So it\'s between 51-100.' },
        { visual: '🎯 75', description: 'Next guess: 75. "Lower!" So it\'s between 51-74.' },
        { visual: '🎯 73', description: 'Next guess: 73. "Correct!" Found it in just 3 guesses!' }
      ]
    default:
      return [
        { visual: '🔍', description: 'Interactive demo not available for this analogy.' }
      ]
  }
}

/**
 * Get explanation of how analogy connects to the algorithm
 */
function getConnectionExplanation(analogyId: string, concept: string) {
  const explanations: Record<string, Record<string, string>> = {
    'binary-search': {
      'dictionary': 'Just like finding a word in a dictionary, binary search eliminates half the possibilities at each step by comparing the target with the middle element.',
      'guessing-game': 'The number guessing strategy is exactly how binary search works - always pick the middle value and eliminate half the remaining options.',
      'library-books': 'Binary search uses the same principle as finding a book in an organized library - use the sorting to eliminate large sections at once.',
      'phone-book': 'Phone books demonstrate why binary search is so powerful - instead of checking every name, you can find any name in just a few steps.'
    }
  }

  return explanations[concept]?.[analogyId] || 'This analogy helps explain the core concept of dividing the problem in half at each step.'
}