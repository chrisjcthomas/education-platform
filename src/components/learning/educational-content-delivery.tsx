'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useUIStore } from '@/lib/stores/ui-store'
import { useModeConfig } from './content-filter'
import { AnalogyDisplay } from './analogy-display'
import { CodeExplanationPanel } from './code-explanation-panel'
import { TechnicalDetailOverlay } from './technical-detail-overlay'
import { ContextualHelpSystem, useContextualHelp } from './contextual-help-system'

interface EducationalContentDeliveryProps {
  concept: string
  currentStep?: number
  algorithmState?: any
  className?: string
  onContentChange?: (contentType: string) => void
}

interface ContentSection {
  id: string
  title: string
  component: React.ComponentType<any>
  props: any
  modes: ('beginner' | 'curious' | 'details')[]
  priority: number
}

export function EducationalContentDelivery({
  concept = 'binary-search',
  currentStep = 0,
  algorithmState,
  className = '',
  onContentChange
}: EducationalContentDeliveryProps) {
  const { learningMode } = useUIStore()
  const config = useModeConfig()
  const [activeSection, setActiveSection] = React.useState<string>('')
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(new Set())
  
  const {
    currentContext,
    addContext,
    removeContext,
    triggerHelp,
    triggeredItems
  } = useContextualHelp()

  // Update context based on algorithm state and current step
  React.useEffect(() => {
    const contexts = [concept]
    
    if (algorithmState?.isRunning) {
      contexts.push('execution')
    }
    
    if (currentStep > 0) {
      contexts.push('in-progress')
    }
    
    if (algorithmState?.error) {
      contexts.push('error')
      triggerHelp('error', contexts)
    }

    // Update context
    contexts.forEach(ctx => addContext(ctx))
    
    return () => {
      contexts.forEach(ctx => removeContext(ctx))
    }
  }, [concept, currentStep, algorithmState, addContext, removeContext, triggerHelp])

  // Define content sections based on learning mode
  const contentSections: ContentSection[] = React.useMemo(() => {
    const sections: ContentSection[] = []

    // Analogy section for beginners and curious learners
    if (config.showAnalogies) {
      sections.push({
        id: 'analogies',
        title: 'Real-World Examples',
        component: AnalogyDisplay,
        props: {
          currentConcept: concept,
          interactive: true
        },
        modes: ['beginner', 'curious'],
        priority: 1
      })
    }

    // Code explanation for curious and details modes
    if (config.showCode) {
      sections.push({
        id: 'code-explanation',
        title: 'Code Walkthrough',
        component: CodeExplanationPanel,
        props: {
          currentConcept: concept,
          language: 'javascript', // Could be dynamic
          interactive: true
        },
        modes: ['curious', 'details'],
        priority: 2
      })
    }

    // Technical details for advanced learners
    if (config.showTechnicalDetails) {
      sections.push({
        id: 'technical-details',
        title: 'Technical Deep Dive',
        component: TechnicalDetailOverlay,
        props: {
          currentConcept: concept,
          defaultCategory: 'complexity'
        },
        modes: ['details'],
        priority: 3
      })
    }

    return sections.filter(section => section.modes.includes(learningMode))
  }, [config, concept, learningMode])

  // Auto-select first section if none selected
  React.useEffect(() => {
    if (contentSections.length > 0 && !activeSection) {
      setActiveSection(contentSections[0].id)
      setExpandedSections(new Set([contentSections[0].id]))
    }
  }, [contentSections, activeSection])

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
    
    if (!expandedSections.has(sectionId)) {
      setActiveSection(sectionId)
      onContentChange?.(sectionId)
    }
  }

  const selectSection = (sectionId: string) => {
    setActiveSection(sectionId)
    setExpandedSections(new Set([sectionId]))
    onContentChange?.(sectionId)
  }

  if (contentSections.length === 0) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center text-muted-foreground">
          <p>No educational content available for the current learning mode.</p>
          <p className="text-sm mt-2">Try switching to a different learning mode.</p>
        </div>
      </Card>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Learning Mode Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {learningMode === 'beginner' ? '🌱 Beginner' : 
             learningMode === 'curious' ? '🔍 Curious' : 
             '⚡ Details'} Mode
          </Badge>
          <span className="text-sm text-muted-foreground">
            Learning: {concept.replace('-', ' ')}
          </span>
        </div>
        {contentSections.length > 1 && (
          <div className="text-xs text-muted-foreground">
            {expandedSections.size} of {contentSections.length} sections open
          </div>
        )}
      </div>

      {/* Contextual Help System */}
      {config.showHints && (
        <ContextualHelpSystem
          helpItems={[]}
          currentContext={currentContext}
          autoShow={true}
          maxItems={2}
        />
      )}

      {/* Content Sections */}
      <div className="space-y-3">
        {contentSections.map((section, index) => {
          const isExpanded = expandedSections.has(section.id)
          const isActive = activeSection === section.id
          const Component = section.component

          return (
            <motion.div
              key={section.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className={`overflow-hidden transition-all duration-200 ${
                isActive ? 'ring-2 ring-blue-500 ring-offset-1' : ''
              }`}>
                {/* Section Header */}
                <div 
                  className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">
                        {isExpanded ? '▼' : '▶'}
                      </span>
                      <h3 className="font-medium">{section.title}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {section.modes.join(', ')}
                      </Badge>
                    </div>
                    {contentSections.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          selectSection(section.id)
                        }}
                        className="text-xs"
                      >
                        Focus
                      </Button>
                    )}
                  </div>
                </div>

                {/* Section Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <Separator />
                      <div className="p-4">
                        <Component {...section.props} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Actions */}
      {contentSections.length > 1 && (
        <Card className="p-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Quick Actions:</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const allSections = new Set(contentSections.map(s => s.id))
                  setExpandedSections(allSections)
                }}
                className="text-xs"
              >
                Expand All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setExpandedSections(new Set())
                  setActiveSection('')
                }}
                className="text-xs"
              >
                Collapse All
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Progress Indicator */}
      {currentStep > 0 && (
        <div className="text-center">
          <div className="text-xs text-muted-foreground">
            Algorithm Step: {currentStep}
            {algorithmState?.totalSteps && ` of ${algorithmState.totalSteps}`}
          </div>
          {algorithmState?.totalSteps && (
            <div className="w-full bg-muted rounded-full h-1 mt-2">
              <div 
                className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(currentStep / algorithmState.totalSteps) * 100}%` 
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}