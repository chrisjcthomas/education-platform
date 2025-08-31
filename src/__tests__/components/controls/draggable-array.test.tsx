import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DraggableArray } from '@/components/controls/draggable-array'

const mockElements = [
  { id: '1', value: 10, index: 0 },
  { id: '2', value: 20, index: 1 },
  { id: '3', value: 30, index: 2 },
  { id: '4', value: 40, index: 3 }
]

describe('DraggableArray', () => {
  const mockOnReorder = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders array elements correctly', () => {
    render(
      <DraggableArray 
        elements={mockElements}
        onReorder={mockOnReorder}
      />
    )
    
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('20')).toBeInTheDocument()
    expect(screen.getByText('30')).toBeInTheDocument()
    expect(screen.getByText('40')).toBeInTheDocument()
  })

  it('shows indices when enabled', () => {
    render(
      <DraggableArray 
        elements={mockElements}
        onReorder={mockOnReorder}
        showIndices={true}
      />
    )
    
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('hides indices when disabled', () => {
    render(
      <DraggableArray 
        elements={mockElements}
        onReorder={mockOnReorder}
        showIndices={false}
      />
    )
    
    // Indices should not be visible (they're positioned absolutely below)
    const indices = screen.queryAllByText(/^[0-3]$/)
    expect(indices).toHaveLength(0)
  })

  it('makes elements draggable when not disabled', () => {
    render(
      <DraggableArray 
        elements={mockElements}
        onReorder={mockOnReorder}
      />
    )
    
    const firstElement = screen.getByLabelText(/Array element 10/)
    expect(firstElement).toHaveAttribute('draggable', 'true')
    expect(firstElement).toHaveAttribute('tabIndex', '0')
  })

  it('disables dragging when disabled prop is true', () => {
    render(
      <DraggableArray 
        elements={mockElements}
        onReorder={mockOnReorder}
        disabled={true}
      />
    )
    
    const firstElement = screen.getByLabelText(/Array element 10/)
    expect(firstElement).toHaveAttribute('draggable', 'false')
    expect(firstElement).toHaveAttribute('tabIndex', '-1')
  })

  it('handles keyboard navigation with arrow keys', () => {
    render(
      <DraggableArray 
        elements={mockElements}
        onReorder={mockOnReorder}
      />
    )
    
    const firstElement = screen.getByLabelText(/Array element 10/)
    
    // Simulate ArrowRight key press
    fireEvent.keyDown(firstElement, { key: 'ArrowRight' })
    
    expect(mockOnReorder).toHaveBeenCalledWith([
      { id: '2', value: 20, index: 0 },
      { id: '1', value: 10, index: 1 },
      { id: '3', value: 30, index: 2 },
      { id: '4', value: 40, index: 3 }
    ])
  })

  it('handles keyboard navigation with ArrowLeft', () => {
    render(
      <DraggableArray 
        elements={mockElements}
        onReorder={mockOnReorder}
      />
    )
    
    const secondElement = screen.getByLabelText(/Array element 20/)
    
    // Simulate ArrowLeft key press
    fireEvent.keyDown(secondElement, { key: 'ArrowLeft' })
    
    expect(mockOnReorder).toHaveBeenCalledWith([
      { id: '2', value: 20, index: 0 },
      { id: '1', value: 10, index: 1 },
      { id: '3', value: 30, index: 2 },
      { id: '4', value: 40, index: 3 }
    ])
  })

  it('does not move element beyond array bounds', () => {
    render(
      <DraggableArray 
        elements={mockElements}
        onReorder={mockOnReorder}
      />
    )
    
    const firstElement = screen.getByLabelText(/Array element 10/)
    const lastElement = screen.getByLabelText(/Array element 40/)
    
    // Try to move first element left (should not move)
    fireEvent.keyDown(firstElement, { key: 'ArrowLeft' })
    expect(mockOnReorder).not.toHaveBeenCalled()
    
    // Try to move last element right (should not move)
    fireEvent.keyDown(lastElement, { key: 'ArrowRight' })
    expect(mockOnReorder).not.toHaveBeenCalled()
  })

  it('handles drag and drop operations', () => {
    render(
      <DraggableArray 
        elements={mockElements}
        onReorder={mockOnReorder}
      />
    )
    
    const firstElement = screen.getByLabelText(/Array element 10/)
    const thirdElement = screen.getByLabelText(/Array element 30/)
    
    // Start dragging first element
    fireEvent.dragStart(firstElement, {
      dataTransfer: {
        setData: jest.fn(),
        effectAllowed: 'move'
      }
    })
    
    // Drag over third element
    fireEvent.dragOver(thirdElement, {
      dataTransfer: { dropEffect: 'move' }
    })
    
    // Drop on third element position
    fireEvent.drop(thirdElement)
    
    expect(mockOnReorder).toHaveBeenCalled()
  })

  it('provides visual feedback during drag operations', () => {
    render(
      <DraggableArray 
        elements={mockElements}
        onReorder={mockOnReorder}
      />
    )
    
    const firstElement = screen.getByLabelText(/Array element 10/)
    
    // Start dragging with proper mock data
    fireEvent.dragStart(firstElement, {
      dataTransfer: {
        setData: jest.fn(),
        effectAllowed: ''
      }
    })
    
    // Element should have reduced opacity during drag
    expect(firstElement.style.opacity).toBe('0.5')
    
    // End dragging
    fireEvent.dragEnd(firstElement)
    
    // Opacity should be restored
    expect(firstElement.style.opacity).toBe('1')
  })

  it('shows drag handles when not disabled', () => {
    render(
      <DraggableArray 
        elements={mockElements}
        onReorder={mockOnReorder}
      />
    )
    
    // Should have grip icons for dragging
    const gripIcons = document.querySelectorAll('[aria-hidden="true"]')
    expect(gripIcons.length).toBeGreaterThan(0)
  })

  it('has proper accessibility attributes', () => {
    render(
      <DraggableArray 
        elements={mockElements}
        onReorder={mockOnReorder}
      />
    )
    
    const container = screen.getByRole('application')
    expect(container).toHaveAttribute('aria-label', 'Draggable array elements')
    
    const firstElement = screen.getByLabelText(/Array element 10/)
    expect(firstElement).toHaveAttribute('role', 'button')
    expect(firstElement).toHaveAttribute('aria-describedby')
  })

  it('provides screen reader help text', () => {
    render(
      <DraggableArray 
        elements={mockElements}
        onReorder={mockOnReorder}
      />
    )
    
    expect(screen.getAllByText(/Use arrow keys to move, or drag with mouse/)).toHaveLength(4)
  })

  it('shows disabled help text when disabled', () => {
    render(
      <DraggableArray 
        elements={mockElements}
        onReorder={mockOnReorder}
        disabled={true}
      />
    )
    
    expect(screen.getAllByText('Element manipulation is disabled')).toHaveLength(4)
  })

  it('shows manipulation instructions when not disabled', () => {
    render(
      <DraggableArray 
        elements={mockElements}
        onReorder={mockOnReorder}
      />
    )
    
    expect(screen.getByText('Array Manipulation:')).toBeInTheDocument()
    expect(screen.getByText('• Drag elements to reorder')).toBeInTheDocument()
    expect(screen.getByText('• Use arrow keys for keyboard navigation')).toBeInTheDocument()
    expect(screen.getByText('• Tab to focus, Enter/Space to interact')).toBeInTheDocument()
  })

  it('applies disabled styling when disabled', () => {
    render(
      <DraggableArray 
        elements={mockElements}
        onReorder={mockOnReorder}
        disabled={true}
      />
    )
    
    const container = screen.getByRole('application')
    expect(container).toHaveClass('opacity-50', 'cursor-not-allowed')
  })

  it('ignores keyboard events when disabled', () => {
    render(
      <DraggableArray 
        elements={mockElements}
        onReorder={mockOnReorder}
        disabled={true}
      />
    )
    
    const firstElement = screen.getByLabelText(/Array element 10/)
    
    fireEvent.keyDown(firstElement, { key: 'ArrowRight' })
    
    expect(mockOnReorder).not.toHaveBeenCalled()
  })

  it('ignores drag events when disabled', () => {
    render(
      <DraggableArray 
        elements={mockElements}
        onReorder={mockOnReorder}
        disabled={true}
      />
    )
    
    const firstElement = screen.getByLabelText(/Array element 10/)
    
    fireEvent.dragStart(firstElement)
    
    // Should not set opacity since dragging is disabled
    expect(firstElement.style.opacity).not.toBe('0.5')
  })
})