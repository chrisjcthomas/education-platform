'use client'

import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBigOStore } from '../../lib/stores/big-o-store'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { TrendingUp, X, Info } from 'lucide-react'

interface ScalingVisualizationProps {
  className?: string
  onClose?: () => void
  height?: number
}

export const ScalingVisualization: React.FC<ScalingVisualizationProps> = ({
  className = '',
  onClose,
  height = 200
}) => {
  const {
    scalingBehavior,
    showScalingChart
  } = useBigOStore()

  // Calculate chart dimensions and scaling
  const chartData = useMemo(() => {
    if (!scalingBehavior) return null

    const { inputSizes, operationCounts, complexityClass } = scalingBehavior
    const maxOperations = Math.max(...operationCounts)
    const maxSize = Math.max(...inputSizes)

    // Create points for the chart
    const points = inputSizes.map((size, index) => ({
      x: (size / maxSize) * 100, // Percentage of max size
      y: 100 - (operationCounts[index] / maxOperations) * 100, // Inverted for SVG
      size,
      operations: operationCounts[index]
    }))

    return {
      points,
      maxOperations,
      maxSize,
      complexityClass
    }
  }, [scalingBehavior])

  if (!showScalingChart || !scalingBehavior || !chartData) {
    return null
  }

  const { points, maxOperations, maxSize, complexityClass } = chartData

  // Create SVG path for the curve
  const pathData = points.reduce((path, point, index) => {
    const command = index === 0 ? 'M' : 'L'
    return `${path} ${command} ${point.x} ${point.y}`
  }, '')

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
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Scaling Behavior
              </h3>
              <Badge
                variant="outline"
                className="font-mono text-xs"
                style={{
                  borderColor: complexityClass.color,
                  color: complexityClass.color,
                  backgroundColor: `${complexityClass.color}15`
                }}
              >
                {complexityClass.notation}
              </Badge>
            </div>
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

          {/* Chart */}
          <div className="mb-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative bg-gray-50 rounded-lg p-4"
              style={{ height: height + 40 }}
            >
              <svg
                width="100%"
                height={height}
                viewBox={`0 0 100 100`}
                className="overflow-visible"
              >
                {/* Grid lines */}
                <defs>
                  <pattern
                    id="grid"
                    width="20"
                    height="20"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 20 0 L 0 0 0 20"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="0.5"
                    />
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" />

                {/* Scaling curve */}
                <motion.path
                  d={pathData}
                  fill="none"
                  stroke={complexityClass.color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />

                {/* Data points */}
                {points.map((point, index) => (
                  <motion.g key={index}>
                    <motion.circle
                      cx={point.x}
                      cy={point.y}
                      r="3"
                      fill={complexityClass.color}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    />
                    
                    {/* Tooltip on hover */}
                    <motion.g
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="pointer-events-none"
                    >
                      <rect
                        x={point.x - 25}
                        y={point.y - 35}
                        width="50"
                        height="25"
                        fill="rgba(0,0,0,0.8)"
                        rx="4"
                      />
                      <text
                        x={point.x}
                        y={point.y - 25}
                        textAnchor="middle"
                        fill="white"
                        fontSize="8"
                      >
                        n={point.size}
                      </text>
                      <text
                        x={point.x}
                        y={point.y - 15}
                        textAnchor="middle"
                        fill="white"
                        fontSize="8"
                      >
                        ops={point.operations}
                      </text>
                    </motion.g>
                  </motion.g>
                ))}
              </svg>

              {/* Axis labels */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-600 px-4">
                <span>0</span>
                <span className="text-center">Input Size (n)</span>
                <span>{maxSize.toLocaleString()}</span>
              </div>
              
              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-600 py-4">
                <span>{maxOperations.toLocaleString()}</span>
                <span className="transform -rotate-90 origin-center">Operations</span>
                <span>0</span>
              </div>
            </motion.div>
          </div>

          {/* Scaling Information */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4"
          >
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold" style={{ color: complexityClass.color }}>
                {scalingBehavior.scalingFactor}x
              </div>
              <div className="text-xs text-gray-600">Growth Factor</div>
              <div className="text-xs text-gray-500 mt-1">
                When input doubles
              </div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">
                {complexityClass.name}
              </div>
              <div className="text-xs text-gray-600">Complexity Class</div>
              <div className="text-xs text-gray-500 mt-1 capitalize">
                {complexityClass.category} efficiency
              </div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">
                {points.length}
              </div>
              <div className="text-xs text-gray-600">Data Points</div>
              <div className="text-xs text-gray-500 mt-1">
                Measured & projected
              </div>
            </div>
          </motion.div>

          {/* Explanation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400"
          >
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-purple-800">
                <p className="font-medium mb-1">Scaling Analysis:</p>
                <p>
                  This {complexityClass.name.toLowerCase()} algorithm's performance 
                  {complexityClass.category === 'excellent' ? ' remains excellent' :
                   complexityClass.category === 'good' ? ' scales well' :
                   complexityClass.category === 'fair' ? ' degrades moderately' :
                   ' degrades significantly'} as input size increases. 
                  When you double the input size, operations increase by approximately {scalingBehavior.scalingFactor}x.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Sample Data Points */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-4"
          >
            <h5 className="text-sm font-medium text-gray-700 mb-2">Sample Performance</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              {points.slice(0, 4).map((point, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded text-center">
                  <div className="font-medium text-gray-900">n = {point.size}</div>
                  <div className="text-gray-600">{point.operations} ops</div>
                </div>
              ))}
            </div>
          </motion.div>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}

export default ScalingVisualization