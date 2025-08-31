'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '@/lib/stores/ui-store'
import { LearningMode } from '@/lib/types'

interface ModeTransitionManagerProps {
  children: React.ReactNode
  className?: string
}

interface TransitionConfig {
  duration: number
  ease: string
  stagger: number
}

/**
 * Manages smooth transitions between learning modes
 */
export function ModeTransitionManager({ children, className = '' }: ModeTransitionManagerProps) {
  const { learningMode } = useUIStore()
  const [isTransitioning, setIsTransitioning] = React.useState(false)
  const [previousMode, setPreviousMode] = React.useState<LearningMode>(learningMode)

  // Track mode changes and manage transition state
  React.useEffect(() => {
    if (previousMode !== learningMode) {
      setIsTransitioning(true)
      setPreviousMode(learningMode)
      
      // Reset transition state after animation completes
      const timer = setTimeout(() => {
        setIsTransitioning(false)
      }, 600) // Slightly longer than animation duration
      
      return () => clearTimeout(timer)
    }
  }, [learningMode, previousMode])

  const getTransitionConfig = (mode: LearningMode): TransitionConfig => {
    switch (mode) {
      case 'beginner':
        return {
          duration: 0.5,
          ease: 'easeOut',
          stagger: 0.1
        }
      case 'curious':
        return {
          duration: 0.3,
          ease: 'easeInOut',
          stagger: 0.05
        }
      case 'details':
        return {
          duration: 0.2,
          ease: 'easeIn',
          stagger: 0.02
        }
      default:
        return {
          duration: 0.3,
          ease: 'easeInOut',
          stagger: 0.05
        }
    }
  }

  const config = getTransitionConfig(learningMode)

  const containerVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: config.duration * 0.5
      }
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: config.duration,
        staggerChildren: config.stagger,
        delayChildren: config.duration * 0.2
      }
    },
    exit: {
      opacity: 0,
      scale: 1.05,
      transition: {
        duration: config.duration * 0.3
      }
    }
  }

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: learningMode === 'beginner' ? 20 : learningMode === 'curious' ? 10 : 5,
      transition: {
        duration: config.duration * 0.5
      }
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: config.duration
      }
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Transition overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Main content with mode-specific transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`mode-${learningMode}`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="w-full"
        >
          <ModeTransitionProvider variants={itemVariants}>
            {children}
          </ModeTransitionProvider>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/**
 * Context provider for child components to access transition variants
 */
const ModeTransitionContext = React.createContext<{
  variants: any
  isTransitioning: boolean
}>({
  variants: {},
  isTransitioning: false
})

interface ModeTransitionProviderProps {
  children: React.ReactNode
  variants: any
}

function ModeTransitionProvider({ children, variants }: ModeTransitionProviderProps) {
  const { learningMode } = useUIStore()
  const [isTransitioning, setIsTransitioning] = React.useState(false)

  const value = React.useMemo(() => ({
    variants,
    isTransitioning
  }), [variants, isTransitioning])

  return (
    <ModeTransitionContext.Provider value={value}>
      {children}
    </ModeTransitionContext.Provider>
  )
}

/**
 * Hook for child components to access transition configuration
 */
export function useModeTransition() {
  const context = React.useContext(ModeTransitionContext)
  if (!context) {
    throw new Error('useModeTransition must be used within a ModeTransitionManager')
  }
  return context
}

/**
 * Component wrapper that applies transition animations to child elements
 */
export function TransitionItem({ 
  children, 
  className = '',
  delay = 0 
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const { variants } = useModeTransition()

  return (
    <motion.div
      variants={variants}
      className={className}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Specialized transition for mode-specific content sections
 */
export function ModeContentSection({ 
  children, 
  className = '',
  priority = 'normal' 
}: {
  children: React.ReactNode
  className?: string
  priority?: 'high' | 'normal' | 'low'
}) {
  const { learningMode } = useUIStore()
  
  const getPriorityDelay = () => {
    const baseDelay = learningMode === 'beginner' ? 0.1 : learningMode === 'curious' ? 0.05 : 0.02
    
    switch (priority) {
      case 'high':
        return 0
      case 'normal':
        return baseDelay
      case 'low':
        return baseDelay * 2
      default:
        return baseDelay
    }
  }

  return (
    <TransitionItem delay={getPriorityDelay()} className={className}>
      {children}
    </TransitionItem>
  )
}