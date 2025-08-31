'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useUIStore } from '@/lib/stores/ui-store'
import { useAlgorithmStore } from '@/lib/stores/algorithm-store'
import { ContentIntegrationSystem } from '../learning/content-integration-system'
import { ModeSelector } from '../learning/mode-selector'

interface EducationalContentDemoProps {
  className?: string
}

export function EducationalContentDemo({ className = '' }: EducationalContentDemoProps) {
  const { learningMode } = useUIStore()
  const _algorithmStore = useAlgorithmStore()
  const [currentConcept, setCurrentConcept] = React.useState('binary-search')
  const [simulatedStep, setSimulatedStep] = React.useState(0)
  const [learningProgress, setLearningProgress] = React.useState<any>(null)

  // Simulate algorithm execution for demo
  const simulateAlgorithmStep = () => {
    setSimulatedStep(prev => (prev + 1) % 8) // Simulate 8 steps
  }

  const resetSimulation = () => {
    setSimulatedStep(0)
  }

  const handleLearningProgress = (progress: any) => {
    setLearningProgress(progress)
  }

  // Mock algorithm state for demo
  const mockAlgorithmState = {
    type: 'binary-search',
    data: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19],
    currentStep: simulatedStep,
    totalSteps: 8,
    isRunning: simulatedStep > 0,
    target: 11,
    pointers: {
      left: simulatedStep > 0 ? Math.max(0, 5 - simulatedStep) : 0,
      right: simulatedStep > 0 ? Math.min(9, 5 + simulatedStep) : 9,
      mid: 5
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Demo Header */}
      <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-indigo-900">
                Educational Content Delivery System Demo
              </h1>
              <p className="text-indigo-700 mt-2">
                Experience adaptive learning content that changes based on your selected learning mode
              </p>
            </div>
            <Badge variant="outline" className="text-indigo-700 border-indigo-300">
              Interactive Demo
            </Badge>
          </div>

          {/* Demo Controls */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-indigo-800">Concept:</span>
              <select
                value={currentConcept}
                onChange={(e) => setCurrentConcept(e.target.value)}
                className="px-3 py-1 text-sm border border-indigo-200 rounded bg-white"
              >
                <option value="binary-search">Binary Search</option>
                <option value="linear-search">Linear Search</option>
                <option value="sorting">Sorting Algorithms</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={simulateAlgorithmStep}
                variant="outline"
                size="sm"
                className="text-indigo-700 border-indigo-300"
              >
                Simulate Step ({simulatedStep}/8)
              </Button>
              <Button
                onClick={resetSimulation}
                variant="outline"
                size="sm"
                className="text-indigo-700 border-indigo-300"
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Learning Mode Selector */}
      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Choose Your Learning Mode</h2>
          <p className="text-muted-foreground text-sm">
            The content below will adapt based on your selected learning mode. Try switching between modes to see the difference!
          </p>
          <ModeSelector showDescriptions={true} />
        </div>
      </Card>

      {/* Current Mode Indicator */}
      <div className="flex items-center gap-4 text-sm">
        <Badge variant="default" className="px-3 py-1">
          Current Mode: {learningMode === 'beginner' ? '🌱 Complete Beginner' : 
                        learningMode === 'curious' ? '🔍 Curious About Code' : 
                        '⚡ Show Me Details'}
        </Badge>
        {learningProgress && (
          <Badge variant="outline" className="px-3 py-1">
            Mastery: {learningProgress.currentMastery}
          </Badge>
        )}
      </div>

      <Separator />

      {/* Main Educational Content System */}
      <ContentIntegrationSystem
        concept={currentConcept}
        algorithmState={mockAlgorithmState}
        currentStep={simulatedStep}
        onLearningProgress={handleLearningProgress}
      />

      {/* Demo Information */}
      <Card className="p-6 bg-muted/30">
        <div className="space-y-4">
          <h3 className="font-semibold">Demo Features Showcase</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">🌱 Beginner Mode Features:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Visual analogies and real-world examples</li>
                <li>• No code required - focus on concepts</li>
                <li>• Interactive demos and step-by-step guidance</li>
                <li>• Contextual help system with hints</li>
                <li>• Slower animation speeds for better comprehension</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">🔍 Curious Mode Features:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Pre-written code with guided explanations</li>
                <li>• Step-by-step code walkthrough</li>
                <li>• Interactive code exploration</li>
                <li>• Both analogies and code examples</li>
                <li>• Big-O complexity introduction</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">⚡ Details Mode Features:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Full code editor with syntax highlighting</li>
                <li>• Technical deep dives and implementation details</li>
                <li>• Advanced concepts and optimizations</li>
                <li>• Mathematical notation and proofs</li>
                <li>• Performance analysis and edge cases</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">🤖 Adaptive Features:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Learning progress tracking</li>
                <li>• Adaptive hints based on user behavior</li>
                <li>• Mastery level assessment</li>
                <li>• Personalized content recommendations</li>
                <li>• Struggling area identification</li>
              </ul>
            </div>
          </div>

          {/* Learning Progress Display */}
          {learningProgress && (
            <div className="mt-6 p-4 bg-white rounded-lg border">
              <h4 className="font-medium mb-3">Current Learning Session:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-medium text-muted-foreground">Time Spent</div>
                  <div>{Math.floor(learningProgress.timeSpent / 60)}:{(learningProgress.timeSpent % 60).toString().padStart(2, '0')}</div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground">Sections Completed</div>
                  <div>{learningProgress.completedSections.length}</div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground">Interactions</div>
                  <div>{learningProgress.interactionCount}</div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground">Mastery Level</div>
                  <div className="capitalize">{learningProgress.currentMastery}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}