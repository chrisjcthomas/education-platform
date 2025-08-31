'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useModeConfig } from './content-filter'

interface HelpItem {
  id: string
  title: string
  content: string
  type: 'hint' | 'tip' | 'warning' | 'explanation' | 'example'
  context: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  trigger: 'manual' | 'automatic' | 'error' | 'confusion'
  priority: 'low' | 'medium' | 'high'
}

interface ContextualHelpSystemProps {
  helpItems: HelpItem[]
  currentContext: string[]
  className?: string
  autoShow?: boolean
  maxItems?: number
}

const BINARY_SEARCH_HELP_ITEMS: HelpItem[] = [
  {
    id: 'array-must-be-sorted',
    title: 'Array Must Be Sorted',
    content: 'Binary search only works on sorted arrays! If your array isn\'t sorted, the algorithm will give wrong results. Always sort your array first, or use linear search instead.',
    type: 'warning',
    context: ['binary-search', 'array-setup'],
    difficulty: 'beginner',
    trigger: 'automatic',
    priority: 'high'
  },
  {
    id: 'middle-calculation-tip',
    title: 'Calculating the Middle Index',
    content: 'Use Math.floor((left + right) / 2) to find the middle. This ensures you get a whole number even when left + right is odd.',
    type: 'tip',
    context: ['binary-search', 'implementation'],
    difficulty: 'beginner',
    trigger: 'manual',
    priority: 'medium'
  },
  {
    id: 'infinite-loop-warning',
    title: 'Avoiding Infinite Loops',
    content: 'Make sure to update left = mid + 1 or right = mid - 1, not just left = mid or right = mid. Otherwise, you might get stuck in an infinite loop!',
    type: 'warning',
    context: ['binary-search', 'implementation', 'debugging'],
    difficulty: 'beginner',
    trigger: 'error',
    priority: 'high'
  },
  {
    id: 'return-value-explanation',
    title: 'Understanding Return Values',
    content: 'Binary search typically returns the index where the item was found, or -1 if not found. Some variations return the insertion point or boolean values.',
    type: 'explanation',
    context: ['binary-search', 'return-values'],
    difficulty: 'beginner',
    trigger: 'manual',
    priority: 'medium'
  },
  {
    id: 'efficiency-explanation',
    title: 'Why Binary Search is Efficient',
    content: 'Each comparison eliminates half the remaining possibilities. For 1000 items, you need at most 10 comparisons (2^10 = 1024). That\'s much better than checking all 1000!',
    type: 'explanation',
    context: ['binary-search', 'efficiency', 'big-o'],
    difficulty: 'intermediate',
    trigger: 'manual',
    priority: 'medium'
  },
  {
    id: 'overflow-prevention-hint',
    title: 'Preventing Integer Overflow',
    content: 'For very large arrays, use mid = left + Math.floor((right - left) / 2) instead of Math.floor((left + right) / 2) to prevent overflow.',
    type: 'hint',
    context: ['binary-search', 'implementation', 'edge-cases'],
    difficulty: 'advanced',
    trigger: 'manual',
    priority: 'low'
  },
  {
    id: 'debugging-steps',
    title: 'Debugging Binary Search',
    content: 'If your binary search isn\'t working: 1) Check if array is sorted, 2) Verify boundary updates (mid ± 1), 3) Test with small arrays, 4) Print left, mid, right values.',
    type: 'tip',
    context: ['binary-search', 'debugging', 'troubleshooting'],
    difficulty: 'intermediate',
    trigger: 'error',
    priority: 'high'
  },
  {
    id: 'common-mistakes',
    title: 'Common Mistakes to Avoid',
    content: 'Watch out for: using unsorted arrays, forgetting to update boundaries correctly, off-by-one errors in loop conditions, and not handling empty arrays.',
    type: 'warning',
    context: ['binary-search', 'common-errors'],
    difficulty: 'beginner',
    trigger: 'confusion',
    priority: 'high'
  }
]

const TYPE_CONFIG = {
  hint: { icon: '💡', color: 'bg-blue-50 border-blue-200 text-blue-800', bgColor: 'bg-blue-100' },
  tip: { icon: '✨', color: 'bg-green-50 border-green-200 text-green-800', bgColor: 'bg-green-100' },
  warning: { icon: '⚠️', color: 'bg-yellow-50 border-yellow-200 text-yellow-800', bgColor: 'bg-yellow-100' },
  explanation: { icon: '📚', color: 'bg-purple-50 border-purple-200 text-purple-800', bgColor: 'bg-purple-100' },
  example: { icon: '🔍', color: 'bg-indigo-50 border-indigo-200 text-indigo-800', bgColor: 'bg-indigo-100' }
}

export function ContextualHelpSystem({
  helpItems = BINARY_SEARCH_HELP_ITEMS,
  currentContext = ['binary-search'],
  className = '',
  autoShow = true,
  maxItems = 3
}: ContextualHelpSystemProps) {
  const [visibleItems, setVisibleItems] = React.useState<Set<string>>(new Set())
  const [dismissedItems, setDismissedItems] = React.useState<Set<string>>(new Set())
  const [showAll, setShowAll] = React.useState(false)
  const [helpHistory, setHelpHistory] = React.useState<string[]>([])
  const config = useModeConfig()

  // Filter relevant help items based on current context and user level
  const relevantItems = React.useMemo(() => {
    return helpItems
      .filter(item => {
        // Check if item is relevant to current context
        const isRelevant = item.context.some(ctx => currentContext.includes(ctx))
        
        // Check if item matches user's learning level
        const isAppropriateLevel = 
          (config.showHints && (item.difficulty === 'beginner' || item.difficulty === 'intermediate')) ||
          (config.showTechnicalDetails && item.difficulty === 'advanced')
        
        // Don't show dismissed items
        const notDismissed = !dismissedItems.has(item.id)
        
        return isRelevant && isAppropriateLevel && notDismissed
      })
      .sort((a, b) => {
        // Sort by priority, then by difficulty
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 }
        
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        }
        
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
      })
  }, [helpItems, currentContext, config, dismissedItems])

  // Auto-show high priority items
  React.useEffect(() => {
    if (autoShow && config.showHints) {
      const autoShowItems = relevantItems
        .filter(item => item.trigger === 'automatic' && item.priority === 'high')
        .slice(0, 2) // Limit auto-show items

      // Only update if there are new items to show
      const newItemsToShow = autoShowItems.filter(item => !visibleItems.has(item.id))
      if (newItemsToShow.length > 0) {
        setVisibleItems(prev => {
          const newVisible = new Set(prev)
          newItemsToShow.forEach(item => newVisible.add(item.id))
          return newVisible
        })
      }
    }
  }, [relevantItems, autoShow, config.showHints]) // Removed visibleItems from dependencies

  const displayItems = showAll ? relevantItems : relevantItems.slice(0, maxItems)
  const visibleDisplayItems = displayItems.filter(item => visibleItems.has(item.id))

  const showItem = (itemId: string) => {
    setVisibleItems(prev => new Set([...prev, itemId]))
    setHelpHistory(prev => [...prev, itemId])
  }

  const hideItem = (itemId: string) => {
    setVisibleItems(prev => {
      const newSet = new Set(prev)
      newSet.delete(itemId)
      return newSet
    })
  }

  const dismissItem = (itemId: string) => {
    setDismissedItems(prev => new Set([...prev, itemId]))
    hideItem(itemId)
  }

  const showRecentlyUsed = () => {
    const recentItems = helpHistory.slice(-3).filter(id => 
      !dismissedItems.has(id) && relevantItems.some(item => item.id === id)
    )
    const newVisible = new Set([...visibleItems, ...recentItems])
    setVisibleItems(newVisible)
  }

  const showAllItems = () => {
    const newVisible = new Set(visibleItems)
    displayItems.forEach(item => newVisible.add(item.id))
    setVisibleItems(newVisible)
    setShowAll(true)
  }

  if (!config.showHints || relevantItems.length === 0) {
    return null
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Help Items */}
      <AnimatePresence>
        {visibleDisplayItems.map((item) => {
          const typeConfig = TYPE_CONFIG[item.type]
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Card className={`p-4 ${typeConfig.color} border-l-4`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-lg flex-shrink-0 mt-0.5">
                      {typeConfig.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-sm">
                          {item.title}
                        </h4>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${typeConfig.bgColor}`}
                        >
                          {item.type}
                        </Badge>
                        {item.priority === 'high' && (
                          <Badge variant="destructive" className="text-xs">
                            Important
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm leading-relaxed">
                        {item.content}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => hideItem(item.id)}
                      className="text-xs px-2 py-1 rounded hover:bg-black/10 transition-colors"
                      title="Hide"
                    >
                      ✕
                    </button>
                    <button
                      onClick={() => dismissItem(item.id)}
                      className="text-xs px-2 py-1 rounded hover:bg-black/10 transition-colors"
                      title="Don't show again"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* Available Help Items */}
      {relevantItems.length > visibleDisplayItems.length && (
        <div className="flex flex-wrap gap-2">
          {displayItems
            .filter(item => !visibleItems.has(item.id))
            .map((item) => {
              const typeConfig = TYPE_CONFIG[item.type]
              
              return (
                <button
                  key={item.id}
                  onClick={() => showItem(item.id)}
                  className={`px-3 py-1.5 text-xs rounded-full transition-all duration-200 ${typeConfig.bgColor} hover:scale-105 flex items-center gap-1`}
                  title={item.content}
                >
                  <span>{typeConfig.icon}</span>
                  {item.title}
                </button>
              )
            })}
        </div>
      )}

      {/* Show More Button */}
      {!showAll && relevantItems.length > maxItems && (
        <div className="text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={showAllItems}
            className="text-xs"
          >
            Show {relevantItems.length - maxItems} more help items
          </Button>
        </div>
      )}

      {/* Help Summary */}
      {relevantItems.length > 0 && (
        <div className="text-center text-xs text-muted-foreground">
          {visibleDisplayItems.length} of {relevantItems.length} help items shown
          {dismissedItems.size > 0 && ` • ${dismissedItems.size} dismissed`}
        </div>
      )}
    </div>
  )
}

/**
 * Hook for triggering contextual help based on user actions
 */
export function useContextualHelp(helpItems: HelpItem[] = BINARY_SEARCH_HELP_ITEMS) {
  const [currentContext, setCurrentContext] = React.useState<string[]>(['binary-search'])
  const [triggeredItems, setTriggeredItems] = React.useState<Set<string>>(new Set())

  const addContext = (context: string) => {
    setCurrentContext(prev => [...new Set([...prev, context])])
  }

  const removeContext = (context: string) => {
    setCurrentContext(prev => prev.filter(ctx => ctx !== context))
  }

  const triggerHelp = (trigger: HelpItem['trigger'], context?: string[]) => {
    const relevantItems = helpItems.filter(item => 
      item.trigger === trigger && 
      (!context || item.context.some(ctx => context.includes(ctx)))
    )

    const newTriggered = new Set(triggeredItems)
    relevantItems.forEach(item => newTriggered.add(item.id))
    setTriggeredItems(newTriggered)
  }

  const clearTriggered = () => {
    setTriggeredItems(new Set())
  }

  return {
    currentContext,
    addContext,
    removeContext,
    triggerHelp,
    triggeredItems,
    clearTriggered
  }
}