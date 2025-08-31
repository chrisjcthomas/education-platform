import React from 'react'
import { render, screen } from '@testing-library/react'
import { StepCounter } from '@/components/controls/step-counter'

describe('StepCounter', () => {
  it('displays current and total steps correctly', () => {
    render(<StepCounter currentStep={2} totalSteps={5} />)
    
    const counter = screen.getByRole('status')
    expect(counter).toHaveAttribute('aria-label', 'Step 3 of 5')
    expect(screen.getByText('3/5')).toBeInTheDocument()
  })

  it('shows placeholder when no steps available', () => {
    render(<StepCounter currentStep={0} totalSteps={0} />)
    
    expect(screen.getByText('-/-')).toBeInTheDocument()
  })

  it('handles zero-based indexing correctly', () => {
    render(<StepCounter currentStep={0} totalSteps={3} />)
    
    const counter = screen.getByRole('status')
    expect(counter).toHaveAttribute('aria-label', 'Step 1 of 3')
    expect(screen.getByText('1/3')).toBeInTheDocument()
  })

  it('shows label when enabled', () => {
    render(<StepCounter currentStep={1} totalSteps={3} showLabel />)
    
    expect(screen.getByText('Step:')).toBeInTheDocument()
    expect(screen.getByText('2/3')).toBeInTheDocument()
  })

  it('hides label by default', () => {
    render(<StepCounter currentStep={1} totalSteps={3} />)
    
    expect(screen.queryByText('Step:')).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<StepCounter currentStep={1} totalSteps={3} className="custom-class" />)
    
    const counter = screen.getByRole('status')
    expect(counter).toHaveClass('custom-class')
  })

  it('uses monospace font for numbers', () => {
    render(<StepCounter currentStep={1} totalSteps={3} />)
    
    const numberSpan = screen.getByText('2/3')
    expect(numberSpan).toHaveClass('font-mono')
  })

  it('has proper styling classes', () => {
    render(<StepCounter currentStep={1} totalSteps={3} />)
    
    const counter = screen.getByRole('status')
    expect(counter).toHaveClass('text-muted-foreground')
  })

  it('handles edge cases correctly', () => {
    // First step
    const { rerender } = render(<StepCounter currentStep={0} totalSteps={1} />)
    expect(screen.getByText('1/1')).toBeInTheDocument()
    
    // Large numbers
    rerender(<StepCounter currentStep={99} totalSteps={100} />)
    expect(screen.getByText('100/100')).toBeInTheDocument()
  })

  it('shows label with placeholder when no steps and showLabel is true', () => {
    render(<StepCounter currentStep={0} totalSteps={0} showLabel />)
    
    expect(screen.getByText('Step:')).toBeInTheDocument()
    expect(screen.getByText('-/-')).toBeInTheDocument()
  })

  it('maintains accessibility without steps', () => {
    render(<StepCounter currentStep={0} totalSteps={0} />)
    
    // Should not have role="status" when no steps
    const container = screen.getByText('-/-').parentElement
    expect(container).not.toHaveAttribute('role')
    expect(container).not.toHaveAttribute('aria-label')
  })

  it('updates aria-label correctly as steps change', () => {
    const { rerender } = render(<StepCounter currentStep={0} totalSteps={5} />)
    
    let counter = screen.getByRole('status')
    expect(counter).toHaveAttribute('aria-label', 'Step 1 of 5')
    
    rerender(<StepCounter currentStep={2} totalSteps={5} />)
    
    counter = screen.getByRole('status')
    expect(counter).toHaveAttribute('aria-label', 'Step 3 of 5')
    
    rerender(<StepCounter currentStep={4} totalSteps={5} />)
    
    counter = screen.getByRole('status')
    expect(counter).toHaveAttribute('aria-label', 'Step 5 of 5')
  })
})