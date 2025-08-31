'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useUIStore } from '@/lib/stores/ui-store'
import { useModeConfig } from './content-filter'
import { LearningMode } from '@/lib/types'

interface ModeAdaptiveUIProps {
  children: React.ReactNode
  className?: string
}

interface ModeSpecificLayoutProps {
  children: React.ReactNode
  className?: string
}

/**
 * Wrapper that adapts UI styling based on learning mode
 */
export function ModeAdaptiveUI({ children, className = '' }: ModeAdaptiveUIProps) {
  const { learningMode } = useUIStore()
  const config = useModeConfig()

  const modeStyles = React.useMemo(() => {
    const baseStyles = 'transition-all duration-500 ease-in-out'
    
    switch (learningMode) {
      case 'beginner':
        return `${baseStyles} ${config.simplifiedUI ? 'space-y-6' : 'space-y-4'} text-base`
      case 'curious':
        return `${baseStyles} space-y-4 text-sm`
      case 'details':
        return `${baseStyles} space-y-3 text-sm`
      default:
        return baseStyles
    }
  }, [learningMode, config.simplifiedUI])

  return (
    <motion.div
      key={learningMode}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`${modeStyles} ${className}`}
      data-learning-mode={learningMode}
    >
      {children}
    </motion.div>
  )
}

/**
 * Layout component that changes structure based on learning mode
 */
export function ModeSpecificLayout({ children, className = '' }: ModeSpecificLayoutProps) {
  const { learningMode } = useUIStore()
  const config = useModeConfig()

  const layoutVariants = {
    beginner: {
      initial: { scale: 0.95, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      transition: { duration: 0.4 }
    },
    curious: {
      initial: { x: -20, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      transition: { duration: 0.3 }
    },
    details: {
      initial: { y: -10, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      transition: { duration: 0.2 }
    }
  }

  const currentVariant = layoutVariants[learningMode] || layoutVariants.beginner

  return (
    <motion.div
      key={`layout-${learningMode}`}
      {...currentVariant}
      className={`${className} ${config.simplifiedUI ? 'max-w-4xl mx-auto' : ''}`}
    >
      {children}
    </motion.div>
  )
}

/**
 * Component that provides mode-specific spacing and typography
 */
export function ModeTypography({ 
  children, 
  className = '',
  variant = 'body' 
}: {
  children: React.ReactNode
  className?: string
  variant?: 'heading' | 'body' | 'caption'
}) {
  const { learningMode } = useUIStore()

  const getTypographyClasses = () => {
    const base = 'transition-all duration-300'
    
    switch (variant) {
      case 'heading':
        switch (learningMode) {
          case 'beginner':
            return `${base} text-2xl font-bold leading-relaxed`
          case 'curious':
            return `${base} text-xl font-semibold leading-normal`
          case 'details':
            return `${base} text-lg font-medium leading-tight`
          default:
            return `${base} text-xl font-semibold`
        }
      case 'body':
        switch (learningMode) {
          case 'beginner':
            return `${base} text-base leading-relaxed`
          case 'curious':
            return `${base} text-sm leading-normal`
          case 'details':
            return `${base} text-sm leading-tight`
          default:
            return `${base} text-sm`
        }
      case 'caption':
        switch (learningMode) {
          case 'beginner':
            return `${base} text-sm text-muted-foreground leading-relaxed`
          case 'curious':
            return `${base} text-xs text-muted-foreground leading-normal`
          case 'details':
            return `${base} text-xs text-muted-foreground leading-tight`
          default:
            return `${base} text-xs text-muted-foreground`
        }
      default:
        return base
    }
  }

  return (
    <div className={`${getTypographyClasses()} ${className}`}>
      {children}
    </div>
  )
}

/**
 * Hook for getting mode-specific animation configurations
 */
export function useModeAnimations() {
  const { learningMode } = useUIStore()
  const config = useModeConfig()

  return React.useMemo(() => ({
    duration: config.animationSpeed,
    stagger: learningMode === 'beginner' ? 0.2 : learningMode === 'curious' ? 0.1 : 0.05,
    ease: learningMode === 'beginner' ? 'easeOut' : 'easeInOut',
    scale: learningMode === 'beginner' ? 1.05 : 1.02,
    reducedMotion: config.simplifiedUI
  }), [learningMode, config.animationSpeed, config.simplifiedUI])
}

/**
 * Component that provides mode-specific button styling
 */
export function ModeButton({ 
  children, 
  className = '',
  variant = 'default',
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'secondary' | 'outline'
}) {
  const { learningMode } = useUIStore()

  const getModeButtonClasses = () => {
    const base = 'transition-all duration-200'
    
    switch (learningMode) {
      case 'beginner':
        return `${base} px-6 py-3 text-base font-medium rounded-lg shadow-sm hover:shadow-md`
      case 'curious':
        return `${base} px-4 py-2 text-sm font-medium rounded-md`
      case 'details':
        return `${base} px-3 py-1.5 text-xs font-medium rounded`
      default:
        return base
    }
  }

  return (
    <button
      className={`${getModeButtonClasses()} ${className} transition-transform hover:scale-105 active:scale-98`}
      {...props}
    >
      {children}
    </button>
  )
}