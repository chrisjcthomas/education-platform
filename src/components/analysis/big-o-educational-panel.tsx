'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Separator } from '../ui/separator'
import { 
  BookOpen, 
  BarChart3, 
  TrendingUp, 
  Lightbulb, 
  Target,
  Clock,
  Zap,
  AlertCircle
} from 'lucide-react'
import { useBigOStore } from '../../lib/stores/big-o-store'
import { useUIStore } from '../../lib/stores/ui-store'
import { BigOTooltip } from './big-o-tooltip'
import { ScalingDemonstration } from './scaling-demonstration'
import { PerformanceComparisonChart } from './performance-comparison-chart'

interface BigOEducationalPanelProps {
  className?: string
  defaultTab?: string
  compact?: boolean
}

export const BigOEducationalPanel: React.FC<BigOEducationalPanelProps> = ({
  className = '',
  defaultTab = 'overview',
  compact = false
}) => {
  const { currentAnalysis, isTracking } = useBigOStore()
  const { learningMode } = useUIStore()
  const [activeTab, setActiveTab] = useState(defaultTab)

  if (!isTracking || !currentAnalysis) {
    return (
      <Card className={`p-6 bg-gray-50 border-dashed ${className}`}>
        <div className="text-center text-gray-500">
          <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Start an algorithm to see Big-O analysis</p>
        </div>
      </Card>
    )
  }

  const { complexity, operationCount, inputSize, efficiency, plainLanguageExplanation } = currentAnalysis

  const getComplexityInsights = () => {
    const insights = {
      'O(1)': {
        icon: <Zap className="w-5 h-5 text-green-600" />,
        title: 'Constant Time - The Holy Grail',
        description: 'This is the best possible performance! No matter how much data you have, it always takes the same amount of time.',
        examples: ['Array access by index', 'Hash table lookup', 'Stack push/pop'],
        whenToUse: 'Always prefer O(1) operations when possible. They scale perfectly.',
        realWorld: 'Like having a direct phone number vs. calling directory assistance.'
      },
      'O(log n)': {
        icon: <TrendingUp className="w-5 h-5 text-green-500" />,
        title: 'Logarithmic Time - Divide and Conquer',
        description: 'Extremely efficient! Each step eliminates half the remaining possibilities.',
        examples: ['Binary search', 'Balanced tree operations', 'Finding height of tree'],
        whenToUse: 'Perfect for searching in sorted data or tree-like structures.',
        realWorld: 'Like finding a word in a dictionary by opening to the middle each time.'
      },
      'O(n)': {
        icon: <BarChart3 className="w-5 h-5 text-blue-600" />,
        title: 'Linear Time - Straightforward Scaling',
        description: 'Performance scales directly with input size. Predictable and often acceptable.',
        examples: ['Linear search', 'Array traversal', 'Finding min/max'],
        whenToUse: 'Good for operations that must examine each element once.',
        realWorld: 'Like reading every page of a book to find a specific quote.'
      },
      'O(n log n)': {
        icon: <Target className="w-5 h-5 text-yellow-600" />,
        title: 'Linearithmic Time - Efficient Sorting',
        description: 'The best we can do for comparison-based sorting. Still quite efficient.',
        examples: ['Merge sort', 'Heap sort', 'Quick sort (average)'],
        whenToUse: 'Standard choice for general-purpose sorting algorithms.',
        realWorld: 'Like organizing a deck of cards by repeatedly splitting and merging piles.'
      },
      'O(n²)': {
        icon: <AlertCircle className="w-5 h-5 text-red-500" />,
        title: 'Quadratic Time - Nested Trouble',
        description: 'Performance degrades quickly! Often involves nested loops over the data.',
        examples: ['Bubble sort', 'Selection sort', 'Nested loops'],
        whenToUse: 'Avoid for large datasets. Only acceptable for small inputs.',
        realWorld: 'Like comparing every person in a room with every other person.'
      },
      'O(2^n)': {
        icon: <AlertCircle className="w-5 h-5 text-red-700" />,
        title: 'Exponential Time - The Performance Killer',
        description: 'Extremely poor scaling! Operations double with each additional input.',
        examples: ['Naive recursive algorithms', 'Brute force solutions'],
        whenToUse: 'Only for very small inputs or when no better algorithm exists.',
        realWorld: 'Like trying every possible combination of a lock.'
      }
    }

    return insights[complexity.notation as keyof typeof insights] || {
      icon: <BookOpen className="w-5 h-5 text-gray-600" />,
      title: 'Unknown Complexity',
      description: 'This complexity pattern is not commonly categorized.',
      examples: ['Various algorithms'],
      whenToUse: 'Analyze the specific algorithm to understand its behavior.',
      realWorld: 'Performance characteristics vary by implementation.'
    }
  }

  const insights = getComplexityInsights()

  const shouldShowSimplified = learningMode === 'beginner'
  const shouldShowTechnical = learningMode === 'details'

  return (
    <Card className={`bg-white/95 backdrop-blur-sm border shadow-lg ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {insights.icon}
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Big-O Analysis
              </h2>
              <p className="text-sm text-gray-600">
                Understanding algorithm efficiency
              </p>
            </div>
          </div>
          
          <BigOTooltip complexity={complexity} inputSize={inputSize} operationCount={operationCount}>
            <Badge
              variant="outline"
              className="px-4 py-2 font-mono text-lg cursor-help"
              style={{
                borderColor: complexity.color,
                color: complexity.color,
                backgroundColor: `${complexity.color}15`
              }}
            >
              {complexity.notation}
            </Badge>
          </BigOTooltip>
        </div>

        {/* Current Performance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <Clock className="w-6 h-6 mx-auto mb-2 text-gray-600" />
            <div className="text-2xl font-bold text-gray-900">{operationCount}</div>
            <div className="text-sm text-gray-600">Operations</div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <BarChart3 className="w-6 h-6 mx-auto mb-2 text-gray-600" />
            <div className="text-2xl font-bold text-gray-900">{inputSize}</div>
            <div className="text-sm text-gray-600">Input Size</div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <Zap className="w-6 h-6 mx-auto mb-2 text-gray-600" />
            <div className="text-2xl font-bold" style={{ color: complexity.color }}>
              {efficiency}%
            </div>
            <div className="text-sm text-gray-600">Efficiency</div>
          </div>
        </div>

        {/* Educational Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="scaling" className="text-xs">Scaling</TabsTrigger>
            <TabsTrigger value="comparison" className="text-xs">Compare</TabsTrigger>
            <TabsTrigger value="insights" className="text-xs">Insights</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-4">
            <div className="space-y-4">
              <div className="p-4 rounded-lg" style={{ backgroundColor: `${complexity.color}10` }}>
                <h3 className="font-semibold mb-2" style={{ color: complexity.color }}>
                  {insights.title}
                </h3>
                <p className="text-sm text-gray-700 mb-3">
                  {insights.description}
                </p>
                
                {shouldShowSimplified && (
                  <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <p className="text-sm text-blue-800">
                      <Lightbulb className="w-4 h-4 inline mr-1" />
                      <span className="font-medium">In simple terms:</span> {plainLanguageExplanation}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Common Examples</h4>
                  <ul className="space-y-1">
                    {insights.examples.map((example, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: complexity.color }} />
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">When to Use</h4>
                  <p className="text-sm text-gray-600">{insights.whenToUse}</p>
                  
                  <h4 className="font-medium text-gray-900 mb-2 mt-3">Real-world Analogy</h4>
                  <p className="text-sm text-gray-600">{insights.realWorld}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Scaling Tab */}
          <TabsContent value="scaling" className="mt-4">
            <ScalingDemonstration 
              complexity={complexity}
              autoPlay={false}
              showComparison={shouldShowTechnical}
            />
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison" className="mt-4">
            <PerformanceComparisonChart
              inputSize={inputSize}
              highlightComplexity={complexity.notation}
              showRecommendations={true}
            />
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="mt-4">
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
                <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Performance Insights
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-purple-800 mb-2">Current Performance</h4>
                    <ul className="space-y-2 text-sm text-purple-700">
                      <li>• Complexity class: <span className="font-medium">{complexity.name}</span></li>
                      <li>• Efficiency rating: <span className="font-medium capitalize">{complexity.category}</span></li>
                      <li>• Operations per input: <span className="font-medium">{(operationCount / inputSize).toFixed(2)}</span></li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-purple-800 mb-2">Scaling Predictions</h4>
                    <ul className="space-y-2 text-sm text-purple-700">
                      <li>• 2x input → <span className="font-medium">{complexity.notation === 'O(1)' ? '1x' : complexity.notation === 'O(log n)' ? '~1.1x' : complexity.notation === 'O(n)' ? '2x' : complexity.notation === 'O(n²)' ? '4x' : '2^n'}</span> operations</li>
                      <li>• 10x input → <span className="font-medium">{complexity.notation === 'O(1)' ? '1x' : complexity.notation === 'O(log n)' ? '~1.3x' : complexity.notation === 'O(n)' ? '10x' : complexity.notation === 'O(n²)' ? '100x' : 'exponential'}</span> operations</li>
                      <li>• Recommended max size: <span className="font-medium">{complexity.category === 'excellent' ? 'Unlimited' : complexity.category === 'good' ? '1M+' : complexity.category === 'fair' ? '100K' : complexity.category === 'poor' ? '10K' : '100'}</span></li>
                    </ul>
                  </div>
                </div>
              </div>

              {shouldShowTechnical && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Technical Details</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>• Mathematical notation: <code className="px-2 py-1 bg-gray-200 rounded font-mono">{complexity.notation}</code></p>
                    <p>• Growth rate category: {complexity.category}</p>
                    <p>• Theoretical minimum operations: {Math.ceil(Math.log2(inputSize))} (for search)</p>
                    <p>• Actual operations performed: {operationCount}</p>
                    <p>• Efficiency ratio: {((Math.ceil(Math.log2(inputSize)) / operationCount) * 100).toFixed(1)}% of theoretical optimum</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  )
}

export default BigOEducationalPanel