'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Info, TrendingUp, Clock, Zap } from 'lucide-react'
import { ComplexityClass } from '../../lib/types'

interface BigOTooltipProps {
  complexity: ComplexityClass
  inputSize?: number
  operationCount?: number
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export const BigOTooltip: React.FC<BigOTooltipProps> = ({
  complexity,
  inputSize = 100,
  operationCount,
  children,
  position = 'top',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false)

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2'
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2'
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2'
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2'
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2'
    }
  }

  const getArrowClasses = () => {
    switch (position) {
      case 'top':
        return 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent'
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent'
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent'
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent'
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent'
    }
  }

  const getExampleScenarios = () => {
    const scenarios = {
      'O(1)': [
        { size: 10, ops: 1, description: 'Array access by index' },
        { size: 1000, ops: 1, description: 'Hash table lookup' },
        { size: 1000000, ops: 1, description: 'Still just one operation!' }
      ],
      'O(log n)': [
        { size: 8, ops: 3, description: 'Binary search in sorted array' },
        { size: 1000, ops: 10, description: 'Finding in balanced tree' },
        { size: 1000000, ops: 20, description: 'Incredibly efficient scaling!' }
      ],
      'O(n)': [
        { size: 10, ops: 10, description: 'Linear search through array' },
        { size: 1000, ops: 1000, description: 'Processing each element once' },
        { size: 1000000, ops: 1000000, description: 'Operations grow linearly' }
      ],
      'O(n log n)': [
        { size: 10, ops: 33, description: 'Merge sort small array' },
        { size: 1000, ops: 9966, description: 'Efficient sorting algorithm' },
        { size: 1000000, ops: 19931569, description: 'Still manageable for large data' }
      ],
      'O(n²)': [
        { size: 10, ops: 100, description: 'Bubble sort small array' },
        { size: 1000, ops: 1000000, description: 'Nested loops - getting expensive' },
        { size: 10000, ops: 100000000, description: 'Becomes impractical quickly!' }
      ],
      'O(2^n)': [
        { size: 5, ops: 32, description: 'Small recursive problem' },
        { size: 10, ops: 1024, description: 'Already getting large' },
        { size: 20, ops: 1048576, description: 'Practically impossible!' }
      ]
    }
    
    return scenarios[complexity.notation as keyof typeof scenarios] || []
  }

  const getPerformanceInsight = () => {
    const insights = {
      'O(1)': 'Perfect! This is the gold standard - performance never degrades.',
      'O(log n)': 'Excellent! Doubles the data, adds just one more step.',
      'O(n)': 'Good! Performance scales predictably with input size.',
      'O(n log n)': 'Fair! The best we can do for comparison-based sorting.',
      'O(n²)': 'Poor! Avoid for large datasets - performance degrades quickly.',
      'O(2^n)': 'Terrible! Only suitable for very small inputs.'
    }
    
    return insights[complexity.notation as keyof typeof insights] || 'Performance characteristics vary.'
  }

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: position === 'top' ? 10 : -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: position === 'top' ? 10 : -10 }}
            transition={{ duration: 0.2 }}
            className={`absolute z-50 ${getPositionClasses()}`}
          >
            <Card className="p-4 bg-white/95 backdrop-blur-sm border shadow-xl max-w-sm">
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <Badge
                  variant="outline"
                  className="px-2 py-1 font-mono text-sm"
                  style={{
                    borderColor: complexity.color,
                    color: complexity.color,
                    backgroundColor: `${complexity.color}15`
                  }}
                >
                  {complexity.notation}
                </Badge>
                <div>
                  <h4 className="font-semibold text-sm">{complexity.name} Time</h4>
                  <p className="text-xs text-gray-600 capitalize">
                    {complexity.category} efficiency
                  </p>
                </div>
              </div>

              {/* Performance Insight */}
              <div className="mb-3 p-2 rounded-lg" style={{ backgroundColor: `${complexity.color}10` }}>
                <div className="flex items-start gap-2">
                  <Zap className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: complexity.color }} />
                  <p className="text-sm font-medium" style={{ color: complexity.color }}>
                    {getPerformanceInsight()}
                  </p>
                </div>
              </div>

              {/* Current Performance */}
              {operationCount && (
                <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-600">Current:</span>
                    <span className="font-medium">{operationCount} operations</span>
                    <span className="text-gray-600">for {inputSize} items</span>
                  </div>
                </div>
              )}

              {/* Example Scenarios */}
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-gray-600" />
                  <h5 className="text-sm font-medium text-gray-900">Scaling Examples</h5>
                </div>
                <div className="space-y-2">
                  {getExampleScenarios().map((scenario, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">n = {scenario.size.toLocaleString()}</span>
                        <span className="text-gray-400">→</span>
                        <span className="font-medium tabular-nums">
                          {scenario.ops.toLocaleString()} ops
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real-world Context */}
              <div className="p-2 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-800">
                    <p className="font-medium mb-1">Real-world example:</p>
                    <p>{getExampleScenarios()[0]?.description || 'Common algorithmic pattern'}</p>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Tooltip Arrow */}
            <div 
              className={`absolute w-0 h-0 border-8 ${getArrowClasses()}`}
              style={{ borderTopColor: 'white' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default BigOTooltip