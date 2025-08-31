'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '@/lib/stores/ui-store'
import { LearningMode } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ModeSelectorProps {
  className?: string
  showDescriptions?: boolean
}

interface ModeConfig {
  id: LearningMode
  title: string
  description: string
  icon: string
  color: string
  features: string[]
}

const LEARNING_MODES: ModeConfig[] = [
  {
    id: 'beginner',
    title: 'Complete Beginner',
    description: 'Visual analogies and simple explanations',
    icon: '🌱',
    color: 'bg-green-100 text-green-800 border-green-200',
    features: ['Visual analogies', 'No code required', 'Step-by-step guidance']
  },
  {
    id: 'curious',
    title: 'Curious About Code',
    description: 'Pre-written code with guided explanations',
    icon: '🔍',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    features: ['Code examples', 'Guided explanations', 'Interactive demos']
  },
  {
    id: 'details',
    title: 'Show Me Details',
    description: 'Full code editor with technical implementation',
    icon: '⚡',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    features: ['Full code editor', 'Technical details', 'Advanced concepts']
  }
]

export function ModeSelector({ className = '', showDescriptions = true }: ModeSelectorProps) {
  const { learningMode, setLearningMode } = useUIStore()

  const handleModeChange = (mode: LearningMode) => {
    setLearningMode(mode)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row gap-3">
        {LEARNING_MODES.map((mode) => (
          <motion.div
            key={mode.id}
            layout
            className="flex-1"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant={learningMode === mode.id ? 'default' : 'outline'}
              className={`w-full h-auto p-4 flex flex-col items-center gap-2 transition-all duration-200 ${
                learningMode === mode.id 
                  ? 'ring-2 ring-blue-500 ring-offset-2' 
                  : 'hover:border-blue-300'
              }`}
              onClick={() => handleModeChange(mode.id)}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{mode.icon}</span>
                <span className="font-medium">{mode.title}</span>
              </div>
              {showDescriptions && (
                <span className="text-xs text-muted-foreground text-center">
                  {mode.description}
                </span>
              )}
            </Button>
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={learningMode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="bg-muted/50 rounded-lg p-4"
        >
          {(() => {
            const currentMode = LEARNING_MODES.find(m => m.id === learningMode)
            if (!currentMode) return null

            return (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge className={currentMode.color}>
                    {currentMode.icon} {currentMode.title}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {currentMode.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentMode.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            )
          })()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}