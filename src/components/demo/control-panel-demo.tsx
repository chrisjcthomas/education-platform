'use client'

import React, { useEffect } from 'react'
import { AlgorithmControlPanel } from '@/components/controls'
import { useAlgorithmStore } from '@/lib/stores/algorithm-store'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function ControlPanelDemo() {
  const { 
    setData, 
    setAlgorithmType, 
    addStep, 
    reset,
    data,
    totalSteps
  } = useAlgorithmStore()

  // Initialize with sample data and steps
  const initializeSampleData = () => {
    const sampleData = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
    setData(sampleData)
    setAlgorithmType('binary-search')
    
    // Add sample steps for binary search
    const steps = [
      {
        type: 'init' as const,
        indices: [],
        metadata: { left: 0, right: 9, target: 7 },
        description: 'Initialize binary search for target 7'
      },
      {
        type: 'compare' as const,
        indices: [4],
        metadata: { left: 0, right: 9, mid: 4, comparison: 'target < mid' },
        description: 'Compare target 7 with middle element 9'
      },
      {
        type: 'eliminate' as const,
        indices: [5, 6, 7, 8, 9],
        metadata: { left: 0, right: 3, eliminated: 'right half' },
        description: 'Eliminate right half (elements > 9)'
      },
      {
        type: 'compare' as const,
        indices: [1],
        metadata: { left: 0, right: 3, mid: 1, comparison: 'target > mid' },
        description: 'Compare target 7 with middle element 3'
      },
      {
        type: 'eliminate' as const,
        indices: [0, 1],
        metadata: { left: 2, right: 3, eliminated: 'left half' },
        description: 'Eliminate left half (elements < 3)'
      },
      {
        type: 'found' as const,
        indices: [3],
        metadata: { left: 2, right: 3, mid: 3, found: true },
        description: 'Found target 7 at index 3!'
      }
    ]

    steps.forEach(step => addStep(step))
  }

  useEffect(() => {
    if (data.length === 0) {
      initializeSampleData()
    }
  }, [data.length])

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Algorithm Control Panel Demo</h2>
        <p className="text-muted-foreground">
          Interactive controls for algorithm execution with play/pause, step navigation, 
          speed adjustment, and progress tracking.
        </p>
      </div>

      <div className="space-y-4">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-3">Full Control Panel</h3>
          <AlgorithmControlPanel />
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-3">Compact Control Panel</h3>
          <AlgorithmControlPanel compact />
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-3">Demo Controls</h3>
          <div className="flex gap-2">
            <Button 
              onClick={initializeSampleData}
              variant="outline"
            >
              Load Sample Data
            </Button>
            <Button 
              onClick={reset}
              variant="outline"
            >
              Clear Data
            </Button>
          </div>
          <div className="mt-3 text-sm text-muted-foreground">
            <p>Current data: [{data.join(', ')}]</p>
            <p>Total steps: {totalSteps}</p>
          </div>
        </Card>
      </div>

      <div className="space-y-2 text-sm text-muted-foreground">
        <h4 className="font-semibold text-foreground">Features:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>Play/Pause button with visual state indication</li>
          <li>Step-by-step navigation (previous/next)</li>
          <li>Reset functionality to return to initial state</li>
          <li>Speed slider with real-time adjustment (0.1x to 5x)</li>
          <li>Progress indicator showing completion percentage</li>
          <li>Step counter displaying current/total steps</li>
          <li>Responsive design with compact mode for mobile</li>
          <li>Accessibility support with ARIA labels and keyboard navigation</li>
          <li>State synchronization with algorithm execution engine</li>
        </ul>
      </div>
    </div>
  )
}