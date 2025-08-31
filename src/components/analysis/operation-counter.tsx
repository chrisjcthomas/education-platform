'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBigOStore } from '../../lib/stores/big-o-store'
import { Badge } from '../ui/badge'
import { Card } from '../ui/card'

interface OperationCounterProps {
  className?: string
  showBadge?: boolean
  showDetails?: boolean
}

export const OperationCounter: React.FC<OperationCounterProps> = ({
  className = '',
  showBadge = true,
  showDetails = false
}) => {
  const {
    operationCounter,
    currentAnalysis,
    showRealTimeCounter,
    isTracking
  } = useBigOStore()

  if (!showRealTimeCounter || !isTracking) {
    return null
  }

  const complexity = currentAnalysis?.complexity
  const efficiency = currentAnalysis?.efficiency || 0

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`flex items-center gap-3 ${className}`}
      >
        {/* Operation Counter */}
        <Card className="px-3 py-2 bg-white/90 backdrop-blur-sm border shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Operations:</span>
            <motion.span
              key={operationCounter}
              initial={{ scale: 1.2, color: '#3b82f6' }}
              animate={{ scale: 1, color: '#1f2937' }}
              className="text-lg font-bold tabular-nums"
            >
              {operationCounter}
            </motion.span>
          </div>
        </Card>

        {/* Complexity Badge */}
        {showBadge && complexity && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Badge
              variant="outline"
              className="px-3 py-1 text-sm font-mono"
              style={{
                borderColor: complexity.color,
                color: complexity.color,
                backgroundColor: `${complexity.color}10`
              }}
            >
              {complexity.notation}
            </Badge>
          </motion.div>
        )}

        {/* Efficiency Score */}
        {showDetails && currentAnalysis && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2"
          >
            <span className="text-sm text-gray-600">Efficiency:</span>
            <div className="flex items-center gap-1">
              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${efficiency}%` }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: efficiency > 80 ? '#10b981' : 
                                   efficiency > 60 ? '#f59e0b' : '#ef4444'
                  }}
                />
              </div>
              <span className="text-sm font-medium tabular-nums">
                {efficiency}%
              </span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export default OperationCounter