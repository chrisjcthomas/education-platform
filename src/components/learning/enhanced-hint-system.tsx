'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useModeConfig } from './content-filter'
import { educationalContentService } from '@/lib/services/educational-content-service'

interface EnhancedHintSystemProps {
  concept: string
  currentContext: string[]
  userBehavior: {
    timeSpent: number
    interactionCount: number
    helpRequests: number
    completedSections: string[]
    strugglingAreas: string[]
  }
  onHintAction?: (action: string, hintId: string) => void
  className?: string
}

interface SmartHint {
  id: string
  type: 'guidance' | 'encouragement' | 'warning' | 'suggestion' | 'tip'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  actionable: boolean
  actions?: HintAction[]
  dismissible: boolean
  autoShow: boolean
  conditions: HintCondition[]
}

interface HintAction {
  id: string
  label: string
  type: 'navigate' | 'toggle' | 'external' | 'internal'
  data: any
}

interface HintCondition {
  type: 'time' | 'interaction' | 'help_requests' | 'completion' | 'context'
  operator: 'gt' | 'lt' | 'eq' | 'includes' | 'not_includes'
  value: any
}

const SMART_HINTS: SmartHint[] = [
  {
    id: 'welcome-beginner',
    type: 'guidance',
    priority: 'medium',
    title: 'Welcome to Binary Search!',
    message: 'Start with the real-world examples to understand the concept before diving into code.',
    actionable: true,
    actions: [{
      id: 'open-analogies',
      label: 'Show Examples',
      type: 'navigate',
      data: { section: 'analogies' }
    }],
    dismissible: true,
    autoShow: true,
    conditions: [
      { type: 'time', operator: 'lt', value: 30 },
      { type: 'interaction', operator: 'eq', value: 0 }
    ]
  },
  {
    id: 'struggling-help',
    type: 'suggestion',
    priority: 'high',
    title: 'Need Some Help?',
    message: 'You\'ve requested help several times. Consider switching to an easier learning mode or taking a break.',
    actionable: true,
    actions: [
      {
        id: 'switch-mode',
        label: 'Switch to Beginner Mode',
        type: 'toggle',
        data: { mode: 'beginner' }
      },
      {
        id: 'show-basics',
        label: 'Review Basics',
        type: 'navigate',
        data: { section: 'fundamentals' }
      }
    ],
    dismissible: true,
    autoShow: true,
    conditions: [
      { type: 'help_requests', operator: 'gt', value: 4 }
    ]
  },
  {
    id: 'time-management',
    type: 'tip',
    priority: 'low',
    title: 'Take Your Time',
    message: 'You\'ve been learning for a while! Consider taking a short break to help with retention.',
    actionable: false,
    dismissible: true,
    autoShow: true,
    conditions: [
      { type: 'time', operator: 'gt', value: 600 } // 10 minutes
    ]
  },
  {
    id: 'interaction-encouragement',
    type: 'encouragement',
    priority: 'medium',
    title: 'Try the Interactive Elements!',
    message: 'Interactive demos and examples can really help solidify your understanding. Give them a try!',
    actionable: true,
    actions: [{
      id: 'highlight-interactive',
      label: 'Show Interactive Elements',
      type: 'internal',
      data: { highlight: 'interactive' }
    }],
    dismissible: true,
    autoShow: true,
    conditions: [
      { type: 'time', operator: 'gt', value: 120 },
      { type: 'interaction', operator: 'lt', value: 2 }
    ]
  },
  {
    id: 'progress-celebration',
    type: 'encouragement',
    priority: 'medium',
    title: 'Great Progress!',
    message: 'You\'ve completed multiple sections. You\'re doing excellent work!',
    actionable: true,
    actions: [{
      id: 'next-challenge',
      label: 'Ready for Next Challenge?',
      type: 'navigate',
      data: { section: 'advanced' }
    }],
    dismissible: true,
    autoShow: true,
    conditions: [
      { type: 'completion', operator: 'gt', value: 2 }
    ]
  },
  {
    id: 'concept-mastery',
    type: 'suggestion',
    priority: 'medium',
    title: 'Ready to Level Up?',
    message: 'You seem to have a good grasp of the basics. Consider trying a more advanced learning mode!',
    actionable: true,
    actions: [
      {
        id: 'upgrade-mode',
        label: 'Try Curious Mode',
        type: 'toggle',
        data: { mode: 'curious' }
      },
      {
        id: 'advanced-topics',
        label: 'Explore Advanced Topics',
        type: 'navigate',
        data: { section: 'technical-details' }
      }
    ],
    dismissible: true,
    autoShow: true,
    conditions: [
      { type: 'completion', operator: 'gt', value: 1 },
      { type: 'time', operator: 'gt', value: 300 },
      { type: 'help_requests', operator: 'lt', value: 2 }
    ]
  }
]

export function EnhancedHintSystem({
  concept,
  currentContext,
  userBehavior,
  onHintAction,
  className = ''
}: EnhancedHintSystemProps) {
  const config = useModeConfig()
  const [activeHints, setActiveHints] = React.useState<SmartHint[]>([])
  const [dismissedHints, setDismissedHints] = React.useState<Set<string>>(new Set())
  const [personalizedHints, setPersonalizedHints] = React.useState<string[]>([])

  // Evaluate hint conditions
  const evaluateCondition = (condition: HintCondition): boolean => {
    switch (condition.type) {
      case 'time':
        return condition.operator === 'gt' 
          ? userBehavior.timeSpent > condition.value
          : userBehavior.timeSpent < condition.value
      
      case 'interaction':
        return condition.operator === 'gt'
          ? userBehavior.interactionCount > condition.value
          : condition.operator === 'lt'
          ? userBehavior.interactionCount < condition.value
          : userBehavior.interactionCount === condition.value
      
      case 'help_requests':
        return condition.operator === 'gt'
          ? userBehavior.helpRequests > condition.value
          : userBehavior.helpRequests < condition.value
      
      case 'completion':
        return condition.operator === 'gt'
          ? userBehavior.completedSections.length > condition.value
          : userBehavior.completedSections.length < condition.value
      
      case 'context':
        return condition.operator === 'includes'
          ? currentContext.includes(condition.value)
          : !currentContext.includes(condition.value)
      
      default:
        return false
    }
  }

  // Update active hints based on conditions
  React.useEffect(() => {
    if (!config.showHints) return

    const eligibleHints = SMART_HINTS.filter(hint => {
      // Skip dismissed hints
      if (dismissedHints.has(hint.id)) return false
      
      // Check all conditions
      return hint.conditions.every(evaluateCondition)
    })

    // Sort by priority
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
    eligibleHints.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])

    // Limit to 3 active hints to avoid overwhelming
    setActiveHints(eligibleHints.slice(0, 3))

    // Get personalized hints from service
    const personalHints = educationalContentService.generatePersonalizedHints(concept, userBehavior)
    setPersonalizedHints(personalHints)
  }, [userBehavior, currentContext, config.showHints, dismissedHints, concept])

  const dismissHint = (hintId: string) => {
    setDismissedHints(prev => new Set([...prev, hintId]))
    setActiveHints(prev => prev.filter(hint => hint.id !== hintId))
  }

  const executeHintAction = (action: HintAction, hintId: string) => {
    onHintAction?.(action.type, hintId)
    
    // Handle internal actions
    switch (action.type) {
      case 'navigate':
        // This would typically trigger navigation
        console.log('Navigate to:', action.data)
        break
      case 'toggle':
        // This would typically toggle a setting
        console.log('Toggle:', action.data)
        break
      case 'internal':
        // Handle internal UI changes
        console.log('Internal action:', action.data)
        break
    }
    
    // Dismiss hint after action (optional)
    if (action.type !== 'internal') {
      dismissHint(hintId)
    }
  }

  const getHintIcon = (type: SmartHint['type']) => {
    switch (type) {
      case 'guidance': return '🧭'
      case 'encouragement': return '🌟'
      case 'warning': return '⚠️'
      case 'suggestion': return '💡'
      case 'tip': return '✨'
      default: return '💬'
    }
  }

  const getHintColor = (type: SmartHint['type'], priority: SmartHint['priority']) => {
    if (priority === 'critical') return 'bg-red-50 border-red-200 text-red-800'
    
    switch (type) {
      case 'guidance': return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'encouragement': return 'bg-green-50 border-green-200 text-green-800'
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'suggestion': return 'bg-purple-50 border-purple-200 text-purple-800'
      case 'tip': return 'bg-indigo-50 border-indigo-200 text-indigo-800'
      default: return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  if (!config.showHints || (activeHints.length === 0 && personalizedHints.length === 0)) {
    return null
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Smart Hints */}
      <AnimatePresence>
        {activeHints.map((hint) => (
          <motion.div
            key={hint.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={`p-4 border-l-4 ${getHintColor(hint.type, hint.priority)}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-lg flex-shrink-0 mt-0.5">
                    {getHintIcon(hint.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-sm">
                        {hint.title}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {hint.type}
                      </Badge>
                      {hint.priority === 'high' || hint.priority === 'critical' ? (
                        <Badge variant="destructive" className="text-xs">
                          {hint.priority}
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-sm leading-relaxed mb-3">
                      {hint.message}
                    </p>
                    
                    {/* Hint Actions */}
                    {hint.actionable && hint.actions && (
                      <div className="flex flex-wrap gap-2">
                        {hint.actions.map((action) => (
                          <Button
                            key={action.id}
                            variant="outline"
                            size="sm"
                            onClick={() => executeHintAction(action, hint.id)}
                            className="text-xs"
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Dismiss Button */}
                {hint.dismissible && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissHint(hint.id)}
                    className="text-xs px-2 py-1 h-auto"
                  >
                    ✕
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Personalized Hints */}
      <AnimatePresence>
        {personalizedHints.map((hint, index) => (
          <motion.div
            key={`personal-${index}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
              <div className="flex items-start gap-3">
                <span className="text-lg">🤖</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-amber-800 text-sm">
                      Personalized Suggestion
                    </h4>
                    <Badge variant="outline" className="text-xs border-amber-300 text-amber-700">
                      AI Generated
                    </Badge>
                  </div>
                  <p className="text-amber-700 text-sm">
                    {hint}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPersonalizedHints(prev => prev.filter((_, i) => i !== index))}
                  className="text-amber-600 hover:text-amber-800 text-xs px-2 py-1 h-auto"
                >
                  ✕
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Hint Summary */}
      {(activeHints.length > 0 || personalizedHints.length > 0) && (
        <div className="text-center text-xs text-muted-foreground">
          {activeHints.length + personalizedHints.length} active hints • 
          {dismissedHints.size} dismissed
        </div>
      )}
    </div>
  )
}