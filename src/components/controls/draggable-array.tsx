'use client'

import React, { useState, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { GripVertical } from 'lucide-react'

interface DraggableArrayElement {
  id: string
  value: number
  index: number
}

interface DraggableArrayProps {
  elements: DraggableArrayElement[]
  onReorder: (newOrder: DraggableArrayElement[]) => void
  disabled?: boolean
  className?: string
  showIndices?: boolean
}

export function DraggableArray({
  elements,
  onReorder,
  disabled = false,
  className,
  showIndices = true
}: DraggableArrayProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const draggedElementRef = useRef<DraggableArrayElement | null>(null)

  const handleDragStart = useCallback((
    event: React.DragEvent<HTMLDivElement>,
    element: DraggableArrayElement,
    index: number
  ) => {
    if (disabled) return

    setDraggedIndex(index)
    draggedElementRef.current = element
    
    // Set drag data for accessibility
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', element.value.toString())
      event.dataTransfer.effectAllowed = 'move'
    }
    
    // Add visual feedback
    event.currentTarget.style.opacity = '0.5'
  }, [disabled])

  const handleDragEnd = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    setDraggedIndex(null)
    setDragOverIndex(null)
    draggedElementRef.current = null
    
    // Reset visual feedback
    event.currentTarget.style.opacity = '1'
  }, [])

  const handleDragOver = useCallback((
    event: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    if (disabled || draggedIndex === null) return

    event.preventDefault()
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move'
    }
    
    setDragOverIndex(index)
  }, [disabled, draggedIndex])

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null)
  }, [])

  const handleDrop = useCallback((
    event: React.DragEvent<HTMLDivElement>,
    dropIndex: number
  ) => {
    if (disabled || draggedIndex === null || !draggedElementRef.current) return

    event.preventDefault()
    
    const newElements = [...elements]
    const draggedElement = draggedElementRef.current
    
    // Remove dragged element from its original position
    newElements.splice(draggedIndex, 1)
    
    // Insert at new position
    newElements.splice(dropIndex, 0, draggedElement)
    
    // Update indices
    const reorderedElements = newElements.map((element, index) => ({
      ...element,
      index
    }))
    
    onReorder(reorderedElements)
    
    setDraggedIndex(null)
    setDragOverIndex(null)
    draggedElementRef.current = null
  }, [disabled, draggedIndex, elements, onReorder])

  const handleKeyDown = useCallback((
    event: React.KeyboardEvent<HTMLDivElement>,
    element: DraggableArrayElement,
    index: number
  ) => {
    if (disabled) return

    const newElements = [...elements]
    let newIndex = index

    switch (event.key) {
      case 'ArrowLeft':
        if (index > 0) {
          newIndex = index - 1
        }
        break
      case 'ArrowRight':
        if (index < elements.length - 1) {
          newIndex = index + 1
        }
        break
      case ' ':
      case 'Enter':
        // Toggle selection or perform action
        event.preventDefault()
        return
      default:
        return
    }

    if (newIndex !== index) {
      event.preventDefault()
      
      // Swap elements safely
      const temp = newElements[index]
      newElements[index] = newElements[newIndex]
      newElements[newIndex] = temp
      
      // Update indices
      const reorderedElements = newElements.map((el, idx) => ({
        ...el,
        index: idx
      }))
      
      onReorder(reorderedElements)
      
      // Focus the moved element
      setTimeout(() => {
        const movedElement = document.querySelector(`[data-element-id="${element.id}"]`) as HTMLElement
        movedElement?.focus()
      }, 0)
    }
  }, [disabled, elements, onReorder])

  return (
    <div 
      className={cn(
        'flex items-center gap-2 p-4 bg-background border rounded-lg',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      role="application"
      aria-label="Draggable array elements"
    >
      {elements.map((element, index) => (
        <div
          key={element.id}
          data-element-id={element.id}
          draggable={!disabled}
          onDragStart={(e) => handleDragStart(e, element, index)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onKeyDown={(e) => handleKeyDown(e, element, index)}
          tabIndex={disabled ? -1 : 0}
          role="button"
          aria-label={`Array element ${element.value} at position ${index}. ${disabled ? 'Disabled' : 'Draggable'}`}
          aria-describedby={`element-help-${element.id}`}
          className={cn(
            'relative flex flex-col items-center justify-center',
            'min-w-[3rem] min-h-[3rem] p-2 rounded-lg border-2 transition-all',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            !disabled && 'cursor-move hover:border-primary hover:shadow-md',
            draggedIndex === index && 'opacity-50 scale-95',
            dragOverIndex === index && draggedIndex !== index && 'border-primary bg-primary/10 scale-105',
            disabled ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-gray-300 bg-white'
          )}
        >
          {/* Drag handle */}
          {!disabled && (
            <GripVertical 
              className="absolute top-1 left-1 h-3 w-3 text-gray-400" 
              aria-hidden="true"
            />
          )}
          
          {/* Element value */}
          <div className="text-lg font-semibold text-center">
            {element.value}
          </div>
          
          {/* Index display */}
          {showIndices && (
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 font-medium">
              {index}
            </div>
          )}
          
          {/* Screen reader help text */}
          <div 
            id={`element-help-${element.id}`}
            className="sr-only"
          >
            {disabled 
              ? 'Element manipulation is disabled'
              : 'Use arrow keys to move, or drag with mouse. Press Enter or Space to select.'
            }
          </div>
        </div>
      ))}
      
      {/* Instructions */}
      {!disabled && (
        <div className="ml-4 text-sm text-muted-foreground">
          <div className="font-medium mb-1">Array Manipulation:</div>
          <div className="space-y-1">
            <div>• Drag elements to reorder</div>
            <div>• Use arrow keys for keyboard navigation</div>
            <div>• Tab to focus, Enter/Space to interact</div>
          </div>
        </div>
      )}
    </div>
  )
}