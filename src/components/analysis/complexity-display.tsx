'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBigOStore } from '../../lib/stores/big-o-store'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Info } from 'lucide-react'

interface ComplexityDisplayProps {
  className?: string
  showDescription?: boolean
  showPlainLanguage?: boolean
  compact?: boolean
}

export const ComplexityDisplay: React.FC<ComplexityDisplayProps> = ({
  className = '',
  showDescription = true,
  showPlainLanguage = false,
  compact = false
}) => {
  const {
    currentAnalysis,
    showComplexityBadge,
    isTracking
  } = useBigOStore()

  if (!showComplexityBadge || !isTracking || !currentAnalysis) {
    return null
  }

  const { complexity, description, plainLanguageExplanation, efficiency } = currentAnalysis

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`inline-flex items-center gap-2 ${className}`}
      >
        <Badge
          variant="outline"
          className="px-3 py-1 font-mono text-sm"
          style={{
            borderColor: complexity.color,
            color: complexity.color,
            backgroundColor: `${complexity.color}15`
          }}
        >
          {complexity.notation}
        </Badge>
        <span className="text-sm text-gray-600">{complexity.name}</span>
      </motion.div>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={className}
      >
        <Card className="p-4 bg-white/95 backdrop-blur-sm border shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="px-3 py-1 font-mono text-base"
                style={{
                  borderColor: complexity.color,
                  color: complexity.color,
                  backgroundColor: `${complexity.color}15`
                }}
              >
                {complexity.notation}
              </Badge>
              <div>
                <h3 className="font-semibold text-gray-900">{complexity.name} Time</h3>
                <p className="text-sm text-gray-600 capitalize">
                  {complexity.category} efficiency
                </p>
              </div>
            </div>
            
            {/* Efficiency Indicator */}
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-sm text-gray-600">Efficiency</div>
                <div className="text-lg font-bold" style={{ color: complexity.color }}>
                  {efficiency}%
                </div>
              </div>
              <div className="w-2 h-12 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${efficiency}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="w-full rounded-full"
                  style={{ backgroundColor: complexity.color }}
                />
              </div>
            </div>
          </div>

          {/* Technical Description */}
          {showDescription && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-3"
            >
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">{description}</p>
              </div>
            </motion.div>
          )}

          {/* Plain Language Explanation */}
          {showPlainLanguage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400"
            >
              <p className="text-sm text-blue-800 leading-relaxed">
                <span className="font-medium">In simple terms:</span> {plainLanguageExplanation}
              </p>
            </motion.div>
          )}

          {/* Performance Category Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-3 flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: complexity.color }}
              />
              <span className="text-gray-600 capitalize">
                {complexity.category} performance
              </span>
            </div>
            <span className="text-gray-500">
              {currentAnalysis.inputSize} elements
            </span>
          </motion.div>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}

export default ComplexityDisplay