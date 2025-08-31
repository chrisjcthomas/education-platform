'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useUIStore } from '@/lib/stores/ui-store'
import { useModeConfig } from './content-filter'
import { EducationalContentDelivery } from './educational-content-delivery'

interface ContentIntegrationSystemProps {
  concept: string
  algorithmState?: any
  currentStep?: number
  onLearningProgress?: (progress: LearningProgress) => void
  className?: string
}

interface LearningProgress {
  concept: string
  completedSections: string[]
  timeSpent: number
  interactionCount: number
  helpItemsUsed: string[]
  currentMastery: 'novice' | 'learning' | 'proficient' | 'expert'
}

interface LearningSession {
  startTime: Date
  concept: string
  mode: string
  interactions: LearningInteraction[]
}

interface LearningInteraction {
  type: 'section_opened' | 'help_requested' | 'analogy_completed' | 'code_step_completed' | 'technical_detail_viewed'
  timestamp: Date
  data: any
}

export function ContentIntegrationSystem({
  concept,
  algorithmState,
  currentStep = 0,
  onLearningProgress,
  className = ''
}: ContentIntegrationSystemProps) {
  const { learningMode } = useUIStore()
  const config = useModeConfig()
  
  // Learning progress tracking
  const [session, setSession] = React.useState<LearningSession>(() => ({
    startTime: new Date(),
    concept,
    mode: learningMode,
    interactions: []
  }))
  
  const [progress, setProgress] = React.useState<LearningProgress>(() => ({
    concept,
    completedSections: [],
    timeSpent: 0,
    interactionCount: 0,
    helpItemsUsed: [],
    currentMastery: 'novice'
  }))

  const [adaptiveHints, setAdaptiveHints] = React.useState<string[]>([])
  const [strugglingAreas, setStrugglingAreas] = React.useState<string[]>([])

  // Track time spent
  React.useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => ({
        ...prev,
        timeSpent: prev.timeSpent + 1
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Analyze learning patterns and provide adaptive content
  React.useEffect(() => {
    const recentInteractions = session.interactions.slice(-10)
    const helpRequests = recentInteractions.filter(i => i.type === 'help_requested')
    
    // If user is requesting help frequently, they might be struggling
    if (helpRequests.length > 3) {
      const strugglingTopics = helpRequests.map(h => h.data.topic).filter(Boolean)
      setStrugglingAreas(prev => [...new Set([...prev, ...strugglingTopics])])
      
      // Suggest switching to easier mode if struggling in advanced mode
      if (learningMode === 'details' && strugglingTopics.length > 2) {
        setAdaptiveHints(prev => [...prev, 'Consider switching to "Curious About Code" mode for more guided explanations'])
      }
    }

    // Calculate mastery level based on interactions and time
    const masteryScore = calculateMasteryScore(progress, session.interactions)
    const newMastery = getMasteryLevel(masteryScore)
    
    if (newMastery !== progress.currentMastery) {
      setProgress(prev => ({ ...prev, currentMastery: newMastery }))
      
      // Suggest advancing to next mode if mastery is high
      if (newMastery === 'proficient' && learningMode === 'beginner') {
        setAdaptiveHints(prev => [...prev, 'You\'re doing great! Ready to try "Curious About Code" mode?'])
      } else if (newMastery === 'expert' && learningMode === 'curious') {
        setAdaptiveHints(prev => [...prev, 'Excellent progress! Consider "Show Me Details" mode for advanced concepts'])
      }
    }

    // Report progress
    onLearningProgress?.(progress)
  }, [session.interactions, progress, learningMode, onLearningProgress])

  const trackInteraction = (type: LearningInteraction['type'], data: any = {}) => {
    const interaction: LearningInteraction = {
      type,
      timestamp: new Date(),
      data
    }

    setSession(prev => ({
      ...prev,
      interactions: [...prev.interactions, interaction]
    }))

    setProgress(prev => ({
      ...prev,
      interactionCount: prev.interactionCount + 1
    }))
  }

  const handleContentChange = (contentType: string) => {
    trackInteraction('section_opened', { contentType })
    
    if (!progress.completedSections.includes(contentType)) {
      setProgress(prev => ({
        ...prev,
        completedSections: [...prev.completedSections, contentType]
      }))
    }
  }

  const dismissHint = (hint: string) => {
    setAdaptiveHints(prev => prev.filter(h => h !== hint))
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Learning Session Header */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="font-semibold text-blue-900">
                Learning: {concept.replace('-', ' ')}
              </h2>
              <div className="flex items-center gap-3 text-sm text-blue-700">
                <span>⏱️ {formatTime(progress.timeSpent)}</span>
                <span>🎯 {progress.completedSections.length} sections</span>
                <span>🔄 {progress.interactionCount} interactions</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <Badge 
              variant="outline" 
              className={`mb-2 ${
                progress.currentMastery === 'novice' ? 'border-gray-400 text-gray-700' :
                progress.currentMastery === 'learning' ? 'border-yellow-400 text-yellow-700' :
                progress.currentMastery === 'proficient' ? 'border-green-400 text-green-700' :
                'border-purple-400 text-purple-700'
              }`}
            >
              {progress.currentMastery === 'novice' ? '🌱 Novice' :
               progress.currentMastery === 'learning' ? '📚 Learning' :
               progress.currentMastery === 'proficient' ? '✅ Proficient' :
               '🏆 Expert'}
            </Badge>
            <div className="text-xs text-muted-foreground">
              Mastery Level
            </div>
          </div>
        </div>
      </Card>

      {/* Adaptive Hints */}
      <AnimatePresence>
        {adaptiveHints.map((hint, index) => (
          <motion.div
            key={hint}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className="text-lg">💡</span>
                  <div>
                    <h4 className="font-medium text-amber-800 mb-1">
                      Adaptive Learning Suggestion
                    </h4>
                    <p className="text-amber-700 text-sm">{hint}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissHint(hint)}
                  className="text-amber-600 hover:text-amber-800"
                >
                  ✕
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Struggling Areas Alert */}
      {strugglingAreas.length > 0 && (
        <Card className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
          <div className="flex items-start gap-3">
            <span className="text-lg">🤔</span>
            <div>
              <h4 className="font-medium text-red-800 mb-2">
                Areas that might need more attention:
              </h4>
              <div className="flex flex-wrap gap-2">
                {strugglingAreas.map((area, index) => (
                  <Badge key={index} variant="outline" className="text-xs border-red-300 text-red-700">
                    {area}
                  </Badge>
                ))}
              </div>
              <p className="text-red-700 text-sm mt-2">
                Don't worry! These concepts can be tricky. Take your time and use the help system.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Main Educational Content */}
      <EducationalContentDelivery
        concept={concept}
        currentStep={currentStep}
        algorithmState={algorithmState}
        onContentChange={handleContentChange}
      />

      {/* Learning Analytics (for advanced users) */}
      {config.showTechnicalDetails && progress.interactionCount > 10 && (
        <Card className="p-4 bg-muted/30">
          <details className="space-y-3">
            <summary className="cursor-pointer font-medium text-sm">
              📊 Learning Analytics
            </summary>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium">Session Time</div>
                <div className="text-muted-foreground">{formatTime(progress.timeSpent)}</div>
              </div>
              <div>
                <div className="font-medium">Interactions</div>
                <div className="text-muted-foreground">{progress.interactionCount}</div>
              </div>
              <div>
                <div className="font-medium">Help Items Used</div>
                <div className="text-muted-foreground">{progress.helpItemsUsed.length}</div>
              </div>
              <div>
                <div className="font-medium">Completion Rate</div>
                <div className="text-muted-foreground">
                  {Math.round((progress.completedSections.length / 3) * 100)}%
                </div>
              </div>
            </div>
          </details>
        </Card>
      )}
    </div>
  )
}

/**
 * Calculate mastery score based on learning progress and interactions
 */
function calculateMasteryScore(progress: LearningProgress, interactions: LearningInteraction[]): number {
  let score = 0
  
  // Base score from completed sections
  score += progress.completedSections.length * 20
  
  // Bonus for time spent (up to 10 minutes)
  score += Math.min(progress.timeSpent / 60, 10) * 2
  
  // Penalty for excessive help requests (indicates struggling)
  const helpRequests = interactions.filter(i => i.type === 'help_requested').length
  score -= Math.max(0, helpRequests - 5) * 5
  
  // Bonus for completing interactive elements
  const completedInteractions = interactions.filter(i => 
    i.type === 'analogy_completed' || i.type === 'code_step_completed'
  ).length
  score += completedInteractions * 10
  
  return Math.max(0, Math.min(100, score))
}

/**
 * Determine mastery level from score
 */
function getMasteryLevel(score: number): LearningProgress['currentMastery'] {
  if (score < 25) return 'novice'
  if (score < 50) return 'learning'
  if (score < 75) return 'proficient'
  return 'expert'
}