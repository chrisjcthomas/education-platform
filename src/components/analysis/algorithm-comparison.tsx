'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBigOStore } from '../../lib/stores/big-o-store'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Trophy, BarChart3, X } from 'lucide-react'

interface AlgorithmComparisonProps {
  className?: string
  onClose?: () => void
}

export const AlgorithmComparison: React.FC<AlgorithmComparisonProps> = ({
  className = '',
  onClose
}) => {
  const {
    algorithmComparisons,
    showComparisons,
    clearComparisons
  } = useBigOStore()

  if (!showComparisons || !algorithmComparisons) {
    return null
  }

  const { algorithms, winner, explanation, inputSize } = algorithmComparisons

  // Sort algorithms by efficiency for display
  const sortedAlgorithms = [...algorithms].sort((a, b) => b.efficiency - a.efficiency)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={className}
      >
        <Card className="p-6 bg-white/95 backdrop-blur-sm border shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Algorithm Comparison
              </h3>
              <Badge variant="outline" className="text-xs">
                {inputSize} elements
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearComparisons}
                className="text-gray-500 hover:text-gray-700"
              >
                Clear
              </Button>
              {onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Algorithm List */}
          <div className="space-y-3 mb-4">
            {sortedAlgorithms.map((algorithm, index) => (
              <motion.div
                key={algorithm.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 rounded-lg border-2 transition-all ${
                  algorithm.name === winner
                    ? 'border-yellow-400 bg-yellow-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {algorithm.name === winner && (
                      <Trophy className="w-4 h-4 text-yellow-600" />
                    )}
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {algorithm.name}
                        {algorithm.name === winner && (
                          <span className="ml-2 text-sm text-yellow-600 font-normal">
                            Winner!
                          </span>
                        )}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className="text-xs font-mono"
                          style={{
                            borderColor: algorithm.complexity.color,
                            color: algorithm.complexity.color,
                            backgroundColor: `${algorithm.complexity.color}15`
                          }}
                        >
                          {algorithm.complexity.notation}
                        </Badge>
                        <span className="text-xs text-gray-600">
                          {algorithm.complexity.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 tabular-nums">
                      {algorithm.operationCount}
                    </div>
                    <div className="text-xs text-gray-600">operations</div>
                  </div>
                </div>

                {/* Efficiency Bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Efficiency</span>
                    <span>{algorithm.efficiency}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${algorithm.efficiency}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: algorithm.complexity.color }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Explanation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400"
          >
            <p className="text-sm text-blue-800 leading-relaxed">
              <span className="font-medium">Analysis:</span> {explanation}
            </p>
          </motion.div>

          {/* Performance Visualization */}
          {algorithms.length > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-4 p-3 bg-gray-50 rounded-lg"
            >
              <h5 className="text-sm font-medium text-gray-700 mb-2">
                Operation Count Comparison
              </h5>
              <div className="space-y-2">
                {sortedAlgorithms.map((algorithm, index) => {
                  const maxOperations = Math.max(...algorithms.map(a => a.operationCount))
                  const percentage = (algorithm.operationCount / maxOperations) * 100
                  
                  return (
                    <div key={algorithm.name} className="flex items-center gap-3">
                      <div className="w-20 text-xs text-gray-600 truncate">
                        {algorithm.name}
                      </div>
                      <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1 + 0.7 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: algorithm.complexity.color }}
                        />
                      </div>
                      <div className="w-12 text-xs text-gray-600 text-right tabular-nums">
                        {algorithm.operationCount}
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}

export default AlgorithmComparison