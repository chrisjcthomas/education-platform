'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useBigOStore } from '../../lib/stores/big-o-store'
import { useAlgorithmStore } from '../../lib/stores/algorithm-store'
import { BigOOverlay } from '../analysis/big-o-overlay'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  BarChart3,
  TrendingUp,
  Info
} from 'lucide-react'

export const BigOAnalysisDemo: React.FC = () => {
  const [demoData] = useState([1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31])
  const [target, setTarget] = useState(15)
  const [isRunning, setIsRunning] = useState(false)
  const [_currentStep, setCurrentStep] = useState(0)

  const {
    startTracking,
    stopTracking,
    resetCounter,
    addAlgorithmForComparison,
    generateScalingData,
    currentAnalysis,
    operationCounter,
    isTracking
  } = useBigOStore()

  const {
    setAlgorithmType,
    setData,
    setTarget: setAlgorithmTarget,
    addStep,
    reset: resetAlgorithm
  } = useAlgorithmStore()

  // Initialize demo
  useEffect(() => {
    setAlgorithmType('binary-search')
    setData(demoData)
    setAlgorithmTarget(target)
  }, [setAlgorithmType, setData, setAlgorithmTarget, demoData, target])

  // Simulate binary search steps
  const simulateBinarySearch = async () => {
    if (isRunning) return

    setIsRunning(true)
    resetCounter()
    resetAlgorithm()
    startTracking('binary-search', demoData.length)

    let left = 0
    let right = demoData.length - 1
    let step = 0

    while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      step++
      setCurrentStep(step)

      // Add step to algorithm store
      addStep({
        type: 'compare',
        indices: [left, mid, right],
        metadata: { 
          left, 
          mid, 
          right, 
          value: demoData[mid],
          target,
          comparison: demoData[mid] === target ? 'found' : 
                     demoData[mid] < target ? 'less' : 'greater'
        },
        description: `Step ${step}: Compare ${demoData[mid]} with target ${target}`,
        operationCount: 1
      })

      // Wait for animation
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (demoData[mid] === target) {
        addStep({
          type: 'found',
          indices: [mid],
          metadata: { found: true, value: demoData[mid] },
          description: `Found target ${target} at index ${mid}!`,
          operationCount: 1
        })
        break
      } else if (demoData[mid] < target) {
        left = mid + 1
      } else {
        right = mid - 1
      }
    }

    setIsRunning(false)
    
    // Add to comparison after completion
    if (currentAnalysis) {
      addAlgorithmForComparison(
        'Binary Search',
        'binary-search',
        operationCounter
      )
    }
  }

  // Simulate linear search for comparison
  const simulateLinearSearch = async () => {
    if (isRunning) return

    setIsRunning(true)
    const linearOperations = demoData.findIndex(val => val === target) + 1

    // Simulate linear search operations
    for (let i = 0; i < linearOperations; i++) {
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    addAlgorithmForComparison(
      'Linear Search',
      'linear-search',
      linearOperations
    )

    setIsRunning(false)
  }

  const handleReset = () => {
    setIsRunning(false)
    setCurrentStep(0)
    resetCounter()
    resetAlgorithm()
    stopTracking()
  }

  const handleGenerateScaling = () => {
    generateScalingData('binary-search', [10, 50, 100, 500, 1000, 5000])
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Big-O Analysis Demo
        </h2>
        <p className="text-gray-600">
          Watch real-time complexity analysis as algorithms execute
        </p>
      </div>

      {/* Demo Controls */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Binary Search Demo</h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono">
              Target: {target}
            </Badge>
            <Badge variant="outline">
              Array Size: {demoData.length}
            </Badge>
          </div>
        </div>

        {/* Array Visualization */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {demoData.map((value, index) => (
              <motion.div
                key={index}
                className={`w-12 h-12 flex items-center justify-center rounded border-2 text-sm font-medium ${
                  value === target
                    ? 'border-green-500 bg-green-100 text-green-800'
                    : 'border-gray-300 bg-white text-gray-700'
                }`}
                whileHover={{ scale: 1.05 }}
              >
                {value}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <Button
            onClick={simulateBinarySearch}
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isRunning ? 'Running...' : 'Run Binary Search'}
          </Button>

          <Button
            variant="outline"
            onClick={simulateLinearSearch}
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Compare Linear Search
          </Button>

          <Button
            variant="outline"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>

        <Separator className="my-4" />

        {/* Analysis Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            onClick={handleGenerateScaling}
            className="flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            Show Scaling Behavior
          </Button>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Zap className="w-4 h-4" />
            <span>
              {isTracking ? `${operationCounter} operations` : 'Not tracking'}
            </span>
          </div>
        </div>
      </Card>

      {/* Target Selection */}
      <Card className="p-4">
        <h4 className="font-medium mb-3">Change Target Value</h4>
        <div className="flex flex-wrap gap-2">
          {demoData.map((value) => (
            <Button
              key={value}
              variant={value === target ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setTarget(value)
                setAlgorithmTarget(value)
              }}
              disabled={isRunning}
            >
              {value}
            </Button>
          ))}
        </div>
      </Card>

      {/* Current Analysis Display */}
      {currentAnalysis && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-blue-600" />
            <h4 className="font-medium">Current Analysis</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-600">Complexity</div>
              <div className="font-mono font-medium" style={{ color: currentAnalysis.complexity.color }}>
                {currentAnalysis.complexity.notation}
              </div>
            </div>
            <div>
              <div className="text-gray-600">Operations</div>
              <div className="font-medium">{currentAnalysis.operationCount}</div>
            </div>
            <div>
              <div className="text-gray-600">Efficiency</div>
              <div className="font-medium">{currentAnalysis.efficiency}%</div>
            </div>
          </div>
          <div className="mt-3 p-3 bg-blue-50 rounded text-sm text-blue-800">
            {currentAnalysis.plainLanguageExplanation}
          </div>
        </Card>
      )}

      {/* Big-O Overlay */}
      <BigOOverlay position="top-right" />
    </div>
  )
}

export default BigOAnalysisDemo