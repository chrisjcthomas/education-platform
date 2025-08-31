'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBigOStore } from '../../lib/stores/big-o-store'
import { useUIStore } from '../../lib/stores/ui-store'
import { OperationCounter } from './operation-counter'
import { ComplexityDisplay } from './complexity-display'
import { AlgorithmComparison } from './algorithm-comparison'
import { ScalingVisualization } from './scaling-visualization'
import { BigOEducationalPanel } from './big-o-educational-panel'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { 
  BarChart3, 
  TrendingUp, 
  Settings, 
  Eye, 
  EyeOff,
  Info,
  Zap
} from 'lucide-react'

interface BigOOverlayProps {
  className?: string
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  compact?: boolean
}

export const BigOOverlay: React.FC<BigOOverlayProps> = ({
  className = '',
  position = 'top-right',
  compact = false
}) => {
  const {
    currentAnalysis,
    isTracking,
    showRealTimeCounter,
    showComplexityBadge,
    showScalingChart,
    showComparisons,
    toggleRealTimeCounter,
    toggleComplexityBadge,
    toggleScalingChart,
    toggleComparisons,
    generateScalingData,
    algorithmComparisons
  } = useBigOStore()

  const { learningMode } = useUIStore()
  const [showSettings, setShowSettings] = useState(false)
  const [showEducationalPanel, setShowEducationalPanel] = useState(false)
  const [isExpanded, setIsExpanded] = useState(!compact)

  // Don't show anything if not tracking
  if (!isTracking) {
    return null
  }

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  }

  const handleGenerateScaling = () => {
    if (currentAnalysis) {
      const algorithmType = currentAnalysis.complexity.notation === 'O(log n)' ? 'binary-search' : 'linear-search'
      generateScalingData(algorithmType)
      toggleScalingChart()
    }
  }

  const shouldShowPlainLanguage = learningMode === 'beginner'
  const shouldShowTechnicalDetails = learningMode === 'details'

  return (
    <div className={`fixed ${positionClasses[position]} z-50 ${className}`}>
      <div className="space-y-3 max-w-sm">
        {/* Main Control Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <Card className="p-3 bg-white/95 backdrop-blur-sm border shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">
                  Big-O Analysis
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-6 w-6 p-0"
                >
                  {isExpanded ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                  className="h-6 w-6 p-0"
                >
                  <Settings className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                {/* Operation Counter */}
                {showRealTimeCounter && (
                  <OperationCounter 
                    showBadge={false}
                    showDetails={shouldShowTechnicalDetails}
                  />
                )}

                {/* Complexity Badge */}
                {showComplexityBadge && currentAnalysis && (
                  <ComplexityDisplay
                    compact={compact}
                    showDescription={shouldShowTechnicalDetails}
                    showPlainLanguage={shouldShowPlainLanguage}
                  />
                )}

                {/* Quick Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateScaling}
                    className="flex items-center gap-1 text-xs"
                  >
                    <TrendingUp className="w-3 h-3" />
                    Scaling
                  </Button>
                  
                  {algorithmComparisons && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleComparisons}
                      className="flex items-center gap-1 text-xs"
                    >
                      <BarChart3 className="w-3 h-3" />
                      Compare
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEducationalPanel(!showEducationalPanel)}
                    className="flex items-center gap-1 text-xs"
                  >
                    <Info className="w-3 h-3" />
                    Learn
                  </Button>
                </div>

                {/* Learning Mode Specific Info */}
                {shouldShowPlainLanguage && currentAnalysis && (
                  <div className="p-2 bg-blue-50 rounded text-xs text-blue-800">
                    <Info className="w-3 h-3 inline mr-1" />
                    {currentAnalysis.plainLanguageExplanation}
                  </div>
                )}
              </motion.div>
            )}
          </Card>

          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full mt-2 left-0 right-0"
              >
                <Card className="p-3 bg-white/95 backdrop-blur-sm border shadow-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Display Options
                  </h4>
                  <div className="space-y-2 text-xs">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={showRealTimeCounter}
                        onChange={toggleRealTimeCounter}
                        className="rounded"
                      />
                      <span>Operation Counter</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={showComplexityBadge}
                        onChange={toggleComplexityBadge}
                        className="rounded"
                      />
                      <span>Complexity Badge</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={showScalingChart}
                        onChange={toggleScalingChart}
                        className="rounded"
                      />
                      <span>Scaling Chart</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={showComparisons}
                        onChange={toggleComparisons}
                        className="rounded"
                      />
                      <span>Algorithm Comparison</span>
                    </label>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Scaling Visualization */}
        {showScalingChart && (
          <ScalingVisualization
            onClose={() => toggleScalingChart()}
            height={150}
          />
        )}

        {/* Algorithm Comparison */}
        {showComparisons && (
          <AlgorithmComparison
            onClose={() => toggleComparisons()}
          />
        )}

        {/* Educational Panel */}
        {showEducationalPanel && (
          <BigOEducationalPanel
            defaultTab="overview"
            compact={compact}
          />
        )}
      </div>
    </div>
  )
}

export default BigOOverlay