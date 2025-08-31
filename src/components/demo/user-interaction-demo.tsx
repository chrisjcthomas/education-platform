'use client'

import React, { useState } from 'react'
import { EnhancedControlPanel } from '@/components/controls/enhanced-control-panel'
import { DraggableArray } from '@/components/controls/draggable-array'
import { useAlgorithmStore } from '@/lib/stores/algorithm-store'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface ArrayElement {
  id: string
  value: number
  index: number
}

export function UserInteractionDemo() {
  const { 
    setData, 
    setAlgorithmType, 
    addStep, 
    reset,
    data,
    totalSteps
  } = useAlgorithmStore()

  const [arrayElements, setArrayElements] = useState<ArrayElement[]>([
    { id: '1', value: 1, index: 0 },
    { id: '2', value: 3, index: 1 },
    { id: '3', value: 5, index: 2 },
    { id: '4', value: 7, index: 3 },
    { id: '5', value: 9, index: 4 },
    { id: '6', value: 11, index: 5 },
    { id: '7', value: 13, index: 6 },
    { id: '8', value: 15, index: 7 }
  ])

  const [dragEnabled, setDragEnabled] = useState(true)

  // Initialize with sample data and steps
  const initializeSampleData = () => {
    const values = arrayElements.map(el => el.value)
    setData(values)
    setAlgorithmType('binary-search')
    
    // Add sample steps for binary search
    const steps = [
      {
        type: 'init' as const,
        indices: [],
        metadata: { left: 0, right: values.length - 1, target: 7 },
        description: 'Initialize binary search for target 7'
      },
      {
        type: 'compare' as const,
        indices: [3],
        metadata: { left: 0, right: 7, mid: 3, comparison: 'target == mid' },
        description: 'Compare target 7 with middle element 7'
      },
      {
        type: 'found' as const,
        indices: [3],
        metadata: { left: 0, right: 7, mid: 3, found: true },
        description: 'Found target 7 at index 3!'
      }
    ]

    steps.forEach(step => addStep(step))
  }

  const handleArrayReorder = (newOrder: ArrayElement[]) => {
    setArrayElements(newOrder)
    
    // Update algorithm data
    const newValues = newOrder.map(el => el.value)
    setData(newValues)
    
    // Clear existing steps since array changed
    reset()
  }

  const addRandomElement = () => {
    const newValue = Math.floor(Math.random() * 100) + 1
    const newElement: ArrayElement = {
      id: Date.now().toString(),
      value: newValue,
      index: arrayElements.length
    }
    
    const newElements = [...arrayElements, newElement]
    setArrayElements(newElements)
    handleArrayReorder(newElements)
  }

  const removeLastElement = () => {
    if (arrayElements.length > 1) {
      const newElements = arrayElements.slice(0, -1)
      setArrayElements(newElements)
      handleArrayReorder(newElements)
    }
  }

  const sortArray = () => {
    const sortedElements = [...arrayElements].sort((a, b) => a.value - b.value)
    const reindexedElements = sortedElements.map((el, index) => ({
      ...el,
      index
    }))
    setArrayElements(reindexedElements)
    handleArrayReorder(reindexedElements)
  }

  const shuffleArray = () => {
    const shuffled = [...arrayElements]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    const reindexedElements = shuffled.map((el, index) => ({
      ...el,
      index
    }))
    setArrayElements(reindexedElements)
    handleArrayReorder(reindexedElements)
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">User Interaction Demo</h2>
        <p className="text-muted-foreground">
          Interactive controls with keyboard shortcuts, touch gestures, drag-and-drop, 
          and comprehensive accessibility support.
        </p>
      </div>

      {/* Enhanced Control Panel */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Enhanced Control Panel</h3>
        <EnhancedControlPanel />
      </Card>

      {/* Draggable Array */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Draggable Array Elements</h3>
          <div className="flex items-center gap-2">
            <Badge variant={dragEnabled ? "default" : "secondary"}>
              {dragEnabled ? "Drag Enabled" : "Drag Disabled"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDragEnabled(!dragEnabled)}
            >
              {dragEnabled ? "Disable" : "Enable"} Drag
            </Button>
          </div>
        </div>
        
        <DraggableArray
          elements={arrayElements}
          onReorder={handleArrayReorder}
          disabled={!dragEnabled}
          className="mb-4"
        />

        <Separator className="my-4" />

        <div className="flex flex-wrap gap-2">
          <Button onClick={addRandomElement} variant="outline" size="sm">
            Add Random Element
          </Button>
          <Button onClick={removeLastElement} variant="outline" size="sm">
            Remove Last Element
          </Button>
          <Button onClick={sortArray} variant="outline" size="sm">
            Sort Array
          </Button>
          <Button onClick={shuffleArray} variant="outline" size="sm">
            Shuffle Array
          </Button>
          <Button onClick={initializeSampleData} variant="outline" size="sm">
            Initialize Algorithm
          </Button>
        </div>
      </Card>

      {/* Feature Overview */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Interaction Features</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium mb-2">Keyboard Shortcuts</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Space</kbd> - Play/Pause</li>
              <li>• <kbd className="px-1 py-0.5 bg-muted rounded text-xs">←/→</kbd> - Navigate steps</li>
              <li>• <kbd className="px-1 py-0.5 bg-muted rounded text-xs">R</kbd> - Reset algorithm</li>
              <li>• <kbd className="px-1 py-0.5 bg-muted rounded text-xs">+/-</kbd> - Adjust speed</li>
              <li>• <kbd className="px-1 py-0.5 bg-muted rounded text-xs">?</kbd> - Show shortcuts</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Touch Gestures</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Swipe left/right - Navigate steps</li>
              <li>• Double tap - Play/Pause</li>
              <li>• Touch-friendly button sizes</li>
              <li>• Gesture feedback and hints</li>
              <li>• Mobile-optimized layout</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Drag & Drop</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Reorder array elements</li>
              <li>• Visual drag feedback</li>
              <li>• Keyboard alternative (arrow keys)</li>
              <li>• Screen reader support</li>
              <li>• Touch-friendly dragging</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Accessibility</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Screen reader optimized</li>
              <li>• Keyboard navigation</li>
              <li>• High contrast support</li>
              <li>• Reduced motion option</li>
              <li>• WCAG 2.1 AA compliant</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Mobile Support</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Touch-optimized controls</li>
              <li>• Responsive layout adaptation</li>
              <li>• Gesture recognition</li>
              <li>• Battery-saving options</li>
              <li>• Performance optimization</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">User Preferences</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Control mode switching</li>
              <li>• Motion reduction toggle</li>
              <li>• Sound enable/disable</li>
              <li>• Persistent preferences</li>
              <li>• Adaptive interface</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Current State */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Current State</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="font-medium">Array Elements</div>
            <div className="text-muted-foreground">{arrayElements.length}</div>
          </div>
          <div>
            <div className="font-medium">Algorithm Steps</div>
            <div className="text-muted-foreground">{totalSteps}</div>
          </div>
          <div>
            <div className="font-medium">Drag Enabled</div>
            <div className="text-muted-foreground">{dragEnabled ? 'Yes' : 'No'}</div>
          </div>
          <div>
            <div className="font-medium">Current Values</div>
            <div className="text-muted-foreground font-mono">
              [{arrayElements.map(el => el.value).join(', ')}]
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}