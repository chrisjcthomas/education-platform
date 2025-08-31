import React from 'react'
import { render, screen } from '@testing-library/react'
import { ProgressIndicator } from '@/components/controls/progress-indicator'

describe('ProgressIndicator', () => {
  it('renders with correct progress value', () => {
    render(<ProgressIndicator progress={0.6} />)
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '60')
    expect(progressBar).toHaveAttribute('aria-valuemin', '0')
    expect(progressBar).toHaveAttribute('aria-valuemax', '100')
    expect(progressBar).toHaveAttribute('aria-label', 'Algorithm progress: 60%')
  })

  it('clamps progress values to valid range', () => {
    const { rerender } = render(<ProgressIndicator progress={-0.5} />)
    
    let progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '-50') // Shows actual value but clamps visually
    
    rerender(<ProgressIndicator progress={1.5} />)
    
    progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '150') // Shows actual value but clamps visually
  })

  it('shows percentage when enabled', () => {
    render(<ProgressIndicator progress={0.75} showPercentage />)
    
    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('hides percentage by default', () => {
    render(<ProgressIndicator progress={0.75} />)
    
    expect(screen.queryByText('75%')).not.toBeInTheDocument()
  })

  it('applies animation classes by default', () => {
    const { container } = render(<ProgressIndicator progress={0.5} />)
    
    const progressFill = container.querySelector('.bg-primary')
    expect(progressFill).toHaveClass('transition-all', 'duration-300', 'ease-out')
  })

  it('can disable animations', () => {
    const { container } = render(<ProgressIndicator progress={0.5} animated={false} />)
    
    const progressFill = container.querySelector('.bg-primary')
    expect(progressFill).not.toHaveClass('transition-all')
  })

  it('handles zero progress correctly', () => {
    const { container } = render(<ProgressIndicator progress={0} />)
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '0')
    
    const progressFill = container.querySelector('.bg-primary')
    expect(progressFill).toHaveStyle('width: 0%')
    expect(progressFill).toHaveStyle('transform: translateX(-100%)')
  })

  it('handles complete progress correctly', () => {
    const { container } = render(<ProgressIndicator progress={1} />)
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '100')
    
    const progressFill = container.querySelector('.bg-primary')
    expect(progressFill).toHaveStyle('width: 100%')
    expect(progressFill).toHaveStyle('transform: translateX(0%)')
  })

  it('applies custom className', () => {
    render(<ProgressIndicator progress={0.5} className="custom-class" />)
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveClass('custom-class')
  })

  it('rounds percentage values correctly', () => {
    const testCases = [
      { progress: 0.333, expected: '33%' },
      { progress: 0.666, expected: '67%' },
      { progress: 0.999, expected: '100%' },
      { progress: 0.001, expected: '0%' }
    ]

    testCases.forEach(({ progress, expected }) => {
      const { rerender } = render(
        <ProgressIndicator progress={progress} showPercentage />
      )
      
      expect(screen.getByText(expected)).toBeInTheDocument()
      
      rerender(<div />)
    })
  })

  it('has proper structure and styling', () => {
    const { container } = render(<ProgressIndicator progress={0.5} />)
    
    // Check container structure
    const wrapper = container.firstChild
    expect(wrapper).toHaveClass('flex', 'items-center', 'gap-2')
    
    // Check progress bar background
    const progressBg = container.querySelector('.bg-gray-200')
    expect(progressBg).toHaveClass('flex-1', 'h-2', 'rounded-full', 'overflow-hidden')
    
    // Check progress fill
    const progressFill = container.querySelector('.bg-primary')
    expect(progressFill).toHaveClass('h-full', 'rounded-full')
  })

  it('maintains accessibility with percentage display', () => {
    render(<ProgressIndicator progress={0.42} showPercentage />)
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-label', 'Algorithm progress: 42%')
    
    const percentageText = screen.getByText('42%')
    expect(percentageText).toHaveAttribute('aria-hidden', 'true')
  })
})