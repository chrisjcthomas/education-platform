'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { BarChart3, TrendingUp, Zap, AlertTriangle } from 'lucide-react'
import { ComplexityClass } from '../../lib/types'
import { BigOAnalysisService } from '../../lib/services/big-o-analysis-service'

interface PerformanceComparisonChartProps {
  className?: string
  inputSize?: number
  highlightComplexity?: string
  showRecommendations?: boolean
}

interface ComplexityData {
  complexity: ComplexityClass
  operations: number
  efficiency: number
  recommendation: string
  useCase: string
}

export const PerformanceComparisonChart: React.FC<PerformanceComparisonChartProps> = ({
  className = '',
  inputSize = 1000,
  highlightComplexity,
  showRecommendations = true
}) => {
  const [selectedInputSize, setSelectedInputSize] = useState(inputSize)
  const [hoveredComplexity, setHoveredComplexity] = useState<string | null>(null)

  // Generate comparison data
  const comparisonData = useMemo(() => {
    const complexities = BigOAnalysisService.getComplexityClasses()
    
    const calculateOperations = (notation: string, n: number): number => {
      switch (notation) {
        case 'O(1)': return 1
        case 'O(log n)': return Math.ceil(Math.log2(n))
        case 'O(n)': return n
        case 'O(n log n)': return n * Math.ceil(Math.log2(n))
        case 'O(n²)': return n * n
        case 'O(2^n)': return Math.min(Math.pow(2, Math.min(n, 20)), 1000000000) // Cap for visualization
        default: return n
      }
    }

    const getRecommendation = (notation: string): string => {
      const recommendations = {
        'O(1)': 'Perfect! Use whenever possible.',
        'O(log n)': 'Excellent! Great for search operations.',
        'O(n)': 'Good! Acceptable for most applications.',
        'O(n log n)': 'Fair! Best for comparison-based sorting.',
        'O(n²)': 'Poor! Avoid for large datasets.',
        'O(2^n)': 'Terrible! Only for very small inputs.'
      }
      return recommendations[notation as keyof typeof recommendations] || 'Varies by use case.'
    }

    const getUseCase = (notation: string): string => {
      const useCases = {
        'O(1)': 'Array access, hash table lookup',
        'O(log n)': 'Binary search, balanced tree operations',
        'O(n)': 'Linear search, array traversal',
        'O(n log n)': 'Merge sort, heap sort',
        'O(n²)': 'Bubble sort, nested loops',
        'O(2^n)': 'Recursive algorithms, brute force'
      }
      return useCases[notation as keyof typeof useCases] || 'Various algorithms'
    }

    return complexities.map(complexity => {
      const operations = calculateOperations(complexity.notation, selectedInputSize)
      const efficiency = Math.max(0, Math.min(100, (1 / Math.log10(operations + 1)) * 100))
      
      return {
        complexity,
        operations,
        efficiency,
        recommendation: getRecommendation(complexity.notation),
        useCase: getUseCase(complexity.notation)
      }
    }).sort((a, b) => a.operations - b.operations)
  }, [selectedInputSize])

  const maxOperations = Math.max(...comparisonData.map(d => d.operations))

  const inputSizeOptions = [10, 100, 1000, 10000, 100000]

  const getPerformanceIcon = (category: string) => {
    switch (category) {
      case 'excellent': return <Zap className="w-4 h-4 text-green-600" />
      case 'good': return <TrendingUp className="w-4 h-4 text-blue-600" />
      case 'fair': return <BarChart3 className="w-4 h-4 text-yellow-600" />
      case 'poor':
      case 'terrible': return <AlertTriangle className="w-4 h-4 text-red-600" />
      default: return <BarChart3 className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <Card className={`p-6 bg-white/95 backdrop-blur-sm border shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Performance Comparison
          </h3>
          <p className="text-sm text-gray-600">
            Compare algorithm complexities at different input sizes
          </p>
        </div>
        
        {/* Input Size Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Input size:</span>
          <select
            value={selectedInputSize}
            onChange={(e) => setSelectedInputSize(Number(e.target.value))}
            className="px-3 py-1 text-sm border border-gray-200 rounded bg-white"
          >
            {inputSizeOptions.map(size => (
              <option key={size} value={size}>
                {size.toLocaleString()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6">
        <div className="space-y-3">
          {comparisonData.map((data, index) => {
            const isHighlighted = highlightComplexity === data.complexity.notation
            const isHovered = hoveredComplexity === data.complexity.notation
            const barWidth = (data.operations / maxOperations) * 100
            
            return (
              <motion.div
                key={data.complexity.notation}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  isHighlighted ? 'border-blue-400 bg-blue-50' : 
                  isHovered ? 'border-gray-300 bg-gray-50' : 'border-gray-200'
                }`}
                onMouseEnter={() => setHoveredComplexity(data.complexity.notation)}
                onMouseLeave={() => setHoveredComplexity(null)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getPerformanceIcon(data.complexity.category)}
                    <Badge
                      variant="outline"
                      className="px-2 py-1 font-mono text-sm"
                      style={{
                        borderColor: data.complexity.color,
                        color: data.complexity.color,
                        backgroundColor: `${data.complexity.color}15`
                      }}
                    >
                      {data.complexity.notation}
                    </Badge>
                    <div>
                      <h4 className="font-medium text-sm">{data.complexity.name}</h4>
                      <p className="text-xs text-gray-600">{data.useCase}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold tabular-nums">
                      {data.operations.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">operations</div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="relative">
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: data.complexity.color }}
                    />
                  </div>
                  
                  {/* Efficiency indicator */}
                  <div className="flex items-center justify-between mt-1 text-xs">
                    <span className="text-gray-600 capitalize">
                      {data.complexity.category} efficiency
                    </span>
                    <span className="font-medium" style={{ color: data.complexity.color }}>
                      {data.efficiency.toFixed(0)}%
                    </span>
                  </div>
                </div>
                
                {/* Recommendation */}
                {showRecommendations && (isHovered || isHighlighted) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 pt-2 border-t border-gray-200"
                  >
                    <p className="text-xs text-gray-700">
                      <span className="font-medium">Recommendation:</span> {data.recommendation}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      <Separator className="my-4" />

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-lg font-bold text-green-800">
            {comparisonData.filter(d => d.complexity.category === 'excellent').length}
          </div>
          <div className="text-sm text-green-600">Excellent</div>
        </div>
        
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="text-lg font-bold text-yellow-800">
            {comparisonData.filter(d => ['good', 'fair'].includes(d.complexity.category)).length}
          </div>
          <div className="text-sm text-yellow-600">Acceptable</div>
        </div>
        
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-lg font-bold text-red-800">
            {comparisonData.filter(d => ['poor', 'terrible'].includes(d.complexity.category)).length}
          </div>
          <div className="text-sm text-red-600">Problematic</div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
        <h4 className="font-medium text-blue-900 mb-2">Key Insights for n = {selectedInputSize.toLocaleString()}</h4>
        <div className="space-y-1 text-sm text-blue-800">
          <p>• Best performer: <span className="font-medium">{comparisonData[0].complexity.notation}</span> with {comparisonData[0].operations.toLocaleString()} operations</p>
          <p>• Worst performer: <span className="font-medium">{comparisonData[comparisonData.length - 1].complexity.notation}</span> with {comparisonData[comparisonData.length - 1].operations.toLocaleString()} operations</p>
          <p>• Performance difference: <span className="font-medium">{Math.round(comparisonData[comparisonData.length - 1].operations / comparisonData[0].operations).toLocaleString()}x</span> slower</p>
        </div>
      </div>
    </Card>
  )
}

export default PerformanceComparisonChart