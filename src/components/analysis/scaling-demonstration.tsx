'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Play, Pause, RotateCcw, FastForward } from 'lucide-react'
import { ComplexityClass } from '../../lib/types'

interface ScalingDemonstrationProps {
  complexity: ComplexityClass
  className?: string
  autoPlay?: boolean
  showComparison?: boolean
}

interface DataPoint {
  inputSize: number
  operations: number
  color: string
  delay: number
}

export const ScalingDemonstration: React.FC<ScalingDemonstrationProps> = ({
  complexity,
  className = '',
  autoPlay = false,
  showComparison = false
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [currentStep, setCurrentStep] = useState(0)
  const [speed, setSpeed] = useState(1)

  // Generate data points for the demonstration
  const generateDataPoints = (notation: string): DataPoint[] => {
    const sizes = [1, 2, 4, 8, 16, 32, 64, 128]
    
    const calculateOperations = (n: number, type: string): number => {
      switch (type) {
        case 'O(1)': return 1
        case 'O(log n)': return Math.ceil(Math.log2(n))
        case 'O(n)': return n
        case 'O(n log n)': return n * Math.ceil(Math.log2(n))
        case 'O(n²)': return n * n
        case 'O(2^n)': return Math.min(Math.pow(2, n), 1000000) // Cap for visualization
        default: return n
      }
    }

    return sizes.map((size, index) => ({
      inputSize: size,
      operations: calculateOperations(size, notation),
      color: complexity.color,
      delay: index * 0.2
    }))
  }

  const dataPoints = generateDataPoints(complexity.notation)
  const maxOperations = Math.max(...dataPoints.map(p => p.operations))

  // Animation control
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= dataPoints.length - 1) {
          setIsPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, 1000 / speed)

    return () => clearInterval(interval)
  }, [isPlaying, speed, dataPoints.length])

  const handlePlay = () => {
    if (currentStep >= dataPoints.length - 1) {
      setCurrentStep(0)
    }
    setIsPlaying(true)
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setCurrentStep(0)
  }

  const getGrowthDescription = () => {
    const descriptions = {
      'O(1)': 'Operations stay constant - perfect scalability!',
      'O(log n)': 'Operations grow very slowly - excellent scalability!',
      'O(n)': 'Operations grow linearly with input size - good scalability.',
      'O(n log n)': 'Operations grow moderately - acceptable for most cases.',
      'O(n²)': 'Operations grow quadratically - poor scalability!',
      'O(2^n)': 'Operations explode exponentially - terrible scalability!'
    }
    
    return descriptions[complexity.notation as keyof typeof descriptions] || 'Growth pattern varies.'
  }

  const getScalingFactor = () => {
    if (currentStep < 1) return null
    
    const current = dataPoints[currentStep]
    const previous = dataPoints[currentStep - 1]
    
    if (previous.operations === 0) return null
    
    const factor = current.operations / previous.operations
    return factor.toFixed(1)
  }

  return (
    <Card className={`p-6 bg-white/95 backdrop-blur-sm border shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
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
          <div>
            <h3 className="font-semibold text-gray-900">Scaling Demonstration</h3>
            <p className="text-sm text-gray-600">{complexity.name} Time Complexity</p>
          </div>
        </div>
        
        {/* Speed Control */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Speed:</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSpeed(prev => prev === 0.5 ? 2 : prev === 1 ? 0.5 : 1)}
            className="text-xs"
          >
            {speed}x
          </Button>
        </div>
      </div>

      {/* Visualization Area */}
      <div className="mb-6">
        <div className="relative bg-gray-50 rounded-lg p-4 h-64">
          {/* Y-axis label */}
          <div className="absolute left-2 top-4 text-xs text-gray-600 transform -rotate-90 origin-left">
            Operations
          </div>
          
          {/* Chart area */}
          <div className="ml-8 mr-4 h-full flex items-end justify-between">
            {dataPoints.map((point, index) => {
              const height = (point.operations / maxOperations) * 200
              const isVisible = index <= currentStep
              
              return (
                <div key={index} className="flex flex-col items-center gap-2">
                  {/* Bar */}
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ 
                      height: isVisible ? height : 0,
                      opacity: isVisible ? 1 : 0.3
                    }}
                    transition={{ 
                      duration: 0.5,
                      delay: isVisible ? point.delay : 0,
                      ease: "easeOut"
                    }}
                    className="w-8 rounded-t-md relative"
                    style={{ backgroundColor: complexity.color }}
                  >
                    {/* Operation count label */}
                    {isVisible && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: point.delay + 0.3 }}
                        className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium whitespace-nowrap"
                        style={{ color: complexity.color }}
                      >
                        {point.operations.toLocaleString()}
                      </motion.div>
                    )}
                  </motion.div>
                  
                  {/* Input size label */}
                  <div className="text-xs text-gray-600 font-medium">
                    {point.inputSize}
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* X-axis label */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-600">
            Input Size (n)
          </div>
        </div>
      </div>

      {/* Current Step Info */}
      {currentStep < dataPoints.length && (
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">
                Step {currentStep + 1}: n = {dataPoints[currentStep].inputSize}
              </p>
              <p className="text-sm text-blue-700">
                Operations needed: {dataPoints[currentStep].operations.toLocaleString()}
              </p>
            </div>
            
            {getScalingFactor() && (
              <div className="text-right">
                <p className="text-xs text-blue-600">Growth factor</p>
                <p className="text-lg font-bold text-blue-900">
                  {getScalingFactor()}x
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Growth Description */}
      <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: `${complexity.color}10` }}>
        <p className="text-sm font-medium" style={{ color: complexity.color }}>
          {getGrowthDescription()}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            onClick={isPlaying ? handlePause : handlePlay}
            size="sm"
            className="flex items-center gap-2"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
          
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>
        
        <div className="text-sm text-gray-600">
          {currentStep + 1} / {dataPoints.length} steps
        </div>
      </div>

      {/* Comparison Mode */}
      {showComparison && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Compare with other complexities:
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {['O(1)', 'O(log n)', 'O(n)', 'O(n²)'].map((notation) => (
              <Button
                key={notation}
                variant={notation === complexity.notation ? "default" : "outline"}
                size="sm"
                className="text-xs font-mono"
                disabled={notation === complexity.notation}
              >
                {notation}
              </Button>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

export default ScalingDemonstration