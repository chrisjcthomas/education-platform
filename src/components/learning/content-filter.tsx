'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '@/lib/stores/ui-store'
import { LearningMode } from '@/lib/types'

interface ContentFilterProps {
  children: React.ReactNode
  modes: LearningMode[]
  fallback?: React.ReactNode
  className?: string
}

interface ConditionalContentProps {
  mode: LearningMode
  children: React.ReactNode
  fallback?: React.ReactNode
  className?: string
}

/**
 * Renders content only for specific learning modes
 */
export function ContentFilter({ 
  children, 
  modes, 
  fallback = null, 
  className = '' 
}: ContentFilterProps) {
  const { learningMode } = useUIStore()
  const shouldShow = modes.includes(learningMode)

  return (
    <AnimatePresence mode="wait">
      {shouldShow ? (
        <motion.div
          key={`content-${learningMode}`}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={className}
        >
          {children}
        </motion.div>
      ) : fallback ? (
        <motion.div
          key={`fallback-${learningMode}`}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={className}
        >
          {fallback}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

/**
 * Renders content conditionally based on a single learning mode
 */
export function ConditionalContent({ 
  mode, 
  children, 
  fallback = null, 
  className = '' 
}: ConditionalContentProps) {
  return (
    <ContentFilter 
      modes={[mode]} 
      fallback={fallback} 
      className={className}
    >
      {children}
    </ContentFilter>
  )
}

/**
 * Pre-configured content filters for common use cases
 */
export const BeginnerOnly = ({ children, fallback, className }: Omit<ConditionalContentProps, 'mode'>) => (
  <ConditionalContent mode="beginner" fallback={fallback} className={className}>
    {children}
  </ConditionalContent>
)

export const CuriousOnly = ({ children, fallback, className }: Omit<ConditionalContentProps, 'mode'>) => (
  <ConditionalContent mode="curious" fallback={fallback} className={className}>
    {children}
  </ConditionalContent>
)

export const DetailsOnly = ({ children, fallback, className }: Omit<ConditionalContentProps, 'mode'>) => (
  <ConditionalContent mode="details" fallback={fallback} className={className}>
    {children}
  </ConditionalContent>
)

export const CodeModes = ({ children, fallback, className }: Omit<ContentFilterProps, 'modes'>) => (
  <ContentFilter modes={['curious', 'details']} fallback={fallback} className={className}>
    {children}
  </ContentFilter>
)

export const AdvancedModes = ({ children, fallback, className }: Omit<ContentFilterProps, 'modes'>) => (
  <ContentFilter modes={['details']} fallback={fallback} className={className}>
    {children}
  </ContentFilter>
)

/**
 * Hook for getting mode-specific configurations
 */
export function useModeConfig() {
  const { learningMode } = useUIStore()

  const config = React.useMemo(() => {
    switch (learningMode) {
      case 'beginner':
        return {
          showCode: false,
          showTechnicalDetails: false,
          showAnalogies: true,
          showStepByStep: true,
          animationSpeed: 0.7, // Slower for beginners
          showComplexity: false,
          showHints: true,
          simplifiedUI: true
        }
      case 'curious':
        return {
          showCode: true,
          showTechnicalDetails: false,
          showAnalogies: true,
          showStepByStep: true,
          animationSpeed: 1.0, // Normal speed
          showComplexity: true,
          showHints: true,
          simplifiedUI: false
        }
      case 'details':
        return {
          showCode: true,
          showTechnicalDetails: true,
          showAnalogies: false,
          showStepByStep: true,
          animationSpeed: 1.2, // Faster for advanced users
          showComplexity: true,
          showHints: false,
          simplifiedUI: false
        }
      default:
        return {
          showCode: false,
          showTechnicalDetails: false,
          showAnalogies: true,
          showStepByStep: true,
          animationSpeed: 1.0,
          showComplexity: false,
          showHints: true,
          simplifiedUI: true
        }
    }
  }, [learningMode])

  return config
}